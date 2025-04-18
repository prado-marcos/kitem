from rest_framework import serializers
from .models import Ingrediente, Receita, ReceitaIngrediente, Favorito, ListaCompras, ListaComprasIngrediente

# Serializer para o modelo Ingrediente
class IngredienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingrediente
        fields = '__all__'  # Inclui todos os campos do modelo
        extra_kwargs = {
            'id': {'read_only': True},  # O campo 'id' é somente leitura
            'nome': {
                'required': True,  # O campo 'nome' é obrigatório
                'error_messages': {  # Mensagens de erro personalizadas
                    'blank': 'O nome do ingrediente não pode estar vazio.',
                    'required': 'O nome do ingrediente é obrigatório.',
                    'max_length': 'O nome do ingrediente não pode ter mais de 50 caracteres.'
                }
            }
        }

# Serializer para o modelo Receita
class ReceitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receita
        fields = '__all__'
        extra_kwargs = {
            'id': {'read_only': True},
            'titulo': {
                'required': True,
                'error_messages': {
                    'blank': 'O título da receita não pode estar vazio.',
                    'required': 'O título da receita é obrigatório.',
                    'max_length': 'O título da receita não pode ter mais de 50 caracteres.'
                }
            },
            'descricao': {
                'required': True,
                'error_messages': {
                    'blank': 'A descrição não pode estar vazia.',
                    'required': 'A descrição é obrigatória.',
                    'max_length': 'A descrição não pode ter mais de 255 caracteres.'
                }
            },
            'tempo_preparo': {'required': True},  # Campo obrigatório
            'dificuldade': {'required': True},  # Campo obrigatório
            'quantidade_visualizacao': {'read_only': True}  # Somente leitura
        }

# Serializer para o modelo ReceitaIngrediente
class ReceitaIngredienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReceitaIngrediente
        fields = '__all__'
        extra_kwargs = {
            'id': {'read_only': True},
            'id_ingrediente': {'required': True},  # Campo obrigatório
            'id_receita': {'required': True},  # Campo obrigatório
            'quantidade': {
                'required': True,
                'error_messages': {
                    'invalid': 'A quantidade deve ser um número válido.'  # Mensagem de erro personalizada
                }
            },
            'unidade_medida': {
                'required': True,
                'error_messages': {
                    'blank': 'A unidade de medida não pode estar vazia.',
                    'required': 'A unidade de medida é obrigatória.'
                }
            }
        }

# Serializer para o modelo Favorito
class FavoritoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorito
        fields = '__all__'
        extra_kwargs = {
            'id': {'read_only': True},
            'id_receita': {'required': True},  # Campo obrigatório
            'id_usuario': {'required': True}  # Campo obrigatório
        }

# Serializer para o modelo ListaCompras
class ListaComprasSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListaCompras
        fields = '__all__'
        extra_kwargs = {
            'id': {'read_only': True},
            'id_usuario': {'required': True}  # Campo obrigatório
        }

# Serializer para o modelo ListaComprasIngrediente
class ListaComprasIngredienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListaComprasIngrediente
        fields = '__all__'
        extra_kwargs = {
            'id': {'read_only': True},
            'id_ingrediente': {'required': True},  # Campo obrigatório
            'id_lista': {'required': True},  # Campo obrigatório
            'quantidade': {
                'required': True,
                'error_messages': {
                    'invalid': 'A quantidade deve ser um número válido.'
                }
            },
            'unidade_medida': {
                'required': True,
                'error_messages': {
                    'blank': 'A unidade de medida não pode estar vazia.',
                    'required': 'A unidade de medida é obrigatória.'
                }
            },
            'preco': {
                'required': False,  # Campo opcional
                'error_messages': {
                    'invalid': 'O preço deve ser um número decimal válido.'
                }
            }
        }
