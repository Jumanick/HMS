import apiClient from './client';
import type {
  EmployeeProfile,
  EmployeeFormInput,
  SalaryRecord,
  SalaryFormInput,
} from '../types/hr';
import type { PaginatedResponse } from '../types/models';

export async function fetchEmployees(page = 1) {
  const res = await apiClient.get<PaginatedResponse<EmployeeProfile>>('/hr/employees/', {
    params: { page },
  });
  return res.data;
}

export async function createEmployee(data: EmployeeFormInput) {
  const res = await apiClient.post<EmployeeProfile>('/hr/employees/', data);
  return res.data;
}

export async function fetchSalaries(employeeId?: string) {
  const res = await apiClient.get<PaginatedResponse<SalaryRecord>>('/hr/salaries/', {
    params: employeeId ? { employee: employeeId } : undefined,
  });
  return res.data;
}

export async function createSalaryRecord(data: SalaryFormInput) {
  const res = await apiClient.post<SalaryRecord>('/hr/salaries/', data);
  return res.data;
}

export async function markSalaryPaid(id: string) {
  const res = await apiClient.post<SalaryRecord>(`/hr/salaries/${id}/mark_paid/`);
  return res.data;
}