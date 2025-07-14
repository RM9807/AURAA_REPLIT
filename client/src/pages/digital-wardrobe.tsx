import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  Scan, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Heart,
  Trash2,
  Edit,
  Eye,
  Camera,
  Grid3X3,
  List,
  Filter,
  Search,
  ArrowLeft,
  Star,
  TrendingUp,
  AlertTriangle,
  ShoppingBag
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
  aiAnalysis?: {
    styleAlignment: number;
    colorMatch: number;
    fitAssessment: string;
    recommendation: 'keep' | 'alter' | 'donate';
    reason: string;
  };
  favorite: boolean;
  wearCount: number;
  lastWorn?: string;
  tags?: string[];
  createdAt: string;
}

interface UploadFormData {
  itemName: string;
  category: string;
  color: string;
  pattern: string;
  material: string;
  brand: string;
  season: string;
  notes: string;
  imageFile: File | null;
}

export default function DigitalWardrobe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("upload");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState<UploadFormData>({
    itemName: "",
    category: "",
    color: "",
    pattern: "",
    material: "",
    brand: "",
    season: "",
    notes: "",
    imageFile: null,
  });

  const userId = user?.id || 1;

  // Fetch wardrobe data
  const { data: wardrobe, isLoading: wardrobeLoading } = useQuery({
    queryKey: ['/api/users', userId, 'wardrobe'],
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      const formDataToSend = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'imageFile' && value) {
          formDataToSend.append('image', value);
        } else if (value) {
          formDataToSend.append(key, value.toString());
        }
      });

      await apiRequest(`/api/users/${userId}/wardrobe`, {
        method: 'POST',
        body: formDataToSend,
      });
    },
    onSuccess: () => {
      toast({
        title: "Item Added",
        description: "Your wardrobe item has been successfully added.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'wardrobe'] });
      setFormData({
        itemName: "",
        category: "",
        color: "",
        pattern: "",
        material: "",
        brand: "",
        season: "",
        notes: "",
        imageFile: null,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "There was an error adding your item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: number; updates: Partial<WardrobeItem> }) => {
      await apiRequest(`/api/wardrobe/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'wardrobe'] });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemName || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in the item name and category.",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate(formData);
  };

  const handleToggleFavorite = (item: WardrobeItem) => {
    updateItemMutation.mutate({
      itemId: item.id,
      updates: { favorite: !item.favorite }
    });
  };

  const filteredWardrobe = wardrobe?.filter((item: WardrobeItem) => {
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.color.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  const categories = ["all", ...new Set(wardrobe?.map((item: WardrobeItem) => item.category) || [])];

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'keep': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'alter': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'donate': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const analysisResults = wardrobe?.map((item: WardrobeItem) => {
    if (!item.aiAnalysis) return null;
    return {
      ...item,
      analysis: item.aiAnalysis
    };
  }).filter(Boolean) || [];

  const keepItems = analysisResults.filter(item => item?.analysis.recommendation === 'keep');
  const alterItems = analysisResults.filter(item => item?.analysis.recommendation === 'alter');
  const donateItems = analysisResults.filter(item => item?.analysis.recommendation === 'donate');

  const wardrobeStats = {
    totalItems: wardrobe?.length || 0,
    favorites: wardrobe?.filter((item: WardrobeItem) => item.favorite).length || 0,
    analyzed: analysisResults.length,
    categories: categories.length - 1 // Subtract "all"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <Scan className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Digital Wardrobe</h1>
              <p className="text-slate-400">Digitize your closet with AI-powered organization and smart recommendations</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{wardrobeStats.totalItems}</div>
              <p className="text-slate-400 text-sm">Total Items</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-1">{wardrobeStats.favorites}</div>
              <p className="text-slate-400 text-sm">Favorites</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">{wardrobeStats.analyzed}</div>
              <p className="text-slate-400 text-sm">AI Analyzed</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">{wardrobeStats.categories}</div>
              <p className="text-slate-400 text-sm">Categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-slate-700/50">
            <TabsTrigger value="upload" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Upload className="h-4 w-4 mr-2" />
              Upload Items
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Grid3X3 className="h-4 w-4 mr-2" />
              My Inventory
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
              <TrendingUp className="h-4 w-4 mr-2" />
              AI Analysis
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Camera className="h-5 w-5 text-cyan-400" />
                  Add New Wardrobe Item
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Upload photos and details of your clothing items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-white">Item Photo</Label>
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-cyan-500/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Camera className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400 mb-2">Click to upload or drag and drop</p>
                        <p className="text-sm text-slate-500">PNG, JPG, GIF up to 10MB</p>
                      </label>
                      {formData.imageFile && (
                        <p className="mt-2 text-cyan-400 text-sm">Selected: {formData.imageFile.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemName" className="text-white">Item Name *</Label>
                      <Input
                        id="itemName"
                        placeholder="e.g., Navy Blazer"
                        value={formData.itemName}
                        onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-white">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="tops">Tops</SelectItem>
                          <SelectItem value="bottoms">Bottoms</SelectItem>
                          <SelectItem value="dresses">Dresses</SelectItem>
                          <SelectItem value="outerwear">Outerwear</SelectItem>
                          <SelectItem value="shoes">Shoes</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Detailed Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="color" className="text-white">Color</Label>
                      <Input
                        id="color"
                        placeholder="e.g., Navy Blue"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pattern" className="text-white">Pattern</Label>
                      <Input
                        id="pattern"
                        placeholder="e.g., Solid, Striped, Floral"
                        value={formData.pattern}
                        onChange={(e) => setFormData(prev => ({ ...prev, pattern: e.target.value }))}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="material" className="text-white">Material</Label>
                      <Input
                        id="material"
                        placeholder="e.g., Cotton, Wool, Polyester"
                        value={formData.material}
                        onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand" className="text-white">Brand</Label>
                      <Input
                        id="brand"
                        placeholder="e.g., Zara, H&M, Uniqlo"
                        value={formData.brand}
                        onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="season" className="text-white">Season</Label>
                      <Select value={formData.season} onValueChange={(value) => setFormData(prev => ({ ...prev, season: value }))}>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue placeholder="Select season" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="spring">Spring</SelectItem>
                          <SelectItem value="summer">Summer</SelectItem>
                          <SelectItem value="fall">Fall</SelectItem>
                          <SelectItem value="winter">Winter</SelectItem>
                          <SelectItem value="all-season">All Season</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-white">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional notes about this item..."
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="bg-slate-800 border-slate-600 text-white"
                        rows={1}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={uploadMutation.isPending}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  >
                    {uploadMutation.isPending ? "Adding Item..." : "Add to Wardrobe"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/30">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Grid3X3 className="h-5 w-5 text-purple-400" />
                      My Wardrobe Inventory
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Browse and manage your digitized wardrobe
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                      <Input
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex border border-slate-600 rounded-md">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-r-none"
                      >
                        <Grid3X3 className="h-4 w-4" />
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
              </CardHeader>
              <CardContent>
                {wardrobeLoading ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">Loading your wardrobe...</p>
                  </div>
                ) : filteredWardrobe.length === 0 ? (
                  <div className="text-center py-8">
                    <Scan className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">No items found</p>
                    <p className="text-sm text-slate-500">Start by uploading your first wardrobe item</p>
                  </div>
                ) : (
                  <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-4"}>
                    {filteredWardrobe.map((item: WardrobeItem) => (
                      <Card key={item.id} className="bg-slate-800/50 border-slate-600/50 hover:border-purple-500/50 transition-colors">
                        <CardContent className="p-4">
                          {viewMode === "grid" ? (
                            <div className="space-y-3">
                              {item.imageUrl && (
                                <div className="aspect-square rounded-lg bg-slate-700 overflow-hidden">
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.itemName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <div className="flex items-start justify-between">
                                  <h3 className="font-medium text-white">{item.itemName}</h3>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleFavorite(item)}
                                    className="p-1 h-6 w-6"
                                  >
                                    <Heart className={`h-4 w-4 ${item.favorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                                  </Button>
                                </div>
                                <p className="text-sm text-slate-400">{item.category} • {item.color}</p>
                                {item.brand && <p className="text-xs text-slate-500">{item.brand}</p>}
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    Worn {item.wearCount} times
                                  </Badge>
                                  {item.aiAnalysis && (
                                    <Badge className={`text-xs ${getRecommendationColor(item.aiAnalysis.recommendation)}`}>
                                      {item.aiAnalysis.recommendation}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              {item.imageUrl && (
                                <div className="w-16 h-16 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0">
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.itemName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-medium text-white">{item.itemName}</h3>
                                    <p className="text-sm text-slate-400">{item.category} • {item.color}</p>
                                    {item.brand && <p className="text-xs text-slate-500">{item.brand}</p>}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                      Worn {item.wearCount}x
                                    </Badge>
                                    {item.aiAnalysis && (
                                      <Badge className={`text-xs ${getRecommendationColor(item.aiAnalysis.recommendation)}`}>
                                        {item.aiAnalysis.recommendation}
                                      </Badge>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleToggleFavorite(item)}
                                      className="p-1 h-6 w-6"
                                    >
                                      <Heart className={`h-4 w-4 ${item.favorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="analysis">
            <div className="space-y-6">
              {/* Analysis Overview */}
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-orange-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-400" />
                    AI Wardrobe Analysis
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Smart recommendations to optimize your wardrobe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResults.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-400 mb-2">No AI analysis available yet</p>
                      <p className="text-sm text-slate-500">Upload some wardrobe items to get personalized recommendations</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Analysis Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-green-500/10 border-green-500/30">
                          <CardContent className="p-4 text-center">
                            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-400">{keepItems.length}</div>
                            <p className="text-sm text-green-300">Keep Items</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-yellow-500/10 border-yellow-500/30">
                          <CardContent className="p-4 text-center">
                            <Settings className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-yellow-400">{alterItems.length}</div>
                            <p className="text-sm text-yellow-300">Consider Altering</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-red-500/10 border-red-500/30">
                          <CardContent className="p-4 text-center">
                            <Trash2 className="h-8 w-8 text-red-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-red-400">{donateItems.length}</div>
                            <p className="text-sm text-red-300">Consider Donating</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Detailed Recommendations */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Detailed Recommendations</h3>
                        
                        {['keep', 'alter', 'donate'].map(recommendation => {
                          const items = analysisResults.filter(item => item?.analysis.recommendation === recommendation);
                          if (items.length === 0) return null;

                          return (
                            <Card key={recommendation} className="bg-slate-800/50 border-slate-600/50">
                              <CardHeader>
                                <CardTitle className={`text-sm flex items-center gap-2 ${
                                  recommendation === 'keep' ? 'text-green-400' :
                                  recommendation === 'alter' ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {recommendation === 'keep' && <CheckCircle className="h-4 w-4" />}
                                  {recommendation === 'alter' && <Settings className="h-4 w-4" />}
                                  {recommendation === 'donate' && <Trash2 className="h-4 w-4" />}
                                  {recommendation === 'keep' ? 'Perfect Matches' : 
                                   recommendation === 'alter' ? 'Needs Minor Adjustments' : 'Consider Removing'}
                                  <Badge variant="secondary" className="ml-auto">
                                    {items.length} items
                                  </Badge>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {items.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                                    {item.imageUrl && (
                                      <div className="w-12 h-12 rounded bg-slate-600 overflow-hidden flex-shrink-0">
                                        <img 
                                          src={item.imageUrl} 
                                          alt={item.itemName}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <h4 className="font-medium text-white">{item.itemName}</h4>
                                      <p className="text-sm text-slate-400">{item.category} • {item.color}</p>
                                      <p className="text-xs text-slate-500 mt-1">{item.analysis.reason}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm text-slate-300">Style: {item.analysis.styleAlignment}/10</div>
                                      <div className="text-sm text-slate-300">Color: {item.analysis.colorMatch}/10</div>
                                    </div>
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      {/* Wardrobe Gap Analysis */}
                      <Card className="bg-slate-800/50 border-slate-600/50">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-blue-400" />
                            Wardrobe Gap Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                              <h4 className="font-medium text-blue-400 mb-2">Missing Core Items</h4>
                              <p className="text-sm text-slate-300">Based on your style profile, consider adding:</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className="border-blue-500/50 text-blue-400">White Button Shirt</Badge>
                                <Badge variant="outline" className="border-blue-500/50 text-blue-400">Black Trousers</Badge>
                                <Badge variant="outline" className="border-blue-500/50 text-blue-400">Neutral Cardigan</Badge>
                              </div>
                            </div>
                            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                              <h4 className="font-medium text-purple-400 mb-2">Over-represented Categories</h4>
                              <p className="text-sm text-slate-300">You have plenty of these items:</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className="border-purple-500/50 text-purple-400">Casual Tops (12 items)</Badge>
                                <Badge variant="outline" className="border-purple-500/50 text-purple-400">Denim (8 items)</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}