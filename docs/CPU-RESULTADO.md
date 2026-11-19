# Experimento CPU — resultado de 19/11/2026

Run: https://github.com/edutourinho/breakout-ai-lab/actions/runs/44545179961

Ollama 0.40.16 foi instalado com checksum verificado; Qwen3:4b foi baixado e executou inferência local no runner. O preflight respondeu texto, mas não obedeceu ao pedido de responder apenas OK: produziu trecho de raciocínio e atingiu o limite de saída de 16 tokens.

OpenCode 1.19.6 com esse modelo não concluiu a tarefa de plataforma em 600 segundos. O processo terminou com exit code 124. Nenhum src/paddle.js ou tests/paddle.test.js foi gerado. Evidências foram preservadas na branch opencode/cpu-paddle-44545179961, em docs/runs/.

O workflow ficou vermelho corretamente por falha do agente. A etapa de testes executou apenas o teste do scaffold, por uma falha da checagem shell: test A && test B não abortou a sequência quando A faltou. Isso não comprova implementação. Neste PR, a guarda foi corrigida para duas verificações separadas; o preflight agora exige OK exato. As novas guardas ainda não foram reexecutadas com o modelo.

Conclusão: inferência por CPU é possível, mas este modelo/configuração não foi validado como executor de desenvolvimento. Manter experimento em draft e não promover para produção. Ajustes futuros possíveis: modelo instrucional sem raciocínio longo, contexto/ferramentas menores e benchmark de latência, antes de nova tarefa. Não repetir automaticamente nem contratar API paga.

O piloto principal teve sucesso com OpenCode/Big Pickle no runner e gerou o jogo no PR #8, revisado e integrado após CI verde. A falha deste experimento não altera a V1.