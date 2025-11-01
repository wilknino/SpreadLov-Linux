import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, FileText, Shield, UserCheck, Scale } from "lucide-react";

export default function TermsPage() {
  const [, setLocation] = useLocation();

  return (
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
                <FileText className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Terms and Conditions
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              Last updated: October 10, 2025
            </p>
          </div>

          <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
                        <UserCheck className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      By accessing and using SpreadLov ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      These Terms and Conditions constitute a legally binding agreement between you and SpreadLov regarding your use of our platform and services.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">2. Use of Service</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      You must be at least 18 years old to use this service. By using SpreadLov, you represent and warrant that you are at least 18 years of age.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                    </p>
                    <div className="bg-secondary/30 border-l-4 border-primary p-4 rounded-r-lg">
                      <p className="text-sm font-medium">
                        You agree to use the Service only for lawful purposes and in accordance with these Terms.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">3. User Conduct</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      You agree not to use SpreadLov to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Harass, abuse, or harm another person</li>
                      <li>Transmit any content that is unlawful, harmful, threatening, abusive, or otherwise objectionable</li>
                      <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation with a person or entity</li>
                      <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
                      <li>Violate any applicable local, state, national, or international law</li>
                      <li>Upload or transmit viruses or any other type of malicious code</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">4. Privacy and Data Protection</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using SpreadLov, you consent to our collection and use of personal data as outlined in our Privacy Policy.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">5. Intellectual Property</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      The Service and its original content, features, and functionality are and will remain the exclusive property of SpreadLov and its licensors. The Service is protected by copyright, trademark, and other laws.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      You retain ownership of any content you submit, post, or display on or through the Service. By posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">6. Content Moderation</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We reserve the right to remove any content that violates these Terms or that we deem inappropriate. We also reserve the right to suspend or terminate accounts that violate these Terms.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      While we strive to maintain a safe and respectful environment, we do not pre-screen content and are not responsible for user-generated content.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
                        <Scale className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">7. Limitation of Liability</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      In no event shall SpreadLov, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Your access to or use of or inability to access or use the Service</li>
                      <li>Any conduct or content of any third party on the Service</li>
                      <li>Any content obtained from the Service</li>
                      <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">8. Disclaimer of Warranties</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      The Service is provided on an "AS IS" and "AS AVAILABLE" basis. SpreadLov makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">9. Termination</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">10. Changes to Terms</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">11. Governing Law</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which SpreadLov operates, without regard to its conflict of law provisions.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">12. Contact Information</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      If you have any questions about these Terms, please contact us through our support channels within the application.
                    </p>
                  </section>

                  <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20">
                    <p className="text-sm text-center font-medium">
                      By creating an account on SpreadLov, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
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
  );
}
