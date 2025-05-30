import { CompanyModel } from '../database';
import { CompanyInput } from '../types/companyTypes';
import { ICompany } from '../database/models/Company';
import { BaseRepository } from './baseRepository';

export class CompanyRepository extends BaseRepository<ICompany> {
  constructor() {
    super(CompanyModel);
  }

  /**
   * Updates a specific property of a company in the database by its HubSpot ID.
   * @param hubspotId - The HubSpot ID of the company to update.
   * @param propertyName - The name of the property to update.
   * @param newValue - The new value for the property.
   * @returns The updated company document.
   */
  async updateProperty(hubspotId: string, propertyName: string, newValue: any): Promise<ICompany | null> {
    try {
      const updateQuery = { [propertyName]: newValue };
      const company = await this.model.findOneAndUpdate(
        { hubspotId },
        { $set: updateQuery },
        { new: true, runValidators: true }
      );
      if (company) {
        console.log(`🔄 Company ${hubspotId} property '${propertyName}' updated in DB.`);
      } else {
        console.warn(`⚠️ Company with HubSpot ID ${hubspotId} not found for update.`);
      }
      return company;
    } catch (error) {
      console.error(`❌ Error updating company ${hubspotId} property '${propertyName}' in DB:`, error);
      throw error;
    }
  }

  /**
   * Finds a company by its domain.
   * @param domain - The domain to search for.
   * @returns The company document, or null if not found.
   */
  async findByDomain(domain: string): Promise<ICompany | null> {
    try {
      return await this.model.findOne({ domain: domain.toLowerCase() });
    } catch (error) {
      console.error(`❌ Error finding company by domain ${domain}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const companyRepository = new CompanyRepository();

// Export the singleton instance and its methods
export const saveCompanyToDb = (companyData: CompanyInput & { hubspotId: string }) => 
  companyRepository.save(companyData);

export const updateCompanyInDb = (hubspotId: string, propertyName: string, newValue: any) => 
  companyRepository.updateProperty(hubspotId, propertyName, newValue);

export const deleteCompanyFromDb = (hubspotId: string) => 
  companyRepository.delete(hubspotId);

export const findCompanyByHubspotId = (hubspotId: string) => 
  companyRepository.findByHubspotId(hubspotId);

export const findCompanyByDomain = (domain: string) => 
  companyRepository.findByDomain(domain);
