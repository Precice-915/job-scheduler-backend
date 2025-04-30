import React, { useState, lazy, Suspense } from 'react';
import { subMonths, format as formatDate, isBefore } from 'date-fns';
import AssignCategoriesModal from '../components/reports/AssignCategoriesModal';
import AssignCategoriesTable from '../components/reports/AssignCategoriesTable';

const RevenueCostBarChart = lazy(() => import('../components/charts/RevenueCostBarChart'));
const ExpenseCategoryPieChart = lazy(() => import('../components/charts/ExpenseCategoryPieChart'));

export default function ReportsPage() {
  const today = new Date();
  const defaultMonth = isBefore(today, new Date(today.getFullYear(), today.getMonth(), 3))
    ? subMonths(today, 1)
    : today;

  const [selectedMonth, setSelectedMonth] = useState(formatDate(defaultMonth, 'yyyy-MM'));
  const [viewType, setViewType] = useState<'month' | 'ytd'>('month');
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setViewType('month')}
            className={`px-4 py-1 rounded ${viewType === 'month' ? 'bg-blue-700 text-white' : 'border'}`}
          >
            By Month
          </button>
          <button
            onClick={() => setViewType('ytd')}
            className={`px-4 py-1 rounded ${viewType === 'ytd' ? 'bg-blue-700 text-white' : 'border'}`}
          >
            Year-to-Date
          </button>
        </div>
        <button
          onClick={() => setAssignModalOpen(true)}
          className="bg-blue-700 text-white px-4 py-1.5 rounded"
        >
          Assign Categories
        </button>
      </div>

      <Suspense fallback={<p>Loading charts…</p>}>
        <RevenueCostBarChart viewType={viewType} month={`${selectedMonth}-01`} />
        <div className="mt-10">
          <ExpenseCategoryPieChart viewType={viewType} month={`${selectedMonth}-01`} />
        </div>
        <div className="mt-10">
          <AssignCategoriesTable month={selectedMonth} />
        </div>
      </Suspense>

      <AssignCategoriesModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        month={selectedMonth}
      />
    </div>
  );
}