import {useState, useEffect, useCallback} from "react";
import type { FormEvent } from 'react';
import Layout from "../components/Layout";
import { fetchEmployees, createEmployee, fetchSalaries, createSalaryRecord, markSalaryPaid } from '../api/hr';
import type { EmployeeProfile, EmployeeFormInput, SalaryRecord, SalaryFormInput } from '../types/hr';

const emptyEmployeeForm : EmployeeFormInput = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    hire_date: '',
    employment_status: 'active',
};

const emptySalaryForm = (employeeId: string): SalaryFormInput => ({
  employee: employeeId,
  base_salary: '',
  allowances: '0',
  deductions: '0',
  pay_period_start: '',
  pay_period_end: '',
});
function Employee(){
    const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
     const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EmployeeFormInput>(emptyEmployeeForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [salaryForm, setSalaryForm] = useState<SalaryFormInput | null>(null);
  const [salaryError, setSalaryError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEmployees();
      setEmployees(data.results);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await createEmployee(form);
      setForm(emptyEmployeeForm);
      setShowForm(false);
      load();
    } catch {
      setFormError('Could not add employee — check the required fields.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleExpand(employeeId: string) {
    if (expandedId === employeeId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(employeeId);
    setSalaryForm(null);
    const data = await fetchSalaries(employeeId);
    setSalaries(data.results);
  }

  async function handleAddSalary(e: FormEvent, employeeId: string) {
    e.preventDefault();
    if (!salaryForm) return;
    setSalaryError('');
    try {
      await createSalaryRecord(salaryForm);
      setSalaryForm(null);
      const data = await fetchSalaries(employeeId);
      setSalaries(data.results);
    } catch {
      setSalaryError('Could not add salary record — check all fields are filled in.');
    }
  }

  async function handleMarkPaid(id: string, employeeId: string) {
    await markSalaryPaid(id);
    const data = await fetchSalaries(employeeId);
    setSalaries(data.results);
  }

  return (
    <Layout>
      <div className="p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-slate-800">Employees</h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded hover:bg-emerald-800"
          >
            {showForm ? 'Cancel' : '+ Add employee'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
            {formError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">
                {formError}
              </p>
            )}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input className="input" placeholder="First name" value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
              <input className="input" placeholder="Last name" value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
              <input className="input" placeholder="Email" type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="input" placeholder="Phone" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              <input className="input" placeholder="Department" value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })} required />
              <input className="input" placeholder="Position" value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })} required />
              <label className="block">
                <span className="block text-xs font-medium text-slate-600 mb-1">Hire date</span>
                <input className="input" type="date" value={form.hire_date}
                  onChange={(e) => setForm({ ...form, hire_date: e.target.value })} required />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-600 mb-1">Status</span>
                <select className="input" value={form.employment_status}
                  onChange={(e) => setForm({ ...form, employment_status: e.target.value as EmployeeFormInput['employment_status'] })}>
                  <option value="active">Active</option>
                  <option value="on_leave">On leave</option>
                  <option value="terminated">Terminated</option>
                </select>
              </label>
            </div>
            <button type="submit" disabled={submitting}
              className="bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded hover:bg-emerald-800 disabled:opacity-50">
              {submitting ? 'Saving...' : 'Save employee'}
            </button>
          </form>
        )}

        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : employees.length === 0 ? (
            <p className="text-sm text-slate-400">No employees added yet.</p>
          ) : (
            employees.map((emp) => {
              // EmployeeProfile uses employee_id in the API model, while older
              // responses may still expose id/employee_number.
              const employee = emp as EmployeeProfile & {
                employee_id?: string;
                id?: string;
                employee_number?: string;
              };
              const employeeId = employee.employee_id ?? employee.id ?? '';
              const employeeNumber = employee.employee_number ?? employeeId;
              const isOpen = expandedId === employeeId;
              return (
                <div key={employeeId} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <button onClick={() => toggleExpand(employeeId)} className="w-full flex items-center justify-between px-5 py-3 text-left">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{emp.first_name} {emp.last_name}</p>
                      <p className="text-xs text-slate-500">{emp.position} — {emp.department} · {employeeNumber}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      emp.employment_status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                      emp.employment_status === 'on_leave' ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {emp.employment_status.replace('_', ' ')}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 px-5 py-4">
                      {salaryError && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">
                          {salaryError}
                        </p>
                      )}
                      <p className="text-xs font-medium text-slate-500 mb-2">Salary records</p>
                      {salaries.length === 0 ? (
                        <p className="text-sm text-slate-400 mb-3">None yet.</p>
                      ) : (
                        <ul className="mb-3 space-y-1.5">
                          {salaries.map((s) => (
                            <li key={s.id} className="flex items-center justify-between text-sm">
                              <span className="text-slate-700">
                                {s.pay_period_start} → {s.pay_period_end} — net {s.net_pay}
                              </span>
                              {s.status === 'pending' ? (
                                <button
                                  onClick={() => handleMarkPaid(s.id, employeeId)}
                                  className="text-emerald-700 text-xs font-medium hover:underline"
                                >
                                  Mark as paid
                                </button>
                              ) : (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">paid</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}

                      {salaryForm ? (
                        <form
                          onSubmit={(e) => handleAddSalary(e, employeeId)}
                          className="grid grid-cols-2 gap-2 bg-slate-50 rounded p-3"
                        >
                          <input className="input" placeholder="Base salary" type="number" step="0.01"
                            value={salaryForm.base_salary}
                            onChange={(e) => setSalaryForm({ ...salaryForm, base_salary: e.target.value })} required />
                          <input className="input" placeholder="Allowances" type="number" step="0.01"
                            value={salaryForm.allowances}
                            onChange={(e) => setSalaryForm({ ...salaryForm, allowances: e.target.value })} />
                          <input className="input" placeholder="Deductions" type="number" step="0.01"
                            value={salaryForm.deductions}
                            onChange={(e) => setSalaryForm({ ...salaryForm, deductions: e.target.value })} />
                          <div />
                          <label className="block">
                            <span className="block text-xs font-medium text-slate-600 mb-1">Period start</span>
                            <input className="input" type="date" value={salaryForm.pay_period_start}
                              onChange={(e) => setSalaryForm({ ...salaryForm, pay_period_start: e.target.value })} required />
                          </label>
                          <label className="block">
                            <span className="block text-xs font-medium text-slate-600 mb-1">Period end</span>
                            <input className="input" type="date" value={salaryForm.pay_period_end}
                              onChange={(e) => setSalaryForm({ ...salaryForm, pay_period_end: e.target.value })} required />
                          </label>
                          <button type="submit" className="col-span-2 bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-emerald-800 justify-self-start">
                            Save salary record
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => setSalaryForm(emptySalaryForm(employeeId))}
                          className="text-xs text-emerald-700 font-medium hover:underline"
                        >
                          + Add salary record
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
export default Employee;