// src/emails/JobReportEmail.tsx
import { generateJobReportLink } from '../utils/generateJobReportLink';

interface JobReportEmailProps {
  clientName: string;
  jobId: string;
}

export function JobReportEmail({ clientName, jobId }: JobReportEmailProps) {
  const reportLink = generateJobReportLink(jobId);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f9f9f9' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img
          src="https://preciseleakdetection.com/wp-content/uploads/2024/08/precise.svg"
          alt="Precise Leak Detection Logo"
          style={{ width: '150px', height: 'auto' }}
        />
      </div>

      {/* Email Content */}
      <div
        style={{
          background: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <h2 style={{ color: '#333' }}>Hello {clientName},</h2>
        <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.6' }}>
          Your service report is ready! You can view your job details, photos, and notes securely by
          clicking the button below:
        </p>

        {/* View Report Button */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <a
            href={reportLink}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#005E7A',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            View Your Job Report
          </a>
        </div>

        <p style={{ marginTop: '30px', fontSize: '14px', color: '#888', textAlign: 'center' }}>
          Thank you for choosing Precise Leak Detection!
        </p>
      </div>
    </div>
  );
}
