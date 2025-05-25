import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import {
  batchCreateCompanies,
} from "../services/companyService";
import { CompanyInput,CompanyFilters } from "../types/companyTypes";

/**
 * Controller to handle batch company creation
 * @param req - Express Request object
 * @param res - Express Response object
 */
export const createBatchCompanies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {companies} = req.body;
    if (!Array.isArray(companies) || companies.length === 0) {
      res
        .status(400)
        .json(ApiResponse.error("Invalid input data for batch creation."));
      return;
    }

    const formattedCompanies: CompanyInput[] = companies.map((company: any) => {
        if (!company.name || !company.domain) {
          throw new Error(
            "Invalid company object: Each company must have name and domain."
          );
        }
      
        return {
          ...company, // keep dynamic fields
          name: company.name,
          domain: company.domain,
          phone: company.phone || '',
          description: company.description || '',
          industry: company.industry || '',
        };
      });
      
    

    const response = await batchCreateCompanies(formattedCompanies);
    res
      .status(201)
      .json(ApiResponse.success("Companies created successfully", response));
  } catch (error: any) {
    console.error("Error creating batch companies:", error.message);
    res
      .status(500)
      .json(
        ApiResponse.error(
          "An error occurred while creating batch companies.",
          error.message
        )
      );
  }
};
