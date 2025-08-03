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
  registerUserSchema,
  loginUserSchema,
} from "@shared/schema";
import { z } from "zod";
import { 
  analyzeStyleProfile, 
  analyzePhotosForColorAnalysis, 
  generateStyleRecommendations,
  type StyleAnalysisInput 
} from "./ai-analysis";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  // Authentication routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check if user is authenticated (has active session)
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get the authenticated user's data
      const user = req.user;
      if (user && user.id) {
        const userData = await storage.getUser(user.id);
        if (userData) {
          // Return user data without password
          const { password, ...userWithoutPassword } = userData;
          res.json(userWithoutPassword);
          return;
        }
      }

      res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // User registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validation = registerUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.flatten().fieldErrors 
        });
      }

      const { username, email, password, firstName, lastName } = validation.data;

      // Check if user already exists
      const existingUser = await storage.getUserByUsernameOrEmail(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username or email already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }

      // Create new user
      const newUser = await storage.createUser({
        username,
        email,
        password,
        firstName,
        lastName,
      });

      // Log the user in
      req.login({ id: newUser.id, username: newUser.username }, (err: any) => {
        if (err) {
          return res.status(500).json({ error: "Registration successful but login failed" });
        }
        
        // Return user data without password
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({ 
          message: "Registration successful", 
          user: userWithoutPassword 
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User login endpoint  
  app.post('/api/auth/login', async (req, res) => {
    try {
      const validation = loginUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.flatten().fieldErrors 
        });
      }

      const { usernameOrEmail, password } = validation.data;

      // Find user by username or email
      const user = await storage.getUserByUsernameOrEmail(usernameOrEmail);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isPasswordValid = await storage.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Log the user in
      req.login({ id: user.id, username: user.username }, (err: any) => {
        if (err) {
          return res.status(500).json({ error: "Login failed" });
        }
        
        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;
        res.json({ 
          message: "Login successful", 
          user: userWithoutPassword 
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logout successful" });
      });
    });
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

  // AI Analysis Routes
  app.post('/api/users/:id/analyze-style', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const analysisInput: StyleAnalysisInput = req.body;
      
      // Generate AI analysis
      const styleDNA = await analyzeStyleProfile(analysisInput);
      
      // Create or update user profile with analysis results
      const profileData = {
        userId,
        bodyType: analysisInput.bodyType,
        height: analysisInput.height,
        age: parseInt(analysisInput.age),
        dailyActivity: analysisInput.dailyActivity,
        comfortLevel: analysisInput.comfortLevel,
        occasions: analysisInput.occasions,
        goals: analysisInput.goals,
        colorPreferences: analysisInput.colorPreferences,
        colorAvoidances: analysisInput.colorAvoidances,
        styleInspirations: analysisInput.styleInspirations,
        budget: analysisInput.budget,
        skinTone: analysisInput.skinTone,
        hairColor: analysisInput.hairColor,
        eyeColor: analysisInput.eyeColor,
      };

      // Check if profile exists
      const existingProfile = await storage.getUserProfile(userId);
      let profile;
      
      if (existingProfile) {
        profile = await storage.updateUserProfile(userId, profileData);
      } else {
        profile = await storage.createUserProfile(profileData);
      }

      // Store AI recommendations with complete metadata for dashboard synchronization
      const recommendations = [
        {
          userId,
          recommendation: `Style DNA: ${styleDNA.styleDNA.primaryStyle} with ${styleDNA.styleDNA.secondaryStyle} influences`,
          type: 'style_analysis',
          confidence: styleDNA.styleDNA.confidenceScore.toString(),
          reasoning: styleDNA.styleDNA.styleDescription,
          metadata: {
            styleDNA: styleDNA.styleDNA,
            colorPalette: styleDNA.colorPalette,
            bodyAnalysis: styleDNA.bodyAnalysis,
            personalizedTips: styleDNA.personalizedTips,
            confidenceBoost: styleDNA.confidenceBoost,
            overallRecommendation: styleDNA.overallRecommendation
          }
        },
        ...styleDNA.personalizedTips.shoppingGuide.map(tip => ({
          userId,
          recommendation: tip,
          type: 'shopping_guide',
          confidence: '0.8',
          reasoning: 'AI-generated shopping recommendation based on style goals',
          metadata: { category: 'shopping_priority' }
        })),
        ...styleDNA.personalizedTips.stylingTips.map(tip => ({
          userId,
          recommendation: tip,
          type: 'styling_tips',
          confidence: '0.85',
          reasoning: 'Personalized styling advice based on AI analysis',
          metadata: { category: 'personalized_advice' }
        }))
      ];

      // Clear existing AI recommendations to prevent duplicates
      const existingRecs = await storage.getUserRecommendations(userId);
      for (const existing of existingRecs) {
        if (existing.type === 'style_analysis' || existing.type === 'shopping_guide' || existing.type === 'styling_tips') {
          await storage.deleteRecommendation(existing.id);
        }
      }

      // Create new recommendations
      for (const rec of recommendations) {
        await storage.createRecommendation(rec);
      }

      res.json({
        profile,
        styleDNA,
        success: true,
        message: 'Style analysis completed successfully'
      });

    } catch (error) {
      console.error("Error analyzing style:", error);
      res.status(500).json({ 
        message: "Failed to analyze style",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/users/:id/analyze-photos', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { imageData } = req.body; // Base64 encoded image
      
      if (!imageData) {
        return res.status(400).json({ message: "Image data is required" });
      }

      const colorAnalysis = await analyzePhotosForColorAnalysis(imageData);
      
      res.json({
        colorAnalysis,
        success: true,
        message: 'Photo analysis completed successfully'
      });

    } catch (error) {
      console.error("Error analyzing photos:", error);
      res.status(500).json({ 
        message: "Failed to analyze photos",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/users/:id/generate-recommendations', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { styleGoals = [] } = req.body;
      
      // Get user profile and wardrobe
      const profile = await storage.getUserProfile(userId);
      const wardrobe = await storage.getUserWardrobe(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "User profile not found" });
      }

      const recommendations = await generateStyleRecommendations(
        profile,
        wardrobe,
        styleGoals
      );

      // Store recommendations in database
      for (const rec of recommendations.recommendations) {
        await storage.createRecommendation({
          userId,
          recommendation: rec.title,
          type: rec.type,
          confidence: rec.confidence.toString(),
          reasoning: rec.reasoning,
          metadata: { 
            description: rec.description,
            priority: rec.priority 
          }
        });
      }

      res.json({
        recommendations: recommendations.recommendations,
        success: true,
        message: 'Recommendations generated successfully'
      });

    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ 
        message: "Failed to generate recommendations",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}