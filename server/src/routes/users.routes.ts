import { Router } from 'express';
import { searchUsers, getProfile, uploadAvatar } from '../controllers/users.controller';
import { requireAuth } from '../middleware/auth';
import { uploadAvatar as uploadMiddleware } from '../middleware/upload';

const router = Router();

router.get('/search', requireAuth, searchUsers);
router.get('/:username', (req, res, next) => {
  // Optionally attach user if token present, but not required
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    const { verifyAccessToken } = require('../lib/jwt');
    try {
      const payload = verifyAccessToken(auth.slice(7));
      req.user = payload;
    } catch {
      // ignore invalid token, proceed as anonymous
    }
  }
  next();
}, getProfile);

router.post('/:username/avatar', requireAuth, (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, uploadAvatar);

export default router;
