import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { apiRouter } from "./routes";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/error-handler";
import { initKeepAlive } from "./services/keep-alive-service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Middlewares
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Request logging (dev mode)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`[Backend API] ${req.method} ${req.path}`);
    next();
  });
}

// Authentication context
app.use(authMiddleware);

// API Routes
app.use("/api", apiRouter);

// Root fallback
app.get("/", (req, res) => {
  res.json({
    name: "CommandDesk Backend API",
    status: "online",
    healthCheck: "/api/health",
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CommandDesk Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
  
  // Initialize keep-alive ping service
  initKeepAlive();
});

export default app;
