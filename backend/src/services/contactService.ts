import HubSpotClientWrapper from "../clients/hubspotClient";
import { ContactInput } from "../types/contactTypes";
import { SearchFilters } from "../types/searchTypes";
import {
  Filter,
  FilterGroup,
  PublicObjectSearchRequest,
} from "@hubspot/api-client/lib/codegen/crm/contacts";

export const batchCreateContacts = async (contacts: ContactInput[]) => {
  const hubStopClient = HubSpotClientWrapper.getClient();
  const formatted = contacts.map((c) => ({ properties: c }));

  try {
    const response = await hubStopClient.crm.contacts.batchApi.create({
      inputs: formatted,
    });
    return response.results;
  } catch (error) {
    console.error("Error creating contacts:", error);
    throw error;
  }
};

export const searchContactById = async (id: string) => {
  const hubSpotClient = HubSpotClientWrapper.getClient();
  try {
    const response = await hubSpotClient.crm.contacts.basicApi.getById(id);
    return response;
  } catch (error) {
    console.error("Error searching contact:", error);
    throw error;
  }
};

export const deleteContactById = async (id: string) => {
  const hubSpotClient = HubSpotClientWrapper.getClient();
  try {
    const response = await hubSpotClient.crm.contacts.basicApi.archive(id);
    return response;
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
};

export const listContacts = async () => {
  const hubSpotClient = HubSpotClientWrapper.getClient();
  try {
    const response = await hubSpotClient.crm.contacts.basicApi.getPage();
    return response;
  } catch (error) {
    console.error("Error fetching contacts list:", error);
    throw error;
  }
};

export const searchContacts = async (filters: SearchFilters[]) => {
  const hubSpotClient = HubSpotClientWrapper.getClient();

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
