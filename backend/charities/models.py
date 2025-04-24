from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.template.loader import render_to_string
import os

def project_image_path(instance, filename):
    # The instance.id might be None when creating a new project
    # Add a UUID or timestamp if id is not available
    from uuid import uuid4
    project_id = instance.id or uuid4().hex
    return f'projects/{instance.created_by.id}/{project_id}/{filename}'


class CharityProject(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    goal_amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount_raised = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    start_date = models.DateField()
    end_date = models.DateField()
    image = models.ImageField(upload_to='charity_images/', blank=True, null=True)
    location = models.CharField(max_length=255, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'accounts.UserAccount',
        on_delete=models.CASCADE,
        related_name='charities'
    )

    def save(self, *args, **kwargs):
        # Delete old image file when updating
        if self.pk:
            try:
                old_instance = CharityProject.objects.get(pk=self.pk)
                if old_instance.image and self.image != old_instance.image:
                    if os.path.isfile(old_instance.image.path):
                        os.remove(old_instance.image.path)
            except CharityProject.DoesNotExist:
                pass
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Delete image file when deleting project
        if self.image:
            if os.path.isfile(self.image.path):
                os.remove(self.image.path)
        super().delete(*args, **kwargs)

    @property
    def goal_reached(self):
        return self.amount_raised >= self.goal_amount

    @property
    def amount_needed(self):
        return max(self.goal_amount - self.amount_raised, 0)

    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']

class Donation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='donations'
    )
    project = models.ForeignKey('CharityProject', on_delete=models.CASCADE, related_name='donations')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    transaction_id = models.CharField(max_length=100, unique=True)


    def send_thank_you_email(self):
        subject = 'Thank you for your donation!'
        context = {
            'user': self.user,
            'amount': self.amount,
            'project': self.project,
            'date': self.date
        }
        html_message = render_to_string('emails/donation_thank_you.html', context)
        
        send_mail(
            subject=subject,
            message='',
            html_message=html_message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[self.user.email],
            fail_silently=False
        )

    def check_and_notify_goal_reached(self):
        if self.project.amount_raised >= self.project.goal_amount:
            subject = f'Goal Reached for {self.project.title}!'
            context = {
                'project': self.project,
                'goal_amount': self.project.goal_amount,
                'amount_raised': self.project.amount_raised
            }
            html_message = render_to_string('emails/goal_reached.html', context)
            
            # Send to project creator
            send_mail(
                subject=subject,
                message='',
                html_message=html_message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[self.project.created_by.email],
                fail_silently=False
            )
    
    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - ${self.amount} to {self.project.title}"