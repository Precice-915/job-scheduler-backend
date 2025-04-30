import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import enUSLocale from 'date-fns/locale/en-US';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface RevenueCostBarChartProps {
  viewType: 'month' | 'ytd';
  month: string; // format: YYYY-MM
}

export default function RevenueCostBarChartChartJS({ viewType, month }: RevenueCostBarChartProps) {
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: 'Revenue',
        data: [] as number[],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Cost',
        data: [] as number[],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Profit',
        data: [] as number[],
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue
      },
    ],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let labels: string[] = [];
        let revenueData: number[] = [];
        let costData: number[] = [];
        let profitData: number[] = [];

        if (viewType === 'month') {
          const { data: singleMonth, error } = await supabase.rpc('monthly_revenue_cost_for_month', {
            target_month: month,
          });

          if (error) {
            console.error('Error fetching month data', error);
            toast.error('Error loading month chart');
          } else if (singleMonth && singleMonth.length > 0) {
            const rawMonthFromDB = singleMonth[0]?.month;
            const dateObject = parseISO(rawMonthFromDB);
            const formattedMonth = format(dateObject, 'MMM yyyy', { locale: enUSLocale });

            const revenue = parseFloat(singleMonth[0]?.revenue || 0);
            const cost = parseFloat(singleMonth[0]?.cost || 0);
            const profit = revenue - cost;

            labels.push(formattedMonth);
            revenueData.push(revenue);
            costData.push(cost);
            profitData.push(profit);
          }
        } else {
          const { data: ytdData, error } = await supabase.rpc('monthly_revenue_cost_ytd_full');

          if (error) {
            console.error('Error fetching YTD data', error);
            toast.error('Error loading YTD chart');
          } else if (ytdData) {
            ytdData.forEach((item: any) => {
              const date = parseISO(item.month);
const monthLabel = format(date, 'MMM', { locale: enUSLocale });
              const revenue = parseFloat(item.revenue || 0);
              const cost = parseFloat(item.cost || 0);
              const profit = revenue - cost;

              labels.push(monthLabel);
              revenueData.push(revenue);
              costData.push(cost);
              profitData.push(profit);
            });
          }
        }

        setChartData({
          labels,
          datasets: [
            {
              label: 'Revenue',
              data: revenueData,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
              label: 'Cost',
              data: costData,
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
            {
              label: 'Profit',
              data: profitData,
              backgroundColor: 'rgba(59, 130, 246, 0.6)',
            },
          ],
        });
      } catch (err) {
        console.error('Unexpected error fetching chart data', err);
        toast.error('Failed to load chart');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [viewType, month]);

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Revenue, Cost, and Profit',
      },
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Month',
        },
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Amount ($)',
        },
      },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += `$${context.parsed.y.toLocaleString()}`;
          }
          return label;
        },
      },
    },
  };

  if (loading) return <p>Loading Revenue/Cost Chart…</p>;

  return (
    <div className="mt-6 w-full flex justify-center" style={{ width: '100%', height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}