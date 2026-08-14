from rest_framework import serializers
from accounts.serializers import UserSerializer
from accounts.models import User
from .models import EmployeeProfile, SalaryRecord


class EmployeeProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True,
        required=False, allow_null=True,
    )
    
    class Meta:
        model = EmployeeProfile
        fields = [
            'id', 'employee_number', 'user', 'user_id', 'first_name', 'last_name',
            'email', 'phone', 'department', 'position', 'hire_date',
            'employment_status', 'created_at',
        ]
        read_only_fields = ['id', 'employee_number', 'created_at']
    
class SalaryRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.__str__', read_only=True)

    class Meta:
        model = SalaryRecord
        fields = [
            'id', 'employee', 'employee_name', 'base_salary', 'allowances',
            'deductions', 'net_pay', 'pay_period_start', 'pay_period_end',
            'status', 'paid_at', 'created_at',
        ]
        read_only_fields = ['id', 'net_pay', 'status', 'paid_at', 'created_at']