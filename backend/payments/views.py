from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from decimal import Decimal
from .models import Payment
from .razorpay_utils import client
from django.conf import settings

class CreateOrderView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        amount=request.data.get('amount')
        if not amount:
            return Response({"error":"The amount fields should be specified"},status=status.HTTP_400_BAD_REQUEST)
        try:
            amount=Decimal(str(amount))
        except:
            return Response({"error":"Invalid amount"})
        
        if amount <= 0:
            return Response(
                {"error": "Amount must be greater than 0"},
                status=status.HTTP_400_BAD_REQUEST
            )
        amount_in_paise=int(amount*100)
        razorpay_order = client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1
        })

        payment = Payment.objects.create(
            user=request.user,
            razorpay_order_id=razorpay_order["id"],
            amount=amount,
            status="created"
        )

        return Response({
            "message": "Order created successfully",
            "order_id": razorpay_order["id"],
            "amount": amount_in_paise,
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID
        })
        
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

            payment = Payment.objects.get(
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