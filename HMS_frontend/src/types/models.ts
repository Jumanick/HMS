export interface Patient{
    id: string;
    medical_record_number: string;
    first_name: string;
    last_name: string;
    date_of_birth: string; //yyy-mmm-ddd
    gender: "male" | "female" | "other";
    phone: string;
    email: string;
    address: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    is_active: boolean;
    created_at: string;
}

export type PatientFormInput = Omit<
    Patient,
    'id' | 'medical_record_number' | 'is_active' | 'created_at'
>;

export interface DoctorProfile{
    id: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        role: string;
    };
    specialization: string;
    license_number: string;
}

export type AppointmentStatus = "scheduled" | "checked_in" | "completed" | "cancelled" | "no_show";

export interface Appointment{
    id: string;
    patient: string; //patient id
    doctor: string; // doctor id
    scheduled_at: string;
    statues: AppointmentStatus;
    reason: string;
    created_by: string;
    created_at: string;
}

export type AppointmentFormInput = {
    patient: string;
    doctor: string;
    scheduled_at: string;
    eason: string;
};

export interface Prescription{
    id: string;
    visit: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes: string;
    created_at: string;
}

export interface Visit{
    id: string;
    appointment: string;
    notes: string;
    diagnosis: string;
    created_at: string;
}

export type InvoiceStatus = "unpaid" | "paid" | "cancelled";

export interface Invoice{
    id: string;
    visit: string; //visit id
    amount: string; //serialized as a string by DRF
    status: InvoiceStatus;
    created_at: string;
    paid_by: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}