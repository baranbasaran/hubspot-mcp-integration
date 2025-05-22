// src/routes/contactRoute.ts
import { Router } from 'express';
import { createBatchContacts } from '../controllers/contactController';

const router = Router();

router.post('/createBatch', createBatchContacts);

export default router;