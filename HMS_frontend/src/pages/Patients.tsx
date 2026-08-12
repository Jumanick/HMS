import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { fetchPatients, createPatient } from '../api/patients';
import type { Patient, PatientFormInput } from '../types/models';
import { Link } from 'react-router-dom';

const emptyForm: PatientFormInput = {
  first_name: '',
  last_name: '',
  date_of_birth: '',
  gender: 'female',
  phone: '',
  email: '',
  address: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
};

export default function Patients() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'receptionist';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PatientFormInput>(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPatients(search, page);
      setPatients(data.results);
      setCount(data.count);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce search so we don't fire a request on every keystroke
  useEffect(() => {
    const timeout = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await createPatient(form);
      setForm(emptyForm);
      setShowForm(false);
      setPage(1);
      load();
    } catch {
      setFormError('Could not register patient — check the required fields.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Patients</h1>
            <p className="text-sm text-slate-500">{count} registered</p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded hover:bg-emerald-800"
            >
              {showForm ? 'Cancel' : '+ Register patient'}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
            {formError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">
                {formError}
              </p>
            )}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="First name" required>
                <input
                  className="input"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  required
                />
              </Field>
              <Field label="Last name" required>
                <input
                  className="input"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  required
                />
              </Field>
              <Field label="Date of birth" required>
                <input
                  type="date"
                  className="input"
                  value={form.date_of_birth}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                  required
                />
              </Field>
              <Field label="Gender" required>
                <select
                  className="input"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as PatientFormInput['gender'] })}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Phone" required>
                <input
                  className="input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Address">
                <input
                  className="input"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </Field>
              <Field label="Emergency contact name">
                <input
                  className="input"
                  value={form.emergency_contact_name}
                  onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                />
              </Field>
              <Field label="Emergency contact phone">
                <input
                  className="input"
                  value={form.emergency_contact_phone}
                  onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })}
                />
              </Field>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded hover:bg-emerald-800 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save patient'}
            </button>
          </form>
        )}

        <input
          type="text"
          placeholder="Search by name or MRN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input mb-4 max-w-sm"
        />

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5">Name</th>
                <th className="text-left px-4 py-2.5">MRN</th>
                <th className="text-left px-4 py-2.5">DOB</th>
                <th className="text-left px-4 py-2.5">Phone</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    No patients found.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-700">
                        <Link to={`/patients/${p.id}`} className="block">
                          {p.first_name} {p.last_name}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{p.medical_record_number}</td>
                      <td className="px-4 py-2.5 text-slate-500">{p.date_of_birth}</td>
                      <td className="px-4 py-2.5 text-slate-500">{p.phone}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-3 mt-4 text-sm">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border border-slate-300 rounded disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-slate-300 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
