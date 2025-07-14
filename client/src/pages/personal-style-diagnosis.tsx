import { useState } from 'react';
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
  dailyActivity: string;
  comfortLevel: string;
  occasions: string[];
  styleInspirations: string;
  colorPreferences: string[];
  colorAvoidances: string[];
  age: string;
  height: string;
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

export default function PersonalStyleDiagnosis() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
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

  const steps = [
    { id: 1, title: 'Get Started', icon: User },
    { id: 2, title: 'Style Quiz', icon: Target },
    { id: 3, title: 'Photo Upload', icon: Camera },
    { id: 4, title: 'Processing', icon: Sparkles },
    { id: 5, title: 'Your Profile', icon: Palette }
  ];

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
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const processProfile = async () => {
    setIsProcessing(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsProcessing(false);
    nextStep();
  };

  const progressPercentage = ((currentStep - 1) / 4) * 100;

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
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep > step.id 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-400 border-blue-500 text-white' 
                    : currentStep === step.id 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-500 text-white' 
                    : 'border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step 1: Get Started */}
        {currentStep === 1 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                Build Your Personal Style Profile
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-4">
                Discover your unique style DNA through our comprehensive analysis system
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg">
                  <Target className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Style Quiz</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Personal preferences & lifestyle</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg">
                  <Camera className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Photo Analysis</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Color & body shape analysis</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-orange-50 dark:from-pink-950/30 dark:to-orange-950/30 rounded-lg">
                  <Palette className="h-8 w-8 text-pink-600 dark:text-pink-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Your Profile</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Personalized style recommendations</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-950/30 p-6 rounded-lg">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">What you'll discover:</h4>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Your personalized color palette and seasonal analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Body shape identification with flattering style tips
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Core style DNA based on your lifestyle and preferences
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Personalized shopping and styling recommendations
                  </li>
                </ul>
              </div>

              <Button 
                onClick={nextStep}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 text-lg"
              >
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Style Quiz */}
        {currentStep === 2 && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-white">Personal Style Quiz</CardTitle>
              <p className="text-slate-600 dark:text-slate-400">
                Help us understand your lifestyle and preferences
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Daily Activity */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-slate-900 dark:text-white">
                  What's your typical daily activity?
                </Label>
                <RadioGroup 
                  value={quizData.dailyActivity} 
                  onValueChange={(value) => handleQuizChange('dailyActivity', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="casual" id="casual" />
                    <Label htmlFor="casual">Casual (work from home, relaxed environments)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="business" />
                    <Label htmlFor="business">Business (office, meetings, professional settings)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="active" id="active" />
                    <Label htmlFor="active">Active (gym, outdoor activities, on-the-go)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <Label htmlFor="mixed">Mixed (varies day to day)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Comfort Level */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-slate-900 dark:text-white">
                  Describe your preferred comfort level
                </Label>
                <RadioGroup 
                  value={quizData.comfortLevel} 
                  onValueChange={(value) => handleQuizChange('comfortLevel', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maximum" id="maximum" />
                    <Label htmlFor="maximum">Maximum comfort (soft fabrics, loose fits)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="balanced" id="balanced" />
                    <Label htmlFor="balanced">Balanced (comfortable but put-together)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="polished" id="polished" />
                    <Label htmlFor="polished">Polished (willing to sacrifice some comfort for style)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Occasions */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-slate-900 dark:text-white">
                  What occasions do you dress for most often? (Select all that apply)
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {['Work/Business', 'Social Events', 'Date Nights', 'Casual Outings', 'Fitness/Active', 'Special Events'].map((occasion) => (
                    <div key={occasion} className="flex items-center space-x-2">
                      <Checkbox
                        id={occasion}
                        checked={quizData.occasions.includes(occasion)}
                        onCheckedChange={(checked) => handleArrayFieldChange('occasions', occasion, checked as boolean)}
                      />
                      <Label htmlFor={occasion}>{occasion}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Style Inspirations */}
              <div className="space-y-4">
                <Label htmlFor="inspirations" className="text-lg font-semibold text-slate-900 dark:text-white">
                  Who are your style inspirations?
                </Label>
                <Input
                  id="inspirations"
                  placeholder="e.g., Emma Stone, Meghan Markle, or describe a style you admire"
                  value={quizData.styleInspirations}
                  onChange={(e) => handleQuizChange('styleInspirations', e.target.value)}
                />
              </div>

              {/* Age and Height */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-lg font-semibold text-slate-900 dark:text-white">Age</Label>
                  <Input
                    id="age"
                    placeholder="25"
                    value={quizData.age}
                    onChange={(e) => handleQuizChange('age', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-lg font-semibold text-slate-900 dark:text-white">Height</Label>
                  <Input
                    id="height"
                    placeholder="5'6&quot; or 168cm"
                    value={quizData.height}
                    onChange={(e) => handleQuizChange('height', e.target.value)}
                  />
                </div>
              </div>

              {/* Color Preferences */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-slate-900 dark:text-white">
                  What colors do you usually gravitate towards?
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {['Black', 'White', 'Navy', 'Gray', 'Beige', 'Pink', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Brown'].map((color) => (
                    <div key={color} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pref-${color}`}
                        checked={quizData.colorPreferences.includes(color)}
                        onCheckedChange={(checked) => handleArrayFieldChange('colorPreferences', color, checked as boolean)}
                      />
                      <Label htmlFor={`pref-${color}`}>{color}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Avoidances */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-slate-900 dark:text-white">
                  What colors do you usually avoid?
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {['Black', 'White', 'Navy', 'Gray', 'Beige', 'Pink', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Brown'].map((color) => (
                    <div key={color} className="flex items-center space-x-2">
                      <Checkbox
                        id={`avoid-${color}`}
                        checked={quizData.colorAvoidances.includes(color)}
                        onCheckedChange={(checked) => handleArrayFieldChange('colorAvoidances', color, checked as boolean)}
                      />
                      <Label htmlFor={`avoid-${color}`}>{color}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  onClick={nextStep}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={!quizData.dailyActivity || !quizData.comfortLevel}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Photo Upload */}
        {currentStep === 3 && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-white">Photo Upload for AI Analysis</CardTitle>
              <p className="text-slate-600 dark:text-slate-400">
                Upload photos for accurate color and body shape analysis
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Face Photo for Color Analysis */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Virtual Color Analysis
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Please upload a clear, well-lit photo of your face, with no makeup, facing forward.
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    This helps us detect your accurate skin tone and undertone for personalized color recommendations.
                  </p>
                  
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <div className="relative">
                      <input
                        id="face-photo"
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('face', file);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        Click to upload face photo
                      </Button>
                    </div>
                    {photoUploads.facePhoto && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                          ✓ Face photo uploaded: {photoUploads.facePhoto.name}
                        </p>
                        <p className="text-xs text-green-500 dark:text-green-400 mt-1">
                          Size: {(photoUploads.facePhoto.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Body Photos for Shape Analysis */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Body Shape & Fit Analysis
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Upload full-body photos (front, side, back) in form-fitting clothing.
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    This enables precise body measurements and shape identification for flattering fit recommendations.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {['front', 'side', 'back'].map((angle) => (
                      <div key={angle} className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <div className="relative">
                          <input
                            id={`body-${angle}`}
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(angle as 'front' | 'side' | 'back', file);
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 capitalize"
                          >
                            {angle} View
                          </Button>
                        </div>
                        {photoUploads.bodyPhotos[angle as keyof typeof photoUploads.bodyPhotos] && (
                          <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                              ✓ Uploaded
                            </p>
                            <p className="text-xs text-green-500 dark:text-green-400">
                              {(photoUploads.bodyPhotos[angle as keyof typeof photoUploads.bodyPhotos]!.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  onClick={nextStep}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={!photoUploads.facePhoto || !photoUploads.bodyPhotos.front}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Processing */}
        {currentStep === 4 && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Processing your unique style profile...
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                AURAA's AI algorithms are analyzing your quiz responses, facial features for skin tone/undertone, and body dimensions/proportions.
              </p>
              
              <div className="space-y-4 max-w-md mx-auto">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Analyzing style preferences</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Processing color analysis</span>
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Identifying body shape</span>
                  <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded-full" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Generating recommendations</span>
                  <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded-full" />
                </div>
              </div>

              <Button 
                onClick={processProfile}
                className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Complete Analysis'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Style Profile Results */}
        {currentStep === 5 && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                  Your Personal AURAA Style Profile
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-400">
                  Your unique style DNA has been analyzed and personalized recommendations are ready
                </p>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Color Palette */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center">
                    <Palette className="h-6 w-6 mr-2 text-blue-500" />
                    Your Color Palette
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Warm Autumn</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        Rich, warm colors that complement your skin tone
                      </p>
                      <div className="flex space-x-2">
                        <div className="w-6 h-6 rounded-full bg-amber-600"></div>
                        <div className="w-6 h-6 rounded-full bg-orange-700"></div>
                        <div className="w-6 h-6 rounded-full bg-red-800"></div>
                        <div className="w-6 h-6 rounded-full bg-yellow-600"></div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      These warm, rich colors enhance your natural glow and bring out your best features.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Body Shape */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center">
                    <User className="h-6 w-6 mr-2 text-purple-500" />
                    Your Body Shape
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Hourglass</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Balanced proportions with defined waist
                      </p>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                      <p><strong>Flattering:</strong> Fitted waistlines, wrap styles</p>
                      <p><strong>Necklines:</strong> V-neck, scoop, off-shoulder</p>
                      <p><strong>Silhouettes:</strong> A-line, fit-and-flare</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Style DNA */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center">
                    <Target className="h-6 w-6 mr-2 text-pink-500" />
                    Your Style DNA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/30 dark:to-orange-950/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Effortless Chic</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Polished yet comfortable, with modern sophistication
                      </p>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <p>• Balanced comfort and style</p>
                      <p>• Clean, modern lines</p>
                      <p>• Quality over quantity</p>
                      <p>• Versatile pieces</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center pt-6">
              <Button 
                onClick={() => setLocation('/dashboard')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-3 text-lg"
              >
                View Full Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}