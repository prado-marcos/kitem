from django.db import models

class Usuario(models.Model):
    id = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=50, null=False)
    email = models.EmailField(max_length=50, unique=True, null=False)
    senha = models.CharField(max_length=50, null=False)


class Receita(models.Model):
    id = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='receitas')
    titulo = models.CharField(max_length=50, null=False)
    descricao = models.CharField(max_length=255, null=False)
    tempo_preparo = models.TimeField(null=False)
    dificuldade = models.CharField(max_length=25, null=False)
    quantidade_visualizacao = models.IntegerField(default=0, null=False)


class Ingrediente(models.Model):
    id = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=50, null=False)


class ReceitaIngrediente(models.Model):
    id = models.AutoField(primary_key=True)
    id_ingrediente = models.ForeignKey(Ingrediente, on_delete=models.CASCADE, related_name='receitas')
    id_receita = models.ForeignKey(Receita, on_delete=models.CASCADE, related_name='ingredientes')
    quantidade = models.FloatField(null=False)
    unidade_medida = models.CharField(max_length=25, null=False)


class Favorito(models.Model):
    id = models.AutoField(primary_key=True)
    id_receita = models.ForeignKey(Receita, on_delete=models.CASCADE, related_name='favoritos')
    id_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='favoritos')


class ListaCompras(models.Model):
    id = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='listas_compras')


class ListaComprasIngrediente(models.Model):
    id = models.AutoField(primary_key=True)
    id_ingrediente = models.ForeignKey(Ingrediente, on_delete=models.CASCADE, related_name='listas_compras')
    id_lista = models.ForeignKey(ListaCompras, on_delete=models.CASCADE, related_name='ingredientes')
    quantidade = models.FloatField(null=False)
    unidade_medida = models.CharField(max_length=25, null=False)
    preco = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)