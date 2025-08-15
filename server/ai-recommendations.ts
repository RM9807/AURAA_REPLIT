import OpenAI from "openai";
import { storage } from "./storage";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ComprehensiveRecommendationRequest {
  userId: number;
  includeStyleDNA?: boolean;
  includeWardrobeAnalysis?: boolean;
  includeOutfitSuggestions?: boolean;
  includeDeclutterAdvice?: boolean;
}

export interface StyleRecommendationResponse {
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  reasoning: string;
}

export async function generateComprehensiveRecommendations(
  request: ComprehensiveRecommendationRequest
): Promise<StyleRecommendationResponse[]> {
  try {
    const { userId } = request;

    // Fetch user data
    const [user, profile, wardrobeItems, outfits] = await Promise.all([
      storage.getUser(userId),
      storage.getUserProfile(userId),
      storage.getUserWardrobe(userId),
      storage.getUserOutfits(userId)
    ]);

    if (!user || !profile) {
      throw new Error("User or profile not found");
    }

    // Build comprehensive context for AI analysis
    const analysisContext = {
      userProfile: {
        bodyType: profile.bodyType,
        skinTone: profile.skinTone,
        colorPreferences: profile.colorPreferences,
        stylePersonality: profile.stylePersonality,
        lifestyle: profile.lifestyle,
        budgetRange: profile.budgetRange,
        fashionGoals: profile.fashionGoals,
        bodyInsecurities: profile.bodyInsecurities,
        culturalBackground: profile.culturalBackground,
        preferredBrands: profile.preferredBrands,
        avoidColors: profile.avoidColors,
        personalityTraits: profile.personalityTraits,
        climatePreference: profile.climatePreference,
        occasionTypes: profile.occasionTypes
      },
      wardrobe: {
        totalItems: wardrobeItems.length,
        categories: wardrobeItems.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        items: wardrobeItems.map(item => ({
          name: item.itemName,
          category: item.category,
          hasImage: !!(item.imageUrl || item.imagePath)
        }))
      },
      outfitHistory: {
        totalOutfits: outfits.length,
        occasions: outfits.map(outfit => outfit.occasion),
        recentOutfits: outfits.slice(-5).map(outfit => ({
          name: outfit.name,
          occasion: outfit.occasion,
          itemsCount: outfit.items.length
        }))
      }
    };

    // Generate comprehensive recommendations using OpenAI
    const prompt = `
You are AURAA's Expert Personal Stylist AI with 15+ years of luxury fashion consulting experience. Analyze this user's complete style profile and provide comprehensive personalized recommendations.

USER ANALYSIS:
${JSON.stringify(analysisContext, null, 2)}

TASK: Generate 8-12 personalized recommendations covering:

1. STYLE DNA OPTIMIZATION (2-3 recommendations)
   - Color palette refinements based on skin tone and preferences
   - Style personality enhancement suggestions
   - Body type optimization strategies

2. WARDROBE ANALYSIS & DECLUTTERING (2-3 recommendations)
   - Gap analysis: missing essential pieces
   - Decluttering advice: what to remove and why
   - Investment piece priorities

3. OUTFIT GENERATION INSIGHTS (2-3 recommendations)
   - Styling formulas for their lifestyle
   - Occasion-specific outfit strategies
   - Mix-and-match optimization for current wardrobe

4. PERSONALIZED SHOPPING GUIDANCE (2-3 recommendations)
   - Specific item recommendations with reasoning
   - Brand suggestions aligned with budget and style
   - Seasonal priorities and trend integration

REQUIREMENTS:
- Each recommendation must be highly specific to this user's data
- Include detailed reasoning based on their profile
- Assign priority levels: high (immediate action), medium (next 3 months), low (future consideration)
- Use their cultural background and lifestyle in recommendations
- Consider their budget range and fashion goals
- Address their body insecurities with positive, constructive advice

OUTPUT FORMAT: JSON array of recommendations, each with:
- type: category of recommendation
- title: compelling, specific title
- description: detailed, actionable advice (100-150 words)
- priority: "high", "medium", or "low"
- tags: relevant style tags
- reasoning: why this recommendation fits their profile (50-75 words)
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are AURAA's Expert Personal Stylist AI. Provide comprehensive, personalized fashion recommendations based on user data. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
    
    // Ensure we have recommendations in the expected format
    const recommendations = result.recommendations || result || [];
    
    // Validate and normalize recommendations
    return recommendations.map((rec: any) => ({
      type: rec.type || 'general',
      title: rec.title || 'Style Recommendation',
      description: rec.description || 'Personalized style advice',
      priority: ['high', 'medium', 'low'].includes(rec.priority) ? rec.priority : 'medium',
      tags: Array.isArray(rec.tags) ? rec.tags : [],
      reasoning: rec.reasoning || 'Based on your style profile analysis'
    }));

  } catch (error) {
    console.error("Error generating comprehensive recommendations:", error);
    
    // Return fallback recommendations if OpenAI fails
    return [
      {
        type: "style-analysis",
        title: "Complete Your Style Profile",
        description: "To receive personalized recommendations, please complete your style profile with more details about your preferences, lifestyle, and fashion goals.",
        priority: "high" as const,
        tags: ["profile", "getting-started"],
        reasoning: "A complete style profile enables more accurate and personalized recommendations."
      }
    ];
  }
}

export async function generateWardrrobeDeclutterRecommendations(userId: number): Promise<StyleRecommendationResponse[]> {
  try {
    const [profile, wardrobeItems] = await Promise.all([
      storage.getUserProfile(userId),
      storage.getUserWardrobe(userId)
    ]);

    if (!profile || wardrobeItems.length === 0) {
      return [{
        type: "wardrobe-declutter",
        title: "Build Your Digital Wardrobe First",
        description: "Start by digitizing your wardrobe items with photos. This will enable AI-powered decluttering recommendations based on your actual clothing collection.",
        priority: "high" as const,
        tags: ["wardrobe", "getting-started"],
        reasoning: "Decluttering recommendations require analysis of your actual wardrobe inventory."
      }];
    }

    const prompt = `
As AURAA's Wardrobe Optimization Expert, analyze this user's wardrobe for decluttering opportunities:

USER PROFILE:
- Body Type: ${profile.bodyType}
- Style Personality: ${profile.stylePersonality}
- Lifestyle: ${profile.lifestyle}
- Fashion Goals: ${profile.fashionGoals}

WARDROBE INVENTORY (${wardrobeItems.length} items):
${wardrobeItems.map(item => `- ${item.itemName} (${item.category})`).join('\n')}

TASK: Generate 3-5 specific decluttering recommendations covering:
1. Items to remove and why
2. Categories that are over/under-represented
3. Quality vs. quantity optimization
4. Seasonal organization strategies
5. Investment piece priorities

Focus on practical, actionable advice that aligns with their style goals and lifestyle needs.

Respond with JSON format: {"recommendations": [...]
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a wardrobe decluttering expert. Provide specific, actionable advice for optimizing clothing collections."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
    const recommendations = result.recommendations || [];

    return recommendations.map((rec: any) => ({
      type: "wardrobe-declutter",
      title: rec.title || 'Wardrobe Optimization',
      description: rec.description || 'Decluttering advice',
      priority: rec.priority || 'medium',
      tags: [...(rec.tags || []), 'declutter', 'wardrobe'],
      reasoning: rec.reasoning || 'Based on wardrobe analysis'
    }));

  } catch (error) {
    console.error("Error generating declutter recommendations:", error);
    return [];
  }
}