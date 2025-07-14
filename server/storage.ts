import { users, userProfiles, outfits, wardrobe, styleRecommendations, userAnalytics, type User, type InsertUser, type UpsertUser, type UserProfile, type InsertUserProfile, type Outfit, type InsertOutfit, type WardrobeItem, type InsertWardrobeItem, type StyleRecommendation, type InsertStyleRecommendation, type UserAnalytics, type InsertUserAnalytics } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser & { id?: number }): Promise<User>;
  
  // User profile methods
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Outfit methods
  getUserOutfits(userId: number): Promise<Outfit[]>;
  createOutfit(outfit: InsertOutfit): Promise<Outfit>;
  getOutfit(id: number): Promise<Outfit | undefined>;
  
  // Wardrobe methods
  getUserWardrobe(userId: number): Promise<WardrobeItem[]>;
  createWardrobeItem(item: InsertWardrobeItem): Promise<WardrobeItem>;
  getWardrobeItem(id: number): Promise<WardrobeItem | undefined>;
  updateWardrobeItem(id: number, item: Partial<InsertWardrobeItem>): Promise<WardrobeItem>;
  
  // Style recommendation methods
  getUserRecommendations(userId: number): Promise<StyleRecommendation[]>;
  createRecommendation(recommendation: InsertStyleRecommendation): Promise<StyleRecommendation>;
  updateRecommendation(id: number, recommendation: Partial<InsertStyleRecommendation>): Promise<StyleRecommendation>;
  
  // User analytics methods
  getUserAnalytics(userId: number): Promise<UserAnalytics | undefined>;
  createUserAnalytics(analytics: InsertUserAnalytics): Promise<UserAnalytics>;
  updateUserAnalytics(userId: number, analytics: Partial<InsertUserAnalytics>): Promise<UserAnalytics>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // User profile methods
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Outfit methods
  async getUserOutfits(userId: number): Promise<Outfit[]> {
    return await db.select().from(outfits).where(eq(outfits.userId, userId));
  }

  async createOutfit(outfit: InsertOutfit): Promise<Outfit> {
    const [newOutfit] = await db
      .insert(outfits)
      .values(outfit)
      .returning();
    return newOutfit;
  }

  async getOutfit(id: number): Promise<Outfit | undefined> {
    const [outfit] = await db.select().from(outfits).where(eq(outfits.id, id));
    return outfit || undefined;
  }

  // Wardrobe methods
  async getUserWardrobe(userId: number): Promise<WardrobeItem[]> {
    return await db.select().from(wardrobe).where(eq(wardrobe.userId, userId));
  }

  async createWardrobeItem(item: InsertWardrobeItem): Promise<WardrobeItem> {
    const [newItem] = await db
      .insert(wardrobe)
      .values(item)
      .returning();
    return newItem;
  }

  async getWardrobeItem(id: number): Promise<WardrobeItem | undefined> {
    const [item] = await db.select().from(wardrobe).where(eq(wardrobe.id, id));
    return item || undefined;
  }

  async updateWardrobeItem(id: number, item: Partial<InsertWardrobeItem>): Promise<WardrobeItem> {
    const [updatedItem] = await db
      .update(wardrobe)
      .set(item)
      .where(eq(wardrobe.id, id))
      .returning();
    return updatedItem;
  }

  // Style recommendation methods
  async getUserRecommendations(userId: number): Promise<StyleRecommendation[]> {
    return await db.select().from(styleRecommendations).where(eq(styleRecommendations.userId, userId));
  }

  async createRecommendation(recommendation: InsertStyleRecommendation): Promise<StyleRecommendation> {
    const [newRecommendation] = await db
      .insert(styleRecommendations)
      .values(recommendation)
      .returning();
    return newRecommendation;
  }

  async updateRecommendation(id: number, recommendation: Partial<InsertStyleRecommendation>): Promise<StyleRecommendation> {
    const [updatedRecommendation] = await db
      .update(styleRecommendations)
      .set(recommendation)
      .where(eq(styleRecommendations.id, id))
      .returning();
    return updatedRecommendation;
  }

  // User analytics methods
  async getUserAnalytics(userId: number): Promise<UserAnalytics | undefined> {
    const [analytics] = await db.select().from(userAnalytics).where(eq(userAnalytics.userId, userId));
    return analytics || undefined;
  }

  async createUserAnalytics(analytics: InsertUserAnalytics): Promise<UserAnalytics> {
    const [newAnalytics] = await db
      .insert(userAnalytics)
      .values(analytics)
      .returning();
    return newAnalytics;
  }

  async updateUserAnalytics(userId: number, analytics: Partial<InsertUserAnalytics>): Promise<UserAnalytics> {
    const [updatedAnalytics] = await db
      .update(userAnalytics)
      .set(analytics)
      .where(eq(userAnalytics.userId, userId))
      .returning();
    return updatedAnalytics;
  }

  async upsertUser(userData: UpsertUser & { id?: number }): Promise<User> {
    if (userData.id) {
      // Check if user exists
      const existingUser = await this.getUser(userData.id);
      if (existingUser) {
        // Update existing user
        const [user] = await db
          .update(users)
          .set({
            ...userData,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userData.id))
          .returning();
        return user;
      }
    }

    // Create new user
    const [user] = await db
      .insert(users)
      .values({
        username: userData.username || userData.email || `user_${Date.now()}`,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        password: userData.password,
      })
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
