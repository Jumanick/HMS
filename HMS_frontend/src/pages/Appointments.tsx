import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { fetchAppointments, createAppointment, completeAppointment } from '../api/appointments';
import { fetchPatients } from '../api/patients';
import { fetchDoctors } from '../api/doctors';
import type { Appointment, AppointmentFormInput, Patient, DoctorProfile, AppointmentStatus } from '../types/models';

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  scheduled: 'bg-blue-50 text-blue-700',
  checked_in: 'bg-amber-50 text-amber-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500',
  no_show: 'bg-red-50 text-red-700',
};

const emptyForm: AppointmentFormInput = { patient: '', doctor: '', scheduled_at: '', reason: '' };

export default function Appointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canManage = user?.role === 'admin' || user?.role === 'receptionist';
  const isDoctor = user?.role === 'doctor';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AppointmentFormInput>(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [visitNotes, setVisitNotes] = useState('');
  const [visitDiagnosis, setVisitDiagnosis] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAppointments();
      setAppointments(data.results);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (canManage) {
      // Patient list capped at 100 for the dropdown — for a bigger clinic,
      // swap this for a searchable async-select instead of loading everything.
      fetchPatients('', 1).then((d) => setPatients(d.results));
      fetchDoctors().then(setDoctors);
    }
  }, [canManage]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await createAppointment(form);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch {
      setFormError('Could not book appointment — check all fields are filled in.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComplete(id: string) {
    try {
      const visit = await completeAppointment(id, visitNotes, visitDiagnosis);
      setCompletingId(null);
      setVisitNotes('');
      setVisitDiagnosis('');
      load();
      // Take the doctor straight to the new visit record to add prescriptions / bill
      navigate(`/visits?highlight=${visit.id}`);
    } catch {
      alert('Could not complete this appointment. It may already be completed.');
    }
  }

  return (
    <Layout>
      <div className="p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-slate-800">Appointments</h1>
          {canManage && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded hover:bg-emerald-800"
            >
              {showForm ? 'Cancel' : '+ Book appointment'}
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
              <label className="block">
                <span className="block text-xs font-medium text-slate-600 mb-1">Patient *</span>
                <select
                  className="input"
                  value={form.patient}
                  onChange={(e) => setForm({ ...form, patient: e.target.value })}
                  required
                >
                  <option value="">Select a patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} ({p.medical_record_number})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-600 mb-1">Doctor *</span>
                <select
                  className="input"
                  value={form.doctor}
                  onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                  required
                >
                  <option value="">Select a doctor...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.user.last_name} — {d.specialization}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-600 mb-1">Date &amp; time *</span>
                <input
                  type="datetime-local"
                  className="input"
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                  required
                />
              </label>
              <label className="block col-span-2">
                <span className="block text-xs font-medium text-slate-600 mb-1">Reason</span>
                <input
                  className="input"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded hover:bg-emerald-800 disabled:opacity-50"
            >
              {submitting ? 'Booking...' : 'Book appointment'}
            </button>
          </form>
        )}

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5">Patient</th>
                <th className="text-left px-4 py-2.5">Doctor</th>
                <th className="text-left px-4 py-2.5">When</th>
                <th className="text-left px-4 py-2.5">Status</th>
                {isDoctor && <th className="text-left px-4 py-2.5">Action</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">Loading...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">No appointments yet.</td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <>
                    <tr key={a.id} className="border-t border-slate-100">
                      <td className="px-4 py-2.5 font-medium text-slate-700">{a.patient_name}</td>
                      <td className="px-4 py-2.5 text-slate-500">{a.doctor_name}</td>
                      <td className="px-4 py-2.5 text-slate-500">{new Date(a.scheduled_at).toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[a.status]}`}>
                          {a.status.replace('_', ' ')}
                        </span>
                      </td>
                      {isDoctor && (
                        <td className="px-4 py-2.5">
                          {a.status === 'scheduled' && (
                            <button
                              onClick={() => setCompletingId(completingId === a.id ? null : a.id)}
                              className="text-emerald-700 text-xs font-medium hover:underline"
                            >
                              Complete visit
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                    {completingId === a.id && (
                      <tr className="bg-slate-50 border-t border-slate-100">
                        <td colSpan={5} className="px-4 py-4">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <label className="block">
                              <span className="block text-xs font-medium text-slate-600 mb-1">Notes</span>
                              <textarea
                                className="input"
                                rows={2}
                                value={visitNotes}
                                onChange={(e) => setVisitNotes(e.target.value)}
                              />
                            </label>
                            <label className="block">
                              <span className="block text-xs font-medium text-slate-600 mb-1">Diagnosis</span>
                              <textarea
                                className="input"
                                rows={2}
                                value={visitDiagnosis}
                                onChange={(e) => setVisitDiagnosis(e.target.value)}
                              />
                            </label>
                          </div>
                          <button
                            onClick={() => handleComplete(a.id)}
                            className="bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-emerald-800"
                          >
                            Save &amp; complete
                          </button>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
