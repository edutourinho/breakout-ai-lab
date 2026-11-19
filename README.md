# Breakout AI Lab

Jogo Breakout em HTML, CSS e JavaScript, desenvolvido como laboratório de agentes de IA.

**Jogar:** https://edutourinho.github.io/breakout-ai-lab/

## Controles

- Setas ou A/D movem a plataforma; Espaço inicia, lança a bola ou alterna pausa.
- Em telas de toque: Começar jogo, Lançar bola e botões Esquerda/Direita.
- Botões de pausa, retomada e reinício; três vidas, pontos e telas de vitória/derrota.

## Executar e testar

Node 22: `npm ci`, `npx playwright install chromium`, `npm start` (porta 4173). Testes: `npm test` e `npm run test:e2e`.

Lógica determinística em src/game.js; renderização e entrada separadas. Sem dependências de execução, assets remotos ou chamadas de rede no jogo. Uma fase, sem áudio ou recordes persistidos.

## Fluxo de desenvolvimento

ChatGPT coordena requisitos e Issues. Um OpenCode gratuito implementa em runner público do Actions. Um passo separado publica a branch e evidências; o coordenador abre o PR, revisa e valida o SHA final. CI executa testes de lógica e Chromium desktop/mobile. Merge e deploy são operações manuais do coordenador, após validação; auto-merge desabilitado.

O bootstrap inicial de infraestrutura foi criado diretamente em main para habilitar Actions. O jogo entrou pelo PR #8, com revisão e correções. Evidências e limites da validação: [docs/VALIDACAO.md](docs/VALIDACAO.md). Logs brutos: docs/runs/.

## Resultado do primeiro agente

Execução: https://github.com/edutourinho/breakout-ai-lab/actions/runs/44542811277

OpenCode 1.19.6 + opencode/big-pickle; 25 etapas em 1059,994 segundos entre primeiro/último evento; custo relatado zero. O agente escreveu jogo e testes (14 unitários e 7 de navegador aprovados). A revisão corrigiu lançamento sem teclado e limpeza de comandos ao pausar; acrescentou regressão (9 testes de navegador aprovados, um skip de toque no desktop). A disponibilidade gratuita local não foi comprovada: houve Free usage limit reached. O sucesso no runner não garante disponibilidade permanente.

## Infraestrutura e custos — verificados em 19/11/2026

- Repositório público e runner padrão Ubuntu 24.04: compute Actions gratuito. Não usar runners maiores.
- OpenCode principal e pequeno fixados em modelo gratuito, sem chaves pagas e sem fallback pago. Big Pickle é oferta por tempo limitado. Nunca acrescentar saldo, assinatura ou provedor pago sem autorização do usuário.
- Sem segredos do GitHub no processo do modelo. Somente código público deste jogo pode ser enviado ao provedor.
- CI em push da main e em PR. Pages é workflow_dispatch e repete os testes antes do deploy. Artifact Pages com retenção de um dia; pesos de modelos não são armazenados em artifacts/cache.
- Timeout do piloto hospedado: 25 min (inferência 1100s). Um executor por vez; não há agenda recorrente.
- Experimento alternativo OpenCode + Ollama local por CPU, Qwen3:4b, no PR #7/Issue #6; ainda separado da V1. Serve para medir viabilidade de inferência local, não para acoplar IA ao jogo.
- GitHub Models foi encerrado em 30/07/2026 e não é fallback disponível. Modelos listados pela CLI podem estar descontinuados; GLM-5.3-Flash Free não deve ser usado.

Fontes oficiais: https://opencode.ai/docs/console/models/ ; https://docs.github.com/en/billing/concepts/product-billing/github-actions ; https://docs.github.com/en/github-models ; https://docs.ollama.com/integrations/opencode

## Execução local do mesmo agente

Em checkout isolado, instalar opencode-ai@1.19.6 e executar a tarefa delimitada com `opencode run --pure --model opencode/big-pickle "$(cat tasks/002-breakout.md)"`. Interromper caso o serviço exija pagamento ou informe cota indisponível; não supor que o modelo listado está acessível. A configuração CPU experimental fica na branch lab/cpu-pilot. Computador local não precisa de Android Studio ou ferramentas de outro projeto.
