// src/components/invoices/InvoiceDetailCard.tsx
import React, { useEffect, useState } from 'react';
import { formatCurrency, formatDate, formatAddress } from '../../lib/utils';
import { Card, CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { watchInvoiceUpdates } from '../../utils/watchInvoiceUpdates';
import SendInvoiceButton from '../../components/invoices/SendInvoiceButton';

interface InvoiceDetailCardProps {
  invoice: any;
  job: any;
}

const InvoiceDetailCard: React.FC<InvoiceDetailCardProps> = ({ invoice, job }) => {
  const totalCharge = parseFloat(invoice.total_charge || 0);
  const totalPaid = parseFloat(invoice.total_paid || 0);
  const balance = totalCharge - totalPaid;
  const isPaid = totalCharge > 0 && balance <= 0;

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const [lineItems, setLineItems] = useState<{ vendor: string; expense: number; notes?: string }[]>(
    []
  );
  const [loadingItems, setLoadingItems] = useState(true);
  const [collapsed, setCollapsed] = useState(true); // 👉 now ONLY controls Line Items

  useEffect(() => {
    const fetchLineItems = async () => {
      if (!invoice?.job_id) return;
      const { data: receipts, error } = await supabase
        .from('receipts')
        .select('vendor, expense, notes')
        .eq('job_id', invoice.job_id);
      if (error) {
        console.error('Receipts fetch error:', error.message);
      } else {
        setLineItems(receipts || []);
      }
      setLoadingItems(false);
    };

    fetchLineItems();
  }, [invoice?.job_id]);

  const handleAddPayment = async () => {
    if (!invoice) return;
    setIsSubmittingPayment(true);

    const { error } = await supabase.from('payments').insert({
      invoice_id: invoice.id,
      amount_paid: parseFloat(paymentAmount),
      paid_at: paymentDate,
      payment_method: paymentMethod,
    });

    if (error) {
      toast.error('Failed to add payment');
    } else {
      toast.success('Payment added');
      await watchInvoiceUpdates(job.id);
      window.location.reload();
    }

    setIsSubmittingPayment(false);
    setShowAddPayment(false);
    setPaymentAmount('');
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod('Cash');
  };

  return (
    <Card>
      <CardHeader
        title={`Invoice ${invoice.invoice_number}`}
        subtitle={`Client: ${job?.client?.name || 'N/A'}`}
      />
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          {/* Invoice Summary */}
          <p>
            <strong>Invoice Date:</strong> {formatDate(invoice.issued_at)}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={`font-semibold ${isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
              {isPaid ? 'Paid' : 'Pending'}
            </span>
          </p>
          <p>
            <strong>Total Charge:</strong> {formatCurrency(totalCharge)}
          </p>
          <p>
            <strong>Total Paid:</strong> {formatCurrency(totalPaid)}
          </p>
          <p>
            <strong>Balance:</strong> {formatCurrency(balance)}
          </p>
          <p>
            <strong>Job Address:</strong>{' '}
            {job
              ? formatAddress(job.street_address, job.city, job.state, job.zip)
              : 'Address unavailable'}
          </p>

          {/* Line Items Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Line Items</h3>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-gray-600 hover:text-gray-900"
              >
                {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
            </div>

            {!collapsed && (
              <>
                {loadingItems ? (
                  <p className="text-sm text-gray-500">Loading line items...</p>
                ) : lineItems.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {lineItems.map((item, idx) => (
                      <li key={idx} className="flex flex-col text-sm border-b pb-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{item.vendor}</span>
                          <span>{formatCurrency(item.expense)}</span>
                        </div>
                        {item.notes && (
                          <div className="text-gray-500 text-xs mt-1">{item.notes}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No line items found.</p>
                )}
              </>
            )}
          </div>

          {/* Payment Section */}
          <div className="mt-6">
            <Button
              size="sm"
              icon={<Plus size={16} />}
              fullWidth
              onClick={() => setShowAddPayment(!showAddPayment)}
            >
              {showAddPayment ? 'Cancel' : 'Add Payment'}
            </Button>

            {showAddPayment && (
              <div className="space-y-2 mt-4">
                <Input
                  label="Amount"
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                />
                <Input
                  label="Payment Date"
                  type="date"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                />
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Credit">Credit</option>
                  <option value="Other">Other</option>
                </select>
                <Button onClick={handleAddPayment} isLoading={isSubmittingPayment} fullWidth>
                  Save Payment
                </Button>
              </div>
            )}
          </div>

          {/* Send Invoice */}
          <div className="mt-6">
            <SendInvoiceButton invoiceId={invoice.id} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceDetailCard;
