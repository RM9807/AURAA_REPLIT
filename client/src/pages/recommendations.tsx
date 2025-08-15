import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Sparkles, Star, ShoppingBag, Palette, TrendingUp, Search, Loader2, Heart, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StyleRecommendation {
  id: number;
  userId: number;
  type: string;
  title: string;
  description: string;
  priority: string;
  tags: string[];
  reasoning?: string;
  createdAt?: string;
}

export default function Recommendations() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const { toast } = useToast();

  // Get current user
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"]
  });

  // Get user's style recommendations
  const { data: recommendations = [], isLoading: recommendationsLoading, refetch } = useQuery<StyleRecommendation[]>({
    queryKey: [`/api/users/${user?.id}/recommendations`],
    enabled: !!user?.id
  });

  // Filter recommendations based on search and filters
  const filteredRecommendations = recommendations.filter((rec: StyleRecommendation) => {
    const matchesSearch = (rec.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (rec.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.tags?.some(tag => (tag || '').toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === "all" || rec.type === filterType;
    const matchesPriority = filterPriority === "all" || rec.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  // Get unique types and priorities for filters
  const uniqueTypes = Array.from(new Set(recommendations.map((rec: StyleRecommendation) => rec.type))).filter(Boolean);
  const uniquePriorities = Array.from(new Set(recommendations.map((rec: StyleRecommendation) => rec.priority))).filter(Boolean);

  // Get recommendations by category
  const styleRecommendations = filteredRecommendations.filter((rec: StyleRecommendation) => 
    (rec.type || '').toLowerCase().includes('style') || (rec.type || '').toLowerCase().includes('outfit')
  );
  const colorRecommendations = filteredRecommendations.filter((rec: StyleRecommendation) => 
    (rec.type || '').toLowerCase().includes('color') || (rec.type || '').toLowerCase().includes('palette')
  );
  const shoppingRecommendations = filteredRecommendations.filter((rec: StyleRecommendation) => 
    (rec.type || '').toLowerCase().includes('shopping') || (rec.type || '').toLowerCase().includes('purchase')
  );
  const trendRecommendations = filteredRecommendations.filter((rec: StyleRecommendation) => 
    (rec.type || '').toLowerCase().includes('trend') || (rec.type || '').toLowerCase().includes('seasonal')
  );

  const getPriorityColor = (priority: string) => {
    switch ((priority || '').toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    const typeStr = (type || '').toLowerCase();
    if (typeStr.includes('color')) return <Palette className="h-4 w-4" />;
    if (typeStr.includes('shopping')) return <ShoppingBag className="h-4 w-4" />;
    if (typeStr.includes('trend')) return <TrendingUp className="h-4 w-4" />;
    return <Sparkles className="h-4 w-4" />;
  };

  const renderRecommendationCard = (recommendation: StyleRecommendation) => {
    return (
      <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getTypeIcon(recommendation.type)}
              <CardTitle className="text-lg">{recommendation.title}</CardTitle>
            </div>
            <Badge variant={getPriorityColor(recommendation.priority)} className="text-xs">
              {recommendation.priority} Priority
            </Badge>
          </div>
          <CardDescription className="text-sm">
            {recommendation.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="text-xs">
              {recommendation.type}
            </Badge>
            {recommendation.tags && recommendation.tags.length > 0 && (
              recommendation.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))
            )}
          </div>

          {recommendation.reasoning && (
            <div className="text-sm bg-muted p-3 rounded-lg mb-3">
              <strong>AI Reasoning:</strong> {recommendation.reasoning}
            </div>
          )}

          {recommendation.createdAt && (
            <div className="text-xs text-muted-foreground pt-2 border-t border-muted">
              Generated on {new Date(recommendation.createdAt).toLocaleDateString()}
            </div>
          )}
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
            <p>Please log in to view your personalized recommendations</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Star className="h-8 w-8 text-purple-600" />
                Style Recommendations
              </h1>
              <p className="text-muted-foreground">
                Personalized AI-powered style advice tailored to your preferences and goals
              </p>
            </div>
            <Button 
              onClick={() => refetch()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recommendations by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {uniquePriorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {filteredRecommendations.length} recommendation{filteredRecommendations.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="shopping">Shopping</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {recommendationsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : filteredRecommendations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Star className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Recommendations Found</h3>
                  <p className="text-muted-foreground mb-6">
                    {recommendations.length === 0 
                      ? "You don't have any style recommendations yet. Complete your style profile to get personalized advice!"
                      : "No recommendations match your current search and filters."
                    }
                  </p>
                  <Button onClick={() => window.location.href = '/personal-style'}>
                    Complete Style Profile
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRecommendations.map(renderRecommendationCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="style" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {styleRecommendations.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <Sparkles className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                    <p className="text-muted-foreground">No style recommendations available</p>
                  </CardContent>
                </Card>
              ) : (
                styleRecommendations.map(renderRecommendationCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {colorRecommendations.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <Palette className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                    <p className="text-muted-foreground">No color recommendations available</p>
                  </CardContent>
                </Card>
              ) : (
                colorRecommendations.map(renderRecommendationCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="shopping" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shoppingRecommendations.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                    <p className="text-muted-foreground">No shopping recommendations available</p>
                  </CardContent>
                </Card>
              ) : (
                shoppingRecommendations.map(renderRecommendationCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trendRecommendations.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                    <p className="text-muted-foreground">No trend recommendations available</p>
                  </CardContent>
                </Card>
              ) : (
                trendRecommendations.map(renderRecommendationCard)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}