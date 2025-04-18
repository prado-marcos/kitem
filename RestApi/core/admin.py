from django.contrib import admin
from core.models import (
    Ingrediente,
    Receita,
    ReceitaIngrediente,
    Favorito,
    ListaCompras,
    ListaComprasIngrediente,
)

# Registro das models no admin
admin.site.register(Ingrediente)
admin.site.register(Receita)
admin.site.register(ReceitaIngrediente)
admin.site.register(Favorito)
admin.site.register(ListaCompras)
admin.site.register(ListaComprasIngrediente)