# from django.db import models
# from django.contrib.auth.models import User
# from django.utils.timezone import now

# # Create your models here.
# class Project(models.Model):
#     title = models.CharField(max_length=100)
#     description = models.TextField()
#     goal_amount = models.DecimalField(max_digits=10, decimal_places=2)
#     amount_raised = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
#     start_date = models.DateTimeField(default=now)
#     end_date = models.DateTimeField() 
#     created_at = models.DateTimeField(auto_now_add=True)
#     author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
#     image = models.ImageField(upload_to='project_images/', blank=True, null=True)
#     # Add any other fields you need, like location, city, etc.
    
    
#     @property
#     def percentage_completed(self):
#         if self.goal_amount > 0:
#             return (self.amount_raised / self.goal_amount) * 100
#         return 0


#     def __str__(self):
#         return self.title