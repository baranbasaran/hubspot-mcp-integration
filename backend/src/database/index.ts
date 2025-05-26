// backend/src/database/index.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables for DB connection string
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

// Connection function
export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    // Already connected
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      // useNewUrlParser: true, // Deprecated in Mongoose 6+
      // useUnifiedTopology: true, // Deprecated in Mongoose 6+
      // useCreateIndex: true, // Deprecated in Mongoose 6+
      // useFindAndModify: false, // Deprecated in Mongoose 6+
    });
    console.log('✅ MongoDB connected successfully.');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};

// Import and re-export your models for easy access
export { default as ContactModel } from './models/Contact';
export { default as CompanyModel } from './models/Company';