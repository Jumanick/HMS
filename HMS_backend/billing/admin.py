from django.contrib import admin
from .models import Invoice

#create your models here

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'visit', 'amount', 'status', 'created_at', 'paid_at')
    list_filter = ('status',)