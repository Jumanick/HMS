import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchPatient } from '../api/patients';
import { fetchAppointmentsForPatient } from '../api/appointments';
import { fetchVisitsForPatient } from '../api/emr';
import { fetchInvoicesForPatient } from '../api/billing';
import type { Patient, Appointment, Visit, Invoice } from '../types/models';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await fetchPatient(id);
      setPatient(p);

      const patientAppointments = await fetchAppointmentsForPatient(id);
      setAppointments(patientAppointments);

      const patientVisits = await fetchVisitsForPatient(id);
      setVisits(patientVisits);

      const patientInvoices = await fetchInvoicesForPatient(id);
      setInvoices(patientInvoices);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Layout>
        <div className="p-8 text-slate-400 text-sm">Loading...</div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout>
        <div className="p-8">
          <p className="text-sm text-slate-500">Patient not found.</p>
          <Link to="/patients" className="text-sm text-emerald-700 hover:underline">
            ← Back to patients
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 max-w-4xl">
        <Link to="/patients" className="text-xs text-slate-500 hover:text-slate-700">
          ← Back to patients
        </Link>

        <div className="bg-white border border-slate-200 rounded-lg p-6 mt-3 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                {patient.first_name} {patient.last_name}
              </h1>
              <p className="text-xs font-mono text-slate-500 mt-0.5">{patient.medical_record_number}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
              {patient.gender}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-5 text-sm">
            <InfoField label="Date of birth" value={patient.date_of_birth} />
            <InfoField label="Phone" value={patient.phone} />
            <InfoField label="Email" value={patient.email || '—'} />
            <InfoField label="Address" value={patient.address || '—'} />
            <InfoField label="Emergency contact" value={patient.emergency_contact_name || '—'} />
            <InfoField label="Emergency phone" value={patient.emergency_contact_phone || '—'} />
          </div>
        </div>

        <Section title="Appointments">
          {appointments.length === 0 ? (
            <EmptyRow text="No appointments yet." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {appointments.map((a) => (
                <li key={a.id} className="py-2.5 flex justify-between text-sm">
                  <span className="text-slate-700">{a.doctor_name}</span>
                  <span className="text-slate-500">{new Date(a.scheduled_at).toLocaleString()}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                    {a.status.replace('_', ' ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Visits & diagnoses">
          {visits.length === 0 ? (
            <EmptyRow text="No visits recorded yet." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {visits.map((v) => (
                <li key={v.id} className="py-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-700">{v.diagnosis || 'No diagnosis recorded'}</span>
                    <span className="text-slate-500">{new Date(v.created_at).toLocaleDateString()}</span>
                  </div>
                  {v.prescriptions.length > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      {v.prescriptions.map((rx) => rx.medication_name).join(', ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Billing history">
          {invoices.length === 0 ? (
            <EmptyRow text="No invoices yet." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <li key={inv.id} className="py-2.5 flex justify-between text-sm">
                  <span className="text-slate-700">{inv.amount}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      inv.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : inv.status === 'unpaid'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {inv.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </Layout>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-slate-700">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 mb-4">
      <h2 className="text-sm font-semibold text-slate-700 mb-2">{title}</h2>
      {children}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="text-sm text-slate-400 py-2">{text}</p>;
}