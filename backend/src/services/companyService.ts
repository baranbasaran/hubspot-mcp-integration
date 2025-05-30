import HubSpotClientWrapper from "../clients/hubspotClient";
import { CompanyInput, CompanyFilters } from "../types/companyTypes";
import {
  Filter,
  FilterGroup,
  PublicObjectSearchRequest,
} from "@hubspot/api-client/lib/codegen/crm/companies";
import { HubSpotAuthType } from '../types/hubspotAuthTypes';
import { 
  saveCompanyToDb, 
  updateCompanyInDb, 
  deleteCompanyFromDb, 
  findCompanyByHubspotId,
  findCompanyByDomain 
} from '../repositories/companyRepository';
import { 
  ExternalServiceError, 
  NotFoundError, 
  ValidationError,
  DatabaseError 
} from '../middleware/errorHandler';

const hubSpotClient = HubSpotClientWrapper.getClient(HubSpotAuthType.ACCESS_TOKEN);

/**
 * Creates multiple companies in HubSpot
 * @param {CompanyInput[]} companies - Array of company objects to create
 * @returns {Promise<any>} HubSpot API response containing created companies
 * @throws {ValidationError} If input validation fails
 * @throws {ExternalServiceError} If HubSpot API call fails
 */
export const batchCreateCompanies = async (companies: CompanyInput[]) => {
  // Validate input
  if (!Array.isArray(companies) || companies.length === 0) {
    throw new ValidationError('Companies must be a non-empty array');
  }

  // Validate each company
  companies.forEach((company, index) => {
    if (!company.name || !company.domain) {
      throw new ValidationError(
        `Invalid company at index ${index}: name and domain are required`
      );
    }
  });

  const formatted = companies.map((c) => ({ properties: c }));

  try {
    const response = await hubSpotClient.crm.companies.batchApi.create({
      inputs: formatted,
    });
    return response.results;
  } catch (error: any) {
    // Handle specific HubSpot error cases
    if (error.code === 400) {
      throw new ValidationError('Invalid company data provided to HubSpot');
    }
    if (error.code === 401 || error.code === 403) {
      throw new ExternalServiceError(
        'Authentication failed with HubSpot',
        'HubSpot',
        error
      );
    }
    throw new ExternalServiceError(
      'Failed to create companies in HubSpot',
      'HubSpot',
      error
    );
  }
};

/**
 * Retrieves a list of all companies from HubSpot
 * @returns {Promise<any>} HubSpot API response containing companies
 * @throws {ExternalServiceError} If HubSpot API call fails
 */
export const listCompanies = async () => {
  try {
    const response = await hubSpotClient.crm.companies.basicApi.getPage();
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
      'Failed to fetch companies from HubSpot',
      'HubSpot',
      error
    );
  }
};

/**
 * Searches for companies in HubSpot based on provided filters
 * @param {CompanyFilters[]} filters - Array of search filters
 * @returns {Promise<any>} HubSpot API response containing matching companies
 * @throws {ValidationError} If search filters are invalid
 * @throws {ExternalServiceError} If HubSpot API call fails
 */
export const searchCompanies = async (filters: CompanyFilters[]) => {
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
    properties: ["name", "domain", "phone", "industry"],
    limit: 100,
    sorts: [],
  };

  try {
    const response = await hubSpotClient.crm.companies.searchApi.doSearch(searchRequest);
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
      'Failed to search companies in HubSpot',
      'HubSpot',
      error
    );
  }
};

/**
 * Synchronizes a HubSpot company to the local database
 * @param {any} hubspotCompany - Company data from HubSpot
 * @returns {Promise<any>} The saved company document
 * @throws {ValidationError} If company data is invalid
 * @throws {DatabaseError} If database operations fail
 */
export const syncCompanyToLocalDb = async (hubspotCompany: any) => {
  if (!hubspotCompany?.id || !hubspotCompany?.properties) {
    throw new ValidationError('Invalid HubSpot company data provided');
  }

  const mappedCompany = {
    hubspotId: hubspotCompany.id,
    name: hubspotCompany.properties.name,
    domain: hubspotCompany.properties.domain,
    phone: hubspotCompany.properties.phone,
    industry: hubspotCompany.properties.industry,
    description: hubspotCompany.properties.description,
  };

  try {
    return await saveCompanyToDb(mappedCompany);
  } catch (error) {
    throw new DatabaseError('Failed to save company to database', error);
  }
};

/**
 * Updates a specific property of a company in the local database
 * @param {string} hubspotId - The HubSpot ID of the company
 * @param {string} propertyName - The name of the property to update
 * @param {any} newValue - The new value for the property
 * @returns {Promise<any>} The updated company document
 * @throws {ValidationError} If hubspotId is invalid
 * @throws {DatabaseError} If database operations fail
 */
export const updateLocalCompanyProperty = async (
  hubspotId: string,
  propertyName: string,
  newValue: any
) => {
  if (!hubspotId) {
    throw new ValidationError('HubSpot ID is required');
  }

  try {
    return await updateCompanyInDb(hubspotId, propertyName, newValue);
  } catch (error) {
    throw new DatabaseError('Failed to update company in database', error);
  }
};

