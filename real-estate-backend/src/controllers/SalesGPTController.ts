import { Request, Response } from "express";
import { SalesGPTEngine } from "../services/SalesGPTEngine";

/**
 * Generate opening email for a client
 * POST /api/salesgpt/generate-opening
 * Body: { clientSlug: string }
 */
export const generateOpening = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientSlug } = req.body;
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    if (!clientSlug) {
      res.status(400).json({ error: "clientSlug is required" });
      return;
    }

    const engine = new SalesGPTEngine();
    await engine.loadClientContext(clientSlug, baseUrl);
    const opening = await engine.generateOpening();

    res.json({
      opening,
      dashboardLink: engine.getDashboardLink(),
      stageId: engine.getStageId(),
    });
  } catch (error) {
    console.error("SalesGPT generateOpening error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate opening",
    });
  }
};

/**
 * Chat turn - add user message, get agent response
 * POST /api/salesgpt/chat
 * Body: { clientSlug: string, userMessage: string, conversationHistory?: string[], stageId?: string }
 */
export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientSlug, userMessage, conversationHistory, stageId } = req.body;
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    if (!clientSlug || !userMessage) {
      res.status(400).json({ error: "clientSlug and userMessage are required" });
      return;
    }

    const engine = new SalesGPTEngine();
    await engine.loadClientContext(clientSlug, baseUrl);

    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      engine.restoreState(conversationHistory, stageId || "1");
    }

    const result = await engine.chat(userMessage);

    res.json({
      text: result.text,
      endOfCall: result.endOfCall,
      stageId: engine.getStageId(),
      conversationHistory: engine.getConversationHistory(),
    });
  } catch (error) {
    console.error("SalesGPT chat error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate response",
    });
  }
};
