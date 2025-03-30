from django.shortcuts import render, HttpResponse
from .models import Ingrediente
# from .models import TodoItem

def home(request):
    return render(request, 'home.html')

def ingredientes(request):
    items = Ingrediente.objects.all()
    return render(request, 'ingredientes.html', {'ingredientes': items})
# def todos(request):
#     items = TodoItem.objects.all()
#     return render(request, 'todos.html', {'todos': items})