from django.urls import path
from . import views_api  # Importa as views do arquivo views_api.py
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views_api import CustomTokenObtainPairView, GetReceitaUsuario, ReceitaMaisAcessadasAPIView, ReceitaAleatoriaAPIView, ReceitasFavoritasAPIView

urlpatterns = [
    # API Root (opcional, pode ser removido se não for necessário)
    path('', views_api.api_root, name='api-root'),

    # rota de auth
    path('auth/login2/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # URLs para Usuários
    path('usuarios/', views_api.UsuarioListCreateAPIView.as_view(), name='usuario-list-create'),
    path('usuarios/<int:pk>/', views_api.UsuarioRetrieveUpdateDestroyAPIView.as_view(), name='usuario-detail'),
    # URL para obter receitas favoritas de um usuário específico
    path('usuarios/<int:id_usuario>/favoritos/', ReceitasFavoritasAPIView.as_view(), name='receitas-favoritas'),

    # URLs para Ingredientes
    path('ingredientes/', views_api.IngredienteListCreateAPIView.as_view(), name='ingrediente-list-create'),
    path('ingredientes/<int:pk>/', views_api.IngredienteRetrieveUpdateDestroyAPIView.as_view(), name='ingrediente-detail'),

    # URLs para Receitas
    path('receitas/', views_api.ReceitaListCreateAPIView.as_view(), name='receita-list-create'),
    path('receitas/<int:pk>/', views_api.ReceitaRetrieveUpdateDestroyAPIView.as_view(), name='receita-detail'),
    # URL para receitas por categoria
    path('receitas/usuario/<int:user_id>/', GetReceitaUsuario.as_view(), name='receitas-por-usuario'),
    # URL para Receita Detalhada
    path('receitas/<int:pk>/detalhada/', views_api.ReceitaDetalhadaAPIView.as_view(), name='receita-detalhada'),
    # URL para filtro de receitas
    path('receitas/filtrar/', views_api.ReceitaFilterAPIView.as_view(), name='receita-filtrar'),
    # URL para receitas mais acessadas
    path('receitas/mais-acessadas/', ReceitaMaisAcessadasAPIView.as_view(), name='receitas-mais-acessadas'),
    # URL para receitas aleatórias
    path('receitas/aleatorias/', ReceitaAleatoriaAPIView.as_view(), name='receitas-aleatorias'),

    # URLs para ReceitaIngrediente
    path('receita_ingredientes/', views_api.ReceitaIngredienteListCreateAPIView.as_view(), name='receita-ingrediente-list-create'),
    path('receita_ingredientes/<int:pk>/', views_api.ReceitaIngredienteRetrieveUpdateDestroyAPIView.as_view(), name='receita-ingrediente-detail'),

    # URLs para Favoritos
    path('favoritos/', views_api.FavoritoListCreateAPIView.as_view(), name='favorito-list-create'),
    path('favoritos/<int:pk>/', views_api.FavoritoRetrieveUpdateDestroyAPIView.as_view(), name='favorito-detail'),

    # URLs para Lista de Compras
    path('listas_compras/', views_api.ListaComprasListCreateAPIView.as_view(), name='lista-compras-list-create'),
    path('listas_compras/<int:pk>/', views_api.ListaComprasRetrieveUpdateDestroyAPIView.as_view(), name='lista-compras-detail'),

    # URLs para ListaComprasIngrediente
    path('listas_compras_ingredientes/', views_api.ListaComprasIngredienteListCreateAPIView.as_view(), name='lista-compras-ingrediente-list-create'),
    path('listas_compras_ingredientes/<int:pk>/', views_api.ListaComprasIngredienteRetrieveUpdateDestroyAPIView.as_view(), name='lista-compras-ingrediente-detail'),
]
