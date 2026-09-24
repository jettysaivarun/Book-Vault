from rest_framework import serializers
from .models import Reservation,Notifications

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model=Reservation
        fields='__all__'
        
        
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model=Notifications
        fields='__all__'
        read_only_fields=['recipient','title','message','is_read','created_at']