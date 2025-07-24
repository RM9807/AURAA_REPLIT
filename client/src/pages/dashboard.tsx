import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Heart, TrendingUp, Shirt, Sparkles, Target, BarChart3, Palette, Wand2, Scan, Image, Calendar, Settings, User, RefreshCw, CheckCircle, ShoppingBag } from "lucide-react";
import AuthenticatedNav from "@/components/ui/nav-authenticated";

import WardrobeDigitizer from "@/components/features/WardrobeDigitizer";
import OutfitCombinationAI from "@/components/features/OutfitCombinationAI";
import ProfileDiagnosis from "@/components/features/ProfileDiagnosis";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("wardrobe");
  const [, setLocation] = useLocation();

  const userId = 1; // Demo user ID

  // Type definitions
  interface User {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }

  interface UserProfile {
    id: number;
    userId: number;
    bodyType?: string;
    height?: string;
    age?: number;
    skinTone?: string;
    dailyActivity?: string;
    comfortLevel?: string;
    occasions?: string[];
    goals?: string[];
    colorPreferences?: string[];
    styleInspirations?: string;
    budget?: string;
    specialRequirements?: string;
  }

  interface WardrobeItem {
    id: number;
    userId: number;
    itemName: string;
    category: string;
    color?: string;
    brand?: string;
    season?: string;
    isFavorite?: boolean;
  }

  interface Outfit {
    id: number;
    userId: number;
    name: string;
    occasion?: string;
    mood?: string;
    items?: number[];
    isFavorite?: boolean;
  }

  interface StyleRecommendation {
    id: number;
    userId: number;
    recommendation: string;
    confidence?: string;
    type?: string;
    metadata?: any;
  }

  interface UserAnalytics {
    id: number;
    userId: number;
    styleScore?: number;
    totalOutfits?: number;
    totalWardrobeItems?: number;
    favoriteColors?: string[];
    mostWornCategories?: string[];
  }

  // Fetch data from database
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/user']
  });

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile | null>({
    queryKey: ['/api/users', userId, 'profile']
  });

  const { data: wardrobe = [], isLoading: wardrobeLoading } = useQuery<WardrobeItem[]>({
    queryKey: ['/api/users', userId, 'wardrobe']
  });

  const { data: outfits = [], isLoading: outfitsLoading } = useQuery<Outfit[]>({
    queryKey: ['/api/users', userId, 'outfits']
  });

  const { data: recommendations = [], isLoading: recommendationsLoading } = useQuery<StyleRecommendation[]>({
    queryKey: ['/api/users', userId, 'recommendations']
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<UserAnalytics | null>({
    queryKey: ['/api/users', userId, 'analytics']
  });

  // Loading state
  if (userLoading || profileLoading || wardrobeLoading || outfitsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <AuthenticatedNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is new or existing
  const isNewUser = !profile;
  const hasWardrobe = wardrobe && wardrobe.length > 0;
  const hasOutfits = outfits && outfits.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <AuthenticatedNav />
      
      {/* Header */}
      <div className="bg-gradient-hero shadow-sm border-b mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/auraa-logo.png" alt="AURAA" className="h-16 w-16" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Personal Style Dashboard
            </h1>
            <p className="text-white/80 text-lg">
              Your AI-powered style journey starts here
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Style Diagnosis Profile Section */}
        <div className="mb-12">
          <Card className="border-violet-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Your Style DNA Profile
              </CardTitle>
              <CardDescription className="text-slate-600">
                {profile ? 'Your personalized style analysis is complete' : 'Complete your style analysis to unlock personalized recommendations'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {profile ? (
                <div>
                  {/* Existing User - Style Profile Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">Body Type</h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                        {profile.bodyType}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <Palette className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">Style Preference</h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                        {profile.styleInspirations || 'Classic'}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                          <Target className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">Lifestyle</h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                        {profile.dailyActivity || 'Professional'}
                      </p>
                    </div>
                  </div>

                  {/* AI Style DNA Analysis Results */}
                  {recommendations.length > 0 && (
                    <div className="mt-8 space-y-6">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-slate-900 mb-2 flex items-center justify-center space-x-2">
                          <Sparkles className="h-5 w-5 text-violet-500" />
                          <span>AI Style DNA Analysis</span>
                        </h3>
                        <p className="text-slate-600 text-sm">Your personalized style insights powered by AI</p>
                      </div>

                      {/* Style DNA Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Style Archetype from AI */}
                        {recommendations.find(r => r.type === 'style_analysis') && (
                          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-white" />
                                </div>
                                <h4 className="text-lg font-semibold text-slate-900">Your Signature Style ✨</h4>
                              </div>
                              <div className="space-y-2">
                                <p className="font-medium text-slate-900">
                                  {(() => {
                                    const styleRec = recommendations.find(r => r.type === 'style_analysis');
                                    return styleRec?.metadata?.styleDNA?.primaryStyle || 
                                           styleRec?.recommendation.split(':')[1]?.trim() || 
                                           'Classic Elegance';
                                  })()}
                                </p>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  {(() => {
                                    const styleRec = recommendations.find(r => r.type === 'style_analysis');
                                    return styleRec?.metadata?.styleDNA?.styleDescription || 
                                           'Timeless pieces with clean lines and sophisticated details that reflect your unique personality and goals';
                                  })()}
                                </p>
                                <div className="flex items-center space-x-2 mt-3">
                                  <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                    Confidence: {(() => {
                                      const styleRec = recommendations.find(r => r.type === 'style_analysis');
                                      const confidence = styleRec?.metadata?.styleDNA?.confidenceScore || 
                                                       parseFloat(styleRec?.confidence || '0.85');
                                      return Math.round(confidence * 100);
                                    })()}%
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Color Palette */}
                        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <Palette className="h-4 w-4 text-white" />
                              </div>
                              <h4 className="text-lg font-semibold text-slate-900">Colors That Make You Glow 🎨</h4>
                            </div>
                            <div className="space-y-3">
                              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                {(() => {
                                  // Get AI-generated colors from recommendations
                                  const styleRec = recommendations.find(r => r.type === 'style_analysis');
                                  const aiColors = styleRec?.metadata?.colorPalette?.bestColors || [];
                                  
                                  // Use AI colors if available, otherwise fallback to generated colors
                                  let displayColors = aiColors;
                                  if (!aiColors || aiColors.length < 6) {
                                    const colorMap: Record<string, string> = {
                                      'neutrals': '#8B7D6B',
                                      'earth-tones': '#DEB887',
                                      'jewel-tones': '#4169E1',
                                      'pastels': '#DDA0DD',
                                      'bold-bright': '#FF6347',
                                      'monochrome': '#2F2F2F'
                                    };
                                    const generatedColors = profile?.colorPreferences?.map(pref => colorMap[pref]) || 
                                                           ['#2F4F4F', '#8FBC8F', '#F5F5DC', '#DDA0DD', '#CD853F', '#8B7D6B', '#4169E1', '#DEB887'];
                                    displayColors = [...aiColors, ...generatedColors].slice(0, 8);
                                  }
                                  
                                  return displayColors.map((color: string, index: number) => (
                                    <div key={index} className="flex flex-col items-center space-y-1">
                                      <div
                                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                      />
                                      <span className="text-xs text-slate-500 font-mono">{color}</span>
                                    </div>
                                  ));
                                })()}
                              </div>
                              <div className="text-sm text-slate-600 space-y-1">
                                <p>Colors that enhance your natural beauty and work perfectly with your style goals!</p>
                                <div className="flex items-center space-x-2 text-xs">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {(() => {
                                      const styleRec = recommendations.find(r => r.type === 'style_analysis');
                                      const aiColors = styleRec?.metadata?.colorPalette?.bestColors || [];
                                      return aiColors.length > 0 ? `${aiColors.length} AI-curated colors` : 'Based on preferences';
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* AI Recommendations */}
                      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <Target className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="text-lg font-semibold text-slate-900">Just For You - Styling Secrets 💡</h4>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {(() => {
                              // Get personalized tips from AI analysis
                              const styleRec = recommendations.find(r => r.type === 'style_analysis');
                              const personalizedTips = styleRec?.metadata?.personalizedTips?.stylingTips || 
                                                     recommendations.filter(r => r.type === 'styling_tips').map(r => r.recommendation) ||
                                                     [];
                              
                              // Get shopping guide from AI analysis  
                              const shoppingGuide = styleRec?.metadata?.personalizedTips?.shoppingGuide || 
                                                  recommendations.filter(r => r.type === 'shopping_guide').map(r => r.recommendation) ||
                                                  [];
                              
                              // Combine both arrays and show first 4
                              const allTips = [...personalizedTips, ...shoppingGuide].slice(0, 4);
                              
                              if (allTips.length === 0) {
                                return (
                                  <div className="text-center text-slate-500 text-sm py-4">
                                    Complete your Style DNA analysis to see personalized recommendations
                                  </div>
                                );
                              }
                              
                              return allTips.map((tip: string, index: number) => (
                                <div key={index} className="flex items-start space-x-3 bg-white/50 rounded-lg p-3">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <p className="text-sm text-slate-600 leading-relaxed">{tip}</p>
                                </div>
                              ));
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* User Options */}
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">What would you like to do?</h3>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => setLocation('/personal-style-diagnosis')}
                        variant="outline"
                        className="flex items-center space-x-2 border-violet-300 text-violet-600 hover:bg-violet-50"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Update Profile Diagnosis</span>
                      </Button>
                      <Button
                        className="flex items-center space-x-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                        onClick={() => {
                          // Scroll to main features
                          document.getElementById('main-features')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Keep As-Is & Continue</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="h-10 w-10 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Complete Your Style DNA Analysis
                    </h3>
                    <p className="text-slate-600 mb-6">
                      Take our comprehensive style quiz to unlock personalized recommendations and AI-powered styling
                    </p>
                    <Button
                      onClick={() => setLocation('/personal-style-diagnosis')}
                      size="lg"
                      className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                    >
                      Start Style Diagnosis
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Features Section */}
        <div id="main-features" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Your Style Tools
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Explore our AI-powered features to transform your wardrobe and elevate your style
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Digital Wardrobe Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-violet-200 hover:border-violet-300">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Scan className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Digital Wardrobe</h3>
                  <p className="text-slate-600 mb-4">
                    Digitize your closet with AI-powered organization and smart recommendations
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 mb-4">
                    <Sparkles className="h-4 w-4" />
                    <span>
                      {hasWardrobe ? `${wardrobe.length} items digitized` : 'Ready to start'}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setLocation('/digital-wardrobe')}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  {hasWardrobe ? 'Manage Wardrobe' : 'Start Digitizing'}
                </Button>
              </CardContent>
            </Card>

            {/* Outfit Generator & Planner Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-violet-200 hover:border-violet-300">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Wand2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Outfit Generator & Planner</h3>
                  <p className="text-slate-600 mb-4">
                    AI-powered outfit recommendations based on weather, occasion, and your style DNA
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 mb-4">
                    <Image className="h-4 w-4" />
                    <span>
                      {hasOutfits ? `${outfits.length} outfits created` : 'Ready to create'}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setLocation('/outfit-builder')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {hasOutfits ? 'Create New Outfit' : 'Start Building'}
                </Button>
              </CardContent>
            </Card>

            {/* Shop Smart Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-violet-200 hover:border-violet-300">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Shop Smart</h3>
                  <p className="text-slate-600 mb-4">
                    Personalized shopping recommendations based on your style profile and wardrobe gaps
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 mb-4">
                    <Target className="h-4 w-4" />
                    <span>AI-curated recommendations</span>
                  </div>
                </div>
                <Button
                  onClick={() => setLocation('/shop-smart')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  Discover Items
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Style Stats - Optional bottom section */}
        {profile && (
          <div className="mt-16">
            <Card className="border-violet-200">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold text-slate-900">Your Style Journey</CardTitle>
                <CardDescription className="text-slate-600">
                  Track your progress and style achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-violet-600">{analytics?.styleScore || 0}</div>
                    <div className="text-sm text-slate-600">Style Score</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{wardrobe.length || 0}</div>
                    <div className="text-sm text-slate-600">Items Digitized</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{outfits.length || 0}</div>
                    <div className="text-sm text-slate-600">Outfits Created</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-cyan-600">{recommendations.length || 0}</div>
                    <div className="text-sm text-slate-600">AI Recommendations</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}