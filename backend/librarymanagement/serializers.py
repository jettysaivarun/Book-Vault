from rest_framework import serializers
from .models import BookCopy,Book,BorrowRecord,Member

class BookSerializer(serializers.ModelSerializer):
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
    class Meta:
        model=Member
        fields='__all__'