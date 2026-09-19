from django.urls import path
from . import views
urlpatterns=[
    path("register/",views.RegistrationView.as_view()),
    path("login/",views.LoginView.as_view()),
    path("check_user/",views.CheckUsernameView.as_view()),
]