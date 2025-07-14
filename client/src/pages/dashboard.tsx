import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

  const { data: user } = useQuery({
    queryKey: ['/api/users', userId],
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gradient-purple-pink mx-auto"></div>
          <p className="mt-4 text-slate">Loading your style dashboard...</p>
        </div>
      </div>
    );
  }

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
                  Welcome back, {user.firstName}!
                </h1>
                <p className="text-white/80">Your personal style dashboard</p>
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
            onClick={() => setActiveTab("wardrobe")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                  <Scan className="h-6 w-6 text-cyan-400" />
                </div>
                <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
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
            onClick={() => setActiveTab("outfits")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Image className="h-6 w-6 text-purple-400" />
                </div>
                <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                  Build Outfit →
                </Button>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Outfit Generator & Planner</h3>
              <p className="text-slate-300 text-sm mb-4">
                Create perfect outfits using your wardrobe items with AI-powered suggestions
              </p>
            </CardContent>
          </Card>

          {/* Shop Smart Card */}
          <Card 
            className="bg-gradient-to-br from-slate-900 to-slate-800 border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 cursor-pointer group"
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
        </div>

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
          {activeTab === "wardrobe" && <WardrobeDigitizer />}
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
        </div>

      </div>
    </div>
  );
}