import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface FormData {
  jobId: string;
  clientEmail: string;
  clientName: string;
}

export default function Sandbox() {
  const [formData, setFormData] = useState<FormData>({
    jobId: '',
    clientEmail: '',
    clientName: '',
  });
  const [sending, setSending] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendJobReport = async () => {
    // Validate inputs
    if (!formData.jobId || !formData.clientEmail) {
      toast.error('Please provide both Job ID and Client Email');
      return;
    }

    setSending(true);
    try {
      const response = await fetch(
        'https://hccksbcfatkncqilccfq.supabase.co/functions/v1/generateJobToken',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: formData.jobId,
            clientEmail: formData.clientEmail,
            clientName: formData.clientName || undefined, // Omit if empty
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send job report');
      }

      toast.success('✅ Job report email sent!');
      // Reset form
      setFormData({ jobId: '', clientEmail: '', clientName: '' });
    } catch (error: any) {
      console.error('Error sending job report:', error);
      toast.error(`❌ ${error.message || 'Failed to send job report'}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sandbox Testing</h1>

      <div className="space-y-4">
        <Input
          label="Job ID"
          name="jobId"
          value={formData.jobId}
          onChange={handleInputChange}
          placeholder="e.g., a1b2c3d4-e5f6-4a3b-8c2d-1e2f3a4b5c6d"
          disabled={sending}
        />
        <Input
          label="Client Email"
          name="clientEmail"
          type="email"
          value={formData.clientEmail}
          onChange={handleInputChange}
          placeholder="e.g., client@example.com"
          disabled={sending}
        />
        <Input
          label="Client Name (Optional)"
          name="clientName"
          value={formData.clientName}
          onChange={handleInputChange}
          placeholder="e.g., John Doe"
          disabled={sending}
        />
        <Button variant="primary" onClick={handleSendJobReport} isLoading={sending} fullWidth>
          {sending ? 'Sending...' : '✉️ Send Job Report'}
        </Button>
      </div>
    </div>
  );
}
