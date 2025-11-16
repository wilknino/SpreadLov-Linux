import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, KeyRound, ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Step = "email" | "reset" | "success";

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        });
        setStep("reset");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send reset code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("success");
        toast({
          title: "Success",
          description: data.message,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reset password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/android-chrome-192x192.png" 
                alt="SpreadLov" 
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl shadow-lg"
                width="192"
                height="192"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              SpreadLov
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
              Reset your password
            </p>
          </div>

          <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-card to-card/80 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardContent className="p-6 sm:p-8">
              {step === "email" && (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Forgot Password?</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter your email to receive a reset code
                    </p>
                  </div>
                  
                  <form onSubmit={handleRequestCode} className="space-y-5">
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
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 sm:h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Sending Code...
                        </div>
                      ) : (
                        "Send Reset Code"
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setLocation("/")}
                      className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:underline font-medium transition-colors mt-4"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Login
                    </button>
                  </form>
                </>
              )}

              {step === "reset" && (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Reset Password</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter the code sent to {email} and your new password
                    </p>
                  </div>
                  
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-sm font-semibold">Verification Code</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="code"
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          required
                          maxLength={6}
                          className="pl-10 h-12 rounded-xl border-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 text-center text-2xl tracking-widest font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-sm font-semibold">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password (min. 6 characters)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="pl-10 h-12 rounded-xl border-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-semibold">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="pl-10 h-12 rounded-xl border-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 sm:h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Resetting Password...
                        </div>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:underline font-medium transition-colors mt-4"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  </form>
                </>
              )}

              {step === "success" && (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Password Reset Successful!</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Your password has been reset successfully. You can now log in with your new password.
                  </p>
                  <Button 
                    onClick={() => setLocation("/")}
                    className="w-full h-12 sm:h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    Back to Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="max-w-md space-y-8 text-center animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-primary/10 rounded-3xl">
              <KeyRound className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Secure Password Reset
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We'll send a verification code to your email. The code expires in 10 minutes for your security.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-4 text-left p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Mail className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Receive a 6-digit code instantly via email
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure Process</h3>
                <p className="text-sm text-muted-foreground">
                  Your password is encrypted and never shared
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
