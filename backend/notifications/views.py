from rest_framework import generics
from .models import Reservation, Notifications
from .serializers import ReservationSerializer, NotificationSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from datetime import datetime, timedelta
from librarymanagement.models import BookCopy, Book, BorrowRecord
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction


def is_copy_available_for_range(copy, start_date, end_date):
    if copy.status != "AVAILABLE":
        return False

    reservation_conflict = Reservation.objects.filter(
        book_copy=copy,
        status="ACTIVE",
        reserved_date__lte=end_date,
        exp_return__gte=start_date
    ).exists()

    if reservation_conflict:
        return False

    borrow_conflict = BorrowRecord.objects.filter(
        book_copy=copy,
        status="ACTIVE",
        date__lte=end_date,
        exp_return__gte=start_date
    ).exists()

    if borrow_conflict:
        return False

    return True


class ReservationView(generics.CreateAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        book_id = request.data.get("book_id")
        reserved_date = request.data.get("reserved_date")
        exp_return = request.data.get("exp_return")

        if not book_id:
            return Response(
                {"error": "book_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not reserved_date:
            return Response(
                {"error": "reserved_date is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return Response(
                {"error": "Book not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            reserved_date = datetime.strptime(
                reserved_date,
                "%Y-%m-%d"
            ).date()
        except ValueError:
            return Response(
                {"error": "Invalid reserved date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if exp_return:
            try:
                exp_return = datetime.strptime(
                    exp_return,
                    "%Y-%m-%d"
                ).date()
            except ValueError:
                return Response(
                    {"error": "Invalid expected return date format. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            exp_return = reserved_date + timedelta(days=14)

        today = datetime.today().date()

        if reserved_date < today:
            return Response(
                {"error": "You cannot reserve a book for a past date"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if exp_return < reserved_date:
            return Response(
                {"error": "The exp return date is prior than the reserved date"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if (exp_return - reserved_date).days > 14:
            return Response(
                {"error": "The Book can't be borrowed more than 14 days"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_reservation = Reservation.objects.filter(
            user=request.user,
            book_copy__book=book,
            status="ACTIVE",
            reserved_date__lte=exp_return,
            exp_return__gte=reserved_date
        ).exists()

        if user_reservation:
            return Response(
                {"error": "You have already reserved this book for an overlapping date range"},
                status=status.HTTP_400_BAD_REQUEST
            )

        copies = BookCopy.objects.select_for_update().filter(
            book=book
        )

        for copy in copies:
            if not is_copy_available_for_range(
                copy,
                reserved_date,
                exp_return
            ):
                continue

            reservation = Reservation.objects.create(
                user=request.user,
                book_copy=copy,
                reserved_date=reserved_date,
                exp_return=exp_return,
                status="ACTIVE"
            )

            serializer = ReservationSerializer(reservation)

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            {"error": "This book has no available copy for the selected dates."},
            status=status.HTTP_400_BAD_REQUEST
        )


class ReservationBorrowView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        if not request.user.is_staff:
            return Response(
                {"error": "Only admin can convert a reservation to a borrowed book"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            reservation = Reservation.objects.select_for_update().get(
                id=pk,
                status="ACTIVE"
            )
        except Reservation.DoesNotExist:
            return Response(
                {"error": "Active reservation not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        book_copy = reservation.book_copy

        existing_borrow = BorrowRecord.objects.filter(
            book_copy=book_copy,
            status="ACTIVE"
        ).exists()

        if existing_borrow:
            return Response(
                {"error": "This book copy is already borrowed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if book_copy.status not in ["AVAILABLE", "RESERVED"]:
            return Response(
                {"error": "This book copy is not available for borrowing"},
                status=status.HTTP_400_BAD_REQUEST
            )

        borrow_record = BorrowRecord.objects.create(
            book_copy=book_copy,
            member=reservation.user.member,
            date=reservation.reserved_date,
            exp_return=reservation.exp_return,
            status="ACTIVE",
            borrow_fee=0,
            fine_amount=0,
            fine_amount_paid=0,
            fine_remaining=0
        )

        book_copy.status = "BORROWED"
        book_copy.save()

        reservation.status = "COMPLETED"
        reservation.save()

        return Response(
            {
                "message": "Reservation successfully converted to borrowed book",
                "reservation_id": reservation.id,
                "borrow_record_id": borrow_record.id,
                "book_id": book_copy.book.id,
                "book_title": book_copy.book.title,
                "book_copy_id": book_copy.id,
                "user_id": reservation.user.id,
                "reserved_date": reservation.reserved_date,
                "exp_return": reservation.exp_return
            },
            status=status.HTTP_200_OK
        )


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notifications.objects.filter(
            recipient=request.user
        )

        serializer = NotificationSerializer(
            notifications,
            many=True
        )

        return Response(serializer.data)


class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        notification = Notifications.objects.get(
            id=pk,
            recipient=request.user
        )

        notification.is_read = True
        notification.save()

        return Response(
            {"message": "The Notification is marked as read"}
        )


class UnreadNotifications(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notifications.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()

        return Response(
            {"unread_count": count}
        )


class MarkAll(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        Notifications.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(
            is_read=True
        )

        return Response(
            {"message": "Every msg marked as read"}
        )


class BookAvailabilityView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        book_id = request.data.get("book_id")
        start_date = request.data.get("start_date")
        end_date = request.data.get("end_date")

        if not book_id:
            return Response(
                {"error": "book_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not start_date or not end_date:
            return Response(
                {"error": "Need to fill the details"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start_date = datetime.strptime(
                start_date,
                "%Y-%m-%d"
            ).date()

            end_date = datetime.strptime(
                end_date,
                "%Y-%m-%d"
            ).date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if start_date > end_date:
            return Response(
                {"error": "Give the valid date information"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if (end_date - start_date).days > 366:
            return Response(
                {"error": "The date range cannot be more than 366 days"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return Response(
                {"error": "Book not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        copies = BookCopy.objects.filter(
            book=book
        )

        total_copies = copies.count()

        unavailable_dates = []

        current_date = start_date

        while current_date <= end_date:
            date_available = False

            for copy in copies:
                if is_copy_available_for_range(
                    copy,
                    current_date,
                    current_date
                ):
                    date_available = True
                    break

            if not date_available:
                unavailable_dates.append(
                    current_date.strftime("%Y-%m-%d")
                )

            current_date += timedelta(days=1)

        requested_available = len(unavailable_dates) == 0

        reserved_copies = Reservation.objects.filter(
            book_copy__book=book,
            status="ACTIVE",
            reserved_date__lte=end_date,
            exp_return__gte=start_date
        ).values(
            "book_copy"
        ).distinct().count()

        borrowed_copies = BorrowRecord.objects.filter(
            book_copy__book=book,
            status="ACTIVE",
            date__lte=end_date,
            exp_return__gte=start_date
        ).values(
            "book_copy"
        ).distinct().count()

        available_copies = 0

        for copy in copies:
            if is_copy_available_for_range(
                copy,
                start_date,
                end_date
            ):
                available_copies += 1

        return Response(
            {
                "book_id": book.id,
                "book_title": book.title,
                "requested_start": start_date,
                "requested_end": end_date,
                "total_copies": total_copies,
                "reserved_copies": reserved_copies,
                "borrowed_copies": borrowed_copies,
                "available_copies": available_copies,
                "available": requested_available,
                "unavailable_dates": unavailable_dates
            },
            status=status.HTTP_200_OK
        )


class ReservationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reservations = Reservation.objects.filter(
            user=request.user
        ).select_related(
            "book_copy__book"
        ).order_by(
            "-reserved_date"
        )

        data = []

        for reservation in reservations:
            data.append(
                {
                    "id": reservation.id,
                    "book": reservation.book_copy.book.id,
                    "book_title": reservation.book_copy.book.title,
                    "book_copy": reservation.book_copy.id,
                    "copy_number": reservation.book_copy.copy_number,
                    "reserved_date": reservation.reserved_date,
                    "exp_return": reservation.exp_return,
                    "status": reservation.status,
                    "created_at": reservation.created_at
                }
            )

        return Response(data)