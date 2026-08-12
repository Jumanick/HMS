from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Appointment
from .serializers import AppointmentSerializer
from accounts.permissions import IsAdminOrReceptionist


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related('patient', 'doctor', 'doctor__user').all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]                       # ADD THIS
    filterset_fields = ['patient', 'doctor', 'status']  
    
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
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Marks the appointment completed and creates its Visit in one step —
        this is the trigger point for the EMR record to exist at all.
        """
        appointment = self.get_object()

        if appointment.status == 'completed':
            return Response({'detail': 'Appointment is already completed.'}, status=status.HTTP_400_BAD_REQUEST)

        if hasattr(appointment, 'visit'):
            return Response({'detail': 'A visit already exists for this appointment.'}, status=status.HTTP_400_BAD_REQUEST)

        from emr.models import Visit
        from emr.serializers import VisitSerializer

        appointment.status = 'completed'
        appointment.save()

        visit = Visit.objects.create(
            appointment=appointment,
            notes=request.data.get('notes', ''),
            diagnosis=request.data.get('diagnosis', ''),
        )

        return Response(VisitSerializer(visit).data, status=status.HTTP_201_CREATED)