import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  verifyAccessToken
} from '../utils/jwt';

const prisma = new PrismaClient();

// In-memory mock cache for OTP verification simulation
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, phoneNumber } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'User already exists with this email' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role === 'DOCTOR' ? Role.DOCTOR : Role.PATIENT;

    // Use a transaction to create User and Profile together
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          role: assignedRole,
          phoneNumber,
        },
      });

      if (assignedRole === Role.PATIENT) {
        await tx.patient.create({
          data: {
            userId: user.id,
            bloodGroup: 'O+',
          },
        });
      } else if (assignedRole === Role.DOCTOR) {
        await tx.doctor.create({
          data: {
            userId: user.id,
            specialization: 'General Medicine',
            experienceYrs: 5,
            hospitalName: 'MedCare+ General Hospital',
            licenseNumber: `LIC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            consultationFee: 500,
          },
        });
      }

      return user;
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { patient: true, doctor: true },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    if (role && user.role !== role) {
      res.status(401).json({ success: false, message: 'Selected access level role does not match this user account' });
      return;
    }

    const payload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token in HttpOnly secure cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          phoneNumber: user.phoneNumber,
          patientId: user.patient?.id,
          doctorId: user.doctor?.id,
        },
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ success: false, message: 'Refresh token not found' });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { patient: true, doctor: true },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'User session invalid' });
      return;
    }

    const newAccessToken = generateAccessToken({ userId: user.id, role: user.role });

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          patientId: user.patient?.id,
          doctorId: user.doctor?.id,
        },
      },
    });
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 to protect user email enumeration
      res.status(200).json({ success: true, message: 'If user exists, verification OTP has been dispatched' });
      return;
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    otpStore.set(email, { otp, expiresAt });

    // Print to logs since we mock email sending locally
    console.log(`[Resend Mock Email] To: ${email} - OTP Verification Code: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'Verification OTP has been dispatched to email',
      data: { email }, // Return email for verification page routing context
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and verification OTP are required' });
      return;
    }

    const storedData = otpStore.get(email);
    if (!storedData) {
      res.status(400).json({ success: false, message: 'Invalid verification request' });
      return;
    }

    if (storedData.expiresAt < Date.now()) {
      otpStore.delete(email);
      res.status(400).json({ success: false, message: 'Verification OTP has expired' });
      return;
    }

    if (storedData.otp !== otp) {
      res.status(400).json({ success: false, message: 'Incorrect OTP code' });
      return;
    }

    // Generate brief temporary reset token validation
    const resetToken = generateAccessToken({ userId: email, role: 'GUEST' });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: { resetToken },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword, resetToken } = req.body;

    if (!email || !newPassword || !resetToken) {
      res.status(400).json({ success: false, message: 'Missing required parameters' });
      return;
    }

    // Verify temp token
    try {
      const decoded = verifyAccessToken(resetToken);
      if (decoded.userId !== email) {
        res.status(403).json({ success: false, message: 'Invalid password recovery token' });
        return;
      }
    } catch {
      res.status(403).json({ success: false, message: 'Expired password recovery token' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    otpStore.delete(email);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
