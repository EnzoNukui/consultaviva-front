# ConsultaViva — Front-end

Front-end da ConsultaViva, plataforma que acompanha o paciente da consulta marcada até o atendimento realizado. O paciente consulta seus agendamentos, pede ajuda quando algo dificulta a ida à consulta e responde às propostas de novo horário. A equipe de saúde gerencia pacientes, unidades, horários e agendamentos, analisa as solicitações e conduz o resgate de consultas.

O back-end é uma API Java separada, publicada em `https://consultaviva-java.onrender.com`. Os dados de estabelecimentos de saúde vêm da API de dados abertos do Ministério da Saúde (DEMAS).

## Funcionalidades

**Site institucional** (`/`): Home, Sobre, Solução, Integrantes, FAQ e Contato.

**Área do paciente** (`/paciente`): início com visão geral, lista e detalhes das consultas, solicitações de ajuda com o acompanhamento das propostas recebidas, e página de ajuda.

**Área da equipe** (`/equipe`): visão geral, cadastro de pacientes e unidades, gestão de horários e agendamentos, análise de solicitações e propostas, e lista de resgate.

**Acesso**: login em `/acesso` e cadastro de paciente em `/cadastro`.

## Tecnologias

- React 19 com TypeScript
- Vite 8
- React Router 7 (rotas com carregamento sob demanda)
- Tailwind CSS 4
- React Icons
- oxlint para lint

## Pré-requisitos

- Node.js `^20.19.0` ou `>=22.12.0` (há um `.nvmrc` com a versão 22)
- npm

## Como rodar

```bash
git clone https://github.com/EnzoNukui/consultaviva-front.git
cd consultaviva-front
npm install
cp .env.example .env
npm run dev
```

O Vite mostra no terminal o endereço local (normalmente `http://localhost:5173`).

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `VITE_API_URL` | Sim | URL da API Java da ConsultaViva. |
| `VITE_DEMAS_API_URL` | Não | URL da API de dados abertos do DEMAS. Sem ela, usa `https://apidadosabertos.saude.gov.br`. |

Serviços no Render podem demorar para responder na primeira requisição depois de um período parados, por isso o front-end espera até 4 minutos pela API Java antes de mostrar erro de tempo esgotado.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o servidor de desenvolvimento. |
| `npm run build` | Verifica os tipos e gera a build de produção em `dist/`. |
| `npm run preview` | Serve a build de produção localmente. |
| `npm run lint` | Roda o oxlint no projeto. |

## Estrutura de pastas

```
src/
├── assets/       # Imagens da marca, fotos dos integrantes e da página Sobre
├── components/   # Componentes compartilhados (layouts, menus, cards, estados de tela)
├── hooks/        # Hooks reutilizáveis (busca autenticada, título da página)
├── routes/       # Páginas, organizadas por área: institucional, acesso, paciente, equipe
├── services/     # Cliente HTTP e serviços de cada recurso da API
├── types/        # Tipos TypeScript dos dados da API
├── App.tsx       # Layout do site institucional
├── globals.css   # Tema do Tailwind (cores e escala tipográfica)
└── main.tsx      # Ponto de entrada
```

## Integrantes

| Nome | RM | Turma | GitHub |
| --- | --- | --- | --- |
| Arthur Carvalho Brito Martins | 572325 | 1TDSPO | [arthurmartinss](https://github.com/arthurmartinss) |
| Diego Soares Trujillo | 570147 | 1TDSPH | [diegotrujillo011](https://github.com/diegotrujillo011) |
| Eduardo Damasio Guelere | 569960 | 1TDSPH | [Eduardoguelere](https://github.com/Eduardoguelere) |
| Enzo Nukui da Silva | 569770 | 1TDSPH | [EnzoNukui](https://github.com/EnzoNukui) |
| Leticia Cardoso de Almeida | 569415 | 1TDSPH | [lehalmeidafc0](https://github.com/lehalmeidafc0) |
