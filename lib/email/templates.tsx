/**
 * Email Templates
 * React components for beautiful, responsive emails
 */

import * as React from 'react';

interface EmailLayoutProps {
  children: React.ReactNode;
  preview: string;
}

function EmailLayout({ children, preview }: EmailLayoutProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#f6f9fc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}>
        {/* Preview text */}
        <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
          {preview}
        </div>

        {/* Email content */}
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f6f9fc' }}>
          <tr>
            <td align="center" style={{ padding: '40px 20px' }}>
              <table width="600" cellPadding="0" cellSpacing="0" style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}>
                {children}
              </table>

              {/* Footer */}
              <table width="600" cellPadding="0" cellSpacing="0" style={{ marginTop: '20px' }}>
                <tr>
                  <td align="center" style={{
                    color: '#8898aa',
                    fontSize: '12px',
                    lineHeight: '16px',
                    padding: '20px',
                  }}>
                    <p style={{ margin: '0 0 8px' }}>
                      © {new Date().getFullYear()} Humanify. All rights reserved.
                    </p>
                    <p style={{ margin: 0 }}>
                      <a href="https://humanify.app" style={{ color: '#6772e5', textDecoration: 'none' }}>Website</a>
                      {' • '}
                      <a href="https://humanify.app/privacy" style={{ color: '#6772e5', textDecoration: 'none' }}>Privacy</a>
                      {' • '}
                      <a href="https://humanify.app/terms" style={{ color: '#6772e5', textDecoration: 'none' }}>Terms</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

// Welcome Email Template
export function WelcomeEmail({ name }: { name?: string }) {
  return (
    <EmailLayout preview="Welcome to Humanify! Start transforming AI text today.">
      {/* Header */}
      <tr>
        <td style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px',
          textAlign: 'center',
        }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: '28px',
            fontWeight: '600',
            margin: 0,
          }}>
            Welcome to Humanify! 🎉
          </h1>
        </td>
      </tr>

      {/* Content */}
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#32325d', margin: '0 0 16px' }}>
            {name ? `Hi ${name},` : 'Hi there,'}
          </p>

          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#32325d', margin: '0 0 16px' }}>
            Thank you for signing up! We're excited to help you transform AI-generated content into natural, human-sounding text.
          </p>

          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#32325d', margin: '0 0 24px' }}>
            Here's what you can do with your free account:
          </p>

          <table width="100%" cellPadding="0" cellSpacing="0">
            <tr>
              <td style={{ padding: '12px 0' }}>
                <span style={{ fontSize: '20px', marginRight: '12px' }}>✨</span>
                <strong style={{ color: '#32325d' }}>10 free humanizations daily</strong>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px 0' }}>
                <span style={{ fontSize: '20px', marginRight: '12px' }}>🎯</span>
                <strong style={{ color: '#32325d' }}>Multiple tone options</strong>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px 0' }}>
                <span style={{ fontSize: '20px', marginRight: '12px' }}>📝</span>
                <strong style={{ color: '#32325d' }}>Up to 1,000 characters per text</strong>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px 0' }}>
                <span style={{ fontSize: '20px', marginRight: '12px' }}>📊</span>
                <strong style={{ color: '#32325d' }}>History & analytics</strong>
              </td>
            </tr>
          </table>

          <div style={{ textAlign: 'center', margin: '32px 0 0' }}>
            <a href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} style={{
              display: 'inline-block',
              backgroundColor: '#667eea',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              padding: '12px 32px',
              borderRadius: '6px',
            }}>
              Get Started
            </a>
          </div>
        </td>
      </tr>
    </EmailLayout>
  );
}

// Pro Request Received Template
export function ProRequestReceivedEmail({ name }: { name?: string }) {
  return (
    <EmailLayout preview="We've received your Pro access request">
      <tr>
        <td style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px',
          textAlign: 'center',
        }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: '28px',
            fontWeight: '600',
            margin: 0,
          }}>
            Request Received 📬
          </h1>
        </td>
      </tr>

      <tr>
        <td style={{ padding: '40px' }}>
          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#32325d', margin: '0 0 16px' }}>
            {name ? `Hi ${name},` : 'Hi there,'}
          </p>

          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#32325d', margin: '0 0 16px' }}>
            We've received your request for Pro access! Our team will review your request and get back to you shortly.
          </p>

          <div style={{
            backgroundColor: '#f6f9fc',
            borderLeft: '4px solid #667eea',
            padding: '16px 20px',
            margin: '24px 0',
          }}>
            <p style={{ fontSize: '14px', lineHeight: '20px', color: '#525f7f', margin: 0 }}>
              <strong>What happens next?</strong><br />
              We typically review requests within 24-48 hours. You'll receive an email once your request has been processed.
            </p>
          </div>

          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#32325d', margin: '24px 0 0' }}>
            In the meantime, you can continue using your free account. If you have any questions, feel free to reply to this email.
          </p>
        </td>
      </tr>
    </EmailLayout>
  );
}

