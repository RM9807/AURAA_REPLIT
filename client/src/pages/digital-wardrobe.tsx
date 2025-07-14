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
import { useLocation } from "wouter";
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
  ShoppingBag,
  Plus,
  MoreVertical,
  Tag,
  Calendar,
  Palette
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
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("wardrobe");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  
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
        title: "Item Added Successfully",
        description: "Your wardrobe item has been added to your collection.",
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
      setShowUploadForm(false);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to add item. Please try again.",
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

  const handleUpload = () => {
    if (!formData.itemName || !formData.category || !formData.color) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the item name, category, and color.",
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

  const wardrobeStats = {
    totalItems: wardrobe?.length || 0,
    favorites: wardrobe?.filter((item: WardrobeItem) => item.favorite).length || 0,
    analyzed: wardrobe?.filter((item: WardrobeItem) => item.aiAnalysis).length || 0,
    categories: categories.length - 1 // Subtract "all"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/dashboard')}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Scan className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Wardrobe</h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Organize and manage your fashion collection</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowUploadForm(true)}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{wardrobeStats.totalItems}</div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Total Items</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-500 mb-2">{wardrobeStats.favorites}</div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Favorites</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-violet-500 mb-2">{wardrobeStats.analyzed}</div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">AI Analyzed</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">{wardrobeStats.categories}</div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search items, brands, colors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border border-slate-300 dark:border-slate-700 rounded-lg">
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

        {/* Wardrobe Items */}
        {wardrobeLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading your wardrobe...</p>
          </div>
        ) : filteredWardrobe.length === 0 ? (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="p-12 text-center">
              <Scan className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {searchQuery || filterCategory !== "all" ? "No items found" : "Start building your digital wardrobe"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchQuery || filterCategory !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Add your first clothing item to get started with AI-powered wardrobe management"
                }
              </p>
              {!searchQuery && filterCategory === "all" && (
                <Button
                  onClick={() => setShowUploadForm(true)}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Item
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {filteredWardrobe.map((item: WardrobeItem) => (
              <Card key={item.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow group">
                <CardContent className={viewMode === "grid" ? "p-4" : "p-6"}>
                  {viewMode === "grid" ? (
                    /* Grid View */
                    <div className="space-y-3">
                      <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-4xl">👕</div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFavorite(item)}
                          className={`absolute top-2 right-2 h-8 w-8 p-0 ${
                            item.favorite ? 'text-red-500 hover:text-red-600' : 'text-slate-400 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${item.favorite ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">{item.itemName}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.brand || 'Unknown Brand'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-3 h-3 rounded-full border border-slate-300"
                              style={{ backgroundColor: item.color.toLowerCase() }}
                            />
                            <span className="text-xs text-slate-600 dark:text-slate-400">{item.color}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* List View */
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="text-2xl">👕</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white truncate">{item.itemName}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFavorite(item)}
                            className={`h-6 w-6 p-0 ${
                              item.favorite ? 'text-red-500 hover:text-red-600' : 'text-slate-400 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`h-3 w-3 ${item.favorite ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{item.brand || 'Unknown Brand'}</p>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-3 h-3 rounded-full border border-slate-300"
                              style={{ backgroundColor: item.color.toLowerCase() }}
                            />
                            <span className="text-xs text-slate-600 dark:text-slate-400">{item.color}</span>
                          </div>
                          {item.wearCount > 0 && (
                            <span className="text-xs text-slate-500">Worn {item.wearCount} times</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Add New Item</CardTitle>
                <CardDescription>Add a new piece to your digital wardrobe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName" className="text-slate-900 dark:text-white">Item Name *</Label>
                  <Input
                    id="itemName"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    placeholder="e.g., Blue Denim Jacket"
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-slate-900 dark:text-white">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tops">Tops</SelectItem>
                        <SelectItem value="bottoms">Bottoms</SelectItem>
                        <SelectItem value="dresses">Dresses</SelectItem>
                        <SelectItem value="outerwear">Outerwear</SelectItem>
                        <SelectItem value="shoes">Shoes</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color" className="text-slate-900 dark:text-white">Color *</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="e.g., Navy Blue"
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand" className="text-slate-900 dark:text-white">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g., Levi's"
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="material" className="text-slate-900 dark:text-white">Material</Label>
                    <Input
                      id="material"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="e.g., Cotton"
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-slate-900 dark:text-white">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes about this item..."
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                  >
                    {uploadMutation.isPending ? 'Adding...' : 'Add Item'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}