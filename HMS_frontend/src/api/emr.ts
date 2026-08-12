import apiClient from './client';
import type { Visit, Prescription, Invoice, PaginatedResponse } from '../types/models';

export async function fetchVisits(page = 1) {
  const res = await apiClient.get<PaginatedResponse<Visit>>('/visits/', { params: { page } });
  return res.data;
}

export async function fetchVisit(id: string) {
  const res = await apiClient.get<Visit>(`/visits/${id}/`);
  return res.data;
}
export async function fetchVisitsForPatient(patientId: string) {
  const res = await apiClient.get<PaginatedResponse<Visit>>('/visits/', {
    params: { appointment__patient: patientId },
  });
  return res.data.results;
}
export async function addPrescription(
  visitId: string,
  data: Omit<Prescription, 'id' | 'visit' | 'created_at'>
) {
  const res = await apiClient.post<Prescription>('/prescriptions/', { visit: visitId, ...data });
  return res.data;
}

export async function billVisit(visitId: string, amount: string) {
  // Backend's `bill` action creates the Invoice for this visit — see emr/views.py
  const res = await apiClient.post<Invoice>(`/visits/${visitId}/bill/`, { amount });
  return res.data;
}
