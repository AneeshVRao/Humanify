/**
 * Email Sending Utilities
 */

import { resend, emailConfig } from "./client";
import {
  WelcomeEmail,
  ProRequestReceivedEmail,
  ProRequestApprovedEmail,
  ProRequestRejectedEmail,
} from "./templates";

export interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

/**
 * Helper to check if we're in Resend testing mode
 * In testing mode, emails can only be sent to the account owner's email
 */
function isResendTestingMode(): boolean {
  const apiKey = process.env.RESEND_API_KEY;
  // Resend test keys start with 're_test_'
  return apiKey?.startsWith("re_test_") || false;
}

/**
 * Get the allowed recipient email in testing mode
 */
function getTestingEmail(): string | null {
  // In testing mode, use the account owner's email
  return process.env.RESEND_TESTING_EMAIL || null;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured. Email not sent:", {
        to,
        subject,
      });
      return { success: false, error: "Email service not configured" };
    }

    // Handle Resend testing mode
    if (isResendTestingMode()) {
      const testingEmail = getTestingEmail();
      if (testingEmail && to !== testingEmail) {
        console.warn(
          `[RESEND TESTING MODE] Cannot send to ${to}. ` +
            `Emails can only be sent to ${testingEmail}. ` +
            `To send to other recipients, verify a domain at resend.com/domains`
        );
        // Don't fail the request, just log it
        return {
          success: true,
          id: "skipped-testing-mode",
          warning: "Email skipped in testing mode",
        };
      }
    }

    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to,
      subject,
      react,
      replyTo: emailConfig.replyTo,
    });

    if (error) {
      // Check if it's a testing mode error
      if (
        error.name === "validation_error" &&
        error.message?.includes("testing emails")
      ) {
        const allowedEmail = getTestingEmail() || "your verified email";
        console.warn(
          `[RESEND TESTING MODE] Cannot send to ${to}. ` +
            `Emails can only be sent to ${allowedEmail}. ` +
            `To send to other recipients, verify a domain at resend.com/domains`
        );
        return {
          success: true,
          warning: "Email skipped - Resend testing mode restriction",
        };
      }

      console.error("Failed to send email:", error);
      return { success: false, error: error.message };
    }

    console.log("Email sent successfully:", { to, subject, id: data?.id });
    return { success: true, id: data?.id };
  } catch (error: any) {
    console.error("Unexpected error sending email:", error);
    return { success: false, error: error?.message || "Failed to send email" };
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(to: string, name?: string) {
  return sendEmail({
    to,
    subject: "Welcome to Humanify! 🎉",
    react: WelcomeEmail({ name }),
  });
}

/**
 * Send Pro request received confirmation
 */
export async function sendProRequestReceivedEmail(to: string, name?: string) {
  return sendEmail({
    to,
    subject: "We've received your Pro access request",
    react: ProRequestReceivedEmail({ name }),
  });
}

/**
 * Send Pro request approved notification
 */
export async function sendProRequestApprovedEmail(to: string, name?: string) {
  return sendEmail({
    to,
    subject: "Congratulations! Your Pro access has been approved 🎉",
    react: ProRequestApprovedEmail({ name }),
  });
}

/**
 * Send Pro request rejected notification
 */
export async function sendProRequestRejectedEmail(
  to: string,
  name?: string,
  reason?: string
) {
  return sendEmail({
    to,
    subject: "Update on your Pro access request",
    react: ProRequestRejectedEmail({ name, reason }),
  });
}
