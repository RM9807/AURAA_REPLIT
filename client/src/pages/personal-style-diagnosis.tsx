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
  gender: string;
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
    gender: '',
    age: '',
    height: '',
    bodyType: '',
    dailyActivity: '',
    comfortLevel: '',
    lifestyle: '',
    occasions: [],
    styleInspirations: '',
    budget: '',
    colorPreferences: [],
    colorAvoidances: [],
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
        return quizData.gender && quizData.age && quizData.height && quizData.bodyType;
      case 2:
        return quizData.dailyActivity && quizData.comfortLevel;
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
              <CardContent className="p-8 space-y-8">
                <div className="space-y-8">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      What's your gender identity?
                    </Label>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {[
                        { id: 'woman', title: 'Woman' },
                        { id: 'man', title: 'Man' },
                        { id: 'non-binary', title: 'Non-binary' },
                        { id: 'other', title: 'Other/Prefer not to say' }
                      ].map((option) => (
                        <div 
                          key={option.id} 
                          className={`relative border rounded-lg p-4 transition-colors cursor-pointer ${
                            quizData.gender === option.id 
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                          }`}
                          onClick={() => handleQuizChange('gender', option.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              quizData.gender === option.id ? 'border-violet-500' : 'border-slate-300'
                            }`}>
                              {quizData.gender === option.id && (
                                <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                              )}
                            </div>
                            <Label className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                              {option.title}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      What's your age range?
                    </Label>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {[
                        { id: '18-25', title: '18-25 years' },
                        { id: '26-35', title: '26-35 years' },
                        { id: '36-45', title: '36-45 years' },
                        { id: '46-55', title: '46-55 years' },
                        { id: '56+', title: '56+ years' }
                      ].map((option) => (
                        <div 
                          key={option.id} 
                          className={`relative border rounded-lg p-4 transition-colors cursor-pointer ${
                            quizData.age === option.id 
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                          }`}
                          onClick={() => handleQuizChange('age', option.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              quizData.age === option.id ? 'border-violet-500' : 'border-slate-300'
                            }`}>
                              {quizData.age === option.id && (
                                <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                              )}
                            </div>
                            <Label className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                              {option.title}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      What's your height?
                    </Label>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {[
                        { id: 'under-5-2', title: 'Under 5\'2"' },
                        { id: '5-2-5-6', title: '5\'2" - 5\'6"' },
                        { id: '5-6-5-10', title: '5\'6" - 5\'10"' },
                        { id: 'over-5-10', title: 'Over 5\'10"' }
                      ].map((option) => (
                        <div 
                          key={option.id} 
                          className={`relative border rounded-lg p-4 transition-colors cursor-pointer ${
                            quizData.height === option.id 
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                          }`}
                          onClick={() => handleQuizChange('height', option.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              quizData.height === option.id ? 'border-violet-500' : 'border-slate-300'
                            }`}>
                              {quizData.height === option.id && (
                                <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                              )}
                            </div>
                            <Label className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                              {option.title}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      What's your body shape?
                    </Label>
                    <div className="grid grid-cols-1 gap-4 mt-4">
                      {[
                        { id: 'pear', title: 'Pear', description: 'Hips wider than shoulders, smaller bust' },
                        { id: 'apple', title: 'Apple', description: 'Fuller midsection, broader shoulders' },
                        { id: 'hourglass', title: 'Hourglass', description: 'Balanced shoulders and hips, defined waist' },
                        { id: 'rectangle', title: 'Rectangle', description: 'Similar shoulder, waist, and hip measurements' },
                        { id: 'athletic', title: 'Athletic', description: 'Muscular build, broad shoulders, less defined waist' }
                      ].map((option) => (
                        <div 
                          key={option.id} 
                          className={`relative border rounded-lg p-4 transition-colors cursor-pointer ${
                            quizData.bodyType === option.id 
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                          }`}
                          onClick={() => handleQuizChange('bodyType', option.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${
                              quizData.bodyType === option.id ? 'border-violet-500' : 'border-slate-300'
                            }`}>
                              {quizData.bodyType === option.id && (
                                <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <Label className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                                {option.title}
                              </Label>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Lifestyle & Activity */}
          {currentStep === 2 && (
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-8">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 block">
                      What's your typical daily activity?
                    </Label>
                    <div className="space-y-4">
                      {[
                        { id: 'casual-relaxed', title: 'Casual & Relaxed', description: 'Working from home, running errands, casual meetups' },
                        { id: 'business-professional', title: 'Business Professional', description: 'Office work, meetings, professional events' },
                        { id: 'active-lifestyle', title: 'Active Lifestyle', description: 'Gym, outdoor activities, sports' },
                        { id: 'creative-artistic', title: 'Creative & Artistic', description: 'Studio work, galleries, creative spaces' },
                        { id: 'social-events', title: 'Social & Events', description: 'Parties, dinners, social gatherings' }
                      ].map((option) => (
                        <div 
                          key={option.id} 
                          className={`relative border rounded-lg p-4 transition-colors cursor-pointer ${
                            quizData.dailyActivity === option.id 
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                          }`}
                          onClick={() => handleQuizChange('dailyActivity', option.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${
                              quizData.dailyActivity === option.id ? 'border-violet-500' : 'border-slate-300'
                            }`}>
                              {quizData.dailyActivity === option.id && (
                                <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <Label className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                                {option.title}
                              </Label>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 block">
                      Describe your preferred comfort level
                    </Label>
                    <div className="space-y-4">
                      {[
                        { id: 'maximum-comfort', title: 'Maximum Comfort', description: 'Soft fabrics, loose fits, cozy styles' },
                        { id: 'balanced', title: 'Balanced', description: 'Mix of comfort and style' },
                        { id: 'style-first', title: 'Style First', description: 'Willing to sacrifice some comfort for great looks' },
                        { id: 'structured-polished', title: 'Structured & Polished', description: 'Tailored, crisp, put-together looks' }
                      ].map((option) => (
                        <div 
                          key={option.id} 
                          className={`relative border rounded-lg p-4 transition-colors cursor-pointer ${
                            quizData.comfortLevel === option.id 
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                          }`}
                          onClick={() => handleQuizChange('comfortLevel', option.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${
                              quizData.comfortLevel === option.id ? 'border-violet-500' : 'border-slate-300'
                            }`}>
                              {quizData.comfortLevel === option.id && (
                                <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <Label className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                                {option.title}
                              </Label>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Style Preferences */}
          {currentStep === 3 && (
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-8">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 block">
                      What occasions do you dress for most often?
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'work-professional', title: 'Work/Professional' },
                        { id: 'casual-daily', title: 'Casual Daily' },
                        { id: 'date-nights', title: 'Date Nights' },
                        { id: 'social-events', title: 'Social Events' },
                        { id: 'travel', title: 'Travel' },
                        { id: 'fitness-active', title: 'Fitness/Active' },
                        { id: 'special-events', title: 'Special Events' }
                      ].map((occasion) => (
                        <div 
                          key={occasion.id} 
                          className={`relative border rounded-lg p-4 transition-colors cursor-pointer ${
                            quizData.occasions.includes(occasion.id) 
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                          }`}
                          onClick={() => handleArrayFieldChange('occasions', occasion.id, !quizData.occasions.includes(occasion.id))}
                        >
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                              {occasion.title}
                            </Label>
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              quizData.occasions.includes(occasion.id) 
                                ? 'border-violet-500 bg-violet-500' 
                                : 'border-slate-300 dark:border-slate-500'
                            }`}>
                              {quizData.occasions.includes(occasion.id) && (
                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 block">
                      What's your style inspiration?
                    </Label>
                    <div className="space-y-4">
                      {[
                        { id: 'classic', title: 'Classic & Timeless', description: 'Clean lines, neutral colors' },
                        { id: 'trendy', title: 'Trendy & Fashion-Forward', description: 'Latest styles and colors' },
                        { id: 'romantic', title: 'Romantic & Feminine', description: 'Soft fabrics, floral patterns' },
                        { id: 'edgy', title: 'Edgy & Bold', description: 'Statement pieces, unique combinations' },
                        { id: 'minimalist', title: 'Minimalist & Simple', description: 'Clean, understated elegance' }
                      ].map((option) => (
                        <div 
                          key={option.id} 
                          className={`relative border rounded-lg p-4 transition-colors cursor-pointer ${
                            quizData.styleInspirations === option.id 
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                          }`}
                          onClick={() => handleQuizChange('styleInspirations', option.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${
                              quizData.styleInspirations === option.id ? 'border-violet-500' : 'border-slate-300'
                            }`}>
                              {quizData.styleInspirations === option.id && (
                                <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <Label className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                                {option.title}
                              </Label>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 block">
                      What's your clothing budget range?
                    </Label>
                    <div className="space-y-4">
                      {[
                        { id: 'budget', title: 'Budget-Friendly', description: '$0-50 per item' },
                        { id: 'moderate', title: 'Moderate', description: '$50-150 per item' },
                        { id: 'investment', title: 'Investment', description: '$150-500 per item' },
                        { id: 'luxury', title: 'Luxury', description: '$500+ per item' }
                      ].map((option) => (
                        <div 
                          key={option.id} 
                          className={`relative border rounded-lg p-4 transition-colors cursor-pointer ${
                            quizData.budget === option.id 
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                          }`}
                          onClick={() => handleQuizChange('budget', option.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${
                              quizData.budget === option.id ? 'border-violet-500' : 'border-slate-300'
                            }`}>
                              {quizData.budget === option.id && (
                                <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <Label className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                                {option.title}
                              </Label>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                      What colors do you gravitate towards?
                    </Label>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {[
                        { id: 'neutrals', title: 'Neutrals', description: 'Black, white, beige, gray' },
                        { id: 'earth-tones', title: 'Earth Tones', description: 'Brown, olive, rust, cream' },
                        { id: 'jewel-tones', title: 'Jewel Tones', description: 'Emerald, sapphire, ruby' },
                        { id: 'pastels', title: 'Pastels', description: 'Soft pink, lavender, mint' },
                        { id: 'bold-bright', title: 'Bold & Bright', description: 'Red, electric blue, hot pink' },
                        { id: 'monochrome', title: 'Monochrome', description: 'Strictly black and white' }
                      ].map((colorGroup) => (
                        <div 
                          key={colorGroup.id} 
                          className="relative border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={colorGroup.id}
                              checked={quizData.colorPreferences.includes(colorGroup.id)}
                              onCheckedChange={(checked) => handleArrayFieldChange('colorPreferences', colorGroup.id, checked as boolean)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <Label htmlFor={colorGroup.id} className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                                {colorGroup.title}
                              </Label>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {colorGroup.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      What colors do you tend to avoid? (Optional)
                    </Label>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {[
                        { id: 'neutrals', title: 'Neutrals', description: 'Black, white, beige, gray' },
                        { id: 'earth-tones', title: 'Earth Tones', description: 'Brown, olive, rust, cream' },
                        { id: 'jewel-tones', title: 'Jewel Tones', description: 'Emerald, sapphire, ruby' },
                        { id: 'pastels', title: 'Pastels', description: 'Soft pink, lavender, mint' },
                        { id: 'bold-bright', title: 'Bold & Bright', description: 'Red, electric blue, hot pink' },
                        { id: 'monochrome', title: 'Monochrome', description: 'Strictly black and white' }
                      ].map((colorGroup) => (
                        <div 
                          key={`avoid-${colorGroup.id}`} 
                          className="relative border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={`avoid-${colorGroup.id}`}
                              checked={quizData.colorAvoidances.includes(colorGroup.id)}
                              onCheckedChange={(checked) => handleArrayFieldChange('colorAvoidances', colorGroup.id, checked as boolean)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <Label htmlFor={`avoid-${colorGroup.id}`} className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                                {colorGroup.title}
                              </Label>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {colorGroup.description}
                              </p>
                            </div>
                          </div>
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
          
          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              <p>Step {currentStep} Valid: {isStepValid(currentStep) ? 'Yes' : 'No'}</p>
              {currentStep === 1 && (
                <>
                  <p>Gender: {quizData.gender || 'None'}</p>
                  <p>Age: {quizData.age || 'None'}</p>
                  <p>Height: {quizData.height || 'None'}</p>
                  <p>Body Type: {quizData.bodyType || 'None'}</p>
                </>
              )}
              {currentStep === 3 && (
                <>
                  <p>Occasions: {quizData.occasions.length} selected</p>
                  <p>Style: {quizData.styleInspirations || 'None'}</p>
                  <p>Budget: {quizData.budget || 'None'}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
