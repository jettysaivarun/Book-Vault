from django.db import models
from django.contrib.auth.models import User
from librarymanagement.models import BookCopy

# Create your models here.
class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book_copy = models.ForeignKey(BookCopy, on_delete=models.CASCADE)
    reserved_date = models.DateField()
    exp_return=models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)