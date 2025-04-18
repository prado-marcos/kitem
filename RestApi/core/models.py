from django.db import models
# pq importar user? pq o django ja tem um user padrao, e se eu quiser usar ele, eu preciso importar
# e fazer referencia a ele, caso contrario, eu teria que criar um user do zero, o que seria mais trabalhoso
from django.contrib.auth.models import User as Usuario

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
    nome = models.CharField(max_length=50, null=False, help_text="Nome do ingrediente")

    # self é a referência para a própria instância da classe
    # exemplo: tenho uma instancia da classe ingrediente chamada "ingrediente1" com nome "sal"
    # quando eu chamo o método __str__() em ingrediente1, ele retorna o nome "sal"
    def __str__(self):
        return self.nome
    
    # essa classe Meta é uma classe interna que define metadados para o modelo
    # metadados são informações adicionais sobre o modelo, como o nome da tabela no banco de dados
    class Meta:
        # managed = true significa que o Django irá gerenciar a tabela no banco de dados
        managed = True
        # db_table define o nome da tabela no banco de dados
        db_table = 'tab_ingrediente'
        # ordering define a ordem padrão de exibição dos objetos do modelo
        ordering = ['id']
        # verbose_name e verbose_name_plural definem os nomes exibidos no admin do Django
        verbose_name = 'Ingrediente'
        verbose_name_plural = 'Ingredientes'

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