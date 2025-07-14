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
  budget: integer("budget"),
  lifestyle: text("lifestyle"),
  colorPreferences: text("color_preferences").array(),
  sizeMeasurements: jsonb("size_measurements"),
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
  brand: text("brand"),
  size: text("size"),
  imageUrl: text("image_url"),
  purchaseDate: timestamp("purchase_date"),
  price: integer("price"),
  tags: text("tags").array(),
  wearCount: integer("wear_count").default(0),
  lastWorn: timestamp("last_worn"),
  favorite: boolean("favorite").default(false),
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

// 1. Personalized Color Palette
export const colorPalettes = pgTable("color_palettes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  colors: jsonb("colors").notNull(), // Array of hex colors with names
  seasonType: text("season_type"), // "spring", "summer", "autumn", "winter"
  skinTone: text("skin_tone"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. AI Outfit Suggestions
export const outfitSuggestions = pgTable("outfit_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  suggestedItems: jsonb("suggested_items").notNull(), // Wardrobe item IDs
  occasion: text("occasion"),
  weather: text("weather"),
  confidenceScore: integer("confidence_score"), // 0-100
  reasoning: text("reasoning"),
  isAccepted: boolean("is_accepted").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. AR Wardrobe Tags
export const wardrobeAR = pgTable("wardrobe_ar", {
  id: serial("id").primaryKey(),
  wardrobeItemId: integer("wardrobe_item_id").references(() => wardrobe.id).notNull(),
  arTagId: text("ar_tag_id").notNull(),
  position: jsonb("position"), // 3D coordinates
  metadata: jsonb("metadata"), // Size, fit notes, care instructions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Style Mood Boards
export const moodBoards = pgTable("mood_boards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  images: text("images").array(), // Array of image URLs
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(false),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Weekly Fashion Insights
export const fashionInsights = pgTable("fashion_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  weekStartDate: timestamp("week_start_date").notNull(),
  insights: jsonb("insights").notNull(), // Generated insights data
  trends: text("trends").array(),
  recommendations: text("recommendations").array(),
  styleProgress: jsonb("style_progress"),
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
  colorPalettes: many(colorPalettes),
  outfitSuggestions: many(outfitSuggestions),
  moodBoards: many(moodBoards),
  fashionInsights: many(fashionInsights),
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

export const wardrobeRelations = relations(wardrobe, ({ one, many }) => ({
  user: one(users, {
    fields: [wardrobe.userId],
    references: [users.id],
  }),
  arTags: many(wardrobeAR),
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

// New feature relations
export const colorPalettesRelations = relations(colorPalettes, ({ one }) => ({
  user: one(users, {
    fields: [colorPalettes.userId],
    references: [users.id],
  }),
}));

export const outfitSuggestionsRelations = relations(outfitSuggestions, ({ one }) => ({
  user: one(users, {
    fields: [outfitSuggestions.userId],
    references: [users.id],
  }),
}));

export const wardrobeARRelations = relations(wardrobeAR, ({ one }) => ({
  wardrobeItem: one(wardrobe, {
    fields: [wardrobeAR.wardrobeItemId],
    references: [wardrobe.id],
  }),
}));

export const moodBoardsRelations = relations(moodBoards, ({ one }) => ({
  user: one(users, {
    fields: [moodBoards.userId],
    references: [users.id],
  }),
}));

export const fashionInsightsRelations = relations(fashionInsights, ({ one }) => ({
  user: one(users, {
    fields: [fashionInsights.userId],
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

// New feature insert schemas
export const insertColorPaletteSchema = createInsertSchema(colorPalettes).omit({
  id: true,
  createdAt: true,
});

export const insertOutfitSuggestionSchema = createInsertSchema(outfitSuggestions).omit({
  id: true,
  createdAt: true,
});

export const insertWardrobeARSchema = createInsertSchema(wardrobeAR).omit({
  id: true,
  createdAt: true,
});

export const insertMoodBoardSchema = createInsertSchema(moodBoards).omit({
  id: true,
  createdAt: true,
});

export const insertFashionInsightSchema = createInsertSchema(fashionInsights).omit({
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

// New feature types
export type InsertColorPalette = z.infer<typeof insertColorPaletteSchema>;
export type ColorPalette = typeof colorPalettes.$inferSelect;
export type InsertOutfitSuggestion = z.infer<typeof insertOutfitSuggestionSchema>;
export type OutfitSuggestion = typeof outfitSuggestions.$inferSelect;
export type InsertWardrobeAR = z.infer<typeof insertWardrobeARSchema>;
export type WardrobeAR = typeof wardrobeAR.$inferSelect;
export type InsertMoodBoard = z.infer<typeof insertMoodBoardSchema>;
export type MoodBoard = typeof moodBoards.$inferSelect;
export type InsertFashionInsight = z.infer<typeof insertFashionInsightSchema>;
export type FashionInsight = typeof fashionInsights.$inferSelect;
