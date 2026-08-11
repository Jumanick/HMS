import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { fetchAppointments } from '../api/appointments';
import { fetchInvoices } from '../api/billing';
import type { Appointment } from '../types/models';

export default function Dashboard() {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [unpaidCount, setUnpaidCount] = useState<number | null>(null);

  useEffect(() => {
    fetchAppointments()
      .then((data) => {
        const today = new Date().toDateString();
        setTodayAppointments(
          data.results.filter((a) => new Date(a.scheduled_at).toDateString() === today)
        );
      })
      .catch((err) => console.error('Failed to load appointments:', err));

    if (user?.role === 'admin' || user?.role === 'receptionist') {
      fetchInvoices()
        .then((data) => setUnpaidCount(data.results.filter((i) => i.status === 'unpaid').length))
        .catch((err) => console.error('Failed to load invoices:', err));
    }
  }, [user]);

  return (
    <Layout>
      <div className="p-8 max-w-4xl">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">
          Welcome, {user?.first_name}
        </h1>
        <p className="text-sm text-slate-500 mb-8">Here's what's happening today.</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Today's appointments" value={todayAppointments.length} />
          {unpaidCount !== null && <StatCard label="Unpaid invoices" value={unpaidCount} />}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Today's schedule</h2>
            <Link to="/appointments" className="text-xs text-emerald-700 hover:underline">
              View all →
            </Link>
          </div>
          {todayAppointments.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing scheduled for today.</p>
          ) : (
            <ul className="space-y-2">
              {todayAppointments.map((a) => (
                <li key={a.id} className="flex justify-between text-sm">
                  <span className="text-slate-700">{a.patient_name} — {a.doctor_name}</span>
                  <span className="text-slate-500">
                    {new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <p className="text-2xl font-semibold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}