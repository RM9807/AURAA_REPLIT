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

export async function analyzeStyleProfile(input: StyleAnalysisInput): Promise<StyleDNAResult> {
  try {
    const genderGreeting = input.gender === 'male' || input.gender === 'man' ? 'Looking sharp!' : 'Hello beautiful!';
    const genderPronoun = input.gender === 'male' || input.gender === 'man' ? 'his' : 'her';
    const genderSpecific = input.gender === 'male' || input.gender === 'man' ? 'gentleman' : 'lady';
    
    const prompt = `You are an elite personal stylist and fashion psychologist with 15+ years of experience working with diverse clients. You combine deep expertise in color theory, body geometry, fabric science, and style psychology to create transformative style profiles.

EXPERTISE AREAS:
- Color Science: Undertone analysis, seasonal color theory, contrast levels
- Body Geometry: Proportional analysis, visual weight distribution, silhouette optimization
- Fashion Psychology: How clothing affects confidence, perception, and goal achievement
- Trend Analysis: Current trends vs. timeless pieces for long-term wardrobe value
- Fabric & Fit Sciences: How different fabrics behave on different body types

CRITICAL ANALYSIS FRAMEWORK:
1. GOAL-FIRST APPROACH: Prioritize achieving their stated goals over personal preferences when they conflict
2. LIFESTYLE INTEGRATION: Ensure recommendations fit seamlessly into their actual daily routine
3. PSYCHOLOGICAL IMPACT: Consider how recommendations will affect their confidence and self-perception
4. BUDGET OPTIMIZATION: Maximize impact within their stated budget constraints
5. BODY SCIENCE: Use precise body geometry principles, not generic advice
6. COLOR PRECISION: Apply professional color analysis techniques

GENDER-SPECIFIC EXPERTISE: All recommendations must demonstrate deep understanding of ${input.gender} fashion, including:
- ${input.gender === 'male' || input.gender === 'man' ? 
  'Menswear construction principles, masculine silhouette enhancement, professional menswear standards' : 
  'Women\'s fashion complexity, feminine silhouette science, versatile styling options'}
- Age-appropriate styling for ${input.age}-year-olds
- Body type optimization for ${input.bodyType} ${input.gender} figures

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

ENHANCED ANALYSIS REQUIREMENTS:

1. BODY GEOMETRY ANALYSIS (High Precision):
   - Apply mathematical proportional analysis for ${input.bodyType} ${input.gender} bodies
   - Consider height ${input.height} in relation to proportional recommendations
   - Account for age ${input.age} and how body changes affect styling choices
   - Provide specific measurement-based advice (shoulder-to-waist ratios, etc.)

2. COLOR SCIENCE APPLICATION:
   - Determine precise seasonal color category based on ${input.skinTone ? `skin tone (${input.skinTone})` : 'described characteristics'}
   - ${input.hairColor ? `Factor in hair color (${input.hairColor}) for undertone harmony` : 'Deduce undertones from other characteristics'}
   - ${input.eyeColor ? `Consider eye color (${input.eyeColor}) for accent color selection` : 'Focus on skin-based color harmony'}
   - Provide 8-10 specific hex codes that work scientifically with their coloring
   - Explain WHY each color works (undertone harmony, contrast level, etc.)

3. LIFESTYLE INTEGRATION ANALYSIS:
   - Daily Activity Impact: How "${input.dailyActivity}" affects fabric choices, maintenance needs, versatility requirements
   - Comfort Level Translation: Convert "${input.comfortLevel}" into specific fabric, fit, and style parameters
   - Budget Strategy: Create a ${input.budget} budget-conscious approach that maximizes cost-per-wear
   - Occasion Coverage: Ensure all occasions (${input.occasions.join(', ')}) are addressed with specific looks

4. GOAL-ACHIEVEMENT PSYCHOLOGY:
   - For each goal (${input.goals.join(', ')}), explain the psychological impact of recommended pieces
   - Address any conflicts between preferences and goals with diplomatic yet firm guidance
   - Provide specific action steps that build confidence toward their objectives
   - Include timing recommendations for implementing changes

5. PRECISION REQUIREMENTS:
   - Use specific fashion terminology appropriate for ${input.gender} styling
   - Reference current 2024-2025 fashion landscape and trends
   - Provide brand and shopping recommendations within their budget range
   - Include seasonal timing for purchases (when to buy what)

6. EVIDENCE-BASED RECOMMENDATIONS:
   - Explain the science behind each body type recommendation
   - Cite color theory principles for color choices
   - Reference style psychology for confidence-building suggestions
   - Include maintenance and longevity considerations for each recommendation

RESPONSE FORMAT - Provide comprehensive analysis in JSON format:

{
  "styleDNA": {
    "primaryStyle": "Main style archetype with scientific rationale",
    "secondaryStyle": "Secondary influence that complements primary",
    "styleDescription": "Detailed 4-5 sentence description explaining WHY this style DNA fits their goals, lifestyle, and psychology",
    "confidenceScore": 0.85
  },
  "colorPalette": {
    "seasonalType": "Specific seasonal classification (Deep Winter, Warm Spring, etc.)",
    "bestColors": ["8-10 precise hex codes like #2C3E50, #E74C3C with scientific rationale"],
    "colorsToAvoid": ["Specific colors that clash with their undertones - explain why"],
    "neutrals": ["4-5 neutral hex codes that form wardrobe foundation"],
    "accents": ["3-4 statement colors for impact pieces"],
    "colorExplanation": "Scientific explanation of why these colors work with their specific coloring"
  },
  "bodyAnalysis": {
    "bodyTypeConfirmation": "Mathematical analysis confirming/refining their ${input.bodyType} classification with precision",
    "bestSilhouettes": ["5-7 specific silhouette names with technical explanations"],
    "proportionTips": ["Detailed geometric proportion advice with measurements"],
    "fitGuidance": ["Precise fit specifications for different garment types"],
    "fabricRecommendations": ["Best fabric types for their body geometry and lifestyle"],
    "heightConsiderations": "Specific advice for ${input.height} height optimization"
  },
  "personalizedTips": {
    "shoppingGuide": ["10-12 specific purchase priorities ranked by impact and budget efficiency"],
    "stylingTips": ["8-10 professional styling techniques specific to their goals"],
    "wardrobeEssentials": ["15-20 essential pieces with specific style details"],
    "occasionSpecific": {
      ${input.occasions.map(occasion => `"${occasion.toLowerCase()}": ["Specific outfit formulas and pieces for ${occasion}"]`).join(',\n      ')},
      "versatile": ["Pieces that work across multiple occasions"]
    },
    "brandRecommendations": ["Specific brands within their ${input.budget} budget"],
    "seasonalStrategy": "When to buy what throughout the year for maximum value"
  },
  "confidenceBoost": {
    "strengthAreas": ["Current style strengths to build upon"],
    "improvementAreas": ["Gentle areas for enhancement with specific solutions"],
    "actionPlan": ["Week-by-week implementation plan for first month"],
    "psychologyTips": ["How each recommendation builds confidence toward their goals"],
    "quickWins": ["3 immediate changes that create maximum impact"]
  },
  "goalAlignment": {
    ${input.goals.map(goal => `"${goal}": "Specific strategies for achieving '${goal}' through style choices"`).join(',\n    ')},
    "timeline": "Realistic timeline for achieving their combined goals"
  },
  "budgetOptimization": {
    "priorityPurchases": ["Most impactful items to buy first within ${input.budget} budget"],
    "costPerWear": ["High-value pieces that maximize cost-per-wear"],
    "savingStrategies": ["Smart shopping tactics for their specific needs"]
  },
  "overallRecommendation": "Comprehensive 3-4 sentence summary tying everything together with encouragement"
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
              text: `PROFESSIONAL COLOR ANALYSIS REQUIREMENTS:

UNDERTONE ANALYSIS (Critical):
- Examine skin undertones using professional techniques: vein color analysis, white/cream comparison, jewelry preference indicators
- Classify as warm (yellow/golden), cool (pink/blue), or neutral (balanced) with confidence level
- Consider lighting conditions and provide analysis accuracy rating

SEASONAL COLOR CLASSIFICATION:
- Apply 12-season color analysis system (not just 4 seasons)
- Examples: Deep Winter, Clear Winter, Cool Winter, Warm Spring, Light Spring, Clear Spring, Deep Autumn, Warm Autumn, Soft Autumn, Cool Summer, Light Summer, Soft Summer
- Provide specific seasonal classification with reasoning

FEATURE ANALYSIS:
- Hair Color: Exact shade description, natural vs. artificial indicators, undertone harmony
- Eye Color: Precise description including limbal ring, iris patterns, depth
- Skin Tone: Undertone classification, contrast level, clarity analysis

SCIENTIFIC COLOR RECOMMENDATIONS:
- Provide 8-10 precise hex color codes that work optimally with their coloring
- Explain color temperature, saturation, and contrast principles for each recommendation
- Include specific colors to avoid and why (undertone clashing, unflattering contrast, etc.)

Return analysis in JSON format:
{
  "skinTone": "Precise undertone description with confidence level (e.g., 'Warm undertones with golden base, 85% confidence')",
  "hairColor": "Detailed hair color analysis including undertones and natural harmony",
  "eyeColor": "Comprehensive eye color description with depth and clarity notes",
  "seasonalClassification": "Specific 12-season classification (e.g., 'Deep Autumn')",
  "undertoneConfidence": "0.0-1.0 confidence rating",
  "recommendedColors": ["Array of 8-10 hex codes with brief explanations"],
  "colorsToAvoid": ["Array of problematic colors with reasoning"],
  "contrastLevel": "High/Medium/Low contrast person",
  "colorAnalysis": "Comprehensive 4-5 sentence professional analysis explaining the science behind recommendations",
  "lightingAssessment": "Analysis of photo lighting quality and its impact on color accuracy"
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
    const prompt = `ADVANCED WARDROBE ANALYSIS & STRATEGIC RECOMMENDATIONS

You are an expert wardrobe consultant conducting a comprehensive gap analysis and strategic improvement plan.

USER PROFILE ANALYSIS:
${JSON.stringify(userProfile, null, 2)}

CURRENT WARDROBE INVENTORY:
${JSON.stringify(wardrobeItems, null, 2)}

STYLE OBJECTIVES:
${styleGoals.join(', ')}

ANALYSIS FRAMEWORK:
1. WARDROBE GAP ANALYSIS: Identify missing pieces preventing goal achievement
2. COST-PER-WEAR OPTIMIZATION: Prioritize high-impact, versatile pieces
3. OUTFIT MULTIPLICATION: Recommend pieces that create multiple outfit combinations
4. GOAL-SPECIFIC TARGETING: Address each style goal with specific solutions
5. BUDGET EFFICIENCY: Maximize style impact within realistic budget constraints

RECOMMENDATION TYPES:
- STRATEGIC PURCHASES: High-impact items that fill wardrobe gaps
- OUTFIT FORMULAS: Specific combinations using existing + recommended pieces
- STYLING TECHNIQUES: No-cost improvements using current wardrobe
- WARDROBE EDITS: Items to donate/alter for better cohesion

Provide strategic recommendations in JSON format:
{
  "recommendations": [
    {
      "type": "strategic_purchase/outfit_formula/styling_technique/wardrobe_edit",
      "title": "Specific, actionable recommendation title",
      "description": "Detailed explanation with specific items, colors, brands, or techniques",
      "priority": "immediate/high/medium/low",
      "confidence": 0.0-1.0,
      "reasoning": "Scientific explanation of why this achieves their specific goals",
      "implementationCost": "Cost estimate or 'free' for styling tips",
      "impactScore": 1-10,
      "outfitMultiplier": "How many new outfit combinations this creates",
      "goalAlignment": ["Which specific goals this addresses"],
      "timeline": "When to implement (immediate, month 1, month 2, etc.)"
    }
  ],
  "wardrobeStrategy": "Overall 3-month strategic plan",
  "quickWins": ["3 immediate, no-cost improvements"],
  "investmentPriority": ["Top 5 purchases ranked by impact/cost ratio"]
}

CRITICAL REQUIREMENTS:
- Base ALL recommendations on actual wardrobe analysis vs. their goals
- Provide specific brand/store suggestions within their budget range
- Calculate outfit multiplication potential for each recommendation
- Include cost estimates and prioritize by value
- Address gaps that prevent achieving their specific style goals`;

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