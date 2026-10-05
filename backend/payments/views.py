from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from decimal import Decimal
from .models import Payment
from .razorpay_utils import client
from django.conf import settings
from django.utils import timezone
from librarymanagement.models import BorrowRecord


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        borrow_record_id = request.data.get("borrow_record_id")
        amount = request.data.get("amount")

        borrow_record = None

        if borrow_record_id:
            try:
                borrow_record = BorrowRecord.objects.select_related(
                    "member",
                    "book_copy__book"
                ).get(
                    id=borrow_record_id,
                    member__user=request.user
                )
            except BorrowRecord.DoesNotExist:
                return Response(
                    {"error": "Borrow record not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            if borrow_record.status != "ACTIVE":
                return Response(
                    {"error": "This book is not currently borrowed"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            today = timezone.localdate()

            late_days = max(
                (today - borrow_record.exp_return).days,
                0
            )

            late_fine = late_days * 10

            borrow_fee = borrow_record.borrow_fee or 0

            already_paid = borrow_record.fine_amount_paid or 0

            total_amount = max(
                borrow_fee + late_fine - already_paid,
                0
            )

            amount = Decimal(str(total_amount))

        if not amount:
            return Response(
                {"error": "The amount fields should be specified"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount = Decimal(str(amount))
        except:
            return Response(
                {"error": "Invalid amount"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if amount <= 0:
            return Response(
                {"error": "Amount must be greater than 0"},
                status=status.HTTP_400_BAD_REQUEST
            )

        amount_in_paise = int(amount * 100)

        razorpay_order = client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1
        })

        payment = Payment.objects.create(
            user=request.user,
            borrow_record=borrow_record,
            razorpay_order_id=razorpay_order["id"],
            amount=amount,
            status="created"
        )

        response_data = {
            "message": "Order created successfully",
            "order_id": razorpay_order["id"],
            "amount": amount_in_paise,
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID
        }

        if borrow_record:
            today = timezone.localdate()

            late_days = max(
                (today - borrow_record.exp_return).days,
                0
            )

            late_fine = late_days * 10

            borrow_fee = borrow_record.borrow_fee or 0

            already_paid = borrow_record.fine_amount_paid or 0

            response_data.update({
                "borrow_record_id": borrow_record.id,
                "book_title": borrow_record.book_copy.book.title,
                "borrow_fee": borrow_fee,
                "late_days": late_days,
                "late_fine": late_fine,
                "already_paid": already_paid,
                "total_amount": float(amount)
            })

        return Response(response_data)


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_payment_id = request.data.get(
            "razorpay_payment_id"
        )

        razorpay_order_id = request.data.get(
            "razorpay_order_id"
        )

        razorpay_signature = request.data.get(
            "razorpay_signature"
        )

        if not all([
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        ]):
            return Response(
                {"error": "Payment details are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            payment = Payment.objects.select_related(
                "borrow_record"
            ).get(
                razorpay_order_id=razorpay_order_id,
                user=request.user
            )

            client.utility.verify_payment_signature({
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature
            })

            payment.razorpay_payment_id = razorpay_payment_id
            payment.status = "success"
            payment.save()

            borrow_record = payment.borrow_record

            if borrow_record:
                if borrow_record.status != "ACTIVE":
                    return Response(
                        {
                            "error": "This borrow record is no longer active"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                today = timezone.localdate()

                late_days = max(
                    (today - borrow_record.exp_return).days,
                    0
                )

                late_fine = late_days * 10

                borrow_record.fine_amount = late_fine
                borrow_record.fine_remaining = 0
                borrow_record.fine_amount_paid = late_fine
                borrow_record.status = "RETURN PENDING"
                borrow_record.save()

                return Response({
                    "message": "Payment verified successfully",
                    "payment_id": razorpay_payment_id,
                    "order_id": razorpay_order_id,
                    "status": "success",
                    "borrow_record_id": borrow_record.id,
                    "return_status": "RETURN PENDING"
                })

            return Response({
                "message": "Payment verified successfully",
                "payment_id": razorpay_payment_id,
                "order_id": razorpay_order_id,
                "status": "success"
            })

        except Payment.DoesNotExist:
            return Response(
                {"error": "Payment order not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception:
            payment = Payment.objects.filter(
                razorpay_order_id=razorpay_order_id,
                user=request.user
            ).first()

            if payment:
                payment.status = "failed"
                payment.save()

            return Response(
                {"error": "Payment verification failed"},
                status=status.HTTP_400_BAD_REQUEST
            )