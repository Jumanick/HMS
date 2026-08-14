import uuid
from django.conf import settings
from django.db import models

# Create your models here.
def generate_employee_number():
    return f"EMP-{uuid.uuid4().hex[:8].upper()}"

class EmployeeProfile(models.Model):
    class EmploymentStatus(models.TextChoices):
        ACTIVE = "active", "Active"
        ON_LEAVE = "on_leave", "On leave"
        TERMINATED = "terminated", "Terminated"
        
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    #optional i.e. only available to users with system logins
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employee_profile",
    )
    employee_number = models.CharField(max_length= 20, unique= True, default= generate_employee_number, editable= False)
    first_name = models.CharField(max_length= 100)
    last_name = models.CharField(max_length= 100)
    email = models.CharField(max_length= 100, blank= True)
    department = models.CharField(max_length= 100)
    position = models.CharField(max_length= 100)
    hire_date = models.DateField()
    employment_status = models.CharField(max_length= 20, choices= EmploymentStatus.choices, default= EmploymentStatus.ACTIVE)
    created_at = models.DateTimeField(auto_now= True)
    
    def __str__(self):
        return f"{self.first_name}{self.last_name({self.emloyee_number})}"
    
    class Meta:
        indexes = [
            models.Index(fields=['employee_number']),
            models.Index(fields=['department']),
        ]
        
class SalaryRecord(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        
    id = models.UUIDField(primary_key= True, default= uuid.uuid4(), unique= True, editable= False)
    employee = models.ForeignKey(EmployeeProfile, on_delete= models.CASCADE, related_name= "salary_records")
    base_salary = models.DecimalField(max_digits= 10,decimal_places= 2)
    allowences = models.DecimalField(max_digits= 10,decimal_places= 2, default= 0)
    deductions = models.DecimalField(max_digits= 10,decimal_places= 2, default= 0)
    net_pay = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    pay_period_start = models.DateField()
    pay_period_end = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['employee', 'pay_period_start'])]

    def save(self, *args, **kwargs):
        if self.status == self.Status.PENDING:
            self.net_pay = self.base_salary + self.allowances - self.deductions
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee} — {self.pay_period_start} to {self.pay_period_end}"