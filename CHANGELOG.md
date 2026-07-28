# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado
- Referência completa e canônica do manifesto `zs.yaml` em `docs/zs-yaml-reference.md` (em inglês, voltada ao Developer): todos os campos validados de fato pelo CLI/backend — incluindo `placement` (preferência geográfica suave) e o bloco `ai` (requisitos rígidos) — regras de validação, o que o manifesto não suporta, imagens privadas, domínios customizados, volumes/snapshots, fluxo de deploy e limites do MVP.
- Exemplo comentado da seção `ai` no `zs.yaml` para documentar como apps de IA/ML declaram recursos necessários ao scheduler.
- Criação do arquivo `CHANGELOG.md` para rastreamento de mudanças.

### Corrigido
- README e `zs.yaml` apontavam para um caminho do repositório privado de documentação (`documentation/MVP/examples/zs-app-config-reference.md`), inacessível a quem clona só este repo; agora apontam para `docs/zs-yaml-reference.md`.
