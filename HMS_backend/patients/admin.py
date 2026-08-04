from django.contrib import admin
from .models import Patient

# Register your models here.

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('medical_record_number', 'first_name', 'last_name', 'date_of_birth', 'phone', 'is_active')
    search_fields = ('medical_record_number', 'first_name', 'last_name')