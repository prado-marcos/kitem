from rest_framework import serializers
from .models import Ingrediente

class IngredienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingrediente
        fields = '__all__'

        extra_kwargs = {
            'id': {'read_only': True},  # O campo id é somente leitura
            'nome': {'required': True}, # O campo nome é obrigatório
            'error_messages': {
                    'blank': 'O nome do ingrediente não pode estar vazio.',
                    'required': 'O nome do ingrediente é obrigatório.',
                    'max_length': 'O nome do ingrediente não pode ter mais de 50 caracteres.'
            }
        }
