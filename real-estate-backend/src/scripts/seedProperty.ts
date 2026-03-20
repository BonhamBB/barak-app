import "reflect-metadata";
import dotenv from "dotenv";
import { sequelize } from "../config/database";
import { Client } from "../models/Client";
import { Property } from "../models/Property";

dotenv.config();

async function seed() {
  try {
    await sequelize.sync({ force: false });
    console.log("Database synced.");

    const [client] = await Client.findOrCreate({
      where: { unique_slug: "azrieli-barak-tower" },
      defaults: {
        unique_slug: "azrieli-barak-tower",
        displayName: "Azrieli - Barak Tower",
        email: "demo@azrieli.example.com",
      },
    });
    await client.update({ email: "demo@azrieli.example.com" });

    const [property, created] = await Property.findOrCreate({
      where: { title: "Azrieli - Barak Tower" },
      defaults: {
        title: "Azrieli - Barak Tower",
        address: "Azrieli Center, Tel Aviv",
        rentPerSqm: 180,
        mgmtFee: 35,
        arnonaPerSqm: 32,
        isTechDiscount: true,
        cleaningFee: 12,
        totalArea: 500,
        clientId: client.id,
      },
    });

    if (created) {
      console.log("✅ Seeded: Azrieli - Barak Tower (client: azrieli-barak-tower)");
    } else {
      await property.update({
        rentPerSqm: 180,
        mgmtFee: 35,
        arnonaPerSqm: 32,
        isTechDiscount: true,
        cleaningFee: 12,
        totalArea: 500,
        clientId: client.id,
      });
      console.log("✅ Updated: Azrieli - Barak Tower");
    }

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
