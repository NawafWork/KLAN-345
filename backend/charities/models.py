from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
import os

def project_image_path(instance, filename):
    # Generate unique path for project images
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
    image = models.ImageField(
        upload_to=project_image_path,  # Change this from 'charity_images/'
        blank=True, 
        null=True
    )
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
    
    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - ${self.amount} to {self.project.title}"