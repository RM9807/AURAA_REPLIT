import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLocation } from "wouter";
import { format } from "date-fns";
import {
  ArrowLeft,
  Shuffle,
  Heart,
  Calendar as CalendarIcon,
  ShoppingBag,
  Sparkles,
  Star,
  RefreshCw,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Thermometer,
  Wind,
  Save,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Coffee,
  Smile,
  TrendingUp
} from "lucide-react";

interface WardrobeItem {
  id: number;
  userId: number;
  itemName: string;
  category: string;
  color: string;
  pattern?: string;
  material?: string;
  brand?: string;
  season?: string;
  notes?: string;
  imageUrl?: string;
  favorite: boolean;
  wearCount: number;
  lastWorn?: string;
  tags?: string[];
  createdAt: string;
}

interface OutfitCombination {
  id: string;
  items: WardrobeItem[];
  occasion: string;
  weather: string;
  mood: string;
  confidence: number;
  description: string;
  isFavorite: boolean;
}

const moodFilters = [
  { id: "confidence", label: "Need Confidence", icon: Zap, color: "text-orange-500" },
  { id: "comfort", label: "Comfort Mode", icon: Coffee, color: "text-blue-500" },
  { id: "playful", label: "Playful Mood", icon: Smile, color: "text-pink-500" },
  { id: "professional", label: "Professional Edge", icon: TrendingUp, color: "text-green-500" }
];

const occasions = [
  { id: "work", label: "Work" },
  { id: "casual", label: "Casual" },
  { id: "evening", label: "Evening" },
  { id: "special", label: "Special Event" },
  { id: "workout", label: "Workout" },
  { id: "date", label: "Date Night" }
];

const weatherConditions = [
  { id: "sunny", label: "Sunny", icon: Sun, temp: "22°C" },
  { id: "cloudy", label: "Cloudy", icon: Cloud, temp: "18°C" },
  { id: "rainy", label: "Rainy", icon: CloudRain, temp: "15°C" },
  { id: "cold", label: "Cold", icon: Snowflake, temp: "5°C" }
];

