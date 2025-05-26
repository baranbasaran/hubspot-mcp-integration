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
import { saveContactToDb, updateContactInDb, deleteContactFromDb, findContactByHubspotId } from '../repositories/contactRepository'; // Import new repository functions
const hubSpotClient = HubSpotClientWrapper.getClient(HubSpotAuthType.ACCESS_TOKEN);

export const batchCreateContacts = async (contacts: ContactInput[]) => {
  const formatted = contacts.map((c) => ({ properties: c }));

  try {
    const response = await hubSpotClient.crm.contacts.batchApi.create({
      inputs: formatted,
    });
    return response.results;
  } catch (error) {
    console.error("Error creating contacts:", error);
    throw error;
  }
};

export const searchContactById = async (id: string) => {
  try {
    const response = await hubSpotClient.crm.contacts.basicApi.getById(id);
    return response;
  } catch (error) {
    console.error("Error searching contact:", error);
    throw error;
  }
};

export const deleteContactById = async (id: string) => {
  try {
    const response = await hubSpotClient.crm.contacts.basicApi.archive(id);
    return response;
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
};

export const listContacts = async () => {
  try {
    const response = await hubSpotClient.crm.contacts.basicApi.getPage();
    return response;
  } catch (error) {
    console.error("Error fetching contacts list:", error);
    throw error;
  }
};

export const searchContacts = async (filters: SearchFilters[]) => {

  const filterGroup: FilterGroup = {
    filters: filters.map((f) => ({
      propertyName: f.propertyName,
      operator: f.operator as Filter["operator"],
      value: f.value,
    })),
  };

  const request: PublicObjectSearchRequest = {
    filterGroups: [filterGroup],
    properties: ["firstname", "lastname", "email", "phone"],
    sorts: [],
    limit: 10,
  };
    ///contacts/search?property=firstname&operator=EQ&value=maria

  try {
    const response = await hubSpotClient.crm.contacts.searchApi.doSearch(
      request
    );

    return response.results;
  } catch (error) {
    console.error("Error searching contacts:", error);
    throw error;
  }
};

// New functions to interact with local database via repository
export const syncContactToLocalDb = async (hubspotContact: any) => {
  // Map HubSpot contact properties to your local IContact interface
  const mappedContact: ContactInput & { hubspotId: string } = {
    hubspotId: hubspotContact.id,
    firstname: hubspotContact.properties.firstname,
    lastname: hubspotContact.properties.lastname,
    email: hubspotContact.properties.email,
    phone: hubspotContact.properties.phone,
    jobtitle: hubspotContact.properties.jobtitle,
    company: hubspotContact.properties.company, // Assuming 'company' property exists or will be handled
  };
  return saveContactToDb(mappedContact);
};

export const updateLocalContactProperty = async (hubspotId: string, propertyName: string, newValue: any) => {
  return updateContactInDb(hubspotId, propertyName, newValue);
};

export const removeContactFromLocalDb = async (hubspotId: string) => {
  return deleteContactFromDb(hubspotId);
};

export const getLocalContactByHubspotId = async (hubspotId: string) => {
  return findContactByHubspotId(hubspotId);
};