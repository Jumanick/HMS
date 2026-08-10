from rest_framework import viewsets, permissions, filters
from .models import Patient
from .serializers import PatientSerializer


class PatientViewSet(viewsets.ModelViewSet):
    """
    All authenticated staff can view patients (doctors need to look patients up too).
    Only admin/receptionist can create or edit — enforced in has_permission below.
    """
    queryset = Patient.objects.filter(is_active=True)
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'medical_record_number']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            from accounts.permissions import IsAdminOrReceptionist
            return [IsAdminOrReceptionist()]
        return super().get_permissions()

    def perform_destroy(self, instance):
        # Soft delete — never hard-delete a patient record
        instance.is_active = False
        instance.save()