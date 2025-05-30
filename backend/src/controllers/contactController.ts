import { Request, Response, NextFunction } from "express";
import {
  batchCreateContacts,
  searchContactById,
  deleteContactById,
  searchContacts,
  listContacts,
} from "../services/contactService";
import { ContactInput } from "../types/contactTypes";
import { ApiResponse } from "../utils/ApiResponse";
import { parseFilterFromQuery } from "../utils/filterParser";
import { ValidationError } from "../middleware/errorHandler";

/**
 * Creates multiple contacts in batch
 * @param {Request} req - Express request object containing an array of contacts in the body
 * @param {Object} req.body.contacts - Array of contact objects to create
 * @param {string} req.body.contacts[].email - Contact's email address
 * @param {string} req.body.contacts[].firstname - Contact's first name
 * @param {string} req.body.contacts[].lastname - Contact's last name
 * @param {string} [req.body.contacts[].phone] - Contact's phone number (optional)
 * @param {string} [req.body.contacts[].jobtitle] - Contact's job title (optional)
 * @param {string} [req.body.contacts[].company] - Contact's company (optional)
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 */
export const createBatchContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { contacts } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      throw new ValidationError("Contacts must be a non-empty array");
    }

    const formattedContacts: ContactInput[] = contacts.map((contact: any) => ({
      firstname: contact.firstname,
      lastname: contact.lastname,
      email: contact.email,
      phone: contact.phone || "",
      jobtitle: contact.jobtitle || "",
      company: contact.company || "",
    }));

    const results = await batchCreateContacts(formattedContacts);
    console.log("✅ Created contact IDs:", results.map((r) => r.id));
    res.status(201).json(ApiResponse.success("Batch contacts created successfully", results));
  } catch (error) {
    next(error);
  }
};

/**
 * Searches for contacts based on query parameters
 * @param {Request} req - Express request object containing search filters in query parameters
 * @param {Object} req.query - Query parameters that will be parsed into search filters
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 */
export const searchContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = parseFilterFromQuery(req.query);
    const results = filters.length === 0
      ? await listContacts()
      : await searchContacts(filters);
    
    res.status(200).json(ApiResponse.success("Contacts retrieved successfully", results));
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a contact by their ID
 * @param {Request} req - Express request object containing the contact ID in params
 * @param {string} req.params.id - The ID of the contact to delete
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 */
export const deleteContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ValidationError("Contact ID is required");
    }

    await deleteContactById(id);
    res.status(200).json(ApiResponse.success("Contact deleted successfully"));
  } catch (error) {
    next(error);
  }
};
