import express from "express";
import { createServer } from "node:http";
import { connectToSocket } from "./controllers/socketManager.js";
import mongoose from "mongoose";
import cors from "cors";

import userRoutes from "./routes/users.routes.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = createServer(app);

// connect socket
connectToSocket(server);

// middleware
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// routes
app.use("/api/v1/users", userRoutes);

// default route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// port
const PORT = process.env.PORT || 8000;
app.set("port", PORT);


const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("DB connection error:", err.message);
  }
};

start();
