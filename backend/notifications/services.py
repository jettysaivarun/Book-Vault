from .models import Notifications

def create_notification(recipient,title,message):
    notification=Notifications.objects.create(recipient=recipient,title=title,message=message)
    return notification