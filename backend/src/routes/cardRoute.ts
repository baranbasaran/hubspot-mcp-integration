import { Router } from "express";

const router = Router();

import { createCRMCard } from "../controllers/cardController";

// Route to create a HubSpot CRM card
router.post("/create", createCRMCard);

export default router;