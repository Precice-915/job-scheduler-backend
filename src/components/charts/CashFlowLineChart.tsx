import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';

interface CFData {
  month: string;
  cashflow: number;
}

export default function CashFlowLineChart() {
  const [data, setData] = useState<CFData[]>([]);

  useEffect(() => {
    async function fetch() {
      const { data: rows } = await supabase.rpc('monthly_cashflow');
      setData(
        (rows || []).map(r => ({
          month: format(new Date(r.month as any), 'MMM yyyy'),
          cashflow: r.cashflow,
        }))
      );
    }
    fetch();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(val: any) => `$${val.toLocaleString()}`} />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="cashflow" stroke="#1E40AF" />
      </LineChart>
    </ResponsiveContainer>
  );
}
