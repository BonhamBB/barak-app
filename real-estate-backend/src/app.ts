import express from "express";
import cors from "cors";
import { sequelize } from "./config/database";
import authRoutes from "./routes/authRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import "./custom";


export const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/api/properties", propertyRoutes);

// تأكد من الاتصال بقاعدة البيانات عند تشغيل السيرفر
sequelize.sync().then(() => {
  console.log("Database connected!");
});
