# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado
- Exemplo de **Managed Database**: campo app-level `database:` documentado em `docs/zs-yaml-reference.md` (attach por nome, colocation como constraint dura, injeção de `DATABASE_URL`/`DATABASE_*` pela plataforma vencendo o manifesto, backups com RPO de 6h, sem HA neste ciclo), bloco comentado no `zs.yaml` e seção de variante no README; o Postgres-como-serviço segue documentado como alternativa unmanaged.
- Orientação de build **multi-arch** (`docker buildx build --platform linux/amd64,linux/arm64 ... --push`) no README e em `docs/zs-yaml-reference.md`: a malha tem nodes amd64 e arm64 e a app pode transitar entre eles; imagem single-arch falha no pull ("no matching manifest" / "exec format error").
- Referência completa e canônica do manifesto `zs.yaml` em `docs/zs-yaml-reference.md` (em inglês, voltada ao Developer): todos os campos validados de fato pelo CLI/backend — incluindo `placement` (preferência geográfica suave) e o bloco `ai` (requisitos rígidos) — regras de validação, o que o manifesto não suporta, imagens privadas, domínios customizados, volumes/snapshots, fluxo de deploy e limites do MVP.
- Exemplo comentado da seção `ai` no `zs.yaml` para documentar como apps de IA/ML declaram recursos necessários ao scheduler.
- Criação do arquivo `CHANGELOG.md` para rastreamento de mudanças.

### Corrigido
- README e `zs.yaml` apontavam para um caminho do repositório privado de documentação (`documentation/MVP/examples/zs-app-config-reference.md`), inacessível a quem clona só este repo; agora apontam para `docs/zs-yaml-reference.md`.
- Sintaxe dos comandos no README: `zs logs`/`zs stop` recebem o `<instance-id>` (exibido no output do `zs deploy` e no `zs list`), não o nome do app; referência documenta a sintaxe real de `zs domain` (`add <domain> --app <name>`, `verify <domain>`, `remove <domain>`).
