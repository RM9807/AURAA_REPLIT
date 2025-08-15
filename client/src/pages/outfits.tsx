import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Sparkles, Calendar, Shirt, Heart, Search, Trash2, Filter, Plus, Grid, List, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  createdAt?: string;
}

export default function Outfits() {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOccasion, setFilterOccasion] = useState("");
  const [filterSeason, setFilterSeason] = useState("");

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

  // Get user's outfits
  const { data: outfits = [], isLoading: outfitsLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/outfits`],
    enabled: !!user?.id
  });

  // Delete outfit mutation
  const deleteOutfitMutation = useMutation({
    mutationFn: async (outfitId: number) => {
      return apiRequest(`/api/outfits/${outfitId}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/outfits`] });
      toast({
        title: "Outfit Deleted",
        description: "The outfit has been successfully removed."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete outfit. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Filter outfits based on search and filters
  const filteredOutfits = outfits.filter((outfit: GeneratedOutfit) => {
    const matchesSearch = outfit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         outfit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         outfit.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesOccasion = !filterOccasion || outfit.occasion === filterOccasion;
    const matchesSeason = !filterSeason || outfit.season === filterSeason;
    
    return matchesSearch && matchesOccasion && matchesSeason;
  });

  // Get unique occasions and seasons for filters
  const uniqueOccasions = [...new Set(outfits.map((outfit: GeneratedOutfit) => outfit.occasion))].filter(Boolean);
  const uniqueSeasons = [...new Set(outfits.map((outfit: GeneratedOutfit) => outfit.season))].filter(Boolean);

  // Get outfits by category
  const recentOutfits = filteredOutfits.slice(0, 6);
  const favoriteOutfits = filteredOutfits.filter((outfit: GeneratedOutfit) => 
    outfit.tags?.includes('favorite') || outfit.tags?.includes('liked')
  );
  const workOutfits = filteredOutfits.filter((outfit: GeneratedOutfit) => 
    outfit.occasion.toLowerCase().includes('work') || outfit.occasion.toLowerCase().includes('professional')
  );
  const casualOutfits = filteredOutfits.filter((outfit: GeneratedOutfit) => 
    outfit.occasion.toLowerCase().includes('casual') || outfit.occasion.toLowerCase().includes('weekend')
  );

  const renderOutfitCard = (outfit: GeneratedOutfit) => {
    // Get wardrobe items that match the outfit items
    const outfitWardrobeItems = Array.isArray(wardrobeItems) 
      ? wardrobeItems.filter(item => outfit.items.includes(item.id))
      : [];

    if (viewMode === "list") {
      return (
        <Card key={outfit.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Shirt className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-lg">{outfit.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {outfit.occasion}
                  </Badge>
                  {outfit.season && (
                    <Badge variant="secondary" className="text-xs">
                      {outfit.season}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{outfit.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{outfitWardrobeItems.length} items</span>
                  {outfit.createdAt && (
                    <span>• Created {new Date(outfit.createdAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${outfit.name}"?`)) {
                      deleteOutfitMutation.mutate(outfit.id);
                    }
                  }}
                  disabled={deleteOutfitMutation.isPending}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  {deleteOutfitMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
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
          <div className="flex flex-wrap gap-2 mb-4">
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
          
          {/* Display outfit items count */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {outfitWardrobeItems.length} items from your wardrobe
            </p>
          </div>

          {outfit.reasoning && (
            <div className="text-sm bg-muted p-3 rounded-lg mb-3">
              <strong>Style Reasoning:</strong> {outfit.reasoning}
            </div>
          )}

          {outfit.tags && outfit.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {outfit.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Delete button */}
          <div className="flex justify-end pt-2 border-t border-muted">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${outfit.name}"? This action cannot be undone.`)) {
                  deleteOutfitMutation.mutate(outfit.id);
                }
              }}
              disabled={deleteOutfitMutation.isPending}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {deleteOutfitMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="ml-2">Delete</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <Sparkles className="h-12 w-12 text-purple-600" />
            <p>Please log in to view your outfits</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Shirt className="h-8 w-8 text-purple-600" />
            My Outfits
          </h1>
          <p className="text-muted-foreground">
            Manage and explore your AI-generated outfit collection
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search outfits by name, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterOccasion} onValueChange={setFilterOccasion}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Occasions</SelectItem>
                  {uniqueOccasions.map((occasion) => (
                    <SelectItem key={occasion} value={occasion}>
                      {occasion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterSeason} onValueChange={setFilterSeason}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Seasons</SelectItem>
                  {uniqueSeasons.map((season) => (
                    <SelectItem key={season} value={season}>
                      {season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {filteredOutfits.length} outfit{filteredOutfits.length !== 1 ? 's' : ''} found
            </p>
            <Button onClick={() => window.location.href = '/outfit-generator'} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Generate New Outfit
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Outfits</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="work">Work</TabsTrigger>
            <TabsTrigger value="casual">Casual</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {outfitsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : filteredOutfits.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Sparkles className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Outfits Found</h3>
                  <p className="text-muted-foreground mb-6">
                    {outfits.length === 0 
                      ? "You haven't generated any outfits yet. Start creating your personalized wardrobe!"
                      : "No outfits match your current search and filters."
                    }
                  </p>
                  <Button onClick={() => window.location.href = '/outfit-generator'}>
                    Generate Your First Outfit
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {filteredOutfits.map(renderOutfitCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {recentOutfits.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                    <p className="text-muted-foreground">No recent outfits to show</p>
                  </CardContent>
                </Card>
              ) : (
                recentOutfits.map(renderOutfitCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {favoriteOutfits.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <Heart className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                    <p className="text-muted-foreground">No favorite outfits yet</p>
                  </CardContent>
                </Card>
              ) : (
                favoriteOutfits.map(renderOutfitCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="work" className="space-y-6">
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {workOutfits.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <Shirt className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                    <p className="text-muted-foreground">No work outfits generated yet</p>
                  </CardContent>
                </Card>
              ) : (
                workOutfits.map(renderOutfitCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="casual" className="space-y-6">
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {casualOutfits.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <Shirt className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                    <p className="text-muted-foreground">No casual outfits generated yet</p>
                  </CardContent>
                </Card>
              ) : (
                casualOutfits.map(renderOutfitCard)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}