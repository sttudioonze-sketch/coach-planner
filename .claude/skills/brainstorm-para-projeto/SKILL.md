---
name: brainstorm-para-projeto
description: Transforma um brainstorming (anotações soltas, lista de ideias, transcrição de conversa, áudio transcrito, prints de quadro) em um projeto pronto para executar, com ideias organizadas, decisões registradas, brief de uma página, escopo do MVP, plano por etapas e backlog com critério de pronto. Pode seguir até a implementação da primeira etapa no repositório. Use quando o usuário disser "tenho umas ideias", "brainstorming", "chuva de ideias", "organiza essas ideias", "transforma isso em projeto", "por onde eu começo", "monta um plano a partir disso", "quero tirar essa ideia do papel", ou colar um bloco desorganizado de ideias pedindo direção. Também em inglês: "turn this brainstorm into a project", "organize my ideas", "project plan from notes".
---

# Do brainstorming ao projeto

Esta skill leva material de brainstorming bruto até um projeto com direção clara, passando por cinco fases. Cada fase gera um artefato curto que alimenta a seguinte. O trabalho é convergir: sair de muitas ideias para uma escolha justificada, sem perder o que ficou de fora.

```
1. Capturar  →  2. Organizar  →  3. Decidir  →  4. Definir  →  5. Planejar  →  (6. Executar)
   inventário     mapa de temas    decisões       brief          plano + backlog   1ª etapa
```

## Princípios

- **Use as palavras do usuário.** Ao agrupar ou resumir, preserve os termos que ele usou. Reescreva só o necessário para dar clareza.
- **Não invente fatos.** Números, prazos, preços, público, concorrentes e resultados só entram se vieram do usuário ou de uma fonte verificada. O que for suposição recebe a marca `[hipótese]` e vai para a lista de premissas a validar.
- **Nada se perde.** Ideia descartada ou adiada vai para o **Estacionamento**, com uma linha explicando o motivo. O usuário precisa ver que a ideia foi considerada.
- **Pergunte só nas decisões.** Organizar, agrupar e redigir você faz sozinho. Pare para perguntar apenas quando houver uma escolha que muda o projeto: objetivo principal, público, o que entra no MVP, prazo, orçamento. No máximo 3 perguntas por vez, cada uma com opções e uma recomendação.
- **Pequeno e entregável primeiro.** O MVP é a menor versão que prova a ideia central. Se o primeiro marco não cabe em poucos dias de trabalho, ele está grande demais.
- **Contexto antes de planejar.** Se a conversa acontece dentro de um repositório, leia o README, a estrutura e as convenções antes de propor o plano. O plano precisa caber no que já existe.

## Fase 1: Capturar

Objetivo: ter todo o material em um só inventário, sem julgar nada ainda.

1. Junte tudo o que o usuário enviou: texto colado, arquivos, links, conversa anterior.
2. Quebre em itens atômicos, um por linha, cada um com uma única ideia.
3. Classifique cada item com uma etiqueta:
   - `IDEIA`: algo a fazer ou construir
   - `PROBLEMA`: dor, incômodo ou necessidade
   - `OBJETIVO`: resultado desejado
   - `RESTRIÇÃO`: limite de prazo, verba, tecnologia, equipe
   - `PERGUNTA`: dúvida em aberto
   - `REFERÊNCIA`: exemplo, inspiração, concorrente
4. Junte duplicatas e quase-duplicatas, mantendo a formulação mais clara.

Se o material for muito curto (uma frase ou duas), faça uma rodada rápida de expansão antes de seguir: proponha de 5 a 10 variações ou desdobramentos e peça ao usuário que marque as que fazem sentido.

## Fase 2: Organizar

Objetivo: enxergar a forma do brainstorming.

1. Agrupe os itens em **3 a 7 temas**, cada um com nome curto e uma frase de descrição.
2. Para cada tema, aponte qual `PROBLEMA` ou `OBJETIVO` ele atende. Ideia sem problema associado ganha a etiqueta `[sem dor clara]`.
3. Identifique **o fio condutor**: a frase que resume o que o usuário realmente quer. Escreva em uma linha: *"No fundo, a ideia é ___ para ___ porque ___."*
4. Liste conflitos entre ideias, quando houver (ex.: "app gratuito" vs. "receita no primeiro mês").

