// src/components/charts/ExpenseCategoryPieChart.tsx
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const COLORS = [
  'rgba(255, 99, 132, 0.6)',   // Parts/Supplies - pink
  'rgb(59, 130, 246)',         // Blue (unchanged)
  'rgba(75, 192, 192, 0.6)',   // Labor/Cost - teal
  'rgba(251, 191, 36, 0.6)',   // Yellow (#FBBF24)
  'rgba(167, 139, 250, 0.6)',  // Purple (#A78BFA)
  'rgba(56, 189, 248, 0.6)',   // Light blue (#38BDF8)
  'rgba(244, 114, 182, 0.6)',  // Pink (#F472B6)
  'rgb(59, 130, 246, .6)',         // Sky blue (unchanged again)
  'rgba(192, 132, 252, 0.6)',  // Light purple (#C084FC)
  'rgba(252, 211, 77, 0.6)',   // Lighter yellow (#FCD34D)
];

interface ExpenseCategoryPieChartProps {
  viewType: 'month' | 'ytd';
  month: string;
}

export default function ExpenseCategoryPieChart({ viewType, month }: ExpenseCategoryPieChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      let query;
      if (viewType === 'month') {
        query = supabase.rpc('expense_category_breakdown_for_month', {
          target_month: month,
        });
      } else {
        query = supabase.rpc('expense_category_breakdown_ytd');
      }

      const { data: pieData, error } = await query;
      if (error) {
        console.error('Error fetching pie chart data', error);
        toast.error('Failed to load pie chart data');
      } else if (pieData) {
        setData(pieData);
      }
    } catch (err) {
      console.error('Unexpected error loading pie chart', err);
      toast.error('Unexpected pie chart load error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();

    // Subscribe to changes in the receipts table
    const realtimeSubscription = supabase
      .channel('receipts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'receipts' }, (payload) => {
        console.log('Change received!', payload);
        // Re-fetch data when any change occurs in the receipts table
        fetchData();
      })
      .subscribe();

    // Unsubscribe when the component unmounts to prevent memory leaks
    return () => {
      realtimeSubscription.unsubscribe();
    };
  }, [viewType, month]);

  if (loading) return <p>Loading Category Breakdown…</p>;

  return (
    <div className="mt-6">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total_expense"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
          <Legend layout="horizontal" verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}