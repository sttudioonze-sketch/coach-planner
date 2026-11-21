# Portfólio profissional de treinador

Portfólio em formato de deck: páginas de 16:9 navegáveis por setas, menu de áreas, tela cheia, vídeos do YouTube e documentos com zoom. HTML, CSS e JS puros, sem build. O formato segue a referência leandrocastam.portfolio.pro.br; o código e os elementos visuais foram escritos do zero.

## Prévia local

Na raiz do repositório:

```sh
python3 -m http.server 4174 --bind 127.0.0.1 --directory portfolio
```

Abra `http://127.0.0.1:4174/`. Cada página tem endereço próprio (ex.: `#ofensiva`).

## Como preencher para um cliente

Todo o conteúdo fica em `data.js`:

- `person`: nome, função, ano, bandeira e licença.
- `contacts`: WhatsApp, Instagram e e-mail (aparecem na última página).
- `areas`: atalhos do botão **Áreas**.
- `pages`: as páginas, na ordem em que aparecem. Apague um bloco para remover a página.

Tipos de página (`kind`): `cover`, `profile`, `qualification`, `career`, `divider`, `trophies`, `people`, `philosophy`, `overview`, `tactical`, `videos`, `setpiece`, `document`, `contacts`.

Arquivos de imagem:

- Fotos em `assets/fotos/` (capa e contatos funcionam melhor com retrato recortado em PNG de fundo transparente ou já em degradê).
- Escudos em `assets/escudos/` (sem escudo, aparece a sigla do clube).
- Planilhas e fichas em `assets/docs/` (abrem com zoom ao clicar).
- Vídeos: informe só o ID do YouTube; a miniatura é carregada automaticamente.

Sem foto, a página mostra um espaço reservado com a indicação do que falta.

Nas páginas `tactical`, cada estrutura (`"4-3-3"`, `"3-2-5"`…) desenha o campo automaticamente, com o goleiro e o ataque para cima.

## Estrutura

- `index.html`: barra superior, palco do deck, controles e janelas (áreas, vídeo, documento).
- `styles.css`: visual (Titillium Web, papel claro, painéis escuros, detalhe laranja).
- `app.js`: modelos de página, navegação (teclado, toque, seletor), escala da página 1600×900 e janelas.
- `data.js`: conteúdo do cliente.
- `assets/fonts/`: Titillium Web (licença OFL, em `OFL.txt`).

## Pendências

- Conteúdo real do cliente (textos, fotos, escudos, vídeos e documentos).
- Seleção de idiomas (a referência tem PT, EN e IT) ainda não foi implementada.
- A página tem `noindex`; remova-o de `index.html` se o portfólio for para busca pública.
