import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { trpcServer } from "@hono/trpc-server";
import { auth } from "@council/auth";
import { appRouter } from "@council/api/routers";
import { createContext } from "@council/api/context";

const app = new Hono();

// Middleware
app.use(logger());
app.use(
  "/*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.FRONTEND_URL || "http://localhost:3000",
    ],
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Health check
app.get("/", (c) => {
  return c.json({
    name: "LLM Council API",
    version: "0.1.0",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// tRPC routes
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: ({ req }) => createContext({ req }),
  })
);

// Start server
const port = Number(process.env.PORT) || 3001;

console.log(`🚀 LLM Council Server running at http://localhost:${port}`);
console.log(`📡 tRPC endpoint: http://localhost:${port}/trpc`);
console.log(`🔐 Auth endpoint: http://localhost:${port}/api/auth`);

export default {
  port,
  fetch: app.fetch,
};
