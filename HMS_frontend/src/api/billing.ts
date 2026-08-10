import apiClient from './client';
import type { Invoice, PaginatedResponse } from '../types/models';

export async function fetchInvoices(page = 1) {
  const res = await apiClient.get<PaginatedResponse<Invoice>>('/invoices/', { params: { page } });
  return res.data;
}

export async function markInvoicePaid(id: string) {
  const res = await apiClient.patch<Invoice>(`/invoices/${id}/`, {
    status: 'paid',
    paid_at: new Date().toISOString(),
  });
  return res.data;
}
