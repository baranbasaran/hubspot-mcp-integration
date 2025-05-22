import { Router, RequestHandler } from "express";
import { handleMcpCall, getManifest } from "../controllers/mcpController";

const router = Router();

router.post("/", handleMcpCall as RequestHandler);
router.get("/manifest", getManifest as RequestHandler);

export default router;
