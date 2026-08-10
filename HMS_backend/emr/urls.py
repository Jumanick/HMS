from rest_framework.routers import DefaultRouter
from .views import VisitViewSet, PrescriptionViewSet

router = DefaultRouter()
router.register('visits', VisitViewSet)
router.register('prescriptions', PrescriptionViewSet)

urlpatterns = router.urls