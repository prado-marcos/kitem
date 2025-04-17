# Criando uma API CRUD completo  no Django REST Framework
    1º é criar um ambiente virtual com *python -m venv .venv*
        para ativar: *.venv\Scripts\Activate.ps1*
    2º é instalar django com *pip install django*
    3º criar projeto com * django-admin startproject setup . *
# Primeiras configurações
## settings 
    primeiro criei a django_apps, third_party-apps e local_apps que juntos formarão a installed_apps
### não deixar key exposta 
    pip install python_decouple
    mudar o SECRET_KEY para o env
    mudar o debug para o env
### pip install dj-database-url
transformar os strings de conexão com banco de dados no padrão de dicionario usado pelo django
# primeira vez rodando 
    python manage.py migrate
         ajuda a vida do desenvolvedor Django na hora de criar a estrutura do banco de dados da nossa aplicação
         Esse comando verifica as migrações pendentes e as aplica ao banco de dados, criando ou atualizando tabelas conforme necessário
    python manage.py makemigrations 
         cria um arquivo de migração na pasta migrations da sua app. Ele contém instruções para Django aplicar essas mudanças no banco de dados.   
    python manage.py runserver
         roda aplicação 
         posso usar a rota pronta /admin que leva para interface de adm
    python manage.py createsuperuser
        criar usuario admin

# crud 
    duvida: Meu projeto tem as entidades usuario,cliente,assinatura e produtos. Posso criar uma app com todas essas entidades ou devo criar uma app para cada?
        https://pt.stackoverflow.com/questions/379843/%C3%89-necess%C3%A1rio-criar-uma-app-para-cada-entidade-em-um-projeto-django

# dependencias 
## pip install black 
    formatação do codigo em python
    executa com * black . *
    para configurar o vscode a incluir o black no auto-save : 

