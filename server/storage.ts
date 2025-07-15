import {
  users,
  userProfiles,
  outfits,
  wardrobe,
  styleRecommendations,
  userAnalytics,
  outfitSuggestions,
  photoUploads,
  userSettings,
  styleSessions,
  outfitCollections,
  wishlistItems,
  userActivities,
  styleInsights,
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
  type OutfitSuggestion,
  type InsertOutfitSuggestion,
  type PhotoUpload,
  type InsertPhotoUpload,
  type UserSettings,
  type InsertUserSettings,
  type StyleSession,
  type InsertStyleSession,
  type OutfitCollection,
  type InsertOutfitCollection,
  type WishlistItem,
  type InsertWishlistItem,
  type UserActivity,
  type InsertUserActivity,
  type StyleInsight,
  type InsertStyleInsight,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

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
  
  // Outfit suggestion methods
  getUserOutfitSuggestions(userId: number): Promise<OutfitSuggestion[]>;
  createOutfitSuggestion(suggestion: InsertOutfitSuggestion): Promise<OutfitSuggestion>;
  acceptOutfitSuggestion(suggestionId: number): Promise<OutfitSuggestion>;
  
  // Photo upload methods
  getUserPhotoUploads(userId: number): Promise<PhotoUpload[]>;
  createPhotoUpload(photo: InsertPhotoUpload): Promise<PhotoUpload>;
  getPhotoUpload(id: number): Promise<PhotoUpload | undefined>;
  deletePhotoUpload(id: number): Promise<void>;
  
  // User settings methods
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings>;
  
  // Style session methods
  getUserStyleSessions(userId: number): Promise<StyleSession[]>;
  createStyleSession(session: InsertStyleSession): Promise<StyleSession>;
  updateStyleSession(id: number, session: Partial<InsertStyleSession>): Promise<StyleSession>;
  getStyleSession(id: number): Promise<StyleSession | undefined>;
  
  // Outfit collection methods
  getUserOutfitCollections(userId: number): Promise<OutfitCollection[]>;
  createOutfitCollection(collection: InsertOutfitCollection): Promise<OutfitCollection>;
  updateOutfitCollection(id: number, collection: Partial<InsertOutfitCollection>): Promise<OutfitCollection>;
  getOutfitCollection(id: number): Promise<OutfitCollection | undefined>;
  
  // Wishlist methods
  getUserWishlistItems(userId: number): Promise<WishlistItem[]>;
  createWishlistItem(item: InsertWishlistItem): Promise<WishlistItem>;
  updateWishlistItem(id: number, item: Partial<InsertWishlistItem>): Promise<WishlistItem>;
  deleteWishlistItem(id: number): Promise<void>;
  
  // User activity methods
  getUserActivities(userId: number): Promise<UserActivity[]>;
  createUserActivity(activity: InsertUserActivity): Promise<UserActivity>;
  
  // Style insight methods
  getUserStyleInsights(userId: number): Promise<StyleInsight[]>;
  createStyleInsight(insight: InsertStyleInsight): Promise<StyleInsight>;
  markInsightAsRead(id: number): Promise<StyleInsight>;
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
    const profiles = await db.select().from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    // Return the most recent profile (highest id)
    return profiles.length > 0 ? profiles[profiles.length - 1] : undefined;
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

  // Photo upload methods
  async getUserPhotoUploads(userId: number): Promise<PhotoUpload[]> {
    return await db.select().from(photoUploads).where(eq(photoUploads.userId, userId));
  }

  async createPhotoUpload(photo: InsertPhotoUpload): Promise<PhotoUpload> {
    const [newPhoto] = await db
      .insert(photoUploads)
      .values(photo)
      .returning();
    return newPhoto;
  }

  async getPhotoUpload(id: number): Promise<PhotoUpload | undefined> {
    const [photo] = await db.select().from(photoUploads).where(eq(photoUploads.id, id));
    return photo || undefined;
  }

  async deletePhotoUpload(id: number): Promise<void> {
    await db.delete(photoUploads).where(eq(photoUploads.id, id));
  }

  // User settings methods
  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings || undefined;
  }

  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [newSettings] = await db
      .insert(userSettings)
      .values(settings)
      .returning();
    return newSettings;
  }

  async updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings> {
    const [updatedSettings] = await db
      .update(userSettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId))
      .returning();
    return updatedSettings;
  }

  // Style session methods
  async getUserStyleSessions(userId: number): Promise<StyleSession[]> {
    return await db.select().from(styleSessions).where(eq(styleSessions.userId, userId));
  }

  async createStyleSession(session: InsertStyleSession): Promise<StyleSession> {
    const [newSession] = await db
      .insert(styleSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateStyleSession(id: number, session: Partial<InsertStyleSession>): Promise<StyleSession> {
    const [updatedSession] = await db
      .update(styleSessions)
      .set(session)
      .where(eq(styleSessions.id, id))
      .returning();
    return updatedSession;
  }

  async getStyleSession(id: number): Promise<StyleSession | undefined> {
    const [session] = await db.select().from(styleSessions).where(eq(styleSessions.id, id));
    return session || undefined;
  }

  // Outfit collection methods
  async getUserOutfitCollections(userId: number): Promise<OutfitCollection[]> {
    return await db.select().from(outfitCollections).where(eq(outfitCollections.userId, userId));
  }

  async createOutfitCollection(collection: InsertOutfitCollection): Promise<OutfitCollection> {
    const [newCollection] = await db
      .insert(outfitCollections)
      .values(collection)
      .returning();
    return newCollection;
  }

  async updateOutfitCollection(id: number, collection: Partial<InsertOutfitCollection>): Promise<OutfitCollection> {
    const [updatedCollection] = await db
      .update(outfitCollections)
      .set({ ...collection, updatedAt: new Date() })
      .where(eq(outfitCollections.id, id))
      .returning();
    return updatedCollection;
  }

  async getOutfitCollection(id: number): Promise<OutfitCollection | undefined> {
    const [collection] = await db.select().from(outfitCollections).where(eq(outfitCollections.id, id));
    return collection || undefined;
  }

  // Wishlist methods
  async getUserWishlistItems(userId: number): Promise<WishlistItem[]> {
    return await db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId));
  }

  async createWishlistItem(item: InsertWishlistItem): Promise<WishlistItem> {
    const [newItem] = await db
      .insert(wishlistItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateWishlistItem(id: number, item: Partial<InsertWishlistItem>): Promise<WishlistItem> {
    const [updatedItem] = await db
      .update(wishlistItems)
      .set(item)
      .where(eq(wishlistItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteWishlistItem(id: number): Promise<void> {
    await db.delete(wishlistItems).where(eq(wishlistItems.id, id));
  }

  // User activity methods
  async getUserActivities(userId: number): Promise<UserActivity[]> {
    return await db.select().from(userActivities).where(eq(userActivities.userId, userId));
  }

  async createUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const [newActivity] = await db
      .insert(userActivities)
      .values(activity)
      .returning();
    return newActivity;
  }

  // Style insight methods
  async getUserStyleInsights(userId: number): Promise<StyleInsight[]> {
    return await db.select().from(styleInsights).where(eq(styleInsights.userId, userId));
  }

  async createStyleInsight(insight: InsertStyleInsight): Promise<StyleInsight> {
    const [newInsight] = await db
      .insert(styleInsights)
      .values(insight)
      .returning();
    return newInsight;
  }

  async markInsightAsRead(id: number): Promise<StyleInsight> {
    const [insight] = await db
      .update(styleInsights)
      .set({ isRead: true })
      .where(eq(styleInsights.id, id))
      .returning();
    return insight;
  }
}

export const storage = new DatabaseStorage();
