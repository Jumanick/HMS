from rest_framework import viewsets, permissions
from .models import Invoice
from .serializers import InvoiceSerializer
from accounts.permissions import IsAdminOrReceptionist


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related('visit').all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrReceptionist()]
        return super().get_permissions()