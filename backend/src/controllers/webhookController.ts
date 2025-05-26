// backend/src/controllers/webhookController.ts
import { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
// Import your services that will handle the specific webhook events
import { searchContactById, syncContactToLocalDb, updateLocalContactProperty, removeContactFromLocalDb } from '../services/contactService'; // Import new service functions
import { searchCompanies } from '../services/companyService'; // You might need more specific company update/create logic later
import { verifyWebhookSignature } from '../utils/hubspotWebhookUtils'; // Import your utility to verify webhook signatures

// Replace with your actual client secret from HubSpot Private App (Auth tab)
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

    // Convert raw body to string for signature verification if it's a Buffer
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);

    // Verify the webhook signature using your utility function
    if (!verifyWebhookSignature(signature, rawBody, HUBSPOT_WEBHOOK_SECRET)) {
      console.warn('🚫 Webhook signature verification failed. Request denied.');
      return res.status(401).json(ApiResponse.error('Unauthorized: Invalid webhook signature.'));
    }

    console.log('Received HubSpot webhook payload:', JSON.stringify(payload, null, 2));


    // Iterate through each event in the payload
    for (const event of payload) {
      switch (event.objectType) { // Changed from changeSource to objectType as per typical HubSpot webhook structure
        case 'CONTACT':
          await handleContactWebhookEvent(event);
          break;
        case 'COMPANY':
          await handleCompanyWebhookEvent(event);
          break;
        default:
          console.log(`Unhandled objectType: ${event.objectType} for event: ${event.objectId}`);
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

// --- Functions for specific event handling ---

async function handleContactWebhookEvent(event: any) {
  console.log(`Processing CONTACT event: ${event.changeType} on ID ${event.objectId}`);
  try {
    switch (event.changeType) {
      case 'CREATE':
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
        // Only update local DB for properties you care about and are mapped
        // You might want to refine this to a specific list of properties
        if (event.propertyName && event.newValue !== undefined) { // Ensure propertyName and newValue exist
            await updateLocalContactProperty(event.objectId, event.propertyName, event.newValue);
        }
        break;
      case 'DELETE':
        console.log(`Contact Deleted (ID: ${event.objectId}). Removing from external DB.`);
        await removeContactFromLocalDb(event.objectId);
        break;
      // Handle other change types as needed
      default:
        console.log(`Unhandled CONTACT changeType: ${event.changeType}`);
    }
  } catch (error) {
    console.error(`Error handling contact webhook event for ID ${event.objectId}:`, error);
    // Re-throw to ensure the main webhook handler catches it and returns a 500
    throw error;
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