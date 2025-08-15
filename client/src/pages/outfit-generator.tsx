import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Calendar, Sun, Shirt, Heart, TrendingUp, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GeneratedOutfit {
  id: number;
  name: string;
  description: string;
  occasion: string;
  season?: string;
  mood?: string;
  items: number[];
  tags: string[];
  reasoning?: string;
  weatherConditions?: any;
}

interface OutfitGenerationForm {
  occasion: string;
  weather: string;
  mood: string;
  season: string;
  preferences: string;
  numberOfOutfits: number;
}

export default function OutfitGenerator() {
  const [activeTab, setActiveTab] = useState("generate");
  const [formData, setFormData] = useState<OutfitGenerationForm>({
    occasion: "",
    weather: "",
    mood: "",
    season: "",
    preferences: "",
    numberOfOutfits: 3
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"]
  });

  // Get user's wardrobe items
  const { data: wardrobeItems = [] } = useQuery({
    queryKey: [`/api/users/${user?.id}/wardrobe`],
    enabled: !!user?.id
  });

  // Get user's existing outfits  
  const { data: existingOutfits = [] } = useQuery({
    queryKey: [`/api/users/${user?.id}/outfits`],
    enabled: !!user?.id
  });

  // Generate outfit mutation
  const generateOutfitsMutation = useMutation({
    mutationFn: async (data: OutfitGenerationForm) => {
      return await apiRequest(`/api/users/${user?.id}/outfits/generate`, {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/outfits`] });
      toast({
        title: "Outfits Generated!",
        description: `Successfully created ${data.outfits.length} new outfit suggestions.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate outfits. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Weekly planner mutation
  const weeklyPlannerMutation = useMutation({
    mutationFn: async (occasions: string[]) => {
      return await apiRequest(`/api/users/${user?.id}/outfits/weekly`, {
        method: "POST",
        body: JSON.stringify({ occasions })
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/outfits`] });
      toast({
        title: "Weekly Plan Created!",
        description: `Generated ${data.outfits.length} outfits for your week.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Planning Failed",
        description: error.message || "Failed to create weekly plan.",
        variant: "destructive"
      });
    }
  });

  // Seasonal planner mutation
  const seasonalPlannerMutation = useMutation({
    mutationFn: async (season: string) => {
      return await apiRequest(`/api/users/${user?.id}/outfits/seasonal`, {
        method: "POST",
        body: JSON.stringify({ season })
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/outfits`] });
      toast({
        title: "Seasonal Collection Created!",
        description: `Generated ${data.outfits.length} outfits for ${data.season}.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Collection Failed",
        description: error.message || "Failed to create seasonal collection.",
        variant: "destructive"
      });
    }
  });

  const handleGenerate = () => {
    if (!formData.occasion || formData.occasion.trim() === "") {
      toast({
        title: "Occasion Required",
        description: "Please specify an occasion for your outfit.",
        variant: "destructive"
      });
      return;
    }

    // Log the form data being sent
    console.log("Generating outfits with data:", formData);
    
    generateOutfitsMutation.mutate(formData);
  };

  const handleWeeklyPlan = () => {
    const occasions = ['Work', 'Casual', 'Weekend', 'Date night'];
    weeklyPlannerMutation.mutate(occasions);
  };

  const handleSeasonalCollection = (season: string) => {
    seasonalPlannerMutation.mutate(season);
  };

  // Get recently generated outfits
  const recentOutfits = Array.isArray(existingOutfits) ? existingOutfits.slice(0, 6) : [];

  const renderOutfitCard = (outfit: GeneratedOutfit) => (
    <Card key={outfit.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shirt className="h-5 w-5 text-purple-600" />
          {outfit.name}
        </CardTitle>
        <CardDescription className="text-sm">
          {outfit.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {outfit.occasion}
          </Badge>
          {outfit.season && (
            <Badge variant="secondary" className="text-xs">
              {outfit.season}
            </Badge>
          )}
          {outfit.mood && (
            <Badge variant="secondary" className="text-xs">
              {outfit.mood}
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground mb-2">
          Items: {outfit.items.length} pieces from your wardrobe
        </div>

        {outfit.reasoning && (
          <div className="text-sm bg-muted p-3 rounded-lg mt-3">
            <strong>Style Reasoning:</strong> {outfit.reasoning}
          </div>
        )}

        {outfit.tags && outfit.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {outfit.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <Sparkles className="h-12 w-12 text-purple-600" />
            <p>Please log in to use the Outfit Generator</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!Array.isArray(wardrobeItems) || wardrobeItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-purple-600" />
              Outfit Generator & Planner
            </CardTitle>
            <CardDescription>
              AI-powered outfit suggestions based on your digital wardrobe
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You need to add items to your digital wardrobe before generating outfits.
            </p>
            <Button onClick={() => { window.location.href = '/digital-wardrobe'; }}>
              Go to Digital Wardrobe
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center gap-3">
            <Sparkles className="h-10 w-10 text-purple-600" />
            Outfit Generator & Planner
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered outfit suggestions based on your {Array.isArray(wardrobeItems) ? wardrobeItems.length : 0} wardrobe items and Style DNA
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto mb-8">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="seasonal" className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Seasonal
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Custom Outfits</CardTitle>
                <CardDescription>
                  Create personalized outfit suggestions based on specific occasions and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="occasion">Occasion *</Label>
                    <Select 
                      value={formData.occasion} 
                      onValueChange={(value) => {
                        console.log("Occasion selected:", value);
                        setFormData({...formData, occasion: value});
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select occasion" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="date night">Date Night</SelectItem>
                        <SelectItem value="weekend">Weekend</SelectItem>
                        <SelectItem value="party">Party</SelectItem>
                        <SelectItem value="formal">Formal Event</SelectItem>
                        <SelectItem value="business">Business Meeting</SelectItem>
                        <SelectItem value="vacation">Vacation</SelectItem>
                        <SelectItem value="workout">Workout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="weather">Weather</Label>
                    <Select 
                      value={formData.weather} 
                      onValueChange={(value) => setFormData({...formData, weather: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select weather" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunny">Sunny</SelectItem>
                        <SelectItem value="rainy">Rainy</SelectItem>
                        <SelectItem value="cold">Cold</SelectItem>
                        <SelectItem value="warm">Warm</SelectItem>
                        <SelectItem value="windy">Windy</SelectItem>
                        <SelectItem value="humid">Humid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="mood">Mood</Label>
                    <Select 
                      value={formData.mood} 
                      onValueChange={(value) => setFormData({...formData, mood: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mood" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confident">Confident</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="elegant">Elegant</SelectItem>
                        <SelectItem value="playful">Playful</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="relaxed">Relaxed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="season">Season</Label>
                    <Select 
                      value={formData.season} 
                      onValueChange={(value) => setFormData({...formData, season: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spring">Spring</SelectItem>
                        <SelectItem value="summer">Summer</SelectItem>
                        <SelectItem value="fall">Fall</SelectItem>
                        <SelectItem value="winter">Winter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="numberOfOutfits">Number of Outfits</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.numberOfOutfits}
                    onChange={(e) => setFormData({...formData, numberOfOutfits: parseInt(e.target.value) || 3})}
                  />
                </div>

                <div>
                  <Label htmlFor="preferences">Additional Preferences</Label>
                  <Textarea
                    placeholder="Any specific preferences or requirements for the outfit..."
                    value={formData.preferences}
                    onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                  />
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={generateOutfitsMutation.isPending || !formData.occasion}
                  className="w-full"
                  size="lg"
                >
                  {generateOutfitsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Outfits...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate {formData.numberOfOutfits} Outfits
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Outfit Planner</CardTitle>
                <CardDescription>
                  Generate a complete week's worth of outfit suggestions for different occasions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Shirt className="h-4 w-4" />
                      Work outfits
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Date night looks
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Weekend casual
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Special occasions
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleWeeklyPlan}
                    disabled={weeklyPlannerMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {weeklyPlannerMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Weekly Plan...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Create Weekly Plan
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seasonal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Collections</CardTitle>
                <CardDescription>
                  Generate outfit collections optimized for specific seasons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['spring', 'summer', 'fall', 'winter'].map((season) => (
                    <Button
                      key={season}
                      onClick={() => handleSeasonalCollection(season)}
                      disabled={seasonalPlannerMutation.isPending}
                      variant="outline"
                      className="h-20 flex flex-col gap-1"
                    >
                      <Sun className="h-6 w-6" />
                      <span className="capitalize">{season}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Recent Outfit Suggestions</h2>
              <p className="text-muted-foreground">
                Your latest AI-generated outfit combinations
              </p>
            </div>

            {recentOutfits.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Sparkles className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No outfits generated yet. Start by creating your first outfit!
                  </p>
                  <Button onClick={() => setActiveTab("generate")}>
                    Generate Outfits
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentOutfits.map(renderOutfitCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}