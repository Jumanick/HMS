from django.contrib import admin
from .models import Visit, Prescription

# Register your models here.
class PrescriptionInline(admin.TabularInline):
    model = Prescription
    extra = 1
    
@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ('appointment', 'created_at')
    inlines = [PrescriptionInline]