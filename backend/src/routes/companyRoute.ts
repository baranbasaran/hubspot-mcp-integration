import {Router} from 'express';
import { createBatchCompanies } from '../controllers/companyController';


const router = Router();

router.get('/', (req, res) => {
  res.send('Company route works!');
});

router.post('/createBatch', createBatchCompanies);


export default router;
