# PixelArc


[![Status do Projeto](https://img.shields.io/badge/status-em%20desenvolvimento-yellowgreen)](https://shields.io/)
[![Licença](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

> Uma plataforma de código aberto para armazenar, organizar e compartilhar suas fotos de forma segura na nuvem.

---

### Tabela de Conteúdos (Índice)
* [Sobre o Projeto](#sobre-o-projeto)
  * [Funcionalidades](#funcionalidades)
  * [Tecnologias Utilizadas](#tecnologias-utilizadas)
* [Como Começar](#como-começar)
  * [Pré-requisitos](#pré-requisitos)
  * [Instalação](#instalação)
* [Como Usar](#como-usar)
* [Autores](#autores)


---

## Sobre o Projeto

Implementação de um serviço de armazenamento de imagens ponta a ponta, construído com HTML5 e CSS3 no frontend, Node.js no backend. O sistema utiliza um banco de dados MongoDB para gerenciar metadados.

### Funcionalidades

- [✅] **Upload de Imagens:** Permite que o usuário envie múltiplas fotos de uma vez.
- [✅] **Criação de Álbuns:** Organização das fotos em galerias ou álbuns temáticos.
- [🚧] **Visualização em Grade:** Interface amigável para navegar pelas imagens.
- [🚧] **Segurança:** Autenticação de usuário para garantir a privacidade das fotos.


### Tecnologias Utilizadas

| Ferramenta | Descrição |
|-----------|-----------------------------------------------------------------|
| **Frontend** |`HTML5`, `CSS3`|
| **Backend** | `Node.js`|
| **Banco de Dados** | `MongoDB`|

---

## Como Começar

Siga estas instruções para ter uma cópia do projeto rodando na sua máquina local para desenvolvimento e testes.

### 1. Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

* **Node.js**: `v18.x` ou superior - [Link para download](https://nodejs.org/)
* **Git**: `v2.x` ou superior - [Link para download](https://git-scm.com/)
* **MongoDB**: `v6.0` ou superior - [Link para download](https://www.mongodb.com/try/download/community)

### 2. Passos de Instalação

1. **Clone o repositório:**
    ```bash
    git clone [https://github.com/fabiosato0/Web-Back-End.git](https://github.com/fabiosato0/Web-Back-End.git)
    ```

2. **Navegue até a pasta do projeto:**
    ```bash
    cd Web-Back-End
    ```

3. **Instale as dependências:**
    ```bash
    npm install
    ```
4. **Configure as variáveis de ambiente:**
    * Crie uma cópia do arquivo de exemplo `.env.example` (se ele existir) ou crie um arquivo `.env` na raiz do projeto.
    * Adicione as variáveis necessárias. Exemplo:
    ```env
    MONGO_URI="mongodb://localhost:27017/pixelarc"
    JWT_SECRET="sua_chave_secreta_aqui"
    PORT=3333
    ```

5. **Inicie o servidor local do MongoDB:**
    * Antes de rodar a aplicação, o banco de dados precisa estar ativo.
    * **No macOS (usando Homebrew):**
        ```bash
        brew services start mongodb-community
        ```
    * **No Linux (usando systemd):**
        ```bash
        sudo systemctl start mongod
        ```
    > **Nota:** No Windows, o MongoDB geralmente inicia automaticamente se instalado como um serviço.

6. **Execute a aplicação em modo de desenvolvimento:**
    ```bash
    npm start
    ```
A aplicação backend estará disponível em `http://localhost:3333` (ou a porta que você definiu).

---

## Como Usar

**Exemplo:**
Após iniciar o servidor, você pode usar uma ferramenta como o [Insomnia](https://insomnia.rest/) ou [Postman](https://www.postman.com/) para testar os endpoints da API.

1.  **POST** `/register` para criar um novo usuário.
2.  **POST** `/login` para autenticar e receber um token.
3.  **POST** `/photos` (com token de autorização) para fazer upload de uma foto.

---

## Autores

* **[Fabio Hideki Sato]** - [@fabiosato0](https://github.com/fabiosato0)
* **[Matheus Ferreira Alphonse dos Anjos]** - [@matheustm29](https://github.com/usuario-colega1)