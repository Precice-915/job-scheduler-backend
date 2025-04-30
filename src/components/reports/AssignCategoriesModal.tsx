// src/components/reports/AssignCategoriesModal.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format, addMonths } from 'date-fns'; // Import addMonths

interface AssignCategoriesModalProps {
  open: boolean;
  onClose: () => void;
  month: string; // 'YYYY-MM'
}

interface Receipt {
  id: string;
  vendor: string;
  receipt_date: string;
  expense: number;
  notes: string | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

export default function AssignCategoriesModal({ open, onClose, month }: AssignCategoriesModalProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    async function fetchReceiptsAndCategories() {
      setLoading(true);
      try {
        const firstDayOfCurrentMonth = `${month}-01`;
        const firstDayOfNextMonth = format(addMonths(new Date(firstDayOfCurrentMonth), 1), 'yyyy-MM-dd');

        // Fetch receipts for that month
        const { data: receiptData, error: receiptError } = await supabase
          .from('receipts')
          .select('id, vendor, receipt_date, expense, notes, category_id')
          .gte('receipt_date', firstDayOfCurrentMonth)
          .lt('receipt_date', firstDayOfNextMonth);

        if (receiptError) {
          console.error('Error fetching receipts:', receiptError);
        } else {
          setReceipts(receiptData ?? []);
        }

        // Fetch all categories
        const { data: categoryData, error: categoryError } = await supabase
          .from('expense_categories')
          .select('id, name');

        if (categoryError) {
          console.error('Error fetching categories:', categoryError);
        } else {
          setCategories(categoryData ?? []);
        }
      } catch (err) {
        console.error('Unexpected error loading receipts/categories', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReceiptsAndCategories();
  }, [open, month]);

  const handleCategoryChange = async (receiptId: string, newCategoryId: string | null) => {
    // This function updates the local state when a category is selected
    setReceipts(prev =>
      prev.map(r => (r.id === receiptId ? { ...r, category_id: newCategoryId } : r))
    );
    // The actual database update happens immediately in the previous version.
    // We'll move that logic to the save function if you want to batch updates.
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // Create an array of promises to update each receipt's category
      const updatePromises = receipts.map(receipt =>
        supabase
          .from('receipts')
          .update({ category_id: receipt.category_id })
          .eq('id', receipt.id)
      );

      // Wait for all updates to complete
      const results = await Promise.allSettled(updatePromises);

      // Check for any errors during the updates
      const errors = results.filter(result => result.status === 'rejected');
      if (errors.length > 0) {
        console.error('Error(s) updating categories:', errors);
        // Optionally show an error toast or message to the user
      } else {
        // Optionally show a success toast or message
        onClose(); // Close the modal after successful save
      }
    } catch (error) {
      console.error('Unexpected error saving category changes:', error);
      // Optionally show an error toast or message
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex p-4 z-50 overflow-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-auto p-6 relative flex flex-col h-full max-h-screen">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4">Assign Categories</h2>

        {loading ? (
          <p>Loading receipts…</p>
        ) : receipts.length === 0 ? (
          <p className="text-gray-500">No receipts found for this month.</p>
        ) : (
          <div className="overflow-x-auto overflow-y-auto flex-grow">
            <table className="min-w-full border">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-2 border">Vendor</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Amount</th>
                  <th className="p-2 border">Category</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r, idx) => (
                  <tr key={r.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-2 border">{r.vendor}</td>
                    <td className="p-2 border">{format(new Date(r.receipt_date), 'MMM d,yyyy')}</td>
                    <td className="p-2 border">${Number(r.expense).toFixed(2)}</td>
                    <td className="p-2 border">
                      <select
                        className="border rounded p-1 w-full"
                        value={r.category_id ?? ''}
                        onChange={e =>
                          handleCategoryChange(r.id, e.target.value === '' ? null : e.target.value)
                        }
                      >
                        <option value="">Uncategorized</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges} // Call the save function here
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}