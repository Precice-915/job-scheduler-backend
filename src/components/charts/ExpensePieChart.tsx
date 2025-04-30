// src/components/charts/ExpensePieChartChartJS.tsx
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { supabase } from '../../lib/supabase';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieData {
  name: string;
  value: number;
}

const COLORS = ['#4BC0C0', '#2563EB', '#3B82F6', '#FF6384'];

export default function ExpensePieChartChartJS() {
  const [data, setData] = useState<PieData[]>([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: COLORS,
      },
    ],
  });

  useEffect(() => {
    async function fetchExpenses() {
      const { data: rows } = await supabase.rpc('expense_breakdown_by_category');
      if (rows) {
        setData(rows);
        setChartData({
          labels: rows.map(item => item.name),
          datasets: [
            {
              data: rows.map(item => item.value),
              backgroundColor: COLORS.slice(0, rows.length), // Ensure enough colors
            },
          ],
        });
      }
    }
    fetchExpenses();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.formattedValue || '';
            return `${label}: $${value}`;
          },
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '250px' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
}