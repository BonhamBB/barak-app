import { Request, Response } from "express";
import { Client } from "../models/Client";
import { Property } from "../models/Property";
import { SalesGPTEngine } from "../services/SalesGPTEngine";
import { sendEmail } from "../services/emailService";

function slugify(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/** Extract company name from email: hr@wix.com -> Wix */
function companyNameFromEmail(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  const parts = domain.split(".");
  const companyPart = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || "company";
  return companyPart.charAt(0).toUpperCase() + companyPart.slice(1);
}

/** Extract slug from email: hr@wix.com -> wix */
function slugFromEmail(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  const parts = domain.split(".");
  const companyPart = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || "company";
  return companyPart;
}

export const getAllClients = async (_req: Request, res: Response): Promise<void> => {
  try {
    const clients = await Client.findAll({ order: [["unique_slug", "ASC"]] });
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
};

export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyName, displayName } = req.body;
    if (!companyName || typeof companyName !== "string") {
      res.status(400).json({ error: "companyName is required" });
      return;
    }
    const unique_slug = slugify(companyName);
    const [client] = await Client.findOrCreate({
      where: { unique_slug },
      defaults: { unique_slug, displayName: displayName || companyName.trim() },
    });
    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create client" });
  }
};

export const getClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);
    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch client" });
  }
};

export const getClientBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const client = await Client.findOne({ where: { unique_slug: slug } });
    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch client" });
  }
};

export const getClientProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const client = await Client.findOne({ where: { unique_slug: slug } });
    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    const properties = await Property.findAll({
      where: { clientId: client.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
};

export const magicOnboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "email is required" });
      return;
    }
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }

    const companyName = companyNameFromEmail(trimmedEmail);
    let client = await Client.findOne({ where: { email: trimmedEmail } });
    if (client) {
      await client.update({ email: trimmedEmail });
    } else {
      let unique_slug = slugFromEmail(trimmedEmail);
      let suffix = 0;
      while (await Client.findOne({ where: { unique_slug } })) {
        suffix++;
        unique_slug = `${slugFromEmail(trimmedEmail)}-${suffix}`;
      }
      const [created] = await Client.findOrCreate({
        where: { unique_slug },
        defaults: {
          unique_slug,
          displayName: companyName,
          email: trimmedEmail,
        },
      });
      client = created;
    }

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const dashboardLink = `${baseUrl}/dashboard/${client.unique_slug}`;

    const engine = new SalesGPTEngine();
    await engine.loadClientContext(client.unique_slug, baseUrl);
    const opening = await engine.generateOpening();

    const subject = `Curated office spaces for ${companyName} – your personal dashboard`;
    const body = `Hi,\n\n${opening}\n\nView your curated properties: ${dashboardLink}\n\nBest,\nBarak`;

    await sendEmail(trimmedEmail, subject, body);

    res.status(201).json({
      success: true,
      client: { id: client.id, unique_slug: client.unique_slug, displayName: client.displayName, email: client.email },
      dashboardLink,
    });
  } catch (error) {
    console.error("Magic onboard error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to onboard and send email",
    });
  }
};

export const assignProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { propertyIds } = req.body;
    const client = await Client.findByPk(id);
    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    const ids = Array.isArray(propertyIds) ? propertyIds.map(Number).filter(Boolean) : [];
    await Property.update({ clientId: null }, { where: { clientId: client.id } });
    if (ids.length > 0) {
      await Property.update({ clientId: client.id }, { where: { id: ids } });
    }
    const properties = await Property.findAll({ where: { clientId: client.id } });
    res.json({ success: true, properties });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to assign properties" });
  }
};

export const sendTourSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);
    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    if (!client.email) {
      res.status(400).json({ error: "Client has no email. Add email first." });
      return;
    }

    const properties = await Property.findAll({
      where: { clientId: client.id },
      order: [["createdAt", "DESC"]],
    });

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const dashboardLink = `${baseUrl}/dashboard/${client.unique_slug}`;

    const engine = new SalesGPTEngine();
    engine.setContext(dashboardLink);

    const propertySummaries = properties.map((p) => {
      const rent = Number(p.rentPerSqm) * Number(p.totalArea);
      const arnona = Number(p.arnonaPerSqm) * Number(p.totalArea) * 0.8;
      const total = rent + Number(p.mgmtFee) + arnona + Number(p.cleaningFee);
      return `${p.title} (${p.address || "N/A"}): ${p.totalArea}m², ~₪${Math.round(total).toLocaleString()}/mo`;
    });

    const bodyText = await engine.generateTourSummary(
      propertySummaries,
      client.displayName || client.unique_slug
    );

    const subject = `Post-tour summary – ${client.displayName || client.unique_slug} dashboard updated`;
    const body = `Hi,\n\n${bodyText}\n\nView your dashboard: ${dashboardLink}\n\nBest,\nBarak`;

    await sendEmail(client.email, subject, body);

    res.json({ success: true, message: "Tour summary sent" });
  } catch (error) {
    console.error("Send tour summary error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to send tour summary",
    });
  }
};

/** Assign properties + send SDR-style tour summary in one action */
export const updateAndSendSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { propertyIds } = req.body;
    const client = await Client.findByPk(id);
    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    if (!client.email) {
      res.status(400).json({ error: "Client has no email. Add email first." });
      return;
    }

    const ids = Array.isArray(propertyIds) ? propertyIds.map(Number).filter(Boolean) : [];
    await Property.update({ clientId: null }, { where: { clientId: client.id } });
    if (ids.length > 0) {
      await Property.update({ clientId: client.id }, { where: { id: ids } });
    }

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const dashboardLink = `${baseUrl}/dashboard/${client.unique_slug}`;
    const count = ids.length;
    const bodyText =
      count === 0
        ? `I've updated your dashboard. View it here: ${dashboardLink}`
        : `Great touring with you! I've updated your dashboard with the ${count} ${count === 1 ? "property" : "properties"} we saw. View your personalized comparison here: ${dashboardLink}`;

    const subject = `Your dashboard is ready – ${client.displayName || client.unique_slug}`;
    const body = `Hi,\n\n${bodyText}\n\nBest,\nBarak`;

    await sendEmail(client.email, subject, body);

    res.json({ success: true, message: "Updated and summary sent" });
  } catch (error) {
    console.error("Update and send summary error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to update and send",
    });
  }
};

export const addClientProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { address, rentPerSqm, mgmtFee, arnonaPerSqm, totalArea, title } = req.body;
    const client = await Client.findOne({ where: { unique_slug: slug } });
    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
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
      clientId: client.id,
      addedBy: "client",
    });
    res.status(201).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create property" });
  }
};
