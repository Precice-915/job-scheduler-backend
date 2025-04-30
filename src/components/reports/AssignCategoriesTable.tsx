import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { format, addMonths } from 'date-fns';
import { ArrowUpDown, SortAsc, SortDesc } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AssignCategoriesTableProps {
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

export default function AssignCategoriesTable({ month }: AssignCategoriesTableProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const originalReceiptsRef = useRef<Receipt[]>([]);

  useEffect(() => {
    async function fetchReceiptsAndCategories() {
      setLoading(true);
      try {
        const firstDayOfCurrentMonth = `${month}-01`;
        const firstDayOfNextMonth = format(addMonths(new Date(firstDayOfCurrentMonth), 1), 'yyyy-MM-dd');

        const { data: receiptData, error: receiptError } = await supabase
          .from('receipts')
          .select('id, vendor, receipt_date, expense, notes, category_id')
          .gte('receipt_date', firstDayOfCurrentMonth)
          .lt('receipt_date', firstDayOfNextMonth);

        if (receiptError) {
          console.error('Error fetching receipts:', receiptError);
        } else {
          setReceipts(receiptData ?? []);
          originalReceiptsRef.current = receiptData ?? [];
        }

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
  }, [month]);

  const handleCategoryChange = async (receiptId: string, newCategoryId: string | null) => {
    setReceipts(prev =>
      prev.map(r => (r.id === receiptId ? { ...r, category_id: newCategoryId } : r))
    );
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const updates = receipts.filter(r => {
        const original = originalReceiptsRef.current.find(o => o.id === r.id);
        return original && r.category_id !== original.category_id;
      });

      if (updates.length === 0) {
        toast('No changes to save');
        setLoading(false);
        return;
      }

      const updatePromises = updates.map(receipt =>
        supabase
          .from('receipts')
          .update({ category_id: receipt.category_id })
          .eq('id', receipt.id)
      );

      const results = await Promise.allSettled(updatePromises);

      const errors = results.filter(result => result.status === 'rejected');
      if (errors.length > 0) {
        console.error('Error(s) updating categories:', errors);
        toast.error('Some updates failed');
      } else {
        toast.success('Changes saved');
        originalReceiptsRef.current = [...receipts];
      }
    } catch (error) {
      console.error('Unexpected error saving category changes:', error);
      toast.error('Error saving changes');
    } finally {
      setLoading(false);
    }
  };

  const handleSortByDate = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);

    setReceipts(prev =>
      [...prev].sort((a, b) => {
        const dateA = new Date(a.receipt_date);
        const dateB = new Date(b.receipt_date);
        return newDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      })
    );
  };

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Assign Categories</h2>
        <button
          onClick={handleSaveChanges}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {loading ? (
        <p>Loading receipts…</p>
      ) : receipts.length === 0 ? (
        <p className="text-gray-500">No receipts found for this month.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border text-left">Vendor</th>
                <th className="p-2 border text-left cursor-pointer" onClick={handleSortByDate}>
                  Date
                  <span className="ml-1 inline-block">
                    {sortDirection === 'asc' ? (
                      <SortAsc size={16} />
                    ) : sortDirection === 'desc' ? (
                      <SortDesc size={16} />
                    ) : (
                      <ArrowUpDown size={16} />
                    )}
                  </span>
                </th>
                <th className="p-2 border text-left">Amount</th>
                <th className="p-2 border text-left">Category</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r, idx) => (
                <tr key={r.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-2 border">{r.vendor}</td>
                  <td className="p-2 border">{format(new Date(r.receipt_date), 'MMM d, yyyy')}</td>
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
    </div>
  );
}
