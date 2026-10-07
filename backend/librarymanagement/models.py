from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField
# Create your models here.
class Book(models.Model):
    CATEGORY_CHOICES = [
        ("FICTION", "FICTION"),
        ("NON_FICTION", "NON_FICTION"),
        ("SCIENCE", "SCIENCE"),
        ("TECHNOLOGY", "TECHNOLOGY"),
        ("ENGINEERING", "ENGINEERING"),
        ("BUSINESS", "BUSINESS"),
        ("HISTORY", "HISTORY"),
        ("GEOGRAPHY", "GEOGRAPHY"),
        ("ARTS", "ARTS"),
        ("PHILOSOPHY", "PHILOSOPHY"),
        ("SOCIAL_SCIENCE", "SOCIAL_SCIENCE"),
        ("EDUCATION", "EDUCATION"),
        ("HEALTH", "HEALTH"),
        ("LAW", "LAW"),
        ("CHILDREN", "CHILDREN"),
    ]
    LANGUAGE_CHOICES = [
        ("ENGLISH", "ENGLISH"),
        ("HINDI", "HINDI"),
        ("MALAYALAM", "MALAYALAM"),
        ("TAMIL", "TAMIL"),
        ("TELUGU", "TELUGU"),
        ("KANNADA", "KANNADA"),
        ("BENGALI", "BENGALI"),
        ("MARATHI", "MARATHI"),
        ("FRENCH", "FRENCH"),
        ("GERMAN", "GERMAN"),
    ]
    
    image=CloudinaryField("image",folder="book_images/",null=True,blank=True)
    is_book_of_the_day=models.BooleanField(default=False)
    title=models.CharField(max_length=100)
    isbn=models.CharField(max_length=10,unique=True)
    author=models.CharField(max_length=100)
    publisher=models.CharField(max_length=100)
    category=models.CharField(choices=CATEGORY_CHOICES,max_length=100)
    language=models.CharField(choices=LANGUAGE_CHOICES,max_length=100)
    ebook=CloudinaryField("ebook",folder="ebooks",resource_type="raw",null=True,blank=True)
    def __str__(self):
            return self.title
class BookCopy(models.Model):
    STATUS_CHOICES=[
        ("AVAILABLE", "AVAILABLE"),
        ("BORROWED", "BORROWED"),
        ("RESERVED", "RESERVED"),
        ("LOST", "LOST"),
        ("DAMAGED", "DAMAGED"),
    ]
    
    book=models.ForeignKey(Book,on_delete=models.CASCADE)
    copy_number=models.IntegerField()
    status=models.CharField(choices=STATUS_CHOICES,max_length=100,default="AVAILABLE")
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["book", "copy_number"],
                name="unique_book_copy_number"
            )
        ]
class Member(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    profile_picture=CloudinaryField("image",folder="profile/",null=True,blank=True)
    borrow_updates=models.BooleanField(default=True)
    return_updates=models.BooleanField(default=True)
    
class BorrowRecord(models.Model):
    BORROW_STATUS_CHOICES = [
        ("BORROW PENDING","BORROW PENDING"),
        ("RETURN PENDING","RETURN PENDING"),
        ("ACTIVE", "ACTIVE"),
        ("RETURNED", "RETURNED"),
        ("LOST", "LOST"),
        ("DAMAGED", "DAMAGED"),
    ]
    
    book_copy=models.ForeignKey(BookCopy,on_delete=models.CASCADE)
    member=models.ForeignKey(Member,on_delete=models.CASCADE)
    date=models.DateField(auto_now=True)
    exp_return=models.DateField(null=True,blank=True)
    act_return=models.DateField(null=True,blank=True)
    status=models.CharField(choices=BORROW_STATUS_CHOICES,max_length=100)
    borrow_fee=models.IntegerField(default=0)
    fine_amount=models.IntegerField(default=0)
    fine_amount_paid=models.IntegerField(default=0)
    fine_remaining=models.IntegerField(default=0)
