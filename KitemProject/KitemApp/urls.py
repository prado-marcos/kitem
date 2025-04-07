from django.urls import path
from . import views 

urlpatterns = [
    path('', views.home, name='home'),
    path('ingredientes/', views.ingredientes, name='ingredientes'),
    path('novo_ingrediente/', views.novo_ingrediente, name='novo_ingrediente'),
    path('ingredientes/atualiza/<int:id_ingrediente>/', views.atualiza_ingrediente, name='atualiza_ingrediente'),
    path('ingredientes/deleta/<int:id_ingrediente>/', views.deleta_ingrediente, name='deleta_ingrediente'),
]