import { Response } from 'express';
import { Router } from 'express';
import { PrismaClient, PaymentStatus, OrderStatus, ClaimStatus } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// POST /api/v1/payment/checkout - Process Stripe checkout and save to DB
router.post('/checkout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      shippingAddress, 
      couponCode, 
      discount, 
      tax, 
      shippingFee, 
      total, 
      items, 
      cardNumber, 
      cardName 
    } = req.body;

    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication user session invalid' });
      return;
    }

    if (!items || items.length === 0 || !shippingAddress || !total) {
      res.status(400).json({ success: false, message: 'Missing required order details' });
      return;
    }

    // Check card details format (mock Stripe check)
    if (cardNumber && cardNumber.replace(/\s/g, '').length < 16) {
      res.status(400).json({ success: false, message: 'Stripe transaction declined: Invalid credit card length' });
      return;
    }

    // Find patient record for the user
    let patient = await prisma.patient.findUnique({
      where: { userId },
    });

    // If patient profile doesn't exist, create one dynamically
    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          userId,
          bloodGroup: 'O+',
        },
      });
    }

    const patientId = patient.id;

    // Use Prisma transaction to create Order, OrderItems, and Payment
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Order
      const order = await tx.order.create({
        data: {
          patientId,
          status: OrderStatus.PENDING,
          shippingAddress,
          couponCode,
          discount: Number(discount) || 0,
          tax: Number(tax) || 0,
          shippingFee: Number(shippingFee) || 0,
          total: Number(total),
        },
      });

      // 2. Create the Order Items
      // Get all valid medicine IDs from DB to resolve frontend-only IDs (like 'med-1')
      const allMedicines = await tx.medicine.findMany({ select: { id: true, name: true }, take: 20 });
      const validMedicineIds = new Set(allMedicines.map((m: { id: string }) => m.id));
      const fallbackMedicineId = allMedicines[0]?.id; // Use first medicine as fallback

      for (const item of items) {
        // Determine a valid medicineId - use DB ID if valid, or fallback
        let resolvedMedicineId = item.medicineId;
        if (!validMedicineIds.has(resolvedMedicineId)) {
          resolvedMedicineId = fallbackMedicineId;
        }

        if (!resolvedMedicineId) {
          console.warn(`Skipping item with unresolvable medicineId: ${item.medicineId}`);
          continue;
        }

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            medicineId: resolvedMedicineId,
            quantity: Number(item.quantity) || 1,
            price: Number(item.price),
          },
        });

        // Optional: Reduce medicine stock for real DB medicines only
        if (validMedicineIds.has(item.medicineId)) {
          await tx.medicine.update({
            where: { id: item.medicineId },
            data: { stock: { decrement: Number(item.quantity) || 1 } },
          }).catch((err: Error) => {
            console.warn(`Failed to decrement stock for medicine ${item.medicineId}:`, err.message);
          });
        }
      }

      // 3. Create the Payment
      const payment = await tx.payment.create({
        data: {
          amount: Number(total),
          status: PaymentStatus.COMPLETED,
          method: 'STRIPE',
          transactionId: `ch_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString().slice(-4)}`,
          orderId: order.id,
        },
      });

      // 4. Create Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'ORDER_CHECKOUT',
          details: `Order ${order.id} placed successfully using Stripe. Paid ₹${total}.`,
        },
      }).catch(() => {});

      return { order, payment };
    });


    console.log(`[Stripe Simulation] Payment Approved! Transaction ID: ${result.payment.transactionId}`);

    res.status(200).json({
      success: true,
      message: 'Stripe transaction authorized, order registered in DB',
      data: {
        orderId: result.order.id,
        transactionId: result.payment.transactionId,
        amount: total,
      },
    });

  } catch (error: any) {
    console.error('Checkout payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during payment processing',
    });
  }
});

