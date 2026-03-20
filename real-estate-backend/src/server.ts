import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./config/database";
import authRoutes from "./routes/authRoutes";
import protectedRoutes from "./routes/protectedRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import clientRoutes from "./routes/clientRoutes";
import salesGPTRoutes from "./routes/salesGPTRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/salesgpt", salesGPTRoutes);


sequelize.sync().then(() => {
  console.log("📌 Database connected!");
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch((error) => {
  console.error("❌ Database connection error:", error);
});
