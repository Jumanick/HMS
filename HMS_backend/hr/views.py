from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from accounts.permissions import IsAdmin
from .models import EmployeeProfile, SalaryRecord
from .serializers import EmployeeProfileSerializer, SalaryRecordSerializer

# Create your views here.
class EmployeeProfileViewSet(viewsets.ModelViewSet):
    queryset = EmployeeProfile.objects.select_related('user').all()
    serializer_class = EmployeeProfileSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['department', 'employment_status']
    
class SalaryRecordViewSet(viewsets.ModelViewSet):
    queryset = SalaryRecord.objects.select_related('employee').all()
    serializer_class = SalaryRecordSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'status']

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        record = self.get_object()
        if record.status == 'paid':
            return Response({'detail': 'This salary record is already marked paid.'}, status=status.HTTP_400_BAD_REQUEST)
        record.status = 'paid'
        record.paid_at = timezone.now()
        record.save()
        return Response(SalaryRecordSerializer(record).data)
