import { Router } from 'express';
import authRoutes from './authRoutes';
import catalogRoutes from './catalogRoutes';
import paymentRoutes from './paymentRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/catalog', catalogRoutes);
router.use('/payment', paymentRoutes);

// Base api checks
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
  });
});

export default router;
