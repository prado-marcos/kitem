from django.urls import path
from . import views_api  # Importa as views do arquivo views_api.py

urlpatterns = [
    # API Root (opcional, pode ser removido se não for necessário)
    path('', views_api.api_root, name='api-root'),

    # URLs para Ingredientes
    path('ingredientes/', views_api.IngredienteListCreateAPIView.as_view(), name='ingrediente-list-create'),
    path('ingredientes/<int:pk>/', views_api.IngredienteRetrieveUpdateDestroyAPIView.as_view(), name='ingrediente-detail'),

    # URLs para Receitas
    path('receitas/', views_api.ReceitaListCreateAPIView.as_view(), name='receita-list-create'),
    path('receitas/<int:pk>/', views_api.ReceitaRetrieveUpdateDestroyAPIView.as_view(), name='receita-detail'),
    # URL para filtro de receitas
    path('receitas/filtrar/', views_api.ReceitaFilterAPIView.as_view(), name='receita-filtrar'),

    # URLs para ReceitaIngrediente
    path('receita-ingredientes/', views_api.ReceitaIngredienteListCreateAPIView.as_view(), name='receita-ingrediente-list-create'),
    path('receita-ingredientes/<int:pk>/', views_api.ReceitaIngredienteRetrieveUpdateDestroyAPIView.as_view(), name='receita-ingrediente-detail'),

    # URLs para Favoritos
    path('favoritos/', views_api.FavoritoListCreateAPIView.as_view(), name='favorito-list-create'),
    path('favoritos/<int:pk>/', views_api.FavoritoRetrieveUpdateDestroyAPIView.as_view(), name='favorito-detail'),

    # URLs para Lista de Compras
    path('listas-compras/', views_api.ListaComprasListCreateAPIView.as_view(), name='lista-compras-list-create'),
    path('listas-compras/<int:pk>/', views_api.ListaComprasRetrieveUpdateDestroyAPIView.as_view(), name='lista-compras-detail'),

    # URLs para ListaComprasIngrediente
    path('listas-compras-ingredientes/', views_api.ListaComprasIngredienteListCreateAPIView.as_view(), name='lista-compras-ingrediente-list-create'),
    path('listas-compras-ingredientes/<int:pk>/', views_api.ListaComprasIngredienteRetrieveUpdateDestroyAPIView.as_view(), name='lista-compras-ingrediente-detail'),
]