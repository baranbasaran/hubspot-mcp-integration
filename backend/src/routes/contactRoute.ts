// src/routes/contactRoute.ts
import { Router } from 'express';
import { createBatchContacts, deleteContact, searchContact } from '../controllers/contactController';

const router = Router();

router.post('/createBatch', createBatchContacts);
router.get('/search', searchContact);
router.delete('/delete/:id', deleteContact);


export default router;