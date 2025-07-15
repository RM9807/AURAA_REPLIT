import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertUserProfileSchema, 
  insertOutfitSchema, 
  insertWardrobeSchema, 
  insertStyleRecommendationSchema, 
  insertUserAnalyticsSchema,
  insertPhotoUploadSchema,
  insertUserSettingsSchema,
  insertStyleSessionSchema,
  insertOutfitCollectionSchema,
  insertWishlistItemSchema,
  insertUserActivitySchema,
  insertStyleInsightSchema
} from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  // Authentication routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(parseInt(userId));
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
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

  // ===== NEW FEATURES API ROUTES =====


  // AI Outfit Suggestion Routes
  app.get('/api/users/:id/outfit-suggestions', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const suggestions = await storage.getUserOutfitSuggestions(userId);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching outfit suggestions:", error);
      res.status(500).json({ message: "Failed to fetch outfit suggestions" });
    }
  });

  app.post('/api/users/:id/outfit-suggestions', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const suggestion = await storage.createOutfitSuggestion({ ...req.body, userId });
      res.json(suggestion);
    } catch (error) {
      console.error("Error creating outfit suggestion:", error);
      res.status(500).json({ message: "Failed to create outfit suggestion" });
    }
  });

  // Accept outfit suggestion
  app.patch('/api/outfit-suggestions/:id/accept', async (req, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      const suggestion = await storage.acceptOutfitSuggestion(suggestionId);
      res.json(suggestion);
    } catch (error) {
      console.error("Error accepting outfit suggestion:", error);
      res.status(500).json({ message: "Failed to accept outfit suggestion" });
    }
  });

  // Photo Upload Routes
  app.get('/api/users/:id/photos', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const photos = await storage.getUserPhotoUploads(userId);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  });

  app.post('/api/users/:id/photos', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const photoData = insertPhotoUploadSchema.parse({ ...req.body, userId });
      const photo = await storage.createPhotoUpload(photoData);
      res.json(photo);
    } catch (error) {
      res.status(400).json({ error: "Invalid photo data" });
    }
  });

  app.get('/api/photos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const photo = await storage.getPhotoUpload(id);
      if (!photo) {
        return res.status(404).json({ error: "Photo not found" });
      }
      res.json(photo);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch photo" });
    }
  });

  app.delete('/api/photos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePhotoUpload(id);
      res.json({ message: "Photo deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete photo" });
    }
  });

  // User Settings Routes
  app.get('/api/users/:id/settings', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const settings = await storage.getUserSettings(userId);
      if (!settings) {
        return res.status(404).json({ error: "Settings not found" });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post('/api/users/:id/settings', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const settingsData = insertUserSettingsSchema.parse({ ...req.body, userId });
      const settings = await storage.createUserSettings(settingsData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid settings data" });
    }
  });

  app.patch('/api/users/:id/settings', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const settingsData = req.body;
      const settings = await storage.updateUserSettings(userId, settingsData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Failed to update settings" });
    }
  });

  // Style Session Routes
  app.get('/api/users/:id/style-sessions', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const sessions = await storage.getUserStyleSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch style sessions" });
    }
  });

  app.post('/api/users/:id/style-sessions', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const sessionData = insertStyleSessionSchema.parse({ ...req.body, userId });
      const session = await storage.createStyleSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  app.get('/api/style-sessions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getStyleSession(id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.patch('/api/style-sessions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sessionData = req.body;
      const session = await storage.updateStyleSession(id, sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Failed to update session" });
    }
  });

  // Outfit Collection Routes
  app.get('/api/users/:id/outfit-collections', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const collections = await storage.getUserOutfitCollections(userId);
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch outfit collections" });
    }
  });

  app.post('/api/users/:id/outfit-collections', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const collectionData = insertOutfitCollectionSchema.parse({ ...req.body, userId });
      const collection = await storage.createOutfitCollection(collectionData);
      res.json(collection);
    } catch (error) {
      res.status(400).json({ error: "Invalid collection data" });
    }
  });

  app.get('/api/outfit-collections/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const collection = await storage.getOutfitCollection(id);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collection" });
    }
  });

  app.patch('/api/outfit-collections/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const collectionData = req.body;
      const collection = await storage.updateOutfitCollection(id, collectionData);
      res.json(collection);
    } catch (error) {
      res.status(400).json({ error: "Failed to update collection" });
    }
  });

  // Wishlist Routes
  app.get('/api/users/:id/wishlist', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const wishlist = await storage.getUserWishlistItems(userId);
      res.json(wishlist);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wishlist" });
    }
  });

  app.post('/api/users/:id/wishlist', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const itemData = insertWishlistItemSchema.parse({ ...req.body, userId });
      const item = await storage.createWishlistItem(itemData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid wishlist item data" });
    }
  });

  app.patch('/api/wishlist/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const itemData = req.body;
      const item = await storage.updateWishlistItem(id, itemData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Failed to update wishlist item" });
    }
  });

  app.delete('/api/wishlist/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteWishlistItem(id);
      res.json({ message: "Wishlist item deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete wishlist item" });
    }
  });

  // User Activity Routes
  app.get('/api/users/:id/activities', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const activities = await storage.getUserActivities(userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.post('/api/users/:id/activities', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const activityData = insertUserActivitySchema.parse({ ...req.body, userId });
      const activity = await storage.createUserActivity(activityData);
      res.json(activity);
    } catch (error) {
      res.status(400).json({ error: "Invalid activity data" });
    }
  });

  // Style Insights Routes
  app.get('/api/users/:id/style-insights', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const insights = await storage.getUserStyleInsights(userId);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch style insights" });
    }
  });

  app.post('/api/users/:id/style-insights', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const insightData = insertStyleInsightSchema.parse({ ...req.body, userId });
      const insight = await storage.createStyleInsight(insightData);
      res.json(insight);
    } catch (error) {
      res.status(400).json({ error: "Invalid insight data" });
    }
  });

  app.patch('/api/style-insights/:id/read', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const insight = await storage.markInsightAsRead(id);
      res.json(insight);
    } catch (error) {
      res.status(400).json({ error: "Failed to mark insight as read" });
    }
  });





  const httpServer = createServer(app);

  return httpServer;
}
