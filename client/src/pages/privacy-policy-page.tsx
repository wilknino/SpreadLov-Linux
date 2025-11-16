import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Shield, Lock, Database, Eye, Trash2, Mail } from "lucide-react";
import { SEO } from "@/components/seo";

export default function PrivacyPolicyPage() {
  const [, setLocation] = useLocation();

  return (
    <>
      <SEO 
        title="Privacy Policy - SpreadLov Dating Platform"
        description="Read SpreadLov's privacy policy to understand how we collect, use, and protect your personal information."
        canonical="https://spreadlov.com/privacy-policy"
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
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              Last updated: November 12, 2025
            </p>
          </div>

          <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">1. Introduction</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      At SpreadLov, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our dating platform and services.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      By using SpreadLov, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                        <Database className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">2. Information We Collect</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      We collect several types of information to provide and improve our services:
                    </p>
                    
                    <h3 className="text-xl font-semibold mt-4">2.1 Account Information</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li><strong>Email address:</strong> Used for account creation, verification, and communication</li>
                      <li><strong>Password:</strong> Stored as encrypted hash for account security</li>
                      <li><strong>Username:</strong> Your chosen display name on the platform</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4">2.2 Profile Information</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li><strong>Name:</strong> Your first and last name</li>
                      <li><strong>Date of Birth:</strong> For age verification (18+ only)</li>
                      <li><strong>Gender:</strong> Your gender identity</li>
                      <li><strong>Location:</strong> City and country for matchmaking</li>
                      <li><strong>Bio:</strong> Personal description and interests</li>
                      <li><strong>Profile Photos:</strong> Images you upload to your profile and gallery</li>
                      <li><strong>Preferences:</strong> Gender preferences, age range, and location preferences</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4">2.3 Usage Data</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Messages sent and received</li>
                      <li>Profile views and interactions (likes, matches)</li>
                      <li>Search queries and filters used</li>
                      <li>Time spent on the platform</li>
                      <li>Features accessed and used</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4">2.4 Device and Technical Information</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Device type and operating system</li>
                      <li>Browser type and version</li>
                      <li>IP address and general location</li>
                      <li>Firebase Cloud Messaging (FCM) tokens for push notifications</li>
                      <li>Session data and authentication tokens</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-pink-500 to-red-500 p-2 rounded-lg">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">3. How We Use Your Information</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      We use your personal information for the following purposes:
                    </p>

                    <h3 className="text-xl font-semibold mt-4">3.1 Core Services</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li><strong>Authentication:</strong> Verify your identity and secure your account</li>
                      <li><strong>Matchmaking:</strong> Connect you with compatible users based on preferences</li>
                      <li><strong>Messaging:</strong> Enable real-time communication with your matches</li>
                      <li><strong>Profile Display:</strong> Show your profile to other users</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4">3.2 Notifications</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Send push notifications for new messages and likes</li>
                      <li>Email notifications for account security and verification</li>
                      <li>In-app alerts for profile views and interactions</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4">3.3 Platform Improvement</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Analyze usage patterns to improve features</li>
                      <li>Monitor and prevent fraudulent activity</li>
                      <li>Ensure platform security and stability</li>
                      <li>Provide customer support and respond to inquiries</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">4. Third-Party Integrations</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We integrate with the following third-party services to enhance your experience:
                    </p>

                    <div className="bg-secondary/30 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <h3 className="font-semibold mb-1">Google OAuth</h3>
                      <p className="text-sm text-muted-foreground">
                        Used for optional sign-in and authentication. We only receive your basic profile information (name, email) when you choose to sign in with Google.
                      </p>
                    </div>

                    <div className="bg-secondary/30 border-l-4 border-purple-500 p-4 rounded-r-lg mt-3">
                      <h3 className="font-semibold mb-1">Firebase Cloud Messaging</h3>
                      <p className="text-sm text-muted-foreground">
                        Used to send push notifications to your device. We store FCM tokens securely and use them only for notification delivery.
                      </p>
                    </div>

                    <div className="bg-secondary/30 border-l-4 border-pink-500 p-4 rounded-r-lg mt-3">
                      <h3 className="font-semibold mb-1">Meta APIs (Optional)</h3>
                      <p className="text-sm text-muted-foreground">
                        May be used for optional features. We only access data you explicitly authorize.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                        <Lock className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">5. Data Protection & Security</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      We implement comprehensive security measures to protect your personal information:
                    </p>

                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li><strong>Encryption:</strong> All passwords are hashed using bcrypt encryption</li>
                      <li><strong>Secure Sessions:</strong> Session data is encrypted and stored securely</li>
                      <li><strong>HTTPS:</strong> All data transmission is encrypted using SSL/TLS</li>
                      <li><strong>Access Controls:</strong> Strict access controls limit who can view your data</li>
                      <li><strong>Regular Audits:</strong> We regularly review and update our security practices</li>
                      <li><strong>Database Security:</strong> Your data is stored in secure, encrypted databases</li>
                    </ul>

                    <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
                      <p className="text-sm font-medium">
                        While we implement industry-standard security measures, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security but are committed to protecting your data.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">6. Data Sharing and Disclosure</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We respect your privacy and have strict policies about data sharing:
                    </p>

                    <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                      <p className="text-sm font-medium mb-2">We NEVER sell your personal data to third parties.</p>
                    </div>

                    <p className="text-muted-foreground leading-relaxed mt-4">
                      We may share your information only in the following limited circumstances:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li><strong>With Other Users:</strong> Your profile information is visible to other users based on your privacy settings</li>
                      <li><strong>Service Providers:</strong> Third-party services that help us operate the platform (e.g., Firebase, email services)</li>
                      <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                      <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">7. Your Privacy Rights</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      You have the following rights regarding your personal data:
                    </p>

                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li><strong>Access:</strong> Request a copy of all personal data we hold about you</li>
                      <li><strong>Update:</strong> Modify your profile information at any time through account settings</li>
                      <li><strong>Delete:</strong> Request complete deletion of your account and all associated data</li>
                      <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails and manage notification preferences</li>
                      <li><strong>Data Portability:</strong> Request your data in a portable format</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-red-500 to-pink-500 p-2 rounded-lg">
                        <Trash2 className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">8. Account Deletion and Data Removal</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      You can permanently delete your account at any time by visiting the account deletion page:
                    </p>
                    
                    <div className="bg-secondary/30 border-l-4 border-primary p-4 rounded-r-lg">
                      <p className="text-sm font-medium">
                        <a href="/delete-account" className="text-primary hover:underline">
                          Delete Account Page
                        </a>
                      </p>
                    </div>

                    <p className="text-muted-foreground leading-relaxed mt-4">
                      When you delete your account:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>All your profile information is permanently removed</li>
                      <li>Your messages and conversations are deleted</li>
                      <li>Your photos and gallery images are permanently erased</li>
                      <li>Your likes, matches, and connections are removed</li>
                      <li>All notification tokens and device data are deleted</li>
                    </ul>

                    <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-r-lg mt-4">
                      <p className="text-sm font-medium text-destructive">
                        Account deletion is permanent and irreversible. We cannot recover your data once it has been deleted.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">9. Data Retention</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We retain your personal information for as long as your account is active or as needed to provide our services. We may also retain certain information:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>To comply with legal obligations</li>
                      <li>To resolve disputes and enforce our agreements</li>
                      <li>For fraud prevention and security purposes</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed">
                      After account deletion, we may retain anonymized or aggregated data that cannot be used to identify you.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">10. Children's Privacy</h2>
                    <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg">
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        SpreadLov is strictly for users 18 years and older. We do not knowingly collect information from anyone under 18.
                      </p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                      If we discover that a user under 18 has created an account, we will immediately terminate the account and delete all associated data.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold">11. Changes to This Privacy Policy</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. When we make significant changes, we will:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Update the "Last updated" date at the top of this policy</li>
                      <li>Notify you via email or in-app notification</li>
                      <li>Provide at least 30 days' notice for material changes</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed">
                      Your continued use of SpreadLov after changes become effective constitutes your acceptance of the updated policy.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">12. Contact Us</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                    </p>
                    <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                      <p className="text-sm font-medium mb-2">Email: spreadlov.aid@gmail.com</p>
                      <p className="text-sm text-muted-foreground">
                        You can also reach us through the Support & Feedback section in your profile settings.
                      </p>
                    </div>
                  </section>

                  <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20">
                    <p className="text-sm text-center font-medium">
                      By using SpreadLov, you acknowledge that you have read, understood, and agree to this Privacy Policy.
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
