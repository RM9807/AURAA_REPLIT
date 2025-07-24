import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X, Mail, Phone, Chrome } from "lucide-react";
import { FaFacebook, FaGoogle } from "react-icons/fa";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'otp'>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [email, setEmail] = useState('');

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'replit') => {
    if (provider === 'google') {
      // Redirect to Google OAuth
      window.location.href = `/api/auth/google`;
    } else if (provider === 'facebook') {
      // Redirect to Facebook OAuth
      window.location.href = `/api/auth/facebook`;
    } else {
      // Use Replit Auth for development
      window.location.href = '/api/login';
    }
  };

  const handleOTPRequest = async () => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      
      if (response.ok) {
        console.log('Sending OTP to:', phoneNumber);
        setAuthMode('otp');
      } else {
        console.error('Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  };

  const handleOTPVerify = async () => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otpCode })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('Verifying OTP:', otpCode);
        window.location.href = data.redirectUrl || '/dashboard';
      } else {
        console.error('OTP verification failed:', data.message);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-navy">
              {authMode === 'login' ? 'Welcome Back!' : 
               authMode === 'signup' ? 'Get Started' : 
               'Verify Your Phone'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {authMode === 'otp' ? (
            <div className="space-y-4">
              <div className="text-center text-sm text-gray-600">
                We've sent a verification code to {phoneNumber}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                />
              </div>

              <Button 
                onClick={handleOTPVerify}
                className="w-full bg-gradient-purple-pink text-white"
                disabled={otpCode.length !== 6}
              >
                Verify & Continue
              </Button>

              <Button
                variant="ghost"
                onClick={() => setAuthMode('login')}
                className="w-full text-sm"
              >
                Back to login options
              </Button>
            </div>
          ) : (
            <>
              {/* Social Login Options */}
              <div className="space-y-3">
                <Button
                  onClick={() => handleSocialLogin('google')}
                  variant="outline"
                  className="w-full flex items-center gap-3 py-6 border-2 hover:bg-gray-50"
                >
                  <FaGoogle className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Continue with Google</span>
                </Button>

                <Button
                  onClick={() => handleSocialLogin('facebook')}
                  variant="outline"
                  className="w-full flex items-center gap-3 py-6 border-2 hover:bg-gray-50"
                >
                  <FaFacebook className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Continue with Facebook</span>
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              {/* Phone OTP Option */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleOTPRequest}
                      disabled={!phoneNumber}
                      className="px-6 bg-gradient-blue-teal text-white"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Send OTP
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-gray-500">
                By continuing, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}