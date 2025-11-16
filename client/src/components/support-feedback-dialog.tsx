import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

interface SupportFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupportFeedbackDialog({ open, onOpenChange }: SupportFeedbackDialogProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");

  const sendSupportMutation = useMutation({
    mutationFn: async (supportData: { firstName: string; lastName: string; email: string; message: string }) => {
      const res = await fetch('/api/support/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supportData),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully",
        description: "We've received your feedback and will get back to you soon.",
      });
      setMessage("");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter your message before sending.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to send feedback.",
        variant: "destructive",
      });
      return;
    }

    sendSupportMutation.mutate({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      message: message.trim(),
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            Support & Feedback
          </DialogTitle>
          <DialogDescription>
            We'd love to hear from you! Send us your feedback, questions, or report any issues.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </Label>
              <Input
                id="firstName"
                value={user.firstName}
                disabled
                className="bg-secondary/30 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={user.lastName}
                disabled
                className="bg-secondary/30 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-secondary/30 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message *
            </Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind..."
              className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              disabled={sendSupportMutation.isPending}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/2000 characters
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sendSupportMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={sendSupportMutation.isPending || !message.trim()}
              className="gap-2"
            >
              {sendSupportMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