Mostre ao usuário o mapa de temas e o fio condutor. É o primeiro ponto de confirmação: se o fio condutor estiver errado, todo o resto sai errado.

## Fase 3: Decidir

Objetivo: escolher o que entra, com critério explícito.

1. Avalie cada ideia candidata em uma tabela com:
   - **Impacto** no objetivo (1 a 3)
   - **Esforço** para entregar (1 a 3)
   - **Certeza**, isto é, o quanto se sabe que funciona (1 a 3)
   - **Encaixe** com o fio condutor (sim / parcial / não)
2. Ordene por impacto e certeza altos e esforço baixo. Ideias com impacto alto e certeza baixa viram **experimentos** e não features.
3. Proponha um corte em três grupos:
   - **Agora (MVP):** o mínimo que prova o fio condutor
   - **Depois:** melhorias que dependem do MVP funcionar
   - **Estacionamento:** fora de escopo, com o motivo
4. Registre cada decisão no formato do `references/modelos.md` → *Registro de decisões*.

Segundo ponto de confirmação: apresente o corte e as perguntas que só o usuário pode responder.

## Fase 4: Definir

Objetivo: uma página que qualquer pessoa leia e entenda o projeto.

Escreva o **Brief do projeto** usando o modelo em `references/modelos.md`. Ele deve conter:

- nome provisório e resumo em uma frase
- problema e para quem
- proposta (o que será feito)
- objetivo e como medir sucesso (métrica + meta, ou `[definir]` se não houver dado)
- escopo: dentro e fora
- premissas e riscos, com as `[hipótese]` reunidas aqui
- perguntas em aberto

Limite: uma página. Se passar disso, corte.

## Fase 5: Planejar

Objetivo: transformar o MVP em passos executáveis.

1. Divida o MVP em **marcos** (2 a 5). Cada marco termina em algo que se pode ver, testar ou mostrar.
2. Quebre cada marco em **tarefas**, e cada tarefa tem:
   - verbo de ação + objeto ("Criar seção de planos na landing")
   - critério de pronto verificável ("aparece em 320 px sem rolagem lateral")
   - dependência, se houver
   - tamanho P / M / G
3. Marque o **caminho crítico**: a sequência mínima até o primeiro marco.
4. Para cada experimento da Fase 3, defina hipótese, teste, sinal de sucesso e prazo.
5. Defina a **próxima ação**: uma tarefa que dá para começar hoje.

## Fase 6: Executar (opcional)

Só entre nesta fase se o usuário pedir, ou se o pedido original já era "monta e começa".

- Trabalhe no primeiro marco, uma tarefa por vez, na ordem do caminho crítico.
- Siga as convenções do repositório: estrutura de pastas, estilo, comandos de verificação descritos no README.
- Verifique cada tarefa pelo critério de pronto antes de marcá-la como concluída, e diga como verificou.
- Atualize o backlog conforme avança. Ideia nova que surgir durante a execução vai para *Depois* ou *Estacionamento*, nunca entra direto no marco atual.

## Onde salvar

Pergunte ao usuário se ele quer os artefatos em arquivos. Se sim, e se não houver convenção no projeto, use:

```
docs/projetos/<slug-do-projeto>/
  brief.md        # Fase 4
  plano.md        # Fase 5: marcos, tarefas, caminho crítico, experimentos
  decisoes.md     # Fase 3: registro de decisões
  ideias.md       # Fases 1-2: inventário, mapa de temas, estacionamento
```

Verifique antes se a pasta é versionada (`.gitignore`) e avise o usuário caso não seja.

Se o usuário só quiser a resposta no chat, entregue as fases em sequência, de forma enxuta, com títulos claros.

## Formato da entrega

Ao final de cada fase, mostre:

1. o artefato da fase (curto)
2. o que você decidiu sozinho e por quê, em uma ou duas linhas
3. as perguntas que precisam do usuário, quando houver
4. o próximo passo

Quando o usuário pedir "faz tudo de uma vez", rode as fases 1 a 5 seguidas, escolhendo as opções recomendadas nas decisões, e liste no fim todas as escolhas que você fez por ele, para que ele possa revisar.

## Modelos

Os modelos de inventário, mapa de temas, matriz de decisão, registro de decisões, brief, plano e experimento estão em `references/modelos.md`. Leia esse arquivo ao começar a Fase 1.
