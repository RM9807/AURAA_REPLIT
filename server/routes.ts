import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  // Mock authentication route
  app.get('/api/auth/user', async (req: any, res) => {
    res.json({
      id: 1,
      username: "demo@example.com",
      firstName: "Demo",
      lastName: "User"
    });
  });

  // Mock login route
  app.get('/api/login', async (req: any, res) => {
    res.redirect('/dashboard');
  });

  // Simple health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}