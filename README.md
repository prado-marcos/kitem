# 🍳 Kitem - Frontend do Sistema de Gerenciamento de Receitas

## 📋 **Sobre o Sistema**

O **Kitem** é uma plataforma web completa para entusiastas da culinária que desejam:

- **Descobrir novas receitas** através de busca inteligente e filtros personalizados
- **Criar e gerenciar suas próprias receitas** com ingredientes, instruções e imagens
- **Organizar listas de itens** necessários para preparar suas receitas favoritas
- **Salvar receitas favoritas** para acesso rápido e fácil
- **Explorar receitas por categoria** (doces, salgados, veganos, sem glúten, etc.)

O sistema foi desenvolvido como uma solução prática para quem gosta de cozinhar e quer ter suas receitas organizadas em um só lugar, facilitando o planejamento de refeições e a organização da cozinha.

## ✨ **Funcionalidades**

### **Descoberta de Receitas**
- Busca por título, ingredientes e filtros avançados
- Filtros por restrições alimentares, tipo, dificuldade e tempo
- Seleção múltipla de ingredientes
- Receitas populares e sugestões personalizadas

### **Sistema de Usuário**
- Login e registro com autenticação
- Gerenciamento de perfil
- Sistema de favoritos
- Lista de itens baseada nas receitas

### **Gerenciamento de Receitas**
- Criação e edição de receitas
- Anexo de link com imagem.
- Sistema completo de ingredientes com quantidades
- Classificação por dificuldade

### **Lista de Itens**
- Geração a partir das receitas ou manualmente
- Gerenciamento interativo de itens
- Organização e facilitação

### **Denúncia**
- Permite que usuários registrem uma denuncia em relação a conteudo inadequado para a plataforma
- Botão de denúncia encontrado nas páginas de receitas


## 🛠️ **Tecnologias**

- **React 19** - Interface de usuário
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **Material-UI** - Componentes
- **Framer Motion** - Animações
- **React Router** - Navegação
- **Axios** - Comunicação com API

## 🚀 **Instalação e Execução**

### **Pré-requisitos**
- Node.js (versão 18 ou superior)
- npm

### **Instalação**
```bash
# Clone o repositório
git clone https://github.com/prado-marcos/kitem.git
cd kitem

# Instale as dependências
npm install
```

### **Execução**
```bash
# Modo de desenvolvimento
npm run dev
```

O servidor de desenvolvimento será iniciado em `http://localhost:5173`

## 📁 **Estrutura do Projeto**

```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── router/        # Configuração de rotas
├── hooks/         # Custom hooks
├── services/      # Serviços e API
├── constants/     # Constantes
└── assets/        # Recursos estáticos
```

## 🔧 **Configuração**

O projeto está configurado para usar o backend em produção:
- **API URL**: `https://back-kitem-e12u.onrender.com/api`
- **Proxy**: Configurado no Vite para desenvolvimento local

Para usar um backend local, edite `src/services/api.ts` e altere a URL da API.

## 📝 **Scripts Disponíveis**

- `npm run dev` - Servidor de desenvolvimento

---

**Projeto elaborado com caráter facultativo (trabalho de conclusão de disciplina)**