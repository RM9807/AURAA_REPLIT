import { useState, useEffect } from 'react';
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
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [styleDNAResults, setStyleDNAResults] = useState<any>(null);

  // Reset analysis results on component mount to ensure fresh results
  useEffect(() => {
    setStyleDNAResults(null);
    setAnalysisComplete(false);
    // Clear cache for recommendations to ensure fresh data
    const userId = (user as any)?.id || 1;
    queryClient.removeQueries({ queryKey: ['/api/users', userId, 'recommendations'] });
  }, []); // Empty dependency array to run only on mount
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
    { id: 5, title: 'Goals', icon: CheckCircle, description: 'What you want to achieve' },
    { id: 6, title: 'Photo Upload', icon: Camera, description: 'Upload photos for AI analysis' },
    { id: 7, title: 'AI Analysis', icon: Sparkles, description: 'Creating your Style DNA' },
    { id: 8, title: 'Results', icon: CheckCircle, description: 'Your personalized Style DNA' }
  ];

  const totalSteps = quizSteps.length;

  const userId = (user as any)?.id || 1;

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
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'analytics'] });
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
    
    // Show AI Style DNA analysis step
    setCurrentStep(7); // Move to AI analysis step
    
    try {
      // Prepare analysis input for OpenAI
      const analysisInput: any = {
        gender: 'female', // Can be added to form if needed
        age: quizData.age || '25',
        height: quizData.height || '5\'5"',
        bodyType: quizData.bodyType || 'hourglass',
        dailyActivity: quizData.dailyActivity,
        comfortLevel: quizData.comfortLevel,
        lifestyle: quizData.lifestyle,
        occasions: quizData.occasions,
        styleInspirations: quizData.styleInspirations,
        budget: quizData.budget,
        colorPreferences: quizData.colorPreferences,
        colorAvoidances: quizData.colorAvoidances,
        goals: quizData.goals,
      };

      // Add photo analysis if face photo is uploaded
      if (photoUploads.facePhoto) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(photoUploads.facePhoto!);
        });
        
        const base64Image = await base64Promise;
        
        // Analyze photo for color recommendations
        const photoAnalysisResponse = await fetch(`/api/users/1/analyze-photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: base64Image })
        });
        
        if (photoAnalysisResponse.ok) {
          const photoAnalysis = await photoAnalysisResponse.json();
          analysisInput.skinTone = photoAnalysis.colorAnalysis.skinTone;
          analysisInput.hairColor = photoAnalysis.colorAnalysis.hairColor;
          analysisInput.eyeColor = photoAnalysis.colorAnalysis.eyeColor;
        }
      }

      // Call OpenAI Style Analysis API
      const analysisResponse = await fetch(`/api/users/1/analyze-style`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisInput)
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze style');
      }

      const analysisResult = await analysisResponse.json();
      
      // Convert OpenAI results to our format
      const styleDNAResults = {
        styleArchetype: {
          name: analysisResult.styleDNA?.primaryStyle || 'Classic Elegance',
          description: analysisResult.styleDNA?.styleDescription || 'Timeless pieces with clean lines and sophisticated details'
        },
        colorPalette: analysisResult.styleDNA?.colorPalette?.bestColors || 
          // Generate comprehensive palette based on user preferences
          (() => {
            const baseColors = ['#2F4F4F', '#8FBC8F', '#F5F5DC', '#DDA0DD', '#CD853F'];
            const extendedColors = [];
            
            // Add colors based on user preferences
            if (quizData.colorPreferences.includes('neutrals')) {
              extendedColors.push('#8B7D6B', '#A9A9A9', '#D3D3D3', '#F5F5F5');
            }
            if (quizData.colorPreferences.includes('earth-tones')) {
              extendedColors.push('#DEB887', '#CD853F', '#D2691E', '#A0522D');
            }
            if (quizData.colorPreferences.includes('jewel-tones')) {
              extendedColors.push('#4169E1', '#8A2BE2', '#DC143C', '#228B22');
            }
            if (quizData.colorPreferences.includes('pastels')) {
              extendedColors.push('#DDA0DD', '#FFB6C1', '#98FB98', '#87CEEB');
            }
            if (quizData.colorPreferences.includes('bold-bright')) {
              extendedColors.push('#FF6347', '#FF69B4', '#00CED1', '#FFD700');
            }
            if (quizData.colorPreferences.includes('monochrome')) {
              extendedColors.push('#2F2F2F', '#696969', '#A9A9A9', '#D3D3D3');
            }
            
            // Combine and ensure we have at least 8 colors
            const allColors = [...baseColors, ...extendedColors];
            return allColors.slice(0, Math.max(8, allColors.length));
          })(),
        bodyAnalysis: {
          bodyType: quizData.bodyType,
          recommendations: Array.isArray(analysisResult.styleDNA?.bodyAnalysis?.bestSilhouettes) ? 
            analysisResult.styleDNA.bodyAnalysis.bestSilhouettes : 
            [analysisResult.styleDNA?.bodyAnalysis?.bestSilhouettes || 'Emphasize your waist with fitted styles'],
          fitTips: Array.isArray(analysisResult.styleDNA?.bodyAnalysis?.fitGuidance) ? 
            analysisResult.styleDNA.bodyAnalysis.fitGuidance : 
            [analysisResult.styleDNA?.bodyAnalysis?.fitGuidance || 'Choose well-fitted pieces that follow your natural silhouette']
        },
        personalizedTips: Array.isArray(analysisResult.styleDNA?.personalizedTips?.stylingTips) ? 
          analysisResult.styleDNA.personalizedTips.stylingTips : 
          ['Build a capsule wardrobe with versatile pieces', 'Invest in quality basics in your best colors'],
        shoppingGuide: Array.isArray(analysisResult.styleDNA?.personalizedTips?.shoppingGuide) ? 
          analysisResult.styleDNA.personalizedTips.shoppingGuide : 
          ['Well-fitted blazer in a neutral color', 'Classic white button-down shirt', 'Dark wash jeans that fit perfectly'],
        confidenceScore: Math.round((analysisResult.styleDNA?.confidenceScore || 0.85) * 100)
      };
      
      setStyleDNAResults(styleDNAResults);
      setIsProcessing(false);
      setAnalysisComplete(true);
      
      // Invalidate and refetch all related queries to show fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      
      // Refetch the data to ensure it's updated
      await queryClient.refetchQueries({ queryKey: ['/api/users', userId, 'recommendations'] });
      await queryClient.refetchQueries({ queryKey: ['/api/users', userId, 'profile'] });
      
      // Move to results step
      setCurrentStep(8);
      
      toast({
        title: "Analysis Complete!",
        description: "Your personalized Style DNA has been generated.",
      });
      
    } catch (error) {
      setIsProcessing(false);
      console.error('Style analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to complete style analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Generate Style DNA results based on user input
  const generateStyleDNAResults = (data: StyleQuizData, photos: PhotoUploads) => {
    // Generate color palette based on preferences
    const colorPalettes = {
      warm: ['#D2691E', '#CD853F', '#DEB887', '#F4A460', '#8B4513'],
      cool: ['#4682B4', '#6495ED', '#87CEEB', '#B0C4DE', '#778899'],
      neutral: ['#2F2F2F', '#696969', '#A9A9A9', '#D3D3D3', '#F5F5F5'],
      vibrant: ['#FF6347', '#FF69B4', '#00CED1', '#32CD32', '#FFD700']
    };

    let primaryPalette = colorPalettes.neutral;
    if (data.colorPreferences.includes('warm-tones')) primaryPalette = colorPalettes.warm;
    else if (data.colorPreferences.includes('cool-tones')) primaryPalette = colorPalettes.cool;
    else if (data.colorPreferences.includes('bold-bright')) primaryPalette = colorPalettes.vibrant;

    // Generate style archetype based on preferences
    const styleArchetypes = {
      classic: { name: 'Classic Elegance', description: 'Timeless pieces with clean lines and sophisticated details' },
      bohemian: { name: 'Bohemian Spirit', description: 'Free-spirited with artistic flair and flowing silhouettes' },
      minimalist: { name: 'Modern Minimalist', description: 'Clean, simple lines with focus on quality and fit' },
      romantic: { name: 'Romantic Feminine', description: 'Soft textures, delicate details, and flattering silhouettes' },
      edgy: { name: 'Urban Edge', description: 'Contemporary pieces with bold details and statement elements' }
    };

    let styleArchetype = styleArchetypes.classic;
    if (data.styleInspirations === 'street-style') styleArchetype = styleArchetypes.edgy;
    else if (data.styleInspirations === 'vintage') styleArchetype = styleArchetypes.romantic;
    else if (data.comfortLevel === 'very-comfortable') styleArchetype = styleArchetypes.minimalist;

    return {
      styleArchetype,
      colorPalette: primaryPalette,
      bodyAnalysis: {
        bodyType: data.bodyType,
        recommendations: getBodyTypeRecommendations(data.bodyType),
        fitTips: getFitTips(data.bodyType)
      },
      personalizedTips: getPersonalizedTips(data),
      shoppingGuide: getShoppingGuide(data),
      confidenceScore: 92
    };
  };

  const getBodyTypeRecommendations = (bodyType: string) => {
    const recommendations = {
      hourglass: 'Emphasize your waist with fitted styles and belted pieces',
      apple: 'Focus on creating a defined waistline with A-line and empire cuts',
      pear: 'Balance your proportions with structured shoulders and fitted tops',
      rectangle: 'Create curves with layering and textured fabrics',
      'inverted-triangle': 'Soften your shoulders with flowing fabrics and wider hems'
    };
    return recommendations[bodyType as keyof typeof recommendations] || recommendations.hourglass;
  };

  const getFitTips = (bodyType: string) => {
    const tips = {
      hourglass: ['High-waisted bottoms', 'Wrap dresses', 'Fitted blazers'],
      apple: ['Empire waistlines', 'A-line dresses', 'Open necklines'],
      pear: ['Structured shoulders', 'Wide-leg pants', 'Statement tops'],
      rectangle: ['Belted jackets', 'Layered looks', 'Textured fabrics'],
      'inverted-triangle': ['Soft shoulders', 'A-line skirts', 'Flowy tops']
    };
    return tips[bodyType as keyof typeof tips] || tips.hourglass;
  };

  const getPersonalizedTips = (data: StyleQuizData) => {
    const tips = [];
    if (data.occasions.includes('work')) tips.push('Invest in quality blazers and tailored pieces for professional settings');
    if (data.goals.includes('Build confidence through style')) tips.push('Start with one signature piece that makes you feel powerful');
    if (data.budget === 'budget-conscious') tips.push('Focus on versatile basics that can be styled multiple ways');
    return tips.slice(0, 3);
  };

  const getShoppingGuide = (data: StyleQuizData) => {
    const priorities = [];
    if (data.goals.includes('Build a capsule wardrobe')) priorities.push('Neutral blazer', 'Well-fitted jeans', 'Classic white shirt');
    if (data.occasions.includes('casual')) priorities.push('Comfortable sneakers', 'Casual dresses');
    if (data.occasions.includes('formal')) priorities.push('Little black dress', 'Professional heels');
    return priorities.slice(0, 5);
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
      case 6:
        return photoUploads.facePhoto !== null; // At least face photo is required
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

          {/* Step 6: Photo Upload for AI Analysis */}
          {currentStep === 6 && (
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8 space-y-8">
                <div className="text-center mb-8">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-violet-500" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Upload Photos for AI Style Analysis
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Help our AI create your personalized Style DNA by uploading photos
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Face Photo for Color Analysis */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 block">
                      Face Photo (Required) - For Color Analysis
                    </Label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-violet-400 transition-colors">
                      {photoUploads.facePhoto ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Face photo uploaded: {photoUploads.facePhoto.name}
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => setPhotoUploads(prev => ({ ...prev, facePhoto: null }))}
                            className="text-sm"
                          >
                            Remove Photo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-8 w-8 mx-auto text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                              Upload a clear face photo for AI color analysis
                            </p>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('face', file);
                              }}
                              className="max-w-xs mx-auto"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Photos for Fit Analysis */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 block">
                      Body Photos (Optional) - For Fit & Style Analysis
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(['front', 'side', 'back'] as const).map((angle) => (
                        <div key={angle} className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center hover:border-violet-400 transition-colors">
                          {photoUploads.bodyPhotos[angle] ? (
                            <div className="space-y-2">
                              <CheckCircle className="h-6 w-6 mx-auto text-green-500" />
                              <p className="text-xs text-green-600 dark:text-green-400">
                                {angle.charAt(0).toUpperCase() + angle.slice(1)} photo uploaded
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPhotoUploads(prev => ({
                                  ...prev,
                                  bodyPhotos: { ...prev.bodyPhotos, [angle]: null }
                                }))}
                                className="text-xs"
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-6 w-6 mx-auto text-slate-400" />
                              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                {angle.charAt(0).toUpperCase() + angle.slice(1)} view
                              </p>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(angle, file);
                                }}
                                className="text-xs"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Analysis Preview */}
                  {photoUploads.facePhoto && (
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <Sparkles className="h-6 w-6 text-violet-500 mt-1" />
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                            AI Analysis Preview
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Our AI will analyze your photos to create your personalized Style DNA including:
                          </p>
                          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            <li>• Color analysis based on skin tone, hair, and eye color</li>
                            <li>• Body shape analysis and fit recommendations</li>
                            <li>• Personalized style suggestions</li>
                            <li>• Color palette recommendations</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 7: AI Style DNA Analysis */}
          {currentStep === 7 && (
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <div className="text-center space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-500"></div>
                        <Sparkles className="h-8 w-8 text-violet-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Creating Your Style DNA
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                      Our AI is analyzing your photos and preferences to create your personalized style profile
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <Palette className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">Color Analysis</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Analyzing your skin tone, hair, and eye color to determine your perfect color palette
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">Body Analysis</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Understanding your body shape to recommend the most flattering fits and silhouettes
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Target className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">Style Matching</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Combining your lifestyle, preferences, and goals into personalized style recommendations
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">DNA Creation</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Generating your unique Style DNA profile with personalized insights and recommendations
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg p-6">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-center">
                        What You'll Get
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="text-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                          <p>Personal Color Palette</p>
                        </div>
                        <div className="text-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                          <p>Body Shape Analysis</p>
                        </div>
                        <div className="text-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                          <p>Style Recommendations</p>
                        </div>
                        <div className="text-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                          <p>Shopping Guide</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 8: Style DNA Results */}
          {currentStep === 8 && styleDNAResults && (
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Header */}
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                      Your Style DNA is Ready!
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                      Based on your photos and preferences, we've created your personalized style profile with AI-powered insights.
                    </p>
                    
                    {/* Display Current User Inputs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
                      <div className="bg-white/50 rounded-lg p-3">
                        <div className="font-medium text-slate-700">Body Type</div>
                        <div className="text-slate-600 capitalize">{quizData.bodyType}</div>
                      </div>
                      <div className="bg-white/50 rounded-lg p-3">
                        <div className="font-medium text-slate-700">Age Range</div>
                        <div className="text-slate-600">{quizData.age}</div>
                      </div>
                      <div className="bg-white/50 rounded-lg p-3">
                        <div className="font-medium text-slate-700">Lifestyle</div>
                        <div className="text-slate-600 capitalize">{quizData.dailyActivity}</div>
                      </div>
                      <div className="bg-white/50 rounded-lg p-3">
                        <div className="font-medium text-slate-700">Style Inspiration</div>
                        <div className="text-slate-600 capitalize">{quizData.styleInspirations}</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 inline-block">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          Confidence Score: {styleDNAResults.confidenceScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Style Archetype */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Your Style Archetype</h3>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          {styleDNAResults.styleArchetype.name}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {styleDNAResults.styleArchetype.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Color Palette */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <Palette className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Your Color Palette</h3>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6">
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-4">
                          {styleDNAResults.colorPalette.map((color: string, index: number) => (
                            <div key={index} className="flex flex-col items-center space-y-1">
                              <div
                                className="w-12 h-12 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                              <span className="text-xs text-slate-500 font-mono">{color}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                          <p>These colors complement your natural features and personal style preferences.</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {styleDNAResults.colorPalette.length} colors total
                            </span>
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              Based on: {quizData.colorPreferences.join(', ') || 'Color analysis'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Body Analysis */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Target className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Body Shape Analysis</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Your Body Type</h4>
                        <div className="space-y-2">
                          <p className="text-lg font-medium text-slate-800 capitalize">{quizData.bodyType}</p>
                          <p className="text-slate-600 dark:text-slate-400 text-sm">
                            {styleDNAResults.bodyAnalysis.recommendations}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Perfect Fits</h4>
                        <ul className="text-slate-600 dark:text-slate-400 text-sm space-y-1">
                          {styleDNAResults.bodyAnalysis.fitTips.map((tip: string, index: number) => (
                            <li key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personalized Tips & Shopping Guide */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Personalized Tips</h3>
                      </div>
                      <div className="space-y-3">
                        {styleDNAResults.personalizedTips.map((tip: string, index: number) => (
                          <div key={index} className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Shopping Priority</h3>
                      </div>
                      <div className="space-y-2">
                        {styleDNAResults.shoppingGuide.map((item: string, index: number) => (
                          <div key={index} className="flex items-center space-x-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg p-3">
                            <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                              {index + 1}.
                            </span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* CTA Button */}
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Ready to Build Your Wardrobe?
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Your Style DNA is now saved to your profile. Let's start building your perfect wardrobe!
                    </p>
                    <Button
                      onClick={() => setLocation('/dashboard')}
                      className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                      size="lg"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation Buttons - Hidden during AI analysis and results */}
        {currentStep <= 6 && (
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
              onClick={currentStep === 6 ? processProfile : nextStep}
              disabled={!isStepValid(currentStep) || isProcessing}
              className="flex items-center space-x-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{currentStep === 6 ? 'Analyze My Style' : 'Next'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
