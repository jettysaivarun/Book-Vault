from rest_framework import generics,status
from .serializers import RegistrationSerializer,LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login
from librarymanagement.models import Member
from notifications.models import Notifications
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated,AllowAny
# Create your views here.
class RegistrationView(generics.CreateAPIView):
    serializer_class=RegistrationSerializer
    def create(self,request):
        serializer=self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user=serializer.save()
        refresh=RefreshToken.for_user(user)
        access=refresh.access_token
        Member.objects.create(user=user)
        Notifications.objects.create(recipient=user,title="Registration Completed",message=f"Your Registration have been completed successfully")
        return Response({
            "username":user.username,
            "email":user.email,
            "access":str(access),
            "refresh":str(refresh)
        },status=status.HTTP_201_CREATED)

class LoginView(APIView):
    def post(self,request):
        serializer=LoginSerializer(data=request.data,context={'request': request})
        if serializer.is_valid():
            user=serializer.validated_data["user"]
            refresh=RefreshToken.for_user(user)
            access=refresh.access_token
            return Response({
    "username":user.username,
    "email":user.email,
    "access":str(access),
    "refresh":str(refresh)
},status=status.HTTP_200_OK)
            
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class CheckUsernameView(generics.CreateAPIView):

    def create(self, request):
        username = request.data.get('username', '').strip()

        if not username:
            return Response(
                {'message': 'Username is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'message': 'Username already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {'message': 'Username is available.'},
            status=status.HTTP_200_OK
        )
        
class LogoutView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        refresh_token=request.data.get('refresh_token')
        token=RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message":"Logged Out Successful"})
    
    
class ChangeUsernameView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        new_name=request.data.get('new_name')
        if not new_name:
            return Response({"message":"Username required"},status=status.HTTP_400_BAD_REQUEST)
        user=request.user
        if User.objects.filter(username=new_name).exists():
            return Response({"error":"This username already exists"})
        
        user.username=new_name
        user.save()
        Notifications.objects.create(recipient=user,title="Username updated",message=f"Your username was updated as {user.username}")
        return Response({"message":"Username changed"})
    
class ChangePasswordView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        old_pass=request.data.get('old_pass')
        new_pass=request.data.get('new_pass')
        if not new_pass or not old_pass:
            return Response({"error":"New password and Old password are required"},status=status.HTTP_400_BAD_REQUEST)
        user=request.user
        if not user.check_password(old_pass):
            return Response({"error":"The password doesn't match to your current password"},status=status.HTTP_400_BAD_REQUEST)
        if len(new_pass)<8 or new_pass.isalnum():
            return Response({"error":"Your new password should consists of minimum 8 characters and one special character"})
        user.set_password(new_pass)
        user.save()
        Notifications.objects.create(recipient=user,title="Password Changed",message="Your password was changed Successfully")
        return Response({"message":"Your Password was Changed Successfully"})

class DeleteAccountView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        password=request.data.get('password')
        if not password:
            return Response({"error":"Password is Reqiured"},status=status.HTTP_400_BAD_REQUEST)
        user=request.user
        if not user.check_password(password):
            return Response({"error":"Password is incorrect"},status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response({"message":"Account deleted successfully"},status=status.HTTP_200_OK)
    
class ChangeEmail(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        old_email=request.data.get('old_email')
        password=request.data.get('password')
        new_email=request.data.get('new_email')
        if not old_email or not password or not new_email:
            return Response({"error":"Required to fill all the fields"},status=status.HTTP_400_BAD_REQUEST)
        member=Member.objects.get(user=request.user)
        if member.user.email!=old_email:
            return Response({"error":"Invalid details"},status=status.HTTP_400_BAD_REQUEST)
        if old_email==new_email:
            return Response({"error":"Invalid details"},status=status.HTTP_400_BAD_REQUEST)
        if not member.user.check_password(password):
            return Response({"error":"Invalid details"},status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=new_email).exclude(id=request.user.id).exists():
            return Response({"error": "Email already exists"},status=status.HTTP_400_BAD_REQUEST)
        member.user.email=new_email
        member.user.save()
        return Response({"message":"Email changed successfully"},status=status.HTTP_200_OK)