import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingPage from '../LoadingPage';
import { formatDate, formatCurrency } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import InvoiceDetailCard from '../../components/invoices/InvoiceDetailCard';
import { updateInvoiceTotals } from '../../utils/updateInvoiceTotals';
import JobImagesGallery from '../../components/jobs/JobImagesGallery';
import JobImagesModal from '../../components/jobs/JobImagesModal';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Receipt {
  id: string;
  vendor: string;
  receipt_date: string;
  image_url: string | null;
  expense: number;
  notes: string | null;
}

interface Job {
  id: string;
  job_code: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  status: string | null;
  scheduled_at: string | null;
  description: string | null;
  notes: string | null;
  client: any;
  invoices: any[];
  receipts: Receipt[];
  trips_start: any[];
  trips_end: any[];
  trips: any[];
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReceipt, setShowAddReceipt] = useState(false);
  const [showReceipts, setShowReceipts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showTakeImage, setShowTakeImage] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [newReceipt, setNewReceipt] = useState<{
    vendor: string;
    receipt_date: string;
    total_amount: string;
    notes: string;
    image: File | null;
  }>({
    vendor: '',
    receipt_date: today,
    total_amount: '',
    notes: '',
    image: null,
  });

  const fetchJobDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data: jobData, error } = await supabase
      .from('jobs')
      .select(`
        *,
        client:clients(*),
        invoices(*),
        receipts(*),
        trips_start:trips!trips_job_id_start_fkey(id, depart_timestamp, arrive_timestamp, distance_miles, duration_minutes, notes),
        trips_end:trips!trips_job_id_end_fkey(id, depart_timestamp, arrive_timestamp, distance_miles, duration_minutes, notes)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      toast.error('Failed to fetch job details.');
      setLoading(false);
      return;
    }

    const tripsCombined = [...(jobData?.trips_start || []), ...(jobData?.trips_end || [])];
    setJob({ ...jobData, trips: tripsCombined } as Job);
    setReceipts(jobData?.receipts || []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  useEffect(() => {
    if (job?.id) {
      updateInvoiceTotals(job.id);
    }
  }, [job?.id]);

  const handleAddReceipt = async () => {
    if (!id) return;
    setIsSubmitting(true);

    let imageUrl: string | null = null;
    if (newReceipt.image) {
      const file = newReceipt.image;
      const path = `${id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadError) {
        toast.error('Failed to upload receipt image');
        setIsSubmitting(false);
        return;
      }
      const { data } = supabase.storage.from('receipt-images').getPublicUrl(path);
      imageUrl = data.publicUrl;
    }

    const { data, error } = await supabase
      .from('receipts')
      .insert({
        job_id: id,
        vendor: newReceipt.vendor,
        receipt_date: newReceipt.receipt_date,
        expense: parseFloat(newReceipt.total_amount),
        notes: newReceipt.notes || null,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add receipt');
    } else {
      setReceipts(prev => [...prev, data]);
      setShowAddReceipt(false);
      setNewReceipt({ vendor: '', receipt_date: today, total_amount: '', notes: '', image: null });
      toast.success('Receipt added');
      await updateInvoiceTotals(id);
      fetchJobDetails();
    }

    setIsSubmitting(false);
  };

  const handleCreateInvoice = async () => {
    if (!job) return;
    setCreatingInvoice(true);

    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + 30);

    const payload = {
      job_id: job.id,
      invoice_number: `INV-${job.job_code || Math.floor(Math.random() * 10000)}`,
      total_charge: 0,
      total_paid: 0,
      line_items: [] as any[],
      issued_at: now.toISOString(),
      due_at: due.toISOString(),
      paid_at: null,
      payment_method: null,
      payment_link: null,
      cashtag_qr_url: null,
      stripe_session_id: null,
      notes: `Auto-generated invoice for Job ${job.job_code}`,
    };

    const { data, error } = await supabase.from('invoices').insert(payload).select().single();
    if (error) {
      console.error('Create invoice error:', error);
      toast.error('Failed to create invoice');
    } else {
      toast.success(`Invoice ${payload.invoice_number} created!`);
      await updateInvoiceTotals(job.id);
      fetchJobDetails();
    }

    setCreatingInvoice(false);
  };

  const handlePaymentAdded = useCallback(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  if (loading) return <LoadingPage />;
  if (!job) return <div className="p-4 sm:p-6">Job not found.</div>;

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="border border-yellow-300 bg-yellow-100 p-3 rounded text-xs sm:text-sm text-yellow-800">
        Note: Click "Add Receipt" to both reveal the form and add a new receipt to this job.
        Receipt amount must be a number — no symbols. Click Create Invoice to log payments.
      </div>

      {showGallery && <JobImagesGallery jobId={job.id} onClose={() => setShowGallery(false)} />}
      {showTakeImage && <JobImagesModal onClose={() => setShowTakeImage(false)} />}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Job Details</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowGallery(true)} size="sm" className="w	placeholder w-full sm:w-auto">
            View Images
          </Button>
          <Button variant="outline" onClick={() => setShowTakeImage(true)} size="sm" className="w-full sm:w-auto">
            Take Images
          </Button>
          <Button onClick={handleCreateInvoice} isLoading={creatingInvoice} size="sm" className="w-full sm:w-auto">
            Create Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader
          title={`Job Code: ${job.job_code}`}
          subtitle={`Client: ${job.client?.name || 'N/A'}`}
        />
        <CardContent className="space-y-2 text-sm sm:text-base">
          <p>
            <strong>Address:</strong> {job.street_address}, {job.city}, {job.state} {job.zip}
          </p>
          <p>
            <strong>Status:</strong> {job.status}
          </p>
          <p>
            <strong>Scheduled At:</strong> {job.scheduled_at ? formatDate(job.scheduled_at) : 'Not Scheduled'}
          </p>
          <p>
            <strong>Description:</strong> {job.description || 'No description provided.'}
          </p>
          <p>
            <strong>Notes:</strong> {job.notes || '—'}
          </p>
        </CardContent>
      </Card>

      {job.invoices?.length > 0 ? (
        <InvoiceDetailCard
          invoice={job.invoices[0]}
          job={job}
          client={job.client}
          onPaymentAdded={handlePaymentAdded}
        />
      ) : (
        <div className="text-center py-4 text-sm sm:text-base text-gray-600">
          No invoice created for this job yet.
        </div>
      )}

      <Card>
        <CardHeader
          title="Receipts (Expenses)"
          subtitle={`${receipts.length} recorded`}
          action={
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowAddReceipt(prev => !prev);
                  setShowReceipts(true);
                }}
                className="w-full sm:w-auto"
              >
                {showAddReceipt ? 'Cancel' : 'Add Receipt'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowReceipts(!showReceipts)} className="w-full sm:w-auto">
                {showReceipts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            </div>
          }
        />

        {showReceipts && (
          <CardContent className="space-y-4">
            {receipts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">No expenses logged for this job yet.</p>
            ) : (
              receipts.map(r => (
                <div key={r.id} className="border p-3 rounded-md space-y-2">
                  <p className="font-medium text-sm sm:text-base">{r.vendor} — {formatCurrency(r.expense)}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Date: {formatDate(r.receipt_date)}</p>
                  {r.notes && <p className="text-xs sm:text-sm text-gray-500">{r.notes}</p>}
                  {r.image_url && (
                    <img src={r.image_url} alt="receipt" className="mt-2 w-full max-h-32 sm:max-h-40 object-contain" />
                  )}
                </div>
              ))
            )}

            {showAddReceipt && (
              <div className="border-t pt-4 space-y-4">
                <Input
                  label="Vendor"
                  name="vendor"
                  value={newReceipt.vendor}
                  onChange={e => setNewReceipt({ ...newReceipt, vendor: e.target.value })}
                  className="text-sm"
                />
                <Input
                  label="Receipt Date"
                  type="date"
                  name="receipt_date"
                  value={newReceipt.receipt_date}
                  onChange={e => setNewReceipt({ ...newReceipt, receipt_date: e.target.value })}
                  className="text-sm"
                />
                <Input
                  label="Total Amount"
                  type="number"
                  name="total_amount"
                  inputMode="decimal"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  value={newReceipt.total_amount}
                  onChange={e => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    setNewReceipt({ ...newReceipt, total_amount: value });
                  }}
                  className="text-sm"
                />
                <Input
                  label="Notes"
                  name="notes"
                  value={newReceipt.notes}
                  onChange={e => setNewReceipt({ ...newReceipt, notes: e.target.value })}
                  className="text-sm"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Receipt Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0] ?? null;
                      setNewReceipt({ ...newReceipt, image: file });
                    }}
                    className="mt-1 block w-full text-sm"
                  />
                </div>
                <Button
                  onClick={handleAddReceipt}
                  variant="primary"
                  isLoading={isSubmitting}
                  fullWidth
                  className="text-sm"
                >
                  Save Receipt
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}