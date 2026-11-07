# CRM Kanban do Coach Planner (integrado ao WhatsApp)

Cada mensagem que chega no seu WhatsApp vira um card no quadro, sozinha. Você arrasta o card pelas etapas da venda e responde pelo próprio app.

```
Cliente manda mensagem
        │
        ▼
WhatsApp ──► Ponte (crm/bridge) ──► Supabase (banco) ──► App Kanban (crm/app)
                 ▲                                            │
                 └──────── respostas escritas no app ◄────────┘
```

| Peça | O que faz | Custo |
|---|---|---|
| `crm/app` | O quadro Kanban, no navegador do computador ou do celular | R$ 0 (hospedagem gratuita) |
| `crm/supabase` | Banco de dados, login e atualização em tempo real | R$ 0 (plano Free do Supabase) |
| `crm/bridge` | Liga o seu WhatsApp ao banco, como um "aparelho conectado" | R$ 0 (servidor Always Free da Oracle ou o seu computador) |

## Como funciona no dia a dia

- **Mensagem nova** de alguém que ainda não tem card: o card aparece em **Novo lead**, com o nome do perfil, o número e a mensagem.
- **Mensagem de quem já tem card**: o card sobe para o topo da coluna e ganha um contador vermelho de não lidas.
- **Etapas:** Novo lead, Em conversa, Proposta enviada, Aguardando pagamento, Pago · entregar, Concluído e Perdido. Mude a etapa arrastando o card no computador; no celular, abra o card e escolha a etapa.
- **No card** você define produto (o valor do PRO, ELITE e SPECIAL é preenchido sozinho), valor, data de retorno e anotações. Cada coluna mostra a soma dos valores.
- **Responder:** escreva no card (ou escolha uma resposta pronta) e toque em *Enviar pelo WhatsApp*. A mensagem sai do seu número. Ctrl+Enter também envia.
- **O que você responde pelo celular** também aparece na conversa do card.
- **Contatos pessoais** (família, amigos): abra o card e toque em *Ignorar contato*. Novas mensagens dessa pessoa não entram mais. O filtro *Contatos ignorados* mostra quem foi ignorado.
- **Grupos, status e canais** nunca viram card.
- **Filtros:** busca por nome, número, mensagem ou anotação; *Não lidas*; *Retorno para hoje ou atrasado*.

Para mudar etapas, produtos, preços ou respostas prontas, edite as listas `STAGES`, `PRODUCTS` e `TEMPLATES` no início de `crm/app/app.js`. Ao criar ou renomear etapas, ajuste também a lista `check (stage in (...))` na migração.

## Atenção: conexão não oficial

