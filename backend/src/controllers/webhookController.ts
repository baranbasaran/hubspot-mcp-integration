// backend/src/controllers/webhookController.ts
import { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
// Import your services that will handle the specific webhook events
import { searchContactById } from '../services/contactService';
import { searchCompanies } from '../services/companyService'; // You might need more specific company update/create logic later
import { verifyWebhookSignature } from '../utils/hubspotWebhookUtils'; // Import your utility to verify webhook signatures
// You'll need to define how to verify the webhook signature.
// For now, we'll add a placeholder function.
// Replace with your actual client secret from HubSpot Private App (Auth tab)
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET; // Make sure this is set in your .env
const HUBSPOT_WEBHOOK_SECRET = process.env.HUBSPOT_WEBHOOK_SECRET; // If you set a webhook signing secret




export const handleHubSpotWebhook = async (req: Request, res: Response) => {
  try {
    // IMPORTANT: Verify the webhook signature before processing
    if (!HUBSPOT_WEBHOOK_SECRET) {
        console.warn('🚫 No HubSpot webhook secret configured.');
        return res.status(500).json(ApiResponse.error('Internal Server Error: Webhook secret not configured.'));
      }
    const signature = req.headers['x-hubspot-signature'] as string;
    if (!signature) {
      console.warn('🚫 No signature provided in webhook headers.');
      return res.status(401).json(ApiResponse.error('Unauthorized: No signature provided.'));
    }

    const payload = req.body; // The array of event objects from HubSpot

    if (!Array.isArray(payload) || payload.length === 0) {
      console.warn('Received empty or invalid webhook payload.');
      return res.status(200).json(ApiResponse.success('No events to process.'));
    }

    console.log('Received HubSpot webhook payload:', JSON.stringify(payload, null, 2));


    // Verify the webhook signature using your utility function
    if (!verifyWebhookSignature(signature, req.body, HUBSPOT_WEBHOOK_SECRET)) {
      console.warn('🚫 Webhook signature verification failed. Request denied.');
      return res.status(401).json(ApiResponse.error('Unauthorized: Invalid webhook signature.'));
    }

    // Iterate through each event in the payload
    for (const event of payload) {
      switch (event.changeSource) {
        case 'CONTACT':
          await handleContactWebhookEvent(event);
          break;
        case 'COMPANY':
          await handleCompanyWebhookEvent(event);
          break;
        default:
          console.log(`Unhandled changeSource: ${event.changeSource} for event: ${event.objectId}`);
      }
    }

    // HubSpot expects a 200 OK response to confirm successful receipt of the webhook.
    // If you return anything else, HubSpot might retry the webhook.
    res.status(200).json(ApiResponse.success('Webhook received and processed.'));

  } catch (error: any) {
    console.error('❌ Error handling HubSpot webhook:', error.message);
    // Return a 500 error for HubSpot to retry the webhook if processing failed
    res.status(500).json(ApiResponse.error('Failed to process webhook.', error.message));
  }
};

// --- Placeholder functions for specific event handling ---

async function handleContactWebhookEvent(event: any) {
  console.log(`Processing CONTACT event: ${event.changeType} on ID ${event.objectId}`);
  // You will implement the logic for Option 1 here
  // For example:
  switch (event.changeType) {
    case 'CREATE':
      console.log(`New Contact Created (ID: ${event.objectId}). Syncing to external DB.`);
      // TODO: Call an external service to synchronize this contact to your database
      // You might fetch more details using searchContactById(event.objectId) if needed
      // const contactDetails = await searchContactById(event.objectId);
      // await externalDbService.saveContact(contactDetails);
      break;
    case 'PROPERTY_CHANGE':
      console.log(`Contact ${event.objectId} property '${event.propertyName}' changed from '${event.before}' to '${event.newValue}'.`);
      // TODO: Update your external DB with the changed property
      break;
    case 'DELETE':
      console.log(`Contact Deleted (ID: ${event.objectId}). Removing from external DB.`);
      // TODO: Remove this contact from your external database
      break;
    // Handle other change types as needed
    default:
      console.log(`Unhandled CONTACT changeType: ${event.changeType}`);
  }
}

async function handleCompanyWebhookEvent(event: any) {
  console.log(`Processing COMPANY event: ${event.changeType} on ID ${event.objectId}`);
  // You will implement the logic for Option 2 here
  // For example:
  switch (event.changeType) {
    case 'CREATE':
    case 'PROPERTY_CHANGE': // Trigger enrichment on create or domain change
      if (event.propertyName === 'domain' || event.changeType === 'CREATE') {
        console.log(`Company ${event.objectId} domain changed or created. Triggering enrichment.`);
        // TODO: Call a third-party data enrichment API (e.g., Clearbit, Hunter.io)
        // You might use searchCompanies to get the company's current domain property
        // const companyDetails = await searchCompanies([{ propertyName: 'hs_object_id', operator: 'EQ', value: event.objectId }]);
        // const enrichedData = await thirdPartyEnrichmentService.enrichCompany(companyDetails?.results[0]?.properties.domain);
        // await updateCompanyInHubSpot(event.objectId, enrichedData); // Update company in HubSpot
      }
      break;
    // Handle other change types as needed
    default:
      console.log(`Unhandled COMPANY changeType: ${event.changeType}`);
  }
}

// TODO: Example of a service to update a company in HubSpot (you might need to add this to companyService.ts)
/*
import { Client as HubSpotClient } from '@hubspot/api-client';
import { HubSpotAuthType } from '../types/hubspotAuthTypes';
import HubSpotClientWrapper from '../clients/hubspotClient';

export const updateCompanyInHubSpot = async (companyId: string, properties: Record<string, any>) => {
  const hubSpotClient = HubSpotClientWrapper.getClient(HubSpotAuthType.ACCESS_TOKEN);
  try {
    const response = await hubSpotClient.crm.companies.basicApi.update(companyId, { properties });
    console.log(`Company ${companyId} updated in HubSpot.`, response.id);
    return response;
  } catch (error) {
    console.error(`Error updating company ${companyId} in HubSpot:`, error);
    throw error;
  }
};
*/