import { Router } from "express";
import {
  getAllClients,
  createClient,
  getClientById,
  getClientBySlug,
  getClientProperties,
  addClientProperty,
  magicOnboard,
  assignProperties,
  sendTourSummary,
  updateAndSendSummary,
} from "../controllers/ClientController";

const router = Router();

router.get("/", getAllClients);
router.post("/", createClient);
router.post("/magic-onboard", magicOnboard);
router.get("/by-id/:id", getClientById);
router.post("/by-id/:id/assign-properties", assignProperties);
router.post("/by-id/:id/send-tour-summary", sendTourSummary);
router.post("/by-id/:id/update-and-send-summary", updateAndSendSummary);
router.get("/:slug/properties", getClientProperties);
router.post("/:slug/properties", addClientProperty);
router.get("/:slug", getClientBySlug);

export default router;
