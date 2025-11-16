import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, Heart, Sparkles, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { SEO } from "@/components/seo";

export default function SubscribePage() {
  const [email, setEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to subscribe");
      }

      return response.json();
    },
    onSuccess: () => {
      setShowSuccess(true);
      setEmail("");
      
      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = "https://spreadlov.com";
      }, 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeMutation.mutate(email);
    }
  };

  return (
    <>
      <SEO 
        title="Subscribe to SpreadLov - Get Dating Tips & Updates"
        description="Subscribe to get exclusive updates, dating tips, and be the first to know about new features that help you find meaningful connections on SpreadLov."
        canonical="https://spreadlov.com/subscribe"
      />
      
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {!showSuccess ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src="/favicon.png" 
                  alt="SpreadLov Logo" 
                  className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl shadow-2xl ring-4 ring-primary/20"
                  width="192"
                  height="192"
                />
              </div>
            </div>

            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Heart className="h-8 w-8 text-primary fill-primary animate-pulse" />
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  SpreadLov
                </h1>
                <Heart className="h-8 w-8 text-primary fill-primary animate-pulse" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Stay Connected with Love
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Subscribe to get exclusive updates, dating tips, and be the first to know about new features that help you find meaningful connections.
              </p>
            </div>

            {/* Subscribe Card */}
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-8 sm:p-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label htmlFor="email" className="block text-sm font-semibold">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={subscribeMutation.isPending}
                        className="pl-12 h-14 text-base rounded-xl border-2 focus:border-primary focus:ring-primary transition-all"
                      />
                    </div>
                    {subscribeMutation.isError && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive"></span>
                        {subscribeMutation.error?.message || "Failed to subscribe. Please try again."}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={subscribeMutation.isPending || !email}
                    className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {subscribeMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        Subscribing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Subscribe Now
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="mt-8 p-4 bg-secondary/30 rounded-xl border border-border">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">What you'll get:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Early access to new features</li>
                        <li>• Expert dating tips and advice</li>
                        <li>• Exclusive community updates</li>
                        <li>• Special promotions and offers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Note */}
            <p className="text-center text-sm text-muted-foreground max-w-md mx-auto">
              We respect your privacy. Unsubscribe at any time. Your email will never be shared with third parties.
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-12 sm:p-16 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-primary p-6 rounded-full shadow-2xl">
                      <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-primary-foreground" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Successfully Subscribed!
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Thank you for joining the SpreadLov community!
                  </p>
                </div>

                <div className="pt-4 pb-2 space-y-3">
                  <p className="text-base text-muted-foreground">
                    Check your inbox for a welcome message and exciting updates coming your way.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <p>Redirecting to SpreadLov in 3 seconds...</p>
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  <Heart className="h-5 w-5 text-primary fill-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <Heart className="h-5 w-5 text-primary fill-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <Heart className="h-5 w-5 text-primary fill-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