A ponte conecta o seu número do mesmo jeito que o WhatsApp Web, usando a biblioteca de código aberto [Baileys](https://github.com/WhiskeySockets/Baileys). Esse uso não é oficial da Meta. Para reduzir o risco de bloqueio:

- **Não** use para mensagens em massa nem para mandar mensagem a quem não te chamou.
- Responda em ritmo normal de conversa. A ponte já espera um pouco entre envios seguidos.
- Abra o WhatsApp no celular ao menos a cada 14 dias, senão os aparelhos conectados se desligam.

O caminho 100% oficial (API do WhatsApp Business) exige um parceiro da Meta e tem custo. Se um dia quiser migrar, só a ponte muda; o banco e o app continuam iguais.

---

## Instalação

> **Já feito para o Coach Planner:** o projeto Supabase `coach-planner-crm` (São Paulo, plano Free) já tem as tabelas, o e-mail sttudioonze@gmail.com autorizado e o `app/config.js` preenchido. Falta: criar o seu login (passo 1.3), desligar novos cadastros (passo 1.5), ligar a ponte (etapa 2) e publicar o app (etapa 3).

São três etapas, nesta ordem. Leva cerca de 1 hora na primeira vez.

### 1. Banco de dados (Supabase)

1. Crie uma conta em [supabase.com](https://supabase.com) e um projeto novo (plano **Free**, região **South America (São Paulo)**).
2. No menu **SQL Editor**, cole o conteúdo de cada arquivo de `crm/supabase/migrations/`, em ordem (`...000000_crm_whatsapp.sql` e depois `...000100_crm_private_schema.sql`), clicando em **Run** a cada um.
3. Em **Authentication > Users > Add user > Create new user**, crie o seu login com e-mail e senha e marque **Auto Confirm User**.
4. Volte ao **SQL Editor** e autorize esse e-mail no CRM (em letras minúsculas):
   ```sql
   insert into public.crm_users (email) values ('seu-email@exemplo.com');
   ```
   Repita para cada pessoa da equipe que vai usar o quadro.
5. Em **Authentication > Sign In / Providers**, desligue **Allow new users to sign up**, para ninguém criar conta sozinho.
6. Em **Project Settings > API** (ou **API Keys**), anote:
   - **Project URL**
   - a chave **anon / publishable** (pública, vai no app)
   - a chave **service_role / secret** (secreta, vai só na ponte)

Projetos gratuitos do Supabase podem ser pausados depois de uma semana sem uso. A ponte grava um sinal de vida a cada minuto, o que deve manter o projeto ativo. Se ele pausar, reative em um clique pelo painel.

### 2. Ponte do WhatsApp (precisa ficar ligada)

A ponte precisa de um computador ligado 24h. Opção gratuita recomendada: uma máquina **Always Free** da Oracle Cloud.

**Criar o servidor (uma vez):**

1. Crie uma conta em [oracle.com/cloud/free](https://www.oracle.com/cloud/free/). Ela pede um cartão para confirmar identidade; a máquina Always Free não gera cobrança.
2. Crie uma instância **Ubuntu** com o formato **VM.Standard.A1.Flex** (1 OCPU e 6 GB bastam) e baixe a chave SSH.
3. Conecte ao servidor e instale o Node.js 22:
   ```bash
   ssh -i sua-chave.key ubuntu@IP-DO-SERVIDOR
   ```
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs git
   ```

**Instalar a ponte:**

```bash
git clone https://github.com/sttudioonze-sketch/coach-planner.git && cd coach-planner/crm/bridge
```
```bash
npm install --omit=dev
```
```bash
cp .env.example .env && nano .env
```

No `.env`, preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. Salve com Ctrl+O, Enter e Ctrl+X.

**Conectar o WhatsApp (primeira vez):**

```bash
npm start
```

Um QR Code aparece no terminal e também no app Kanban. No celular, abra o WhatsApp > **Aparelhos conectados** > **Conectar aparelho** e escaneie. Quando aparecer `WhatsApp conectado`, pare com Ctrl+C.

**Deixar ligada 24h:**

```bash
sudo cp coach-planner-crm.service /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable --now coach-planner-crm
```

Para acompanhar o que a ponte está fazendo:

```bash
journalctl -u coach-planner-crm -f
```

> **Sem servidor?** Dá para rodar `npm start` no seu próprio computador. A ponte só funciona enquanto ele estiver ligado; as mensagens que chegarem com ele desligado entram quando você ligar de novo.

A pasta `crm/bridge/auth/` guarda a sessão do WhatsApp. Não compartilhe nem envie essa pasta ao GitHub; ela já está no `.gitignore`. Se apagá-la, será preciso escanear o QR Code de novo.

### 3. App Kanban

1. Em `crm/app/config.js`, preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY` (a chave **pública**; nunca a service_role).
2. Publique a pasta `crm/app` em uma hospedagem gratuita. O jeito mais simples: [app.netlify.com/drop](https://app.netlify.com/drop), arrastando a pasta `crm/app`. Cloudflare Pages ou GitHub Pages também servem.
3. Abra o endereço gerado, entre com o e-mail e a senha do passo 1 e, no celular, adicione à tela inicial.

O app não é publicado junto com a landing page: o site usa só a pasta `site/`.

Para testar no computador sem publicar, na raiz do repositório:

```bash
python3 -m http.server 4174 --directory crm/app
```

Depois abra `http://localhost:4174`.

---

## Segurança

- Só e-mails cadastrados em `crm_users` enxergam os dados, mesmo que alguém crie uma conta. Essa regra fica no próprio banco (RLS).
- A chave **service_role** fica só no `.env` do servidor da ponte. O app usa apenas a chave pública.
- O app não consegue criar mensagens falsas no histórico: só a ponte grava mensagens. O app apenas pede envios, pela tabela `crm_outbox`.
- Se um envio for interrompido no meio (servidor reiniciou), ele aparece como "não enviada" em vez de ser repetido, para não mandar mensagem duplicada ao cliente.

## Testes

```bash
cd crm/bridge && npm test
```

Os testes conferem como as mensagens do WhatsApp são lidas (texto, mídia, grupos, contatos com número oculto).

## Estrutura

- `app/index.html`, `app/styles.css`, `app/app.js`: o quadro Kanban.
- `app/config.js`: endereço e chave pública do Supabase.
- `supabase/migrations/`: tabelas, regras de acesso e a função que registra cada mensagem.
- `bridge/src/index.js`: conexão com o WhatsApp, gravação das mensagens e envio das respostas.
- `bridge/src/parse.js`: transforma cada mensagem do WhatsApp em texto para o CRM.
- `bridge/coach-planner-crm.service`: mantém a ponte ligada no servidor.
