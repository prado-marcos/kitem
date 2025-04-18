from rest_framework import generics
from .models import Ingrediente, Receita, ReceitaIngrediente, Favorito, ListaCompras, ListaComprasIngrediente
from .serializers import (
    IngredienteSerializer,
    ReceitaSerializer,
    ReceitaIngredienteSerializer,
    FavoritoSerializer,
    ListaComprasSerializer,
    ListaComprasIngredienteSerializer,
)
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.decorators import api_view

# Views para a API de Ingredientes
class IngredienteListCreateAPIView(generics.ListCreateAPIView):
    queryset = Ingrediente.objects.all()
    serializer_class = IngredienteSerializer

# Adição de um método get_object para lidar com a busca de um objeto específico
class IngredienteRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ingrediente.objects.all()
    serializer_class = IngredienteSerializer
    def get_object(self):
        # tenta buscar o objeto
        try:
            # self.kwargs é um dicionário que contém os parâmetros da URL 
            return Ingrediente.objects.get(pk=self.kwargs['pk'])
        except Ingrediente.DoesNotExist:
            raise NotFound(detail="Ingrediente não encontrado.")
        except Exception as e:
            raise NotFound(detail=f"Erro inesperado: {str(e)}")

# Views para a API de Receitas
class ReceitaListCreateAPIView(generics.ListCreateAPIView):
    queryset = Receita.objects.all()
    serializer_class = ReceitaSerializer

class ReceitaRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Receita.objects.all()
    serializer_class = ReceitaSerializer
    def get_object(self):
        try:
            return Receita.objects.get(pk=self.kwargs['pk'])
        except Receita.DoesNotExist:
            raise NotFound(detail="Receita não encontrada.")
        except Exception as e:
            raise NotFound(detail=f"Erro inesperado: {str(e)}")

# Views para a API de ReceitaIngrediente
class ReceitaIngredienteListCreateAPIView(generics.ListCreateAPIView):
    queryset = ReceitaIngrediente.objects.all()
    serializer_class = ReceitaIngredienteSerializer

class ReceitaIngredienteRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ReceitaIngrediente.objects.all()
    serializer_class = ReceitaIngredienteSerializer
    def get_object(self):
        try:
            return ReceitaIngrediente.objects.get(pk=self.kwargs['pk'])
        except ReceitaIngrediente.DoesNotExist:
            raise NotFound(detail="ReceitaIngrediente não encontrado.")
        except Exception as e:
            raise NotFound(detail=f"Erro inesperado: {str(e)}")

# Views para a API de Favoritos
class FavoritoListCreateAPIView(generics.ListCreateAPIView):
    queryset = Favorito.objects.all()
    serializer_class = FavoritoSerializer

class FavoritoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Favorito.objects.all()
    serializer_class = FavoritoSerializer
    def get_object(self):
        try:
            return Favorito.objects.get(pk=self.kwargs['pk'])
        except Favorito.DoesNotExist:
            raise NotFound(detail="Favorito não encontrado.")
        except Exception as e:
            raise NotFound(detail=f"Erro inesperado: {str(e)}")

# Views para a API de Lista de Compras
class ListaComprasListCreateAPIView(generics.ListCreateAPIView):
    queryset = ListaCompras.objects.all()
    serializer_class = ListaComprasSerializer

class ListaComprasRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ListaCompras.objects.all()
    serializer_class = ListaComprasSerializer
    def get_object(self):
        try:
            return ListaCompras.objects.get(pk=self.kwargs['pk'])
        except ListaCompras.DoesNotExist:
            raise NotFound(detail="Lista de Compras não encontrada.")
        except Exception as e:
            raise NotFound(detail=f"Erro inesperado: {str(e)}")

# Views para a API de ListaComprasIngrediente
class ListaComprasIngredienteListCreateAPIView(generics.ListCreateAPIView):
    queryset = ListaComprasIngrediente.objects.all()
    serializer_class = ListaComprasIngredienteSerializer

class ListaComprasIngredienteRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ListaComprasIngrediente.objects.all()
    serializer_class = ListaComprasIngredienteSerializer
    def get_object(self):
        try:
            return ListaComprasIngrediente.objects.get(pk=self.kwargs['pk'])
        except ListaComprasIngrediente.DoesNotExist:
            raise NotFound(detail="Ingrediente da Lista de Compras não encontrado.")
        except Exception as e:
            raise NotFound(detail=f"Erro inesperado: {str(e)}")

@api_view(['GET'])
def api_root(request):
    return Response({
        "message": "Seja bem-vindo à API do kitem",
        "endpoints": {
            "ingredientes": "/api/ingredientes/",
            "ingrediente": "/api/ingredientes/<int:pk>/"
        }
    })

@api_view(['GET'])
def root(request):
    return Response({
        "message": "Seja bem-vindo à nossa aplicação",
        "Base de prod(atualmente indisponível)": "/api2/",
        "Base de dev": "/api/",
    })