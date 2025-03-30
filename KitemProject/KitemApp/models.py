from django.db import models

# Create your models here.

class Ingrediente(models.Model):
    id = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=50)


# class TodoItem(models.Model):
#     title = models.CharField(max_length=200)
#     description = models.TextField()
#     completed = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)