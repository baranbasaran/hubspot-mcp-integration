import { SearchFilter } from "../types/searchTypes";
const allowedOperators = [
  "EQ",
  "NEQ",
  "GT",
  "LT",
  "GTE",
  "LTE",
  "CONTAINS_TOKEN",
] as const;

export function parseFilterFromQuery(query: any): SearchFilter[] {
  const filters: SearchFilter[] = [];

  if (
    query.property &&
    allowedOperators.includes(query.operator) &&
    query.value
  ) {
    filters.push({
      propertyName: String(query.property),
      operator: query.operator as SearchFilter["operator"],
      value: String(query.value),
    });
  }

  return filters;
}
