import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface OutfitSuggestion {
  id: number;
  suggestedItems: number[];
  occasion: string;
  weather: string;
  confidenceScore: number;
  reasoning: string;
  isAccepted?: boolean;
  createdAt: string;
}

export default function AIOutfitAssistant() {
  const userId = 1;
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['/api/users', userId, 'outfit-suggestions'],
  });

  const generateSuggestionMutation = useMutation({
    mutationFn: async (params: { occasion: string; weather: string }) => {
      const suggestionData = {
        suggestedItems: [1, 2, 3], // Mock wardrobe item IDs
        occasion: params.occasion,
        weather: params.weather,
        confidenceScore: Math.floor(Math.random() * 20) + 80, // 80-100
        reasoning: `Perfect combination for ${params.occasion} in ${params.weather} weather. These pieces complement your style profile and color preferences.`
      };
      
      return await apiRequest(`/api/users/${userId}/outfit-suggestions`, {
        method: 'POST',
        body: JSON.stringify(suggestionData),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'outfit-suggestions'] });
    },
  });

  const handleQuickSuggestion = (occasion: string, weather: string) => {
    generateSuggestionMutation.mutate({ occasion, weather });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Outfit Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-gradient-purple-pink" />
          One-Click Outfit Matching
        </CardTitle>
        <CardDescription>
          AI-powered outfit suggestions based on occasion and weather
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleQuickSuggestion('business casual', 'mild')}
            disabled={generateSuggestionMutation.isPending}
            className="h-auto p-3 flex flex-col items-center"
          >
            <Sparkles className="h-4 w-4 mb-1" />
            <span className="text-xs">Work Meeting</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleQuickSuggestion('casual', 'warm')}
            disabled={generateSuggestionMutation.isPending}
            className="h-auto p-3 flex flex-col items-center"
          >
            <Sparkles className="h-4 w-4 mb-1" />
            <span className="text-xs">Weekend Casual</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleQuickSuggestion('formal', 'cool')}
            disabled={generateSuggestionMutation.isPending}
            className="h-auto p-3 flex flex-col items-center"
          >
            <Sparkles className="h-4 w-4 mb-1" />
            <span className="text-xs">Date Night</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleQuickSuggestion('athletic', 'any')}
            disabled={generateSuggestionMutation.isPending}
            className="h-auto p-3 flex flex-col items-center"
          >
            <Sparkles className="h-4 w-4 mb-1" />
            <span className="text-xs">Gym Session</span>
          </Button>
        </div>

        <div className="space-y-3">
          {suggestions?.slice(0, 3).map((suggestion: OutfitSuggestion) => (
            <div key={suggestion.id} className="border rounded-lg p-4 bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  <Badge className="bg-gradient-blue-teal text-white">{suggestion.occasion}</Badge>
                  <Badge variant="outline">{suggestion.weather}</Badge>
                </div>
                <Badge variant="secondary">
                  {suggestion.confidenceScore}% match
                </Badge>
              </div>
              
              <p className="text-sm text-slate-700 mb-3">{suggestion.reasoning}</p>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Accept
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>

        {(!suggestions || suggestions.length === 0) && (
          <div className="text-center py-8 text-slate-500">
            <Wand2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No outfit suggestions yet. Click above to get AI recommendations!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}