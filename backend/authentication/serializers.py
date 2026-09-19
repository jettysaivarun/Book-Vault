from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

class RegistrationSerializer(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True)
    class Meta:
        model=User
        fields=['username','email','password']
    def validate_password(self,value):
        if len(value)<8:
            raise serializers.ValidationError("password should be more or equal to 8 characters")
        if value.isalnum():
            raise serializers.ValidationError("Password should contains atleast one special character")
        return value
    def validate_username(self,value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username already exists")
        return value
    def create(self,validated_data):
        user=User.objects.create_user(username=validated_data["username"],email=validated_data["email"],password=validated_data["password"])
        return user
    
class LoginSerializer(serializers.ModelSerializer):
    username=serializers.CharField()
    password=serializers.CharField(write_only=True)
    class Meta:
        model=User
        fields=['username','password']
    def validate(self,data):
        
        if data.get("username") and data.get("password"):
            request = self.context.get('request')
            user=authenticate(request=request,username=data["username"],password=data["password"])
        
            if not user:
                raise serializers.ValidationError("Invalid username or password")
        else:
            raise serializers.ValidationError("Enter both username and Password")
        data["user"] = user
        return data