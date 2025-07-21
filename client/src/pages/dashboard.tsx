import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
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
  const isNewUser = !profile || !profile?.bodyType || !profile?.dailyActivity;
  const hasWardrobe = wardrobe && wardrobe?.length > 0;
  const hasOutfits = outfits && outfits?.length > 0;

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
                        {profile?.bodyType}
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
                        {profile?.styleInspirations || 'Classic'}
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
                        {profile?.dailyActivity || 'Professional'}
                      </p>
                    </div>
                  </div>

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
                      {hasWardrobe ? `${wardrobe?.length} items digitized` : 'Ready to start'}
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
                      {hasOutfits ? `${outfits?.length} outfits created` : 'Ready to create'}
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
                    <div className="text-2xl font-bold text-blue-600">{wardrobe?.length || 0}</div>
                    <div className="text-sm text-slate-600">Items Digitized</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{outfits?.length || 0}</div>
                    <div className="text-sm text-slate-600">Outfits Created</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-cyan-600">{recommendations?.length || 0}</div>
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