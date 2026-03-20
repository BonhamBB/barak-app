/**
 * Migration: Add email column to clients table.
 * Run: npx ts-node src/scripts/migrateClientEmail.ts
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
    if (!names.includes("email")) {
      await sequelize.query(`ALTER TABLE clients ADD COLUMN email VARCHAR(255)`);
      console.log("✅ Added email column to clients");
    } else {
      console.log("Email column already exists");
    }
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
