// src/utils/generateJobReportEmail.ts
export function generateJobReportEmail(clientName: string, link: string) {
  return {
    subject: `🔎 Your Job Report is Ready - Precise Leak Detection`,
    html: `
      <div>… Hello ${clientName}! … <a href="${link}">View My Report</a> …</div>
    `,
  };
}
