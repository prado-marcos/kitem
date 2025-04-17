from rest_framework import generics
from .models import Ingrediente
from .serializers import IngredienteSerializer
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

@api_view(['GET'])
def api_root(request):
    return Response({
        "message": "Seja bem-vindo à API do kitem",
        "endpoints": {
            "ingredientes": "/api/ingredientes/"
        }
    })

@api_view(['GET'])
def root(request):
    return Response({
        "message": "Seja bem-vindo à nossa aplicação",
        "Base de prod(atualmente indisponível)": "/api2/",
        "Base de dev": "/api/",
    })