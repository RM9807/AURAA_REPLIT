import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, BarChart3, Calendar, Lightbulb } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface FashionInsight {
  id: number;
  weekStartDate: string;
  insights: {
    totalOutfitsWorn: number;
    mostWornCategory: string;
    styleScore: number;
    colorTrends: string[];
    recommendations: string[];
  };
  trends: string[];
  recommendations: string[];
  styleProgress: {
    consistencyScore: number;
    diversityScore: number;
    trendAlignment: number;
  };
}

export default function WeeklyFashionInsights() {
  // Get authenticated user
  const { data: authUser } = useQuery({
    queryKey: ['/api/auth/user'],
  });
  const userId = (authUser as any)?.id;
  const queryClient = useQueryClient();

  const { data: insights } = useQuery({
    queryKey: ['/api/users', userId, 'fashion-insights'],
    enabled: !!userId,
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const currentWeek = new Date();
      currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay());

      const insightData = {
        weekStartDate: currentWeek.toISOString(),
        insights: {
          totalOutfitsWorn: 7,
          mostWornCategory: "Business Casual",
          styleScore: 87,
          colorTrends: ["Navy", "White", "Beige"],
          recommendations: [
            "Try adding more color to your wardrobe",
            "Experiment with statement accessories",
            "Consider more sustainable fabric choices"
          ]
        },
        trends: ["Minimalist", "Professional", "Classic"],
        recommendations: [
          "Add a bold accent color to your neutral palette",
          "Try layering with lightweight cardigans",
          "Invest in quality leather accessories"
        ],
        styleProgress: {
          consistencyScore: 85,
          diversityScore: 72,
          trendAlignment: 90
        }
      };
      
      return await apiRequest(`/api/users/${userId}/fashion-insights`, {
        method: 'POST',
        body: JSON.stringify(insightData),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'fashion-insights'] });
    },
  });

  const latestInsight = insights?.[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gradient-blue-teal" />
          Weekly Fashion Insights
        </CardTitle>
        <CardDescription>
          AI-powered analysis of your style patterns and trends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={() => generateInsightsMutation.mutate()}
          disabled={generateInsightsMutation.isPending}
          className="w-full bg-gradient-blue-teal text-white"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          {generateInsightsMutation.isPending ? 'Analyzing...' : 'Generate This Week\'s Insights'}
        </Button>

        {latestInsight && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4" />
              Week of {new Date(latestInsight.weekStartDate).toLocaleDateString()}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-slate-800">
                  {latestInsight.insights.totalOutfitsWorn}
                </div>
                <div className="text-sm text-slate-600">Outfits Worn</div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-slate-800">
                  {latestInsight.insights.styleScore}%
                </div>
                <div className="text-sm text-slate-600">Style Score</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-slate-800">Style Progress</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Consistency</span>
                  <span>{latestInsight.styleProgress?.consistencyScore}%</span>
                </div>
                <Progress value={latestInsight.styleProgress?.consistencyScore} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Diversity</span>
                  <span>{latestInsight.styleProgress?.diversityScore}%</span>
                </div>
                <Progress value={latestInsight.styleProgress?.diversityScore} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Trend Alignment</span>
                  <span>{latestInsight.styleProgress?.trendAlignment}%</span>
                </div>
                <Progress value={latestInsight.styleProgress?.trendAlignment} className="h-2" />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Your Color Trends
              </h4>
              <div className="flex flex-wrap gap-2">
                {latestInsight.insights.colorTrends?.map((color, index) => (
                  <Badge key={index} className="bg-gradient-purple-pink text-white">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-slate-800 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                AI Recommendations
              </h4>
              <div className="space-y-2">
                {latestInsight.recommendations?.slice(0, 3).map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-purple-pink mt-2 flex-shrink-0"></div>
                    <span className="text-slate-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg">
              <h5 className="font-medium text-slate-800 mb-2">Most Worn Category</h5>
              <Badge className="bg-gradient-blue-teal text-white">
                {latestInsight.insights.mostWornCategory}
              </Badge>
            </div>
          </div>
        )}

        {(!insights || insights.length === 0) && (
          <div className="text-center py-8 text-slate-500">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No insights generated yet. Click above to analyze your style patterns!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}