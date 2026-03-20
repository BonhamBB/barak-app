import { Request, Response } from "express";
import { Property } from "../models/Property";

export const getAllProperties = async (_req: Request, res: Response): Promise<void> => {
  try {
    const properties = await Property.findAll({ include: ["client"] });
    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
};

export const createProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address, rentPerSqm, mgmtFee, arnonaPerSqm, totalArea, clientId, title } = req.body;
    if (
      address == null ||
      rentPerSqm == null ||
      mgmtFee == null ||
      arnonaPerSqm == null ||
      totalArea == null
    ) {
      res.status(400).json({
        error: "address, rentPerSqm, mgmtFee, arnonaPerSqm, and totalArea are required",
      });
      return;
    }
    const property = await Property.create({
      title: title || address,
      address,
      rentPerSqm: Number(rentPerSqm),
      mgmtFee: Number(mgmtFee),
      arnonaPerSqm: Number(arnonaPerSqm),
      totalArea: Number(totalArea),
      isTechDiscount: true,
      cleaningFee: 12,
      clientId: clientId ? Number(clientId) : null,
      addedBy: "admin",
    });
    res.status(201).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create property" });
  }
};

export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id, { include: ["client"] });
    if (!property) {
      res.status(404).json({ error: "Property not found" });
      return;
    }
    res.json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch property" });
  }
};
