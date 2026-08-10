from rest_framework import viewsets, permissions
from .models import Appointment
from .serializers import AppointmentSerializer
from accounts.permissions import IsAdminOrReceptionist


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related('patient', 'doctor', 'doctor__user').all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # Doctors only see their own appointments; admin/receptionist see all
        if user.role == 'doctor':
            qs = qs.filter(doctor__user=user)
        return qs

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrReceptionist()]
        return super().get_permissions()

    def get_serializer_context(self):
        return {'request': self.request}