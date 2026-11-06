# Modelos

Modelos para cada fase da skill `brainstorm-para-projeto`. Preencha só o que tiver informação; o que faltar fica como `[definir]` ou `[hipótese]`.

---

## 1. Inventário (Fase 1)

```markdown
## Inventário de ideias

| # | Item | Tipo | Origem |
|---|------|------|--------|
| 1 | Planilha de treino semanal para sub-15 | IDEIA | nota do usuário |
| 2 | Treinador perde tempo montando sessão do zero | PROBLEMA | conversa |
| 3 | Lançar antes do início da temporada | RESTRIÇÃO | conversa |
| 4 | Vale cobrar assinatura ou venda avulsa? | PERGUNTA | conversa |

Duplicatas unidas: #7 + #12 ("kit de exercícios" / "banco de exercícios")
```

Tipos: `IDEIA`, `PROBLEMA`, `OBJETIVO`, `RESTRIÇÃO`, `PERGUNTA`, `REFERÊNCIA`.

---

## 2. Mapa de temas (Fase 2)

```markdown
## Mapa de temas

**Fio condutor:** No fundo, a ideia é ___ para ___ porque ___.

### Tema A: <nome curto>
<uma frase de descrição>
- Atende: <PROBLEMA/OBJETIVO #>
- Itens: #1, #5, #9

### Tema B: <nome curto>
...

### Conflitos
- #3 × #8: <descrição do conflito>
```

---

## 3. Matriz de decisão (Fase 3)

```markdown
| Ideia | Impacto (1-3) | Esforço (1-3) | Certeza (1-3) | Encaixe | Grupo |
|-------|---------------|---------------|---------------|---------|-------|
| #1 Planilha semanal | 3 | 1 | 3 | sim | Agora |
| #6 App com IA | 3 | 3 | 1 | parcial | Experimento |
| #11 Loja física | 1 | 3 | 1 | não | Estacionamento |
```

Leitura rápida:
- Impacto alto + esforço baixo + certeza alta → **Agora**
- Impacto alto + certeza baixa → **Experimento**
- Depende de algo do MVP → **Depois**
- Encaixe "não", ou impacto baixo com esforço alto → **Estacionamento**

### Estacionamento

```markdown
| Ideia | Motivo | Rever quando |
|-------|--------|--------------|
| #11 Loja física | custo alto, não ajuda a validar a proposta | após 100 vendas online |
```

---

## 4. Registro de decisões (Fase 3)

Uma entrada por decisão relevante. Decisão revertida não é apagada: marque como *substituída* e crie uma nova entrada.

```markdown
### D-001: <título da decisão>
- **Data:** AAAA-MM-DD
- **Status:** decidida | substituída por D-00X | em aberto
- **Contexto:** <o que motivou a decisão, em 1-2 linhas>
- **Opções consideradas:** A) ... B) ... C) ...
- **Escolha:** <opção> — **quem decidiu:** usuário | sugerido por Claude e aceito
- **Por quê:** <critério principal>
- **Consequência:** <o que muda / o que fica de fora>
```

---

## 5. Brief do projeto (Fase 4)

```markdown
# <Nome provisório>

> <Resumo em uma frase: o que é, para quem e qual resultado.>

## Problema
<Qual dor existe hoje e para quem. Use exemplos do brainstorming.>

## Para quem
<Público principal. Público secundário, se houver.>

## Proposta
<O que será feito, em 3-5 linhas.>

## Objetivo e sucesso
| Métrica | Meta | Prazo |
|---------|------|-------|
| <ex.: downloads do PDF gratuito> | [definir] | [definir] |

## Escopo
**Dentro (MVP):**
- ...

**Fora (por enquanto):**
- ...

## Premissas e riscos
| Item | Tipo | Como validar / mitigar |
|------|------|------------------------|
| Treinadores pagariam por modelo pronto | [hipótese] | página de pré-venda por 2 semanas |
| Prazo curto até a temporada | risco | cortar escopo, não qualidade |

## Perguntas em aberto
- ...
```

---

## 6. Plano (Fase 5)

```markdown
# Plano: <Nome>

## Próxima ação
<Uma tarefa que dá para começar hoje.>

## Caminho crítico
T1 → T2 → T4 → Marco 1

## Marco 1: <resultado visível>
**Pronto quando:** <critério verificável do marco>

| # | Tarefa | Pronto quando | Depende de | Tam. | Status |
|---|--------|---------------|------------|------|--------|
| T1 | Criar ... | ... | — | P | a fazer |
| T2 | Escrever ... | ... | T1 | M | a fazer |

## Marco 2: <resultado visível>
...

## Depois (pós-MVP)
- ...
```

Tamanhos: **P** = algumas horas · **M** = até 1 dia · **G** = mais de 1 dia (quebre em tarefas menores sempre que puder).

---

## 7. Experimento (Fase 5)

```markdown
### E-01: <nome>
- **Hipótese:** Acreditamos que <ação> vai levar a <resultado> para <público>.
- **Teste:** <o menor teste possível>
- **Sinal de sucesso:** <número ou observação concreta>
- **Prazo:** <data ou duração>
- **Se der certo:** <o que entra no plano>
- **Se não der:** <o que vai para o estacionamento>
```
