import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Palette, 
  Target, 
  TrendingUp, 
  RefreshCw, 
  Calendar,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";

interface UserProfile {
  id: number;
  userId: number;
  bodyType: string;
  skinTone: string;
  seasonType: string;
  stylePersonality: string;
  budget: string;
  lifestyle: string;
  completedOnboarding: boolean;
  lastUpdated: string;
  createdAt: string;
}

export default function ProfileDiagnosis() {
  const [, setLocation] = useLocation();
  const userId = 1;

  const { data: profile } = useQuery({
    queryKey: ['/api/users', userId, 'profile'],
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/users', userId, 'analytics'],
  });

  if (!profile) {
    return null;
  }

  const profileAge = Math.floor((Date.now() - new Date(profile.lastUpdated || profile.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const isProfileFresh = profileAge < 90; // Fresh if updated within 3 months
  const completionScore = calculateCompletionScore(profile, analytics);

  const handleRefreshProfile = () => {
    setLocation('/personal-style');
  };

  const handleContinueAsIs = () => {
    // User chooses to continue with current profile
    // Could track this preference or just close the diagnosis
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-gradient-blue-teal" />
          Your Style Profile Diagnosis
        </CardTitle>
        <CardDescription>
          Your personalized style profile analysis and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Freshness */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-3">
            {isProfileFresh ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-amber-600" />
            )}
            <div>
              <h4 className="font-medium text-slate-800">
                Profile Last Updated
              </h4>
              <p className="text-sm text-slate-600">
                {profileAge} days ago • {isProfileFresh ? 'Current' : 'Consider refreshing'}
              </p>
            </div>
          </div>
          <Badge 
            className={isProfileFresh ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
          >
            {isProfileFresh ? 'Fresh' : 'Aging'}
          </Badge>
        </div>

        {/* Profile Completion Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-800">Profile Completeness</h4>
            <span className="text-sm font-medium">{completionScore}%</span>
          </div>
          <Progress value={completionScore} className="h-3" />
          <p className="text-sm text-slate-600">
            {completionScore < 70 
              ? "Your profile could use more details for better recommendations"
              : completionScore < 90
              ? "Good profile! A few more details would enhance your experience"
              : "Excellent! Your profile is comprehensive and up-to-date"
            }
          </p>
        </div>

        {/* Current Profile Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h5 className="font-medium text-slate-800 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color & Style
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Season Type</span>
                <Badge variant="outline">{profile.seasonType || 'Not set'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Skin Tone</span>
                <Badge variant="outline">{profile.skinTone || 'Not analyzed'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Style DNA</span>
                <Badge variant="outline">{profile.stylePersonality || 'Not defined'}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium text-slate-800 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Lifestyle & Goals
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Body Type</span>
                <Badge variant="outline">{profile.bodyType || 'Not analyzed'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Lifestyle</span>
                <Badge variant="outline">{profile.lifestyle || 'Not set'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Budget Range</span>
                <Badge variant="outline">{profile.budget || 'Not specified'}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Style Performance */}
        {analytics && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h5 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Your Style Performance
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{analytics.styleScore || 0}</div>
                <div className="text-xs text-slate-600">Style Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{analytics.totalOutfits || 0}</div>
                <div className="text-xs text-slate-600">Outfits Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{analytics.totalWardrobeItems || 0}</div>
                <div className="text-xs text-slate-600">Items Cataloged</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{analytics.avgOutfitRating || 0}</div>
                <div className="text-xs text-slate-600">Avg Rating</div>
              </div>
            </div>
          </div>
        )}



        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleRefreshProfile}
            className="flex-1 bg-gradient-purple-pink text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Profile
          </Button>
          <Button 
            variant="outline"
            onClick={handleContinueAsIs}
            className="flex-1"
          >
            Continue As-Is
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateCompletionScore(profile: UserProfile, analytics: any): number {
  let score = 0;
  const maxScore = 100;
  
  // Basic profile completion (40 points)
  if (profile.bodyType) score += 10;
  if (profile.skinTone) score += 10;
  if (profile.seasonType) score += 10;
  if (profile.stylePersonality) score += 10;
  
  // Lifestyle details (30 points)
  if (profile.lifestyle) score += 10;
  if (profile.budget) score += 10;
  if (profile.completedOnboarding) score += 10;
  
  // Active usage (30 points)
  if (analytics) {
    if (analytics.totalOutfits > 0) score += 10;
    if (analytics.totalWardrobeItems > 5) score += 10;
    if (analytics.styleScore > 50) score += 10;
  }
  
  return Math.min(score, maxScore);
}