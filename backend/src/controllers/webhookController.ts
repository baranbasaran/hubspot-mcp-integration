// backend/src/controllers/webhookController.ts
import { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
// Import your services that will handle the specific webhook events
import { searchContactById, syncContactToLocalDb, updateLocalContactProperty, removeContactFromLocalDb } from '../services/contactService';
import { searchCompanies } from '../services/companyService'; // You might need more specific company update/create logic later
import { verifyWebhookSignature } from '../utils/hubspotWebhookUtils';

// Replace with your actual client secret from HubSpot Private App (Auth tab)
const HUBSPOT_WEBHOOK_SECRET = process.env.HUBSPOT_WEBHOOK_SECRET; // Make sure this is set in your .env

export const handleHubSpotWebhook = async (req: Request, res: Response) => {
  try {
    // IMPORTANT: Verify the webhook signature before processing
    if (!HUBSPOT_WEBHOOK_SECRET) {
        console.warn('🚫 No HubSpot webhook secret configured.');
        return res.status(500).json(ApiResponse.error('Internal Server Error: Webhook secret not configured.'));
      }
    // For v1 signatures, the signature is in 'x-hubspot-signature'
    const signature = req.headers['x-hubspot-signature'] as string; 

    if (!signature) {
      console.warn('🚫 No signature provided in webhook headers (x-hubspot-signature).');
      return res.status(401).json(ApiResponse.error('Unauthorized: No signature provided.'));
    }

    // req.body is a Buffer when using express.raw(). Convert it to string and parse as JSON.
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);
    let payload: any[]; // Declare payload type to be an array

    try {
      payload = JSON.parse(rawBody); // Explicitly parse the raw body into JSON
    } catch (parseError) {
      console.error('❌ Error parsing webhook payload as JSON:', parseError);
      return res.status(400).json(ApiResponse.error('Invalid JSON payload.'));
    }

    if (!Array.isArray(payload) || payload.length === 0) {
      console.warn('Received empty or invalid webhook payload. Expected an array of events.');
      return res.status(200).json(ApiResponse.success('No events to process.'));
    }

    // Verify the webhook signature using the simplified v1 logic
    if (!verifyWebhookSignature(signature, rawBody, HUBSPOT_WEBHOOK_SECRET, req.headers)) { // Pass req.headers for logging
      console.warn('🚫 Webhook signature verification failed. Request denied.');
      return res.status(401).json(ApiResponse.error('Unauthorized: Invalid webhook signature.'));
    }

    console.log('Received HubSpot webhook payload:', JSON.stringify(payload, null, 2));


    for (const event of payload) {
      const objectType = event.subscriptionType ? event.subscriptionType.split('.')[0].toUpperCase() : undefined;

      switch (objectType) { // Use the extracted objectType
        case 'CONTACT':
          await handleContactWebhookEvent(event);
          break;
        case 'COMPANY':
          await handleCompanyWebhookEvent(event);
          break;
        default:
          console.log(`Unhandled objectType: ${objectType} for event: ${event.objectId}`);
      }
    }

    res.status(200).json(ApiResponse.success('Webhook received and processed.'));

  } catch (error: any) {
    console.error('❌ Error handling HubSpot webhook:', error.message);
    res.status(500).json(ApiResponse.error('Failed to process webhook.', error.message));
  }
};

async function handleContactWebhookEvent(event: any) {
  console.log(`Processing CONTACT event: ${event.changeFlag} on ID ${event.objectId}`);
  try {
    switch (event.changeFlag) {
      case 'CREATED':
        console.log(`New Contact Created (ID: ${event.objectId}). Syncing to external DB.`);
        const newContactDetails = await searchContactById(event.objectId);
        if (newContactDetails) {
          await syncContactToLocalDb(newContactDetails);
        } else {
          console.warn(`Could not fetch details for new contact ID: ${event.objectId}`);
        }
        break;
      case 'PROPERTY_CHANGE':
        console.log(`Contact ${event.objectId} property '${event.propertyName}' changed from '${event.before}' to '${event.newValue}'.`);
        if (event.propertyName && event.newValue !== undefined) {
            await updateLocalContactProperty(event.objectId, event.propertyName, event.newValue);
        }
        break;
      case 'DELETE':
        console.log(`Contact Deleted (ID: ${event.objectId}). Removing from external DB.`);
        await removeContactFromLocalDb(event.objectId);
        break;
      default:
        console.log(`Unhandled CONTACT changeFlag: ${event.changeFlag}`);
    }
  } catch (error) {
    console.error(`Error handling contact webhook event for ID ${event.objectId}:`, error);
    throw error;
  }
}

async function handleCompanyWebhookEvent(event: any) {
  console.log(`Processing COMPANY event: ${event.changeFlag} on ID ${event.objectId}`);
  switch (event.changeFlag) {
    case 'CREATE':
    case 'PROPERTY_CHANGE':
      if (event.propertyName === 'domain' || event.changeFlag === 'CREATE') {
        console.log(`Company ${event.objectId} domain changed or created. Triggering enrichment.`);
      }
      break;
    default:
      console.log(`Unhandled COMPANY changeFlag: ${event.changeFlag}`);
  }
}