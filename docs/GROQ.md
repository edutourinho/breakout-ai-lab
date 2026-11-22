# Groq Free: experimento isolado — 22/11/2026

O padrão opencode/big-pickle, seu workflow e a publicação do jogo não são alterados. Novo preset em config/opencode-groq-free.json e workflow Provider benchmark (Groq Free), somente na branch lab/groq-provider até revisão. Não fazer merge/deploy do jogo sem aprovação do usuário.

## Compatibilidade e limites verificados

OpenCode 1.19.6 possui integração Groq. O modelo recomendado pela documentação oficial Groq/OpenCode é openai/gpt-oss-120b, com ferramentas e janela de 131072 tokens. A janela do modelo não equivale à cota gratuita: o Free público oferece 30 RPM, 1000 RPD, 8000 TPM e 200000 TPD para esse ID. A organização pode ter limites diferentes; conferir no console. GPT-OSS-20B tem as mesmas cotas públicas e não oferece ganho de cota por minuto. Qwen3.8-27B consta no Free, mas é preview; não foi habilitado. Modelos Llama antigos não constam na tabela Free atual e não foram escolhidos.

O preset permite apenas Groq/GPT-OSS-120B, sem fallback. Principal e pequeno usam o mesmo modelo. Contexto experimental limitado a 7000 tokens e saída a 1000, seis etapas e timeout de cinco minutos por provedor. O limite de contexto reduz risco de exceder 8000 TPM em um único pedido; não garante que várias requisições caibam na mesma janela. HTTP 429 encerra/limita a execução dentro do timeout; não trocar chave, organização ou rede para contornar cota.

Modelos do Free também têm preços publicados para o Developer pago. Preço estimado pelo catálogo da CLI não prova cobrança: gratuidade depende do plano da organização. Nenhuma operação deste experimento altera faturamento ou contrata plano. Groq só executa depois da confirmação do Free no arquivo de solicitação.

## Chave

Nome do Secret de Actions: GROQ_API_KEY. A chave só é injetada na etapa experimental. Não escrever valor no repositório, em comandos, prompts, documentos, chat ou artifacts. O caminho fornecido pelo usuário é local ao computador dele e não está disponível no ambiente remoto. A integração GitHub aqui não dispõe de gravação de Secrets; cadastro pelo usuário é necessário, a menos que outro ambiente autenticado seja disponibilizado.

O agente possui ferramentas de arquivos limitadas ao sandbox: sem shell, web, subagentes ou acesso a diretórios externos. A chave fica no cliente OpenCode, nunca no prompt. Saída bruta não é publicada. Resultados publicam apenas métricas e os dois arquivos permitidos, com rejeição explícita de valor da chave ou padrão gsk_. Código gerado é testado sem credenciais sob UID nobody; a etapa não recebe GITHUB_TOKEN.

## Experimento e comparação

Mesma CLI, tarefa, limite de etapas, contexto/saída e ferramentas para Big Pickle e Groq. Cada um deve criar um módulo puro de movimento da plataforma e seus testes em diretório temporário. Um avaliador independente verifica bordas, movimento, tempo, propriedades e imutabilidade. Nada é copiado para src/ do jogo. Os resultados ficam em artifact com retenção de um dia e no resumo do job; o coordenador registra a comparação durável após ler a execução.

free_plan_confirmed começa false. Assim o controle Big Pickle pode rodar, mas Groq não faz requisição antes da confirmação. Se faltar Secret ou modelo, o relatório registra bloqueio em vez de alegar sucesso. O job conserva status de falha. A antiga geração da V1 levou 1059,994s para tarefa muito maior e não deve ser tratada como benchmark de velocidade equivalente.

## Fontes oficiais

- https://console.groq.com/docs/coding-with-groq/opencode
- https://console.groq.com/docs/models
- https://console.groq.com/docs/rate-limits
- https://console.groq.com/docs/openai
- https://console.groq.com/docs/billing-faqs
- https://opencode.ai/v1/docs/providers/
- https://opencode.ai/v1/docs/agents/
