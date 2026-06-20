import { Router } from 'express';
import { 
  register, 
  login, 
  refresh, 
  forgotPassword, 
  verifyOtp, 
  resetPassword, 
  logout 
} from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);

export default router;
