import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, FileText, Shield, UserCheck, Scale } from "lucide-react";
import { SEO } from "@/components/seo";

export default function TermsPage() {
  const [, setLocation] = useLocation();

  return (
    <>
      <SEO 
        title="Terms and Conditions - SpreadLov Dating Platform"
        description="Read the terms and conditions for using SpreadLov dating platform. Understand your rights and responsibilities as a user."
        canonical="https://spreadlov.com/terms"
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
                <FileText className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Terms and Conditions
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              Last updated: November 2, 2025
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
                      <h2 className="text-2xl font-bold">2. Eligibility and Account Registration</h2>
                    </div>
                    <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        You must be at least 18 years old to use SpreadLov. No users under 18 are permitted.
                      </p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      By registering for an account, you represent and warrant that:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>You are at least 18 years of age</li>
                      <li>All information you provide during registration is accurate and truthful</li>
                      <li>You will maintain the confidentiality of your account credentials</li>
                      <li>You will notify us immediately of any unauthorized access to your account</li>
                      <li>You agree to verify your email address to access full platform features</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed">
                      You may register using email/password authentication or through Google OAuth. Email verification is required to access certain features including messaging and profile interactions.
                    </p>
                    <div className="bg-secondary/30 border-l-4 border-primary p-4 rounded-r-lg">
                      <p className="text-sm font-medium">
                        You are solely responsible for all activities that occur under your account.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">3. Platform Features and Services</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      SpreadLov provides the following features and services:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li><strong>Profile Creation:</strong> Create detailed profiles with photos, bio, location, age, and preferences</li>
                      <li><strong>User Discovery:</strong> Browse and filter other users by gender, location, and age range</li>
                      <li><strong>Messaging:</strong> Real-time one-on-one chat with consent-based communication system</li>
                      <li><strong>Image Sharing:</strong> Share photos within chat conversations</li>
                      <li><strong>Profile Interactions:</strong> Like/unlike profiles and view who has liked your profile</li>
                      <li><strong>Notifications:</strong> Receive in-app and push notifications for profile views, messages, and likes</li>
                      <li><strong>Email Communications:</strong> Verification codes, password resets, and optional newsletter subscriptions</li>
                      <li><strong>Account Management:</strong> Update profile information, manage privacy settings, and delete your account</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">4. Messaging and Consent System</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      SpreadLov implements a consent-based messaging system to protect user privacy and prevent unwanted communication:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Before initiating a conversation with another user, you must send a chat request</li>
                      <li>The recipient can accept or decline your request</li>
                      <li>Direct messaging is only enabled after both parties have consented to communicate</li>
                      <li>Users can report or block others at any time</li>
                      <li>Consent can be withdrawn by either party</li>
                    </ul>
                    <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                      <p className="text-sm font-medium">
                        Respecting user consent and privacy is mandatory. Violations may result in account suspension or termination.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">5. User Conduct and Prohibited Activities</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      You agree not to use SpreadLov to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Harass, abuse, threaten, or harm another person</li>
                      <li>Transmit any content that is unlawful, harmful, threatening, abusive, or otherwise objectionable</li>
                      <li>Impersonate any person or entity, or falsely state or misrepresent your identity or affiliation</li>
                      <li>Post or share sexually explicit content involving minors (zero tolerance policy)</li>
                      <li>Spam, solicit, or send unsolicited commercial communications</li>
                      <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
                      <li>Violate any applicable local, state, national, or international law</li>
                      <li>Upload or transmit viruses, malware, or any other type of malicious code</li>
                      <li>Attempt to gain unauthorized access to other user accounts or the Service infrastructure</li>
                      <li>Use automated systems, bots, or scripts to access the Service</li>
                    </ul>
                    <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg">
                      <p className="text-sm font-medium">
                        Violations will result in immediate account termination and may be reported to law enforcement authorities.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">6. User Content and Photos</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      You may upload profile photos, gallery images, and share images in chat conversations. By uploading content, you represent and warrant that:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>You own or have the right to use the content you upload</li>
                      <li>Your content does not violate any third-party rights or applicable laws</li>
                      <li>Your content does not contain nudity, sexually explicit material involving minors, or illegal content</li>
                      <li>You grant SpreadLov a license to store, process, and display your content as part of the Service</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed">
                      We reserve the right to remove any content that violates these Terms or is deemed inappropriate. You remain the owner of your content, but grant us the necessary rights to operate the Service.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">7. Privacy and Data Protection</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      SpreadLov collects and processes the following types of personal information:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Account information (username, email, password hash)</li>
                      <li>Profile information (name, age, gender, location, bio, photos)</li>
                      <li>Usage data (messages, profile views, likes, notifications)</li>
                      <li>Device information for push notifications (FCM tokens)</li>
                      <li>Session data and authentication tokens</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed">
                      We implement appropriate security measures to protect your personal information, including encryption, secure session management, and access controls. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      You have the right to access, update, or delete your personal information through your account settings. You may request complete account deletion at any time.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">8. Push Notifications and Communications</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      By using SpreadLov, you agree to receive the following types of communications:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li><strong>Email Communications:</strong> Account verification codes, password reset emails, and optional newsletter subscriptions</li>
                      <li><strong>Push Notifications:</strong> Real-time notifications for messages, profile views, and likes via Firebase Cloud Messaging</li>
                      <li><strong>In-App Notifications:</strong> Alerts for profile interactions and system messages</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed">
                      You can manage notification preferences in your device settings. You may unsubscribe from the newsletter at any time using the unsubscribe link in email communications.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">9. Account Deletion and Data Retention</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      You may request to permanently delete your account at any time through the account deletion page. The deletion process requires:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Email verification via a 6-digit code sent to your registered email address</li>
                      <li>Confirmation within 10 minutes of receiving the code</li>
                    </ul>
                    <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-r-lg">
                      <p className="text-sm font-medium text-destructive">
                        Account deletion is permanent and irreversible. All your data including profile, messages, photos, and connections will be permanently deleted and cannot be recovered.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">10. Intellectual Property</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      The Service and its original content, features, and functionality are and will remain the exclusive property of SpreadLov and its licensors. The Service is protected by copyright, trademark, and other laws.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      You retain ownership of any content you submit, post, or display on or through the Service. By posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content for the purpose of operating and providing the Service.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">11. Child Safety and Protection</h2>
                    <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        SpreadLov has ZERO TOLERANCE for child sexual abuse material (CSAM), child exploitation, or grooming.
                      </p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      We are committed to maintaining the highest standards of child safety:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Strict age verification during registration (18+ only)</li>
                      <li>Active monitoring and reporting of suspicious content</li>
                      <li>Immediate escalation to law enforcement for suspected violations</li>
                      <li>Full compliance with child safety regulations</li>
                      <li>Easy reporting mechanisms for users (spreadlov.aid@gmail.com)</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed">
                      Any violation of our child safety policies will result in immediate account termination and reporting to law enforcement authorities. For complete details, please review our Child Safety & Protection Policy.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
                        <Scale className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">12. Limitation of Liability</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      In no event shall SpreadLov, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Your access to or use of or inability to access or use the Service</li>
                      <li>Any conduct or content of any third party on the Service</li>
                      <li>Any content obtained from the Service</li>
                      <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                      <li>Any interactions or relationships formed through the Service</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">13. Disclaimer of Warranties</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      The Service is provided on an "AS IS" and "AS AVAILABLE" basis. SpreadLov makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      We do not guarantee that you will find a match, relationship, or specific results from using the Service. User experiences may vary.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">14. Account Termination and Suspension</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Violation of these Terms and Conditions</li>
                      <li>Fraudulent, abusive, or illegal activity</li>
                      <li>Harassment or harm to other users</li>
                      <li>Violations of our Child Safety Policy</li>
                      <li>Creating multiple accounts to circumvent restrictions</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed">
                      If you wish to terminate your account voluntarily, you may use the account deletion feature in your profile settings or contact support at spreadlov.aid@gmail.com.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">15. Changes to Terms</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect through email or in-app notification.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you must discontinue use of the Service and may delete your account.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">16. Governing Law and Dispute Resolution</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which SpreadLov operates, without regard to its conflict of law provisions.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. Any disputes arising from these Terms or use of the Service shall be resolved through binding arbitration or in the courts of our operating jurisdiction.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">17. Contact Information</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      If you have any questions, concerns, or feedback about these Terms, please contact us:
                    </p>
                    <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                      <p className="text-sm font-medium mb-2">Email: spreadlov.aid@gmail.com</p>
                      <p className="text-sm text-muted-foreground">
                        You can also reach us through the support and feedback feature within the application from your profile settings.
                      </p>
                    </div>
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
    </>
  );
}