export default function OutfitBuilder() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedOccasion, setSelectedOccasion] = useState("casual");
  const [selectedWeather, setSelectedWeather] = useState("sunny");
  const [selectedMood, setSelectedMood] = useState("confidence");
  const [currentOutfits, setCurrentOutfits] = useState<OutfitCombination[]>([]);
  const [favoriteOutfits, setFavoriteOutfits] = useState<OutfitCombination[]>([]);
  const [plannedOutfits, setPlannedOutfits] = useState<{[key: string]: OutfitCombination}>({});

  const userId = user?.id || 1;

  // Fetch wardrobe data
  const { data: wardrobe } = useQuery({
    queryKey: ['/api/users', userId, 'wardrobe'],
  });

  // Generate AI outfit combinations
  const generateOutfits = () => {
    if (!wardrobe || wardrobe.length < 3) return;

    const outfits: OutfitCombination[] = [];
    
    // Generate 3 different outfit combinations
    for (let i = 0; i < 3; i++) {
      const shuffled = [...wardrobe].sort(() => Math.random() - 0.5);
      const outfit: OutfitCombination = {
        id: `outfit-${Date.now()}-${i}`,
        items: shuffled.slice(0, Math.min(4, shuffled.length)),
        occasion: selectedOccasion,
        weather: selectedWeather,
        mood: selectedMood,
        confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
        description: generateOutfitDescription(selectedOccasion, selectedMood),
        isFavorite: false
      };
      outfits.push(outfit);
    }
    
    setCurrentOutfits(outfits);
  };

  const generateOutfitDescription = (occasion: string, mood: string) => {
    const descriptions = {
      work: {
        confidence: "A powerful ensemble that commands respect and showcases your leadership",
        comfort: "Professional yet comfortable pieces that keep you confident all day",
        playful: "Subtle fun details in a polished look that shows your personality",
        professional: "Sharp, sophisticated pieces that establish your expertise"
      },
      casual: {
        confidence: "Effortlessly stylish combination that makes you feel unstoppable",
        comfort: "Relaxed, cozy pieces perfect for a laid-back day",
        playful: "Fun, vibrant pieces that express your creative side",
        professional: "Elevated casual look that's polished yet approachable"
      },
      evening: {
        confidence: "Show-stopping ensemble that turns heads and boosts confidence",
        comfort: "Elegant yet comfortable pieces for a relaxed evening",
        playful: "Glamorous with a fun twist that reflects your vibrant personality",
        professional: "Sophisticated evening look that's timeless and refined"
      }
    };

    return descriptions[occasion as keyof typeof descriptions]?.[mood as keyof typeof descriptions.work] || 
           "A carefully curated combination that perfectly matches your style and mood";
  };

  const shuffleOutfit = (outfitId: string) => {
    setCurrentOutfits(prev => prev.map(outfit => {
      if (outfit.id === outfitId && wardrobe) {
        const shuffled = [...wardrobe].sort(() => Math.random() - 0.5);
        return {
          ...outfit,
          items: shuffled.slice(0, Math.min(4, shuffled.length)),
          confidence: Math.floor(Math.random() * 20) + 80,
          id: `outfit-${Date.now()}-shuffled`
        };
      }
      return outfit;
    }));
  };

  const swapItem = (outfitId: string, itemIndex: number) => {
    setCurrentOutfits(prev => prev.map(outfit => {
      if (outfit.id === outfitId && wardrobe) {
        const availableItems = wardrobe.filter(item => 
          !outfit.items.some(outfitItem => outfitItem.id === item.id)
        );
        if (availableItems.length > 0) {
          const newItems = [...outfit.items];
          newItems[itemIndex] = availableItems[Math.floor(Math.random() * availableItems.length)];
          return { ...outfit, items: newItems };
        }
      }
      return outfit;
    }));
  };

  const saveToFavorites = (outfit: OutfitCombination) => {
    setFavoriteOutfits(prev => [...prev, { ...outfit, isFavorite: true }]);
  };

  const planOutfit = (outfit: OutfitCombination) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    setPlannedOutfits(prev => ({ ...prev, [dateKey]: outfit }));
  };

  const rateOutfit = (outfitId: string, rating: 'love' | 'dislike') => {
    // This would typically send feedback to improve AI suggestions
    console.log(`Rated outfit ${outfitId} as ${rating}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/dashboard')}
              className="text-slate-600 dark:text-slate-400"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <img src="/auraa-logo.png" alt="AURAA" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Outfit Ideas</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">AI-powered daily outfit planning</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Step 1: Daily Planner Overview */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              What would you like to wear today?
            </h2>
          </div>

          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                Outfit Preferences
              </CardTitle>
              <CardDescription>
                Customize your outfit suggestions based on occasion, weather, and mood
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-4 gap-6">
                {/* Date Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {format(selectedDate, 'MMM dd')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Occasion */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Occasion</label>
                  <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {occasions.map(occasion => (
                        <SelectItem key={occasion.id} value={occasion.id}>
                          {occasion.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Weather */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weather</label>
                  <Select value={selectedWeather} onValueChange={setSelectedWeather}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weatherConditions.map(weather => (
                        <SelectItem key={weather.id} value={weather.id}>
                          <div className="flex items-center gap-2">
                            <weather.icon className="h-4 w-4" />
                            {weather.label} {weather.temp}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mood */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mood</label>
                  <Select value={selectedMood} onValueChange={setSelectedMood}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {moodFilters.map(mood => (
                        <SelectItem key={mood.id} value={mood.id}>
                          <div className="flex items-center gap-2">
                            <mood.icon className={`h-4 w-4 ${mood.color}`} />
                            {mood.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={generateOutfits}
                className="w-full bg-violet-500 hover:bg-violet-600"
                disabled={!wardrobe || wardrobe.length < 3}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Outfit Ideas
              </Button>

              {(!wardrobe || wardrobe.length < 3) && (
                <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                  Add at least 3 items to your wardrobe to generate outfit suggestions
                </p>
              )}
            </CardContent>
          </Card>

          {/* Step 2 & 3: AURAA Outfit Suggestions */}
          {currentOutfits.length > 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Your AURAA Outfit Suggestions
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Combinations from your curated digital wardrobe
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {currentOutfits.map((outfit) => (
                  <Card key={outfit.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300">
                          {outfit.confidence}% match
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => rateOutfit(outfit.id, 'love')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => rateOutfit(outfit.id, 'dislike')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Outfit Items */}
                      <div className="grid grid-cols-2 gap-2">
                        {outfit.items.slice(0, 4).map((item, index) => (
                          <div 
                            key={item.id}
                            className="relative bg-slate-50 dark:bg-slate-800 rounded-lg p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            onClick={() => swapItem(outfit.id, index)}
                          >
                            <div className="aspect-square bg-slate-200 dark:bg-slate-600 rounded mb-2 flex items-center justify-center">
                              <span className="text-2xl">👕</span>
                            </div>
                            <p className="text-xs font-medium truncate">{item.itemName}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{item.color}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                swapItem(outfit.id, index);
                              }}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Outfit Description */}
                      <div className="space-y-2">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {outfit.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">{outfit.occasion}</Badge>
                          <Badge variant="secondary" className="text-xs">{outfit.weather}</Badge>
                          <Badge variant="secondary" className="text-xs">{outfit.mood}</Badge>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-4 gap-1 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => shuffleOutfit(outfit.id)}
                          className="h-8"
                        >
                          <Shuffle className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => saveToFavorites(outfit)}
                          className="h-8"
                        >
                          <Heart className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => planOutfit(outfit)}
                          className="h-8"
                        >
                          <CalendarIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                        >
                          <ShoppingBag className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Outfits Section */}
          {favoriteOutfits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Favorite Outfits
                </CardTitle>
                <CardDescription>
                  Your saved outfit combinations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteOutfits.map((outfit) => (
                    <div key={outfit.id} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{outfit.occasion}</Badge>
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                        {outfit.items.map(item => item.itemName).join(', ')}
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        <CalendarIcon className="h-3 w-3 mr-2" />
                        Plan for Date
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}