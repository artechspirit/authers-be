import "reflect-metadata";
import express from "express";
import { DataSource } from "typeorm";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { User } from "./entities/User";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const PORT = process.env.PORT || 4000;

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV === "development", // hanya untuk dev, jangan di prod
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});

const allowedOrigins = [
  "http://localhost:3000",
  "https://authers-fe.vercel.app",
];

AppDataSource.initialize()
  .then(() => {
    const app = express();

    app.use(helmet());
    app.use(
      cors({
        origin: function (origin, callback) {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
      })
    );
    app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
    app.use(express.json());
    app.use(cookieParser());

    app.use("/api/auth", authRoutes);
    app.use("/api/user", userRoutes);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log(error));
