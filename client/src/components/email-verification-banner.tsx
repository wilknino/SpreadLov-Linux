import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  // Don't show banner if user is verified, not logged in, or already on verify-email page, or dismissed
  if (!user || user.emailVerified || window.location.pathname === "/verify-email" || dismissed) {
    return null;
  }

  const handleBannerClick = async () => {
    // Send verification email when banner is clicked
    setSending(true);
    try {
      const response = await fetch("/api/auto-send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      
      if (response.ok) {
        if (!data.alreadySent) {
          toast({
            title: "Verification code sent",
            description: "Please check your email for the verification code.",
          });
        } else {
          toast({
            title: "Code already sent",
            description: "Check your email for the previously sent code.",
          });
        }
      } else {
        // Show error if sending failed
        toast({
          title: "Failed to send code",
          description: data.message || "Please try again later.",
          variant: "destructive",
        });
        console.error("Email sending failed:", data);
      }
    } catch (error) {
      console.error("Failed to send verification code:", error);
      toast({
        title: "Network error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
      // Navigate to verify-email page
      setLocation("/verify-email");
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div 
            className="flex items-center gap-3 cursor-pointer flex-1 group"
            onClick={handleBannerClick}
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 animate-pulse" />
            <p className="text-sm sm:text-base font-medium group-hover:underline">
              {sending ? "Sending verification code..." : "Please verify your email address to complete your profile and unlock all features."}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            className="flex-shrink-0 p-1 rounded-full hover:bg-red-800 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
