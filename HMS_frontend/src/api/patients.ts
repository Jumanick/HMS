import apiClient from './client';
import type { Patient, PatientFormInput, PaginatedResponse } from '../types/models';

export async function fetchPatient(id: string) {
  const res = await apiClient.get<Patient>(`/patients/${id}/`);
  return res.data;
}

export async function fetchPatients(search = '', page = 1) {
  const res = await apiClient.get<PaginatedResponse<Patient>>('/patients/', {
    params: { search: search || undefined, page },
  });
  return res.data;
}

export async function createPatient(data: PatientFormInput) {
  const res = await apiClient.post<Patient>('/patients/', data);
  return res.data;
}

export async function updatePatient(id: string, data: Partial<PatientFormInput>) {
  const res = await apiClient.patch<Patient>(`/patients/${id}/`, data);
  return res.data;
}

export async function deactivatePatient(id: string) {
  await apiClient.delete(`/patients/${id}/`); // backend soft-deletes, doesn't hard-delete
}