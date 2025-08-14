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
    colorExplanation?: string;
  };
  bodyAnalysis: {
    bodyTypeConfirmation: string;
    bestSilhouettes: string[];
    proportionTips: string[];
    fitGuidance: string[];
    fabricRecommendations?: string[];
    heightConsiderations?: string;
  };
  personalizedTips: {
    shoppingGuide: string[];
    stylingTips: string[];
    wardrobeEssentials: string[];
    occasionSpecific: { [occasion: string]: string[] };
    brandRecommendations?: string[];
    seasonalStrategy?: string;
  };
  confidenceBoost: {
    strengthAreas: string[];
    improvementAreas: string[];
    actionPlan: string[];
    psychologyTips?: string[];
    quickWins?: string[];
  };
  goalAlignment?: { [goal: string]: string };
  budgetOptimization?: {
    priorityPurchases: string[];
    costPerWear: string[];
    savingStrategies: string[];
  };
  overallRecommendation: string;
}

// Wardrobe Analysis Types
export interface WardrobeItem {
  id: number;
  itemName: string;
  category: string;
  color: string | null;
  pattern?: string | null;
  material?: string | null;
  brand?: string | null;
  season?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
}

export interface WardrobeAnalysisResult {
  itemAnalysis: {
    id: number;
    styleAlignment: number; // 1-100 score
    colorMatch: number; // 1-100 score
    versatility: number; // 1-100 score
    quality: number; // 1-100 score
    fitAssessment: string;
    recommendation: 'keep' | 'alter' | 'donate';
    reason: string;
    improvementSuggestions?: string[];
    outfitPairings?: string[];
  }[];
  wardrobeOverview: {
    totalItems: number;
    keepItems: number;
    alterItems: number;
    donateItems: number;
    gapAnalysis: string[];
    priorityPurchases: string[];
    overallScore: number;
    styleConsistency: number;
  };
  recommendations: {
    declutterPlan: string[];
    organizationTips: string[];
    seasonalRotation: string[];
    budgetOptimization: string[];
  };
}

