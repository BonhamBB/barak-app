import path from "path";
import { Sequelize } from "sequelize-typescript";
import { User } from "../models/User";
import { Client } from "../models/Client";
import { Property } from "../models/Property";
import dotenv from "dotenv";

dotenv.config();

const useSqlite = process.env.DB_DIALECT === "sqlite";

export const sequelize = useSqlite
  ? new Sequelize({
      dialect: "sqlite",
      storage: path.join(__dirname, "../../data/barak.sqlite"),
      models: [User, Client, Property],
    })
  : new Sequelize({
      database: process.env.DB_NAME || "real_estate_db",
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "1572001",
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      dialect: "postgres",
      models: [User, Client, Property],
    });
