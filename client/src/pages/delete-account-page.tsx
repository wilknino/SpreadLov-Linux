import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Shield, Trash2, AlertTriangle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

type Step = "email" | "verify" | "success";

export default function DeleteAccountPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/account/request-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Verification Code Sent",
          description: data.message,
        });
        setStep("verify");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send verification code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/account/verify-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setStep("success");
        toast({
          title: "Account Deleted",
          description: data.message,
        });
        
        // Clear all local storage and session storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect after a short delay
        setTimeout(() => {
          // Use window.location.replace to prevent back button issues
          window.location.replace("https://spreadlov.com");
        }, 3000);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to verify code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-background via-background to-destructive/5 ${user ? 'pb-20' : ''}`}>
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
              Delete your account
            </p>
          </div>

          <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-card to-card/80 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardContent className="p-6 sm:p-8">
              {step === "email" && (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-destructive">Delete Account</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter your email to receive a verification code
                    </p>
                  </div>

                  <div className="mb-6 p-4 bg-destructive/10 border-l-4 border-destructive rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-destructive text-sm">Warning: This action is permanent</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          All your data including profile, messages, photos, and connections will be permanently deleted and cannot be recovered.
                        </p>
                      </div>
                    </div>
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
                          className="pl-10 h-12 rounded-xl border-2 transition-all focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      variant="destructive"
                      className="w-full h-12 sm:h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Sending Code...
                        </div>
                      ) : (
                        <>
                          <Trash2 className="h-5 w-5 mr-2" />
                          Request Deletion Code
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}

              {step === "verify" && (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-destructive">Verify Deletion</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter the 6-digit code sent to {email}
                    </p>
                  </div>

                  <div className="mb-6 p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-amber-600 text-sm">Final Step</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Once you verify this code, your account will be deleted immediately and permanently.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <form onSubmit={handleVerifyAndDelete} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-sm font-semibold">Verification Code</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="code"
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          required
                          maxLength={6}
                          className="pl-10 h-12 rounded-xl border-2 transition-all focus:border-destructive focus:ring-2 focus:ring-destructive/20 text-center text-2xl tracking-widest font-mono"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Code expires in 10 minutes
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      variant="destructive"
                      className="w-full h-12 sm:h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Deleting Account...
                        </div>
                      ) : (
                        <>
                          <Trash2 className="h-5 w-5 mr-2" />
                          Confirm & Delete Account
                        </>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="w-full text-sm text-muted-foreground hover:text-primary transition-colors mt-2"
                    >
                      Cancel deletion
                    </button>
                  </form>
                </>
              )}

              {step === "success" && (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Account Deleted Successfully</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Your account and all associated data have been permanently deleted.
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Redirecting to spreadlov.com in 3 seconds...
                  </p>
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm">Please wait...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent">
        <div className="max-w-md space-y-8 text-center animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-destructive/10 rounded-3xl">
              <Trash2 className="h-16 w-16 text-destructive" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Account Deletion Process
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We take your privacy seriously. Once you confirm deletion, all your data will be permanently removed from our systems.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-4 text-left p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Mail className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Receive a 6-digit verification code to confirm your identity
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Permanent Deletion</h3>
                <p className="text-sm text-muted-foreground">
                  All profile data, messages, photos, and connections removed
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is completely erased from our database
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}