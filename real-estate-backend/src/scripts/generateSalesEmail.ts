/**
 * SDR Script: Generate opening email for a tech company client
 * Run: npm run generate-email -- azrieli-barak-tower
 * Or: npx ts-node src/scripts/generateSalesEmail.ts azrieli-barak-tower
 */

import "reflect-metadata";
import dotenv from "dotenv";
import { sequelize } from "../config/database";
import { SalesGPTEngine } from "../services/SalesGPTEngine";

dotenv.config();

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:3000";

async function main() {
  const clientSlug = process.argv[2] || "azrieli-barak-tower";

  console.log(`\n📧 Generating opening email for client: ${clientSlug}\n`);

  await sequelize.authenticate();

  const engine = new SalesGPTEngine();
  await engine.loadClientContext(clientSlug, BASE_URL);

  const opening = await engine.generateOpening();
  const dashboardLink = engine.getDashboardLink();

  console.log("--- Opening Message ---");
  console.log(opening);
  console.log("\n--- Dashboard Link ---");
  console.log(dashboardLink || "(No link - client not found or no properties)");
  console.log("\n--- Full Email Draft ---");
  console.log(`
Subject: Curated office spaces for ${clientSlug} – your personal dashboard

Hi,

${opening}

${dashboardLink ? `View your curated properties: ${dashboardLink}` : ""}

Best,
Barak
`);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
