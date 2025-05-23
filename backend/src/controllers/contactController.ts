import { Request, Response } from 'express';
import { batchCreateContacts, searchContactById, deleteContactById, listPaginatedContacts } from '../services/contactService'; 
import { ContactInput } from '../types/contactTypes';
import { ApiResponse } from '../utils/ApiResponse';


/**
 * Controller to handle batch contact creation
 * @param req - Express Request object
 * @param res - Express Response object
 */
export const createBatchContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contacts } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      res.status(400).json(ApiResponse.error('Invalid input: contacts must be a non-empty array.'));
      return;
    }

    const formattedContacts: ContactInput[] = contacts.map((contact: any) => {
      // Validate each contact object
      if (!contact.email || !contact.firstname || !contact.lastname) {
        throw new Error('Invalid contact object: Each contact must have email, firstname, and lastname.');
      }
      return {
          firstname: contact.firstname,
          lastname: contact.lastname,
          email: contact.email,
          phone: contact.phone || '', // Optional field
          jobtitle: contact.jobtitle || '', // Optional field
          company: contact.company || '', // Optional field
      };
    });

    // Call the service layer to create contacts
    const results = await batchCreateContacts(formattedContacts);

    // Respond with success
    console.log('✅ Created contact IDs:', results.map((r) => r.id));
    res.status(201).json(ApiResponse.success('Batch contacts created successfully.', results));
  } catch (error: any) {
    console.error('Error creating batch contacts:', error.message);
    res.status(500).json(ApiResponse.error('An error occurred while creating batch contacts.', error.message));
  }
};


/**
 * Controller to handle contact search
 * @param req - Express Request object
 * @param res - Express Response object
 */

export const searchContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json(ApiResponse.error("Invalid input: ID is required."));
      return;
    }
    
    const contact = await searchContactById(id);
    res.status(200).json(ApiResponse.success("Contact found successfully", contact));

  } catch (error: any) {
    console.error("Error searching contact:", error.message);
    res.status(500).json(ApiResponse.error("An error occurred while searching for contact.", error.message));
  }
}

/**
 * Controller to handle contact deletion
 * @param req - Express Request object
 * @param res - Express Response object
 */
export const deleteContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json(ApiResponse.error("Invalid input: ID is required."));
      return;
    }

    const contact = await searchContactById(id);
    if (!contact) {
      res.status(404).json(ApiResponse.error("Contact not found."));
      return;
    }

    await deleteContactById(id);
    res.status(200).json(ApiResponse.success("Contact deleted successfully."));

  } catch (error: any) {
    console.error("Error deleting contact:", error.message);
    res.status(500).json(ApiResponse.error("An error occurred while deleting contact.", error.message));
  }
}

/**
 * Controller to handle fetching all contacts
 * @param req - Express Request object
 * @param res - Express Response object
 */
export const listContacts = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Listing contacts with limit:");

        const limit = Number(req.query.limit) || 100;
        const after = req.query.after as string;
        const contacts = await listPaginatedContacts({ limit, after });
        res.status(200).json(ApiResponse.success("Contacts retrieved successfully", {
            contacts: contacts.results,
            pagination: {
                next: contacts.paging?.next?.after,
                hasMore: Boolean(contacts.paging?.next)
            }
        }));
    } catch (error: any) {
        console.error("Error listing contacts:", error.message);
        res.status(500).json(ApiResponse.error("An error occurred while fetching contacts list", error.message));
    }
}