# API - Gerenciador de Tarefas

A **API de Gerenciador de Tarefas** é um projeto que simula a gestão de tarefas em times, permitindo o controle de **usuários, times e tarefas.** O objetivo principal é praticar o desenvolvimento de uma aplicação **Node.js com TypeScript,** utilizando **Prisma ORM** para comunicação com o banco de dados, além de implementar boas práticas de arquitetura, autenticação JWT, perfis de usuários e validação de permissões.

---

## 🛠 **Tecnologias e Ferramentas**

Aqui estão as tecnologias utilizadas no desenvolvimento deste projeto:

- **Node.js**: Ambiente de execução do servidor.
- **TypeScript**: Superset do JavaScript com tipagem estática.
- **Express**: Framework para criação de rotas e controle da API.
- **Prisma ORM**: Mapeamento objeto-relacional para banco de dados.
- **PostgreSQL**: Banco de dados relacional utilizado.
- **Zod**: Validação de dados de entrada.
- **JWT (JSON Web Token)**: Autenticação de usuários.
- **Bcrypt**: Criptografia de senhas.
- **Docker & Docker Compose**: Criação e gerenciamento de containers para o ambiente de desenvolvimento.
- **Jest**: Testes automatizados.
- **Insomnia**: Testes de rotas e requisições.
- **Git & GitHub**: Controle de versão e hospedagem do código.

---

## ⚙️ **Funcionalidades**

A API conta com as seguintes funcionalidades principais:

- **Autenticação & Autorização**
  - Cadastro de usuários com senha criptografada.
  - Login com autenticação JWT.
  - Diferenciação de perfis (`admin` e `member`).
  - Proteção de rotas com base na autenticação.
  - Restrições de acesso baseadas na `role` do usuário.

- **Usuários**
  - Criação de novos usuários (apenas por `admin`).
  - Listagem de todos os usuários (apenas por `admin`).
  - Visualização de um usuário específico.
  - Atualização de dados e `role` de usuários (apenas por `admin`).
  - Exclusão de usuários (apenas por `admin`).

- **Times**
  - Criação de times.
  - Adição de usuários a times.
  - Restrição de acesso a tarefas com base na participação no time.

- **Tarefas**
  - Criação de tarefas vinculadas a times e usuários.
  - Listagem de tarefas por time.
  - Alteração do status (`pending`, `in_progress`, `completed`) e prioridade (`high`, `medium`, `low`).
  - Histórico de mudanças de status da tarefa.

---

## 📝 **Licença**

Este projeto está sob a licença **MIT**. Para mais detalhes, consulte o arquivo [LICENSE](./LICENSE).

---

## 👨🏻‍💻 **Autor**

Feito por **Murillo Ressineti**, aluno da Rocketseat e desenvolvedor Full-Stack. Conecte-se comigo no LinkedIn para mais informações:

[![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/murilloressineti/)

---

## 📬 **Contato**

Se você tiver dúvidas, sugestões ou gostaria de discutir sobre o projeto, sinta-se à vontade para entrar em contato!
