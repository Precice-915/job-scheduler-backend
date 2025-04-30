// src/utils/sendJobReport.ts
import { supabase } from '../lib/supabase';
import { generateJobReportEmail } from './generateJobReportEmail';
import { resend } from './resend'; // or call Resend in an Edge Fn

export async function sendJobReport(clientName: string, clientEmail: string, jobId: string) {
  // 🔑 1) generate the token
  const { data, error } = await supabase.functions.invoke('generateJobToken', {
    body: { jobId, clientEmail },
  });
  if (error || !data?.token) {
    console.error('Edge function error:', error);
    throw new Error('Failed to generate secure link');
  }

  const token = data.token as string;
  const link = `${import.meta.env.VITE_PUBLIC_SITE_URL}/job-report/${jobId}?token=${token}`;

  // 🔑 2) build the email
  const { subject, html } = generateJobReportEmail(clientName, link);

  // 🔑 3) send it
  const { error: sendError } = await resend.emails.send({
    from: 'Precise Leak Detection <noreply@preciseleakdetection.com>',
    to: clientEmail,
    subject,
    html,
  });
  if (sendError) {
    console.error('Resend error:', sendError);
    throw new Error('Failed to send email via Resend');
  }
}
