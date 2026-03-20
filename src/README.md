# FrontPortifolio (Vite + React + TS)

## Visao geral

Aplicacao frontend para exibir projetos publicos, portfolio publico por usuario e area logada (dashboard) para gerenciar projetos.

## Stack

- Vite + React + TypeScript
- React Router (`createBrowserRouter`)
- Axios (cliente em `src/server/api.ts`)
- TailwindCSS + Flowbite React
- `react-hot-toast` para feedback

## Estrutura de pastas

- `src/pages/` rotas/telas
  - `home/` lista publica de projetos
  - `portfolio/` portfolio publico por usuario (`/portfolio/:userId`)
  - `detail/` detalhes do projeto (`/project/:id`)
  - `login/`, `register/`
  - `dashboard/` area logada
- `src/components/` componentes reutilizaveis (layout, header, inputs, modais)
- `src/contexts/` estado global (auth)
- `src/routes/` utilitarios de rota (ex: `PrivateRoute`)
- `src/server/` configuracao do axios

## Variaveis de ambiente

- `VITE_API_URL`
  - Base URL do backend (ex: `http://localhost:3333` em dev; `https://...` em producao)
  - Usada para:
    - chamadas API via axios (`src/server/api.ts`)
    - montar URLs de arquivos: `${VITE_API_URL}/files/<nome>`

Observacao: alteracoes no `.env` exigem reiniciar o `npm run dev`.

## Rotas principais

- `/` -> Home (projetos publicos)
- `/project/:id` -> Detalhe do projeto
- `/portfolio/:userId` -> Portfolio publico do usuario
- `/login`, `/register`
- `/dashboard` (privado)

## Autenticacao

- Token JWT fica em `localStorage` como `token`
- `src/server/api.ts` injeta `Authorization: Bearer <token>` via interceptor
- `src/contexts/AuthContext.tsx`
  - `login(email, senha)` -> POST `/session`, salva token, chama `/me`
  - `loginWithGoogle(token)` -> salva token, chama `/me`
  - `refreshUser()` -> GET `/me`

## Padroes do projeto

- Sem `console.log` no frontend (evitar vazamento de token/senha e ruido em producao)
- Erros para usuario: usar `toast.error(...)` com mensagens amigaveis
- URLs de imagem/arquivo:
  - Se o backend retorna apenas o nome do arquivo, montar via `${VITE_API_URL}/files/${nome}`
  - Se vier URL completa (ex: Google), usar direto
- UI:
  - Avatares sempre em container circular com `rounded-full` + `overflow-hidden`
  - Em layout flex, avatar com `shrink-0` para nao deformar

## Como rodar

- `npm install`
- `npm run dev`
- `npm run build`

## Debug

- Para inspecionar requests, use DevTools > Network.
- Se imagens nao carregarem em producao, valide:
  - `VITE_API_URL` esta em HTTPS (evitar Mixed Content)
  - endpoint `/files/<nome>` responde 200 no dominio do backend
