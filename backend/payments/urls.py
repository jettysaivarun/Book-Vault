from django.urls import path
from . import views
urlpatterns=[
    path("create-order/",views.CreateOrderView.as_view()),
    path("verify/",views.VerifyPaymentView.as_view()),
]