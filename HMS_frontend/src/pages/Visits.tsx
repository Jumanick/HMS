import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { fetchVisits, addPrescription, billVisit } from '../api/emr';
import type { Visit } from '../types/models';

export default function Visits() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(highlightId);

  const [rxForm, setRxForm] = useState({ medication_name: '', dosage: '', frequency: '', duration: '', notes: '' });
  const [billAmount, setBillAmount] = useState('');
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchVisits();
      setVisits(data.results);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddPrescription(e: FormEvent, visitId: string) {
    e.preventDefault();
    setActionError('');
    try {
      await addPrescription(visitId, rxForm);
      setRxForm({ medication_name: '', dosage: '', frequency: '', duration: '', notes: '' });
      load();
    } catch {
      setActionError('Could not add prescription — check all fields are filled in.');
    }
  }

  async function handleBill(visitId: string) {
    setActionError('');
    if (!billAmount) {
      setActionError('Enter an amount before billing.');
      return;
    }
    try {
      await billVisit(visitId, billAmount);
      setBillAmount('');
      alert('Invoice created — find it under Billing.');
    } catch {
      setActionError('Could not create invoice. This visit may already be billed.');
    }
  }

  return (
    <Layout>
      <div className="p-8 max-w-4xl">
        <h1 className="text-xl font-semibold text-slate-800 mb-6">Visits &amp; EMR</h1>

        {actionError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">
            {actionError}
          </p>
        )}

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : visits.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No visits yet — complete an appointment from the Appointments page to create one.
          </p>
        ) : (
          <div className="space-y-3">
            {visits.map((v) => {
              const isOpen = expandedId === v.id;
              return (
                <div
                  key={v.id}
                  className={`bg-white border rounded-lg overflow-hidden ${
                    v.id === highlightId ? 'border-emerald-400 ring-1 ring-emerald-200' : 'border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => setExpandedId(isOpen ? null : v.id)}
                    className="w-full flex items-center justify-between px-5 py-3 text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Visit — {new Date(v.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500">{v.diagnosis || 'No diagnosis recorded'}</p>
                    </div>
                    <span className="text-xs text-slate-400">{v.prescriptions.length} prescription(s)</span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 px-5 py-4">
                      <p className="text-xs font-medium text-slate-500 mb-1">Notes</p>
                      <p className="text-sm text-slate-700 mb-4">{v.notes || '—'}</p>

                      <p className="text-xs font-medium text-slate-500 mb-2">Prescriptions</p>
                      {v.prescriptions.length === 0 ? (
                        <p className="text-sm text-slate-400 mb-4">None yet.</p>
                      ) : (
                        <ul className="mb-4 space-y-1">
                          {v.prescriptions.map((rx) => (
                            <li key={rx.id} className="text-sm text-slate-700">
                              {rx.medication_name} — {rx.dosage}, {rx.frequency}, {rx.duration}
                            </li>
                          ))}
                        </ul>
                      )}

                      {user?.role === 'doctor' && (
                        <form
                          onSubmit={(e) => handleAddPrescription(e, v.id)}
                          className="grid grid-cols-2 gap-2 bg-slate-50 rounded p-3 mb-4"
                        >
                          <input
                            className="input"
                            placeholder="Medication name"
                            value={rxForm.medication_name}
                            onChange={(e) => setRxForm({ ...rxForm, medication_name: e.target.value })}
                            required
                          />
                          <input
                            className="input"
                            placeholder="Dosage (e.g. 500mg)"
                            value={rxForm.dosage}
                            onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })}
                            required
                          />
                          <input
                            className="input"
                            placeholder="Frequency (e.g. 2x/day)"
                            value={rxForm.frequency}
                            onChange={(e) => setRxForm({ ...rxForm, frequency: e.target.value })}
                            required
                          />
                          <input
                            className="input"
                            placeholder="Duration (e.g. 7 days)"
                            value={rxForm.duration}
                            onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })}
                            required
                          />
                          <button
                            type="submit"
                            className="col-span-2 bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-emerald-800 justify-self-start"
                          >
                            + Add prescription
                          </button>
                        </form>
                      )}

                      {(user?.role === 'admin' || user?.role === 'receptionist') && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <input
                            className="input max-w-[140px]"
                            placeholder="Amount"
                            type="number"
                            step="0.01"
                            value={billAmount}
                            onChange={(e) => setBillAmount(e.target.value)}
                          />
                          <button
                            onClick={() => handleBill(v.id)}
                            className="bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-slate-900"
                          >
                            Generate invoice
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
