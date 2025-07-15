import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Heart, TrendingUp, Shirt, Sparkles, Target, BarChart3, Palette, Wand2, Scan, Image, Calendar, Settings } from "lucide-react";
import AuthenticatedNav from "@/components/ui/nav-authenticated";

import WardrobeDigitizer from "@/components/features/WardrobeDigitizer";
import OutfitCombinationAI from "@/components/features/OutfitCombinationAI";
import ProfileDiagnosis from "@/components/features/ProfileDiagnosis";

export default function Dashboard() {
  const userId = 1; // In a real app, this would come from auth context
  const [activeTab, setActiveTab] = useState("wardrobe");
  const [, setLocation] = useLocation();

  const { data: user } = useQuery({
    queryKey: ['/api/users', userId],
    retry: false,
  });

  const { data: profile } = useQuery({
    queryKey: ['/api/users', userId, 'profile'],
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/users', userId, 'analytics'],
  });

  const { data: wardrobe } = useQuery({
    queryKey: ['/api/users', userId, 'wardrobe'],
  });

  const { data: outfits } = useQuery({
    queryKey: ['/api/users', userId, 'outfits'],
  });

  const { data: recommendations } = useQuery({
    queryKey: ['/api/users', userId, 'recommendations'],
  });

  // Check if user is new or existing
  const isNewUser = !profile || !profile.bodyType || !profile.dailyActivity;
  const hasWardrobe = wardrobe && wardrobe.length > 0;
  const hasOutfits = outfits && outfits.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50">
      <AuthenticatedNav />
      
      {/* Header */}
      <div className="bg-gradient-hero shadow-sm border-b mt-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/auraa-logo.png" alt="AURAA" className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {isNewUser ? 'Welcome to AURAA!' : `Welcome back, ${user?.firstName || 'User'}!`}
                </h1>
                <p className="text-white/80">
                  {isNewUser ? 'Complete your style journey' : 'Your personal style dashboard'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-gradient-purple-pink text-white border-white/20">
                Style Score: {analytics?.styleScore || 0}/100
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Digital Wardrobe Card */}
          <Card 
            className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer group"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                  <Scan className="h-6 w-6 text-cyan-400" />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-cyan-400 hover:text-cyan-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation('/digital-wardrobe');
                  }}
                >
                  Explore Now →
                </Button>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Digital Wardrobe</h3>
              <p className="text-slate-300 text-sm mb-4">
                Digitize your closet with AI-powered organization and smart recommendations
              </p>
            </CardContent>
          </Card>

          {/* Outfit Generator & Planner Card */}
          <Card 
            className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 cursor-pointer group"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Image className="h-6 w-6 text-purple-400" />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-purple-400 hover:text-purple-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation('/outfit-builder');
                  }}
                >
                  Build Outfit →
                </Button>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Outfit Generator & Planner</h3>
              <p className="text-slate-300 text-sm mb-4">
                Create perfect outfits using your wardrobe items with AI-powered suggestions
              </p>
            </CardContent>
          </Card>

          {/* Personal Style Diagnosis Card */}
          <Card 
            className="bg-gradient-to-br from-slate-900 to-slate-800 border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 cursor-pointer group"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center">
                  <Palette className="h-6 w-6 text-pink-400" />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-pink-400 hover:text-pink-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation('/personal-style-diagnosis');
                  }}
                >
                  Start Diagnosis →
                </Button>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Personal Style Diagnosis</h3>
              <p className="text-slate-300 text-sm mb-4">
                Discover your unique style DNA through AI-powered color and body analysis
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional content for existing users only */}
        {!isNewUser && (
          <>
        {/* Shop Smart Card */}
        <Card 
          className="bg-gradient-to-br from-slate-900 to-slate-800 border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 cursor-pointer group mb-8"
          onClick={() => setActiveTab("shop")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-400" />
              </div>
              <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300">
                View Trends →
              </Button>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Shop Smart</h3>
              <p className="text-slate-300 text-sm mb-4">
                Stay ahead with the latest fashion trends and style insights
              </p>
            </CardContent>
          </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">{analytics?.styleScore || 0}</div>
              <p className="text-slate-400 text-sm">Style Score</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">{wardrobe?.length || 0}</div>
              <p className="text-slate-400 text-sm">Wardrobe Items</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">{outfits?.length || 0}</div>
              <p className="text-slate-400 text-sm">Saved Outfits</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">7</div>
              <p className="text-slate-400 text-sm">This Week</p>
            </CardContent>
          </Card>
        </div>

        {/* Content based on active tab */}
        <div className="mt-6">
          {activeTab === "outfits" && <OutfitCombinationAI />}
          {activeTab === "shop" && (
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                  Shop Smart - Coming Soon
                </CardTitle>
                <CardDescription className="text-slate-300">
                  AI-powered shopping recommendations and trend analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-orange-500/20">
                      <h4 className="text-white font-medium mb-2">Trend Analysis</h4>
                      <p className="text-slate-400 text-sm">
                        Stay ahead with the latest fashion trends and seasonal recommendations
                      </p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-orange-500/20">
                      <h4 className="text-white font-medium mb-2">Smart Shopping</h4>
                      <p className="text-slate-400 text-sm">
                        Get personalized shopping suggestions based on your wardrobe gaps
                      </p>
                    </div>
                  </div>
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-4">This feature is under development</p>
                    <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
                      Get Notified When Ready
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === "wardrobe" && (
            <div className="space-y-6">
              {/* Achievement Snippets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Wardrobe Achievement */}
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Scan className="h-5 w-5 text-cyan-400" />
                      Digital Wardrobe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-white">{wardrobe?.length || 0}</div>
                      <p className="text-slate-400 text-sm">Items catalogued</p>
                      <div className="pt-2">
                        <Link to="/digital-wardrobe">
                          <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                            Manage →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Outfit Builder Achievement */}
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Palette className="h-5 w-5 text-purple-400" />
                      Outfit Builder
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-white">{outfits?.length || 0}</div>
                      <p className="text-slate-400 text-sm">Outfits created</p>
                      <div className="pt-2">
                        <Link to="/outfit-builder">
                          <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
                            Create →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shop Smart Achievement */}
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-orange-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-orange-400" />
                      Shop Smart
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-white">{recommendations?.length || 0}</div>
                      <p className="text-slate-400 text-sm">Recommendations</p>
                      <div className="pt-2">
                        <Button size="sm" variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
                          Coming Soon
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Style Diagnosis Profile */}
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-pink-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-pink-400" />
                    Your Style Diagnosis Profile
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Personal style analysis and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-pink-500/20">
                          <h4 className="text-white font-medium mb-2">Body Type & Lifestyle</h4>
                          <div className="space-y-1">
                            <p className="text-slate-300 text-sm">
                              <span className="text-pink-400">Body Type:</span> {profile.bodyType || 'Not specified'}
                            </p>
                            <p className="text-slate-300 text-sm">
                              <span className="text-pink-400">Daily Activity:</span> {profile.dailyActivity || 'Not specified'}
                            </p>
                            <p className="text-slate-300 text-sm">
                              <span className="text-pink-400">Comfort Level:</span> {profile.comfortLevel || 'Not specified'}
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4 border border-pink-500/20">
                          <h4 className="text-white font-medium mb-2">Occasions & Goals</h4>
                          <div className="space-y-2">
                            {profile.occasions && profile.occasions.length > 0 && (
                              <div>
                                <p className="text-pink-400 text-sm mb-1">Occasions:</p>
                                <div className="flex flex-wrap gap-1">
                                  {profile.occasions.map((occasion: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs border-pink-500/30 text-pink-400">
                                      {occasion}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {profile.goals && profile.goals.length > 0 && (
                              <div>
                                <p className="text-pink-400 text-sm mb-1">Goals:</p>
                                <div className="flex flex-wrap gap-1">
                                  {profile.goals.map((goal: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs border-pink-500/30 text-pink-400">
                                      {goal}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-pink-500/20">
                          <h4 className="text-white font-medium mb-2">Color Preferences</h4>
                          <div className="space-y-2">
                            {profile.colorPreferences && profile.colorPreferences.length > 0 && (
                              <div>
                                <p className="text-pink-400 text-sm mb-1">Preferred Colors:</p>
                                <div className="flex flex-wrap gap-1">
                                  {profile.colorPreferences.map((color: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                                      {color}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {profile.colorAvoidances && profile.colorAvoidances.length > 0 && (
                              <div>
                                <p className="text-pink-400 text-sm mb-1">Colors to Avoid:</p>
                                <div className="flex flex-wrap gap-1">
                                  {profile.colorAvoidances.map((color: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs bg-red-500/20 text-red-400">
                                      {color}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4 border border-pink-500/20">
                          <h4 className="text-white font-medium mb-2">Additional Details</h4>
                          <div className="space-y-1">
                            {profile.styleInspirations && (
                              <p className="text-slate-300 text-sm">
                                <span className="text-pink-400">Style Inspiration:</span> {profile.styleInspirations}
                              </p>
                            )}
                            {profile.age && (
                              <p className="text-slate-300 text-sm">
                                <span className="text-pink-400">Age Range:</span> {profile.age}
                              </p>
                            )}
                            {profile.height && (
                              <p className="text-slate-300 text-sm">
                                <span className="text-pink-400">Height:</span> {profile.height}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 mb-4">No style profile found</p>
                      <Link to="/personal-style-diagnosis">
                        <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                          Complete Style Diagnosis
                        </Button>
                      </Link>
                    </div>
                  )}
                  <div className="flex justify-end pt-4 border-t border-slate-700 mt-6">
                    <Link to="/personal-style-diagnosis">
                      <Button variant="outline" className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10">
                        Update Profile →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
          </>
        )}

      </div>
    </div>
  );
}