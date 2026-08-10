from rest_framework import viewsets, permissions
from .models import Visit, Prescription
from .serializers import VisitSerializer, PrescriptionSerializer


class VisitViewSet(viewsets.ModelViewSet):
    queryset = Visit.objects.select_related('appointment', 'appointment__patient').prefetch_related('prescriptions').all()
    serializer_class = VisitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == 'doctor':
            qs = qs.filter(appointment__doctor__user=user)
        return qs


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.select_related('visit').all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]