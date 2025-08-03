import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User profiles table
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bodyType: varchar("body_type", { length: 50 }),
  height: varchar("height", { length: 20 }),
  weight: varchar("weight", { length: 20 }),
  age: integer("age"),
  skinTone: varchar("skin_tone", { length: 50 }),
  hairColor: varchar("hair_color", { length: 50 }),
  eyeColor: varchar("eye_color", { length: 50 }),
  dailyActivity: varchar("daily_activity", { length: 100 }),
  comfortLevel: varchar("comfort_level", { length: 50 }),
  occasions: jsonb("occasions"),
  goals: jsonb("goals"),
  colorPreferences: jsonb("color_preferences"),
  colorAvoidances: jsonb("color_avoidances"),
  styleInspirations: varchar("style_inspirations", { length: 100 }),
  budget: varchar("budget", { length: 50 }),
  specialRequirements: text("special_requirements"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wardrobe items table
export const wardrobe = pgTable("wardrobe", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  color: varchar("color", { length: 100 }),
  pattern: varchar("pattern", { length: 100 }),
  material: varchar("material", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  season: varchar("season", { length: 50 }),
  occasion: varchar("occasion", { length: 100 }),
  condition: varchar("condition", { length: 50 }).default("good"),
  purchaseDate: timestamp("purchase_date"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  notes: text("notes"),
  imageUrl: varchar("image_url", { length: 500 }),
  tags: jsonb("tags"),
  isFavorite: boolean("is_favorite").default(false),
  wearCount: integer("wear_count").default(0),
  lastWorn: timestamp("last_worn"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Outfits table
export const outfits = pgTable("outfits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  occasion: varchar("occasion", { length: 100 }),
  season: varchar("season", { length: 50 }),
  mood: varchar("mood", { length: 50 }),
  weatherConditions: jsonb("weather_conditions"),
  items: jsonb("items"), // Array of wardrobe item IDs
  imageUrl: varchar("image_url", { length: 500 }),
  tags: jsonb("tags"),
  isFavorite: boolean("is_favorite").default(false),
  wearCount: integer("wear_count").default(0),
  lastWorn: timestamp("last_worn"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Style recommendations table
export const styleRecommendations = pgTable("style_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  recommendation: text("recommendation").notNull(),
  type: varchar("type", { length: 50 }), // 'outfit', 'purchase', 'style_tip'
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  reasoning: text("reasoning"),
  metadata: jsonb("metadata"),
  isAccepted: boolean("is_accepted"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User analytics table
export const userAnalytics = pgTable("user_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  styleScore: integer("style_score"),
  totalOutfits: integer("total_outfits").default(0),
  totalWardrobeItems: integer("total_wardrobe_items").default(0),
  favoriteColors: jsonb("favorite_colors"),
  mostWornCategories: jsonb("most_worn_categories"),
  averageOutfitRating: decimal("average_outfit_rating", { precision: 3, scale: 2 }),
  lastAnalysisDate: timestamp("last_analysis_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Auth-specific schemas
export const registerUserSchema = insertUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters").max(255),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
});

export const loginUserSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

// Types for auth schemas
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWardrobeSchema = createInsertSchema(wardrobe).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOutfitSchema = createInsertSchema(outfits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStyleRecommendationSchema = createInsertSchema(styleRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertUserAnalyticsSchema = createInsertSchema(userAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type WardrobeItem = typeof wardrobe.$inferSelect;
export type InsertWardrobeItem = z.infer<typeof insertWardrobeSchema>;

export type Outfit = typeof outfits.$inferSelect;
export type InsertOutfit = z.infer<typeof insertOutfitSchema>;

export type StyleRecommendation = typeof styleRecommendations.$inferSelect;
export type InsertStyleRecommendation = z.infer<typeof insertStyleRecommendationSchema>;

export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type InsertUserAnalytics = z.infer<typeof insertUserAnalyticsSchema>;