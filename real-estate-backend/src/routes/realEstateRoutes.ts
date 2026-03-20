import { Router } from "express";
import { analyzeDeal } from "../controllers/RealEstateBrainController";

const router = Router();
router.post("/analyze", analyzeDeal);

export default router;
