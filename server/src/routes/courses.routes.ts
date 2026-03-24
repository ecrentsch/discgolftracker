import { Router } from 'express';
import { searchCourses, getCourseDetail, createCourse, rateCourse } from '../controllers/courses.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', searchCourses);
router.get('/:id', (req, res, next) => {
  // Optionally attach user if token present
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    const { verifyAccessToken } = require('../lib/jwt');
    try {
      req.user = verifyAccessToken(auth.slice(7));
    } catch { /* ignore */ }
  }
  next();
}, getCourseDetail);
router.post('/', requireAuth, createCourse);
router.post('/:id/ratings', requireAuth, rateCourse);
router.put('/:id/ratings', requireAuth, rateCourse);

export default router;
