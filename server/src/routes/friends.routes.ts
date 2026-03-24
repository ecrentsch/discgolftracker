import { Router } from 'express';
import {
  getFriends, getPendingRequests, sendRequest,
  acceptRequest, declineRequest, removeFriend
} from '../controllers/friends.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getFriends);
router.get('/requests', getPendingRequests);
router.post('/request/:userId', sendRequest);
router.post('/accept/:requesterId', acceptRequest);
router.post('/decline/:requesterId', declineRequest);
router.delete('/:userId', removeFriend);

export default router;
