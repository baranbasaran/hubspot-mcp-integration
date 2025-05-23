// src/routes/contactRoute.ts
import { Router } from 'express';
import { createBatchContacts, deleteContact, searchContact,listContacts } from '../controllers/contactController';

const router = Router();

router.get('/', listContacts);
router.post('/createBatch', createBatchContacts);
router.get('/search/:id', searchContact);
router.delete('/delete/:id', deleteContact);


export default router;