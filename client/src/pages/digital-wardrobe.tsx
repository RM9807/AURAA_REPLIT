import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  Upload, 
  Scan, 
  CheckCircle, 
  XCircle, 
  Heart,
  Trash2,
  Edit,
  Camera,
  ArrowLeft,
  ArrowRight,
  Star,
  AlertTriangle,
  ShoppingBag,
  Plus,
  ChevronRight,
  Sparkles,
  Palette,
  Scissors,
  Archive,
  Check,
  X,
  RotateCcw,
  FileImage,
  Loader2
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Multi-step state management
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Upload state
  const [uploadedItems, setUploadedItems] = useState<UploadFormData[]>([]);
  const [currentUpload, setCurrentUpload] = useState<UploadFormData>({
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

  // Declutter state
  const [declutterDecisions, setDeclutterDecisions] = useState<{[key: number]: 'keep' | 'alter' | 'donate'}>({});

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
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'wardrobe'] });
      setCurrentUpload({
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
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCurrentUpload({ ...currentUpload, imageFile: file });
    }
  };

  const handleAddItem = () => {
    if (!currentUpload.itemName || !currentUpload.category || !currentUpload.color) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the item name, category, and color.",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate(currentUpload);
    setUploadedItems([...uploadedItems, currentUpload]);
  };

  const handleAnalyzeWardrobe = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate AI analysis with progress
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setCurrentStep(3);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const generateMockAnalysis = (item: WardrobeItem) => {
    const recommendations = ['keep', 'alter', 'donate'] as const;
    const reasons = {
      keep: [
        "Perfect color match for your skin tone",
        "Excellent fit and style alignment",
        "High-quality piece that complements your wardrobe",
        "Classic style that works with your aesthetic"
      ],
      alter: [
        "Could be hemmed for better proportions",
        "Consider tailoring for a more flattering fit",
        "Would benefit from minor adjustments",
        "Good piece but needs small modifications"
      ],
      donate: [
        "Color doesn't complement your skin tone",
        "Style doesn't align with your profile",
        "Poor fit that can't be easily altered",
        "Rarely worn and not your style preference"
      ]
    };

    const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
    return {
      styleAlignment: Math.floor(Math.random() * 100),
      colorMatch: Math.floor(Math.random() * 100),
      fitAssessment: "Good",
      recommendation,
      reason: reasons[recommendation][Math.floor(Math.random() * reasons[recommendation].length)]
    };
  };

  const handleDeclutterDecision = (itemId: number, decision: 'keep' | 'alter' | 'donate') => {
    setDeclutterDecisions(prev => ({ ...prev, [itemId]: decision }));
  };

  const handleConfirmDeclutter = () => {
    toast({
      title: "Declutter Decisions Saved",
      description: "Your wardrobe has been updated based on your decisions.",
    });
    setCurrentStep(5);
  };

  const stepsConfig = [
    { number: 1, title: "Upload & Inventory", description: "Add your wardrobe items" },
    { number: 2, title: "AI Analysis", description: "Analyzing with your style profile" },
    { number: 3, title: "Declutter Recommendations", description: "AI-driven suggestions" },
    { number: 4, title: "Review Decisions", description: "Confirm your choices" },
    { number: 5, title: "Updated Closet", description: "Your curated wardrobe" }
  ];

  const keepItems = wardrobe?.filter(item => item.aiAnalysis?.recommendation === 'keep' || declutterDecisions[item.id] === 'keep') || [];
  const alterItems = wardrobe?.filter(item => item.aiAnalysis?.recommendation === 'alter' || declutterDecisions[item.id] === 'alter') || [];
  const donateItems = wardrobe?.filter(item => item.aiAnalysis?.recommendation === 'donate' || declutterDecisions[item.id] === 'donate') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* AURAA Logo Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
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
                Back
              </Button>
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AURAA Digital Wardrobe</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-center space-x-4 md:space-x-8">
            {stepsConfig.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                    ${currentStep >= step.number 
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }
                  `}>
                    {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-medium text-slate-900 dark:text-white">{step.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 hidden md:block">{step.description}</p>
                  </div>
                </div>
                {index < stepsConfig.length - 1 && (
                  <ChevronRight className="h-5 w-5 text-slate-400 mx-2 md:mx-4 mt-[-24px]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Step 1: Upload & Inventory */}
        {currentStep === 1 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Upload Your Wardrobe Items to Begin Your Digital Closet Transformation
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Start by photographing and cataloging your clothing items. Our AI will analyze each piece to help you build the perfect wardrobe.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Interface */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-violet-500" />
                    Add New Item
                  </CardTitle>
                  <CardDescription>Upload a photo and add item details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Photo Upload */}
                  <div className="space-y-4">
                    <Label className="text-slate-900 dark:text-white">Item Photo</Label>
                    <div 
                      className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-violet-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {currentUpload.imageFile ? (
                        <div className="space-y-2">
                          <FileImage className="h-12 w-12 text-violet-500 mx-auto" />
                          <p className="text-sm text-slate-900 dark:text-white font-medium">{currentUpload.imageFile.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-12 w-12 text-slate-400 mx-auto" />
                          <p className="text-slate-600 dark:text-slate-400">Click to upload or drag and drop</p>
                          <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemName" className="text-slate-900 dark:text-white">Item Name *</Label>
                      <Input
                        id="itemName"
                        value={currentUpload.itemName}
                        onChange={(e) => setCurrentUpload({ ...currentUpload, itemName: e.target.value })}
                        placeholder="e.g., Blue Denim Jacket"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-slate-900 dark:text-white">Category *</Label>
                      <Select value={currentUpload.category} onValueChange={(value) => setCurrentUpload({ ...currentUpload, category: value })}>
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="color" className="text-slate-900 dark:text-white">Color *</Label>
                      <Input
                        id="color"
                        value={currentUpload.color}
                        onChange={(e) => setCurrentUpload({ ...currentUpload, color: e.target.value })}
                        placeholder="e.g., Navy Blue"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand" className="text-slate-900 dark:text-white">Brand</Label>
                      <Input
                        id="brand"
                        value={currentUpload.brand}
                        onChange={(e) => setCurrentUpload({ ...currentUpload, brand: e.target.value })}
                        placeholder="e.g., Levi's"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="material" className="text-slate-900 dark:text-white">Material</Label>
                      <Input
                        id="material"
                        value={currentUpload.material}
                        onChange={(e) => setCurrentUpload({ ...currentUpload, material: e.target.value })}
                        placeholder="e.g., Cotton"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="season" className="text-slate-900 dark:text-white">Season</Label>
                      <Select value={currentUpload.season} onValueChange={(value) => setCurrentUpload({ ...currentUpload, season: value })}>
                        <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
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
                    <Label htmlFor="notes" className="text-slate-900 dark:text-white">Notes</Label>
                    <Textarea
                      id="notes"
                      value={currentUpload.notes}
                      onChange={(e) => setCurrentUpload({ ...currentUpload, notes: e.target.value })}
                      placeholder="Any additional notes about this item..."
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleAddItem}
                    disabled={uploadMutation.isPending}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding Item...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Wardrobe
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Current Wardrobe */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scan className="h-5 w-5 text-violet-500" />
                    Your Current Wardrobe
                  </CardTitle>
                  <CardDescription>
                    {wardrobe?.length || 0} items uploaded • Ready for AI analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {wardrobeLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">Loading wardrobe...</p>
                    </div>
                  ) : wardrobe && wardrobe.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                        {wardrobe.slice(0, 8).map((item: WardrobeItem) => (
                          <div key={item.id} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                            <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-md mb-2 flex items-center justify-center">
                              <span className="text-2xl">👕</span>
                            </div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.itemName}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{item.category}</p>
                          </div>
                        ))}
                      </div>
                      
                      {wardrobe.length >= 3 && (
                        <Button
                          onClick={() => setCurrentStep(2)}
                          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Start AI Analysis ({wardrobe.length} items)
                        </Button>
                      )}
                      
                      {wardrobe.length < 3 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            Add at least 3 items to start AI analysis
                          </p>
                          <p className="text-xs text-slate-500">
                            {3 - wardrobe.length} more items needed
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400 mb-2">No items uploaded yet</p>
                      <p className="text-sm text-slate-500">Start by adding your first wardrobe item</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: AI Analysis */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-12 w-12 text-white animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Analyzing Your Wardrobe with Your Personal AURA Style Profile
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Our AI is examining each item's color harmony, style alignment, and fit compatibility with your unique profile.
              </p>
            </div>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Analysis Progress</span>
                      <span className="text-slate-900 dark:text-white font-medium">{analysisProgress}%</span>
                    </div>
                    <Progress value={analysisProgress} className="h-3" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Palette className="h-5 w-5 text-violet-500" />
                      <span className="text-slate-900 dark:text-white">Color harmony analysis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-violet-500" />
                      <span className="text-slate-900 dark:text-white">Style alignment scoring</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Scissors className="h-5 w-5 text-violet-500" />
                      <span className="text-slate-900 dark:text-white">Fit assessment</span>
                    </div>
                  </div>

                  {!isAnalyzing && analysisProgress === 0 && (
                    <Button
                      onClick={handleAnalyzeWardrobe}
                      className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                    >
                      Begin Analysis
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Declutter Recommendations */}
        {currentStep === 3 && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                AI-Driven Declutter Recommendations
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Based on your style profile, here's how to optimize your wardrobe
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Keep Items */}
              <Card className="bg-white dark:bg-slate-900 border-green-200 dark:border-green-800">
                <CardHeader className="bg-green-50 dark:bg-green-900/20">
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    Keep ({keepItems.length})
                  </CardTitle>
                  <CardDescription className="text-green-600 dark:text-green-500">
                    Perfect matches for your style
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {keepItems.map((item: WardrobeItem) => (
                    <div key={item.id} className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">👕</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{item.itemName}</p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            {item.aiAnalysis?.reason || generateMockAnalysis(item).reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Alter Items */}
              <Card className="bg-white dark:bg-slate-900 border-yellow-200 dark:border-yellow-800">
                <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20">
                  <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                    <Scissors className="h-5 w-5" />
                    Consider Altering ({alterItems.length})
                  </CardTitle>
                  <CardDescription className="text-yellow-600 dark:text-yellow-500">
                    Great pieces that need adjustments
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {alterItems.map((item: WardrobeItem) => (
                    <div key={item.id} className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-3">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-yellow-200 dark:bg-yellow-800 rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">👕</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{item.itemName}</p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            {item.aiAnalysis?.reason || generateMockAnalysis(item).reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Donate Items */}
              <Card className="bg-white dark:bg-slate-900 border-red-200 dark:border-red-800">
                <CardHeader className="bg-red-50 dark:bg-red-900/20">
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <Archive className="h-5 w-5" />
                    Consider Donating ({donateItems.length})
                  </CardTitle>
                  <CardDescription className="text-red-600 dark:text-red-500">
                    Items that don't align with your style
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {donateItems.map((item: WardrobeItem) => (
                    <div key={item.id} className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-red-200 dark:bg-red-800 rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">👕</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{item.itemName}</p>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {item.aiAnalysis?.reason || generateMockAnalysis(item).reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button
                onClick={() => setCurrentStep(4)}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8"
              >
                Review & Confirm Decisions
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review Decisions */}
        {currentStep === 4 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Review & Confirm Your Declutter Decisions
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                You can override any AI suggestions by selecting different options for each item
              </p>
            </div>

            <div className="space-y-4">
              {wardrobe?.map((item: WardrobeItem) => {
                const analysis = item.aiAnalysis || generateMockAnalysis(item);
                const currentDecision = declutterDecisions[item.id] || analysis.recommendation;
                
                return (
                  <Card key={item.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">👕</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{item.itemName}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{item.category} • {item.color}</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{analysis.reason}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant={currentDecision === 'keep' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleDeclutterDecision(item.id, 'keep')}
                            className={currentDecision === 'keep' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Keep
                          </Button>
                          <Button
                            variant={currentDecision === 'alter' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleDeclutterDecision(item.id, 'alter')}
                            className={currentDecision === 'alter' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}
                          >
                            <Scissors className="h-4 w-4 mr-1" />
                            Alter
                          </Button>
                          <Button
                            variant={currentDecision === 'donate' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleDeclutterDecision(item.id, 'donate')}
                            className={currentDecision === 'donate' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
                          >
                            <Archive className="h-4 w-4 mr-1" />
                            Donate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <Button
                onClick={handleConfirmDeclutter}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8"
              >
                Confirm Decisions & Update Wardrobe
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Updated Closet */}
        {currentStep === 5 && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Your Curated Digital Wardrobe
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Congratulations! Your wardrobe is now optimized for your personal style
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Curated Wardrobe */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-violet-500" />
                    Your Curated Collection
                  </CardTitle>
                  <CardDescription>
                    {keepItems.length} perfectly aligned items
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {keepItems.map((item: WardrobeItem) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center">
                        <span className="text-lg">👕</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">{item.itemName}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.category} • {item.color}</p>
                      </div>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Wardrobe Gap Map */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-violet-500" />
                    Wardrobe Gap Analysis
                  </CardTitle>
                  <CardDescription>
                    Smart suggestions for future purchases
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Missing Core Items</h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                        <li>• Classic white button-down shirt</li>
                        <li>• Well-fitted blazer in neutral tone</li>
                        <li>• Quality leather boots</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <h4 className="font-medium text-orange-900 dark:text-orange-300 mb-2">Over-represented</h4>
                      <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1">
                        <li>• 5 casual t-shirts (consider variety)</li>
                        <li>• 3 similar jeans (diversify styles)</li>
                      </ul>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Get Shopping Recommendations
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button
                onClick={() => setLocation('/dashboard')}
                variant="outline"
                className="mr-4"
              >
                Return to Dashboard
              </Button>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
                Share Your Curated Wardrobe
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}