from rest_framework import status,filters
from .models import BorrowRecord,BookCopy,Book,Member
from .serializers import BookSerializer,BookCopySerializer,BorrowRecordSerializer,MemberSerializer
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.decorators import action
from datetime import date,timedelta
# Create your views here.
class BookView(viewsets.ModelViewSet):
    queryset=Book.objects.all()
    serializer_class=BookSerializer
    filter_backends=[filters.SearchFilter]
    search_fields=["title","author","publisher","isbn","category","language"]
    @action(detail=False,methods=['post'],permission_classes=[IsAdminUser])
    def book_of_the_day(self,request): 
        try:
            prev_book=Book.objects.get(is_book_of_the_day=True)
            prev_book.is_book_of_the_day=False
            prev_book.save()
        except Book.DoesNotExist:
            pass
                
        book_id=request.data.get('book_id')
        try:
            book=Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return Response({"error":"The Book Doesn't exist"},status=status.HTTP_404_NOT_FOUND)
        book.is_book_of_the_day=True
        book.save()
        serializer=self.get_serializer(book)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
class BookCopyView(viewsets.ModelViewSet):
    queryset=BookCopy.objects.all()
    serializer_class=BookCopySerializer
    
class BorrowRecordView(viewsets.ModelViewSet):
    queryset=BorrowRecord.objects.all()
    serializer_class=BorrowRecordSerializer
    @action(detail=False,methods=['post'],permission_classes=[IsAuthenticated])
    def borrow_record(self,request):
        copy_id=request.data.get('copy_id')
        try:
            book_copy=BookCopy.objects.get(id=copy_id)
        except BookCopy.DoesNotExist:
            return Response({"error":"Book not Found"},status=status.HTTP_404_NOT_FOUND)
        if book_copy.status!='AVAILABLE':
            return Response({"error" : f"The book copy status was {book_copy.status}"},status=status.HTTP_400_BAD_REQUEST)
        try:
            member=Member.objects.get(user=request.user)
        except Member.DoesNotExist:
            return Response({"error":"The member doesn't exists"},status=status.HTTP_404_NOT_FOUND)
        borrow_record=BorrowRecord.objects.create(book_copy=book_copy,member=member,status='PENDING')
        book_copy.status='RESERVED'
        book_copy.save()
        serializer=self.get_serializer(borrow_record)
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    @action(detail=False,methods=['get','post'],permission_classes=[IsAdminUser])
    def accept_request(self,request):
        if request.method=='GET':
            pending_records=BorrowRecord.objects.filter(status="PENDING")
            serializer=self.get_serializer(pending_records,many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
        elif request.method=='POST':
            copy_id=request.data.get('copy_id')
            
            try:
                borrow_record=BorrowRecord.objects.get(id=copy_id,status='PENDING')
            except BorrowRecord.DoesNotExist:
                return Response({"error":"The above record doesn't found"},status=status.HTTP_404_BAD_REQUEST)
            borrow_record.status="ACTIVE"
            days=int(request.data.get("days_to_return",14))
            borrow_record.exp_return=date.today()+timedelta(days=days)
            borrow_record.save()
            book_copy=borrow_record.book_copy
            book_copy.status="BORROWED"
            book_copy.save()
            serializer=self.get_serializer(borrow_record)
            return Response(serializer.data,status=status.HTTP_200_OK)
    @action(detail=False,methods=['post'],permission_classes=[IsAuthenticated])
    def return_book(self,request):
        copy_id=request.data.get('copy_id')
        try:
            borrow_record=BorrowRecord.objects.get(id=copy_id)
        except BorrowRecord.DoesNotExist:
            return Response({"error":"Active borrow record not found"},status=status.HTTP_404_NOT_FOUND)
        borrow_record.act_return=date.today()
        days=(borrow_record.act_return-borrow_record.exp_return).days
        if days>0:
            borrow_record.fine_amount=days*5
            borrow_record.fine_remaining=borrow_record.fine_amount
            borrow_record.status="RETURNED"
        book_copy=borrow_record.book_copy
        book_copy.status="AVAILABLE"
        borrow_record.save()
        serializer=self.get_serializer(borrow_record)
        return Response(serializer.data,status=status.HTTP_200_OK)
class MemberView(viewsets.ModelViewSet):
    queryset=Member.objects.all()
    serializer_class=MemberSerializer
    
    