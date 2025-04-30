// src/pages/invoices/InvoicesPage.tsx
import React, { useState, useEffect } from 'react';
import InvoiceList from '../../components/invoices/InvoiceList';
import { supabase } from '../../lib/supabase';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: invoicesData, error: invoiceError } = await supabase
          .from('invoices')
          .select(`*, total_charge, job:jobs(job_code, street_address, city, state, zip)`)
          .order('issued_at', { ascending: false });

        if (invoiceError) throw invoiceError;
        setInvoices(invoicesData || []);

        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select('invoice_id, amount_paid');

        if (paymentError) throw paymentError;

        const grouped: Record<string, number> = {};
        paymentData?.forEach(p => {
          grouped[p.invoice_id] = (grouped[p.invoice_id] || 0) + parseFloat(p.amount_paid);
        });

        setPayments(grouped);
      } catch (error) {
        console.error('Error fetching invoices or payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = invoices.filter(invoice => {
    const totalCharge = parseFloat(invoice.total_charge || 0);
    const totalPaid = payments[invoice.id] || 0;
    const balance = totalCharge - totalPaid;
    const isPaid = totalCharge > 0 && balance <= 0;

    const matchesSearch =
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.job?.job_code?.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'paid' && !isPaid) return false;
    if (statusFilter === 'pending' && isPaid) return false;

    return matchesSearch;
  });

  return (
    <InvoiceList
      invoices={filtered}
      payments={payments}
      loading={loading}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      statusFilter={statusFilter}
      onStatusChange={setStatusFilter}
    />
  );
}
