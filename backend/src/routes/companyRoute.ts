import {Router, RequestHandler} from 'express';
import { createBatchCompanies } from '../controllers/companyController';


const router: Router = Router();

router.post('/createBatch', createBatchCompanies as RequestHandler);


export default router;
