from django.contrib import admin
from .models import EmployeeProfile, SalaryRecord


class SalaryRecordInline(admin.TabularInline):
    model = SalaryRecord
    extra = 0


@admin.register(EmployeeProfile)
class EmployeeProfileAdmin(admin.ModelAdmin):
    list_display = ('employee_number', 'first_name', 'last_name', 'department', 'position', 'employment_status')
    list_filter = ('department', 'employment_status')
    search_fields = ('employee_number', 'first_name', 'last_name')
    inlines = [SalaryRecordInline]


@admin.register(SalaryRecord)
class SalaryRecordAdmin(admin.ModelAdmin):
    list_display = ('employee', 'net_pay', 'pay_period_start', 'pay_period_end', 'status')
    list_filter = ('status',)