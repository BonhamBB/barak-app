/**
 * Migration: Add unique_slug to clients (for existing DBs with companyName).
 * Run: npx ts-node src/scripts/migrateClientSlug.ts
 */
import "reflect-metadata";
import dotenv from "dotenv";
import { sequelize } from "../config/database";
import { QueryTypes } from "sequelize";

dotenv.config();

async function migrate() {
  try {
    const cols = await sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'clients'`,
      { type: QueryTypes.SELECT }
    ) as { column_name: string }[];
    const names = cols.map((c) => c.column_name.toLowerCase());
    if (names.includes("companyname") && !names.includes("unique_slug")) {
      await sequelize.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS unique_slug VARCHAR(255)`);
      await sequelize.query(`UPDATE clients SET unique_slug = "companyName" WHERE unique_slug IS NULL`);
      await sequelize.query(`ALTER TABLE clients DROP COLUMN "companyName"`);
      await sequelize.query(`ALTER TABLE clients ALTER COLUMN unique_slug SET NOT NULL`);
      await sequelize.query(`ALTER TABLE clients ADD CONSTRAINT clients_unique_slug_key UNIQUE (unique_slug)`);
      console.log("✅ Migrated: companyName -> unique_slug");
    } else {
      console.log("Clients: No migration needed");
    }
    // Add addedBy to properties if missing
    const propCols = await sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'properties'`,
      { type: QueryTypes.SELECT }
    ) as { column_name: string }[];
    const propNames = propCols.map((c) => c.column_name.toLowerCase());
    if (!propNames.includes("addedby")) {
      await sequelize.query(`ALTER TABLE properties ADD COLUMN "addedBy" VARCHAR(255) DEFAULT 'admin'`);
      await sequelize.query(`UPDATE properties SET "addedBy" = 'admin' WHERE "addedBy" IS NULL`);
      console.log("✅ Added addedBy to properties");
    }
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
