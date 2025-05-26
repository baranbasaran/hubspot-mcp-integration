// backend/src/repositories/contactRepository.ts
import { ContactModel } from '../database'; // Import ContactModel and IContact interface
import { ContactInput } from '../types/contactTypes';
import { IContact } from '../database/models/Contact'; // Import IContact interface
/**
 * Saves a new contact to the database or updates an existing one if a hubspotId is provided.
 * @param contactData - The contact data to save.
 * @returns The saved or updated contact document.
 */
export const saveContactToDb = async (contactData: ContactInput & { hubspotId: string }): Promise<IContact> => {
  try {
    const { hubspotId, ...updateData } = contactData;
    // Find contact by hubspotId and update, or create if not found
    const contact = await ContactModel.findOneAndUpdate(
      { hubspotId: hubspotId },
      { $set: updateData },
      { upsert: true, new: true, runValidators: true } // upsert: create if not exists, new: return updated document, runValidators: run schema validators
    );
    console.log(`💾 Contact ${contact.hubspotId} saved/updated in DB.`);
    return contact;
  } catch (error) {
    console.error('❌ Error saving/updating contact in DB:', error);
    throw error;
  }
};

/**
 * Updates a specific property of a contact in the database by its HubSpot ID.
 * @param hubspotId - The HubSpot ID of the contact to update.
 * @param propertyName - The name of the property to update.
 * @param newValue - The new value for the property.
 * @returns The updated contact document.
 */
export const updateContactInDb = async (hubspotId: string, propertyName: string, newValue: any): Promise<IContact | null> => {
  try {
    const updateQuery = { [propertyName]: newValue };
    const contact = await ContactModel.findOneAndUpdate(
      { hubspotId: hubspotId },
      { $set: updateQuery },
      { new: true, runValidators: true }
    );
    if (contact) {
      console.log(`🔄 Contact ${hubspotId} property '${propertyName}' updated in DB.`);
    } else {
      console.warn(`⚠️ Contact with HubSpot ID ${hubspotId} not found for update.`);
    }
    return contact;
  } catch (error) {
    console.error(`❌ Error updating contact ${hubspotId} property '${propertyName}' in DB:`, error);
    throw error;
  }
};

/**
 * Deletes a contact from the database by its HubSpot ID.
 * @param hubspotId - The HubSpot ID of the contact to delete.
 * @returns The deleted contact document, or null if not found.
 */
export const deleteContactFromDb = async (hubspotId: string): Promise<IContact | null> => {
  try {
    const contact = await ContactModel.findOneAndDelete({ hubspotId: hubspotId });
    if (contact) {
      console.log(`🗑️ Contact ${hubspotId} deleted from DB.`);
    } else {
      console.warn(`⚠️ Contact with HubSpot ID ${hubspotId} not found for deletion.`);
    }
    return contact;
  } catch (error) {
    console.error(`❌ Error deleting contact ${hubspotId} from DB:`, error);
    throw error;
  }
};

/**
 * Finds a contact in the database by its HubSpot ID.
 * @param hubspotId - The HubSpot ID of the contact to find.
 * @returns The contact document, or null if not found.
 */
export const findContactByHubspotId = async (hubspotId: string): Promise<IContact | null> => {
  try {
    const contact = await ContactModel.findOne({ hubspotId: hubspotId });
    return contact;
  } catch (error) {
    console.error(`❌ Error finding contact by HubSpot ID ${hubspotId} in DB:`, error);
    throw error;
  }
};