from rest_framework.routers import DefaultRouter
from .views import EmployeeProfileViewSet, SalaryRecordViewSet

router = DefaultRouter()
router.register('employees', EmployeeProfileViewSet)
router.register('salaries', SalaryRecordViewSet)

urlpatterns = router.urls