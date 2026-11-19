# Breakout AI Lab

Laboratório público para testar desenvolvimento coordenado pelo ChatGPT, com um único executor OpenCode usando modelo gratuito, Actions para testes e Codex para apoio/revisão.

## Estado

Infraestrutura inicial. A versão jogável será implementada na Issue #2 e revisada em pull request antes de merge. O index inicial é apenas uma página de implantação.

## Executar

Node 22: `npm ci`, `npx playwright install chromium`, `npm test`, `npm run test:e2e`, `npm start` (porta 4173).

O mesmo executor pode rodar localmente: instalar `opencode-ai@1.19.6` e executar `opencode run --pure --model opencode/big-pickle "$(cat tasks/002-breakout.md)"` em checkout isolado. Nunca adicionar chaves de APIs pagas.

## Fluxo

Issue → tarefa delimitada → OpenCode gratuito → branch com evidências → testes → PR criado pelo coordenador → revisão → validação humana → merge e Pages manuais. Nenhum merge automático.

O bootstrap de infraestrutura é um commit inicial direto em main para habilitar o Actions; implementações do jogo ficam em branches. O workflow do piloto roda uma vez quando o arquivo da tarefa entra em main, e pode ser disparado manualmente depois. Usa CLI diretamente: não exige instalar o app OpenCode nem fornecer chave de API/GitHub ao modelo. O passo posterior publica a branch usando GITHUB_TOKEN; o coordenador abre o PR. Isso evita depender da opção administrativa de permitir criação de PRs por Actions. CI de PR é disparado pela integração ao abrir o PR.

## Custos e limites verificados em 19/11/2026

- Runners padrão de Actions são gratuitos em repositórios públicos; não usar runners maiores. Logs e job summaries não consomem quota de artifacts. Pages usa artifact de curta retenção (1 dia).
- Big Pickle consta como gratuito por tempo limitado na documentação oficial. Não há promessa de cota permanente ou disponibilidade. Configuração fixa modelo principal e pequeno no mesmo modelo gratuito; sem chaves pagas, sem fallback pago. Se exigir login, limitar ou encerrar oferta, registrar bloqueio e parar.
- O catálogo da CLI pode conter modelos já descontinuados: GLM-5.3-Flash Free foi descontinuado em 18/11/2026 e não será usado.
- Timeout do job: 25 min; inferência: 1100 s; um agente por vez; sem agendamento recorrente.
- Só código público deste jogo é enviado. Os termos dos modelos gratuitos variam e podem prever uso dos dados para melhoria.

Fontes oficiais: https://opencode.ai/docs/console/models/ ; https://opencode.ai/docs/github/ ; https://docs.github.com/en/billing/concepts/product-billing/github-actions

## Validação

Testes iniciais verificam somente a estrutura e o carregamento. Não comprovam jogabilidade. O agente deve adicionar testes reais de física e fluxo; o coordenador revisa os resultados e a interface. Publicação Pages é manual e somente da main após testes.
