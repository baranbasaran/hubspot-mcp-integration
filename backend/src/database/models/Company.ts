// backend/src/database/models/Company.ts
import { Schema, model, Document, models, Model } from 'mongoose'; // Import Model type from mongoose

// 1. Define an Interface for TypeScript
export interface ICompany extends Document {
  hubspotId: string; // To link with HubSpot's company ID
  name: string;
  domain?: string;
  phone?: string;
  industry?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Define the Mongoose Schema
const CompanySchema: Schema = new Schema({
  hubspotId: {
    type: String,
    required: [true, 'HubSpot ID is required'],
    unique: true, // Ensures unique link to HubSpot
    trim: true,
    index: true // Add an index for faster lookups
  },
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    minlength: [2, 'Company name must be at least 2 characters']
  },
  domain: {
    type: String,
    unique: true, // Ensures no duplicate domains
    lowercase: true,
    trim: true,
    index: true // Index for faster domain searches
  },
  phone: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
  collection: 'companies' // Explicitly define the collection name in MongoDB
});

// 3. Create and Export the Mongoose Model
// Corrected type assertion for model creation
const Company: Model<ICompany> = models.Company || model<ICompany>('Company', CompanySchema);

export default Company;