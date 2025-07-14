import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Palette, 
  User, 
  Target,
  ChevronRight,
  ChevronLeft,
  Check
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface StyleQuizData {
  dailyActivity: string;
  comfortLevel: string;
  occasions: string[];
  styleInspirations: string;
  colorPreferences: string[];
  colorAvoidances: string[];
  bodyType: string;
  lifestyle: string;
  budget: string;
  goals: string[];
}

interface PhotoUploads {
  facePhoto: File | null;
  bodyPhotos: {
    front: File | null;
    side: File | null;
    back: File | null;
  };
}

export default function PersonalStyle() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [quizData, setQuizData] = useState<StyleQuizData>({
    dailyActivity: '',
    comfortLevel: '',
    occasions: [],
    styleInspirations: '',
    colorPreferences: [],
    colorAvoidances: [],
    bodyType: '',
    lifestyle: '',
    budget: '',
    goals: []
  });
  const [photos, setPhotos] = useState<PhotoUploads>({
    facePhoto: null,
    bodyPhotos: { front: null, side: null, back: null }
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const queryClient = useQueryClient();
  const userId = 1; // Get from auth context

  const createProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return await apiRequest(`/api/users/${userId}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'profile'] });
      setLocation('/dashboard');
    },
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (type: 'face' | 'front' | 'side' | 'back', file: File) => {
    if (type === 'face') {
      setPhotos(prev => ({ ...prev, facePhoto: file }));
    } else {
      setPhotos(prev => ({
        ...prev,
        bodyPhotos: { ...prev.bodyPhotos, [type]: file }
      }));
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const profileData = {
      ...quizData,
      skinTone: "warm", // Simulated AI analysis result
      seasonType: "autumn", // Simulated AI analysis result
      bodyShape: quizData.bodyType || "hourglass", // From quiz or AI analysis
      stylePersonality: quizData.dailyActivity + " " + quizData.comfortLevel,
      completedOnboarding: true
    };

    createProfileMutation.mutate(profileData);
  };

  const updateQuizData = (field: keyof StyleQuizData, value: any) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: 'occasions' | 'colorPreferences' | 'colorAvoidances' | 'goals', value: string) => {
    setQuizData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gradient-blue-teal border-t-transparent mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold mb-2">Creating Your Style Profile</h3>
            <p className="text-slate-600 mb-4">AURAA's AI is analyzing your photos and quiz responses...</p>
            <Progress value={85} className="h-2" />
            <p className="text-sm text-slate-500 mt-2">This usually takes 30-60 seconds</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/auraa-logo.png" alt="AURAA" className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-navy">Personal Style Profile</h1>
          </div>
          <p className="text-slate-600 mb-4">Let's discover your unique style DNA</p>
          <Progress value={progress} className="h-2 w-full max-w-md mx-auto" />
          <p className="text-sm text-slate-500 mt-2">Step {currentStep} of {totalSteps}</p>
        </div>

        <Card>
          <CardContent className="p-8">
            {/* Step 1: Style Quiz Introduction */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <User className="h-12 w-12 mx-auto mb-4 text-gradient-blue-teal" />
                  <h2 className="text-xl font-semibold mb-2">Let's Get to Know You</h2>
                  <p className="text-slate-600">We'll ask a few questions to understand your lifestyle and preferences</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dailyActivity">What's your typical daily activity?</Label>
                    <RadioGroup 
                      value={quizData.dailyActivity} 
                      onValueChange={(value) => updateQuizData('dailyActivity', value)}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="professional" id="professional" />
                        <Label htmlFor="professional">Professional/Business</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="casual" id="casual" />
                        <Label htmlFor="casual">Casual/Everyday</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="active" id="active" />
                        <Label htmlFor="active">Active/Athletic</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="creative" id="creative" />
                        <Label htmlFor="creative">Creative/Artistic</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="comfortLevel">Describe your preferred comfort level</Label>
                    <RadioGroup 
                      value={quizData.comfortLevel} 
                      onValueChange={(value) => updateQuizData('comfortLevel', value)}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="relaxed" id="relaxed" />
                        <Label htmlFor="relaxed">Relaxed & Easy-going</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="polished" id="polished" />
                        <Label htmlFor="polished">Polished & Put-together</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="edgy" id="edgy" />
                        <Label htmlFor="edgy">Edgy & Fashion-forward</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="classic" id="classic" />
                        <Label htmlFor="classic">Classic & Timeless</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Occasions and Inspirations */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gradient-purple-pink" />
                  <h2 className="text-xl font-semibold mb-2">Style Occasions & Inspirations</h2>
                  <p className="text-slate-600">Tell us about when and how you like to dress</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>What occasions do you dress for most often? (Select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['Work/Office', 'Social Events', 'Date Nights', 'Travel', 'Family Time', 'Workouts'].map((occasion) => (
                        <div key={occasion} className="flex items-center space-x-2">
                          <Checkbox 
                            id={occasion}
                            checked={quizData.occasions.includes(occasion)}
                            onCheckedChange={() => toggleArrayValue('occasions', occasion)}
                          />
                          <Label htmlFor={occasion} className="text-sm">{occasion}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="inspirations">Who are your style inspirations?</Label>
                    <Textarea 
                      id="inspirations"
                      placeholder="e.g., Emma Stone, Zendaya, minimalist bloggers, vintage icons..."
                      value={quizData.styleInspirations}
                      onChange={(e) => updateQuizData('styleInspirations', e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lifestyle">Describe your lifestyle</Label>
                    <RadioGroup 
                      value={quizData.lifestyle} 
                      onValueChange={(value) => updateQuizData('lifestyle', value)}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="busy" id="busy" />
                        <Label htmlFor="busy">Busy & On-the-go</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="balanced" id="balanced" />
                        <Label htmlFor="balanced">Balanced Work-Life</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="social" id="social" />
                        <Label htmlFor="social">Social & Event-focused</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="home" id="home" />
                        <Label htmlFor="home">Home-based & Casual</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Color Preferences */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Palette className="h-12 w-12 mx-auto mb-4 text-gradient-blue-teal" />
                  <h2 className="text-xl font-semibold mb-2">Color Preferences</h2>
                  <p className="text-slate-600">Help us understand your color personality</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>What colors do you usually gravitate towards?</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {['Black', 'White', 'Navy', 'Grey', 'Beige', 'Brown', 'Red', 'Pink', 'Purple', 'Blue', 'Green', 'Yellow'].map((color) => (
                        <div key={color} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`pref-${color}`}
                            checked={quizData.colorPreferences.includes(color)}
                            onCheckedChange={() => toggleArrayValue('colorPreferences', color)}
                          />
                          <Label htmlFor={`pref-${color}`} className="text-sm">{color}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>What colors do you tend to avoid?</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {['Bright/Neon', 'Orange', 'Yellow', 'Pink', 'Purple', 'Red', 'Brown', 'Green'].map((color) => (
                        <div key={color} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`avoid-${color}`}
                            checked={quizData.colorAvoidances.includes(color)}
                            onCheckedChange={() => toggleArrayValue('colorAvoidances', color)}
                          />
                          <Label htmlFor={`avoid-${color}`} className="text-sm">{color}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="budget">What's your typical clothing budget per month?</Label>
                    <RadioGroup 
                      value={quizData.budget} 
                      onValueChange={(value) => updateQuizData('budget', value)}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="under-100" id="under-100" />
                        <Label htmlFor="under-100">Under $100</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="100-300" id="100-300" />
                        <Label htmlFor="100-300">$100 - $300</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="300-500" id="300-500" />
                        <Label htmlFor="300-500">$300 - $500</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="over-500" id="over-500" />
                        <Label htmlFor="over-500">Over $500</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Photo Upload */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-gradient-purple-pink" />
                  <h2 className="text-xl font-semibold mb-2">AI Photo Analysis</h2>
                  <p className="text-slate-600">Upload photos for personalized color and fit analysis</p>
                </div>

                <div className="space-y-6">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                    <h3 className="font-medium mb-2">Face Photo for Color Analysis</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Upload a clear, well-lit photo of your face with no makeup, facing forward for accurate skin tone detection.
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Label htmlFor="face-photo" className="cursor-pointer">
                          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-slate-400 transition-colors">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                            <p className="text-sm text-slate-600">
                              {photos.facePhoto ? photos.facePhoto.name : 'Click to upload face photo'}
                            </p>
                          </div>
                          <Input 
                            id="face-photo" 
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload('face', file);
                            }}
                          />
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                    <h3 className="font-medium mb-2">Body Photos for Fit Analysis</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Upload full-body photos (front, side, back) in form-fitting clothing for precise measurements and shape identification.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {['front', 'side', 'back'].map((view) => (
                        <div key={view}>
                          <Label htmlFor={`body-${view}`} className="cursor-pointer">
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-slate-400 transition-colors">
                              <Upload className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                              <p className="text-xs text-slate-600">
                                {photos.bodyPhotos[view as keyof typeof photos.bodyPhotos]?.name || `${view} view`}
                              </p>
                            </div>
                            <Input 
                              id={`body-${view}`} 
                              type="file" 
                              accept="image/*" 
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(view as 'front' | 'side' | 'back', file);
                              }}
                            />
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Style Goals */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-gradient-blue-teal" />
                  <h2 className="text-xl font-semibold mb-2">Set Your Style Goals</h2>
                  <p className="text-slate-600">What do you want to achieve with your personal style?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>What are your style goals? (Select all that apply)</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {[
                        'Dress for promotion/career advancement',
                        'Post-pregnancy wardrobe refresh',
                        'Creative self-expression',
                        'Build confidence',
                        'Simplify getting dressed',
                        'Discover new style directions',
                        'Invest in quality pieces',
                        'Organize existing wardrobe'
                      ].map((goal) => (
                        <div key={goal} className="flex items-center space-x-2">
                          <Checkbox 
                            id={goal}
                            checked={quizData.goals.includes(goal)}
                            onCheckedChange={() => toggleArrayValue('goals', goal)}
                          />
                          <Label htmlFor={goal} className="text-sm">{goal}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-slate-800 mb-2">What happens next?</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• AI analyzes your photos for color and body analysis</li>
                      <li>• Personalized style profile is created</li>
                      <li>• Custom recommendations based on your goals</li>
                      <li>• Access to all AURAA AI styling features</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              
              {currentStep < totalSteps ? (
                <Button 
                  onClick={handleNext}
                  className="bg-gradient-blue-teal text-white flex items-center gap-2"
                  disabled={
                    (currentStep === 1 && (!quizData.dailyActivity || !quizData.comfortLevel)) ||
                    (currentStep === 2 && quizData.occasions.length === 0) ||
                    (currentStep === 3 && quizData.colorPreferences.length === 0) ||
                    (currentStep === 4 && !photos.facePhoto)
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={createProfileMutation.isPending || quizData.goals.length === 0}
                  className="bg-gradient-purple-pink text-white flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Create My Style Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}