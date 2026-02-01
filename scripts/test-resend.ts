/**
 * Test Resend Email Integration
 * Run with: npx tsx scripts/test-resend.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'dev@galaxyco.ai';
const TEST_EMAIL = process.argv[2] || 'dev@galaxyco.ai';

async function testResend() {
  console.log('Testing Resend Integration...\n');
  console.log('API Key:', RESEND_API_KEY ? `${RESEND_API_KEY.slice(0, 10)}...` : 'NOT SET');
  console.log('From Email:', FROM_EMAIL);
  console.log('Test Email:', TEST_EMAIL);
  console.log('');

  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not set in environment');
    process.exit(1);
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: `Results Roofing <${FROM_EMAIL}>`,
      to: TEST_EMAIL,
      subject: 'Test Email - Results Roofing Integration',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Resend Integration Working!</h1>
          </div>
          <p>This is a test email from Results Roofing.</p>
          <p>If you received this, the Resend integration is configured correctly.</p>
          <p style="color: #64748b; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      process.exit(1);
    }

    console.log('✅ Email sent successfully!');
    console.log('   ID:', data?.id);
    console.log('\nCheck your inbox at:', TEST_EMAIL);
  } catch (err) {
    console.error('❌ Exception:', err);
    process.exit(1);
  }
}

testResend();
