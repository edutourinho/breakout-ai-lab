# Resultado do piloto — 19/11/2026

## V1 concluída

Jogo: https://edutourinho.github.io/breakout-ai-lab/

PR #8 integrado manualmente após revisão, correções e CI verde no SHA a336bb3f03cc9be3accdc86bddadc1dfd0059f2b. Deploy aprovado: https://github.com/edutourinho/breakout-ai-lab/actions/runs/44548377780 . Versão pública conferida no navegador: início, lançamento sem teclado, pausa e reinício. Captura: docs/evidence/breakout-live.jpg. Relatório completo da V1 está na main em docs/VALIDACAO.md.

## Executor principal

OpenCode 1.19.6 com opencode/big-pickle gerou o jogo na execução 44542811277, sem chave paga. Foram 89 eventos, 25 etapas, 1059,994s entre primeiro e último evento, sem eventos de erro, custo relatado zero. O agente aprovou seus 14 testes unitários e 7 de navegador. A revisão encontrou impossibilidade de lançar a bola somente por toque e retenção de comandos na pausa. O coordenador corrigiu e ampliou a suíte: 14 unitários e 9 de navegador aprovados, 1 skip de toque no desktop.

Consulta local mínima retornou Free usage limit reached. Esse limite não se reproduziu no runner que implementou o jogo. Não é possível inferir a cota exata, renovação, escopo por conta/rede/modelo ou disponibilidade futura. Nada pago foi ativado.

## Experimento CPU separado

OpenCode + Ollama 0.40.16 + Qwen3:4b, run 44545179961: download e inferência local funcionaram, porém a tarefa não produziu arquivos em 600s. Não foi validado como executor de desenvolvimento. Falha preservada em opencode/cpu-paddle-44545179961; configuração e ajustes no draft #7, sem merge. Preflight não obedeceu à resposta OK exata, e a etapa de teste rodou apenas o scaffold: não confundir isso com implementação aprovada. Guardas corrigidas no draft, ainda sem nova execução.

## Infraestrutura e ajustes

Repositório público, Issues, branches, PRs, testes e Pages implantados. O primeiro bootstrap falhou antes da inferência porque ubuntu-latest selecionou Ubuntu 26.04 incompatível com Playwright 1.56.1; resolvido fixando Ubuntu 24.04. CI e publicação depois passaram.

Este PR #5 adiciona eventos ao vivo e rejeita resultados sem novas alterações de implementação, sem módulos/testes e com erro JSON. Mantém um agente por vez, nenhum segredo do GitHub no processo do modelo, timeouts e ausência de fallback pago. A melhoria ainda deve ser exercitada em nova execução; não modifica o jogo.

## Pesquisa atual

Big Pickle é oferta gratuita por tempo limitado; runners padrão em repositórios públicos são gratuitos. GitHub Models encerrou integralmente em 30/07/2026 e não pode ser usado como fallback apesar de tutoriais antigos. Pesos de modelos CPU não foram armazenados em artifacts/cache.

Fontes oficiais: https://opencode.ai/docs/console/models/ ; https://docs.github.com/en/billing/concepts/product-billing/github-actions ; https://docs.github.com/en/github-models ; https://docs.ollama.com/integrations/opencode
