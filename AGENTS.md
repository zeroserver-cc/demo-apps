# AGENTS.md: zsc-app-demo

> Veja o `AGENTS.md` da raiz para visao geral, glossario e time de agentes. Aqui ficam os detalhes locais.

## Papel

Aplicacao de exemplo e ponto de partida para Developers na ZeroServer Community Cloud. Demonstra um workload multi-container (Postgres + Node API) descrito pelo manifesto `zs.yaml`, com deploy via `zsc-cli`.

## Stack

- Node + Express + `pg` (API)
- Postgres 15+ (banco)
- Docker e Docker Compose (execucao local)
- Manifesto `zs.yaml` (formato da ZSC)

## Estrutura

- `api/`: codigo da API Node, Dockerfile e package.json.
- `zs.yaml`: manifesto de deploy na ZSC (servicos `db` + `api`).
- `docker-compose.yml`: execucao local fora da ZSC.
- `README.md`: guia de uso local e deploy.

## Comandos

- Local: `docker compose up --build`
- Deploy na ZSC: `zs login`, `zs deploy`, `zs list`, `zs logs <instance-id>`, `zs stop <instance-id>`
- Imagem de referencia publicada em `ghcr.io/zeroserver-cc/zsc-app-demo-api:1.0`

## Regras locais

- Mantenha o exemplo funcional e minimo; o objetivo e onboarding, nao feature creep.
- A API deve se reconectar ao Postgres de forma resiliente (cold start do banco).
- O `zs.yaml` e o exemplo canonico do manifesto multi-container; qualquer mudanca no formato deve ser espelhada na referencia canonica em `docs/zs-yaml-reference.md` deste repositorio.
- Nunca commitar segredos, `.env` nem `zs.yaml` com valores sensiveis.
- A imagem de exemplo deve permanecer publica para que novos Developers facam deploy sem credenciais.

## Registro de mudanças

Ao final de cada ciclo de implementacao, atualize o `CHANGELOG.md` deste repositorio. Use a secao `[Unreleased]` e as categorias `Adicionado`, `Alterado`, `Corrigido`, `Removido`, `Depreciado` e `Seguranca`. Agrupe as entradas por tipo de mudanca, descreva o impacto em linguagem simples e faca o commit junto com as demais alteracoes. Nao registre mudancas puramente cosmeticas ou de formatacao, a menos que alterem comportamento observavel.

## Agentes responsaveis

`backend-engineer` (execucao do exemplo), `product-manager` (onboarding e clareza para novos Developers).
