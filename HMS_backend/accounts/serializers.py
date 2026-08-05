from rest_framework import serializers
from .models import User, DoctorProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields =["id", "username", "email", "first_name", "last_name", "role", "phone", "is_active"]
        read_only_field = ["id"]
        
        
class DoctoreSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        
        model = DoctorProfile
        fields = ["id","user", "specialization", "license_number"]