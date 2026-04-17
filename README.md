# 📅 Sistema de Agendamento Online

## 📌 Descrição

Este projeto consiste no desenvolvimento de um **Sistema Web de Agendamento Online**, criado como parte do Projeto Integrador do curso de Ciência de Dados / Engenharia de Sistemas / Bacharelado em Tecnologia da Informação.

A aplicação tem como objetivo permitir o gerenciamento eficiente de horários de atendimento de uma profissional da área de psicologia, possibilitando o cadastro de clientes, controle de agenda e organização dos atendimentos.

---

## 🎯 Objetivos do Projeto

* Desenvolver uma aplicação web utilizando **Python**
* Implementar integração com **banco de dados em nuvem (Supabase)**
* Aplicar conceitos de versionamento com Git e GitHub
* Criar um sistema funcional de agendamento
* Proporcionar melhor organização da agenda profissional

---

## 🚀 Funcionalidades

✔ Cadastro de usuários
✔ Autenticação de login
✔ Cadastro de pacientes
✔ Cadastro de agentes comunitários
✔ Cadastro de horários disponíveis
✔ Agendamento de consultas
✔ Listagem de agendamentos
✔ Cancelamento de atendimentos
✔ Persistência de dados em banco na nuvem

---

## 🛠️ Tecnologias Utilizadas

* **Python**
* Flask
* Pytest
* Pydantic
* **Supabase (PostgreSQL Cloud Database)**
* HTML
* CSS
* JavaScript
* Git / GitHub

---

## 🗄️ Banco de Dados

O sistema utiliza o **Supabase**, uma plataforma backend que fornece:

* Banco de dados PostgreSQL em nuvem
* API automática para acesso aos dados
* Sistema de autenticação
* Armazenamento seguro

---

## 📂 Estrutura do Projeto

```
agemdaSaude/
│
├── backend
│   │
│   ├── venv
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   │
│   ├── src
│   │   ├── api
│   │   │   ├── paciente_routes.py
│   │   │   └── agendamento_routes.py
│   │   │
│   │   ├── controllers
│   │   │   ├── paciente_controller.py
│   │   │   └── agendamento_controller.py
│   │   │
│   │   ├── services
│   │   │   ├── paciente_service.py
│   │   │   └── agendamento_service.py
│   │   │
│   │   ├── repositories
│   │   │   ├── paciente_repository.py
│   │   │   └── agendamento_repository.py
│   │   │
│   │   ├── models
│   │   │   ├── paciente.py
│   │   │   └── agendamento.py
│   │   │
│   │   ├── dtos
│   │   │   ├── paciente_dto.py
│   │   │   └── agendamento_dto.py
│   │   │
│   │   ├── config
│   │   │   └── database.py
│   │   │
│   │   ├── exceptions
│   │   │   └── validation_exception.py
│   │   │
│   │   └── utils
│   │       └── response.py
│   │
│   └── tests
│       ├── conftest.py
│       │
│       ├── fakes
│       │   ├── fake_paciente_repository.py
│       │   └── fake_agendamento_repository.py
│       │
│       ├── services
│       │   ├── test_paciente_service.py
│       │   └── test_agendamento_service.py
│       │
│       ├── controllers
│       │   └── test_paciente_controller.py
│       │
│       └── api
│           └── test_paciente_api.py
│
├── frontend
│   │
│   ├── index.html
│   ├── pacientes.html
│   ├── agendamentos.html
│   │
│   ├── js
│   │   ├── api.js
│   │   ├── pacientes.js
│   │   └── agendamentos.js
│   │
│   └── css
│       └── style.css  (opcional)
│
├── README.md
└── .gitignore
```

---

## ⚙️ Como Executar o Projeto

### ✅ Pré-requisitos

* Python 3.10 ou superior
* Conta no Supabase
* Git instalado

### ✅ Passos

1. Clonar o repositório

```
git clone https://github.com/CarlosPWI/agendaSaude
```

2. Acessar a pasta

```
cd agendaSaude
```

3. Criar ambiente virtual

```
python -m venv venv
```

4. Ativar ambiente virtual

Windows:

```
venv\Scripts\activate
```

Linux/Mac:

```
source venv/bin/activate
```

5. Instalar dependências

```
pip install --upgrade pip
pip install -r requirements.txt
```

6. Configurar variáveis do Supabase

Criar arquivo `.env` contendo:

```
SUPABASE_URL= sua_url
SUPABASE_KEY= sua_chave
```

7. Executar aplicação

```
python main.py
```

---

## 👨‍💻 Integrantes

* Carlos Alberto Cordeiro de Farias Junior
* Carlos Henrique Souza
* Luis Henrique Marinho Meira
* Marcelo Paulino da Costa
* Hodavias Santos Dantas Medeiros
* Fabiano Santos Silva
* Dimitri Souza e Souza
* Luci Tieko Ito

---

## 📅 Status do Projeto

🚧 Em desenvolvimento acadêmico

---

## 📄 Licença

Projeto desenvolvido para fins educacionais, sem fins comerciais.
# agendaSaude
Agenda Web para marcação de consultas
