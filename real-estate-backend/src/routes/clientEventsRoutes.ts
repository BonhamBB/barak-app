import { Router, Request, Response } from "express";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  const { slug, propertyId, action, timestamp } = req.body;
  console.log("[Client Event]", { slug, propertyId, action, timestamp });
  res.json({ success: true });
});

export default router;