// Pro Request Approved Template
export function ProRequestApprovedEmail({ name }: { name?: string }) {
  return (
    <EmailLayout preview="Congratulations! Your Pro access has been approved">
      <tr>
        <td style={{
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          padding: '40px',
          textAlign: 'center',
        }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: '28px',
            fontWeight: '600',
            margin: 0,
          }}>
            Welcome to Pro! 🎉
          </h1>
        </td>
      </tr>

      <tr>
        <td style={{ padding: '40px' }}>
          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#32325d', margin: '0 0 16px' }}>
            {name ? `Hi ${name},` : 'Hi there,'}
          </p>

          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#32325d', margin: '0 0 24px' }}>
            Great news! Your Pro access request has been approved. You now have access to all premium features:
          </p>

          <table width="100%" cellPadding="0" cellSpacing="0">
            <tr>
              <td style={{ padding: '12px 0' }}>
                <span style={{ fontSize: '20px', marginRight: '12px' }}>🚀</span>
                <strong style={{ color: '#32325d' }}>Unlimited humanizations</strong>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px 0' }}>
                <span style={{ fontSize: '20px', marginRight: '12px' }}>📏</span>
                <strong style={{ color: '#32325d' }}>Up to 10,000 characters per text</strong>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px 0' }}>
                <span style={{ fontSize: '20px', marginRight: '12px' }}>🔑</span>
                <strong style={{ color: '#32325d' }}>Bring your own AI API keys</strong>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px 0' }}>
                <span style={{ fontSize: '20px', marginRight: '12px' }}>⚡</span>
                <strong style={{ color: '#32325d' }}>Priority processing</strong>
              </td>
            </tr>
          </table>

          <div style={{ textAlign: 'center', margin: '32px 0 0' }}>
            <a href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} style={{
              display: 'inline-block',
              backgroundColor: '#11998e',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              padding: '12px 32px',
              borderRadius: '6px',
            }}>
              Start Using Pro
            </a>
          </div>
        </td>
      </tr>
    </EmailLayout>
  );
}

// Pro Request Rejected Template
export function ProRequestRejectedEmail({
  name,
  reason
}: {
  name?: string;
  reason?: string;
}) {
  return (
    <EmailLayout preview="Update on your Pro access request">
      <tr>
        <td style={{
          backgroundColor: '#32325d',
          padding: '40px',
          textAlign: 'center',
        }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: '28px',
            fontWeight: '600',
            margin: 0,
          }}>
            Pro Access Update
          </h1>
        </td>
      </tr>

      <tr>
        <td style={{ padding: '40px' }}>
          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#32325d', margin: '0 0 16px' }}>
            {name ? `Hi ${name},` : 'Hi there,'}
          </p>

          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#32325d', margin: '0 0 16px' }}>
            Thank you for your interest in Humanify Pro. After reviewing your request, we're unable to approve Pro access at this time.
          </p>

          {reason && (
            <div style={{
              backgroundColor: '#f6f9fc',
              borderLeft: '4px solid #8898aa',
              padding: '16px 20px',
              margin: '24px 0',
            }}>
              <p style={{ fontSize: '14px', lineHeight: '20px', color: '#525f7f', margin: 0 }}>
                <strong>Reason:</strong><br />
                {reason}
              </p>
            </div>
          )}

          <p style={{ fontSize: '16px', lineHeight: '24px', color: '#32325d', margin: '24px 0 16px' }}>
            You can continue using your free account with 10 daily humanizations. If you have any questions or would like to discuss your request further, please don't hesitate to reach out.
          </p>

          <div style={{ textAlign: 'center', margin: '32px 0 0' }}>
            <a href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} style={{
              display: 'inline-block',
              backgroundColor: '#667eea',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              padding: '12px 32px',
              borderRadius: '6px',
            }}>
              Continue with Free Plan
            </a>
          </div>
        </td>
      </tr>
    </EmailLayout>
  );
}
