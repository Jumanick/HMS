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
}
export default Employee;