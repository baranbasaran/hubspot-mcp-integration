import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { 
  batchCreateCompanies, 
  searchCompanies, 
  listCompanies,
  searchCompanyById,
  deleteCompanyById
} from "../services/companyService";
import { CompanyInput } from "../types/companyTypes";
import { parseFilterFromQuery } from "../utils/filterParser";
import { ValidationError } from "../middleware/errorHandler";

/**
 * Creates multiple companies in batch
 * @param {Request} req - Express request object containing an array of companies in the body
 * @param {Object} req.body.companies - Array of company objects to create
 * @param {string} req.body.companies[].name - Company's name
 * @param {string} req.body.companies[].domain - Company's domain
 * @param {string} [req.body.companies[].phone] - Company's phone number (optional)
 * @param {string} [req.body.companies[].description] - Company's description (optional)
 * @param {string} [req.body.companies[].industry] - Company's industry (optional)
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 */
export const createBatchCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companies } = req.body;

    if (!Array.isArray(companies) || companies.length === 0) {
      throw new ValidationError("Companies must be a non-empty array");
    }

    const formattedCompanies: CompanyInput[] = companies.map((company: any) => ({
      name: company.name,
      domain: company.domain,
      phone: company.phone || "",
      description: company.description || "",
      industry: company.industry || "",
    }));

    const results = await batchCreateCompanies(formattedCompanies);
    console.log("✅ Created company IDs:", results.map((r) => r.id));
    res.status(201).json(ApiResponse.success("Batch companies created successfully", results));
  } catch (error) {
    next(error);
  }
};

/**
 * Searches for companies based on query parameters
 * @param {Request} req - Express request object containing search filters in query parameters
 * @param {Object} req.query - Query parameters that will be parsed into search filters
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 */
export const searchCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = parseFilterFromQuery(req.query);
    const results = filters.length === 0
      ? await listCompanies()
      : await searchCompanies(filters);
    
    res.status(200).json(ApiResponse.success("Companies retrieved successfully", results));
  } catch (error) {
    next(error);
  }
};

/**
 * Gets all companies
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 */
export const getCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companies = await listCompanies();
    res.status(200).json(ApiResponse.success("Companies retrieved successfully", companies));
  } catch (error) {
    next(error);
  }
};

/**
 * Gets a company by their ID
 * @param {Request} req - Express request object containing the company ID in params
 * @param {string} req.params.id - The ID of the company to retrieve
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 */
export const getCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ValidationError("Company ID is required");
    }

    const company = await searchCompanyById(id);
    res.status(200).json(ApiResponse.success("Company retrieved successfully", company));
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a company by their ID
 * @param {Request} req - Express request object containing the company ID in params
 * @param {string} req.params.id - The ID of the company to delete
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 */
export const deleteCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ValidationError("Company ID is required");
    }

    await deleteCompanyById(id);
    res.status(200).json(ApiResponse.success("Company deleted successfully"));
  } catch (error) {
    next(error);
  }
};
