import {Router} from 'express';
import { createBatchCompanies } from '../controllers/companyController';


const router: Router = Router();

router.post('/createBatch', createBatchCompanies );


export default router;
