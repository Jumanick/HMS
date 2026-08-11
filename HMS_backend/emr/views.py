from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Visit, Prescription
from .serializers import VisitSerializer, PrescriptionSerializer


class VisitViewSet(viewsets.ModelViewSet):
    queryset = Visit.objects.select_related('appointment', 'appointment__patient').prefetch_related('prescriptions').all()
    serializer_class = VisitSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]                          
    filterset_fields = {                                              
        'appointment': ['exact'],
        'appointment__patient': ['exact'],
    }
    
    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == 'doctor':
            qs = qs.filter(appointment__doctor__user=user)
        return qs
    @action(detail=True, methods=['post'])
    def bill(self, request, pk=None):
        """Generates the invoice for a visit — the trigger point for billing to exist."""
        visit = self.get_object()

        if hasattr(visit, 'invoice'):
            return Response({'detail': 'An invoice already exists for this visit.'}, status=status.HTTP_400_BAD_REQUEST)

        amount = request.data.get('amount')
        if amount is None:
            return Response({'detail': 'amount is required.'}, status=status.HTTP_400_BAD_REQUEST)

        from billing.models import Invoice
        from billing.serializers import InvoiceSerializer

        invoice = Invoice.objects.create(visit=visit, amount=amount)
        return Response(InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.select_related('visit').all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]