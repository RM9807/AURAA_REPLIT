import {
  users,
  userProfiles,
  outfits,
  wardrobe,
  styleRecommendations,
  userAnalytics,
  colorPalettes,
  outfitSuggestions,
  wardrobeAR,
  moodBoards,
  fashionInsights,
  type User,
  type InsertUser,
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
  type Outfit,
  type InsertOutfit,
  type WardrobeItem,
  type InsertWardrobeItem,
  type StyleRecommendation,
  type InsertStyleRecommendation,
  type UserAnalytics,
  type InsertUserAnalytics,
  type ColorPalette,
  type InsertColorPalette,
  type OutfitSuggestion,
  type InsertOutfitSuggestion,
  type WardrobeAR,
  type InsertWardrobeAR,
  type MoodBoard,
  type InsertMoodBoard,
  type FashionInsight,
  type InsertFashionInsight,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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
  
  // Color palette methods
  getUserColorPalettes(userId: number): Promise<ColorPalette[]>;
  createColorPalette(palette: InsertColorPalette): Promise<ColorPalette>;
  getActiveColorPalette(userId: number): Promise<ColorPalette | undefined>;
  setActiveColorPalette(userId: number, paletteId: number): Promise<ColorPalette>;
  
  // Outfit suggestion methods
  getUserOutfitSuggestions(userId: number): Promise<OutfitSuggestion[]>;
  createOutfitSuggestion(suggestion: InsertOutfitSuggestion): Promise<OutfitSuggestion>;
  acceptOutfitSuggestion(suggestionId: number): Promise<OutfitSuggestion>;
  
  // AR wardrobe methods
  getWardrobeItemAR(wardrobeItemId: number): Promise<WardrobeAR | undefined>;
  createWardrobeAR(arData: InsertWardrobeAR): Promise<WardrobeAR>;
  updateWardrobeAR(id: number, arData: Partial<InsertWardrobeAR>): Promise<WardrobeAR>;
  
  // Mood board methods
  getUserMoodBoards(userId: number): Promise<MoodBoard[]>;
  createMoodBoard(moodBoard: InsertMoodBoard): Promise<MoodBoard>;
  getPublicMoodBoards(): Promise<MoodBoard[]>;
  likeMoodBoard(id: number): Promise<MoodBoard>;
  
  // Fashion insights methods
  getUserFashionInsights(userId: number): Promise<FashionInsight[]>;
  createFashionInsight(insight: InsertFashionInsight): Promise<FashionInsight>;
  getLatestInsight(userId: number): Promise<FashionInsight | undefined>;
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

  // Color Palette Methods
  async getUserColorPalettes(userId: number): Promise<ColorPalette[]> {
    return await db.select().from(colorPalettes).where(eq(colorPalettes.userId, userId));
  }

  async createColorPalette(palette: InsertColorPalette): Promise<ColorPalette> {
    const [created] = await db.insert(colorPalettes).values(palette).returning();
    return created;
  }

  async getActiveColorPalette(userId: number): Promise<ColorPalette | undefined> {
    const [palette] = await db
      .select()
      .from(colorPalettes)
      .where(and(eq(colorPalettes.userId, userId), eq(colorPalettes.isActive, true)));
    return palette;
  }

  async setActiveColorPalette(userId: number, paletteId: number): Promise<ColorPalette> {
    // Deactivate all palettes for user
    await db
      .update(colorPalettes)
      .set({ isActive: false })
      .where(eq(colorPalettes.userId, userId));
    
    // Activate the selected palette
    const [updated] = await db
      .update(colorPalettes)
      .set({ isActive: true })
      .where(eq(colorPalettes.id, paletteId))
      .returning();
    return updated;
  }

  // Outfit Suggestion Methods
  async getUserOutfitSuggestions(userId: number): Promise<OutfitSuggestion[]> {
    return await db.select().from(outfitSuggestions).where(eq(outfitSuggestions.userId, userId));
  }

  async createOutfitSuggestion(suggestion: InsertOutfitSuggestion): Promise<OutfitSuggestion> {
    const [created] = await db.insert(outfitSuggestions).values(suggestion).returning();
    return created;
  }

  async acceptOutfitSuggestion(suggestionId: number): Promise<OutfitSuggestion> {
    const [updated] = await db
      .update(outfitSuggestions)
      .set({ isAccepted: true })
      .where(eq(outfitSuggestions.id, suggestionId))
      .returning();
    return updated;
  }

  // AR Wardrobe Methods
  async getWardrobeItemAR(wardrobeItemId: number): Promise<WardrobeAR | undefined> {
    const [ar] = await db
      .select()
      .from(wardrobeAR)
      .where(eq(wardrobeAR.wardrobeItemId, wardrobeItemId));
    return ar;
  }

  async createWardrobeAR(arData: InsertWardrobeAR): Promise<WardrobeAR> {
    const [created] = await db.insert(wardrobeAR).values(arData).returning();
    return created;
  }

  async updateWardrobeAR(id: number, arData: Partial<InsertWardrobeAR>): Promise<WardrobeAR> {
    const [updated] = await db
      .update(wardrobeAR)
      .set(arData)
      .where(eq(wardrobeAR.id, id))
      .returning();
    return updated;
  }

  // Mood Board Methods
  async getUserMoodBoards(userId: number): Promise<MoodBoard[]> {
    return await db.select().from(moodBoards).where(eq(moodBoards.userId, userId));
  }

  async createMoodBoard(moodBoard: InsertMoodBoard): Promise<MoodBoard> {
    const [created] = await db.insert(moodBoards).values(moodBoard).returning();
    return created;
  }

  async getPublicMoodBoards(): Promise<MoodBoard[]> {
    return await db.select().from(moodBoards).where(eq(moodBoards.isPublic, true));
  }

  async likeMoodBoard(id: number): Promise<MoodBoard> {
    const [current] = await db.select().from(moodBoards).where(eq(moodBoards.id, id));
    const [updated] = await db
      .update(moodBoards)
      .set({ likes: (current?.likes || 0) + 1 })
      .where(eq(moodBoards.id, id))
      .returning();
    return updated;
  }

  // Fashion Insights Methods
  async getUserFashionInsights(userId: number): Promise<FashionInsight[]> {
    return await db.select().from(fashionInsights).where(eq(fashionInsights.userId, userId));
  }

  async createFashionInsight(insight: InsertFashionInsight): Promise<FashionInsight> {
    const [created] = await db.insert(fashionInsights).values(insight).returning();
    return created;
  }

  async getLatestInsight(userId: number): Promise<FashionInsight | undefined> {
    const [latest] = await db
      .select()
      .from(fashionInsights)
      .where(eq(fashionInsights.userId, userId))
      .orderBy(fashionInsights.createdAt)
      .limit(1);
    return latest;
  }
}

export const storage = new DatabaseStorage();
