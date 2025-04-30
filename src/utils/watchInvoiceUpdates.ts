// src/utils/watchInvoiceUpdates.ts
import { updateInvoiceTotals } from './updateInvoiceTotals';

export async function watchInvoiceUpdates(job_id: string) {
  try {
    await updateInvoiceTotals(job_id);
  } catch (error) {
    console.error('Error updating invoice totals:', error);
  }
}
