# ONG Mãos Solidárias

Plataforma web (SPA) desenvolvida para simular o site institucional de uma organização do terceiro setor — permitindo divulgar projetos sociais, captar voluntários/doadores através de um formulário de cadastro validado, com os dados persistidos localmente no navegador.

Projeto acadêmico da disciplina de Desenvolvimento Front-end (curso de ADS), construído de forma incremental ao longo de quatro Experiências Práticas: estruturação HTML/CSS, interatividade em JavaScript, transformação em SPA, e por fim versionamento, acessibilidade e deploy.

## Índice

- [Funcionalidades](#funcionalidades)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Estrutura de diretórios](#estrutura-de-diretórios)
- [Como executar o projeto](#como-executar-o-projeto)
- [Arquitetura da aplicação](#arquitetura-da-aplicação)
- [Estratégia de versionamento (Git)](#estratégia-de-versionamento-git)
- [Roadmap](#roadmap)
- [Autor](#autor)

## Funcionalidades

- Navegação em página única (SPA), sem recarregamento de página, com rotas via hash (`#/`, `#/projetos`, `#/cadastro`)
- Design system consistente (variáveis de cor, tipografia e espaçamento em CSS3)
- Layout responsivo com CSS Grid (12 colunas, 5 breakpoints) e Flexbox
- Menu de navegação com dropdown (desktop) e menu hambúrguer animado (mobile)
- Cards de projetos gerados dinamicamente a partir de um array de dados (JavaScript)
- Formulário de cadastro com validação nativa (HTML5) **e** customizada via JavaScript (RegEx, feedback visual em tempo real)
- Persistência dos cadastros no `localStorage` (sobrevive a reload/fechamento do navegador)
- Componentes de feedback: badges, alertas, modal e toast
- Formatação de datas com a biblioteca externa [Day.js](https://day.js.org/)

## Tecnologias utilizadas

- **HTML5** — marcação semântica
- **CSS3** — Grid, Flexbox, variáveis customizadas, media queries
- **JavaScript (ES6+ / Módulos ES)** — sem frameworks, "vanilla JS" modularizado
- **Day.js** (via CDN) — formatação de datas
- **Git & GitHub** — controle de versão (estratégia GitFlow)

## Estrutura de diretórios

```
PROJETO_ONG/
├── index.html              # Ponto de entrada único da SPA
├── css/
│   └── style.css            # Design system + layout + componentes
├── html/                    # Fragmentos HTML de referência (ver nota abaixo)
│   ├── home.html
│   ├── projetos.html
│   └── cadastro.html
├── js/
│   ├── main.js               # Ponto de entrada JS
│   └── modules/
│       ├── router.js          # Roteamento (hash routing)
│       ├── templates.js       # Geração dinâmica das views
│       ├── data.js            # Dados dos projetos
│       ├── storage.js         # Persistência (localStorage)
│       ├── validacao.js       # Validação de formulário
│       └── ui.js              # Eventos (menu, modal, toast, submit)
├── imagens/
│   └── ong.jpg
└── .gitignore
```

> **Nota:** os arquivos em `/html` documentam a separação inicial de responsabilidades entre as views, mas a renderização em tempo de execução usa os templates definidos como strings JavaScript em `js/modules/templates.js` — evitando chamadas `fetch()` a arquivos locais, que são bloqueadas por CORS quando o projeto roda via `file://`.

## Como executar o projeto

Como a aplicação usa módulos ES (`<script type="module">`), **não é possível abrir o `index.html` diretamente com duplo clique** em alguns navegadores (erro de CORS). É necessário servir os arquivos por um servidor HTTP local:

**Opção 1 — VS Code + Live Server (recomendado)**
1. Instale a extensão **Live Server** (Ritwick Dey) no VS Code
2. Clique com o botão direito em `index.html` → **Open with Live Server**
3. O projeto abre em `http://127.0.0.1:5500`

**Opção 2 — Python**
```bash
python -m http.server 8000
```
Depois acesse `http://localhost:8000`

## Arquitetura da aplicação

A aplicação segue o padrão de responsabilidade única entre os módulos JavaScript:

| Módulo | Responsabilidade |
|---|---|
| `router.js` | Interpreta o hash da URL e decide qual view renderizar |
| `templates.js` | Gera o HTML de cada view (usa `data.js` e `storage.js`) |
| `data.js` | Fonte de dados estática dos projetos |
| `storage.js` | Única camada que acessa o `localStorage` |
| `validacao.js` | Regras de consistência do formulário |
| `ui.js` | Orquestra eventos via *event delegation* (clique, submit, teclado) |

Eventos são tratados por **delegação** (anexados uma única vez em `document`), evitando a necessidade de reconectar listeners a cada troca de rota — já que o roteador recria o conteúdo de `#app` via `innerHTML`.

## Estratégia de versionamento (Git)

O projeto adota uma versão simplificada do **GitFlow**:

- `main` — versão estável, publicável
- `develop` — integração contínua do trabalho em andamento
- `feature/*` — uma branch por funcionalidade, criada a partir de `develop`
- `hotfix/*` — correções urgentes, criadas a partir de `main`

As mensagens de commit seguem o padrão **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`), e as entregas relevantes são marcadas com tags de versão semântica (`SemVer`: `MAJOR.MINOR.PATCH`).

## Roadmap

- [x] Estrutura HTML semântica e design system
- [x] Layout responsivo (Grid + Flexbox)
- [x] Navegação, componentes de feedback e estados interativos
- [x] Migração para SPA (roteamento, templates dinâmicos)
- [x] Validação de formulário, `localStorage` e integração com Day.js
- [x] Modularização e testes de interatividade
- [x] Versionamento com Git/GitHub (GitFlow)
- [ ] Conformidade com WCAG 2.1 (Nível AA)
- [ ] Build, otimização e deploy em produção

## Autor

Luiz Felipe Gomes de Carvalho — projeto acadêmico (ADS, disciplina de Desenvolvimento Front-end).
