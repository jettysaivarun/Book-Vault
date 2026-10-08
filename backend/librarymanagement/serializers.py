from rest_framework import serializers
from .models import BookCopy,Book,BorrowRecord,Member

class BookSerializer(serializers.ModelSerializer):
    image=serializers.ImageField(required=False,allow_null=True)
    ebook=serializers.FileField(required=False,allow_null=True)
    class Meta:
        model=Book
        fields='__all__'

class BookCopySerializer(serializers.ModelSerializer):
    class Meta:
        model=BookCopy
        fields='__all__'

class BorrowRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model=BorrowRecord
        fields='__all__'


class MemberSerializer(serializers.ModelSerializer):
    profile_picture=serializers.ImageField(required=False,allow_null=True)
    class Meta:
        model=Member
        fields='__all__'