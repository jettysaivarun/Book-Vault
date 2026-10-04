from django.contrib import admin
from .models import Reservation,Notifications
# Register your models here.
admin.site.register(Reservation)
admin.site.register(Notifications)