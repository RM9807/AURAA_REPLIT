import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Upload, Sparkles, User, Camera, Palette, Target, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';

interface StyleQuizData {
  // Step 1: Basic Info
  age: string;
  height: string;
  bodyType: string;
  
  // Step 2: Lifestyle & Activity
  dailyActivity: string;
  comfortLevel: string;
  lifestyle: string;
  
  // Step 3: Style Preferences
  occasions: string[];
  styleInspirations: string;
  budget: string;
  
  // Step 4: Color Preferences
  colorPreferences: string[];
  colorAvoidances: string[];
  
  // Step 5: Goals
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

export default function PersonalStyleDiagnosis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quizData, setQuizData] = useState<StyleQuizData>({
    dailyActivity: '',
    comfortLevel: '',
    occasions: [],
    styleInspirations: '',
    colorPreferences: [],
    colorAvoidances: [],
    age: '',
    height: '',
    bodyType: '',
    lifestyle: '',
    budget: '',
    goals: []
  });
  
  const [photoUploads, setPhotoUploads] = useState<PhotoUploads>({
    facePhoto: null,
    bodyPhotos: {
      front: null,
      side: null,
      back: null
    }
  });

  const quizSteps = [
    { id: 1, title: 'Basic Info', icon: User, description: 'Tell us about yourself' },
    { id: 2, title: 'Lifestyle', icon: Target, description: 'Your daily activities and comfort' },
    { id: 3, title: 'Style Preferences', icon: Palette, description: 'Occasions and inspirations' },
    { id: 4, title: 'Color Profile', icon: Sparkles, description: 'Your color preferences' },
    { id: 5, title: 'Goals', icon: CheckCircle, description: 'What you want to achieve' }
  ];

  const totalSteps = quizSteps.length;

  const userId = user?.id || 1;

  // Mutation to save user profile
  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return await apiRequest(`/api/users/${userId}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
    },
    onSuccess: () => {
      // Invalidate all profile-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      
      // Refetch profile data to get the latest saved information
      queryClient.refetchQueries({ queryKey: ['/api/users', userId, 'profile'] });
      
      toast({
        title: "Profile Saved",
        description: "Your style profile has been successfully created.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (type: 'face' | 'front' | 'side' | 'back', file: File) => {
    if (type === 'face') {
      setPhotoUploads(prev => ({ ...prev, facePhoto: file }));
    } else {
      setPhotoUploads(prev => ({
        ...prev,
        bodyPhotos: { ...prev.bodyPhotos, [type]: file }
      }));
    }
  };

  const handleQuizChange = (field: keyof StyleQuizData, value: string | string[]) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (field: keyof StyleQuizData, value: string, checked: boolean) => {
    const currentArray = quizData[field] as string[];
    if (checked) {
      handleQuizChange(field, [...currentArray, value]);
    } else {
      handleQuizChange(field, currentArray.filter(item => item !== value));
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const processProfile = async () => {
    setIsProcessing(true);
    
    // Prepare profile data for database
    const profileData = {
      bodyType: quizData.bodyType || 'hourglass',
      dailyActivity: quizData.dailyActivity,
      comfortLevel: quizData.comfortLevel,
      occasions: quizData.occasions,
      styleInspirations: quizData.styleInspirations,
      colorPreferences: quizData.colorPreferences,
      colorAvoidances: quizData.colorAvoidances,
      lifestyle: quizData.lifestyle,
      budget: quizData.budget,
      goals: quizData.goals,
      age: quizData.age,
      height: quizData.height,
    };
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Save profile to database
      await saveProfileMutation.mutateAsync(profileData);
      
      setIsProcessing(false);
      nextStep();
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  // Validation for each step
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return quizData.age && quizData.height && quizData.bodyType;
      case 2:
        return quizData.dailyActivity && quizData.comfortLevel && quizData.lifestyle;
      case 3:
        return quizData.occasions.length > 0 && quizData.styleInspirations && quizData.budget;
      case 4:
        return quizData.colorPreferences.length > 0;
      case 5:
        return quizData.goals.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation('/dashboard')}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <img src="/auraa-logo.png" alt="AURAA" className="h-8 w-8" />
            <div className="text-right">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Personal Style Diagnosis</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Discover your unique style DNA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="mb-8">
          {/* Step Progress */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-violet-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {quizSteps[currentStep - 1]?.description}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-6">
            <div 
              className="bg-gradient-to-r from-violet-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          {/* Current Step Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {quizSteps[currentStep - 1]?.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {quizSteps[currentStep - 1]?.description}
            </p>
          </div>
        </div>

        {/* Quiz Content with Smooth Transitions */}
        <div className={`transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
          
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="age" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      What's your age?
                    </Label>
                    <RadioGroup 
                      value={quizData.age} 
                      onValueChange={(value) => handleQuizChange('age', value)}
                      className="grid grid-cols-2 gap-3 mt-3"
                    >
                      {['18-25', '26-35', '36-45', '46-55', '55+'].map((age) => (
                        <div key={age} className="flex items-center space-x-2">
                          <RadioGroupItem value={age} id={age} />
                          <Label htmlFor={age} className="text-sm">{age}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="height" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      What's your height?
                    </Label>
                    <RadioGroup 
                      value={quizData.height} 
                      onValueChange={(value) => handleQuizChange('height', value)}
                      className="grid grid-cols-2 gap-3 mt-3"
                    >
                      {['Under 5\'2"', '5\'2" - 5\'5"', '5\'6" - 5\'8"', '5\'9" - 6\'0"', 'Over 6\'0"'].map((height) => (
                        <div key={height} className="flex items-center space-x-2">
                          <RadioGroupItem value={height} id={height} />
                          <Label htmlFor={height} className="text-sm">{height}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="bodyType" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Which body shape best describes you?
                    </Label>
                    <RadioGroup 
                      value={quizData.bodyType} 
                      onValueChange={(value) => handleQuizChange('bodyType', value)}
                      className="grid grid-cols-2 gap-3 mt-3"
                    >
                      {['Apple', 'Pear', 'Hourglass', 'Rectangle', 'Inverted Triangle'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <RadioGroupItem value={type} id={type} />
                          <Label htmlFor={type} className="text-sm">{type}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Lifestyle & Activity */}
          {currentStep === 2 && (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      What's your daily activity level?
                    </Label>
                    <RadioGroup 
                      value={quizData.dailyActivity} 
                      onValueChange={(value) => handleQuizChange('dailyActivity', value)}
                      className="space-y-3 mt-3"
                    >
                      {[
                        { value: 'sedentary', label: 'Mostly sitting (office work, studying)' },
                        { value: 'light', label: 'Light activity (some walking, standing)' },
                        { value: 'moderate', label: 'Moderate activity (regular exercise, active job)' },
                        { value: 'active', label: 'Very active (fitness enthusiast, physical job)' }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="text-sm">{option.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      What's your comfort priority?
                    </Label>
                    <RadioGroup 
                      value={quizData.comfortLevel} 
                      onValueChange={(value) => handleQuizChange('comfortLevel', value)}
                      className="space-y-3 mt-3"
                    >
                      {[
                        { value: 'comfort', label: 'Comfort is everything - I prioritize ease of movement' },
                        { value: 'balanced', label: 'Balanced - I want to look good and feel comfortable' },
                        { value: 'style', label: 'Style first - I\'m willing to sacrifice some comfort for looks' }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="text-sm">{option.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      How would you describe your lifestyle?
                    </Label>
                    <RadioGroup 
                      value={quizData.lifestyle} 
                      onValueChange={(value) => handleQuizChange('lifestyle', value)}
                      className="space-y-3 mt-3"
                    >
                      {[
                        { value: 'professional', label: 'Professional - Office environment, meetings, networking' },
                        { value: 'casual', label: 'Casual - Relaxed environment, work from home' },
                        { value: 'social', label: 'Social - Frequent events, dinners, social gatherings' },
                        { value: 'active', label: 'Active - Gym, outdoor activities, sports' },
                        { value: 'creative', label: 'Creative - Artistic expression, unique environments' }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="text-sm">{option.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Style Preferences */}
          {currentStep === 3 && (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Which occasions do you need outfits for? (Select all that apply)
                    </Label>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {['Work/Business', 'Social Events', 'Date Nights', 'Casual Outings', 'Fitness/Active', 'Special Events'].map((occasion) => (
                        <div key={occasion} className="flex items-center space-x-2">
                          <Checkbox
                            id={occasion}
                            checked={quizData.occasions.includes(occasion)}
                            onCheckedChange={(checked) => handleArrayFieldChange('occasions', occasion, checked as boolean)}
                          />
                          <Label htmlFor={occasion} className="text-sm">{occasion}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      What's your style inspiration?
                    </Label>
                    <RadioGroup 
                      value={quizData.styleInspirations} 
                      onValueChange={(value) => handleQuizChange('styleInspirations', value)}
                      className="space-y-3 mt-3"
                    >
                      {[
                        { value: 'classic', label: 'Classic & Timeless - Clean lines, neutral colors' },
                        { value: 'trendy', label: 'Trendy & Fashion-Forward - Latest styles and colors' },
                        { value: 'romantic', label: 'Romantic & Feminine - Soft fabrics, floral patterns' },
                        { value: 'edgy', label: 'Edgy & Bold - Statement pieces, unique combinations' },
                        { value: 'minimalist', label: 'Minimalist & Simple - Clean, understated elegance' }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="text-sm">{option.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      What's your clothing budget range?
                    </Label>
                    <RadioGroup 
                      value={quizData.budget} 
                      onValueChange={(value) => handleQuizChange('budget', value)}
                      className="space-y-3 mt-3"
                    >
                      {[
                        { value: 'budget', label: 'Budget-Friendly ($0-50 per item)' },
                        { value: 'moderate', label: 'Moderate ($50-150 per item)' },
                        { value: 'investment', label: 'Investment ($150-500 per item)' },
                        { value: 'luxury', label: 'Luxury ($500+ per item)' }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="text-sm">{option.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Color Preferences */}
          {currentStep === 4 && (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Which colors do you love wearing? (Select all that apply)
                    </Label>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {['Black', 'White', 'Navy', 'Gray', 'Beige', 'Brown', 'Red', 'Pink', 'Purple', 'Blue', 'Green', 'Yellow', 'Orange'].map((color) => (
                        <div key={color} className="flex items-center space-x-2">
                          <Checkbox
                            id={color}
                            checked={quizData.colorPreferences.includes(color)}
                            onCheckedChange={(checked) => handleArrayFieldChange('colorPreferences', color, checked as boolean)}
                          />
                          <Label htmlFor={color} className="text-sm">{color}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Are there any colors you prefer to avoid? (Optional)
                    </Label>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {['Black', 'White', 'Navy', 'Gray', 'Beige', 'Brown', 'Red', 'Pink', 'Purple', 'Blue', 'Green', 'Yellow', 'Orange'].map((color) => (
                        <div key={color} className="flex items-center space-x-2">
                          <Checkbox
                            id={`avoid-${color}`}
                            checked={quizData.colorAvoidances.includes(color)}
                            onCheckedChange={(checked) => handleArrayFieldChange('colorAvoidances', color, checked as boolean)}
                          />
                          <Label htmlFor={`avoid-${color}`} className="text-sm">{color}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Goals */}
          {currentStep === 5 && (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      What are your main style goals? (Select all that apply)
                    </Label>
                    <div className="space-y-3 mt-3">
                      {[
                        'Build a capsule wardrobe',
                        'Find my signature style',
                        'Dress for my body type',
                        'Update my professional wardrobe',
                        'Expand my color palette',
                        'Learn to mix and match better',
                        'Shop more efficiently',
                        'Build confidence through style',
                        'Develop a more polished look',
                        'Express my personality through clothes'
                      ].map((goal) => (
                        <div key={goal} className="flex items-center space-x-2">
                          <Checkbox
                            id={goal}
                            checked={quizData.goals.includes(goal)}
                            onCheckedChange={(checked) => handleArrayFieldChange('goals', goal, checked as boolean)}
                          />
                          <Label htmlFor={goal} className="text-sm">{goal}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center max-w-2xl mx-auto mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <Button
            onClick={currentStep === totalSteps ? processProfile : nextStep}
            disabled={!isStepValid(currentStep)}
            className="flex items-center space-x-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          >
            <span>{currentStep === totalSteps ? 'Complete Quiz' : 'Next'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
