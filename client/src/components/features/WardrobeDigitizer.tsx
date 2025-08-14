import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Camera, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Sparkles,
  TrendingUp,
  Heart,
  ShoppingBag
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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

export default function WardrobeDigitizer() {
  const [activeTab, setActiveTab] = useState<'upload' | 'inventory' | 'analysis'>('upload');
  const [uploadForm, setUploadForm] = useState<UploadFormData>({
    itemName: '',
    category: '',
    color: '',
    pattern: '',
    material: '',
    brand: '',
    season: '',
    notes: '',
    imageFile: null
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const userId = 1;
  const queryClient = useQueryClient();

  const { data: wardrobe, isLoading } = useQuery({
    queryKey: ['/api/users', userId, 'wardrobe'],
  });

  // Type the wardrobe data properly
  const wardrobeItems = (wardrobe as WardrobeItem[]) || [];

  const { data: profile } = useQuery({
    queryKey: ['/api/users', userId, 'profile'],
  });

  const uploadItemMutation = useMutation({
    mutationFn: async (itemData: Omit<UploadFormData, 'imageFile'>) => {
      return await apiRequest(`/api/users/${userId}/wardrobe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'wardrobe'] });
      setUploadForm({
        itemName: '',
        category: '',
        color: '',
        pattern: '',
        material: '',
        brand: '',
        season: '',
        notes: '',
        imageFile: null
      });
    },
  });

  const analyzeWardrobeMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      // Simulate AI analysis process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock AI analysis results
      const analysisResults = wardrobe?.map((item: WardrobeItem) => {
        const styleAlignment = Math.floor(Math.random() * 40) + 60; // 60-100
        const colorMatch = Math.floor(Math.random() * 30) + 70; // 70-100
        const recommendations = ['keep', 'alter', 'donate'];
        const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)] as 'keep' | 'alter' | 'donate';
        
        const reasons = {
          keep: [
            "Perfect color match for your skin tone",
            "Excellent fit for your body type",
            "Aligns perfectly with your style DNA",
            "Versatile piece that works for multiple occasions"
          ],
          alter: [
            "Great style match but could use better fit",
            "Perfect color but needs tailoring for optimal silhouette",
            "Good piece that would benefit from hemming",
            "Nice item that would look better with minor adjustments"
          ],
          donate: [
            "This color washes out your skin tone",
            "The cut doesn't flatter your shoulder line",
            "Style doesn't align with your personal aesthetic",
            "Poor fit that can't be easily altered"
          ]
        };
        
        return {
          ...item,
          aiAnalysis: {
            styleAlignment,
            colorMatch,
            fitAssessment: recommendation === 'keep' ? 'Excellent' : recommendation === 'alter' ? 'Good with adjustments' : 'Poor fit',
            recommendation,
            reason: reasons[recommendation][Math.floor(Math.random() * reasons[recommendation].length)]
          }
        };
      });
      
      return analysisResults;
    },
    onSuccess: () => {
      setIsAnalyzing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'wardrobe'] });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, imageFile: file }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.itemName || !uploadForm.category || !uploadForm.color) {
      return;
    }
    
    const { imageFile, ...itemData } = uploadForm;
    uploadItemMutation.mutate(itemData);
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'keep': return 'bg-green-100 text-green-800';
      case 'alter': return 'bg-yellow-100 text-yellow-800';
      case 'donate': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'keep': return <CheckCircle className="h-4 w-4" />;
      case 'alter': return <AlertCircle className="h-4 w-4" />;
      case 'donate': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-gradient-blue-teal" />
            Digital Wardrobe System
          </CardTitle>
          <CardDescription>
            Digitize your closet and get AI-powered style recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload Items</TabsTrigger>
              <TabsTrigger value="inventory">My Inventory</TabsTrigger>
              <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add New Wardrobe Item</CardTitle>
                  <CardDescription>
                    Upload photos and details of your clothing items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="itemName">Item Name *</Label>
                        <Input
                          id="itemName"
                          value={uploadForm.itemName}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, itemName: e.target.value }))}
                          placeholder="e.g., Navy Blazer"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={uploadForm.category} onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
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
                        <Label htmlFor="color">Color *</Label>
                        <Input
                          id="color"
                          value={uploadForm.color}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, color: e.target.value }))}
                          placeholder="e.g., Navy Blue"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pattern">Pattern</Label>
                        <Select value={uploadForm.pattern} onValueChange={(value) => setUploadForm(prev => ({ ...prev, pattern: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pattern" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solid">Solid</SelectItem>
                            <SelectItem value="stripes">Stripes</SelectItem>
                            <SelectItem value="polka-dots">Polka Dots</SelectItem>
                            <SelectItem value="floral">Floral</SelectItem>
                            <SelectItem value="geometric">Geometric</SelectItem>
                            <SelectItem value="abstract">Abstract</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="material">Material</Label>
                        <Input
                          id="material"
                          value={uploadForm.material}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, material: e.target.value }))}
                          placeholder="e.g., Cotton, Wool, Polyester"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={uploadForm.brand}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, brand: e.target.value }))}
                          placeholder="e.g., Zara, H&M"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="season">Season</Label>
                        <Select value={uploadForm.season} onValueChange={(value) => setUploadForm(prev => ({ ...prev, season: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select season" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spring">Spring</SelectItem>
                            <SelectItem value="summer">Summer</SelectItem>
                            <SelectItem value="fall">Fall</SelectItem>
                            <SelectItem value="winter">Winter</SelectItem>
                            <SelectItem value="all-season">All Season</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="image">Upload Photo</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          id="image"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label htmlFor="image" className="cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </label>
                        {uploadForm.imageFile && (
                          <p className="mt-2 text-sm text-green-600">
                            {uploadForm.imageFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={uploadForm.notes}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any additional notes about this item..."
                        rows={3}
                      />
                    </div>
                    
                    <Button 
                      type="submit"
                      className="w-full bg-gradient-purple-pink text-white"
                      disabled={uploadItemMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {uploadItemMutation.isPending ? 'Adding Item...' : 'Add to Wardrobe'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Your Digital Closet</h3>
                <Badge variant="outline">
                  {wardrobe?.length || 0} items
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wardrobe?.map((item: WardrobeItem) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{item.itemName}</h4>
                        {item.favorite && <Heart className="h-4 w-4 text-red-500 fill-current" />}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge variant="secondary">{item.category}</Badge>
                        <Badge variant="outline">{item.color}</Badge>
                        {item.brand && <Badge variant="outline">{item.brand}</Badge>}
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Worn {item.wearCount || 0} times</p>
                        {item.lastWorn && (
                          <p>Last worn: {new Date(item.lastWorn).toLocaleDateString()}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {(!wardrobe || wardrobeItems.length === 0) && (
                <div className="text-center py-12">
                  <Camera className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Your digital closet is empty
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start by uploading your first clothing item
                  </p>
                  <Button onClick={() => setActiveTab('upload')} className="bg-gradient-purple-pink text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-gradient-purple-pink" />
                    AI Wardrobe Analysis
                  </CardTitle>
                  <CardDescription>
                    Get personalized recommendations based on your style profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(!wardrobe || wardrobeItems.length === 0) ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No items to analyze
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Upload some wardrobe items first to get AI recommendations
                      </p>
                      <Button onClick={() => setActiveTab('upload')} className="bg-gradient-purple-pink text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Items
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Button 
                        onClick={() => analyzeWardrobeMutation.mutate()}
                        disabled={analyzeWardrobeMutation.isPending || isAnalyzing}
                        className="w-full bg-gradient-purple-pink text-white"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {analyzeWardrobeMutation.isPending || isAnalyzing ? 'Analyzing Wardrobe...' : 'Analyze My Wardrobe'}
                      </Button>
                      
                      {isAnalyzing && (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">AI is analyzing your wardrobe...</p>
                        </div>
                      )}
                      
                      {wardrobe?.some((item: WardrobeItem) => item.aiAnalysis) && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['keep', 'alter', 'donate'].map((recommendation) => (
                              <Card key={recommendation}>
                                <CardHeader className="pb-3">
                                  <CardTitle className={`text-sm font-medium flex items-center gap-2 ${getRecommendationColor(recommendation)}`}>
                                    {getRecommendationIcon(recommendation)}
                                    {recommendation.charAt(0).toUpperCase() + recommendation.slice(1)}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {wardrobe?.filter((item: WardrobeItem) => item.aiAnalysis?.recommendation === recommendation)
                                      .map((item: WardrobeItem) => (
                                      <div key={item.id} className="p-3 border rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                          <h4 className="font-medium text-sm">{item.itemName}</h4>
                                          <Badge variant="outline" className="text-xs">
                                            {item.aiAnalysis?.styleAlignment}% match
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-1">
                                          {item.aiAnalysis?.reason}
                                        </p>
                                        <div className="flex gap-1">
                                          <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                                          <Badge variant="outline" className="text-xs">{item.color}</Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Wardrobe Gap Analysis
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <h4 className="font-medium text-blue-900 mb-2">Missing Core Items</h4>
                                  <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• White button-down shirt (versatile base)</li>
                                    <li>• Dark wash jeans (casual staple)</li>
                                    <li>• Neutral blazer (professional wear)</li>
                                  </ul>
                                </div>
                                
                                <div className="bg-amber-50 p-4 rounded-lg">
                                  <h4 className="font-medium text-amber-900 mb-2">Over-represented Categories</h4>
                                  <ul className="text-sm text-amber-800 space-y-1">
                                    <li>• Too many black tops (consider more color variety)</li>
                                    <li>• Excess casual wear (add more formal pieces)</li>
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}