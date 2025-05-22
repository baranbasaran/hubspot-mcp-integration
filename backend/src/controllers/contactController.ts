import { Request, Response } from 'express';
import { batchCreateContacts } from '../services/contactService'; // Assuming you have a service layer for business logic
import { ContactInput } from '../types/contactTypes'; // Adjust the import based on your project structure
import { ApiResponse } from '../utils/ApiResponse';

/**
 * Controller to handle batch contact creation
 * @param req - Express Request object
 * @param res - Express Response object
 */
export const createBatchContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contacts } = req.body;

    // Validate input
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