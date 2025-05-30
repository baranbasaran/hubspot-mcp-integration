import { Router } from 'express';
import { createBatchContacts, deleteContact, searchContact, listContacts } from '../controllers/contactController';

const router: Router = Router();

// Create multiple contacts in batch
router.post('/batch', createBatchContacts);

// List all contacts
router.get('/', listContacts);

// Search contacts with filters
router.get('/search', searchContact);

// Delete a contact by ID
router.delete('/:id', deleteContact);

export default router;