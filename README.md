---
title: Pilates Vision Progress
emoji: "🧘"
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
---

# 🧘 Pilates Vision & Progress
Bem-vindo à documentação oficial do Vision & Progress, uma solução tecnológica para a gestão de estúdios de Pilates. O sistema foca na automatização administrativa e, principalmente, no uso de ferramentas de Inteligência Artificial para realizar análises posturais precisas e gerar treinos personalizados com base na evolução e nos objetivos específicos de cada aluno.

## Deploy Online (Hugging Face)
[![Hugging Face Spaces](https://img.shields.io/badge/🤗%20Hugging%20Face-Spaces-yellow?style=for-the-badge)](https://huggingface.co/spaces/MateusZanco/pilates-vision-progress)

## 1. Descricao do problema e da solucao proposta
A gestão de estúdios de Pilates enfrenta três grandes gargalos que comprometem a eficiência e a qualidade do atendimento:

1. **Fragmentação Administrativa e Carga Burocrática:** O fluxo de trabalho atual é ineficiente. Frequentemente, os instrutores planejam os exercícios "no momento" da aula e, posteriormente, precisam de gastar tempo adicional para registar manualmente no sistema o que foi realizado. Este "trabalho duplo" aumenta a carga administrativa e a probabilidade de esquecimentos ou erros nos registos.

2. **Subjetividade Técnica na Avaliação:** A avaliação postural manual depende exclusivamente da perceção visual do instrutor. Esta subjetividade pode levar a diagnósticos inconsistentes entre diferentes profissionais ou até mesmo falhas na identificação de desvios sutis, dificultando um acompanhamento clínico rigoroso.

3. **Dificuldade de Personalização em Escala:** Criar planos de treino que considerem simultaneamente o histórico clínico (como hérnias, escolioses e cirurgias), a evolução semanal e os objetivos do aluno é um processo manual extremamente demorado. Sem o apoio da tecnologia, torna-se quase impossível oferecer uma personalização profunda para todos os alunos do estúdio de forma ágil.

### Solucao proposta
O **Pilates Vision & Progress** centraliza os fluxos essenciais em um unico sistema:
- **Análise Postural Automatizada:** Utiliza algoritmos para detetar desvios de forma objetiva, eliminando o "achismo" e fornecendo dados concretos sobre o alinhamento do aluno.

- **Geração de Treino Inteligente:** O sistema cruza os dados do histórico médico com os objetivos do aluno para gerar, uma sequência de exercícios otimizada. Isto elimina o improviso e o trabalho de registo posterior, pois o treino já nasce documentado e personalizado.

- **Gestão Centralizada:** Cadastro completo, agenda e controle de instrutores integrados em um único ambiente.

### Evolucao futura da IA
- **Análise Postural:** Atualmente, o sistema utiliza um Mock que simula o processamento de imagens e a deteção de pontos-chave. A arquitetura está preparada para integração direta com modelos de visão, permitindo medições angulares precisas em tempo real.

- **Motor de Treinos:** A lógica de geração de planos foi estruturada para que modelos de linguagem (LLMs) possam processar as restrições médicas do aluno e sugerir variações de exercícios que respeitem a restrições individuais.

## 2. Escolhas de design
### Arquitetura
- **Frontend:** React + Vite + Tailwind CSS.
- **Backend:** FastAPI + SQLite.
- **Infra:** Docker Compose + modo single-container.

### Justificativas
- **FastAPI:** produtividade alta para APIs, validação, manutenção e documentação.
- **SQLite:** complexidade baixa para protótipo funcional.
- **React/Vite:** iteração rápida e fluida de interface.
- **Tailwind:** consistência visual e velocidade de composição de UI.

### Escolhas de UX/UI
- Navegação por Sidebar + Header.
- Stepper para cadastro de aluno (quebra de complexidade por etapas).
- Estados explicítos de carregamento e feedback (toasts/confirmações).
- Agenda com semântica visual de status e modal de detalhes.

### Arquitetura da aplicação
```bash
pilates_assistant/
│
├── backend/                         # API FastAPI + persistencia SQLite
│   ├── main.py                      # Endpoints (students, instructors, appointments, analyze, dashboard)
│   ├── models.py                    # Modelos ORM (Student, Instructor, Assessment, Appointment)
│   ├── schemas.py                   # Schemas Pydantic para validacao de entrada/saida
│   ├── database.py                  # Configuracao do SQLAlchemy e sessao com o banco
│   ├── requirements.txt             # Dependencias Python do backend
│   ├── Dockerfile                   # Imagem Docker do backend
│   ├── app.db                       # Banco SQLite (persistido por volume no Docker)
│   └── .venv/                       # Ambiente virtual Python local
│
├── frontend/                        # Aplicacao React (Vite + Tailwind)
│   ├── src/
│   │   ├── App.jsx                  # Shell principal (layout, rotas internas, sessao/login gate)
│   │   ├── api.js                   # Cliente Axios para comunicacao com o backend
│   │   ├── i18n.jsx                 # Internacionalizacao PT/EN e traducoes da interface
│   │   ├── components/              # Componentes reutilizaveis (Sidebar, Header, Toast, Login, etc.)
│   │   └── pages/                   # Paginas de dominio (Dashboard, Students, Instructors, Schedule, Analysis, Plans)
│   ├── package.json                 # Dependencias e scripts do frontend
│   ├── vite.config.js               # Configuracoes do Vite (incluindo allowedHosts/ngrok)
│   ├── tailwind.config.js           # Tema e extensoes visuais com Tailwind
│   └── Dockerfile                   # Imagem Docker do frontend
│
├── docker-compose.yml               # Orquestracao dos servicos frontend + backend
├── .gitignore                       # Exclusoes de versionamento (.venv, __pycache__, node_modules, .db, etc.)
└── README.md                        # Documentacao do projeto
```

## 3. O que funcionou bem
Utilização do modelo GPT-5.3-Codex como ferramenta de apoio no desenvolvimento da aplicação.

<img src="images/codex_status.png" width="600">

Pontos com melhor desempenho:
- A partir de uma definição clara de requisitos, a estrutura base do projeto (diretórios, ambientes virtuais e dependências) foi gerada em apenas alguns minutos. O prompt de sistema utilizado para essa etapa foi:

>*Building a prototype called Pilates Vision & Progress, a professional management and postural analysis tool for Pilates studios.
Project structure: Create two main directories: /backend and /frontend.
Backend (FastAPI + SQLite).
Frontend (React + Vite + Tailwind CSS)
Ensure the code is modular and clean.
Provide a requirements.txt for Python and a package.json for React.
Add loading states for all button interactions.
Creates a Python virtual environment (.venv) inside the /backend folder.
Activates the virtual environment.
Installs all dependencies from requirements.txt.
Also, generate a comprehensive .gitignore file that excludes the virtual environment folder, __pycache__, node_modules, and the SQLite .db file to keep the repository clean.*

- Entregas incrementais de funcionalidades com baixo atrito, através de implementação e testes de pequenas elaborações 
>*Implement CPF masking and validation in the Student registration form
Apply a mask to the CPF field so it automatically formats as xxx.xxx.xxx-xx
Limit the input to 11 digits (only numbers).
Inputs phone also only numbers*

- Implementacao de requisitos transversais (tema dark/light, i18n, validacoes, estados de loading).
>*Implement multi-language support (English and Portuguese) for the entire application. Store the user's language preference in localStorage so it persists after refresh. Translate all UI elements: Sidebar menus, Dashboard stats, Form labels (Student/Instructor), Table headers, and the Postural Analysis interface
Add a language toggle in the Sidebar (next to the Dark Mode toggle). Use flags or text (EN | PT) for the switcher*

## 4. O que nao funcionou bem
Principais limitações observadas:

- Nos campos de preenchimento de formulários, não foram adotadas medidas de precaução. Por exemplo, o campo de CPF permitia a inserção de vários dígitos e letras, assim como o campo de telefone, além de existirem campos sem limitação de caracteres. Vale ressaltar que tais medidas de precaução não foram especificadas no prompt inicial. Para a correção, foi necessário utilizar novos prompts, como no exemplo abaixo:

>*Enforce a minimum length of 10 digits for phone numbers in both Student and Instructor forms. Ensure this validation applies to both Create and Edit actions for both students and instructors.Apply CPF masking and standardization to the Student Edit flow. Ensure the CPF field in the Edit Modal/Form uses the same mask as the creation form (xxx.xxx.xxx-xx).*

>*Implement character limits for Name and Phone fields in both Student and Instructor forms (Create & Edit):
Name Fields: Add maxLength={100} to all Name inputs in StudentManagementPage and InstructorManagementPage
Phone Fields: Add maxLength={15} to the Phone inputs (to account for the mask symbols like (XX) XXXXX-XXXX)
Add a small counter below the Name field (e.g., 75/100) that turns red when the limit is reached
StudentManagementPage:
Implement character limits for Medical History, Objectives, Specialty, and Email fields
Medical History: maxLength={500} 
Goals: maxLength={500} 
E-mail: maxLength={100} validation email format
InstructorManagementPage.jsx:
Speciality: maxLength={100}
Notes: maxLength={500}
Ensure that these restrictions apply to both the creation and editing of records.*

- Em algumas implementações, houve falhas, como no exemplo abaixo:
>*When a user clicks an appointment in the schedule: Open a Detail Modal showing the Student, Instructor, Time, and Status.
Include an 'Edit' button to change the appointment status or time.
Include a 'Delete' button (with a confirmation dialog).
Update the Appointment model and logic to support statuses: booked, completed, and canceled.
Add a small, elegant legend component at the top of the Schedule page. It should show a small colored circle for each status with its corresponding label*

Para a correção, o código de erro foi fornecido ao agente, que conseguiu identificar e resolver o problema:

>*My FastAPI backend is currently failing to start because of an AssertionError: Status code 204 must not have a response body*
 
## 5. Como executar localmente
### Docker Compose
```bash
docker compose up --build
```

### Endpoints locais
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`