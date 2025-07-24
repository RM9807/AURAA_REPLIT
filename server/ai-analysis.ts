import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface StyleAnalysisInput {
  // Basic Info
  gender: string;
  age: string;
  height: string;
  bodyType: string;
  
  // Lifestyle & Activity
  dailyActivity: string;
  comfortLevel: string;
  lifestyle: string;
  
  // Style Preferences
  occasions: string[];
  styleInspirations: string;
  budget: string;
  
  // Color Preferences
  colorPreferences: string[];
  colorAvoidances: string[];
  
  // Goals
  goals: string[];
  
  // Optional photo analysis data
  skinTone?: string;
  hairColor?: string;
  eyeColor?: string;
}

export interface StyleDNAResult {
  styleDNA: {
    primaryStyle: string;
    secondaryStyle: string;
    styleDescription: string;
    confidenceScore: number;
  };
  colorPalette: {
    seasonalType: string;
    bestColors: string[];
    colorsToAvoid: string[];
    neutrals: string[];
    accents: string[];
  };
  bodyAnalysis: {
    bodyTypeConfirmation: string;
    bestSilhouettes: string[];
    proportionTips: string[];
    fitGuidance: string[];
  };
  personalizedTips: {
    shoppingGuide: string[];
    stylingTips: string[];
    wardrobeEssentials: string[];
    occasionSpecific: { [occasion: string]: string[] };
  };
  confidenceBoost: {
    strengthAreas: string[];
    improvementAreas: string[];
    actionPlan: string[];
  };
  overallRecommendation: string;
}

export async function analyzeStyleProfile(input: StyleAnalysisInput): Promise<StyleDNAResult> {
  try {
    const prompt = `You are an expert AI stylist and fashion consultant. Analyze this user's style profile and provide a comprehensive Style DNA analysis.

User Profile:
- Gender: ${input.gender}
- Age: ${input.age}
- Height: ${input.height}
- Body Type: ${input.bodyType}
- Daily Activity: ${input.dailyActivity}
- Comfort Level: ${input.comfortLevel}
- Lifestyle: ${input.lifestyle}
- Occasions: ${input.occasions.join(', ')}
- Style Inspirations: ${input.styleInspirations}
- Budget: ${input.budget}
- Color Preferences: ${input.colorPreferences.join(', ')}
- Colors to Avoid: ${input.colorAvoidances.join(', ')}
- Style Goals: ${input.goals.join(', ')}
${input.skinTone ? `- Skin Tone: ${input.skinTone}` : ''}
${input.hairColor ? `- Hair Color: ${input.hairColor}` : ''}
${input.eyeColor ? `- Eye Color: ${input.eyeColor}` : ''}

Please provide a detailed analysis in JSON format with the following structure:
{
  "styleDNA": {
    "primaryStyle": "Main style category (e.g., Classic, Bohemian, Modern)",
    "secondaryStyle": "Secondary style influence",
    "styleDescription": "Detailed description of their unique style DNA",
    "confidenceScore": "Confidence level 0.0-1.0"
  },
  "colorPalette": {
    "seasonalType": "Spring/Summer/Autumn/Winter",
    "bestColors": ["Array of 6-8 best colors"],
    "colorsToAvoid": ["Array of colors to avoid"],
    "neutrals": ["Array of neutral colors"],
    "accents": ["Array of accent colors"]
  },
  "bodyAnalysis": {
    "bodyTypeConfirmation": "Confirmation or refinement of body type",
    "bestSilhouettes": ["Array of flattering silhouettes"],
    "proportionTips": ["Array of proportion-enhancing tips"],
    "fitGuidance": ["Array of fit guidelines"]
  },
  "personalizedTips": {
    "shoppingGuide": ["Array of shopping recommendations"],
    "stylingTips": ["Array of styling tips"],
    "wardrobeEssentials": ["Array of essential items"],
    "occasionSpecific": {
      "work": ["Work-specific tips"],
      "casual": ["Casual tips"],
      "formal": ["Formal tips"]
    }
  },
  "confidenceBoost": {
    "strengthAreas": ["Areas where they're already doing well"],
    "improvementAreas": ["Areas for gentle improvement"],
    "actionPlan": ["Specific actionable steps"]
  },
  "overallRecommendation": "Overall summary and encouragement"
}

Provide specific, actionable advice that's tailored to their lifestyle, budget, and goals. Be encouraging and positive while providing practical guidance.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert fashion stylist and personal style consultant with deep knowledge of color theory, body types, and style psychology. Provide detailed, personalized analysis that helps users feel confident and stylish."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const analysisResult = JSON.parse(response.choices[0].message.content || '{}');
    return analysisResult as StyleDNAResult;

  } catch (error) {
    console.error("Error analyzing style profile:", error);
    throw new Error("Failed to analyze style profile: " + (error as Error).message);
  }
}

export async function analyzePhotosForColorAnalysis(base64Image: string): Promise<{
  skinTone: string;
  hairColor: string;
  eyeColor: string;
  colorAnalysis: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert color analyst and stylist. Analyze the person's features in the photo to determine their best colors based on skin tone, hair, and eye color."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this photo and provide color analysis in JSON format: { \"skinTone\": \"warm/cool/neutral undertone description\", \"hairColor\": \"hair color description\", \"eyeColor\": \"eye color description\", \"colorAnalysis\": \"detailed analysis of best color palette\" }"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const colorAnalysis = JSON.parse(response.choices[0].message.content || '{}');
    return colorAnalysis;

  } catch (error) {
    console.error("Error analyzing photos:", error);
    throw new Error("Failed to analyze photos: " + (error as Error).message);
  }
}

export async function generateStyleRecommendations(
  userProfile: any,
  wardrobeItems: any[],
  styleGoals: string[]
): Promise<{
  recommendations: Array<{
    type: 'purchase' | 'style_tip' | 'outfit_idea';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    confidence: number;
    reasoning: string;
  }>;
}> {
  try {
    const prompt = `Based on this user's style profile and current wardrobe, generate personalized recommendations.

User Profile: ${JSON.stringify(userProfile, null, 2)}
Current Wardrobe: ${JSON.stringify(wardrobeItems, null, 2)}
Style Goals: ${styleGoals.join(', ')}

Provide specific recommendations in JSON format:
{
  "recommendations": [
    {
      "type": "purchase/style_tip/outfit_idea",
      "title": "Brief recommendation title",
      "description": "Detailed description",
      "priority": "high/medium/low",
      "confidence": 0.0-1.0,
      "reasoning": "Why this recommendation makes sense"
    }
  ]
}

Focus on actionable advice that helps them achieve their style goals within their budget and lifestyle.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a personal stylist creating tailored recommendations based on individual profiles and wardrobes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const recommendations = JSON.parse(response.choices[0].message.content || '{}');
    return recommendations;

  } catch (error) {
    console.error("Error generating recommendations:", error);
    throw new Error("Failed to generate recommendations: " + (error as Error).message);
  }
}