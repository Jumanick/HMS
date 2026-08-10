import apiClient from './client';
import type { DoctorProfile, PaginatedResponse } from '../types/models';

export async function fetchDoctors() {
  // Doctor list is small in practice — page size 20 default is fine to start.
  // Swap to a loop over `next` if a clinic ever has 20+ doctors.
  const res = await apiClient.get<PaginatedResponse<DoctorProfile>>('/doctors/');
  return res.data.results;
}
