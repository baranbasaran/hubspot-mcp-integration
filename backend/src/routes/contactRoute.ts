// src/routes/contactRoute.ts
import { Router, RequestHandler } from 'express'; // Import RequestHandler
import { createBatchContacts, deleteContact, searchContact } from '../controllers/contactController';

const router: Router = Router(); // Explicitly type 'router' as Router

router.post('/createBatch', createBatchContacts ); // Cast to RequestHandler
router.get('/search', searchContact ); // Cast to RequestHandler
router.delete('/delete/:id', deleteContact ); // Cast to RequestHandler


export default router;