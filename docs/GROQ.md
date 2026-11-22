# Groq Free no laboratório — 22/11/2026

OpenCode 1.19.6 foi validado com GroqCloud usando `groq/qwen/qwen3.8-27b`. O modelo é preview. `opencode/big-pickle` continua sendo o modelo principal e pequeno padrão de `opencode.json`; Groq é opcional, sem fallback automático. Os workflows anteriores de agente, CI e Pages permanecem intactos. Nenhum arquivo do jogo foi alterado e nenhum deploy foi solicitado.

## Plano, modelos e limites

O usuário cadastrou `GROQ_API_KEY` em Actions Secrets e confirmou a organização no plano Free sem faturamento. A autenticação e a disponibilidade do Qwen foram verificadas por execução real. A chave não foi lida pelo coordenador nem colocada em prompts, logs públicos ou commits. Nenhuma configuração de faturamento foi alterada.

A tabela pública Free consultada nesta data informa, para Qwen3.8-27B, GPT-OSS-120B e GPT-OSS-20B: **30 requisições/minuto, 1000/dia, 8000 tokens/minuto e 200000 tokens/dia**, por organização. Limites efetivos do console prevalecem. O mesmo ID tem preço no plano Developer: o preço do catálogo exibido pela CLI é uma estimativa, não uma cobrança da conta Free. Não habilitar Developer/faturamento sem autorização.

A documentação Groq recomenda GPT-OSS-120B para OpenCode. Neste ambiente, ele autenticou, mas falhou repetidamente ao formar argumentos JSON das ferramentas (runs 45079712226 e 45079937090), deixando a tarefa incompleta mesmo com saída ampliada. Qwen3.8-27B concluiu duas execuções. GPT-OSS-20B consta na lista Free permitida do harness, mas não foi experimentado; não há troca automática de modelo. IDs fora da lista são rejeitados.

O preset Groq usa contexto de 8000, saída de 3000 tokens, reasoningEffort none, ferramentas sequenciais, seis etapas de agente e timeout de cinco minutos. Esses limites reduzem o tamanho de pedidos, mas não garantem caber na cota acumulada por minuto. O Big Pickle usa seu orçamento nativo: impor o mesmo teto pequeno consumiu toda a saída em raciocínio e prejudicou o controle. OpenCode permaneceu na versão 1.19.6 já utilizada no projeto.

## Experimento reproduzível

Workflow `Provider benchmark (Groq Free)`: manual, ou push do arquivo `experiments/groq/request.json` na branch `lab/groq-provider`. Execução serial no grupo `opencode-pilot`, timeout total de quinze minutos. Após integração, pode ser disparado manualmente, escolhendo a branch. O arquivo registra `free_plan_confirmed: true`, com base na confirmação explícita do usuário; retirar essa confirmação impede chamadas Groq. Secret ausente também bloqueia antes da inferência.

Mesma especificação, CLI, ferramentas e avaliador para ambos os provedores: criar uma função pura `movePaddle` e testes, em diretório temporário. Os perfis de orçamento diferem conforme explicado acima. Cada modelo recebe somente seu provedor e nenhuma credencial do outro. O agente não possui shell, web, subagentes nem acesso externo. Seu cliente recebe a chave por variável de ambiente; o prompt não contém o valor. Checkout não persiste credenciais GitHub. Código gerado é testado sob UID nobody com ambiente vazio, sem chave.

Saída bruta não é publicada. O harness remove credenciais das métricas e rejeita arquivos com a chave ou padrão gsk_. Só dois arquivos gerados são exportados, sem alterações em configurações ou arquivos originais. Sete testes do harness verificam bloqueios, redação, parser, perfil de ferramentas, lista de modelos e detecção de limite. Seis deles também passaram no job da comparação final; o sétimo foi acrescentado e passou localmente após identificar uma heurística excessivamente ampla de HTTP 429.

## Resultados

Comparação final: [run 45080764000](https://github.com/edutourinho/breakout-ai-lab/actions/runs/45080764000), commit c1587f61df02be16a8fbac3cd947ce92f1494c8d.

| Provedor/modelo | Tempo do agente | Etapas | Tokens entrada/saída | Testes próprios | Testes independentes | Resultado |
|---|---:|---:|---:|---:|---:|---|
| OpenCode Big Pickle | 22,852 s | 2 | 5859 / 1042 | 7 | 4 | Passou |
| Groq Qwen3.8-27B | 23,001 s | 4 | 9148 / 1187 | 10 | 4 | Passou |

Big Pickle também reportou 2886 tokens de raciocínio; Qwen, zero. Ambos os códigos foram revisados. Os dois implementam movimento, limites e imutabilidade corretamente para os inputs válidos da tarefa. A contagem de testes próprios não é medida isolada de qualidade. O tempo inclui chamadas e eventuais esperas do cliente, mas não instalação/checkout/testes.

Na execução anterior [45080243354](https://github.com/edutourinho/breakout-ai-lab/actions/runs/45080243354), Qwen passou em 179,783 s com 8 testes próprios e 4 independentes, enquanto Big Pickle falhou sob o teto artificial de saída. Isso motivou restaurar o orçamento nativo do controle. A variação mostra que uma tarefa curta não permite concluir superioridade geral ou velocidade consistente. O antigo desenvolvimento completo da V1 é uma tarefa diferente e não serve de comparação direta.

Evidências duráveis: `experiments/results/45080764000/` e `experiments/results/45080243354/`, contendo métricas originais e os arquivos gerados. Artifacts de Actions expiram em um dia. A propriedade histórica `rate_limit_detected` do Big Pickle no resultado final é **inconclusiva**: a versão original procurava qualquer sequência 429 na saída inteira, inclusive IDs/horários. Não é evidência de HTTP 429. O detector foi corrigido para examinar mensagens de erro; o log bruto não foi preservado por segurança, portanto o campo original não foi reescrito.

Conclusão operacional: Groq/Qwen é alternativa viável para tarefas pequenas neste Free. Big Pickle continua padrão. Qwen é preview, a cota é baixa para loops longos e GPT-OSS-120B precisa de ajuste de compatibilidade antes de uso. A integração fica disponível no PR sem publicar mudanças no Breakout.

## Fontes oficiais consultadas

- https://console.groq.com/docs/coding-with-groq/opencode
- https://console.groq.com/docs/models
- https://console.groq.com/docs/rate-limits
- https://console.groq.com/docs/reasoning
- https://console.groq.com/docs/tool-use/overview
- https://console.groq.com/docs/billing-faqs
- https://opencode.ai/v1/docs/providers/
- https://opencode.ai/v1/docs/agents/
- https://ai-sdk.dev/providers/ai-sdk-providers/groq
