// backend/src/services/contactService.ts
import HubSpotClientWrapper from "../clients/hubspotClient";
import { ContactInput } from "../types/contactTypes";
import { SearchFilters } from "../types/searchTypes";
import {
  Filter,
  FilterGroup,
  PublicObjectSearchRequest,
} from "@hubspot/api-client/lib/codegen/crm/contacts";
import { HubSpotAuthType } from '../types/hubspotAuthTypes';
import { saveContactToDb, updateContactInDb, deleteContactFromDb, findContactByHubspotId } from '../repositories/contactRepository';
import { 
  ExternalServiceError, 
  NotFoundError, 
  ValidationError,
  DatabaseError 
} from '../middleware/errorHandler';

const hubSpotClient = HubSpotClientWrapper.getClient(HubSpotAuthType.ACCESS_TOKEN);

/**
 * Creates multiple contacts in HubSpot
 * @param {ContactInput[]} contacts - Array of contact objects to create
 * @returns {Promise<any>} HubSpot API response containing created contacts
 * @throws {ValidationError} If input validation fails
 * @throws {ExternalServiceError} If HubSpot API call fails
 */
export const batchCreateContacts = async (contacts: ContactInput[]) => {
  // Validate input
  if (!Array.isArray(contacts) || contacts.length === 0) {
    throw new ValidationError('Contacts must be a non-empty array');
  }

  // Validate each contact
  contacts.forEach((contact, index) => {
    if (!contact.email || !contact.firstname || !contact.lastname) {
      throw new ValidationError(
        `Invalid contact at index ${index}: email, firstname, and lastname are required`
      );
    }
  });

  const formatted = contacts.map((c) => ({ properties: c }));

  try {
    const response = await hubSpotClient.crm.contacts.batchApi.create({
      inputs: formatted,
    });
    return response.results;
  } catch (error: any) {
    // Handle specific HubSpot error cases
    if (error.code === 400) {
      throw new ValidationError('Invalid contact data provided to HubSpot');
    }
    if (error.code === 401 || error.code === 403) {
      throw new ExternalServiceError(
        'Authentication failed with HubSpot',
        'HubSpot',
        error
      );
    }
    throw new ExternalServiceError(
      'Failed to create contacts in HubSpot',
      'HubSpot',
      error
    );
  }
};

/**
 * Retrieves a list of all contacts from HubSpot
 * @returns {Promise<any>} HubSpot API response containing contacts
 * @throws {ExternalServiceError} If HubSpot API call fails
 */
export const listContacts = async () => {
  try {
    const response = await hubSpotClient.crm.contacts.basicApi.getPage();
    return response;
  } catch (error: any) {
    if (error.code === 401 || error.code === 403) {
      throw new ExternalServiceError(
        'Authentication failed with HubSpot',
        'HubSpot',
        error
      );
    }
    throw new ExternalServiceError(
      'Failed to fetch contacts from HubSpot',
      'HubSpot',
      error
    );
  }
};

/**
 * Searches for contacts in HubSpot based on provided filters
 * @param {SearchFilters[]} filters - Array of search filters
 * @returns {Promise<any>} HubSpot API response containing matching contacts
 * @throws {ValidationError} If search filters are invalid
 * @throws {ExternalServiceError} If HubSpot API call fails
 */
export const searchContacts = async (filters: SearchFilters[]) => {
  if (!Array.isArray(filters) || filters.length === 0) {
    throw new ValidationError('Search filters must be a non-empty array');
  }

  const filterGroup: FilterGroup = {
    filters: filters.map((f) => ({
      propertyName: f.propertyName,
      operator: f.operator as Filter["operator"],
      value: f.value,
    })),
  };

  const searchRequest: PublicObjectSearchRequest = {
    filterGroups: [filterGroup],
    properties: ["email", "firstname", "lastname", "phone", "company"],
    limit: 100,
    sorts: [],
  };

  try {
    const response = await hubSpotClient.crm.contacts.searchApi.doSearch(searchRequest);
    return response.results;
  } catch (error: any) {
    if (error.code === 400) {
      throw new ValidationError('Invalid search filters provided to HubSpot');
    }
    if (error.code === 401 || error.code === 403) {
      throw new ExternalServiceError(
        'Authentication failed with HubSpot',
        'HubSpot',
        error
      );
    }
    throw new ExternalServiceError(
      'Failed to search contacts in HubSpot',
      'HubSpot',
      error
    );
  }
};

