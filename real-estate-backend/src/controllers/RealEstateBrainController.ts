import { Request, Response } from "express";

interface AnalyzeBody {
  areaSqm: number;
  purchasePrice: number;
  expectedValue: number;
  renovationPerSqm?: number;
}

export const analyzeDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { areaSqm, purchasePrice, expectedValue, renovationPerSqm = 4500 } = req.body as AnalyzeBody;

    if (!areaSqm || !purchasePrice || !expectedValue || areaSqm <= 0 || purchasePrice <= 0) {
      res.status(400).json({ error: "areaSqm, purchasePrice, and expectedValue are required and must be positive" });
      return;
    }

    const reno = Number(renovationPerSqm) || 4500;
    const renovationCost = areaSqm * reno;
    const totalInvestment = purchasePrice + renovationCost;
    const profit = expectedValue - totalInvestment;
    const roiPercent = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
    const isViable = roiPercent >= 15;

    res.json({
      areaSqm,
      purchasePrice,
      renovationPerSqm: reno,
      renovationCost,
      totalInvestment,
      expectedValue,
      profit,
      roiPercent: Math.round(roiPercent * 10) / 10,
      isViable,
    });
  } catch (error) {
    console.error("Deal analysis error:", error);
    res.status(500).json({ error: "Failed to analyze deal" });
  }
};
