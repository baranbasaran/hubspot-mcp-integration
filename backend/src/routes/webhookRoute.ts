// backend/src/routes/webhookRoute.ts
import { Router } from 'express';
import { handleHubSpotWebhook } from '../controllers/webhookController';

const router: Router = Router();

router.post('/hubspot', handleHubSpotWebhook );

export default router;