import { Router } from 'express';
import { getFeed, getMyRounds, createRound, updateRound, deleteRound } from '../controllers/rounds.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/feed', getFeed);
router.get('/my', getMyRounds);
router.post('/', createRound);
router.put('/:id', updateRound);
router.delete('/:id', deleteRound);

export default router;
