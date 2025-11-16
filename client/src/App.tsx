import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { NotificationToaster } from "@/components/ui/notification-toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ForgotPasswordPage from "@/pages/forgot-password-page";
import DeleteAccountPage from "@/pages/delete-account-page";
import TermsPage from "@/pages/terms-page";
import AboutPage from "@/pages/about-page";
import PrivacyPolicyPage from "@/pages/privacy-policy-page";
import SafetyStandardsPage from "@/pages/safety-standards-page";
import SubscribePage from "@/pages/subscribe-page";
import DiscoverPage from "@/pages/discover-page";
import MessagesPage from "@/pages/messages-page";
import NotificationsPage from "@/pages/notifications-page";
import ProfilePage from "@/pages/profile-page";
import UserProfilePage from "@/pages/user-profile-page";
import ChatPage from "@/pages/chat-page";
import VerifyEmailPage from "@/pages/verify-email-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { SocketProvider } from "@/hooks/use-socket";
import { useAuth } from "@/hooks/use-auth";
import EmailVerificationBanner from "@/components/email-verification-banner";
import { ProfileCompletionModal } from "@/components/profile-completion-modal";

function Router() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  const handleProfileComplete = () => {
    // Refresh user data after profile completion
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
  };
  
  return (
    <div className="relative">
      <EmailVerificationBanner />
      
      {/* Profile Completion Modal for Google OAuth users */}
      {user && (user as any).needsProfileCompletion && (
        <ProfileCompletionModal 
          open={true} 
          onComplete={handleProfileComplete}
        />
      )}
      
      <main>
        <Switch>
          <Route path="/verify-email" component={VerifyEmailPage} />
          <ProtectedRoute path="/discover" component={DiscoverPage} />
          <ProtectedRoute path="/messages" component={MessagesPage} />
          <ProtectedRoute path="/notifications" component={NotificationsPage} />
          <ProtectedRoute path="/profile/:userId" component={UserProfilePage} />
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <ProtectedRoute path="/chat/:userId" component={ChatPage} />
          <ProtectedRoute path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/delete-account" component={DeleteAccountPage} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/privacy-policy" component={PrivacyPolicyPage} />
          <Route path="/safety-standards" component={SafetyStandardsPage} />
          <Route path="/subscribe" component={SubscribePage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {/* Show bottom navigation only when user is authenticated and not on verification page */}
      {user && location !== '/verify-email' && <BottomNavigation />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <TooltipProvider>
            <Toaster />
            <NotificationToaster />
            <Router />
          </TooltipProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
