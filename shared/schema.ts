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
