import { Filter } from '@hubspot/api-client/lib/codegen/crm/companies';
import { HubSpotIndustry } from './industryTypes';

export interface CompanyFilters {
    propertyName: string;
    operator: Filter['operator'];
    value: string;
  }
  
export interface CompanyInput {
    name: string;
    domain: string;
    phone?: string;
    description?: string;
    industry?: HubSpotIndustry;
    [key: string]: any; // Allow additional properties for dynamic fields
}