import { HubSpotWebhookEvent, IHubSpotPropertyChangeEvent } from '../types/hubspotWebhookTypes';
import { searchContactById, syncContactToLocalDb, updateLocalContactProperty, removeContactFromLocalDb } from './contactService';
import { searchCompanies, syncCompanyToLocalDb, updateLocalCompanyProperty, removeCompanyFromLocalDb } from './companyService';
import { FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/companies';

export class WebhookService {
  /**
   * Process a webhook payload containing multiple events
   * @param payload Array of webhook events to process
   */
  async processWebhookPayload(payload: HubSpotWebhookEvent[]): Promise<void> {
    if (!Array.isArray(payload) || payload.length === 0) {
      console.warn('Received empty or invalid webhook payload. Expected an array of events.');
      return;
    }

    console.log('Processing HubSpot webhook payload:', JSON.stringify(payload, null, 2));

    for (const event of payload) {
      const objectType = event.subscriptionType ? event.subscriptionType.split('.')[0].toUpperCase() : undefined;

      switch (objectType) {
        case 'CONTACT':
          await this.handleContactWebhookEvent(event);
          break;
        case 'COMPANY':
          await this.handleCompanyWebhookEvent(event);
          break;
        default:
          console.log(`Unhandled objectType: ${objectType} for event: ${event.objectId}`);
      }
    }
  }

  /**
   * Handle contact-specific webhook events
   * @param event The webhook event to process
   */
  private async handleContactWebhookEvent(event: HubSpotWebhookEvent): Promise<void> {
    console.log(`Processing CONTACT event: ${event.subscriptionType} on ID ${event.objectId}`);
    try {
      switch (event.subscriptionType) {
        case 'contact.creation':
          console.log(`New Contact Created (ID: ${event.objectId}). Syncing to external DB.`);
          const newContactDetails = await searchContactById(event.objectId.toString());
          if (newContactDetails) {
            await syncContactToLocalDb(newContactDetails);
          } else {
            console.warn(`Could not fetch details for new contact ID: ${event.objectId}`);
          }
          break;

        case 'contact.propertyChange':
          const propertyChangeEvent = event as IHubSpotPropertyChangeEvent;
          console.log(`Contact ${propertyChangeEvent.objectId} property '${propertyChangeEvent.propertyName}' changed to '${propertyChangeEvent.propertyValue}'.`);
          if (propertyChangeEvent.propertyName && propertyChangeEvent.propertyValue !== undefined) {
            await updateLocalContactProperty(
              propertyChangeEvent.objectId.toString(),
              propertyChangeEvent.propertyName,
              propertyChangeEvent.propertyValue
            );
          }
          break;

        case 'contact.deletion':
          console.log(`Contact Deleted (ID: ${event.objectId}). Removing from external DB.`);
          await removeContactFromLocalDb(event.objectId.toString());
          break;

        default:
          console.log(`Unhandled CONTACT subscriptionType: ${event.subscriptionType}`);
      }
    } catch (error) {
      console.error(`Error handling contact webhook event for ID ${event.objectId}:`, error);
      throw error;
    }
  }

  /**
   * Handle company-specific webhook events
   * @param event The webhook event to process
   */
  private async handleCompanyWebhookEvent(event: HubSpotWebhookEvent): Promise<void> {
    console.log(`Processing COMPANY event: ${event.subscriptionType} on ID ${event.objectId}`);
    try {
      switch (event.subscriptionType) {
        case 'company.creation':
          console.log(`Company ${event.objectId} created. Syncing to external DB.`);
          const newCompanyDetails = await searchCompanies([{ 
            propertyName: 'hs_object_id', 
            operator: FilterOperatorEnum.Eq, 
            value: event.objectId.toString() 
          }]);
          if (newCompanyDetails && newCompanyDetails.length > 0) {
            await syncCompanyToLocalDb(newCompanyDetails[0]);
          } else {
            console.warn(`Could not fetch details for new company ID: ${event.objectId}`);
          }
          break;

        case 'company.propertyChange':
          const companyChangeEvent = event as IHubSpotPropertyChangeEvent;
          console.log(`Company ${companyChangeEvent.objectId} property '${companyChangeEvent.propertyName}' changed to '${companyChangeEvent.propertyValue}'.`);
          if (companyChangeEvent.propertyName && companyChangeEvent.propertyValue !== undefined) {
            await updateLocalCompanyProperty(
              companyChangeEvent.objectId.toString(),
              companyChangeEvent.propertyName,
              companyChangeEvent.propertyValue
            );
          }
          break;

        case 'company.deletion':
          console.log(`Company Deleted (ID: ${event.objectId}). Removing from external DB.`);
          await removeCompanyFromLocalDb(event.objectId.toString());
          break;

        default:
          console.log(`Unhandled COMPANY subscriptionType: ${event.subscriptionType}`);
      }
    } catch (error) {
      console.error(`Error handling company webhook event for ID ${event.objectId}:`, error);
      throw error;
    }
  }
}
