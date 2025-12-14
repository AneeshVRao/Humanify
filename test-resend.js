// Quick test to verify Resend API key works
import { Resend } from 'resend';
import dotenv from 'dotenv';

// Load environment variables
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

async function test() {
  console.log('Testing Resend API key...\n');

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.RESEND_TESTING_EMAIL,
      subject: 'Test Email from Humanify',
      html: '<p>If you receive this, Resend is working! ✅</p>'
    });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Success! Email sent with ID:', data.id);
    console.log('\nCheck your inbox (or spam) at:', process.env.RESEND_TESTING_EMAIL);
  } catch (err) {
    console.error('❌ Failed:', err);
  }
}

test();
