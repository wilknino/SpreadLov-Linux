import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Heart } from "lucide-react";
import { useLocation } from "wouter";

interface ProfileCompletionModalProps {
  open: boolean;
  onComplete: () => void;
}

export function ProfileCompletionModal({ open, onComplete }: ProfileCompletionModalProps) {
  const [, setLocation] = useLocation();
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate fields
    if (!birthdate) {
      setError("Please enter your birthdate");
      return;
    }
    
    if (!gender) {
      setError("Please select your gender");
      return;
    }
    
    // Validate age (must be 18+)
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18) {
      setError("You must be at least 18 years old to use SpreadLov");
      return;
    }
    
    // Submit to API
    setLoading(true);
    try {
      const response = await fetch("/api/user/complete-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthdate, gender }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to complete profile");
      }
      
      // Success! Redirect to Discover page
      onComplete();
      setLocation("/discover");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px] max-w-[95vw] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border-b">
          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-center">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">
            To get started on SpreadLov, we need a couple more details about you
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Birthdate Input */}
          <div className="space-y-3">
            <Label htmlFor="birthdate" className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Birthdate
            </Label>
            <Input
              id="birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
              required
              className="h-11 sm:h-12 text-base"
            />
            <p className="text-xs sm:text-sm text-muted-foreground">
              You must be at least 18 years old
            </p>
          </div>

          {/* Gender Selection */}
          <div className="space-y-3">
            <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Gender
            </Label>
            <RadioGroup value={gender} onValueChange={setGender} required>
              <div className="flex items-center space-x-3 rounded-lg border bg-background/50 p-3 sm:p-4 hover:bg-accent/50 transition-all cursor-pointer hover:border-primary/50">
                <RadioGroupItem value="male" id="male" className="h-4 w-4 sm:h-5 sm:w-5" />
                <Label htmlFor="male" className="flex-1 cursor-pointer font-medium text-sm sm:text-base">
                  Male
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border bg-background/50 p-3 sm:p-4 hover:bg-accent/50 transition-all cursor-pointer hover:border-primary/50">
                <RadioGroupItem value="female" id="female" className="h-4 w-4 sm:h-5 sm:w-5" />
                <Label htmlFor="female" className="flex-1 cursor-pointer font-medium text-sm sm:text-base">
                  Female
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border bg-background/50 p-3 sm:p-4 hover:bg-accent/50 transition-all cursor-pointer hover:border-primary/50">
                <RadioGroupItem value="other" id="other" className="h-4 w-4 sm:h-5 sm:w-5" />
                <Label htmlFor="other" className="flex-1 cursor-pointer font-medium text-sm sm:text-base">
                  Other
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm sm:text-base text-destructive font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            disabled={loading}
          >
            {loading ? "Saving..." : "Continue to SpreadLov"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