export async function analyzeWardrobe(
  items: WardrobeItem[], 
  userProfile: StyleAnalysisInput
): Promise<WardrobeAnalysisResult> {
  try {
    const itemDescriptions = items.map(item => ({
      id: item.id,
      name: item.itemName,
      category: item.category,
      color: item.color,
      pattern: item.pattern || 'solid',
      material: item.material || 'unknown',
      brand: item.brand || 'unspecified',
      season: item.season || 'all-season'
    }));

    const prompt = `Expert wardrobe consultant with 15+ years experience. Analyze this ${userProfile.gender}'s wardrobe for style optimization and decluttering guidance.

USER PROFILE:
- Gender: ${userProfile.gender}
- Age: ${userProfile.age}
- Body Type: ${userProfile.bodyType}
- Lifestyle: ${userProfile.lifestyle}
- Daily Activity: ${userProfile.dailyActivity}
- Budget: ${userProfile.budget}
- Style Goals: ${userProfile.goals.join(', ')}
- Preferred Colors: ${userProfile.colorPreferences.join(', ')}
- Color Avoidances: ${userProfile.colorAvoidances.join(', ')}
- Occasions: ${userProfile.occasions.join(', ')}

WARDROBE INVENTORY (${items.length} items):
${JSON.stringify(itemDescriptions, null, 2)}

ANALYSIS INSTRUCTIONS:
1. Evaluate each item for style alignment, color match, versatility, and quality
2. Give specific keep/alter/donate recommendations with clear reasoning
3. Identify wardrobe gaps and priority purchases
4. Provide organization and budgeting strategies

Score items 1-100 on style alignment, color match, versatility, and quality.
Be practical and goal-focused in recommendations.

Respond in this EXACT JSON format:
{
  "itemAnalysis": [
    {
      "id": number,
      "styleAlignment": number,
      "colorMatch": number, 
      "versatility": number,
      "quality": number,
      "fitAssessment": "excellent/good/needs_alteration/poor",
      "recommendation": "keep/alter/donate",
      "reason": "specific explanation",
      "improvementSuggestions": ["suggestion1", "suggestion2"],
      "outfitPairings": ["pairing1", "pairing2"]
    }
  ],
  "wardrobeOverview": {
    "totalItems": ${items.length},
    "keepItems": number,
    "alterItems": number, 
    "donateItems": number,
    "gapAnalysis": ["gap1", "gap2"],
    "priorityPurchases": ["item1", "item2"],
    "overallScore": number,
    "styleConsistency": number
  },
  "recommendations": {
    "declutterPlan": ["step1", "step2"],
    "organizationTips": ["tip1", "tip2"],
    "seasonalRotation": ["rotation1", "rotation2"],
    "budgetOptimization": ["strategy1", "strategy2"]
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert wardrobe consultant and personal stylist. Provide detailed, actionable analysis focused on style optimization and practical recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const analysisResult = JSON.parse(response.choices[0].message.content!);
    return analysisResult as WardrobeAnalysisResult;

  } catch (error) {
    console.error("Error analyzing wardrobe:", error);
    throw new Error("Failed to analyze wardrobe");
  }
}

export async function analyzeStyleProfile(input: StyleAnalysisInput): Promise<StyleDNAResult> {
  try {
    const genderGreeting = input.gender === 'male' || input.gender === 'man' ? 'Looking sharp!' : 'Hello beautiful!';
    const genderPronoun = input.gender === 'male' || input.gender === 'man' ? 'his' : 'her';
    const genderSpecific = input.gender === 'male' || input.gender === 'man' ? 'gentleman' : 'lady';
    
    const prompt = `Expert fashion stylist with 15+ years experience. Analyze this profile for precise, actionable style recommendations.

KEY FOCUS:
- Goal achievement over preferences
- Scientific color/body analysis  
- Budget-conscious recommendations
- Confidence-building strategies
- ${input.gender}-specific expertise for ${input.bodyType} body type

User Profile:
- Gender: ${input.gender} (CRITICAL: All recommendations must be gender-specific)
- Age: ${input.age}
- Height: ${input.height}
- Body Type: ${input.bodyType} (provide ${input.gender}-specific body shape analysis)
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

BRIEF ANALYSIS REQUIREMENTS:
- 12-season color analysis with hex codes
- Body type confirmation and flattering silhouettes  
- Goal-focused recommendations
- Budget-conscious suggestions

Provide analysis in this EXACT JSON format:

{
  "styleDNA": {
    "primaryStyle": "Main style category",
    "secondaryStyle": "Secondary influence", 
    "styleDescription": "2-3 sentence description",
    "confidenceScore": 0.85
  },
  "colorPalette": {
    "seasonalType": "12-season classification",
    "bestColors": ["5 hex codes like #2C3E50"],
    "colorsToAvoid": ["3 colors to avoid"],
    "neutrals": ["3 neutral hex codes"],
    "accents": ["2 accent hex codes"]
  },
  "bodyAnalysis": {
    "bodyTypeConfirmation": "Body type confirmation",
    "bestSilhouettes": ["4 flattering silhouettes"],
    "proportionTips": ["3 proportion tips"],
    "fitGuidance": ["3 fit guidelines"]
  },
  "personalizedTips": {
    "shoppingGuide": ["5 shopping priorities"],
    "stylingTips": ["5 styling techniques"],
    "wardrobeEssentials": ["8 essential pieces"],
    "occasionSpecific": {
      ${input.occasions.map(occasion => `"${occasion.toLowerCase()}": ["2 key pieces for ${occasion}"]`).join(',\n      ')}
    }
  },
  "confidenceBoost": {
    "strengthAreas": ["2 current strengths"],
    "improvementAreas": ["2 gentle improvements"],
    "actionPlan": ["3 immediate action steps"]
  },
  "overallRecommendation": "2 sentence summary with encouragement"
}

Provide specific, actionable advice that's tailored to their ${input.gender} identity, lifestyle (${input.lifestyle}), budget (${input.budget}), and goals (${input.goals.join(', ')}). 

TONE: Use a warm, friendly, and encouraging voice. Address them personally and make them feel confident about their style journey. Avoid clinical or robotic language - be conversational and supportive.

EXAMPLES of gender-appropriate friendly tone:
${input.gender === 'male' || input.gender === 'man' ? 
  `- "Your ${input.bodyType} build is perfect for sharp, tailored looks, and here's how to maximize it..."
- "Based on your busy ${input.dailyActivity} lifestyle, here are some effortless yet polished looks..."
- "I can see you're drawn to ${input.styleInspirations} - let's build on that foundation..."
- "These colors will make you look sharp and confident..."` :
  `- "Your ${input.bodyType} figure is absolutely beautiful, and here's how to enhance it..."
- "Based on your busy ${input.dailyActivity} lifestyle, here are some effortless looks..."
- "I love that you're drawn to ${input.styleInspirations} - let's build on that!"
- "These colors will make your features absolutely glow..."`
}

Be encouraging and positive while providing practical, personalized guidance.

CRITICAL GOAL-ORIENTED ANALYSIS:
- If they want to look professional but prefer bright colors, recommend navy/charcoal and explain why
- If they want to appear confident but choose oversized clothes, suggest fitted options
- If they want to look younger but choose dated styles, recommend modern alternatives
- Always explain WHY certain choices work better for their specific goals
- Be honest about what they might be doing wrong currently to achieve their objectives.`;

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
          content: "You are a certified color analyst with advanced training in seasonal color analysis, undertone science, and professional color consulting. Apply rigorous color theory principles to provide precise, actionable color recommendations."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this photo for professional color consultation. Determine:

1. UNDERTONE ANALYSIS: Warm/cool/neutral with confidence level
2. SEASONAL CLASSIFICATION: Use 12-season system (e.g., Deep Winter, Warm Spring)
3. FEATURE DETAILS: Hair, eye, skin tone descriptions
4. COLOR RECOMMENDATIONS: 5 best hex codes + 3 colors to avoid

JSON format:
{
  "skinTone": "Undertone description with confidence level",
  "hairColor": "Hair color analysis with undertones",
  "eyeColor": "Eye color description",
  "seasonalClassification": "12-season classification",
  "undertoneConfidence": 0.85,
  "recommendedColors": ["5 hex codes"],
  "colorsToAvoid": ["3 problematic colors"],
  "contrastLevel": "High/Medium/Low",
  "colorAnalysis": "2-3 sentence analysis"
}`
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
    const prompt = `Wardrobe consultant analyzing profile and current items for strategic recommendations.

USER: ${JSON.stringify(userProfile, null, 2)}
WARDROBE: ${JSON.stringify(wardrobeItems, null, 2)}  
GOALS: ${styleGoals.join(', ')}

Provide focused recommendations in JSON format:
{
  "recommendations": [
    {
      "type": "purchase/styling_tip/outfit_idea",
      "title": "Brief recommendation",
      "description": "Detailed explanation",
      "priority": "high/medium/low",
      "confidence": 0.8,
      "reasoning": "Why this helps achieve goals"
    }
  ]
}`;

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