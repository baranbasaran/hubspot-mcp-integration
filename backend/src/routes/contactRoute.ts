// src/routes/contactRoute.ts
import {Router, RequestHandler} from 'express';
import { createBatchContacts, deleteContact, searchContact } from '../controllers/contactController';

const router: Router = Router();

router.post('/createBatch', createBatchContacts as RequestHandler);
router.get('/search', searchContact as RequestHandler);
router.delete('/delete/:id', deleteContact as RequestHandler);


export default router;