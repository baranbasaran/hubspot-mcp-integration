// backend/src/repositories/contactRepository.ts
import { ContactModel } from '../database'; // Import ContactModel and IContact interface
import { ContactInput } from '../types/contactTypes';
import { IContact } from '../database/models/Contact'; // Import IContact interface
import { BaseRepository } from './baseRepository';

export class ContactRepository extends BaseRepository<IContact> {
  constructor() {
    super(ContactModel);
  }

  /**
   * Updates a specific property of a contact in the database by its HubSpot ID.
   * @param hubspotId - The HubSpot ID of the contact to update.
   * @param propertyName - The name of the property to update.
   * @param newValue - The new value for the property.
   * @returns The updated contact document.
   */
  async updateProperty(hubspotId: string, propertyName: string, newValue: any): Promise<IContact | null> {
    try {
      const updateQuery = { [propertyName]: newValue };
      const contact = await this.model.findOneAndUpdate(
        { hubspotId },
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
  }
}

// Create a singleton instance
const contactRepository = new ContactRepository();

/**
 * Saves a new contact to the database or updates an existing one if a hubspotId is provided.
 * @param contactData - The contact data to save.
 * @returns The saved or updated contact document.
 */
export const saveContactToDb = (contactData: ContactInput & { hubspotId: string }) => 
  contactRepository.save(contactData);

/**
 * Updates a specific property of a contact in the database by its HubSpot ID.
 * @param hubspotId - The HubSpot ID of the contact to update.
 * @param propertyName - The name of the property to update.
 * @param newValue - The new value for the property.
 * @returns The updated contact document.
 */
export const updateContactInDb = (hubspotId: string, propertyName: string, newValue: any) => 
  contactRepository.updateProperty(hubspotId, propertyName, newValue);

/**
 * Deletes a contact from the database by its HubSpot ID.
 * @param hubspotId - The HubSpot ID of the contact to delete.
 * @returns The deleted contact document, or null if not found.
 */
export const deleteContactFromDb = (hubspotId: string) => 
  contactRepository.delete(hubspotId);

/**
 * Finds a contact in the database by its HubSpot ID.
 * @param hubspotId - The HubSpot ID of the contact to find.
 * @returns The contact document, or null if not found.
 */
export const findContactByHubspotId = (hubspotId: string) => 
  contactRepository.findByHubspotId(hubspotId);