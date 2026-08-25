export interface EmployeeProfile{
    user:{
    id: string;
    first_name: string;
    last_name: string;
    role: string;
    }| null;
    
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    hire_date: string;
    employment_status: string;
    created_at: string;
}
export type EmployeeFormInput = Omit<
  EmployeeProfile,
  'id' | 'employee_number' | 'user' | 'created_at'
>;

export type SalaryStatus = "paid" | "pending";
export interface SalaryRecord{
    id:  string;
    employee: string;
    employee_name: string;
    base_salary: string;
    allowences: string;
    deductions: string;
    net_pay: string;
    pay_period_start: string;
    pay_period_end: string;
    status: SalaryStatus;
    paid_at: string;
    created_at: string;

}

export type SalaryFormInput = {
    employee: string;
    base_salary: string;
    allowances: string;
    deductions: string;
    pay_period_start: string;
    pay_period_end: string;
};