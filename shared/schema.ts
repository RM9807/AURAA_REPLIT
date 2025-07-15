import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  bodyType: text("body_type"),
  stylePreferences: jsonb("style_preferences"),
  budget: text("budget"),
  lifestyle: text("lifestyle"),
  colorPreferences: text("color_preferences").array(),
  sizeMeasurements: jsonb("size_measurements"),
  // Personal Style Diagnosis fields
  dailyActivity: text("daily_activity"),
  comfortLevel: text("comfort_level"),
  occasions: text("occasions").array(),
  styleInspirations: text("style_inspirations"),
  colorAvoidances: text("color_avoidances").array(),
  age: text("age"),
  height: text("height"),
  goals: text("goals").array(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const outfits = pgTable("outfits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  items: jsonb("items").notNull(),
  occasion: text("occasion"),
  season: text("season"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wardrobe = pgTable("wardrobe", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  itemName: text("item_name").notNull(),
  category: text("category").notNull(),
  color: text("color").notNull(),
  pattern: text("pattern"),
  material: text("material"),
  brand: text("brand"),
  size: text("size"),
  season: text("season"),
  imageUrl: text("image_url"),
  purchaseDate: timestamp("purchase_date"),
  price: integer("price"),
  tags: text("tags").array(),
  notes: text("notes"),
  wearCount: integer("wear_count").default(0),
  lastWorn: timestamp("last_worn"),
  favorite: boolean("favorite").default(false),
  // AI Analysis fields
  aiAnalysis: jsonb("ai_analysis"),
  styleAlignment: integer("style_alignment"),
  colorMatch: integer("color_match"),
  fitAssessment: text("fit_assessment"),
  aiRecommendation: text("ai_recommendation"),
  aiReason: text("ai_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const styleRecommendations = pgTable("style_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  recommendationType: text("recommendation_type").notNull(), // "outfit", "purchase", "color"
  content: jsonb("content").notNull(),
  reason: text("reason"),
  confidence: integer("confidence"), // 1-100
  isAccepted: boolean("is_accepted"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAnalytics = pgTable("user_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalOutfits: integer("total_outfits").default(0),
  totalWardrobeItems: integer("total_wardrobe_items").default(0),
  avgOutfitRating: integer("avg_outfit_rating"), // 1-5
  mostWornCategory: text("most_worn_category"),
  favoriteColors: text("favorite_colors").array(),
  styleScore: integer("style_score").default(0), // 1-100
  lastActive: timestamp("last_active").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});



// AI Outfit Suggestions
export const outfitSuggestions = pgTable("outfit_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  suggestedItems: jsonb("suggested_items").notNull(), // Wardrobe item IDs
  occasion: text("occasion"),
  weather: text("weather"),
  confidenceScore: integer("confidence_score"), // 0-100
  reasoning: text("reasoning"),
  isAccepted: boolean("is_accepted").default(false),
  // Weather parameters
  temperature: integer("temperature"),
  windSpeed: integer("wind_speed"),
  humidity: integer("humidity"),
  precipitation: integer("precipitation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Photo uploads for style analysis
export const photoUploads = pgTable("photo_uploads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  photoType: text("photo_type").notNull(), // "face", "front", "side", "back", "wardrobe_item"
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  relatedItemId: integer("related_item_id"), // For wardrobe items
  aiAnalysis: jsonb("ai_analysis"), // AI-generated insights from photo
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User preferences and settings
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  theme: text("theme").default("light"), // "light", "dark", "auto"
  notifications: jsonb("notifications").default('{"email": true, "push": true, "sms": false}'),
  privacy: jsonb("privacy").default('{"public_profile": false, "share_analytics": true}'),
  currency: text("currency").default("USD"),
  language: text("language").default("en"),
  timezone: text("timezone").default("UTC"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Style sessions/consultations
export const styleSessions = pgTable("style_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionType: text("session_type").notNull(), // "diagnosis", "wardrobe_audit", "outfit_planning"
  status: text("status").default("in_progress"), // "in_progress", "completed", "abandoned"
  currentStep: integer("current_step").default(1),
  totalSteps: integer("total_steps").default(5),
  sessionData: jsonb("session_data"), // Store session progress and data
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Saved outfit collections
export const outfitCollections = pgTable("outfit_collections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  outfitIds: integer("outfit_ids").array(), // References to outfits table
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Shopping wishlists
export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  itemName: text("item_name").notNull(),
  brand: text("brand"),
  category: text("category"),
  color: text("color"),
  size: text("size"),
  estimatedPrice: integer("estimated_price"),
  priority: text("priority").default("medium"), // "low", "medium", "high"
  reason: text("reason"), // Why they want this item
  imageUrl: text("image_url"),
  storeUrl: text("store_url"),
  isPurchased: boolean("is_purchased").default(false),
  purchasedDate: timestamp("purchased_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity tracking
export const userActivities = pgTable("user_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activityType: text("activity_type").notNull(), // "login", "outfit_created", "item_added", "profile_updated"
  activityData: jsonb("activity_data"), // Additional data about the activity
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Style insights and tips
export const styleInsights = pgTable("style_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  insightType: text("insight_type").notNull(), // "color_analysis", "body_type_tips", "seasonal_updates"
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category"), // "tips", "trends", "seasonal", "personal"
  isRead: boolean("is_read").default(false),
  relevanceScore: integer("relevance_score"), // How relevant to user (1-10)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});







// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  outfits: many(outfits),
  wardrobeItems: many(wardrobe),
  recommendations: many(styleRecommendations),
  analytics: one(userAnalytics, {
    fields: [users.id],
    references: [userAnalytics.userId],
  }),
  outfitSuggestions: many(outfitSuggestions),
  photoUploads: many(photoUploads),
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  styleSessions: many(styleSessions),
  outfitCollections: many(outfitCollections),
  wishlistItems: many(wishlistItems),
  activities: many(userActivities),
  styleInsights: many(styleInsights),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const outfitsRelations = relations(outfits, ({ one }) => ({
  user: one(users, {
    fields: [outfits.userId],
    references: [users.id],
  }),
}));

export const wardrobeRelations = relations(wardrobe, ({ one }) => ({
  user: one(users, {
    fields: [wardrobe.userId],
    references: [users.id],
  }),
}));

export const styleRecommendationsRelations = relations(styleRecommendations, ({ one }) => ({
  user: one(users, {
    fields: [styleRecommendations.userId],
    references: [users.id],
  }),
}));

export const userAnalyticsRelations = relations(userAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [userAnalytics.userId],
    references: [users.id],
  }),
}));

export const outfitSuggestionsRelations = relations(outfitSuggestions, ({ one }) => ({
  user: one(users, {
    fields: [outfitSuggestions.userId],
    references: [users.id],
  }),
}));

export const photoUploadsRelations = relations(photoUploads, ({ one }) => ({
  user: one(users, {
    fields: [photoUploads.userId],
    references: [users.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const styleSessionsRelations = relations(styleSessions, ({ one }) => ({
  user: one(users, {
    fields: [styleSessions.userId],
    references: [users.id],
  }),
}));

export const outfitCollectionsRelations = relations(outfitCollections, ({ one }) => ({
  user: one(users, {
    fields: [outfitCollections.userId],
    references: [users.id],
  }),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  user: one(users, {
    fields: [wishlistItems.userId],
    references: [users.id],
  }),
}));

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  user: one(users, {
    fields: [userActivities.userId],
    references: [users.id],
  }),
}));

export const styleInsightsRelations = relations(styleInsights, ({ one }) => ({
  user: one(users, {
    fields: [styleInsights.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  updatedAt: true,
});

export const insertOutfitSchema = createInsertSchema(outfits).omit({
  id: true,
  createdAt: true,
});

export const insertWardrobeSchema = createInsertSchema(wardrobe).omit({
  id: true,
  createdAt: true,
});

export const insertStyleRecommendationSchema = createInsertSchema(styleRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertUserAnalyticsSchema = createInsertSchema(userAnalytics).omit({
  id: true,
  updatedAt: true,
});

export const insertOutfitSuggestionSchema = createInsertSchema(outfitSuggestions).omit({
  id: true,
  createdAt: true,
});

export const insertPhotoUploadSchema = createInsertSchema(photoUploads).omit({
  id: true,
  createdAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertStyleSessionSchema = createInsertSchema(styleSessions).omit({
  id: true,
  createdAt: true,
});

export const insertOutfitCollectionSchema = createInsertSchema(outfitCollections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWishlistItemSchema = createInsertSchema(wishlistItems).omit({
  id: true,
  createdAt: true,
});

export const insertUserActivitySchema = createInsertSchema(userActivities).omit({
  id: true,
  timestamp: true,
});

export const insertStyleInsightSchema = createInsertSchema(styleInsights).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertOutfit = z.infer<typeof insertOutfitSchema>;
export type Outfit = typeof outfits.$inferSelect;
export type InsertWardrobeItem = z.infer<typeof insertWardrobeSchema>;
export type WardrobeItem = typeof wardrobe.$inferSelect;
export type InsertStyleRecommendation = z.infer<typeof insertStyleRecommendationSchema>;
export type StyleRecommendation = typeof styleRecommendations.$inferSelect;
export type InsertUserAnalytics = z.infer<typeof insertUserAnalyticsSchema>;
export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type InsertOutfitSuggestion = z.infer<typeof insertOutfitSuggestionSchema>;
export type OutfitSuggestion = typeof outfitSuggestions.$inferSelect;

// New table types
export type InsertPhotoUpload = z.infer<typeof insertPhotoUploadSchema>;
export type PhotoUpload = typeof photoUploads.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertStyleSession = z.infer<typeof insertStyleSessionSchema>;
export type StyleSession = typeof styleSessions.$inferSelect;
export type InsertOutfitCollection = z.infer<typeof insertOutfitCollectionSchema>;
export type OutfitCollection = typeof outfitCollections.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
export type UserActivity = typeof userActivities.$inferSelect;
export type InsertStyleInsight = z.infer<typeof insertStyleInsightSchema>;
export type StyleInsight = typeof styleInsights.$inferSelect;
