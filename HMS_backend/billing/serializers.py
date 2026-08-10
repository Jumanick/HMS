from rest_framework import serializers
from .models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ['id', 'visit', 'amount', 'status', 'created_at', 'paid_at']
        read_only_fields = ['id', 'created_at']