from rest_framework.routers import DefaultRouter
from .views import UserViewSet, DoctorProfileViewSet

router = DefaultRouter()
router.register('users', UserViewSet)
router.register('doctors', DoctorProfileViewSet)

urlpatterns = router.urls