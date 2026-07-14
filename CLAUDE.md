# CLAUDE.md: zsc-app-demo

> Veja o `CLAUDE.md` da raiz para visão geral, glossário e time de agentes. Aqui ficam os detalhes locais.

## Papel

Aplicação de exemplo e ponto de partida para Developers na ZeroServer Community Cloud. Demonstra um workload multi-container (Postgres + Node API) descrito pelo manifesto `zs.yaml`, com deploy via `zsc-cli`.

## Stack

- Node + Express + `pg` (API)
- Postgres 15+ (banco)
- Docker e Docker Compose (execução local)
- Manifesto `zs.yaml` (formato da ZSC)

## Estrutura

- `api/`: código da API Node, Dockerfile e package.json.
- `zs.yaml`: manifesto de deploy na ZSC (serviços `db` + `api`).
- `docker-compose.yml`: execução local fora da ZSC.
- `README.md`: guia de uso local e deploy.

## Comandos

- Local: `docker compose up --build`
- Deploy na ZSC: `zs login`, `zs deploy`, `zs list`, `zs logs zsc-app-demo`, `zs stop zsc-app-demo`
- Imagem de referência publicada em `ghcr.io/zeroserver-cc/zsc-app-demo-api:1.0`

## Regras locais

- Mantenha o exemplo funcional e mínimo; o objetivo é onboarding, não feature creep.
- A API deve se reconectar ao Postgres de forma resiliente (cold start do banco).
- O `zs.yaml` é o exemplo canônico do manifesto multi-container; qualquer mudança no formato deve ser espelhada na documentação em `documentation/MVP/examples/zs-app-config-reference.md`.
- Nunca commitar segredos, `.env` nem `zs.yaml` com valores sensíveis.
- A imagem de exemplo deve permanecer pública para que novos Developers façam deploy sem credenciais.

## Registro de mudanças

Ao final de cada ciclo de implementação, atualize o `CHANGELOG.md` deste repositório. Use a seção `[Unreleased]` e as categorias `Adicionado`, `Alterado`, `Corrigido`, `Removido`, `Depreciado` e `Segurança`. Agrupe as entradas por tipo de mudança, descreva o impacto em linguagem simples e faça o commit junto com as demais alterações. Não registre mudanças puramente cosméticas ou de formatação, a menos que alterem comportamento observável.

## Agentes responsáveis

`backend-engineer` (execução do exemplo), `product-manager` (onboarding e clareza para novos Developers).
