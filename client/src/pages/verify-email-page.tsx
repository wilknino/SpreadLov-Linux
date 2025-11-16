import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { Mail, Shield, Clock, AlertTriangle } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function VerifyEmailPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Redirect if already verified
  useEffect(() => {
    if (user?.emailVerified) {
      setLocation("/discover");
    }
  }, [user, setLocation]);

  // Pre-fill email from URL parameter or logged in user
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const verifyMutation = useMutation({
    mutationFn: async (verificationCode: string) => {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode, email: email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Verification failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update user data in query client - user is now logged in
      queryClient.setQueryData(["/api/user"], data.user);
      
      toast({
        title: "✅ Email Verified Successfully!",
        description: "Your email has been verified and you are now logged in!",
      });
      
      // Redirect to discover page after successful verification
      setTimeout(() => {
        setLocation("/discover");
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to resend code");
      }

      return response.json();
    },
    onSuccess: () => {
      setCountdown(60);
      toast({
        title: "Code Sent!",
        description: "A new verification code has been sent to your email.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Resend",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      verifyMutation.mutate(code);
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
    }
  };

  const handleResend = () => {
    if (countdown === 0) {
      resendMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Side - Verification Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Header with Logo */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Mail className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Verify Your Email
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-sm sm:text-base font-semibold text-foreground">
              {email}
            </p>
          </div>

          {/* Verification Card */}
          <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-card to-card/80 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleVerify} className="space-y-6">
                {/* Email Input - Show if user is not logged in */}
                {!user && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-12 rounded-xl border-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}
                
                {/* Code Input */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                    <Shield className="h-4 w-4" />
                    <span>Enter your 6-digit code</span>
                  </div>
                  
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={code}
                      onChange={(value) => setCode(value)}
                      disabled={verifyMutation.isPending}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="h-12 w-12 sm:h-14 sm:w-14 text-lg sm:text-xl border-2 rounded-lg" />
                        <InputOTPSlot index={1} className="h-12 w-12 sm:h-14 sm:w-14 text-lg sm:text-xl border-2 rounded-lg" />
                        <InputOTPSlot index={2} className="h-12 w-12 sm:h-14 sm:w-14 text-lg sm:text-xl border-2 rounded-lg" />
                        <InputOTPSlot index={3} className="h-12 w-12 sm:h-14 sm:w-14 text-lg sm:text-xl border-2 rounded-lg" />
                        <InputOTPSlot index={4} className="h-12 w-12 sm:h-14 sm:w-14 text-lg sm:text-xl border-2 rounded-lg" />
                        <InputOTPSlot index={5} className="h-12 w-12 sm:h-14 sm:w-14 text-lg sm:text-xl border-2 rounded-lg" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Code expires in 10 minutes</span>
                  </div>
                </div>

                {/* Verify Button */}
                <Button
                  type="submit"
                  className="w-full h-12 sm:h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  disabled={verifyMutation.isPending || code.length !== 6}
                >
                  {verifyMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Verifying...
                    </div>
                  ) : (
                    "Verify Email"
                  )}
                </Button>

                {/* Resend Section */}
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Didn't receive the code?</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResend}
                    disabled={countdown > 0 || resendMutation.isPending}
                    className="w-full h-12 rounded-xl border-2 hover:bg-secondary/50 transition-all duration-300 hover:scale-[1.02]"
                  >
                    {resendMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Sending...
                      </div>
                    ) : countdown > 0 ? (
                      `Resend Code (${countdown}s)`
                    ) : (
                      "Resend Verification Code"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Warning */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Security Notice
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Never share this code with anyone. We will never ask for your verification code via phone, email, or any other method outside this page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Information Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-8 xl:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]"></div>
        
        <div className="relative max-w-lg space-y-8 z-10">
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-700">
            <h2 className="text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Secure Your Account
            </h2>
            <p className="text-lg text-muted-foreground">
              Email verification helps us keep your account safe and ensures you can recover access if needed.
            </p>
          </div>

          <div className="space-y-6">
            {/* Feature 1 */}
            <div className="flex gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 animate-in fade-in slide-in-from-right-4 duration-700 delay-150">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Enhanced Security</h3>
                <p className="text-sm text-muted-foreground">
                  Protect your account from unauthorized access with verified email authentication.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Stay Connected</h3>
                <p className="text-sm text-muted-foreground">
                  Receive important notifications and updates about your account activity.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 animate-in fade-in slide-in-from-right-4 duration-700 delay-500">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Quick Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Simple 6-digit code verification takes only seconds to complete.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
