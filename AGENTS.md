# AGENTS

Este arquivo registra alteracoes feitas pelo agente no `frontPortifolio/`.

## 2026-03-20

- Fallback de avatar: quando o usuario nao tem `fotoPerfil`, agora exibimos o icone `CircleUserRound` (lucide) no lugar de um circulo vazio.
- Avatar sempre circular: padronizei um container com `rounded-full` + `overflow-hidden` e imagem com `object-cover`.
- Evitar deformacao em layout flex: adicionei `shrink-0` no container do avatar para ele nao achatar dependendo do tamanho do nome.

Arquivos alterados:

- `frontPortifolio/src/components/header/index.tsx`
- `frontPortifolio/src/pages/dashboard/index.tsx`
- `frontPortifolio/src/pages/portfolio/index.tsx`

## 2026-03-20 (Higiene)

- Remocao de `console.*` no frontend para evitar vazamento de informacao (token/senha) e ruido em producao.
- Adicionado guia de padroes e estrutura do projeto em `src/README.md`.

Arquivos alterados:

- `frontPortifolio/src/contexts/AuthContext.tsx`
- `frontPortifolio/src/pages/login/index.tsx`
- `frontPortifolio/src/pages/register/index.tsx`
- `frontPortifolio/src/pages/dashboard/index.tsx`
- `frontPortifolio/src/pages/home/index.tsx`
- `frontPortifolio/src/pages/detail/index.tsx`
- `frontPortifolio/src/components/delete/DeletarProjeto.tsx`
- `frontPortifolio/src/README.md`
