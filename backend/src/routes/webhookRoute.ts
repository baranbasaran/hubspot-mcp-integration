// backend/src/routes/webhookRoute.ts
import { Router, RequestHandler } from 'express'; // Import RequestHandler
import { handleHubSpotWebhook } from '../controllers/webhookController';

const router: Router = Router();

router.post('/hubspot', handleHubSpotWebhook as RequestHandler);

export default router;