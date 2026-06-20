import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/v1/catalog/medicines - Fetch all medicines with categories
router.get('/medicines', async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({
      include: {
        category: true,
      },
    });

    res.status(200).json({
      success: true,
      data: medicines,
    });
  } catch (error: any) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch medicines',
    });
  }
});

// GET /api/v1/catalog/doctors - Fetch all doctors with their user profile info
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
            phoneNumber: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch doctors',
    });
  }
});

// GET /api/v1/catalog/lab-tests - Fetch all lab tests
router.get('/lab-tests', async (req, res) => {
  try {
    const labTests = await prisma.labTest.findMany();
    res.status(200).json({
      success: true,
      data: labTests,
    });
  } catch (error: any) {
    console.error('Error fetching lab tests:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch lab tests',
    });
  }
});

// GET /api/v1/catalog/admin/users - Admin: fetch all platform users
router.get('/admin/users', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        phoneNumber: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/catalog/admin/orders - Admin: fetch all pharmacy orders
router.get('/admin/orders', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        patient: {
          include: {
            user: { select: { name: true } },
          },
        },
        items: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const mapped = orders.map((o: any) => ({
      id: o.id,
      total: o.total,
      status: o.status,
      patientName: o.patient?.user?.name || 'Patient',
      createdAt: o.createdAt,
      itemCount: o.items?.length || 0,
    }));
    res.status(200).json({ success: true, data: mapped });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

