# Validação da V1 — 19/11/2026

## Autoria e execução

O jogo foi implementado pelo OpenCode 1.19.6 com opencode/big-pickle no Actions 44542811277. Eventos brutos em docs/runs/events-44542811277.jsonl: 89 eventos, sem eventos de erro; custo relatado pelo executor igual a zero. Nenhuma chave de API paga foi fornecida. A consulta local ao mesmo serviço recebeu limite gratuito; esse resultado não se reproduziu na execução do GitHub, portanto não garante disponibilidade contínua nem informa a cota exata.

## Revisão independente do coordenador

Revisados HTML, CSS, lógica, renderização, controle de entrada e testes. A física usa passo fixo 1/120s, delta limitado e subpassos; pontua uma vez por bloco; vidas e telas finais têm transições explícitas. Não foram encontradas chamadas de rede no jogo, dependências runtime externas ou credenciais.

O coordenador corrigiu dois problemas encontrados na revisão: falta de lançamento da bola em dispositivo sem teclado e retenção de entradas ao pausar. Adicionou botão visível Lançar bola e ampliou o teste mobile para lançamento, pausa, retomada e reinício; adicionou regressão para tecla mantida ao pausar. O detector de plataforma nos testes agora distingue o ciano da plataforma do brilho branco da bola, evitando falso deslocamento.

## Resultados locais da revisão

- 14 testes unitários aprovados.
- 9 testes de navegador aprovados; 1 ignorado porque toque só se aplica ao perfil mobile.
- Interface conferida em capturas desktop e mobile, sem rolagem horizontal em viewport de 360px.
- Simulação independente da física usando controle automático da plataforma: vitória após 18.271 quadros (152,26s simulados), 400 pontos, duas vidas e zero blocos restantes. Verificadas a cada quadro posições finitas, limites da plataforma, vidas e correspondência entre pontos e blocos destruídos.
- Capturas: docs/evidence/breakout-desktop.png e breakout-mobile-paused.png.

O CI do SHA final do PR #8 ainda deve estar verde antes do merge. O PR não usa auto-merge. Deploy Pages é disparado manualmente pelo coordenador somente após validação.

## Limites

V1 com uma fase, sem som, recorde persistente ou níveis adicionais. Navegador automatizado: Chromium desktop e mobile emulado; não substitui teste em aparelho Android/iOS real. As telas de vitória/derrota são cobertas pela lógica e revisão do código; o teste de foco usa evento sintético.
