from django.db import models
import uuid
# Create your models here.

def generate_mrn():
    #generates a unique medical record number
    return f"MRN-{uuid.uuid4().hex[:8].upper()}"

class Patient(models.Model):
    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        OTHER = "other", "Other"
        
    id = models.UUIDField(primary_key= True, default=uuid.uuid4, editable= False)
    medical_record_number = models.CharField(max_length= 20, unique= True, default=generate_mrn(), editable=False)
    first_name = models.CharField(max_length= 100)
    last_name = models.CharField(max_length= 100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=Gender.choices)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    emergency_contact_name = models.CharField(max_length=150, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['medical_record_number']),
            models.Index(fields=['last_name', 'first_name']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.medical_record_number})"
