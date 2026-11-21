/*
  CONTEÚDO DO PORTFÓLIO
  ---------------------
  Tudo o que muda de um cliente para outro fica neste arquivo.
  - Textos: troque os valores entre aspas.
  - Fotos: coloque o arquivo em assets/fotos/ e informe o caminho
    (ex.: "assets/fotos/capa.jpg"). Sem foto, aparece um espaço reservado.
  - Escudos: "badge": "assets/escudos/clube.png". Sem escudo, aparece a sigla.
  - Vídeos: informe o ID do YouTube (o trecho depois de "v=" no link).
  - Para remover uma página, apague o bloco dela em "pages".
*/
window.PORTFOLIO = {
  person: {
    firstName: "Nome",
    lastName: "Sobrenome",
    role: "Técnico de Futebol",
    year: 2026,
    flag: "br",
    license: { title: "Licença A", org: "CBF Academy", badge: "" }
  },

  contacts: [
    { type: "whatsapp", label: "WhatsApp", value: "+55 (00) 00000-0000", href: "https://wa.me/5500000000000" },
    { type: "instagram", label: "Instagram", value: "@usuario", href: "https://instagram.com/usuario" },
    { type: "email", label: "E-mail", value: "contato@exemplo.com", href: "mailto:contato@exemplo.com" }
  ],

  // Atalhos do menu "Áreas" (cada um abre a página indicada pela chave).
  areas: [
    { label: "Perfil e formação", page: "perfil" },
    { label: "Carreira e conquistas", page: "carreira" },
    { label: "Filosofia de trabalho", page: "filosofia" },
    { label: "Modelo de jogo", page: "modelo" },
    { label: "Metodologia de treinamento", page: "metodologia" },
    { label: "Vídeos", page: "videos-ofensiva" },
    { label: "Contatos", page: "contatos" }
  ],

  pages: [
    { key: "capa", kind: "cover", photo: "" },

    {
      key: "perfil", kind: "profile", section: "Informações", title: "Gerais", photo: "",
      facts: [
        ["Nome", "Nome Completo do Treinador"],
        ["Data de nascimento", "00/00/0000"],
        ["Estado civil", "—"],
        ["Nacionalidade", "Brasileiro"]
      ],
      mainRole: "Treinador de Futebol",
      languages: [
        { name: "Português", level: "Nativo", flag: "br" },
        { name: "Inglês", level: "Intermediário", flag: "us" },
        { name: "Espanhol", level: "Básico", flag: "es" }
      ]
    },

    {
      key: "qualificacao", kind: "qualification", section: "Qualificação", title: "Profissional",
      columns: [
        {
          title: "Licenças como treinador",
          items: [
            { year: "2025", title: "Licença A", sub: "CBF Academy", mark: "A" },
            { year: "2024", title: "Licença B", sub: "CBF Academy", mark: "B" }
          ]
        },
        {
          title: "Cursos de aperfeiçoamento",
          items: [
            { year: "2025", title: "Nome do curso", sub: "Instituição ou professor" },
            { year: "2024", title: "Nome do curso", sub: "Instituição ou professor" },
            { year: "2023", title: "Nome do curso", sub: "Instituição ou professor" }
          ]
        }
      ]
    },

    {
      key: "estagios", kind: "career", section: "Qualificação profissional", title: "Estágios e observações", photo: "",
      items: [
        { season: "2025", club: "Clube Exemplo A", role: "Estágio | Equipe profissional", place: "Treinador Fulano de Tal", flag: "br" },
        { season: "2025", club: "Clube Exemplo B", role: "Estágio | Equipe sub-20", place: "Treinador Fulano de Tal", flag: "br" },
        { season: "2024", club: "Clube Exemplo C", role: "Observação | Equipe sub-17", place: "Treinador Fulano de Tal", flag: "br" }
      ]
    },

    { key: "carreira", kind: "divider", section: "Experiência como", title: "Treinador", photo: "" },

    {
      key: "carreira-lista", kind: "career", section: "Experiência como", title: "Treinador", photo: "",
      items: [
        { season: "2025", club: "Clube Exemplo FC", role: "Treinador principal | Profissional", place: "Cidade | Brasil", flag: "br" },
        { season: "23/24", club: "Esporte Clube Modelo", role: "Auxiliar técnico | Profissional", place: "Cidade | Brasil", flag: "br" },
        { season: "2022", club: "Associação Atlética Base", role: "Treinador | Sub-20", place: "Cidade | Brasil", flag: "br" },
        { season: "20/21", club: "Clube Atlético Formação", role: "Treinador | Sub-17", place: "Cidade | Brasil", flag: "br" }
      ]
    },

    {
      key: "titulos", kind: "trophies", section: "Experiência como treinador", title: "Títulos e conquistas", photo: "",
      items: [
        { season: "2025", title: "Campeonato Estadual", detail: "Clube Exemplo FC", medal: "gold" },
        { season: "2023", title: "Copa Regional", detail: "Esporte Clube Modelo", medal: "silver" },
        { season: "2021", title: "Campeonato Sub-17", detail: "Clube Atlético Formação", medal: "gold" }
      ]
    },

    {
      key: "referencias", kind: "people", section: "Referências e principais", title: "Treinadores",
      items: [
        { name: "Nome do treinador", detail: "Clube" },
        { name: "Nome do treinador", detail: "Clube" },
        { name: "Nome do treinador", detail: "Clube" },
        { name: "Nome do treinador", detail: "Clube" },
        { name: "Nome do treinador", detail: "Clube" },
        { name: "Nome do treinador", detail: "Clube" },
        { name: "Nome do treinador", detail: "Clube" },
        { name: "Nome do treinador", detail: "Clube" },
        { name: "Nome do treinador", detail: "Clube" },
        { name: "Nome do treinador", detail: "Clube" }
      ]
    },

    { key: "filosofia", kind: "divider", section: "Filosofia de", title: "Trabalho", photo: "" },

    {
      key: "filosofia-detalhe", kind: "philosophy", section: "Filosofia de", title: "Trabalho", photo: "",
      quote: "Frase que resume a filosofia",
      mission: "Descreva a missão do treinador: o que ele busca entregar para atletas, clube e comissão.",
      vision: "Onde o treinador quer chegar na carreira.",
      values: ["Valor 1", "Valor 2", "Valor 3", "Valor 4", "Valor 5"]
    },

    { key: "modelo", kind: "divider", section: "Modelo de", title: "Jogo", photo: "" },

    {
      key: "visao-geral", kind: "overview", section: "Modelo de jogo", title: "Visão geral",
      idea: { label: "Filosofia de jogo", kicker: "Modelo de princípios", title: "Ideia central\ndo modelo", text: "Resumo em duas ou três linhas de como a equipe joga em todas as fases." },
      rules: [
        { when: "Com a bola", action: "Atacar o espaço" },
        { when: "Sem a bola", action: "Proteger o centro" },
        { when: "Após a perda", action: "Pressionar" }
      ],
      phases: ["Organização ofensiva", "Transição ofensiva", "Organização defensiva", "Transição defensiva", "Bola parada"],
      language: ["Amplitude", "Profundidade", "Terceiro homem", "Homem livre", "Fixação", "Bola coberta", "Bola descoberta", "Ritmo"]
    },

    {
      key: "ofensiva", kind: "tactical", section: "Com a bola", title: "Organização ofensiva", videos: "videos-ofensiva",
      tabs: [
        {
          label: "Princípio e estruturas",
          principle: "Escreva aqui o princípio geral da fase ofensiva: como a equipe sai jogando, onde busca superioridade e como chega ao último terço.",
          listTitle: "Estruturas por altura de construção",
          options: [
            { label: "Construção alta", formations: ["3-2-5"] },
            { label: "Construção média", formations: ["2-3-5"] },
            { label: "Primeira fase", formations: ["4-3-3"] }
          ]
        },
        {
          label: "Subprincípios",
          principle: "Liste os subprincípios que sustentam o princípio geral.",
          bullets: ["Subprincípio 1", "Subprincípio 2", "Subprincípio 3", "Subprincípio 4"]
        }
      ]
    },

    {
      key: "videos-ofensiva", kind: "videos", section: "Com a bola · vídeos", title: "Organização ofensiva",
      intro: "Organização ofensiva em vídeo.",
      items: [
        { title: "Organização ofensiva · Vídeo 1", youtube: "" },
        { title: "Organização ofensiva · Vídeo 2", youtube: "" },
        { title: "Organização ofensiva · Vídeo 3", youtube: "" }
      ]
    },

    {
      key: "transicao-defensiva", kind: "tactical", section: "Perdeu a bola", title: "Transição defensiva",
      tabs: [
        {
          label: "Princípio e reações",
          principle: "Descreva o que a equipe faz nos primeiros segundos após perder a bola.",
          listTitle: "Reações após a perda",
          options: [
            { label: "Próximos à bola", tags: ["Pressionar"], formations: ["4-2-3-1"] },
            { label: "Linha defensiva organizada", tags: ["Manter linha"], formations: ["4-4-2"] },
            { label: "Adversário supera a pressão", tags: ["Temporizar"], formations: ["4-5-1"] }
          ]
        }
      ]
    },

    {
      key: "defensiva", kind: "tactical", section: "Sem a bola", title: "Organização defensiva",
      tabs: [
        {
          label: "Princípio e blocos",
          principle: "Descreva como a equipe defende nas diferentes alturas do campo.",
          listTitle: "Blocos defensivos",
          options: [
            { label: "Bloco alto", formations: ["4-4-2"] },
            { label: "Bloco médio", formations: ["4-1-4-1"] },
            { label: "Bloco baixo", formations: ["5-4-1"] }
          ]
        }
      ]
    },

    {
      key: "transicao-ofensiva", kind: "tactical", section: "Ganhou a bola", title: "Transição ofensiva",
      tabs: [
        {
          label: "Princípio e decisões",
          principle: "Descreva o que a equipe faz logo após recuperar a bola.",
          listTitle: "Decisões após o ganho",
          options: [
            { label: "Há espaço", tags: ["Atacar"], formations: ["4-2-4"] },
            { label: "Não há espaço", tags: ["Cuidar da bola"], formations: ["4-3-3"] }
          ]
        }
      ]
    },

    {
      key: "bola-parada", kind: "setpiece", section: "Modelo de jogo", title: "Bola parada",
      principle: "Princípio geral das bolas paradas ofensivas e defensivas.",
      groups: [
        { title: "Ofensiva", items: ["Ponto de atenção 1", "Ponto de atenção 2", "Ponto de atenção 3"] },
        { title: "Defensiva", items: ["Ponto de atenção 1", "Ponto de atenção 2"] }
      ],
      diagrams: [
        { label: "Escanteio", image: "" },
        { label: "Falta lateral", image: "" }
      ]
    },

    {
      key: "gols", kind: "videos", section: "Vídeos · destaques", title: "Gols",
      intro: "Gols em vídeo.",
      items: [{ title: "Gols", youtube: "" }]
    },

    { key: "metodologia", kind: "divider", section: "Metodologia de", title: "Treinamento", photo: "" },

    {
      key: "semana-padrao", kind: "document", section: "Metodologia de treinamento", title: "Semana padrão",
      text: "Exemplo de planejamento semanal com um jogo por semana. Envie a imagem da planilha para ela aparecer aqui.",
      image: ""
    },

    {
      key: "dia-treino", kind: "document", section: "Metodologia de treinamento", title: "Dia de treinamento",
      listTitle: "Planejamento e operacionalização das sessões",
      text: "Todas as sessões são planejadas com antecedência, considerando:",
      bullets: ["Objetivos gerais", "Objetivos específicos", "Material necessário", "Estrutura necessária", "Exercícios e tempos", "Observações e controles"],
      image: "", side: true
    },

    { key: "contatos", kind: "contacts", photo: "" }
  ]
};
