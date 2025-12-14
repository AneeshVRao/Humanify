import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Terms of Service | Humanify",
  description: "Terms of Service for Humanify - AI Text Humanization Service",
};

export default function TermsOfServicePage() {
  return (
    <>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

      <div className="prose prose-slate max-w-none space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Last Updated: December 12, 2025</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Humanify ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground mb-4">
                Humanify is an AI-powered text humanization service that transforms AI-generated text into more natural, human-sounding content. The Service offers two tiers:
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Free Tier</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>10 humanizations per day</li>
                <li>Maximum 1,000 characters per request</li>
                <li>Google Gemini 2.0 Flash processing (Google may train on data)</li>
                <li>7-day history retention</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Pro Tier</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Unlimited humanizations</li>
                <li>Maximum 10,000 characters per request</li>
                <li>Google Gemini 2.0 Flash (Private, zero training)</li>
                <li>Optional Claude 3.5 Sonnet (bring your own API key)</li>
                <li>Unlimited history retention</li>
                <li>₹999/month (subject to approval)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Account Creation</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You must be at least 18 years old to create an account</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>One account per person (multiple accounts may be terminated)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Account Termination</h3>
              <p className="text-muted-foreground">
                We reserve the right to terminate accounts that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Violate these Terms of Service</li>
                <li>Engage in abusive or fraudulent activity</li>
                <li>Create multiple accounts to bypass rate limits</li>
                <li>Use the service for illegal purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use Policy</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Permitted Uses</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Humanizing AI-generated content for personal or commercial use</li>
                <li>Improving the quality and readability of text</li>
                <li>Testing and evaluating the service</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Prohibited Uses</h3>
              <p className="text-muted-foreground mb-2">You agree NOT to use the Service to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Generate or humanize illegal, harmful, or malicious content</li>
                <li>Create spam, phishing attempts, or scam content</li>
                <li>Violate intellectual property rights</li>
                <li>Harass, abuse, or harm others</li>
                <li>Spread misinformation or fake news</li>
                <li>Bypass or circumvent rate limits or security measures</li>
                <li>Reverse engineer, decompile, or attempt to extract the AI models</li>
                <li>Use automated scripts or bots (except with explicit API access)</li>
                <li>Resell or redistribute the service without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Payment and Subscription</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Pro Plan Billing</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Pro plan costs ₹999/month, billed monthly</li>
                <li>Payment processed through Razorpay or Stripe</li>
                <li>Subscription automatically renews unless cancelled</li>
                <li>Prices subject to change with 30 days notice</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">5.2 Pro Access Approval</h3>
              <p className="text-muted-foreground">
                Pro plan access requires manual approval through our waitlist system. We review each request and may approve or reject based on:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Use case legitimacy</li>
                <li>Account history</li>
                <li>Capacity availability</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">5.3 Refunds</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>First Month:</strong> Full refund if requested within 7 days</li>
                <li><strong>Subsequent Months:</strong> Pro-rated refund for unused days (at our discretion)</li>
                <li><strong>Abuse:</strong> No refund if account terminated for Terms violation</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">5.4 Cancellation</h3>
              <p className="text-muted-foreground">
                You may cancel your Pro subscription at any time. Access continues until the end of the billing period. No pro-rated refunds for cancellations mid-cycle.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">6.1 Your Content</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You retain all rights to the text you submit</li>
                <li>You grant us a license to process your text for service delivery</li>
                <li>Humanized output belongs to you</li>
                <li>You are responsible for ensuring you have rights to submitted content</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">6.2 Our IP</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Humanify name, logo, and branding are our property</li>
                <li>Service code, algorithms, and infrastructure are proprietary</li>
                <li>You may not copy, modify, or reverse engineer our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Usage and AI Training</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">7.1 Free Tier</h3>
              <p className="text-muted-foreground">
                <strong>Important:</strong> Free tier uses Google Gemini Public API. Google may use your submitted text to improve their AI models. By using the free tier, you acknowledge and consent to this.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">7.2 Pro Tier</h3>
              <p className="text-muted-foreground">
                Pro tier uses Google Gemini Private API with zero training guarantee. Your data is NOT used to train Google's models. If you use Claude (BYOK), refer to Anthropic's data usage policy.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">7.3 Our Usage</h3>
              <p className="text-muted-foreground">
                We may use aggregated, anonymized data to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Improve our service</li>
                <li>Generate usage statistics</li>
                <li>Analyze trends and patterns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. API Keys (Pro Users)</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">8.1 Claude API Key (BYOK)</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You may optionally provide your own Claude API key</li>
                <li>Keys are encrypted with AES-256-GCM</li>
                <li>You are responsible for API key costs and usage</li>
                <li>We are not liable for API key breaches or misuse</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">8.2 Security</h3>
              <p className="text-muted-foreground">
                While we take security seriously, you acknowledge that no system is 100% secure. Store sensitive API keys at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Service Availability</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">9.1 Uptime</h3>
              <p className="text-muted-foreground">
                We strive for 99.9% uptime but do not guarantee uninterrupted service. Maintenance windows will be announced in advance when possible.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">9.2 Changes to Service</h3>
              <p className="text-muted-foreground">
                We reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Modify features or pricing</li>
                <li>Discontinue the service with 30 days notice</li>
                <li>Change AI providers or models</li>
                <li>Update rate limits or tier features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>

              <p className="text-muted-foreground mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>

              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND</li>
                <li>WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES</li>
                <li>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID IN THE LAST 12 MONTHS</li>
                <li>WE ARE NOT RESPONSIBLE FOR:
                  <ul className="list-circle list-inside ml-6 mt-2 space-y-1">
                    <li>Accuracy or quality of humanized output</li>
                    <li>Third-party AI provider errors or downtime</li>
                    <li>Data loss or corruption</li>
                    <li>Business losses resulting from service use</li>
                    <li>Misuse of humanized content by you or others</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to indemnify and hold harmless Humanify, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Content you submit or humanize</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Privacy</h2>
              <p className="text-muted-foreground">
                Your use of the Service is also governed by our Privacy Policy. Please review it at: <a href="/privacy" className="text-primary hover:underline">/privacy</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in [Your City/State], India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We may update these Terms from time to time. Significant changes will be announced via email or prominent website notice. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Severability</h2>
              <p className="text-muted-foreground">
                If any provision of these Terms is found unenforceable, the remaining provisions shall remain in full effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">16. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                For questions about these Terms of Service, contact us:
              </p>
              <ul className="list-none space-y-2 text-muted-foreground">
                <li><strong>Email:</strong> <a href="mailto:legal@humanify.com" className="text-primary hover:underline">legal@humanify.com</a></li>
                <li><strong>Support:</strong> <a href="mailto:support@humanify.com" className="text-primary hover:underline">support@humanify.com</a></li>
                <li><strong>Website:</strong> <a href="https://humanify.com" className="text-primary hover:underline">https://humanify.com</a></li>
              </ul>
            </section>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mt-8">
              <p className="text-sm text-blue-900">
                <strong>By using Humanify, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <Footer />
    </>
  );
}
