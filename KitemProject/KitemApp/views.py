from django.shortcuts import render, HttpResponse, redirect
from .models import Ingrediente
# from .models import TodoItem

def home(request):
    return render(request, 'home.html')

def ingredientes(request):
    items = Ingrediente.objects.all()
    return render(request, 'ingredientes.html', {'ingredientes': items})

def novo_ingrediente(request):
    if request.method == 'POST':
        nome = request.POST.get('nome')
        if nome:  
            Ingrediente.objects.create(nome=nome)
            return redirect('ingredientes') 
    return render(request, 'novoIngrediente.html')

def atualiza_ingrediente(request, id_ingrediente):
    ingrediente = Ingrediente.objects.get(id=id_ingrediente)
    if request.method == 'POST':
        nome = request.POST.get('nome')
        if nome:
            ingrediente.nome = nome
            ingrediente.save()
            return redirect('ingredientes')
    return render(request, 'atualizaIngrediente.html', {'ingrediente': ingrediente})

def deleta_ingrediente(request, id_ingrediente):
    ingrediente = Ingrediente.objects.get(id=id_ingrediente)
    if request.method == 'POST':
        ingrediente.delete()
        return redirect('ingredientes')
    return render(request, 'deletaIngrediente.html', {'ingrediente': ingrediente})


# def todos(request):
#     items = TodoItem.objects.all()
#     return render(request, 'todos.html', {'todos': items})