/**
 * Synchronizes a HubSpot contact to the local database
 * @param {any} hubspotContact - Contact data from HubSpot
 * @returns {Promise<any>} The saved contact document
 * @throws {ValidationError} If contact data is invalid
 * @throws {DatabaseError} If database operations fail
 */
export const syncContactToLocalDb = async (hubspotContact: any) => {
  if (!hubspotContact?.id || !hubspotContact?.properties) {
    throw new ValidationError('Invalid HubSpot contact data provided');
  }

  const mappedContact = {
    hubspotId: hubspotContact.id,
    email: hubspotContact.properties.email,
    firstname: hubspotContact.properties.firstname,
    lastname: hubspotContact.properties.lastname,
    phone: hubspotContact.properties.phone,
    company: hubspotContact.properties.company,
    jobtitle: hubspotContact.properties.jobtitle,
  };

  try {
    return await saveContactToDb(mappedContact);
  } catch (error) {
    throw new DatabaseError('Failed to save contact to database', error);
  }
};

/**
 * Updates a specific property of a contact in the local database
 * @param {string} hubspotId - The HubSpot ID of the contact
 * @param {string} propertyName - The name of the property to update
 * @param {any} newValue - The new value for the property
 * @returns {Promise<any>} The updated contact document
 * @throws {Error} If database operations fail
 */
export const updateLocalContactProperty = async (hubspotId: string, propertyName: string, newValue: any) => {
  return updateContactInDb(hubspotId, propertyName, newValue);
};

/**
 * Removes a contact from the local database
 * @param {string} hubspotId - The HubSpot ID of the contact to remove
 * @returns {Promise<any>} The result of the deletion operation
 * @throws {Error} If database operations fail
 */
export const removeContactFromLocalDb = async (hubspotId: string) => {
  return deleteContactFromDb(hubspotId);
};

/**
 * Retrieves a contact from the local database by HubSpot ID
 * @param {string} hubspotId - The HubSpot ID to search for
 * @returns {Promise<any>} The contact document if found
 * @throws {ValidationError} If hubspotId is invalid
 * @throws {DatabaseError} If database operations fail
 */
export const getLocalContactByHubspotId = async (hubspotId: string) => {
  if (!hubspotId) {
    throw new ValidationError('HubSpot ID is required');
  }

  try {
    const contact = await findContactByHubspotId(hubspotId);
    if (!contact) {
      throw new NotFoundError(`Contact with HubSpot ID ${hubspotId} not found`);
    }
    return contact;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to retrieve contact from database', error);
  }
};

/**
 * Searches for a contact in HubSpot by ID
 * @param {string} id - The HubSpot ID to search for
 * @returns {Promise<any>} The contact data if found
 * @throws {ValidationError} If id is invalid
 * @throws {NotFoundError} If contact is not found
 * @throws {ExternalServiceError} If HubSpot API call fails
 */
export const searchContactById = async (id: string) => {
  if (!id) {
    throw new ValidationError('Contact ID is required');
  }

  try {
    const response = await hubSpotClient.crm.contacts.basicApi.getById(id);
    return response;
  } catch (error: any) {
    if (error.code === 404) {
      throw new NotFoundError(`Contact with ID ${id} not found in HubSpot`);
    }
    if (error.code === 401 || error.code === 403) {
      throw new ExternalServiceError(
        'Authentication failed with HubSpot',
        'HubSpot',
        error
      );
    }
    throw new ExternalServiceError(
      'Failed to retrieve contact from HubSpot',
      'HubSpot',
      error
    );
  }
};

/**
 * Deletes a contact from HubSpot
 * @param {string} id - The HubSpot ID of the contact to delete
 * @returns {Promise<any>} The result of the deletion operation
 * @throws {ValidationError} If id is invalid
 * @throws {NotFoundError} If contact is not found
 * @throws {ExternalServiceError} If HubSpot API call fails
 */
export const deleteContactById = async (id: string) => {
  if (!id) {
    throw new ValidationError('Contact ID is required');
  }

  try {
    const response = await hubSpotClient.crm.contacts.basicApi.archive(id);
    return response;
  } catch (error: any) {
    if (error.code === 404) {
      throw new NotFoundError(`Contact with ID ${id} not found in HubSpot`);
    }
    if (error.code === 401 || error.code === 403) {
      throw new ExternalServiceError(
        'Authentication failed with HubSpot',
        'HubSpot',
        error
      );
    }
    throw new ExternalServiceError(
      'Failed to delete contact from HubSpot',
      'HubSpot',
      error
    );
  }
};