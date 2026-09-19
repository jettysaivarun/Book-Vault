from rest_framework import generics,status
from .serializers import RegistrationSerializer,LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login
from librarymanagement.models import Member
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
                "access":str(access),
                "refresh":str(refresh)
            },status=status.HTTP_200_OK)
            
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)