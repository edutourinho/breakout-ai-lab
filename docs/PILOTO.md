# Evidências do piloto — 19/11/2026

## Implantado

- Repositório público independente, quatro Issues e tarefa de implementação delimitada.
- OpenCode CLI 1.19.6, modelo principal e pequeno opencode/big-pickle, sharing desativado, nenhum segredo de API pago.
- CI com node:test e Playwright em desktop/celular. Bootstrap aprovado: https://github.com/edutourinho/breakout-ai-lab/actions/runs/44542811297
- Pages configurado com fonte GitHub Actions. Deploy ainda não disparado porque não há jogo validado em main.
- Primeiro run falhou antes da inferência: Playwright 1.56.1 não suporta Ubuntu 26.04, atualmente selecionado por ubuntu-latest. Corrigido para ubuntu-24.04.

## Executor gratuito

A CLI lista Big Pickle, mas listagem não prova disponibilidade de inferência. Uma consulta mínima local recebeu em 19/11/2026 às 14:30:05 UTC:

```
AI_APICallError: Free usage limit reached. Free models work in OpenCode (https://opencode.ai); subscribe to OpenCode Go to keep going: https://opencode.ai/go
```

Nenhum plano foi contratado, chave paga fornecida, identidade/IP trocado ou fallback pago habilitado. A primeira consulta encerrou em timeout de 45s; o diagnóstico com logs identificou o limite. Não é possível inferir desses testes a cota exata, quando será renovada, ou se o limite é por conta, rede ou modelo. Não há garantia de que cadastrar uma conta gratuita resolva.

A execução Actions 44542811277 deve ser avaliada separadamente; seu resultado não pode ser deduzido do teste local. Os eventos da primeira versão são gravados em arquivo e publicados ao término; o PR #5 permite acompanhamento ao vivo nas próximas execuções e rejeita resultados sem implementação.

## Alternativa descartada após verificação

GitHub Models foi integralmente encerrado em 30/07/2026, incluindo API de inferência. Guias antigos com models:read e GITHUB_TOKEN não são uma solução atual: https://docs.github.com/en/github-models

## O que falta para concluir

Comprovar uma inferência gratuita disponível, obter implementação na branch, revisar código e testes reais, validar jogabilidade em desktop e celular, registrar revisão no SHA exato e só então fazer merge e deploy manual do Pages. O CI inicial valida o scaffold, não o jogo.

Fontes oficiais consultadas: https://opencode.ai/docs/console/models/ ; https://docs.github.com/en/billing/concepts/product-billing/github-actions ; https://docs.github.com/en/github-models
