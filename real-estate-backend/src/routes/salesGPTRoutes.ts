import { Router } from "express";
import { generateOpening, chat } from "../controllers/SalesGPTController";

const router = Router();

router.post("/generate-opening", generateOpening);
router.post("/chat", chat);

export default router;
