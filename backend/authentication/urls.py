from django.urls import path
from . import views
urlpatterns=[
    path("register/",views.RegistrationView.as_view()),
    path("login/",views.LoginView.as_view()),
    path("create-admin/", views.create_admin),
    path("check_user/",views.CheckUsernameView.as_view()),
    path("logout/",views.LogoutView.as_view()),
    path("change_username/",views.ChangeUsernameView.as_view()),
    path("change_password/",views.ChangePasswordView.as_view()),
    path("change_email/",views.ChangeEmail.as_view()),
    path("delete_acc/",views.DeleteAccountView.as_view()),
]