// backend/src/controllers/webhookController.ts
import { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { verifyWebhookSignature } from '../utils/hubspotWebhookUtils';
import { HubSpotWebhookEvent } from '../types/hubspotWebhookTypes';
import { WebhookService } from '../services/webhookService';

const HUBSPOT_WEBHOOK_SECRET = process.env.HUBSPOT_WEBHOOK_SECRET;
const webhookService = new WebhookService();

export const handleHubSpotWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate webhook secret configuration
    if (!HUBSPOT_WEBHOOK_SECRET) {
      console.warn('🚫 No HubSpot webhook secret configured.');
      res.status(500).json(ApiResponse.error('Internal Server Error: Webhook secret not configured.'));
      return;
    }

    // Validate signature header
    const signature = req.headers['x-hubspot-signature'] as string;
    if (!signature) {
      console.warn('🚫 No signature provided in webhook headers (x-hubspot-signature).');
      res.status(401).json(ApiResponse.error('Unauthorized: No signature provided.'));
      return;
    }

    // Parse and validate payload
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);
    let payload: HubSpotWebhookEvent[];

    try {
      payload = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ Error parsing webhook payload as JSON:', parseError);
      res.status(400).json(ApiResponse.error('Invalid JSON payload.'));
      return;
    }

    if (!Array.isArray(payload) || payload.length === 0) {
      console.warn('Received empty or invalid webhook payload. Expected an array of events.');
      res.status(200).json(ApiResponse.success('No events to process.'));
      return;
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(signature, rawBody, HUBSPOT_WEBHOOK_SECRET, req.headers)) {
      console.warn('🚫 Webhook signature verification failed. Request denied.');
      res.status(401).json(ApiResponse.error('Unauthorized: Invalid webhook signature.'));
      return;
    }

    // Process the webhook payload
    await webhookService.processWebhookPayload(payload);

    res.status(200).json(ApiResponse.success('Webhook received and processed.'));

  } catch (error: any) {
    console.error('❌ Error handling HubSpot webhook:', error.message);
    res.status(500).json(ApiResponse.error('Failed to process webhook.', error.message));
  }
};