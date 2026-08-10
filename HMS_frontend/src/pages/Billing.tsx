import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { fetchInvoices, markInvoicePaid } from '../api/billing';
import type { Invoice, InvoiceStatus } from '../types/models';

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  unpaid: 'bg-amber-50 text-amber-700',
  paid: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

export default function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchInvoices();
      setInvoices(data.results);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleMarkPaid(id: string) {
    setUpdatingId(id);
    try {
      await markInvoicePaid(id);
      load();
    } finally {
      setUpdatingId(null);
    }
  }

  const totalOutstanding = invoices
    .filter((i) => i.status === 'unpaid')
    .reduce((sum, i) => sum + parseFloat(i.amount), 0);

  return (
    <Layout>
      <div className="p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-slate-800">Billing</h1>
          <p className="text-sm text-slate-500">
            Outstanding: <span className="font-medium text-slate-700">{totalOutstanding.toFixed(2)}</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5">Invoice</th>
                <th className="text-left px-4 py-2.5">Amount</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="text-left px-4 py-2.5">Created</th>
                <th className="text-left px-4 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No invoices yet.</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{inv.id.slice(0, 8)}</td>
                    <td className="px-4 py-2.5 text-slate-700 font-medium">{inv.amount}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5">
                      {inv.status === 'unpaid' && (
                        <button
                          onClick={() => handleMarkPaid(inv.id)}
                          disabled={updatingId === inv.id}
                          className="text-emerald-700 text-xs font-medium hover:underline disabled:opacity-50"
                        >
                          {updatingId === inv.id ? 'Saving...' : 'Mark as paid'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
