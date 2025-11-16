import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Shield, AlertCircle, Mail, CheckCircle, UserX } from "lucide-react";
import { SEO } from "@/components/seo";

export default function SafetyStandardsPage() {
  const [, setLocation] = useLocation();

  return (
    <>
      <SEO 
        title="Child Safety & Protection Policy - SpreadLov"
        description="SpreadLov's commitment to maintaining a safe environment. Learn about our zero tolerance policy for CSAM and our safety measures."
        canonical="https://spreadlov.com/safety-standards"
      />
      
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6 hover:bg-secondary/50 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 rounded-2xl shadow-2xl">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Child Safety & Protection Policy
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              Last updated: November 2025
            </p>
          </div>

          <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-8">
                  <section className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-l-4 border-primary p-6 rounded-r-xl">
                      <p className="text-base sm:text-lg leading-relaxed font-medium">
                        SpreadLov is committed to maintaining a safe and respectful environment for all users. We have zero tolerance for any form of child sexual abuse material (CSAM), exploitation, or grooming.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
                        <UserX className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Age Restriction</h2>
                    </div>
                    <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg">
                      <p className="text-base font-semibold text-red-600 dark:text-red-400">
                        No users under the age of 18 are permitted to use SpreadLov.
                      </p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Our platform is exclusively designed for adults aged 18 and above. We implement strict age verification measures during registration to ensure compliance with this policy.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Our Safety Commitments</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1">Active Monitoring</h3>
                          <p className="text-muted-foreground text-sm">
                            We actively monitor, report, and remove any content that violates child safety laws.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1">Immediate Escalation</h3>
                          <p className="text-muted-foreground text-sm">
                            Reports of suspected child exploitation are immediately escalated to relevant authorities and law enforcement agencies.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1">Regulatory Compliance</h3>
                          <p className="text-muted-foreground text-sm">
                            We comply with all applicable child safety regulations and reporting requirements.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1">Easy Reporting</h3>
                          <p className="text-muted-foreground text-sm">
                            Users can report any concerns or suspicious activity directly within the app or by emailing spreadlov.aid@gmail.com.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Zero Tolerance Policy</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      SpreadLov maintains a zero-tolerance policy for child sexual abuse material (CSAM), child exploitation, grooming, or any behavior that endangers minors.
                    </p>
                    <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg">
                      <p className="text-sm font-medium">
                        Any violation of our child safety policies will result in immediate account termination and reporting to law enforcement authorities.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-pink-500 to-red-500 p-2 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">How to Report Concerns</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      If you encounter any behavior or content that may violate our child safety standards, please report it immediately through one of the following methods:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Use the in-app reporting feature available on all user profiles and content</li>
                      <li>Email our safety team directly at spreadlov.aid@gmail.com</li>
                      <li>All reports are treated with the highest priority and confidentiality</li>
                    </ul>
                    <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                      <p className="text-sm font-medium">
                        Your reports help us maintain a safe community. All reports are investigated promptly and thoroughly.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Contact Information</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      For child safety and compliance inquiries, please contact us at:
                    </p>
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20 p-6">
                      <div className="flex items-center gap-3">
                        <Mail className="h-6 w-6 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Email</p>
                          <a 
                            href="mailto:spreadlov.aid@gmail.com"
                            className="text-lg font-semibold text-primary hover:underline"
                          >
                            spreadlov.aid@gmail.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">Law Enforcement Cooperation</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      SpreadLov cooperates fully with law enforcement agencies in investigations related to child safety. We maintain detailed logs and records to assist in any legal proceedings related to child protection.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      We are committed to providing timely responses to law enforcement requests and will preserve relevant evidence as required by law.
                    </p>
                  </section>

                  <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20">
                    <p className="text-sm text-center font-medium">
                      By using SpreadLov, you acknowledge that you have read and understood our Child Safety & Protection Policy and agree to report any violations immediately.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex justify-center pb-8">
            <Button
              onClick={() => setLocation("/")}
              className="h-12 px-8 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
