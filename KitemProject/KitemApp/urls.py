from django.urls import path
from . import views 

urlpatterns = [
    path('', views.home, name='home'),
    path('ingredientes/', views.ingredientes, name='ingredientes'),
    # path('todos/', views.todos, name='todos'),
]