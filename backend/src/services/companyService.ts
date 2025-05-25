import HubSpotClientWrapper from "../clients/hubspotClient";
import { CompanyInput,CompanyFilters } from "../types/companyTypes";

import {
  Filter,
  FilterGroup,
  PublicObjectSearchRequest,
} from "@hubspot/api-client/lib/codegen/crm/companies";
import { HubSpotAuthType } from '../types/hubspotAuthTypes';

const hubSpotClient = HubSpotClientWrapper.getClient(HubSpotAuthType.ACCESS_TOKEN);

export const batchCreateCompanies = async (companies: CompanyInput[]) => {
  const formatted =   companies.map((c) => ({ properties: c }));

  try {
    const response = await hubSpotClient.crm.companies.batchApi.create({
      inputs: formatted,
    });
    return response.results;
  } catch (error) {
    console.error("Error creating companies:", error);
    throw error;
  }
};
export const listCompanies = async () => {
  try {
    const response = await hubSpotClient.crm.companies.basicApi.getPage();
    return response;
  } catch (error) {
    console.error("Error fetching companies list:", error);
    throw error;
  }
};

export const searchCompanies = async (filters: CompanyFilters[]) => {

  const filterGroup: FilterGroup = {
    filters: filters.map((f) => ({
      propertyName: f.propertyName,
      operator: f.operator as Filter["operator"],
      value: f.value,
    })),
  };

  const searchRequest: PublicObjectSearchRequest = {
    filterGroups: [filterGroup],
    properties: ["name", "domain", "phone"],
    limit: 100,
    sorts: [],
  };

  try {
    const response = await hubSpotClient.crm.companies.searchApi.doSearch(
      searchRequest
    );
    return response.results;
  } catch (error) {
    console.error("Error searching companies:", error);
    throw error;
  }
};

export const createCompany = async (companyData: any) => {
  try {
    const response = await hubSpotClient.crm.companies.basicApi.create({
      properties: companyData,
    });
    return response;
  } catch (error) {
    console.error("Error creating company:", error);
    throw error;
  }
};
export const deleteCompany = async (id: string) => {
  try {
    const response = await hubSpotClient.crm.companies.basicApi.archive(id);
    return response;
  } catch (error) {
    console.error("Error deleting company:", error);
    throw error;
  }
};

