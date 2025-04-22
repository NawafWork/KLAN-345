from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

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