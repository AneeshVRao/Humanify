import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Privacy Policy | Humanify",
  description: "Privacy Policy for Humanify - AI Text Humanization Service",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-slate max-w-none space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Last Updated: December 12, 2025</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground">
                Welcome to Humanify ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Personal Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Account Information:</strong> Email address, name (optional), password (encrypted)</li>
                <li><strong>Payment Information:</strong> Processed securely through Razorpay/Stripe (we do not store full payment details)</li>
                <li><strong>Profile Information:</strong> Plan type, subscription status, usage statistics</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Usage Data</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Text you submit for humanization (stored temporarily, deleted after processing for free users)</li>
                <li>Humanization history (stored for 7 days for free users, unlimited for Pro users)</li>
                <li>Usage patterns (number of humanizations, character counts, tone preferences)</li>
                <li>API keys (if provided by Pro users, encrypted with AES-256-GCM)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.3 Technical Data</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>IP address (for rate limiting and abuse prevention)</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Log data (errors, performance metrics)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Service Delivery:</strong> Process your text humanization requests</li>
                <li><strong>Account Management:</strong> Create and manage your account, handle subscriptions</li>
                <li><strong>Improvements:</strong> Analyze usage patterns to improve our service</li>
                <li><strong>Communication:</strong> Send service updates, Pro request status, important announcements</li>
                <li><strong>Security:</strong> Prevent fraud, abuse, and unauthorized access</li>
                <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. AI Provider Data Sharing</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Free Tier Users</h3>
              <p className="text-muted-foreground">
                Your text is processed using Google Gemini 2.0 Flash (Public API). Google may use this data to train their models. By using the free tier, you acknowledge and accept this data usage.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Pro Tier Users</h3>
              <p className="text-muted-foreground">
                Your text is processed using:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Google Gemini (Private API):</strong> Zero training guarantee - Google does NOT use your data for training</li>
                <li><strong>Anthropic Claude (Optional, BYOK):</strong> If you provide your own API key, data is sent to Anthropic according to their privacy policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Storage and Security</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Storage</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Database: Supabase (PostgreSQL) with encryption at rest</li>
                <li>Rate limiting: Upstash Redis</li>
                <li>Location: Data centers in [specify region]</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">5.2 Security Measures</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>HTTPS encryption for all data transmission</li>
                <li>Password hashing using bcrypt</li>
                <li>API keys encrypted with AES-256-GCM</li>
                <li>Row-Level Security (RLS) in database</li>
                <li>Regular security audits and monitoring</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">5.3 Data Retention</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Free Users:</strong> Humanization history deleted after 7 days</li>
                <li><strong>Pro Users:</strong> Unlimited history retention (can request deletion)</li>
                <li><strong>Deleted Accounts:</strong> Data permanently deleted within 30 days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Privacy Rights</h2>

              <p className="text-muted-foreground mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct your information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in JSON format</li>
                <li><strong>Objection:</strong> Object to processing of your data</li>
                <li><strong>Withdraw Consent:</strong> Opt-out of marketing communications</li>
              </ul>

              <p className="text-muted-foreground mt-4">
                To exercise these rights, contact us at: <a href="mailto:privacy@humanify.com" className="text-primary hover:underline">privacy@humanify.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">Essential Cookies</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Authentication tokens (session management)</li>
                <li>Security tokens (CSRF protection)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">Analytics Cookies (Optional)</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>PostHog for usage analytics (privacy-friendly, can be disabled)</li>
                <li>Sentry for error tracking (anonymized)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Third-Party Services</h2>

              <p className="text-muted-foreground mb-4">We use the following third-party services:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Supabase:</strong> Database and authentication</li>
                <li><strong>Google Gemini:</strong> AI text processing</li>
                <li><strong>Anthropic Claude:</strong> Optional AI processing (Pro users only)</li>
                <li><strong>Razorpay/Stripe:</strong> Payment processing</li>
                <li><strong>Upstash:</strong> Rate limiting</li>
                <li><strong>Sentry:</strong> Error tracking</li>
                <li><strong>PostHog:</strong> Analytics (optional)</li>
              </ul>

              <p className="text-muted-foreground mt-4">
                Each service has its own privacy policy. We recommend reviewing them:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                <li><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Supabase Privacy Policy</a></li>
                <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Privacy Policy</a></li>
                <li><a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Anthropic Privacy Policy</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Humanify is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we discover we have collected data from a child, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. International Users</h2>
              <p className="text-muted-foreground">
                If you are accessing Humanify from outside India, please note that your data may be transferred to and processed in India. By using our service, you consent to this transfer.
              </p>

              <p className="text-muted-foreground mt-4">
                <strong>For EU/EEA Users (GDPR):</strong> We comply with GDPR requirements. You have additional rights under GDPR, including the right to lodge a complaint with your local data protection authority.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our website. Continued use of the service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                For questions about this Privacy Policy or our data practices, contact us:
              </p>
              <ul className="list-none space-y-2 text-muted-foreground">
                <li><strong>Email:</strong> <a href="mailto:privacy@humanify.com" className="text-primary hover:underline">privacy@humanify.com</a></li>
                <li><strong>Support:</strong> <a href="mailto:support@humanify.com" className="text-primary hover:underline">support@humanify.com</a></li>
                <li><strong>Website:</strong> <a href="https://humanify.com" className="text-primary hover:underline">https://humanify.com</a></li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
    <Footer />
    </>
  );
}
