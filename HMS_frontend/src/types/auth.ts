export interface User{
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    role: "admin" | "receptionist" | "doctor";
    phone: string;
    isActive: boolean;
}

export interface LoginResponse{
    access: string;
    refresh: string;
}