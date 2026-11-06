# Coach Planner — guia para o Claude

Landing page estática da linha **Coach Planner**: documentos em PDF (A4, para imprimir e preencher à mão) para treinadores de futebol. Público: técnicos e auxiliares brasileiros. Todo o conteúdo e as respostas são em **português do Brasil**.

## Projeto

- Site estático, sem build, sem backend, sem dependências. Diretório público: `site/`.
- `site/index.html`: conteúdo (hero, carrossel de documentos, planos, outras ferramentas, FAQ, rodapé).
- `site/styles.css`: layout responsivo e materiais visuais. Variáveis em `:root` (`--red`, `--ink`, `--paper`, `--title` Bricolage Grotesque, `--body` Saira, `--max` 1200px).
- `site/app.js`: carrossel, categorias, menu e formulário Brevo.
- `site/hero-depth.js`: profundidade dos documentos com o mouse (desligada em toque e com `prefers-reduced-motion`).
- `site/assets/`: miniaturas WebP (`docs/`), marca, banner e PDF gratuito de degustação.
- Versão visual atual: **V5** (documentos originais, skeumorphism suave, profundidade discreta).

Prévia local:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory site
```

## Regras importantes

- **`.gitignore` é uma lista de permissão**: tudo é ignorado, exceto o que está listado. Ao criar um arquivo novo do site, adicione-o ao `.gitignore`, senão ele não entra no Git. Material de trabalho, originais em alta resolução e experimentos ficam fora do repositório.
- Produtos e preços (manter coerentes em todo o site): PRO R$ 57, ELITE R$ 147, SPECIAL R$ 197 (de R$ 247). Outras ferramentas: T-Manager (Excel) e Bola Parada PRO (PowerPoint). Também há versões para futsal e futebol 7.
- Pedidos abrem o WhatsApp com mensagem pronta (links `wa.me`). Não há checkout automático; os links definitivos de checkout ainda não foram configurados.
- O formulário usa um endpoint público do Brevo. **Não envie testes reais** para Brevo, WhatsApp ou outros serviços de produção.
- Fazer push no GitHub não publica o site; hospedagem e domínio são etapas separadas.
- Acessibilidade e movimento: respeitar `prefers-reduced-motion`, manter foco visível e textos alternativos.
- Antes de concluir mudanças visuais, conferir larguras de 320 a 1920 px: sem rolagem horizontal e sem títulos cortados.

## Skills a usar neste projeto

Prefira estas skills quando a tarefa se encaixar:

| Tarefa | Skill |
| --- | --- |
| Textos de venda, headlines, CTAs, planos, anúncios, mensagens de WhatsApp | `sales-copywriting` |
| Revisar qualquer texto do site para soar natural (pt-BR) | `matematic-humanizer:humanizer-pt` |
| Microcopy: botões, erros, estados vazios, formulário | `design:ux-copy` |
| Layout em desktop, tablet e mobile (Claude Design) | `canvas-responsive-breakpoints` |
| Crítica visual, hierarquia e consistência | `design:design-critique` |
| Auditoria de acessibilidade (WCAG AA) | `design:accessibility-review` |
| PDF de degustação ou documentos do produto | `pdf` |
| Abrir a página e conferir uma mudança no navegador | `run` |
| Newsletter do LinkedIn sobre o produto | `newsletter-linkedin` |
| Criar ou ajustar skills próprias | `skill-creator` |

Os plugins **sales** (CRM/pipeline B2B) e **small-business** (folha, impostos, estoque) não se aplicam a este projeto.

## Estilo de trabalho

- Mudanças pequenas e focadas; HTML, CSS e JS puros, sem frameworks nem build.
- Manter o tom do site: direto, de treinador para treinador, sem exageros.
- Atualizar o `README.md` quando a estrutura ou as integrações mudarem.
