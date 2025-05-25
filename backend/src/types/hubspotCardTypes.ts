// src/types/hubspotCardTypes.ts

import {
  CardCreateRequest as HubSpotCardCreateRequest,
  CardFetchBodyCardTypeEnum,
  CardObjectTypeBody,
  CardObjectTypeBodyNameEnum,
  CardDisplayBody,
  CardActions as CardActionBody,
  DisplayOptionTypeEnum,
  CardDisplayPropertyDataTypeEnum,
} from '@hubspot/api-client/lib/codegen/crm/extensions/cards';

export type CRMCardCreateRequest = HubSpotCardCreateRequest;
export type CRMCardFetchObjectType = CardObjectTypeBody;
export type CRMCardDisplay = CardDisplayBody;
export type CRMCardActions = CardActionBody;

export const buildCardRequest = (
  targetUrl: string,
  baseUrl: string
): CRMCardCreateRequest => ({
  fetch: {
    cardType: CardFetchBodyCardTypeEnum.External,
    objectTypes: [
      {
        name: CardObjectTypeBodyNameEnum.Contacts,
        propertiesToSend: ['firstname', 'lastname', 'email'],
      },
    ],
    targetUrl,
  },
  display: {
    properties: [
      {
        dataType: CardDisplayPropertyDataTypeEnum.Boolean,
        name: 'includeInReport',
        label: 'Include in report?',
        options: [
          {
            name: 'include',
            label: 'Yes',
            type: DisplayOptionTypeEnum.Default,
          },
        ],
      },
    ],
  },
  title: '🧠 PetSpot AI Helper',
  actions: {
    baseUrls: [baseUrl],
  },
});
