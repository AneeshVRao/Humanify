/**
 * Resend Email Client Configuration
 */

import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email functionality will be disabled.');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
export const emailConfig = {
  from: process.env.EMAIL_FROM || 'Humanify <noreply@humanify.app>',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@humanify.app',
};
