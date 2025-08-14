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
  ShoppingBag,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from '@uppy/core';

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
  imageUrl?: string;
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
    imageFile: null,
    imageUrl: ''
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
        body: JSON.stringify({
          ...itemData,
          imageUrl: itemData.imageUrl || null
        }),
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
        imageFile: null,
        imageUrl: ''
      });
    },
  });

  // Handle image upload and processing
  const handleGetUploadParameters = async () => {
    const response = await apiRequest('/api/objects/upload', {
      method: 'POST',
    });
    return {
      method: 'PUT' as const,
      url: response.uploadURL,
    };
  };

  const handleImageUploadComplete = async (result: UploadResult) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const imageURL = uploadedFile.uploadURL;
      
      // Process the uploaded image URL
      try {
        const response = await apiRequest('/api/wardrobe-images', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageURL }),
        });
        
        // Update the form with the processed image path
        setUploadForm(prev => ({
          ...prev,
          imageUrl: response.objectPath
        }));
      } catch (error) {
        console.error('Error processing uploaded image:', error);
      }
    }
  };

  const analyzeWardrobeMutation = useMutation({
    mutationFn: async ({ ethnicity, culturalBackground, region }: { 
      ethnicity?: string; 
      culturalBackground?: string; 
      region?: string; 
    } = {}) => {
      // Filter out items that already have AI analysis
      const unanalyzedItems = wardrobeItems?.filter((item: WardrobeItem) => !item.aiAnalysis) || [];
      
      if (unanalyzedItems.length === 0) {
        // If all items are already analyzed, just return existing results
        const alreadyAnalyzed = wardrobeItems?.filter((item: WardrobeItem) => item.aiAnalysis) || [];
        setAnalysisResults(alreadyAnalyzed.map(item => ({
          id: item.id,
          itemName: item.itemName,
          category: item.category,
          color: item.color,
          recommendation: item.aiAnalysis?.recommendation || 'keep',
          reason: item.aiAnalysis?.reason || 'Previously analyzed',
          styleAlignment: item.aiAnalysis?.styleAlignment || 85
        })));
        return { itemAnalysis: analysisResults };
      }

      // Call the real AI analysis endpoint with cultural context for unanalyzed items only
      const response = await apiRequest(`/api/users/${userId}/wardrobe/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ethnicity: ethnicity || '',
          culturalBackground: culturalBackground || '',
          region: region || '',
          itemIds: unanalyzedItems.map((item: WardrobeItem) => item.id) // Only analyze new items
        }),
      });
      
      // Combine existing analyzed items with new analysis
      const existingAnalyzed = wardrobeItems?.filter((item: WardrobeItem) => item.aiAnalysis).map(item => ({
        id: item.id,
        itemName: item.itemName,
        category: item.category,
        color: item.color,
        recommendation: item.aiAnalysis?.recommendation || 'keep',
        reason: item.aiAnalysis?.reason || 'Previously analyzed',
        styleAlignment: item.aiAnalysis?.styleAlignment || 85
      })) || [];

      const allResults = [...existingAnalyzed, ...(response.itemAnalysis || [])];
      setAnalysisResults(allResults);
      return { itemAnalysis: allResults };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'wardrobe'] });
    },
    onError: (error) => {
      console.error('AI analysis failed:', error);
    }
  });
  
  // Helper function to trigger analysis with cultural context
  const handleAnalyzeWardrobe = (culturalData?: { ethnicity?: string; culturalBackground?: string; region?: string }) => {
    analyzeWardrobeMutation.mutate(culturalData);
  };

  // Cultural context state for AI analysis
  const [culturalContext, setCulturalContext] = useState({
    ethnicity: '',
    culturalBackground: '',
    region: ''
  });



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
                      <div className="flex items-center gap-4">
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={10485760}
                          onGetUploadParameters={handleGetUploadParameters}
                          onComplete={handleImageUploadComplete}
                          buttonClassName="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Upload Photo
                        </ObjectUploader>
                        {uploadForm.imageUrl && (
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Photo uploaded successfully</span>
                          </div>
                        )}
                      </div>
                      {uploadForm.imageUrl && (
                        <div className="mt-2">
                          <img 
                            src={uploadForm.imageUrl} 
                            alt="Preview" 
                            className="w-32 h-32 object-cover rounded-lg border"
                          />
                        </div>
                      )}
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
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {wardrobeItems?.length || 0} items
                  </Badge>
                  {wardrobeItems?.some(item => item.aiAnalysis) && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {wardrobeItems?.filter(item => item.aiAnalysis).length} analyzed
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wardrobeItems?.map((item: WardrobeItem) => (
                  <Card key={item.id} className="overflow-hidden relative">
                    {item.aiAnalysis && (
                      <div className={`absolute top-2 right-2 z-10 p-1 rounded-full ${getRecommendationColor(item.aiAnalysis.recommendation)}`}>
                        {getRecommendationIcon(item.aiAnalysis.recommendation)}
                      </div>
                    )}
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
                        {item.aiAnalysis && (
                          <Badge className={`text-xs ${getRecommendationColor(item.aiAnalysis.recommendation)}`}>
                            AI: {item.aiAnalysis.recommendation}
                          </Badge>
                        )}
                      </div>
                      {item.aiAnalysis && (
                        <div className="text-xs text-gray-600 mb-2 bg-gray-50 p-2 rounded">
                          <p className="font-medium">AI Analysis:</p>
                          <p>{item.aiAnalysis.styleAlignment}% style match</p>
                          <p className="italic">"{item.aiAnalysis.reason}"</p>
                        </div>
                      )}
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
              
              {(!wardrobeItems || wardrobeItems.length === 0) && (
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
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Cultural Context (Optional)</CardTitle>
                          <CardDescription className="text-xs">
                            Help our AI provide more culturally-aware styling recommendations
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="ethnicity" className="text-xs">Ethnicity</Label>
                              <Input
                                id="ethnicity"
                                value={culturalContext.ethnicity}
                                onChange={(e) => setCulturalContext(prev => ({ ...prev, ethnicity: e.target.value }))}
                                placeholder="e.g., South Asian, African American"
                                className="text-sm"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="culturalBackground" className="text-xs">Cultural Background</Label>
                              <Input
                                id="culturalBackground"
                                value={culturalContext.culturalBackground}
                                onChange={(e) => setCulturalContext(prev => ({ ...prev, culturalBackground: e.target.value }))}
                                placeholder="e.g., Indian, Nigerian, Mexican"
                                className="text-sm"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="region" className="text-xs">Region</Label>
                              <Input
                                id="region"
                                value={culturalContext.region}
                                onChange={(e) => setCulturalContext(prev => ({ ...prev, region: e.target.value }))}
                                placeholder="e.g., US West Coast, London"
                                className="text-sm"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Button 
                        onClick={() => handleAnalyzeWardrobe(culturalContext)}
                        disabled={analyzeWardrobeMutation.isPending}
                        className="w-full bg-gradient-purple-pink text-white disabled:opacity-75"
                      >
                        {analyzeWardrobeMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing Analysis...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            {wardrobeItems?.some(item => !item.aiAnalysis) 
                              ? 'Begin Analysis' 
                              : 'View Analysis Results'
                            }
                          </>
                        )}
                      </Button>
                      
                      {analyzeWardrobeMutation.isPending && (
                        <div className="text-center py-8">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">AI Cross-References with Your Style Profile</h3>
                            <p className="text-gray-600">Analyzing color harmony, style alignment, and fit compatibility with your profile.</p>
                            
                            <div className="max-w-md mx-auto bg-gray-100 rounded-lg p-4 space-y-3">
                              <div className="flex justify-between items-center text-sm">
                                <span>Analysis Progress</span>
                                <span className="font-medium">Processing...</span>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-4 h-4 rounded-full bg-purple-600 animate-pulse"></div>
                                  <span className="text-sm">Color harmony analysis</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-4 h-4 rounded-full bg-purple-600 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                  <span className="text-sm">Style alignment scoring</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-4 h-4 rounded-full bg-purple-600 animate-pulse" style={{ animationDelay: '1s' }}></div>
                                  <span className="text-sm">Fit assessment</span>
                                </div>
                              </div>
                              
                              <div className="mt-4 bg-gray-200 rounded-full h-2">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse transition-all duration-1000" 
                                     style={{ width: '85%', animation: 'pulse 2s ease-in-out infinite' }}></div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-500">This usually takes 15-20 seconds</p>
                          </div>
                        </div>
                      )}
                      
                      {analysisResults && analysisResults.length > 0 && (
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
                                    {analysisResults?.filter((item: any) => item.recommendation === recommendation)
                                      .map((item: any) => (
                                      <div key={item.id} className="p-3 border rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                          <h4 className="font-medium text-sm">{item.itemName}</h4>
                                          <Badge variant="outline" className="text-xs">
                                            {item.styleAlignment}% match
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-1">
                                          {item.reason}
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