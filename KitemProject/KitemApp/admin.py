from django.contrib import admin
from .models import Usuario, Receita, Ingrediente, ReceitaIngrediente, Favorito, ListaCompras, ListaComprasIngrediente

# Register your models here.
admin.site.register(Usuario)
admin.site.register(Receita)
admin.site.register(Ingrediente)
admin.site.register(ReceitaIngrediente)
admin.site.register(Favorito)
admin.site.register(ListaCompras)
admin.site.register(ListaComprasIngrediente)