import OpenAI from "openai";
import type { wardrobe, userProfiles } from "../shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface OutfitGenerationRequest {
  occasion: string;
  weather?: string;
  mood?: string;
  season?: string;
  preferences?: string;
}

export interface GeneratedOutfit {
  name: string;
  description: string;
  items: number[]; // Array of wardrobe item IDs
  occasion: string;
  season?: string;
  mood?: string;
  weatherConditions?: any;
  tags: string[];
  reasoning: string;
}

export class OutfitGenerator {
  /**
   * Generate outfit suggestions based on user's wardrobe inventory and Style DNA
   */
  async generateOutfits(
    wardrobeItems: (typeof wardrobe.$inferSelect)[],
    userProfile: typeof userProfiles.$inferSelect,
    request: OutfitGenerationRequest,
    numberOfOutfits: number = 3
  ): Promise<GeneratedOutfit[]> {
    if (!wardrobeItems.length) {
      throw new Error("No wardrobe items available for outfit generation");
    }

    // Prepare wardrobe data for AI analysis
    const wardrobeData = wardrobeItems.map(item => {
      let aiAnalysis = null;
      if (item.aiAnalysis) {
        try {
          // Handle both string and object formats
          aiAnalysis = typeof item.aiAnalysis === 'string' 
            ? JSON.parse(item.aiAnalysis) 
            : item.aiAnalysis;
        } catch (error) {
          console.log(`Failed to parse AI analysis for item ${item.id}:`, error);
          aiAnalysis = null;
        }
      }
      
      return {
        id: item.id,
        name: item.itemName,
        category: item.category,
        color: item.color,
        pattern: item.pattern,
        material: item.material,
        brand: item.brand,
        condition: item.condition,
        aiAnalysis
      };
    });

    // Create comprehensive prompt for outfit generation
    const prompt = this.buildOutfitGenerationPrompt(
      wardrobeData,
      userProfile,
      request,
      numberOfOutfits
    );

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are AURAA's expert AI stylist with 15+ years of professional styling experience. 
            Your expertise includes color theory, body proportions, fashion psychology, and strategic wardrobe planning.
            You create outfit combinations using ONLY the provided wardrobe items, ensuring each suggestion is:
            - Appropriate for the specified occasion and conditions
            - Aligned with the user's Style DNA and body type
            - Practically wearable and well-coordinated
            - Confident and empowering for the user

            Always respond with valid JSON in the specified format.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!result.outfits || !Array.isArray(result.outfits)) {
        throw new Error("Invalid response format from AI");
      }

      return result.outfits;
    } catch (error) {
      console.error("Error generating outfits:", error);
      throw new Error("Failed to generate outfits. Please try again.");
    }
  }

  private buildOutfitGenerationPrompt(
    wardrobeData: any[],
    userProfile: typeof userProfiles.$inferSelect,
    request: OutfitGenerationRequest,
    numberOfOutfits: number
  ): string {
    return `
Generate ${numberOfOutfits} outfit combinations using ONLY the provided wardrobe items.

## USER PROFILE & STYLE DNA
Body Type: ${userProfile.bodyType}
Height: ${userProfile.height}
Age: ${userProfile.age}
Daily Activity: ${userProfile.dailyActivity}
Comfort Level: ${userProfile.comfortLevel}
Style DNA: ${JSON.stringify(userProfile.styleDNA)}
Color Preferences: ${JSON.stringify(userProfile.colorPreferences)}
Color Avoidances: ${JSON.stringify(userProfile.colorAvoidances)}
Goals: ${JSON.stringify(userProfile.goals)}

## WARDROBE INVENTORY
${wardrobeData.map(item => `
- ID: ${item.id}
  Name: ${item.name}
  Category: ${item.category}
  Color: ${item.color || 'Not specified'}
  Pattern: ${item.pattern || 'Not specified'}
  Material: ${item.material || 'Not specified'}
  Brand: ${item.brand || 'Not specified'}
  AI Analysis: ${item.aiAnalysis ? JSON.stringify(item.aiAnalysis) : 'Not analyzed'}
`).join('')}

## OUTFIT REQUEST
Occasion: ${request.occasion}
Weather: ${request.weather || 'Not specified'}
Mood: ${request.mood || 'Not specified'}
Season: ${request.season || 'Not specified'}
Additional Preferences: ${request.preferences || 'None'}

## INSTRUCTIONS
1. Create outfit combinations using ONLY the item IDs from the wardrobe inventory above
2. Ensure each outfit is appropriate for the specified occasion and conditions
3. Consider the user's Style DNA, body type, and color preferences
4. Each outfit should be practical and achievable with the available items
5. Provide styling reasoning for each combination
6. Include relevant tags for easy categorization

Respond with JSON in this exact format:
{
  "outfits": [
    {
      "name": "Outfit name",
      "description": "Detailed description of the look and styling",
      "items": [1, 2, 3], // Array of wardrobe item IDs only
      "occasion": "${request.occasion}",
      "season": "${request.season || 'All seasons'}",
      "mood": "${request.mood || 'Confident'}",
      "weatherConditions": ${request.weather ? `{"weather": "${request.weather}"}` : 'null'},
      "tags": ["tag1", "tag2", "tag3"],
      "reasoning": "Detailed explanation of why these items work together and suit the user"
    }
  ]
}

CRITICAL: Only use item IDs that exist in the wardrobe inventory provided above.
`;
  }

  /**
   * Generate outfit suggestions for multiple occasions
   */
  async generateWeeklyOutfits(
    wardrobeItems: (typeof wardrobe.$inferSelect)[],
    userProfile: typeof userProfiles.$inferSelect,
    occasions: string[]
  ): Promise<GeneratedOutfit[]> {
    const allOutfits: GeneratedOutfit[] = [];

    for (const occasion of occasions) {
      try {
        const outfits = await this.generateOutfits(
          wardrobeItems,
          userProfile,
          { occasion },
          2 // 2 outfits per occasion
        );
        allOutfits.push(...outfits);
      } catch (error) {
        console.error(`Error generating outfits for ${occasion}:`, error);
      }
    }

    return allOutfits;
  }

  /**
   * Generate seasonal outfit suggestions
   */
  async generateSeasonalOutfits(
    wardrobeItems: (typeof wardrobe.$inferSelect)[],
    userProfile: typeof userProfiles.$inferSelect,
    season: string
  ): Promise<GeneratedOutfit[]> {
    const occasions = ["Work", "Casual", "Date night", "Weekend"];
    const seasonalOutfits: GeneratedOutfit[] = [];

    for (const occasion of occasions) {
      try {
        const outfits = await this.generateOutfits(
          wardrobeItems,
          userProfile,
          { occasion, season },
          1
        );
        seasonalOutfits.push(...outfits);
      } catch (error) {
        console.error(`Error generating ${season} outfits for ${occasion}:`, error);
      }
    }

    return seasonalOutfits;
  }
}

export const outfitGenerator = new OutfitGenerator();