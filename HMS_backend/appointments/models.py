from django.db import models
from patients.models import Patient
from accounts.models import DoctorProfile
from django.conf import settings
import uuid

# Create your models here.

class Appointment(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Sheduled"
        CHECKED_IN = "checked_in", "Checked"
        COMPLETED = "completed", "Completed"
        CANCELED = "cancelled", "Cancelled"
        NO_SHOW = "no_show", "No show"
        
    id =models.UUIDField(primary_key= True, default= uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT, related_name="appointments")
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.PROTECT, related_name="appointments")
    scheduled_at = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    reason = models.CharField(max_length=100,blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="booked_appointments")
    created_at  = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['doctor', 'scheduled_at']),
            models.Index(fields=['patient']),
        ]

    def __str__(self):
        return f"{self.patient} with {self.doctor} at {self.scheduled_at}"