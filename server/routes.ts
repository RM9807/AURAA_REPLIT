import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertUserProfileSchema, insertOutfitSchema, insertWardrobeSchema, insertStyleRecommendationSchema, insertUserAnalyticsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.get("/api/users/:id/profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/users/:id/profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const profileData = insertUserProfileSchema.parse({ ...req.body, userId });
      const profile = await storage.createUserProfile(profileData);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ error: "Invalid profile data" });
    }
  });

  app.patch("/api/users/:id/profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const profileData = req.body;
      const profile = await storage.updateUserProfile(userId, profileData);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ error: "Failed to update profile" });
    }
  });

  // Outfit routes
  app.get("/api/users/:id/outfits", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const outfits = await storage.getUserOutfits(userId);
      res.json(outfits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch outfits" });
    }
  });

  app.post("/api/users/:id/outfits", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const outfitData = insertOutfitSchema.parse({ ...req.body, userId });
      const outfit = await storage.createOutfit(outfitData);
      res.json(outfit);
    } catch (error) {
      res.status(400).json({ error: "Invalid outfit data" });
    }
  });

  app.get("/api/outfits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const outfit = await storage.getOutfit(id);
      if (!outfit) {
        return res.status(404).json({ error: "Outfit not found" });
      }
      res.json(outfit);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch outfit" });
    }
  });

  // Wardrobe routes
  app.get("/api/users/:id/wardrobe", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const wardrobe = await storage.getUserWardrobe(userId);
      res.json(wardrobe);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wardrobe" });
    }
  });

  app.post("/api/users/:id/wardrobe", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const itemData = insertWardrobeSchema.parse({ ...req.body, userId });
      const item = await storage.createWardrobeItem(itemData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid wardrobe item data" });
    }
  });

  app.get("/api/wardrobe/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getWardrobeItem(id);
      if (!item) {
        return res.status(404).json({ error: "Wardrobe item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wardrobe item" });
    }
  });

  app.patch("/api/wardrobe/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const itemData = req.body;
      const item = await storage.updateWardrobeItem(id, itemData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Failed to update wardrobe item" });
    }
  });

  // Style recommendation routes
  app.get("/api/users/:id/recommendations", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const recommendations = await storage.getUserRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  app.post("/api/users/:id/recommendations", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const recommendationData = insertStyleRecommendationSchema.parse({ ...req.body, userId });
      const recommendation = await storage.createRecommendation(recommendationData);
      res.json(recommendation);
    } catch (error) {
      res.status(400).json({ error: "Invalid recommendation data" });
    }
  });

  app.patch("/api/recommendations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recommendationData = req.body;
      const recommendation = await storage.updateRecommendation(id, recommendationData);
      res.json(recommendation);
    } catch (error) {
      res.status(400).json({ error: "Failed to update recommendation" });
    }
  });

  // User analytics routes
  app.get("/api/users/:id/analytics", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const analytics = await storage.getUserAnalytics(userId);
      if (!analytics) {
        return res.status(404).json({ error: "Analytics not found" });
      }
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.post("/api/users/:id/analytics", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const analyticsData = insertUserAnalyticsSchema.parse({ ...req.body, userId });
      const analytics = await storage.createUserAnalytics(analyticsData);
      res.json(analytics);
    } catch (error) {
      res.status(400).json({ error: "Invalid analytics data" });
    }
  });

  app.patch("/api/users/:id/analytics", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const analyticsData = req.body;
      const analytics = await storage.updateUserAnalytics(userId, analyticsData);
      res.json(analytics);
    } catch (error) {
      res.status(400).json({ error: "Failed to update analytics" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
