# Coach Planner

Landing page da linha Coach Planner, com documentos para treinadores de futebol.

Versão visual atual: **V5**. Composição de documentos originais, skeumorphism suave e profundidade discreta ao mover o mouse. Carrossel de documentos com controles e suporte a movimento reduzido. O vídeo experimental não faz parte desta versão.

## Prévia local

Na raiz do repositório:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory site
```

Abra `http://127.0.0.1:4173/`.

## Estrutura

- `site/index.html`: conteúdo da landing page.
- `site/styles.css`: layout responsivo e materiais visuais.
- `site/app.js`: carrossel, categorias, menu e formulário.
- `site/hero-depth.js`: profundidade dos documentos com mouse, desativada em toque/celular e movimento reduzido.
- `site/assets/`: miniaturas WebP, marca, banner e PDF gratuito de demonstração.

Sem dependências de build ou backend. Para hospedagem estática, use **`site/` como diretório público**.

## Integrações

Os pedidos dos planos abrem o WhatsApp com uma mensagem pronta; não há envio automático de mensagens. Os links definitivos de checkout ainda precisam ser configurados.

O formulário usa um endpoint público Brevo. A automação de e-mail e o envio no domínio final ainda precisam ser validados pelo responsável da conta. Nenhum teste de escrita em serviços de produção faz parte desta entrega.

## Verificações

Layout conferido em larguras de 320 a 1920 px, sem rolagem horizontal da página ou títulos cortados. Interações locais, galeria e retorno dos documentos ao repouso foram conferidos. A validação por largura não substitui testes em aparelhos físicos e navegadores nativos antes da publicação.

## Escopo do repositório

Este repositório contém apenas os arquivos usados pelo site. Conversas, documentos de trabalho, material original em alta resolução e experimentos rejeitados permanecem fora do Git. A lista explícita em `.gitignore` protege esses materiais na pasta de trabalho; atualize-a ao incluir novos arquivos do site.

Enviar código ao GitHub não publica o site. Hospedagem, domínio e integrações de produção são etapas separadas.
