from django.db import models
from django.contrib.auth.models import User
from librarymanagement.models import BookCopy

# Create your models here.
class Reservation(models.Model):

    STATUS_CHOICES = [
        ("ACTIVE", "ACTIVE"),
        ("CANCELLED", "CANCELLED"),
        ("COMPLETED", "COMPLETED"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    book_copy = models.ForeignKey(
        BookCopy,
        on_delete=models.CASCADE
    )

    reserved_date = models.DateField()
    exp_return = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.book_copy.book.title}"
    
class Notifications(models.Model):
    recipient=models.ForeignKey(User,on_delete=models.CASCADE,related_name="notifications")
    title=models.CharField(max_length=255)
    message=models.TextField()
    is_read=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering=["-created_at"]
    def __str__(self):
        return f"{self.recipient.username} - {self.title}"