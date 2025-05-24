import { Filter } from '@hubspot/api-client/lib/codegen/crm/companies';

export interface CompanyFilters {
    propertyName: string;
    operator: Filter['operator'];
    value: string;
  }
  
export interface CompanyInput {
    name?: string;
    domain?: string;
    phone?: string;
    [key: string]: any; // Allow additional properties
}