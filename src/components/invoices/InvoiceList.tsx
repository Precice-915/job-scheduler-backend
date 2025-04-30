// src/components/invoices/InvoiceList.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Card, CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import SendInvoiceButton from '../../components/invoices/SendInvoiceButton';

interface InvoiceListProps {
  invoices: any[];
  payments: Record<string, number>;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | 'paid' | 'pending';
  onStatusChange: (value: 'all' | 'paid' | 'pending') => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  payments,
  loading,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Invoices</h1>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={e => onStatusChange(e.target.value as 'all' | 'paid' | 'pending')}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader title="Search Invoices" />
        <CardContent>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by invoice number or job code..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoices...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No invoices found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issued Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map(invoice => {
                const totalPaid = payments[invoice.id] || 0;
                const isPaid = totalPaid >= parseFloat(invoice.total_charge);

                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{invoice.job?.job_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(invoice.total_charge)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(invoice.issued_at)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-2 justify-end">
                        <Link to={`/invoices/${invoice.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        <SendInvoiceButton invoiceId={invoice.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
