// backend/src/controllers/webhookController.ts
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { verifyWebhookSignature } from '../utils/hubspotWebhookUtils';
import { HubSpotWebhookEvent } from '../types/hubspotWebhookTypes';
import { WebhookService } from '../services/webhookService';
import { 
  ValidationError, 
  UnauthorizedError, 
  ExternalServiceError 
} from '../middleware/errorHandler';

const HUBSPOT_WEBHOOK_SECRET = process.env.HUBSPOT_WEBHOOK_SECRET;
const webhookService = new WebhookService();

/**
 * Handles incoming webhook events from HubSpot
 * @param {Request} req - Express request object containing the webhook payload
 * @param {string} req.headers['x-hubspot-signature'] - HubSpot webhook signature for verification
 * @param {HubSpotWebhookEvent[]} req.body - Array of webhook events to process
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 */
export const handleHubSpotWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate webhook secret configuration
    if (!HUBSPOT_WEBHOOK_SECRET) {
      throw new ExternalServiceError(
        'Webhook secret not configured',
        'Configuration'
      );
    }

    // Validate signature header
    const signature = req.headers['x-hubspot-signature'] as string;
    if (!signature) {
      throw new UnauthorizedError('No signature provided in webhook headers');
    }

    // Parse and validate payload
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);
    let payload: HubSpotWebhookEvent[];

    try {
      payload = JSON.parse(rawBody);
    } catch (parseError) {
      throw new ValidationError('Invalid JSON payload');
    }

    if (!Array.isArray(payload) || payload.length === 0) {
      res.status(200).json(ApiResponse.success('No events to process'));
      return;
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(signature, rawBody, HUBSPOT_WEBHOOK_SECRET, req.headers)) {
      throw new UnauthorizedError('Invalid webhook signature');
    }

    // Process the webhook payload
    await webhookService.processWebhookPayload(payload);
    res.status(200).json(ApiResponse.success('Webhook received and processed'));

  } catch (error) {
    next(error);
  }
};