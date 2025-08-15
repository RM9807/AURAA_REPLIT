import {
  users,
  userProfiles,
  wardrobe,
  outfits,
  styleRecommendations,
  userAnalytics,
  type User,
  type InsertUser,
  type UserProfile,
  type InsertUserProfile,
  type WardrobeItem,
  type InsertWardrobeItem,
  type Outfit,
  type InsertOutfit,
  type StyleRecommendation,
  type InsertStyleRecommendation,
  type UserAnalytics,
  type InsertUserAnalytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;

  // User profile operations
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, updates: Partial<InsertUserProfile>): Promise<UserProfile>;

  // Wardrobe operations
  getUserWardrobe(userId: number): Promise<WardrobeItem[]>;
  createWardrobeItem(insertItem: InsertWardrobeItem): Promise<WardrobeItem>;
  getWardrobeItem(id: number): Promise<WardrobeItem | undefined>;
  updateWardrobeItem(id: number, updates: Partial<InsertWardrobeItem>): Promise<WardrobeItem>;
  deleteWardrobeItem(id: number): Promise<void>;

  // Outfit operations
  getUserOutfits(userId: number): Promise<Outfit[]>;
  createOutfit(insertOutfit: InsertOutfit): Promise<Outfit>;
  getOutfit(id: number): Promise<Outfit | undefined>;
  updateOutfit(id: number, updates: Partial<InsertOutfit>): Promise<Outfit>;
  deleteOutfit(id: number): Promise<void>;

  // Style recommendations
  getUserRecommendations(userId: number): Promise<StyleRecommendation[]>;
  createRecommendation(insertRecommendation: InsertStyleRecommendation): Promise<StyleRecommendation>;

  // User analytics
  getUserAnalytics(userId: number): Promise<UserAnalytics | undefined>;
  createUserAnalytics(insertAnalytics: InsertUserAnalytics): Promise<UserAnalytics>;
  updateUserAnalytics(userId: number, updates: Partial<InsertUserAnalytics>): Promise<UserAnalytics>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      or(
        eq(users.username, usernameOrEmail),
        eq(users.email, usernameOrEmail)
      )
    );
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password if provided
    let userData = { ...insertUser };
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // User profile operations
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const [profile] = await db
      .insert(userProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async updateUserProfile(userId: number, updates: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [profile] = await db
      .update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile;
  }

  // Wardrobe operations
  async getUserWardrobe(userId: number): Promise<WardrobeItem[]> {
    return await db
      .select()
      .from(wardrobe)
      .where(eq(wardrobe.userId, userId))
      .orderBy(desc(wardrobe.createdAt));
  }

  async createWardrobeItem(insertItem: InsertWardrobeItem): Promise<WardrobeItem> {
    const [item] = await db
      .insert(wardrobe)
      .values(insertItem)
      .returning();
    return item;
  }

  async getWardrobeItem(id: number): Promise<WardrobeItem | undefined> {
    const [item] = await db.select().from(wardrobe).where(eq(wardrobe.id, id));
    return item || undefined;
  }

  async updateWardrobeItem(id: number, updates: Partial<InsertWardrobeItem>): Promise<WardrobeItem> {
    const [item] = await db
      .update(wardrobe)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(wardrobe.id, id))
      .returning();
    return item;
  }

  async deleteWardrobeItem(id: number): Promise<void> {
    await db.delete(wardrobe).where(eq(wardrobe.id, id));
  }

  // Outfit operations
  async getUserOutfits(userId: number): Promise<Outfit[]> {
    return await db
      .select()
      .from(outfits)
      .where(eq(outfits.userId, userId))
      .orderBy(desc(outfits.createdAt));
  }

  async createOutfit(insertOutfit: InsertOutfit): Promise<Outfit> {
    const [outfit] = await db
      .insert(outfits)
      .values(insertOutfit)
      .returning();
    return outfit;
  }

  async getOutfit(id: number): Promise<Outfit | undefined> {
    const [outfit] = await db.select().from(outfits).where(eq(outfits.id, id));
    return outfit || undefined;
  }

  async updateOutfit(id: number, updates: Partial<InsertOutfit>): Promise<Outfit> {
    const [outfit] = await db
      .update(outfits)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(outfits.id, id))
      .returning();
    return outfit;
  }

  async deleteOutfit(id: number): Promise<void> {
    await db.delete(outfits).where(eq(outfits.id, id));
  }

  // Style recommendations
  async getUserRecommendations(userId: number): Promise<StyleRecommendation[]> {
    return await db
      .select()
      .from(styleRecommendations)
      .where(eq(styleRecommendations.userId, userId))
      .orderBy(desc(styleRecommendations.createdAt));
  }

  async createRecommendation(insertRecommendation: InsertStyleRecommendation): Promise<StyleRecommendation> {
    const [recommendation] = await db
      .insert(styleRecommendations)
      .values(insertRecommendation)
      .returning();
    return recommendation;
  }

  async deleteRecommendation(id: number): Promise<void> {
    await db
      .delete(styleRecommendations)
      .where(eq(styleRecommendations.id, id));
  }

  // User analytics
  async getUserAnalytics(userId: number): Promise<UserAnalytics | undefined> {
    const [analytics] = await db
      .select()
      .from(userAnalytics)
      .where(eq(userAnalytics.userId, userId));
    return analytics || undefined;
  }

  async createUserAnalytics(insertAnalytics: InsertUserAnalytics): Promise<UserAnalytics> {
    const [analytics] = await db
      .insert(userAnalytics)
      .values(insertAnalytics)
      .returning();
    return analytics;
  }

  async updateUserAnalytics(userId: number, updates: Partial<InsertUserAnalytics>): Promise<UserAnalytics> {
    const [analytics] = await db
      .update(userAnalytics)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userAnalytics.userId, userId))
      .returning();
    return analytics;
  }
}

export const storage = new DatabaseStorage();