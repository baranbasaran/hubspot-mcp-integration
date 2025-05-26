// backend/src/database/models/Contact.ts
import { Schema, model, Document, models, Model } from 'mongoose'; // Import Model type from mongoose

// 1. Define an Interface for TypeScript
export interface IContact extends Document {
  hubspotId: string; // To link with HubSpot's contact ID
  firstname?: string;
  lastname?: string;
  email: string;
  phone?: string;
  jobtitle?: string;
  company?: string;
  createdAt: Date; // Added by timestamps
  updatedAt: Date; // Added by timestamps
}

// 2. Define the Mongoose Schema
const ContactSchema: Schema = new Schema({
  hubspotId: {
    type: String,
    required: [true, 'HubSpot ID is required'],
    unique: true, // Ensures unique link to HubSpot
    trim: true,
    index: true // Add an index for faster lookups
  },
  firstname: {
    type: String,
    trim: true,
    minlength: [2, 'First name must be at least 2 characters']
  },
  lastname: {
    type: String,
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Ensures no duplicate emails in your DB
    lowercase: true, // Always store emails in lowercase
    trim: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address'], // Basic email regex validation
    index: true // Index for faster email searches
  },
  phone: {
    type: String,
    trim: true
  },
  jobtitle: {
    type: String,
    trim: true
  },
  company: {
    type: String, // You could also ref this to a Company model if storing company data locally
    trim: true
  }
}, {
  timestamps: true, // Mongoose automatically adds createdAt and updatedAt fields
  collection: 'contacts' // Explicitly define the collection name in MongoDB
});

// 3. Create and Export the Mongoose Model
// Corrected type assertion for model creation
const Contact: Model<IContact> = models.Contact || model<IContact>('Contact', ContactSchema);

export default Contact;