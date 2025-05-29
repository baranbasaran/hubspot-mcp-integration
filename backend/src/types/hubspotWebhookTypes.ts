// backend/src/types/hubspotWebhookTypes.ts

/**
 * Base interface for all HubSpot webhook event objects.
 * Contains common fields present in most webhook notifications.
 */
export interface IHubSpotBaseWebhookEvent {
  /** The ID of the event that triggered this notification. Not guaranteed to be unique. */
  eventId: number;
  /** The ID of the subscription that triggered a notification about the event. */
  subscriptionId: number;
  /** The customer's HubSpot account ID where the event occurred. */
  portalId: number;
  /** The ID of your application. */
  appId: number;
  /** When this event occurred as a millisecond timestamp. */
  occurredAt: number;
  /** The type of subscription this notification is for (e.g., "contact.creation", "contact.propertyChange"). */
  subscriptionType: string;
  /** Starting at 0, which number attempt this is to notify your service of this event. */
  attemptNumber: number;
  /** The ID of the object that was created, changed, or deleted. */
  objectId: number;
  /** The source of the change (e.g., "CRM_UI", "IMPORT", "CRM_API"). */
  changeSource?: string; // Optional based on context
  /** For contact.creation, company.creation, etc. */
  changeFlag?: string; // Optional based on context (e.g., "NEW", "DELETED")
  /** For privacy deletion events. */
  webhooksEventId?: string; // Appears in privacyDeletion events, although not explicitly listed in main table
}

/**
 * Interface for 'propertyChange' webhook events.
 * Extends the base event and includes property-specific details.
 */
export interface IHubSpotPropertyChangeEvent extends IHubSpotBaseWebhookEvent {
  subscriptionType: 'contact.propertyChange' | 'company.propertyChange' | 'deal.propertyChange' | 'ticket.propertyChange' | 'product.propertyChange' | 'line_item.propertyChange';
  /** The name of the property that was changed. */
  propertyName: string;
  /** The new value set for the property that triggered the notification. */
  propertyValue: string | number | boolean; // Property values can be various types
  /** The old value of the property before it changed. (Not explicitly in main table, but often implied) */
  // before?: string | number | boolean; // If HubSpot provides this in your payload
}

/**
 * Interface for 'merge' webhook events.
 * Contains IDs of the merged objects.
 */
export interface IHubSpotMergeEvent extends IHubSpotBaseWebhookEvent {
  subscriptionType: 'contact.merge' | 'company.merge' | 'deal.merge' | 'ticket.merge' | 'product.merge' | 'line_item.merge';
  /** The ID of the merge winner, which is the record that remains after the merge. */
  primaryObjectId: number;
  /** An array of IDs that represent the records that are merged into the merge winner. */
  mergedObjectIds: number[];
  /** The ID of the record that is created as a result of the merge (optional). */
  newObjectId?: number;
  /** An integer representing how many properties were transferred during the merge. */
  numberOfPropertiesMoved?: number;
}

/**
 * Interface for 'associationChange' webhook events.
 * Details changes in object associations.
 */
export interface IHubSpotAssociationChangeEvent extends IHubSpotBaseWebhookEvent {
  subscriptionType: 'contact.associationChange' | 'company.associationChange' | 'deal.associationChange' | 'ticket.associationChange' | 'product.associationChange' | 'line_item.associationChange';
  /** The type of association (e.g., "CONTACT_TO_COMPANY"). */
  associationType: string; // Could be a specific enum if you list all types
  /** The ID of the record that the association change was made from. */
  fromObjectId: number;
  /** The ID of the secondary record in the association event. */
  toObjectId: number;
  /** true: the webhook was triggered by removing an association. false: by creating an association. */
  associationRemoved: boolean;
  /** true: secondary record is the primary association. */
  isPrimaryAssociation: boolean;
}

/**
 * Interface for 'conversation.newMessage' webhook events.
 */
export interface IHubSpotMessageEvent extends IHubSpotBaseWebhookEvent {
  subscriptionType: 'conversation.newMessage';
  /** The ID of the new message. */
  messageId: string; // Assuming string based on other IDs, check actual payload if number
  /** The type of message (e.g., "MESSAGE", "COMMENT"). */
  messageType: 'MESSAGE' | 'COMMENT';
}


/**
 * Union type representing any possible HubSpot webhook event.
 * Use this for the 'event' object when iterating through the payload.
 */
export type HubSpotWebhookEvent =
  | IHubSpotBaseWebhookEvent
  | IHubSpotPropertyChangeEvent
  | IHubSpotMergeEvent
  | IHubSpotAssociationChangeEvent
  | IHubSpotMessageEvent; // Add other specific event types as needed