from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, DoctorProfile

# Register your models here.

class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'first_name', 'last_name', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (('HMS', {'fields': ('role', 'phone')}),)

admin.site.register(User, UserAdmin)
admin.site.register(DoctorProfile)