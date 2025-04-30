// Working Verions be cautious!
// src/components/invoices/SendInvoiceButton.tsx
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button'; // your styled button

interface SendInvoiceButtonProps {
  invoiceId: string;
}

const SendInvoiceButton: React.FC<SendInvoiceButtonProps> = ({ invoiceId }) => {
  const [isSending, setIsSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSendInvoice = async () => {
    setIsSending(true);
    try {
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!anonKey) {
        throw new Error('Missing Supabase anon key');
      }

      const res = await fetch('https://hccksbcfatkncqilccfq.supabase.co/functions/v1/sendInvoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ invoiceId }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to send invoice: ' + errorText);
      }

      toast.success('✅ Invoice sent successfully!');
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      toast.error(`❌ ${error.message || 'Failed to send invoice'}`);
    } finally {
      setIsSending(false);
      setConfirmOpen(false); // Close modal either way
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="secondary"
        fullWidth
        onClick={() => setConfirmOpen(true)}
        isLoading={isSending}
      >
        ✉️ Email Invoice
      </Button>

      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 space-y-4 text-center">
            <h2 className="text-lg font-semibold text-gray-800">Confirm Send Invoice</h2>
            <p className="text-gray-600 text-sm">
              You are about to send your client an invoice. Are you sure?
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Button variant="destructive" onClick={handleSendInvoice} isLoading={isSending}>
                Send
              </Button>
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendInvoiceButton;