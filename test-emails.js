/**
 * Email Notification Test Script
 *
 * This script tests all email templates to ensure they're working correctly.
 * Run with: node test-emails.js
 */

// Load environment variables
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.RESEND_API_KEY) {
  console.error('❌ Error: RESEND_API_KEY not found in .env.local');
  process.exit(1);
}

if (!process.env.RESEND_TESTING_EMAIL) {
  console.error('❌ Error: RESEND_TESTING_EMAIL not found in .env.local');
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);
const testEmail = process.env.RESEND_TESTING_EMAIL;
const testName = 'Test User';
const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

async function testEmails() {
  console.log('🧪 Testing Email Notifications...\n');

  try {
    // Test 1: Pro Request Received Email
    console.log('📧 Test 1: Sending Pro Request Received email...');
    const { data: data1, error: error1 } = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: "We've received your Pro access request",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${testName || 'there'}!</h2>
          <p>We've received your request for Pro access to Humanify.</p>
          <p>Our team will review your request and get back to you shortly.</p>
          <p>Thank you for your interest in Humanify Pro!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is a test email from Humanify</p>
        </div>
      `
    });

    if (error1) {
      console.log('❌ Failed to send Pro Request Received email');
      console.log(`   Error: ${error1.message}\n`);
    } else {
      console.log('✅ Pro Request Received email sent successfully!');
      console.log(`   Email ID: ${data1.id}\n`);
    }

    // Wait 2 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Pro Request Approved Email
    console.log('📧 Test 2: Sending Pro Request Approved email...');
    const { data: data2, error: error2 } = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: 'Congratulations! Your Pro access has been approved 🎉',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🎉 Congratulations, ${testName || 'there'}!</h2>
          <p>Great news! Your request for Humanify Pro has been approved.</p>
          <p>You now have access to all Pro features including:</p>
          <ul>
            <li>Unlimited humanizations</li>
            <li>Priority processing</li>
            <li>Advanced tone options</li>
            <li>API access</li>
          </ul>
          <p>Start using your Pro features now at <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://humanify.app'}">${process.env.NEXT_PUBLIC_APP_URL || 'https://humanify.app'}</a></p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is a test email from Humanify</p>
        </div>
      `
    });

    if (error2) {
      console.log('❌ Failed to send Pro Request Approved email');
      console.log(`   Error: ${error2.message}\n`);
    } else {
      console.log('✅ Pro Request Approved email sent successfully!');
      console.log(`   Email ID: ${data2.id}\n`);
    }

    // Wait 2 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Pro Request Rejected Email
    console.log('📧 Test 3: Sending Pro Request Rejected email...');
    const { data: data3, error: error3 } = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: 'Update on your Pro access request',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${testName || 'there'},</h2>
          <p>Thank you for your interest in Humanify Pro.</p>
          <p>Unfortunately, we're unable to approve your Pro access request at this time.</p>
          <p><strong>Reason:</strong> This is a test rejection. Your actual request was not rejected.</p>
          <p>If you have any questions or would like to reapply in the future, please don't hesitate to reach out.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is a test email from Humanify</p>
        </div>
      `
    });

    if (error3) {
      console.log('❌ Failed to send Pro Request Rejected email');
      console.log(`   Error: ${error3.message}\n`);
    } else {
      console.log('✅ Pro Request Rejected email sent successfully!');
      console.log(`   Email ID: ${data3.id}\n`);
    }

    console.log('✨ Email testing complete!');
    console.log('📬 Check your inbox at:', testEmail);

  } catch (error) {
    console.error('💥 Error during email testing:', error);
  }
}

// Run the tests
testEmails();