/**
 * Removes a company from the local database
 * @param {string} hubspotId - The HubSpot ID of the company to remove
 * @returns {Promise<any>} The result of the deletion operation
 * @throws {ValidationError} If hubspotId is invalid
 * @throws {DatabaseError} If database operations fail
 */
export const removeCompanyFromLocalDb = async (hubspotId: string) => {
  if (!hubspotId) {
    throw new ValidationError('HubSpot ID is required');
  }

  try {
    return await deleteCompanyFromDb(hubspotId);
  } catch (error) {
    throw new DatabaseError('Failed to delete company from database', error);
  }
};

/**
 * Retrieves a company from the local database by HubSpot ID
 * @param {string} hubspotId - The HubSpot ID to search for
 * @returns {Promise<any>} The company document if found
 * @throws {ValidationError} If hubspotId is invalid
 * @throws {NotFoundError} If company is not found
 * @throws {DatabaseError} If database operations fail
 */
export const getLocalCompanyByHubspotId = async (hubspotId: string) => {
  if (!hubspotId) {
    throw new ValidationError('HubSpot ID is required');
  }

  try {
    const company = await findCompanyByHubspotId(hubspotId);
    if (!company) {
      throw new NotFoundError(`Company with HubSpot ID ${hubspotId} not found`);
    }
    return company;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to retrieve company from database', error);
  }
};

/**
 * Retrieves a company from the local database by domain
 * @param {string} domain - The domain to search for
 * @returns {Promise<any>} The company document if found
 * @throws {ValidationError} If domain is invalid
 * @throws {NotFoundError} If company is not found
 * @throws {DatabaseError} If database operations fail
 */
export const getLocalCompanyByDomain = async (domain: string) => {
  if (!domain) {
    throw new ValidationError('Domain is required');
  }

  try {
    const company = await findCompanyByDomain(domain);
    if (!company) {
      throw new NotFoundError(`Company with domain ${domain} not found`);
    }
    return company;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to retrieve company from database', error);
  }
};

/**
 * Creates a single company in HubSpot
 * @param {CompanyInput} companyData - Company data to create
 * @returns {Promise<any>} HubSpot API response containing the created company
 * @throws {ValidationError} If company data is invalid
 * @throws {ExternalServiceError} If HubSpot API call fails
 */
export const createCompany = async (companyData: CompanyInput) => {
  if (!companyData.name || !companyData.domain) {
    throw new ValidationError('Company name and domain are required');
  }

  try {
    const response = await hubSpotClient.crm.companies.basicApi.create({
      properties: companyData,
    });
    return response;
  } catch (error: any) {
    if (error.code === 400) {
      throw new ValidationError('Invalid company data provided to HubSpot');
    }
    if (error.code === 401 || error.code === 403) {
      throw new ExternalServiceError(
        'Authentication failed with HubSpot',
        'HubSpot',
        error
      );
    }
    throw new ExternalServiceError(
      'Failed to create company in HubSpot',
      'HubSpot',
      error
    );
  }
};

/**
 * Searches for a company in HubSpot by ID
 * @param {string} id - The HubSpot ID to search for
 * @returns {Promise<any>} The company data if found
 * @throws {ValidationError} If id is invalid
 * @throws {NotFoundError} If company is not found
 * @throws {ExternalServiceError} If HubSpot API call fails
 */
export const searchCompanyById = async (id: string) => {
  if (!id) {
    throw new ValidationError('Company ID is required');
  }

  try {
    const response = await hubSpotClient.crm.companies.basicApi.getById(id);
    return response;
  } catch (error: any) {
    if (error.code === 404) {
      throw new NotFoundError(`Company with ID ${id} not found in HubSpot`);
    }
    if (error.code === 401 || error.code === 403) {
      throw new ExternalServiceError(
        'Authentication failed with HubSpot',
        'HubSpot',
        error
      );
    }
    throw new ExternalServiceError(
      'Failed to retrieve company from HubSpot',
      'HubSpot',
      error
    );
  }
};

/**
 * Deletes a company from HubSpot
 * @param {string} id - The HubSpot ID of the company to delete
 * @returns {Promise<any>} The result of the deletion operation
 * @throws {ValidationError} If id is invalid
 * @throws {NotFoundError} If company is not found
 * @throws {ExternalServiceError} If HubSpot API call fails
 */
export const deleteCompanyById = async (id: string) => {
  if (!id) {
    throw new ValidationError('Company ID is required');
  }

  try {
    const response = await hubSpotClient.crm.companies.basicApi.archive(id);
    return response;
  } catch (error: any) {
    if (error.code === 404) {
      throw new NotFoundError(`Company with ID ${id} not found in HubSpot`);
    }
    if (error.code === 401 || error.code === 403) {
      throw new ExternalServiceError(
        'Authentication failed with HubSpot',
        'HubSpot',
        error
      );
    }
    throw new ExternalServiceError(
      'Failed to delete company from HubSpot',
      'HubSpot',
      error
    );
  }
};

