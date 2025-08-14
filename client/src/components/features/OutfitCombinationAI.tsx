import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Cloud, 
  Sun, 
  CloudRain, 
  Snowflake,
  Calendar,
  MapPin,
  Thermometer,
  Wind,
  Umbrella,
  Shirt,
  Heart,
  RefreshCw,
  Check,
  X
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface OutfitSuggestion {
  id: number;
  userId: number;
  suggestedItems: any[];
  occasion: string;
  weather: string;
  confidenceScore: number;
  reasoning: string;
  isAccepted: boolean;
  createdAt: string;
  temperature?: number;
  windSpeed?: number;
  humidity?: number;
  precipitation?: number;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  description: string;
}

interface OutfitRequest {
  occasion: string;
  weather: WeatherData;
  location: string;
  preferences?: string[];
}

const weatherIcons = {
  sunny: <Sun className="h-5 w-5 text-yellow-500" />,
  cloudy: <Cloud className="h-5 w-5 text-gray-500" />,
  rainy: <CloudRain className="h-5 w-5 text-blue-500" />,
  snowy: <Snowflake className="h-5 w-5 text-blue-300" />,
  windy: <Wind className="h-5 w-5 text-gray-600" />
};

export default function OutfitCombinationAI() {
  const [activeTab, setActiveTab] = useState<'generate' | 'suggestions' | 'weather'>('generate');
  const [outfitRequest, setOutfitRequest] = useState<OutfitRequest>({
    occasion: '',
    weather: {
      temperature: 22,
      condition: 'sunny',
      humidity: 50,
      windSpeed: 10,
      precipitation: 0,
      description: 'Clear skies'
    },
    location: '',
    preferences: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Get authenticated user
  const { data: authUser } = useQuery({
    queryKey: ['/api/auth/user'],
  });
  const userId = (authUser as any)?.id;
  const queryClient = useQueryClient();

  const { data: outfitSuggestions, isLoading: suggestionsLoading } = useQuery<OutfitSuggestion[]>({
    queryKey: ['/api/users', userId, 'outfit-suggestions'],
    enabled: !!userId,
  });

  const { data: wardrobe } = useQuery({
    queryKey: ['/api/users', userId, 'wardrobe'],
  });

  const { data: profile } = useQuery({
    queryKey: ['/api/users', userId, 'profile'],
  });

  const generateOutfitMutation = useMutation({
    mutationFn: async (request: OutfitRequest) => {
      setIsGenerating(true);
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create outfit suggestion based on weather and occasion
      const suggestion = {
        occasion: request.occasion,
        weather: JSON.stringify(request.weather),
        suggestedItems: generateOutfitItems(request),
        confidenceScore: Math.floor(Math.random() * 20) + 80, // 80-100%
        reasoning: generateOutfitReasoning(request),
        temperature: request.weather.temperature,
        windSpeed: request.weather.windSpeed,
        humidity: request.weather.humidity,
        precipitation: request.weather.precipitation
      };

      return await apiRequest(`/api/users/${userId}/outfit-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestion),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'outfit-suggestions'] });
      setIsGenerating(false);
    },
    onError: () => {
      setIsGenerating(false);
    }
  });

  const acceptOutfitMutation = useMutation({
    mutationFn: async (suggestionId: number) => {
      return await apiRequest(`/api/outfit-suggestions/${suggestionId}/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'outfit-suggestions'] });
    },
  });

  const generateOutfitItems = (request: OutfitRequest) => {
    const { weather, occasion } = request;
    const items = [];

    // Weather-based clothing selection
    if (weather.temperature < 10) {
      items.push(
        { type: 'outerwear', item: 'Heavy coat', color: 'navy', reason: 'Cold weather protection' },
        { type: 'bottom', item: 'Thermal pants', color: 'black', reason: 'Warmth and insulation' },
        { type: 'accessory', item: 'Wool scarf', color: 'gray', reason: 'Neck warmth' }
      );
    } else if (weather.temperature < 20) {
      items.push(
        { type: 'outerwear', item: 'Light jacket', color: 'beige', reason: 'Layering for comfort' },
        { type: 'bottom', item: 'Jeans', color: 'dark blue', reason: 'Versatile and comfortable' }
      );
    } else {
      items.push(
        { type: 'top', item: 'Cotton t-shirt', color: 'white', reason: 'Breathable in warm weather' },
        { type: 'bottom', item: 'Shorts', color: 'khaki', reason: 'Cool and comfortable' }
      );
    }

    // Rain protection
    if (weather.precipitation > 50) {
      items.push(
        { type: 'outerwear', item: 'Rain jacket', color: 'navy', reason: 'Waterproof protection' },
        { type: 'footwear', item: 'Waterproof boots', color: 'black', reason: 'Dry feet' }
      );
    }

    // Occasion-based additions
    if (occasion === 'business') {
      items.push(
        { type: 'top', item: 'Dress shirt', color: 'white', reason: 'Professional appearance' },
        { type: 'bottom', item: 'Dress pants', color: 'charcoal', reason: 'Business appropriate' },
        { type: 'footwear', item: 'Oxford shoes', color: 'black', reason: 'Formal footwear' }
      );
    } else if (occasion === 'casual') {
      items.push(
        { type: 'top', item: 'Casual shirt', color: 'blue', reason: 'Relaxed style' },
        { type: 'footwear', item: 'Sneakers', color: 'white', reason: 'Comfort and style' }
      );
    } else if (occasion === 'workout') {
      items.push(
        { type: 'top', item: 'Athletic shirt', color: 'gray', reason: 'Moisture-wicking' },
        { type: 'bottom', item: 'Athletic shorts', color: 'black', reason: 'Flexible movement' },
        { type: 'footwear', item: 'Running shoes', color: 'blue', reason: 'Performance support' }
      );
    }

    return items;
  };

  const generateOutfitReasoning = (request: OutfitRequest) => {
    const { weather, occasion } = request;
    let reasoning = `Perfect outfit for ${occasion} activities. `;

    if (weather.temperature < 10) {
      reasoning += `Cold weather requires layering and insulation. `;
    } else if (weather.temperature > 25) {
      reasoning += `Warm weather calls for breathable, light fabrics. `;
    }

    if (weather.precipitation > 50) {
      reasoning += `Rain protection is essential. `;
    }

    if (weather.windSpeed > 20) {
      reasoning += `Windy conditions require secure, fitted clothing. `;
    }

    reasoning += `This combination balances comfort, practicality, and style.`;
    return reasoning;
  };

  const handleGenerateOutfit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outfitRequest.occasion) return;
    
    generateOutfitMutation.mutate(outfitRequest);
  };

  const getWeatherIcon = (condition: string) => {
    return weatherIcons[condition as keyof typeof weatherIcons] || weatherIcons.sunny;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gradient-blue-teal" />
            AI Outfit Combination Engine
          </CardTitle>
          <CardDescription>
            Get personalized outfit suggestions based on weather conditions and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate">Generate Outfit</TabsTrigger>
              <TabsTrigger value="suggestions">My Suggestions</TabsTrigger>
              <TabsTrigger value="weather">Weather Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create New Outfit Suggestion</CardTitle>
                  <CardDescription>
                    Tell us about your occasion and we'll suggest the perfect outfit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerateOutfit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="occasion">Occasion *</Label>
                        <Select 
                          value={outfitRequest.occasion} 
                          onValueChange={(value) => setOutfitRequest(prev => ({ ...prev, occasion: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select occasion" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business">Business Meeting</SelectItem>
                            <SelectItem value="casual">Casual Outing</SelectItem>
                            <SelectItem value="date">Date Night</SelectItem>
                            <SelectItem value="workout">Workout Session</SelectItem>
                            <SelectItem value="formal">Formal Event</SelectItem>
                            <SelectItem value="travel">Travel</SelectItem>
                            <SelectItem value="party">Party/Social</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={outfitRequest.location}
                          onChange={(e) => setOutfitRequest(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g., New York, Office, Restaurant"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        {getWeatherIcon(outfitRequest.weather.condition)}
                        <span className="font-medium">Current Weather Conditions</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Thermometer className="h-4 w-4" />
                          <span>{outfitRequest.weather.temperature}°C</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Wind className="h-4 w-4" />
                          <span>{outfitRequest.weather.windSpeed} km/h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Umbrella className="h-4 w-4" />
                          <span>{outfitRequest.weather.precipitation}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{outfitRequest.weather.humidity}% humidity</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-purple-pink hover:opacity-90 text-white"
                      disabled={isGenerating || !outfitRequest.occasion}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating Perfect Outfit...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Outfit Suggestion
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Outfit Suggestions</CardTitle>
                  <CardDescription>
                    AI-generated outfit combinations based on your preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {suggestionsLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-gradient-blue-teal" />
                    </div>
                  ) : outfitSuggestions && outfitSuggestions.length > 0 ? (
                    <div className="space-y-4">
                      {outfitSuggestions.map((suggestion: OutfitSuggestion) => (
                        <Card key={suggestion.id} className="border-l-4 border-l-gradient-blue-teal">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="h-4 w-4 text-gray-600" />
                                  <span className="font-medium capitalize">{suggestion.occasion}</span>
                                  <Badge className={getConfidenceColor(suggestion.confidenceScore)}>
                                    {suggestion.confidenceScore}% match
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
                              </div>
                              <div className="flex gap-2">
                                {!suggestion.isAccepted && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => acceptOutfitMutation.mutate(suggestion.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Accept
                                  </Button>
                                )}
                                {suggestion.isAccepted && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <Check className="h-4 w-4 mr-1" />
                                    Accepted
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                {suggestion.weather && (
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <Thermometer className="h-4 w-4" />
                                      <span>{suggestion.temperature}°C</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Wind className="h-4 w-4" />
                                      <span>{suggestion.windSpeed} km/h</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Umbrella className="h-4 w-4" />
                                      <span>{suggestion.precipitation}%</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <h4 className="font-medium mb-2">Suggested Items:</h4>
                                  <div className="space-y-1">
                                    {Array.isArray(suggestion.suggestedItems) && suggestion.suggestedItems.map((item: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-2 text-sm">
                                        <Shirt className="h-4 w-4 text-gray-400" />
                                        <span className="capitalize">{item.color} {item.item}</span>
                                        <Badge variant="outline" className="text-xs">{item.type}</Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">Reasoning:</h4>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    {Array.isArray(suggestion.suggestedItems) && suggestion.suggestedItems.map((item: any, idx: number) => (
                                      <div key={idx} className="text-xs">
                                        • {item.reason}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No outfit suggestions yet. Generate your first outfit!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weather" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weather Configuration</CardTitle>
                  <CardDescription>
                    Adjust weather parameters for accurate outfit recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        value={outfitRequest.weather.temperature}
                        onChange={(e) => setOutfitRequest(prev => ({ 
                          ...prev, 
                          weather: { ...prev.weather, temperature: parseInt(e.target.value) || 0 }
                        }))}
                        min="-20"
                        max="50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="condition">Weather Condition</Label>
                      <Select 
                        value={outfitRequest.weather.condition} 
                        onValueChange={(value) => setOutfitRequest(prev => ({ 
                          ...prev, 
                          weather: { ...prev.weather, condition: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sunny">Sunny</SelectItem>
                          <SelectItem value="cloudy">Cloudy</SelectItem>
                          <SelectItem value="rainy">Rainy</SelectItem>
                          <SelectItem value="snowy">Snowy</SelectItem>
                          <SelectItem value="windy">Windy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="humidity">Humidity (%)</Label>
                      <Input
                        id="humidity"
                        type="number"
                        value={outfitRequest.weather.humidity}
                        onChange={(e) => setOutfitRequest(prev => ({ 
                          ...prev, 
                          weather: { ...prev.weather, humidity: parseInt(e.target.value) || 0 }
                        }))}
                        min="0"
                        max="100"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="windSpeed">Wind Speed (km/h)</Label>
                      <Input
                        id="windSpeed"
                        type="number"
                        value={outfitRequest.weather.windSpeed}
                        onChange={(e) => setOutfitRequest(prev => ({ 
                          ...prev, 
                          weather: { ...prev.weather, windSpeed: parseInt(e.target.value) || 0 }
                        }))}
                        min="0"
                        max="100"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="precipitation">Precipitation Chance (%)</Label>
                      <Input
                        id="precipitation"
                        type="number"
                        value={outfitRequest.weather.precipitation}
                        onChange={(e) => setOutfitRequest(prev => ({ 
                          ...prev, 
                          weather: { ...prev.weather, precipitation: parseInt(e.target.value) || 0 }
                        }))}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getWeatherIcon(outfitRequest.weather.condition)}
                      <span className="font-medium">Weather Preview</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-4 w-4" />
                        <span>{outfitRequest.weather.temperature}°C</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wind className="h-4 w-4" />
                        <span>{outfitRequest.weather.windSpeed} km/h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Umbrella className="h-4 w-4" />
                        <span>{outfitRequest.weather.precipitation}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{outfitRequest.weather.humidity}% humidity</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}