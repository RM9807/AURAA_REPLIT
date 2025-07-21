import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertUserProfileSchema,
  insertWardrobeSchema,
  insertOutfitSchema,
  insertStyleRecommendationSchema,
  insertUserAnalyticsSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  // Authentication routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // For demo mode, return a default user
      const user = await storage.getUser(1) || {
        id: 1,
        username: "demo@example.com",
        firstName: "Demo",
        lastName: "User",
        email: "demo@example.com"
      };
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/login', async (req: any, res) => {
    res.redirect('/dashboard');
  });

  // User Management Routes
  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User Profile Routes
  app.get('/api/users/:id/profile', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const profile = await storage.getUserProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/users/:id/profile', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const profileData = insertUserProfileSchema.parse({
        ...req.body,
        userId
      });
      const profile = await storage.createUserProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(400).json({ message: "Failed to create profile" });
    }
  });

  app.patch('/api/users/:id/profile', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      const profile = await storage.updateUserProfile(userId, updates);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  // Wardrobe Routes
  app.get('/api/users/:id/wardrobe', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const wardrobe = await storage.getUserWardrobe(userId);
      res.json(wardrobe);
    } catch (error) {
      console.error("Error fetching wardrobe:", error);
      res.status(500).json({ message: "Failed to fetch wardrobe" });
    }
  });

  app.post('/api/users/:id/wardrobe', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const itemData = insertWardrobeSchema.parse({
        ...req.body,
        userId
      });
      const item = await storage.createWardrobeItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating wardrobe item:", error);
      res.status(400).json({ message: "Failed to create wardrobe item" });
    }
  });

  app.get('/api/wardrobe/:id', async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const item = await storage.getWardrobeItem(itemId);
      if (!item) {
        return res.status(404).json({ message: "Wardrobe item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching wardrobe item:", error);
      res.status(500).json({ message: "Failed to fetch wardrobe item" });
    }
  });

  app.patch('/api/wardrobe/:id', async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const updates = req.body;
      const item = await storage.updateWardrobeItem(itemId, updates);
      res.json(item);
    } catch (error) {
      console.error("Error updating wardrobe item:", error);
      res.status(400).json({ message: "Failed to update wardrobe item" });
    }
  });

  // Outfit Routes
  app.get('/api/users/:id/outfits', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const outfits = await storage.getUserOutfits(userId);
      res.json(outfits);
    } catch (error) {
      console.error("Error fetching outfits:", error);
      res.status(500).json({ message: "Failed to fetch outfits" });
    }
  });

  app.post('/api/users/:id/outfits', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const outfitData = insertOutfitSchema.parse({
        ...req.body,
        userId
      });
      const outfit = await storage.createOutfit(outfitData);
      res.status(201).json(outfit);
    } catch (error) {
      console.error("Error creating outfit:", error);
      res.status(400).json({ message: "Failed to create outfit" });
    }
  });

  app.get('/api/outfits/:id', async (req, res) => {
    try {
      const outfitId = parseInt(req.params.id);
      const outfit = await storage.getOutfit(outfitId);
      if (!outfit) {
        return res.status(404).json({ message: "Outfit not found" });
      }
      res.json(outfit);
    } catch (error) {
      console.error("Error fetching outfit:", error);
      res.status(500).json({ message: "Failed to fetch outfit" });
    }
  });

  app.patch('/api/outfits/:id', async (req, res) => {
    try {
      const outfitId = parseInt(req.params.id);
      const updates = req.body;
      const outfit = await storage.updateOutfit(outfitId, updates);
      res.json(outfit);
    } catch (error) {
      console.error("Error updating outfit:", error);
      res.status(400).json({ message: "Failed to update outfit" });
    }
  });

  // Style Recommendations Routes
  app.get('/api/users/:id/recommendations', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const recommendations = await storage.getUserRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.post('/api/users/:id/recommendations', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const recommendationData = insertStyleRecommendationSchema.parse({
        ...req.body,
        userId
      });
      const recommendation = await storage.createRecommendation(recommendationData);
      res.status(201).json(recommendation);
    } catch (error) {
      console.error("Error creating recommendation:", error);
      res.status(400).json({ message: "Failed to create recommendation" });
    }
  });

  // User Analytics Routes
  app.get('/api/users/:id/analytics', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const analytics = await storage.getUserAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.post('/api/users/:id/analytics', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const analyticsData = insertUserAnalyticsSchema.parse({
        ...req.body,
        userId
      });
      const analytics = await storage.createUserAnalytics(analyticsData);
      res.status(201).json(analytics);
    } catch (error) {
      console.error("Error creating analytics:", error);
      res.status(400).json({ message: "Failed to create analytics" });
    }
  });

  app.patch('/api/users/:id/analytics', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      const analytics = await storage.updateUserAnalytics(userId, updates);
      res.json(analytics);
    } catch (error) {
      console.error("Error updating analytics:", error);
      res.status(400).json({ message: "Failed to update analytics" });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}