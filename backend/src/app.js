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


app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);



app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Routes
app.use("/api/v1/users", userRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// PORT
const PORT = process.env.PORT || 8000;
app.set("port", PORT);

// START FUNCTION
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");

    // SOCKET CONNECT (after DB connected)
    connectToSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("DB connection error:", err.message);
  }
};

start();



// https://apna-video-call-frontend-zzgp.onrender.com