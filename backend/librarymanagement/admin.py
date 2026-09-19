from django.contrib import admin
from .models import BorrowRecord,Book,BookCopy,Member
# Register your models here.
admin.site.register(BookCopy)
admin.site.register(Book)
admin.site.register(BorrowRecord)
admin.site.register(Member)