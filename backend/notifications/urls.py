from django.urls import path
from . import views

urlpatterns=[
    path("reserve/",views.ReservationView.as_view()),
    path("<int:pk>/read/",views.MarkNotificationReadView.as_view()),
    path("notification_list/",views.NotificationListView.as_view()),
    path("unread_count/",views.UnreadNotifications.as_view()),
    path("markall/",views.MarkAll.as_view()),
]