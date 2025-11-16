import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MessageSquare, 
  Users, 
  Zap, 
  User, 
  Lock, 
  Mail, 
  Calendar,
  MapPin,
  UserCircle,
  Heart,
  Eye,
  EyeOff
} from "lucide-react";
import { SEO } from "@/components/seo";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  // Get URL search params to determine default tab
  const urlParams = new URLSearchParams(window.location.search);
  const defaultTab = urlParams.get('tab') === 'signup' ? 'register' : 'login';
  
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    gender: "" as "male" | "female" | "other" | "",
    dateOfBirth: "",
    location: "",
    country: "",
    birthMonth: "",
    birthDay: "",
    birthYear: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect to discover when user is logged in (after login)
  useEffect(() => {
    if (user && !registerMutation.isPending) {
      setLocation("/discover");
    }
  }, [user, setLocation, registerMutation.isPending]);

  if (user && !registerMutation.isPending) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData, {
      onSuccess: () => {
        // Redirect to discover after successful login
        setLocation("/discover");
      },
      onError: (error: any) => {
        // If user needs to verify email, redirect to verify-email page with email
        if (error.requiresVerification) {
          const email = error.email || loginData.username;
          setLocation(`/verify-email?email=${encodeURIComponent(email)}`);
        }
      }
    });
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("At least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("One uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("One lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("One number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("One special character (!@#$%^&*)");
    }
    
    return errors;
  };

  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length contribution (max 40 points)
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;
    
    // Character variety (max 60 points)
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;
    
    return Math.min(strength, 100);
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength === 0) return '';
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setRegisterData(prev => ({ ...prev, password: newPassword }));
    
    if (newPassword) {
      const errors = validatePassword(newPassword);
      setPasswordErrors(errors);
      const strength = calculatePasswordStrength(newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordErrors([]);
      setPasswordStrength(0);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.gender || !registerData.birthMonth || !registerData.birthDay || !registerData.birthYear) {
      return;
    }
    
    const dateOfBirth = `${registerData.birthYear}-${registerData.birthMonth.padStart(2, '0')}-${registerData.birthDay.padStart(2, '0')}`;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const registrationData = {
      username: registerData.username,
      password: registerData.password,
      email: registerData.email,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      gender: registerData.gender as "male" | "female" | "other",
      age: age,
      location: registerData.country || undefined,
    };

    registerMutation.mutate(registrationData, {
      onSuccess: (data: any) => {
        // Redirect to verify-email after successful registration with email parameter
        const email = data?.email || registrationData.email;
        setLocation(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    });
  };

  return (
    <>
      <SEO 
        title="Sign In or Sign Up - SpreadLov Dating Platform"
        description="Join SpreadLov to discover meaningful connections. Sign in to your account or create a new profile to start your dating journey."
        canonical="https://spreadlov.com/auth"
      />
      <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <header className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/android-chrome-192x192.png" 
                alt="SpreadLov Dating - Modern Dating Platform for Meaningful Connections" 
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl shadow-lg"
                width="192"
                height="192"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              Find Your Perfect Match on SpreadLov
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Join thousands of singles finding meaningful relationships. Start your journey to authentic connections today.
            </p>
          </header>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 sm:h-14 rounded-xl bg-secondary/50 p-1">
              <TabsTrigger 
                value="login" 
                data-testid="tab-login" 
                className="rounded-lg text-sm sm:text-base font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=inactive]:text-foreground/80"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                data-testid="tab-register" 
                className="rounded-lg text-sm sm:text-base font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=inactive]:text-foreground/80"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome Back to Your Dating Journey</h2>
                    <p className="text-sm sm:text-base text-muted-foreground mt-2">Sign in to discover meaningful connections and chat with compatible singles</p>
                  </div>
                  
                  <form onSubmit={handleLogin} className="space-y-5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.location.href = '/api/auth/google'}
                      className="w-full h-12 sm:h-14 text-base font-semibold rounded-xl border-2 hover:bg-secondary/50 transition-all duration-300 hover:scale-[1.02]"
                      data-testid="button-google-login"
                    >
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or sign in with email</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-username" className="text-sm font-semibold">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="login-username"
                          type="text"
                          placeholder="Enter your username"
                          value={loginData.username}
                          onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                          required
                          data-testid="input-login-username"
                          className="pl-10 h-12 rounded-xl border-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-semibold">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          required
                          data-testid="input-login-password"
                          className="pl-10 pr-10 h-12 rounded-xl border-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showLoginPassword ? "Hide password" : "Show password"}
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setLocation("/forgot-password")}
                        className="text-sm text-primary hover:underline font-medium transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 sm:h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      {loginMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Signing In...
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Start Your Love Story</h2>
                    <p className="text-sm sm:text-base text-muted-foreground mt-2">Create your profile and meet amazing singles looking for meaningful relationships</p>
                  </div>
                  
                  <form onSubmit={handleRegister} className="space-y-5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.location.href = '/api/auth/google'}
                      className="w-full h-12 sm:h-14 text-base font-semibold rounded-xl border-2 hover:bg-secondary/50 transition-all duration-300 hover:scale-[1.02]"
                      data-testid="button-google-register"
                    >
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or sign up with email</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name" className="text-sm font-semibold">First Name</Label>
                        <div className="relative">
                          <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="first-name"
                            type="text"
                            placeholder="First name"
                            value={registerData.firstName}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                            required
                            data-testid="input-first-name"
                            className="pl-10 h-12 rounded-xl border-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="last-name" className="text-sm font-semibold">Last Name</Label>
                        <div className="relative">
                          <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="last-name"
                            type="text"
                            placeholder="Last name"
                            value={registerData.lastName}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                            required
                            data-testid="input-last-name"
                            className="pl-10 h-12 rounded-xl border-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          data-testid="input-email"
                          className="pl-10 h-12 rounded-xl border-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-semibold">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="username"
                          type="text"
                          placeholder="Choose a username"
                          value={registerData.username}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                          required
                          data-testid="input-register-username"
                          className="pl-10 h-12 rounded-xl border-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showRegisterPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={registerData.password}
                          onChange={handlePasswordChange}
                          required
                          data-testid="input-register-password"
                          className="pl-10 pr-10 h-12 rounded-xl border-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                        >
                          {showRegisterPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {registerData.password && (
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Password strength:</span>
                            <span className={`font-semibold ${
                              passwordStrength < 40 ? 'text-red-500' :
                              passwordStrength < 70 ? 'text-yellow-500' :
                              'text-green-500'
                            }`}>
                              {getPasswordStrengthText(passwordStrength)}
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ease-out ${getPasswordStrengthColor(passwordStrength)}`}
                              style={{ width: `${passwordStrength}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-semibold">Gender <span className="text-red-500">*</span></Label>
                      <Select onValueChange={(value: "male" | "female" | "other") => setRegisterData(prev => ({ ...prev, gender: value }))} required>
                        <SelectTrigger data-testid="select-gender" className="h-12 rounded-xl border-2">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-sm font-semibold">Country/Region</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                        <Select 
                          value={registerData.country}
                          onValueChange={(value) => setRegisterData(prev => ({ ...prev, country: value }))}
                        >
                          <SelectTrigger data-testid="select-country" className="h-12 rounded-xl border-2 pl-10">
                            <SelectValue placeholder="Select country/region" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            <SelectItem value="Afghanistan">Afghanistan</SelectItem>
                            <SelectItem value="Albania">Albania</SelectItem>
                            <SelectItem value="Algeria">Algeria</SelectItem>
                            <SelectItem value="Argentina">Argentina</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                            <SelectItem value="Austria">Austria</SelectItem>
                            <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                            <SelectItem value="Belgium">Belgium</SelectItem>
                            <SelectItem value="Brazil">Brazil</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="Chile">Chile</SelectItem>
                            <SelectItem value="China">China</SelectItem>
                            <SelectItem value="Colombia">Colombia</SelectItem>
                            <SelectItem value="Denmark">Denmark</SelectItem>
                            <SelectItem value="Egypt">Egypt</SelectItem>
                            <SelectItem value="Finland">Finland</SelectItem>
                            <SelectItem value="France">France</SelectItem>
                            <SelectItem value="Germany">Germany</SelectItem>
                            <SelectItem value="Greece">Greece</SelectItem>
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="Indonesia">Indonesia</SelectItem>
                            <SelectItem value="Iran">Iran</SelectItem>
                            <SelectItem value="Iraq">Iraq</SelectItem>
                            <SelectItem value="Ireland">Ireland</SelectItem>
                            <SelectItem value="Israel">Israel</SelectItem>
                            <SelectItem value="Italy">Italy</SelectItem>
                            <SelectItem value="Japan">Japan</SelectItem>
                            <SelectItem value="Jordan">Jordan</SelectItem>
                            <SelectItem value="Kenya">Kenya</SelectItem>
                            <SelectItem value="Malaysia">Malaysia</SelectItem>
                            <SelectItem value="Mexico">Mexico</SelectItem>
                            <SelectItem value="Morocco">Morocco</SelectItem>
                            <SelectItem value="Netherlands">Netherlands</SelectItem>
                            <SelectItem value="New Zealand">New Zealand</SelectItem>
                            <SelectItem value="Nigeria">Nigeria</SelectItem>
                            <SelectItem value="Norway">Norway</SelectItem>
                            <SelectItem value="Pakistan">Pakistan</SelectItem>
                            <SelectItem value="Peru">Peru</SelectItem>
                            <SelectItem value="Philippines">Philippines</SelectItem>
                            <SelectItem value="Poland">Poland</SelectItem>
                            <SelectItem value="Portugal">Portugal</SelectItem>
                            <SelectItem value="Russia">Russia</SelectItem>
                            <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                            <SelectItem value="Singapore">Singapore</SelectItem>
                            <SelectItem value="South Africa">South Africa</SelectItem>
                            <SelectItem value="South Korea">South Korea</SelectItem>
                            <SelectItem value="Spain">Spain</SelectItem>
                            <SelectItem value="Sweden">Sweden</SelectItem>
                            <SelectItem value="Switzerland">Switzerland</SelectItem>
                            <SelectItem value="Thailand">Thailand</SelectItem>
                            <SelectItem value="Turkey">Turkey</SelectItem>
                            <SelectItem value="UAE">United Arab Emirates</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                            <SelectItem value="USA">United States</SelectItem>
                            <SelectItem value="Vietnam">Vietnam</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Date of Birth <span className="text-red-500">*</span></Label>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                          <Select 
                            value={registerData.birthMonth}
                            onValueChange={(value) => setRegisterData(prev => ({ ...prev, birthMonth: value }))}
                          >
                            <SelectTrigger data-testid="select-birth-month" className="h-12 rounded-xl border-2 pl-9">
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">January</SelectItem>
                              <SelectItem value="2">February</SelectItem>
                              <SelectItem value="3">March</SelectItem>
                              <SelectItem value="4">April</SelectItem>
                              <SelectItem value="5">May</SelectItem>
                              <SelectItem value="6">June</SelectItem>
                              <SelectItem value="7">July</SelectItem>
                              <SelectItem value="8">August</SelectItem>
                              <SelectItem value="9">September</SelectItem>
                              <SelectItem value="10">October</SelectItem>
                              <SelectItem value="11">November</SelectItem>
                              <SelectItem value="12">December</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Select 
                          value={registerData.birthDay}
                          onValueChange={(value) => setRegisterData(prev => ({ ...prev, birthDay: value }))}
                        >
                          <SelectTrigger data-testid="select-birth-day" className="h-12 rounded-xl border-2">
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                              <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select 
                          value={registerData.birthYear}
                          onValueChange={(value) => setRegisterData(prev => ({ ...prev, birthYear: value }))}
                        >
                          <SelectTrigger data-testid="select-birth-year" className="h-12 rounded-xl border-2">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {Array.from({ length: new Date().getFullYear() - 1924 }, (_, i) => new Date().getFullYear() - 18 - i).map((year) => (
                              <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 rounded-xl bg-secondary/30 border-2 border-border/50 hover:border-primary/30 transition-colors">
                      <Checkbox 
                        id="terms" 
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                        className="mt-1"
                        data-testid="checkbox-terms"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-relaxed cursor-pointer"
                        >
                          I agree to the{" "}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setLocation("/terms");
                            }}
                            className="text-primary hover:underline font-semibold"
                          >
                            Terms and Conditions
                          </button>
                        </label>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 sm:h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                      disabled={registerMutation.isPending || !termsAccepted || passwordErrors.length > 0}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Creating Account...
                        </div>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Mobile Features Section - Visible only on mobile/tablet */}
          <section className="lg:hidden space-y-4 mt-8 px-2 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Why Choose SpreadLov?
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <article className="group p-5 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:shadow-lg transition-all duration-300">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Real-Time Messaging</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect instantly with compatible singles through our advanced real-time chat system. Build meaningful relationships through authentic conversations.
                </p>
              </article>
              
              <article className="group p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:shadow-lg transition-all duration-300">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Smart Profile Matching</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our intelligent matching algorithm helps you discover people who share your interests, values, and relationship goals for authentic connections.
                </p>
              </article>
              
              <article className="group p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:shadow-lg transition-all duration-300">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Safe & Secure Platform</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your privacy and safety are our top priorities. All profiles are verified, and our platform uses industry-leading security measures to protect your data.
                </p>
              </article>
              
              <article className="group p-5 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 hover:shadow-lg transition-all duration-300">
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Meaningful Relationships</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  SpreadLov is designed for people seeking genuine connections and long-term relationships. Join thousands of singles who've found love on our platform.
                </p>
              </article>
            </div>
          </section>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-8 xl:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]"></div>
        
        <div className="max-w-lg text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-br from-primary to-primary/70 p-4 rounded-3xl shadow-2xl">
                <Heart className="h-16 w-16 xl:h-20 xl:w-20 text-white" />
              </div>
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Where Real Connections Happen
            </h2>
            <p className="text-muted-foreground text-base xl:text-lg leading-relaxed">
              Join a modern dating platform designed for authentic relationships and meaningful conversations with compatible singles.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="group flex items-start gap-5 p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg mb-1">Instant Messaging</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Chat in real-time with matches and build connections instantly
                </p>
              </div>
            </div>
            
            <div className="group flex items-start gap-5 p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg mb-1">Smart Matching</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Discover compatible singles based on your interests and preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
