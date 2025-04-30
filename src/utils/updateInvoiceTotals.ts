// src/utils/updateInvoiceTotals.ts
import { supabase } from '../lib/supabase';

export async function updateInvoiceTotals(job_id: string) {
  console.log(`Updating totals for job ID: ${job_id}`);

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id, line_items, total_charge, total_paid')
    .eq('job_id', job_id)
    .maybeSingle();

  if (invoiceError || !invoice) {
    console.error('Invoice not found or error:', invoiceError);
    return;
  }

  const { data: receipts, error: receiptError } = await supabase
    .from('receipts')
    .select('vendor, expense')
    .eq('job_id', job_id);

  if (receiptError) {
    console.error('Error fetching receipts:', receiptError);
    return;
  }

  const line_items = receipts.map(r => ({
    description: r.vendor,
    amount: r.expense,
  }));

  const total_charge = line_items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const { data: payments, error: paymentError } = await supabase
    .from('payments')
    .select('amount_paid')
    .eq('invoice_id', invoice.id);

  if (paymentError) {
    console.error('Error fetching payments:', paymentError);
    return;
  }

  const total_paid = payments.reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0);

  console.log('Calculated values:', { line_items, total_charge, total_paid });

  const { error: updateError } = await supabase
    .from('invoices')
    .update({
      line_items: JSON.stringify(line_items), // <--- MISSING PIECE ADDED HERE!
      total_charge,
      total_paid,
    })
    .eq('id', invoice.id);

  if (updateError) {
    console.error('Error updating invoice:', updateError);
  } else {
    console.log('Invoice updated successfully!');
  }
}
