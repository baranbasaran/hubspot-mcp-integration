import HubSpotClientWrapper from '../clients/hubspotClient';
import { buildCardRequest } from '../types/hubspotCardTypes';
import { HubSpotAuthType } from '../types/hubspotAuthTypes';

/**
 * Creates a HubSpot CRM Card using the appropriate auth method.
 */
export const createCard = async (appId: number, ngrokUrl: string, authType: HubSpotAuthType) => {
  const hubSpotClient = HubSpotClientWrapper.getClient(authType);

  const targetUrl = `${ngrokUrl}/api/hubspot/cards/fetch`;
  const baseUrl = ngrokUrl;
  const cardRequest = buildCardRequest(targetUrl, baseUrl);

  try {
    const response = await hubSpotClient.crm.extensions.cards.cardsApi.create(appId, cardRequest);
    console.log('✅ Card created:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to create card:', error);
    throw new Error('Card creation failed.');
  }
};
