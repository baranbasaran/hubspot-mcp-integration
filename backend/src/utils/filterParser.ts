import { SearchFilters } from "../types/searchTypes";
const allowedOperators = [
  "EQ",
  "NEQ",
  "GT",
  "LT",
  "GTE",
  "LTE",
  "CONTAINS_TOKEN",
] as const;

export function parseFilterFromQuery(query: any): SearchFilters[] {
  const filters: SearchFilters[] = [];

  if (
    query.property &&
    allowedOperators.includes(query.operator) &&
    query.value
  ) {
    filters.push({
      propertyName: String(query.property),
      operator: query.operator as SearchFilters["operator"],
      value: String(query.value),
    });
  }

  return filters;
}
