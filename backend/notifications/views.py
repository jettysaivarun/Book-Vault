from rest_framework import generics
from .models import Reservation,Notifications
from .serializers import ReservationSerializer,NotificationSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from datetime import datetime,timedelta
from librarymanagement.models import BookCopy,Book
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView

# Create your views here.

class ReservationView(generics.CreateAPIView):
    serializer_class=ReservationSerializer
    permission_classes=[IsAuthenticated]
    
    def post(self,request):
        book_id=request.data.get('book_id')
        reserved_date=request.data.get('reserved_date')
        exp_return=request.data.get('exp_return')
        book=Book.objects.get(id=book_id)
        reserved_date=datetime.strptime(reserved_date,"%Y-%m-%d").date()
        if exp_return:
            exp_return=datetime.strptime(exp_return,"%Y-%m-%d").date()
            if (exp_return-reserved_date).days>14:
                return Response({"error":"The Book can't be borrowed more than 14 days"},status=status.HTTP_400_BAD_REQUEST)
        else:
            exp_return=reserved_date+timedelta(days=14)
        if exp_return<reserved_date:
            return Response({"error":"The exp return date is prior than the reserved date"},status=status.HTTP_400_BAD_REQUEST)
        user_reservation=Reservation.objects.filter(user=request.user,book_copy__book=book,reserved_date__lte=exp_return,exp_return__gte=reserved_date).exists()
        if user_reservation:
            return Response({"error":"You have already reserved that book in that instance"},status=status.HTTP_400_BAD_REQUEST)
        copies=BookCopy.objects.filter(book=book)
        for copy in copies:
            conflict=Reservation.objects.filter(book_copy=copy,reserved_date__lte=exp_return,exp_return__gte=reserved_date)
            if not conflict:
                reservation=Reservation.objects.create(user=request.user,book_copy=copy,reserved_date=reserved_date,exp_return=exp_return)
                serializer=ReservationSerializer(reservation)
                return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response({"message":"This book copies are not available in this date"},status=status.HTTP_400_BAD_REQUEST)


class NotificationListView(APIView):
    permission_classes=[IsAuthenticated]
    
    def get(self,request):
        notifications=Notifications.objects.filter(recipient=request.user)
        serializer=NotificationSerializer(notifications,many=True)
        return Response(serializer.data)
    
class MarkNotificationReadView(APIView):
    permission_classes=[IsAuthenticated]
    
    def patch(self,request,pk):
        notification=Notifications.objects.get(id=pk,recipient=request.user)
        notification.is_read=True
        notification.save()
        return Response({"message":"The Notification is marked as read"})

class UnreadNotifications(APIView):
    permission_classes=[IsAuthenticated]
    
    def get(self,request):
        count=Notifications.objects.filter(recipient=request.user,is_read=False).count()
        return Response({"unread_count":count})

class MarkAll(APIView):
    permission_classes=[IsAuthenticated]
    
    def patch(self,request):
        Notifications.objects.filter(recipient=request.user,is_read=False).update(is_read=True)
        return Response({"message":"Every msg marked as read"})
