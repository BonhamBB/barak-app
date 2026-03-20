import { Router } from "express";
import { getAllProperties, getPropertyById, createProperty } from "../controllers/PropertyController";

const router = Router();

router.get("/", getAllProperties);
router.post("/", createProperty);
router.get("/:id", getPropertyById);

export default router;
