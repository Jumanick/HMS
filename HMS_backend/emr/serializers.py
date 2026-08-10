from rest_framework import serializers
from .models import Visit, Prescription


class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = ['id', 'visit', 'medication_name', 'dosage', 'frequency', 'duration', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class VisitSerializer(serializers.ModelSerializer):
    prescriptions = PrescriptionSerializer(many=True, read_only=True)

    class Meta:
        model = Visit
        fields = ['id', 'appointment', 'notes', 'diagnosis', 'prescriptions', 'created_at']
        read_only_fields = ['id', 'created_at']