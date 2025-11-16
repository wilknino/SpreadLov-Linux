import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Heart, Users, Shield, Sparkles, Mail, ExternalLink } from "lucide-react";
import { SEO } from "@/components/seo";

export default function AboutPage() {
  const [, setLocation] = useLocation();

  return (
    <>
      <SEO 
        title="About SpreadLov - Modern Dating Platform"
        description="Learn about SpreadLov, a modern digital platform founded by Krishnakant Yadav, focused on creating meaningful human connections through technology."
        canonical="https://spreadlov.com/about"
      />
      
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/auth?tab=signup")}
          className="mb-6 hover:bg-secondary/50 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign Up
        </Button>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 rounded-2xl shadow-2xl">
                <Heart className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              About SpreadLov
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              Creating meaningful connections through technology
            </p>
          </div>

          <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Our Mission</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      SpreadLov is a modern digital platform founded by Krishnakant Yadav, focused on creating meaningful human connections through technology. Based in India, SpreadLov develops secure, user-friendly social and dating applications that promote positivity, respect, and authenticity.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Our mission is to make online interactions safe, uplifting, and genuinely personal. We believe technology should bring people closer — not apart — and every product we build reflects that vision.
                    </p>
                    <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                      <p className="text-sm font-medium">
                        Join us in spreading love, one connection at a time.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">What We Do</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      At SpreadLov, we create platforms that prioritize:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li><strong>Authenticity:</strong> Real connections with verified users</li>
                      <li><strong>Safety:</strong> Robust security measures and user protection</li>
                      <li><strong>Privacy:</strong> Your data is protected and never sold</li>
                      <li><strong>Respect:</strong> A consent-based communication system</li>
                      <li><strong>Inclusivity:</strong> A welcoming space for everyone</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-pink-500 to-red-500 p-2 rounded-lg">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Our Values</h2>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-secondary/30 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <h3 className="font-semibold mb-1">Safety First</h3>
                        <p className="text-sm text-muted-foreground">
                          We implement strict age verification, content moderation, and zero-tolerance policies for abuse and harassment.
                        </p>
                      </div>
                      <div className="bg-secondary/30 border-l-4 border-purple-500 p-4 rounded-r-lg">
                        <h3 className="font-semibold mb-1">User Privacy</h3>
                        <p className="text-sm text-muted-foreground">
                          Your personal information is encrypted and protected. We never share or sell your data to third parties.
                        </p>
                      </div>
                      <div className="bg-secondary/30 border-l-4 border-pink-500 p-4 rounded-r-lg">
                        <h3 className="font-semibold mb-1">Genuine Connections</h3>
                        <p className="text-sm text-muted-foreground">
                          We foster meaningful relationships by encouraging authentic profiles and respectful communication.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">Founded by Krishnakant Yadav</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      SpreadLov was founded with a clear vision: to create a dating platform that puts people first. Our founder, Krishnakant Yadav, recognized the need for a safe, authentic space where individuals can connect without fear of judgment or harassment.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Based in India, we understand the unique challenges and opportunities in the digital dating landscape. Our platform is designed to respect cultural values while embracing modern technology.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Connect With Us</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      We love hearing from our community! Follow us on social media or reach out directly:
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      <a 
                        href="https://x.com/SpreadlovAid" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-secondary/50 hover:bg-secondary transition-all rounded-lg group"
                      >
                        <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-lg">
                          <ExternalLink className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold group-hover:text-primary transition-colors">X (Twitter)</p>
                          <p className="text-xs text-muted-foreground">@SpreadlovAid</p>
                        </div>
                      </a>

                      <a 
                        href="https://www.instagram.com/spreadlov.aid" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-secondary/50 hover:bg-secondary transition-all rounded-lg group"
                      >
                        <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-lg">
                          <ExternalLink className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold group-hover:text-primary transition-colors">Instagram</p>
                          <p className="text-xs text-muted-foreground">@spreadlov.aid</p>
                        </div>
                      </a>

                      <a 
                        href="https://www.facebook.com/people/SpreadLov/61582553866904/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-secondary/50 hover:bg-secondary transition-all rounded-lg group"
                      >
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-lg">
                          <ExternalLink className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold group-hover:text-primary transition-colors">Facebook</p>
                          <p className="text-xs text-muted-foreground">SpreadLov</p>
                        </div>
                      </a>

                      <a 
                        href="https://www.linkedin.com/company/spreadlov" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-secondary/50 hover:bg-secondary transition-all rounded-lg group"
                      >
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2 rounded-lg">
                          <ExternalLink className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold group-hover:text-primary transition-colors">LinkedIn</p>
                          <p className="text-xs text-muted-foreground">SpreadLov</p>
                        </div>
                      </a>

                      <a 
                        href="mailto:spreadlov.aid@gmail.com" 
                        className="flex items-center gap-3 p-4 bg-secondary/50 hover:bg-secondary transition-all rounded-lg group"
                      >
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                          <Mail className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold group-hover:text-primary transition-colors">Email</p>
                          <p className="text-xs text-muted-foreground">spreadlov.aid@gmail.com</p>
                        </div>
                      </a>
                    </div>

                    <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg mt-6">
                      <p className="text-sm font-medium mb-2">Need Support or Have Feedback?</p>
                      <p className="text-sm text-muted-foreground">
                        For feedback or support, open the in-app Support & Feedback section from your profile settings.
                      </p>
                    </div>
                  </section>

                  <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20">
                    <p className="text-sm text-center font-medium">
                      Thank you for being part of the SpreadLov community. Together, we're building a better way to connect.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex justify-center pb-8">
            <Button
              onClick={() => setLocation("/auth?tab=signup")}
              className="h-12 px-8 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Back to Sign Up
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
