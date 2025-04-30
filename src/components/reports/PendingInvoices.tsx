import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ClipboardList, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Invoice {
  id: string;
  invoice_number: string;
  total_charge: number;
  total_paid: number;
  due_at: string | null;
}

export default function PendingInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, invoice_number, total_charge, total_paid, due_at')
        .is('paid_at', null)
        .order('due_at', { ascending: true });

      if (error) console.error('Failed to load invoices:', error);
      else setInvoices(data || []);

      setLoading(false);
    }

    fetchInvoices();
  }, []);

  const renderDueStatus = (dueAt: string | null) => {
    if (!dueAt) return 'No due date';
    const dueDate = new Date(dueAt);
    const now = new Date();
    const isPast = dueDate < now;
    const diff = formatDistanceToNow(dueDate, { addSuffix: true });
    return isPast ? `Overdue by ${diff.replace(' ago', '')}` : `Due ${diff}`;
  };

  return (
    <Card>
      <CardHeader
        title="Pending Invoices"
        subtitle={`${invoices.length} unpaid invoices`}
        action={
          <Link to="/invoices">
            <Button variant="ghost" size="sm" icon={<ArrowRight size={16} />}>
              View All
            </Button>
          </Link>
        }
      />
      <CardContent>
        {loading ? (
          <p className="text-sm text-gray-500">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-gray-500">No unpaid invoices</p>
        ) : (
          <div className="space-y-4">
            {invoices.map(inv => (
  <div
    key={inv.id}
    className="flex items-start gap-3 py-2 border-b border-gray-100"
  >
    <div className="bg-pink-100 p-2 rounded-full">
      <ClipboardList className="h-5 w-5 text-pink-500" />
    </div>
    <div className="flex-1">
      <p className="font-medium">Invoice #{inv.invoice_number}</p>
      <p className="text-sm text-gray-500">{renderDueStatus(inv.due_at)}</p>
    </div>
    <div className="text-right">
      <p className="font-medium">{formatCurrency(inv.total_charge)}</p>
    </div>
  </div>
))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}