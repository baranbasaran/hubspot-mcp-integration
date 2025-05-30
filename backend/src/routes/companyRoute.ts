import { Router } from 'express';
import { 
  createBatchCompanies, 
  searchCompany, 
  getCompanies,
  deleteCompany 
} from '../controllers/companyController';

const router: Router = Router();

// Create multiple companies in batch
router.post('/createBatch', createBatchCompanies);

// Get all companies
router.get('/', getCompanies);

// Search companies with filters
router.get('/search', searchCompany);

// Delete a company by ID
router.delete('/:id', deleteCompany);

export default router;
