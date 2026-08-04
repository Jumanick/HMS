import uuid
from django.core.validators import MinValueValidator
from django.db import models
from emr.models import Visit


class Invoice(models.Model):
    class Status(models.TextChoices):
        UNPAID = 'unpaid', 'Unpaid'
        PAID = 'paid', 'Paid'
        CANCELLED = 'cancelled', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    visit = models.OneToOneField(Visit, on_delete=models.PROTECT, related_name='invoice')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UNPAID)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=['status'])]

    def __str__(self):
        return f"Invoice {self.id} — {self.amount} ({self.status})"