from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import BookCopyView,BorrowRecordView,BookView,MemberView
router=DefaultRouter()
router.register("books",BookView)
router.register("bookcopies",BookCopyView)
router.register("borrow",BorrowRecordView)
router.register("members",MemberView)

urlpatterns=router.urls