# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado
- Documentação de réplicas (alta disponibilidade multi-instância) em `docs/zs-yaml-reference.md`: campo opcional `replicas` do `zs.yaml`, `zs deploy --replicas` e `zs scale <app> <n>`, com os requisitos (app stateless, sem sticky sessions, sessão em cookie assinado ou banco externo), uma réplica por node, o teto da plataforma, o aviso de que apps com volume ou banco gerenciado continuam com 1 réplica, o custo de N vezes o preço por instância-hora e as limitações (health check raso, gateway ainda é ponto único de falha). A seção avisa que só vale quando a plataforma liga a alta disponibilidade; este PR fica aberto até essa decisão.
- Nota no topo de `docs/zs-yaml-reference.md` diferenciando `zs.yaml` (manifesto da aplicação) de `zs.toml` (config opcional do CLI que fixa o perfil de sessão do projeto via `session = "<perfil>"`, commitável, sem segredos), com a precedência de perfis e link para a seção "Session profiles" do README do zsc-cli.
- Orientação de build **multi-arch** (`docker buildx build --platform linux/amd64,linux/arm64 ... --push`) no README e em `docs/zs-yaml-reference.md`: a malha tem nodes amd64 e arm64 e a app pode transitar entre eles; imagem single-arch falha no pull ("no matching manifest" / "exec format error").
- Referência completa e canônica do manifesto `zs.yaml` em `docs/zs-yaml-reference.md` (em inglês, voltada ao Developer): todos os campos validados de fato pelo CLI/backend — incluindo `placement` (preferência geográfica suave) e o bloco `ai` (requisitos rígidos) — regras de validação, o que o manifesto não suporta, imagens privadas, domínios customizados, volumes/snapshots, fluxo de deploy e limites do MVP.
- Exemplo comentado da seção `ai` no `zs.yaml` para documentar como apps de IA/ML declaram recursos necessários ao scheduler.
- Criação do arquivo `CHANGELOG.md` para rastreamento de mudanças.

### Alterado
- As frases "1 instance per app" e "no replicas or load balancing yet" do `README.md` e de `docs/zs-yaml-reference.md` passam a dizer que o padrão é uma instância por app e que réplicas existem quando a alta disponibilidade está ligada.

### Corrigido
- README e `zs.yaml` apontavam para um caminho do repositório privado de documentação (`documentation/MVP/examples/zs-app-config-reference.md`), inacessível a quem clona só este repo; agora apontam para `docs/zs-yaml-reference.md`.
- Sintaxe dos comandos no README: `zs logs`/`zs stop` recebem o `<instance-id>` (exibido no output do `zs deploy` e no `zs list`), não o nome do app; referência documenta a sintaxe real de `zs domain` (`add <domain> --app <name>`, `verify <domain>`, `remove <domain>`).
