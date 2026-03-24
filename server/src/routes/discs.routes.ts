import { Router } from 'express';
import { getDiscs, createDisc, updateDisc, deleteDisc } from '../controllers/discs.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getDiscs);
router.post('/', createDisc);
router.put('/:id', updateDisc);
router.delete('/:id', deleteDisc);

export default router;
