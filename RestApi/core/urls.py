from django.urls import path
from . import views_api # Importa as views do arquivo views.py da mesma pasta

urlpatterns = [
    # Define as URLs da API
    path('', views_api.api_root, name='api-root'),   # <-- AQUI
    path('ingredientes/', views_api.IngredienteListCreateAPIView.as_view(), name='ingrediente-list-create'), 
    path('ingredientes/<int:pk>/', views_api.IngredienteRetrieveUpdateDestroyAPIView.as_view(), name='ingrediente-detail'),
]