// POST /api/v1/payment/checkout-insurance - Purchase active health insurance policy
router.post('/checkout-insurance', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planName, premiumAmount, billingCycle, cardNumber, cardName } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication user session invalid' });
      return;
    }

    if (!planName || !premiumAmount || !billingCycle) {
      res.status(400).json({ success: false, message: 'Missing plan name, premium amount, or billing cycle' });
      return;
    }

    // Check card format
    if (cardNumber && cardNumber.replace(/\s/g, '').length < 16) {
      res.status(400).json({ success: false, message: 'Stripe transaction declined: Invalid credit card length' });
      return;
    }

    // Find patient record
    let patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) {
      patient = await prisma.patient.create({
        data: { userId, bloodGroup: 'O+' },
      });
    }

    const patientId = patient.id;

    // Use transaction to register plan, policy, and payment transaction record
    const result = await prisma.$transaction(async (tx) => {
      // Find or create InsurancePlan
      let plan = await tx.insurancePlan.findFirst({
        where: { name: planName },
      });

      if (!plan) {
        plan = await tx.insurancePlan.create({
          data: {
            name: planName,
            providerName: 'MedCare+ Shield',
            description: `Health insurance policy for ${planName}`,
            premiumMonthly: billingCycle === 'annual' ? Math.round(Number(premiumAmount) / 12) : Number(premiumAmount),
            coverageLimit: planName.includes('Basic') ? 200000.0 : planName.includes('Family') ? 1000000.0 : 2000000.0,
            coPayPercent: 10.0,
          },
        });
      }

      // Deactivate any active plans
      await tx.insurance.updateMany({
        where: { patientId, isActive: true },
        data: { isActive: false },
      });

      // Generate policy dates
      const startDate = new Date();
      const endDate = new Date();
      if (billingCycle === 'annual') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      const policyNumber = 'MC-' + Math.floor(1000000000 + Math.random() * 9000000000).toString();

      // Create policy
      const insurance = await tx.insurance.create({
        data: {
          patientId,
          planId: plan.id,
          policyNumber,
          startDate,
          endDate,
          isActive: true,
        },
        include: { plan: true },
      });

      // Create Payment
      const payment = await tx.payment.create({
        data: {
          amount: Number(premiumAmount),
          status: PaymentStatus.COMPLETED,
          method: 'STRIPE',
          transactionId: `ch_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString().slice(-4)}`,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'INSURANCE_PURCHASE',
          details: `Purchased ${planName} policy: ${policyNumber} using Stripe.`,
        },
      }).catch(() => {});

      return { insurance, payment };
    });

    res.status(200).json({
      success: true,
      message: 'Insurance policy successfully purchased and activated',
      data: {
        policyNumber: result.insurance.policyNumber,
        transactionId: result.payment.transactionId,
        insurance: result.insurance,
      },
    });

  } catch (error: any) {
    console.error('Insurance purchase error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during insurance checkout',
    });
  }
});

// GET /api/v1/payment/active-insurance - Fetch patient's active policy
router.get('/active-insurance', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication user session invalid' });
      return;
    }

    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) {
      res.status(200).json({ success: true, data: null });
      return;
    }

    const insurance = await prisma.insurance.findFirst({
      where: { patientId: patient.id, isActive: true },
      include: {
        plan: true,
        claims: {
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    res.status(200).json({
      success: true,
      data: insurance,
    });

  } catch (error: any) {
    console.error('Active insurance fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during active policy fetch',
    });
  }
});

// POST /api/v1/payment/claim-insurance - Submit an insurance claim
router.post('/claim-insurance', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amountClaimed, description } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication user session invalid' });
      return;
    }

    if (!amountClaimed || !description) {
      res.status(400).json({ success: false, message: 'Missing claim amount or description' });
      return;
    }

    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) {
      res.status(400).json({ success: false, message: 'Patient profile not found' });
      return;
    }

    const insurance = await prisma.insurance.findFirst({
      where: { patientId: patient.id, isActive: true },
    });

    if (!insurance) {
      res.status(400).json({ success: false, message: 'No active health insurance policy found to file claims' });
      return;
    }

    const claim = await prisma.insuranceClaim.create({
      data: {
        insuranceId: insurance.id,
        amountClaimed: Number(amountClaimed),
        description,
        status: ClaimStatus.PENDING,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'INSURANCE_CLAIM_SUBMIT',
        details: `Submitted claim ${claim.id} for ₹${amountClaimed} on policy ${insurance.policyNumber}`,
      },
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Insurance claim successfully submitted for review',
      data: claim,
    });

  } catch (error: any) {
    console.error('Claim submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during claim submission',
    });
  }
});

export default router;
