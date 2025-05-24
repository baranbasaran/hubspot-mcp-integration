import { Filter } from '@hubspot/api-client/lib/codegen/crm/contacts';

export interface SearchFilter {
  propertyName: string;
  operator: Filter['operator'];
  value: string;
}
