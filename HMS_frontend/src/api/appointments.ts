import apiClient from './client';
import type { Appointment, AppointmentFormInput, PaginatedResponse, Visit } from '../types/models';

export async function fetchAppointments(page = 1) {
  const res = await apiClient.get<PaginatedResponse<Appointment>>('/appointments/', {
    params: { page },
  });
  return res.data;
}

export async function createAppointment(data: AppointmentFormInput) {
  const res = await apiClient.post<Appointment>('/appointments/', data);
  return res.data;
}

export async function updateAppointmentStatus(id: string, status: string) {
  const res = await apiClient.patch<Appointment>(`/appointments/${id}/`, { status });
  return res.data;
}

export async function completeAppointment(id: string, notes: string, diagnosis: string) {
  // Backend's `complete` action does two things atomically: marks the
  // appointment completed AND creates the Visit — see appointments/views.py
  const res = await apiClient.post<Visit>(`/appointments/${id}/complete/`, { notes, diagnosis });
  return res.data;
}
