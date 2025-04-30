// src/pages/invoices/InvoiceDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import InvoiceDetailCard from '../../components/invoices/InvoiceDetailCard';
import LoadingPage from '../LoadingPage';
import { ArrowLeft, Printer, Download } from 'lucide-react';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .select(
        `
        *,
        job:jobs(job_code, street_address, city, state, zip,
          client:clients(name, email, phone, billing_address)
        )
      `
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error loading invoice:', error);
    } else {
      setInvoice(data);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  if (loading) return <LoadingPage />;
  if (!invoice) {
    return <div className="p-6 text-center text-gray-500">Invoice not found.</div>;
  }

  const handlePrint = () => window.print();
  const handleDownload = () => window.print(); // stub for PDF export

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <Link
          to="/invoices"
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4 sm:mb-0"
        >
          <ArrowLeft className="mr-2" /> Back to Invoices
        </Link>

        <h1 className="text-2xl font-bold">{invoice.job.job_code}</h1>

        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 border rounded hover:bg-gray-100"
          >
            <Printer className="mr-2" /> Print
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 border rounded hover:bg-gray-100"
          >
            <Download className="mr-2" /> Download PDF
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details card (spans 2 columns) */}
        <div className="lg:col-span-2">
          <InvoiceDetailCard invoice={invoice} job={invoice.job} client={invoice.job.client} />
        </div>

        {/* Sidebar: Client Info & Add Payment */}
        <div className="space-y-6">
          {/* Client Information */}
          <div className="p-6 bg-white shadow rounded">
            <h2 className="text-lg font-medium mb-4">Client Information</h2>
            <p className="font-semibold">{invoice.job.client.name}</p>
            <p className="text-gray-700">{invoice.job.client.email}</p>
            <p className="text-gray-700">{invoice.job.client.phone}</p>
            <p className="text-gray-500 mt-4">Billing Address</p>
            <p className="font-medium">{invoice.job.client.billing_address}</p>
          </div>

          {/* Add Payment */}
          <div className="p-6 bg-white shadow rounded">
            <h2 className="text-lg font-medium mb-4">Add Payment</h2>
            <button className="w-full flex justify-center items-center py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              + Add Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
