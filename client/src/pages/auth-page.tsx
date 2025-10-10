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
  UserCircle
} from "lucide-react";

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
    gender: "" as "male" | "female" | "other" | "prefer_not_to_say" | "",
    dateOfBirth: "",
    location: "",
    country: "",
    birthMonth: "",
    birthDay: "",
    birthYear: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

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
      }
    });
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
      gender: registerData.gender as "male" | "female" | "other" | "prefer_not_to_say",
      age: age,
      location: registerData.country || undefined,
    };

    registerMutation.mutate(registrationData, {
      onSuccess: () => {
        // Redirect to discover after successful registration
        setLocation("/discover");
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-background via-background to-primary/5">
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
              Spread love and connect with amazing people
            </p>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 sm:h-14 rounded-xl bg-secondary/50 p-1">
              <TabsTrigger 
                value="login" 
                data-testid="tab-login" 
                className="rounded-lg text-sm sm:text-base font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=inactive]:text-muted-foreground"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                data-testid="tab-register" 
                className="rounded-lg text-sm sm:text-base font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=inactive]:text-muted-foreground"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
                    <p className="text-sm text-muted-foreground mt-1">Sign in to continue your journey</p>
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
                          type="password"
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          required
                          data-testid="input-login-password"
                          className="pl-10 h-12 rounded-xl border-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
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
                    <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
                    <p className="text-sm text-muted-foreground mt-1">Join our community today</p>
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
                          type="password"
                          placeholder="Choose a password (min. 6 characters)"
                          value={registerData.password}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                          required
                          data-testid="input-register-password"
                          className="pl-10 h-12 rounded-xl border-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-semibold">Gender <span className="text-red-500">*</span></Label>
                      <Select onValueChange={(value: "male" | "female" | "other" | "prefer_not_to_say") => setRegisterData(prev => ({ ...prev, gender: value }))} required>
                        <SelectTrigger data-testid="select-gender" className="h-12 rounded-xl border-2">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
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
                      disabled={registerMutation.isPending || !termsAccepted}
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
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-8 xl:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]"></div>
        
        <div className="max-w-lg text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-br from-primary to-primary/70 p-4 rounded-3xl shadow-2xl">
                <MessageSquare className="h-16 w-16 xl:h-20 xl:w-20 text-white" />
              </div>
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Real-Time Communication
            </h2>
            <p className="text-muted-foreground text-base xl:text-lg leading-relaxed">
              Connect instantly with friends, colleagues, and communities around the world.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="group flex items-start gap-5 p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg mb-1">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Messages delivered instantly with real-time updates
                </p>
              </div>
            </div>
            
            <div className="group flex items-start gap-5 p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg mb-1">Stay Connected</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  See who's online and start conversations anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
