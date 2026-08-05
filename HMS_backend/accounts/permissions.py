from rest_framework.permissions import BasePermission
# allows us to work with Django REST framework (DRF)

class IsAdmin(BasePermission):
    def hasPermission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"
    
    
class IsDoctor(BasePermission):
    def hasPermission(self, request, view):
        return request.user.is_authenticated and request.user.role == "doctor"
    
class IsReceptionist(BasePermission):
    def hasPermission(self, request, view):
        return request.user.is_authenticated and request.user.role == "receptionist"
    
class IsAdminOrReceptionist(BasePermission):
    def hasPermission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("admin", "receptionist")