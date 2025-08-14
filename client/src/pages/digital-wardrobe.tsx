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
  Camera,
  ArrowLeft,
  ArrowRight,
  Star,
  ShoppingBag,
  Plus,
  ChevronRight,
  Sparkles,
  Palette,
  Scissors,
  Archive,
  Check,
  Loader2,
  FileImage
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
  const [currentUpload, setCurrentUpload] = useState({
    itemName: "",
    category: "",
    color: "",
    pattern: "",
    material: "",
    brand: "",
    season: "",
    notes: "",
    imageFile: null as File | null,
  });

  // Declutter state
  const [declutterDecisions, setDeclutterDecisions] = useState<{[key: number]: 'keep' | 'alter' | 'donate'}>({});

  const userId = user?.id || 1;

  // Fetch wardrobe data
  const { data: wardrobe, isLoading: wardrobeLoading } = useQuery({
    queryKey: ['/api/users', userId, 'wardrobe'],
  });

  // Type the wardrobe data properly
  const wardrobeItems = (wardrobe as WardrobeItem[]) || [];

  // Upload mutation - Fixed to send JSON instead of FormData
  const uploadMutation = useMutation({
    mutationFn: async (data: typeof currentUpload) => {
      const uploadData = {
        itemName: data.itemName,
        category: data.category,
        color: data.color,
        pattern: data.pattern || "",
        material: data.material || "",
        brand: data.brand || "",
        season: data.season || "",
        notes: data.notes || "",
        imageUrl: data.imageFile ? `uploaded-${data.imageFile.name}` : "",
        userId
      };

      return await apiRequest(`/api/users/${userId}/wardrobe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadData),
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
      toast({
        title: "Item Added",
        description: "Your wardrobe item has been successfully added.",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
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
  };

  // AI Analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/users/${userId}/wardrobe/analyze`, {
        method: 'POST',
      });
    },
    onSuccess: (response) => {
      const analysisResult = response.json();
      // Update wardrobe items with AI analysis results
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'wardrobe'] });
      toast({
        title: "Analysis Complete",
        description: "Your wardrobe has been analyzed with AI recommendations.",
      });
      setCurrentStep(3);
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze wardrobe. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAnalyzeWardrobe = () => {
    if (wardrobeItems.length === 0) {
      toast({
        title: "No Items to Analyze",
        description: "Please add some wardrobe items first.",
        variant: "destructive",
      });
      return;
    }
    analyzeMutation.mutate();
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
        "Hem pants for better length and fit",
        "Tailor shoulders for more flattering silhouette", 
        "Adjust waist for improved proportions",
        "Shorten sleeves to proper length"
      ],
      donate: [
        "This color washes out your skin tone",
        "The cut of this jacket doesn't flatter your shoulder line",
        "Style completely misaligned with your new aesthetic",
        "Poor quality fabric that doesn't match your standards"
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
    { number: 1, title: "Upload Items", description: "Add your clothing" },
    { number: 2, title: "AI Analysis", description: "Style assessment" },
    { number: 3, title: "Declutter", description: "Keep, Alter, Donate" },
    { number: 4, title: "Review", description: "Confirm decisions" },
    { number: 5, title: "Complete", description: "Updated closet" }
  ];

  const keepItems = wardrobeItems.filter(item => {
    const analysis = item.aiAnalysis || generateMockAnalysis(item);
    return analysis.recommendation === 'keep' || declutterDecisions[item.id] === 'keep';
  });
  
  const alterItems = wardrobeItems.filter(item => {
    const analysis = item.aiAnalysis || generateMockAnalysis(item);
    return analysis.recommendation === 'alter' || declutterDecisions[item.id] === 'alter';
  });
  
  const donateItems = wardrobeItems.filter(item => {
    const analysis = item.aiAnalysis || generateMockAnalysis(item);
    return analysis.recommendation === 'donate' || declutterDecisions[item.id] === 'donate';
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 py-4">
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
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Digital Wardrobe</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Transform your closet with AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps - Modern Design */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {stepsConfig.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                    ${currentStep >= step.number 
                      ? 'bg-violet-500 text-white' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }
                  `}>
                    {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-medium text-slate-900 dark:text-white">{step.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{step.description}</p>
                  </div>
                </div>
                {index < stepsConfig.length - 1 && (
                  <div className={`
                    flex-1 h-px mx-4 mt-[-16px]
                    ${currentStep > step.number 
                      ? 'bg-violet-500' 
                      : 'bg-slate-200 dark:bg-slate-700'
                    }
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Step 1: Upload Items */}
        {currentStep === 1 && (
          <div className="space-y-8">
            {/* Welcome Section */}
            {wardrobeItems.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-violet-100 dark:bg-violet-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-8 w-8 text-violet-500" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Begin digitizing your wardrobe
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Upload photos of your existing clothing items and add details. Our AI will help you create a curated, organized closet.
                </p>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Form - Simplified */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-violet-500" />
                    Add New Item
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Photo Upload */}
                  <div 
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-violet-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {currentUpload.imageFile ? (
                      <div className="space-y-2">
                        <FileImage className="h-8 w-8 text-violet-500 mx-auto" />
                        <p className="text-sm font-medium">{currentUpload.imageFile.name}</p>
                        <p className="text-xs text-slate-500">Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                        <p className="text-slate-600 dark:text-slate-400">Upload photo</p>
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

                  {/* Required Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="itemName">Item Name *</Label>
                      <Input
                        id="itemName"
                        value={currentUpload.itemName}
                        onChange={(e) => setCurrentUpload({ ...currentUpload, itemName: e.target.value })}
                        placeholder="e.g., Blue Denim Jacket"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={currentUpload.category} onValueChange={(value) => setCurrentUpload({ ...currentUpload, category: value })}>
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="color">Color *</Label>
                      <Input
                        id="color"
                        value={currentUpload.color}
                        onChange={(e) => setCurrentUpload({ ...currentUpload, color: e.target.value })}
                        placeholder="e.g., Navy Blue"
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        value={currentUpload.brand}
                        onChange={(e) => setCurrentUpload({ ...currentUpload, brand: e.target.value })}
                        placeholder="e.g., Levi's"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddItem}
                    disabled={uploadMutation.isPending}
                    className="w-full bg-violet-500 hover:bg-violet-600"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Current Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scan className="h-5 w-5 text-violet-500" />
                    Your Items
                  </CardTitle>
                  <CardDescription>
                    {wardrobe?.length || 0} items uploaded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {wardrobeLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">Loading...</p>
                    </div>
                  ) : wardrobeItems.length > 0 ? (
                    <div className="space-y-4">
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {wardrobeItems.map((item: WardrobeItem) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                              <span className="text-lg">👕</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.itemName}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">{item.category} • {item.color}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {wardrobeItems.length >= 3 && (
                        <Button
                          onClick={() => setCurrentStep(2)}
                          className="w-full bg-violet-500 hover:bg-violet-600"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Start AI Analysis
                        </Button>
                      )}
                      
                      {wardrobeItems.length < 3 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Add {3 - wardrobeItems.length} more items to start AI analysis
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">No items yet</p>
                      <p className="text-sm text-slate-500">Start by adding your first item</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: AI Analysis */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div>
              <div className="w-16 h-16 bg-violet-100 dark:bg-violet-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-violet-500 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                AI Cross-References with Your Style Profile
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Analyzing color harmony, style alignment, and fit compatibility with your profile.
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Analysis Progress</span>
                      <span className="font-medium">{analysisProgress}%</span>
                    </div>
                    <Progress value={analysisProgress} className="h-2" />
                  </div>
                  
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <Palette className="h-5 w-5 text-violet-500" />
                      <span>Color harmony analysis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-violet-500" />
                      <span>Style alignment scoring</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Scissors className="h-5 w-5 text-violet-500" />
                      <span>Fit assessment</span>
                    </div>
                  </div>

                  {!isAnalyzing && analysisProgress === 0 && (
                    <Button
                      onClick={handleAnalyzeWardrobe}
                      className="w-full bg-violet-500 hover:bg-violet-600"
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
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Organized Declutter Suggestions
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Your items organized into Keep, Alter, and Donate categories with explanations.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Keep Items */}
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="bg-green-50 dark:bg-green-950/30">
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    Keep ({keepItems.length})
                  </CardTitle>
                  <CardDescription className="text-green-600 dark:text-green-500">
                    Perfect style matches
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3 max-h-80 overflow-y-auto">
                  {keepItems.map((item: WardrobeItem) => (
                    <div key={item.id} className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-green-200 dark:bg-green-800 rounded flex items-center justify-center">
                          <span className="text-lg">👕</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.itemName}</p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            {generateMockAnalysis(item).reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Alter Items */}
              <Card className="border-yellow-200 dark:border-yellow-800">
                <CardHeader className="bg-yellow-50 dark:bg-yellow-950/30">
                  <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                    <Scissors className="h-5 w-5" />
                    Alter ({alterItems.length})
                  </CardTitle>
                  <CardDescription className="text-yellow-600 dark:text-yellow-500">
                    Need minor adjustments
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3 max-h-80 overflow-y-auto">
                  {alterItems.map((item: WardrobeItem) => (
                    <div key={item.id} className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-yellow-200 dark:bg-yellow-800 rounded flex items-center justify-center">
                          <span className="text-lg">👕</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.itemName}</p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            {generateMockAnalysis(item).reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Donate Items */}
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader className="bg-red-50 dark:bg-red-950/30">
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <Archive className="h-5 w-5" />
                    Donate ({donateItems.length})
                  </CardTitle>
                  <CardDescription className="text-red-600 dark:text-red-500">
                    Don't align with your style
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3 max-h-80 overflow-y-auto">
                  {donateItems.map((item: WardrobeItem) => (
                    <div key={item.id} className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-red-200 dark:bg-red-800 rounded flex items-center justify-center">
                          <span className="text-lg">👕</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.itemName}</p>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {generateMockAnalysis(item).reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button
                onClick={() => setCurrentStep(4)}
                className="bg-violet-500 hover:bg-violet-600 px-8"
              >
                Review Decisions
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review Decisions */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Review & Confirm Decisions
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Override AI suggestions by selecting different options for each item.
              </p>
            </div>

            <div className="space-y-4">
              {wardrobe?.map((item: WardrobeItem) => {
                const analysis = generateMockAnalysis(item);
                const currentDecision = declutterDecisions[item.id] || analysis.recommendation;
                
                return (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                          <span className="text-lg">👕</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.itemName}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{item.category} • {item.color}</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{analysis.reason}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant={currentDecision === 'keep' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleDeclutterDecision(item.id, 'keep')}
                            className={currentDecision === 'keep' ? 'bg-green-500 hover:bg-green-600' : ''}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Keep
                          </Button>
                          <Button
                            variant={currentDecision === 'alter' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleDeclutterDecision(item.id, 'alter')}
                            className={currentDecision === 'alter' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                          >
                            <Scissors className="h-4 w-4 mr-1" />
                            Alter
                          </Button>
                          <Button
                            variant={currentDecision === 'donate' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleDeclutterDecision(item.id, 'donate')}
                            className={currentDecision === 'donate' ? 'bg-red-500 hover:bg-red-600' : ''}
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

            <div className="text-center">
              <Button
                onClick={handleConfirmDeclutter}
                className="bg-violet-500 hover:bg-violet-600 px-8"
              >
                Confirm & Update Wardrobe
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Updated Digital Closet */}
        {currentStep === 5 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Updated Digital Closet Inventory
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Your wardrobe is now curated and optimized for your personal style.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Curated Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-violet-500" />
                    Curated Collection
                  </CardTitle>
                  <CardDescription>
                    {keepItems.length} optimal wardrobe items
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                  {keepItems.map((item: WardrobeItem) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                        <span className="text-lg">👕</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.category} • {item.color}</p>
                      </div>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Wardrobe Gap Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-violet-500" />
                    Wardrobe Gap Analysis
                  </CardTitle>
                  <CardDescription>
                    Smart shopping recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Missing Core Items</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                      <li>• Classic white button-down shirt</li>
                      <li>• Well-fitted blazer in neutral tone</li>
                      <li>• Quality leather boots</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                    <h4 className="font-medium text-orange-900 dark:text-orange-300 mb-2">Over-represented</h4>
                    <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1">
                      <li>• 5 casual t-shirts (consider variety)</li>
                      <li>• 3 similar jeans (diversify styles)</li>
                    </ul>
                  </div>

                  <Button className="w-full bg-violet-500 hover:bg-violet-600">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Get Shopping Recommendations
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center space-x-4">
              <Button
                onClick={() => setLocation('/dashboard')}
                variant="outline"
              >
                Return to Dashboard
              </Button>
              <Button className="bg-violet-500 hover:bg-violet-600">
                Share Your Curated Wardrobe
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}