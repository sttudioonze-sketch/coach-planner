(() => {
  "use strict";

  const data = window.PORTFOLIO;
  const person = data.person;
  const pages = data.pages;
  const fullName = `${person.firstName} ${person.lastName}`;
  const W = 1600;
  const H = 900;

  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const lines = (value) => esc(value).replace(/\n/g, "<br>");
  const pad = (n) => String(n).padStart(2, "0");
  const initials = (name) => String(name).split(/\s+/).filter((w) => w.length > 2 || /^[A-Z]/.test(w)).slice(0, 3).map((w) => w[0]).join("").toUpperCase();

  /* ---------- Small visual helpers ---------- */

  const FLAGS = {
    br: '<rect width="24" height="24" fill="#1f9d55"/><path d="M12 4.5 21 12l-9 7.5L3 12z" fill="#f7d117"/><circle cx="12" cy="12" r="4.2" fill="#1d3f8f"/><path d="M8 11.4c2.6-.6 5.4-.3 8 1" stroke="#fff" stroke-width=".8" fill="none"/>',
    us: '<rect width="24" height="24" fill="#fff"/><g fill="#c8102e"><rect y="0" width="24" height="2.4"/><rect y="4.8" width="24" height="2.4"/><rect y="9.6" width="24" height="2.4"/><rect y="14.4" width="24" height="2.4"/><rect y="19.2" width="24" height="2.4"/></g><rect width="12" height="12" fill="#1f3a7a"/>',
    es: '<rect width="24" height="24" fill="#c60b1e"/><rect y="6" width="24" height="12" fill="#ffc400"/>',
    it: '<rect width="8" height="24" fill="#009246"/><rect x="8" width="8" height="24" fill="#fff"/><rect x="16" width="8" height="24" fill="#ce2b37"/>',
    pt: '<rect width="10" height="24" fill="#046a38"/><rect x="10" width="14" height="24" fill="#da291c"/><circle cx="10" cy="12" r="3.4" fill="#ffe900"/>',
    ar: '<rect width="24" height="24" fill="#74acdf"/><rect y="8" width="24" height="8" fill="#fff"/><circle cx="12" cy="12" r="2" fill="#f6b40e"/>',
    fr: '<rect width="8" height="24" fill="#002395"/><rect x="8" width="8" height="24" fill="#fff"/><rect x="16" width="8" height="24" fill="#ed2939"/>',
    de: '<rect width="24" height="8" fill="#111"/><rect y="8" width="24" height="8" fill="#dd0000"/><rect y="16" width="24" height="8" fill="#ffce00"/>',
    gb: '<rect width="24" height="24" fill="#012169"/><path d="M0 0l24 24M24 0 0 24" stroke="#fff" stroke-width="4"/><path d="M12 0v24M0 12h24" stroke="#fff" stroke-width="6"/><path d="M12 0v24M0 12h24" stroke="#c8102e" stroke-width="3"/>'
  };
  let flagId = 0;
  const flag = (code, label = "") => {
    const body = FLAGS[code] || '<rect width="24" height="24" fill="#999"/>';
    const id = `fc${flagId++}`;
    return `<svg class="flag" viewBox="0 0 24 24" role="img" aria-label="${esc(label || code)}"><clipPath id="${id}"><circle cx="12" cy="12" r="11"/></clipPath><g clip-path="url(#${id})">${body}</g><circle cx="12" cy="12" r="11" fill="none" stroke="rgba(0,0,0,.18)"/></svg>`;
  };

  const silhouette = '<svg class="silhouette" viewBox="0 0 200 240" aria-hidden="true"><circle cx="100" cy="78" r="42"/><path d="M20 240c4-62 38-98 80-98s76 36 80 98z"/></svg>';
  const photo = (src, label, cls = "") => src
    ? `<img class="photo ${cls}" src="${esc(src)}" alt="${esc(label)}">`
    : `<div class="photo placeholder ${cls}" role="img" aria-label="Espaço para foto: ${esc(label)}">${silhouette}<span>Foto · ${esc(label)}</span></div>`;

  const badge = (src, name) => src
    ? `<img class="badge" src="${esc(src)}" alt="Escudo ${esc(name)}">`
    : `<span class="badge badge-empty" aria-hidden="true">${esc(initials(name))}</span>`;

  const trophy = (medal = "gold") => `<svg class="trophy ${medal}" viewBox="0 0 64 64" aria-hidden="true"><path d="M18 8h28v14c0 9-6 16-14 16s-14-7-14-16z"/><path d="M18 12H9c0 9 4 14 11 15M46 12h9c0 9-4 14-11 15" fill="none" stroke-width="3"/><rect x="29" y="38" width="6" height="9"/><rect x="21" y="47" width="22" height="6" rx="1"/><rect x="17" y="53" width="30" height="5" rx="1"/></svg>`;

  const ICONS = {
    whatsapp: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.8z"/><path d="M9.3 8.8c.2-.5.6-.5.9-.5l.6 1.4c.1.3-.2.6-.5 1 .5 1.1 1.4 2 2.5 2.5.4-.3.7-.6 1-.5l1.4.6c0 .3 0 .7-.5.9-.6.4-1.4.5-2.3.1a7 7 0 0 1-3.3-3.3c-.3-.8-.2-1.6.2-2.2z"/>',
    instagram: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.6" cy="7.4" r=".6"/>',
    email: '<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="m4 7 8 6 8-6"/>',
    phone: '<path d="M6 4h3l1.5 4-2 1.2a10 10 0 0 0 6.3 6.3l1.2-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 6.2 2 2 0 0 1 6 4z"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
  };
  const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.link}</svg>`;

  const monogram = () => `<span class="monogram" aria-hidden="true">${esc((person.firstName[0] || "") + (person.lastName[0] || ""))}</span>`;
  const identity = () => `${monogram()}<i class="divider" aria-hidden="true"></i><div><strong>${esc(fullName)}</strong><span>${esc(person.role)}</span></div>`;

  /* ---------- Pitch ---------- */

  const pitchLines = `
    <rect x="1" y="1" width="66" height="103" class="pl"/>
    <line x1="1" y1="52.5" x2="67" y2="52.5" class="pl"/>
    <circle cx="34" cy="52.5" r="9.15" class="pl"/><circle cx="34" cy="52.5" r=".6" class="pd"/>
    <rect x="13.85" y="1" width="40.3" height="16.5" class="pl"/><rect x="24.85" y="1" width="18.3" height="5.5" class="pl"/>
    <rect x="13.85" y="87.5" width="40.3" height="16.5" class="pl"/><rect x="24.85" y="98.5" width="18.3" height="5.5" class="pl"/>
    <circle cx="34" cy="12" r=".6" class="pd"/><circle cx="34" cy="93" r=".6" class="pd"/>
    <path d="M26.7 17.5a9.15 9.15 0 0 0 14.6 0M26.7 87.5a9.15 9.15 0 0 1 14.6 0" class="pl"/>`;

  const pitchStripes = Array.from({ length: 10 }, (_, i) => `<rect x="0" y="${i * 10.5}" width="68" height="10.5" fill="${i % 2 ? "#3f8a3a" : "#468f40"}"/>`).join("");

  // Converte "4-3-3" em posições (ataque para cima), com goleiro.
  function formationPositions(formation) {
    const rows = String(formation).split(/[-.]/).map(Number).filter((n) => n > 0);
    const spots = [{ x: 34, y: 96, n: 1 }];
    const top = 26;
    const bottom = 80;
    let number = 2;
    rows.forEach((count, r) => {
      const y = rows.length === 1 ? 55 : bottom - (r * (bottom - top)) / (rows.length - 1);
      for (let i = 0; i < count; i++) {
        const spread = count === 1 ? 0 : Math.min(54, 14 + count * 10);
        const x = count === 1 ? 34 : 34 - spread / 2 + (spread * i) / (count - 1);
        spots.push({ x, y, n: number++ });
      }
    });
    return spots;
  }

  function pitch(formation, { mini = false } = {}) {
    const players = formation ? formationPositions(formation).map((p) => `<g class="player" style="transform:translate(${p.x}px,${p.y}px)"><circle r="2.6"/><text y=".95">${p.n}</text></g>`).join("") : "";
    return `<svg class="pitch ${mini ? "mini" : ""}" viewBox="0 0 68 105" role="img" aria-label="${formation ? `Campo com a estrutura ${esc(formation)}` : "Campo"}">${pitchStripes}${pitchLines}${players}</svg>`;
  }

  /* ---------- Page templates ---------- */

  const head = (p) => `<header class="page-head"><span>${esc(p.section)}</span><h1>${esc(p.title)}</h1></header>`;
  const licenseBlock = () => person.license ? `<div class="license">${person.license.badge ? `<img src="${esc(person.license.badge)}" alt="">` : `<span class="license-seal" aria-hidden="true">${esc(person.license.title.split(" ").pop())}</span>`}<div><strong>${esc(person.license.title)}</strong><span>${esc(person.license.org)}</span></div></div>` : "";
  const coverName = () => `
    <p class="cover-kicker">Portfólio <b>profissional</b></p>
    <h1 class="cover-name"><span>${esc(person.firstName)}</span><strong>${esc(person.lastName)}</strong></h1>
    <p class="cover-role">${esc(person.role)}</p>
    ${licenseBlock()}`;

  const T = {
    cover: (p) => `
      <div class="cover-card">${coverName()}<div class="cover-brand">${monogram()}<span>Portfólio<b>profissional</b></span></div></div>
      ${photo(p.photo, "capa (retrato recortado)", "cover-photo")}`,

    contacts: (p) => `
      <div class="cover-card">${coverName()}
        <section class="contact-card">
          <h2>Contatos</h2>
          ${data.contacts.map((c) => `<a class="contact-row" href="${esc(c.href)}" target="_blank" rel="noopener">${icon(c.type)}<span><small>${esc(c.label)}</small><b>${esc(c.value)}</b></span></a>`).join("")}
        </section>
      </div>
      ${photo(p.photo, "contatos (retrato recortado)", "cover-photo")}`,

    profile: (p) => `
      ${head(p)}
      <div class="profile-body">
        <h2>Dados pessoais</h2>
        <dl class="facts">${p.facts.map(([k, v]) => `<div><dt>${esc(k)}:</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
        <h2>Função <span>principal</span></h2>
        <p class="indent">${esc(p.mainRole)}</p>
        <h2>Idiomas</h2>
        <ul class="languages">${p.languages.map((l) => `<li>${flag(l.flag, l.name)}${esc(l.name)} <small>[ ${esc(l.level)} ]</small></li>`).join("")}</ul>
      </div>
      ${photo(p.photo, "perfil", "side-photo dark-photo")}`,

    qualification: (p) => `
      ${head(p)}
      <div class="columns">
        ${p.columns.map((col) => `
          <section class="panel">
            <h2 class="panel-title">${esc(col.title)}</h2>
            <div class="panel-body">
              ${col.items.map((it) => `
                <article class="q-row">
                  ${it.mark ? `<span class="q-mark" aria-hidden="true">${esc(it.mark)}</span>` : ""}
                  <div><span class="season-label">Temporada</span><strong class="season">${esc(it.year)}</strong>
                  <h3>${esc(it.title)} <span>${it.mark ? "| " : ""}${it.mark ? esc(it.sub) : ""}</span></h3>${it.mark ? "" : `<p>${esc(it.sub)}</p>`}</div>
                </article>`).join("")}
            </div>
          </section>`).join("")}
      </div>`,

    career: (p) => `
      ${head(p)}
      <div class="career">
        ${p.items.map((it) => `
          <article class="career-row">
            ${badge(it.badge, it.club)}
            <div class="career-season"><span class="season-label">Temporada</span><strong class="season">${esc(it.season)}</strong></div>
            <div class="career-info"><h3>${esc(it.club)}</h3><p>${esc(it.role)}</p><p class="place">${esc(it.place)} ${flag(it.flag)}</p></div>
          </article>`).join("")}
      </div>
      ${photo(p.photo, p.title.toLowerCase(), "side-photo fade-photo")}`,

    divider: (p) => `
      ${photo(p.photo, `abertura · ${p.title.toLowerCase()}`, "divider-photo")}
      <div class="divider-shade"></div>
      <svg class="divider-arc" viewBox="0 0 400 400" aria-hidden="true"><circle cx="200" cy="200" r="190"/></svg>
      <header class="page-head divider-head"><span>${esc(p.section)}</span><h1>${esc(p.title)}</h1></header>`,

    trophies: (p) => `
      ${head(p)}
      <div class="trophies">
        ${p.items.map((it) => `<article class="trophy-row">${trophy(it.medal)}<div><span class="season-label">Temporada</span><strong class="season">${esc(it.season)}</strong><h3>${esc(it.title)}</h3><p>${esc(it.detail)}</p></div></article>`).join("")}
      </div>
      ${photo(p.photo, "troféu ou comemoração", "side-photo fade-photo")}`,

    people: (p) => `
      ${head(p)}
      <div class="people">
        ${p.items.map((it) => `<figure>${photo(it.photo, it.name, "person-photo")}<figcaption><b>${esc(it.name)}</b><span>${esc(it.detail)}</span></figcaption></figure>`).join("")}
      </div>`,

    philosophy: (p) => `
      ${head(p)}
      <div class="philosophy">
        <p class="quote">“${esc(p.quote)}”</p>
        <div class="ph-grid">
          <section class="panel small"><h2 class="panel-title">Missão</h2><p>${esc(p.mission)}</p></section>
          <section class="panel small"><h2 class="panel-title">Visão</h2><p>${esc(p.vision)}</p></section>
          <section class="panel small values"><h2 class="panel-title">Valores</h2><ul>${p.values.map((v) => `<li>${esc(v)}</li>`).join("")}</ul></section>
        </div>
      </div>
      ${photo(p.photo, "filosofia", "side-photo mono-photo")}`,

    overview: (p) => `
      ${head(p)}
      <div class="overview">
        <section class="panel idea">
          <h2 class="panel-title left">${esc(p.idea.label)}</h2>
          <div class="idea-body"><span class="kicker">${esc(p.idea.kicker)}</span><h3>${lines(p.idea.title)}</h3><p>${esc(p.idea.text)}</p></div>
        </section>
        <div class="rules">${p.rules.map((r) => `<div class="rule"><span>${esc(r.when)}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg><b>${esc(r.action)}</b></div>`).join("")}</div>
      </div>
      <h4 class="label-line">Fases do jogo <small>A mesma leitura em todas as fases</small></h4>
      <div class="phases">${p.phases.map((ph) => `<span>${esc(ph)}</span>`).join("")}</div>
      <h4 class="label-line">Linguagem do modelo</h4>
      <div class="chips">${p.language.map((l) => `<span>${esc(l)}</span>`).join("")}</div>`,

    tactical: (p) => {
      const tabs = p.tabs.map((t, i) => `<button type="button" class="tab" data-tab="${i}" aria-pressed="${i === 0}">${esc(t.label)}</button>`).join("");
      const panes = p.tabs.map((t, i) => `
        <div class="tab-pane" data-pane="${i}" ${i ? "hidden" : ""}>
          <section class="panel principle"><h2 class="panel-title left">Princípio geral</h2><p>${esc(t.principle)}</p></section>
          ${t.options ? `
            <h4 class="list-title">${esc(t.listTitle || "")}<small>Selecione para mudar o campo</small></h4>
            <div class="options">${t.options.map((o, j) => `
              <button type="button" class="option" data-option="${j}" aria-pressed="${j === 0}">
                <span>${esc(o.label)}</span>
                <span class="option-tags">${(o.tags || o.formations).map((f, k) => `${k ? "<i>+</i>" : ""}<b>${esc(f)}</b>`).join("")}</span>
              </button>`).join("")}</div>` : ""}
          ${t.bullets ? `<ul class="arrows">${t.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
        </div>`).join("");
      const first = p.tabs.find((t) => t.options)?.options[0];
      return `
        ${head(p)}
        <div class="tactical-body"><div class="tabs">${tabs}</div>${panes}
          ${p.videos ? `<button type="button" class="cta" data-goto="${esc(p.videos)}"><span class="play" aria-hidden="true"></span>Ver os vídeos deste momento <span aria-hidden="true">→</span></button>` : ""}
        </div>
        <figure class="pitch-wrap">
          <figcaption><span class="pitch-label">${esc(first?.label || "")}</span><b class="pitch-formation">${esc(first?.formations[0] || "")}</b></figcaption>
          <div class="pitch-slot">${pitch(first?.formations[0])}</div>
          <small>Posições de referência · ataque para cima</small>
        </figure>`;
    },

    videos: (p) => `
      ${head(p)}
      <p class="videos-intro">${esc(p.intro)}</p>
      <div class="videos count-${Math.min(p.items.length, 3)}">
        ${p.items.map((v, i) => {
          const thumb = v.thumb || (v.youtube ? `https://i.ytimg.com/vi/${encodeURIComponent(v.youtube)}/hqdefault.jpg` : "");
          return `<button type="button" class="video-card" data-video="${i}">
            <span class="thumb">${thumb ? `<img src="${esc(thumb)}" alt="" loading="lazy">` : `<span class="thumb-empty">Vídeo a definir</span>`}<span class="play big" aria-hidden="true"></span></span>
            <span class="video-meta"><b>${esc(v.title)}</b><span class="mini-cta">▸ Assistir vídeo</span></span>
          </button>`;
        }).join("")}
      </div>`,

    setpiece: (p) => `
      ${head(p)}
      <div class="setpiece-body">
        <section class="panel principle"><h2 class="panel-title left">Princípio geral</h2><p>${esc(p.principle)}</p></section>
        ${p.groups.map((g) => `<h4 class="list-title">Bola parada ${esc(g.title.toLowerCase())}</h4><ul class="arrows">${g.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul>`).join("")}
      </div>
      <div class="diagrams">${p.diagrams.map((d) => `<figure><figcaption>${esc(d.label)}</figcaption>${d.image ? `<img src="${esc(d.image)}" alt="${esc(d.label)}">` : pitch("", { mini: true })}</figure>`).join("")}</div>`,

    document: (p) => {
      const sheet = p.image
        ? `<button type="button" class="sheet" data-doc="${esc(p.image)}" data-doc-title="${esc(p.title)}"><img src="${esc(p.image)}" alt="${esc(p.title)}"></button>`
        : `<div class="sheet sheet-empty" role="img" aria-label="Espaço para o documento"><span>Documento · ${esc(p.title)}</span>${'<i></i>'.repeat(9)}</div>`;
      const zoom = p.image ? `<button type="button" class="zoom-btn" data-doc="${esc(p.image)}" data-doc-title="${esc(p.title)}">⤢ Ampliar documento</button>` : "";
      return p.side
        ? `${head(p)}<div class="doc-side"><div><h4 class="list-title">${esc(p.listTitle || "")}</h4><p>${esc(p.text)}</p>${p.bullets ? `<ul class="arrows">${p.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}${zoom}</div>${sheet}</div>`
        : `${head(p)}<p class="doc-text">${esc(p.text)}</p><div class="doc-center">${sheet}${zoom}</div>`;
    }
  };

  const chromeless = new Set(["cover", "contacts"]);

  function pageHTML(p, index) {
    const body = (T[p.kind] || (() => `<p>Tipo de página desconhecido: ${esc(p.kind)}</p>`))(p);
    const strip = chromeless.has(p.kind) ? "" : `
      <aside class="strip" aria-hidden="true">${flag(person.flag)}<span class="strip-text"><b>${esc(fullName)}</b> ${esc(person.role)} <i></i> Portfólio profissional | ${esc(person.year)}</span></aside>`;
    const num = chromeless.has(p.kind) ? "" : `<div class="page-num"><b>${pad(index + 1)}</b> / ${pages.length}</div>`;
    const mark = chromeless.has(p.kind) ? "" : `<div class="page-mark" aria-hidden="true">${monogram()}</div>`;
    return `<article class="page kind-${esc(p.kind)}" data-key="${esc(p.key)}">${strip}${body}${num}${mark}</article>`;
  }

  /* ---------- Deck navigation ---------- */

  const stage = $("#stage");
  const frame = $("#frame");
  const select = $("#page-select");
  const count = $("#count");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let current = -1;

  const titleOf = (p) => (p.kind === "cover" ? fullName : p.kind === "contacts" ? "Contatos" : p.title);
  select.innerHTML = pages.map((p, i) => `<option value="${i}">${pad(i + 1)} · ${esc(titleOf(p))}</option>`).join("");
  document.querySelectorAll(".identity").forEach((el) => { el.innerHTML = identity(); });
  document.title = `${fullName} | ${person.role}`;

  function go(index, { focus = false } = {}) {
    const next = Math.max(0, Math.min(pages.length - 1, index));
    if (next === current) return;
    current = next;
    stage.innerHTML = pageHTML(pages[current], current);
    const page = stage.firstElementChild;
    if (!reduceMotion.matches) page.classList.add("enter");
    select.value = String(current);
    count.textContent = `${current + 1} / ${pages.length}`;
    $("#prev").disabled = current === 0;
    $("#next").disabled = current === pages.length - 1;
    history.replaceState(null, "", `#${pages[current].key}`);
    if (focus) stage.focus?.();
  }

  const indexOfKey = (key) => pages.findIndex((p) => p.key === key);

  $("#prev").addEventListener("click", () => go(current - 1));
  $("#next").addEventListener("click", () => go(current + 1));
  select.addEventListener("change", () => go(Number(select.value)));

  document.addEventListener("keydown", (e) => {
    if (document.querySelector("dialog[open]") || /^(SELECT|INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); go(current + 1); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(current - 1); }
    if (e.key === "Home") go(0);
    if (e.key === "End") go(pages.length - 1);
  });

  // Deslizar no celular
  let touchStart = null;
  frame.addEventListener("touchstart", (e) => { if (e.touches.length === 1) touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
  frame.addEventListener("touchend", (e) => {
    if (!touchStart || window.visualViewport?.scale > 1.05) { touchStart = null; return; }
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(current + (dx < 0 ? 1 : -1));
    touchStart = null;
  });

  // Escala da página fixa (1600×900) para caber na tela
  function fit() {
    const toolbar = $(".toolbar").offsetHeight;
    const controls = $(".controls").offsetHeight + $(".help").offsetHeight;
    const side = window.innerWidth < 700 ? 12 : 24;
    const availW = window.innerWidth - side * 2;
    const availH = Math.max(240, window.innerHeight - toolbar - controls - 36);
    const width = Math.min(availW, (availH * W) / H);
    frame.style.width = `${width}px`;
    frame.style.height = `${(width * H) / W}px`;
    stage.style.transform = `scale(${width / W})`;
  }
  window.addEventListener("resize", fit);

  /* ---------- Interactions inside pages ---------- */

  stage.addEventListener("click", (e) => {
    const page = pages[current];
    const art = stage.firstElementChild;

    const goto = e.target.closest("[data-goto]");
    if (goto) { const i = indexOfKey(goto.dataset.goto); if (i >= 0) go(i); return; }

    const tab = e.target.closest("[data-tab]");
    if (tab) {
      const i = Number(tab.dataset.tab);
      art.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-pressed", String(b === tab)));
      art.querySelectorAll("[data-pane]").forEach((pane) => { pane.hidden = Number(pane.dataset.pane) !== i; });
      return;
    }

    const opt = e.target.closest("[data-option]");
    if (opt) {
      const pane = opt.closest("[data-pane]");
      const o = page.tabs[Number(pane.dataset.pane)].options[Number(opt.dataset.option)];
      pane.querySelectorAll("[data-option]").forEach((b) => b.setAttribute("aria-pressed", String(b === opt)));
      art.querySelector(".pitch-label").textContent = o.label;
      art.querySelector(".pitch-formation").textContent = o.formations[0];
      art.querySelector(".pitch-slot").innerHTML = pitch(o.formations[0]);
      return;
    }

    const vid = e.target.closest("[data-video]");
    if (vid) { openVideo(page.items[Number(vid.dataset.video)]); return; }

    const doc = e.target.closest("[data-doc]");
    if (doc) openDoc(doc.dataset.doc, doc.dataset.docTitle);
  });

  /* ---------- Dialogs ---------- */

  document.querySelectorAll("dialog").forEach((d) => {
    d.addEventListener("click", (e) => { if (e.target === d || e.target.closest("[data-close]")) d.close(); });
  });

  const areasDialog = $("#areas-dialog");
  $("#areas-grid").innerHTML = data.areas.map((a) => `<button type="button" data-area="${esc(a.page)}">${esc(a.label)}</button>`).join("");
  $("#open-areas").addEventListener("click", () => areasDialog.showModal());
  $("#areas-grid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-area]");
    if (!b) return;
    const i = indexOfKey(b.dataset.area);
    areasDialog.close();
    if (i >= 0) go(i);
  });

  const videoDialog = $("#video-dialog");
  const player = $("#video-player");
  function openVideo(v) {
    $("#video-title").textContent = v.title;
    player.innerHTML = v.youtube
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtube)}?autoplay=1&rel=0" title="${esc(v.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
      : `<p class="video-empty">Este vídeo ainda não foi definido. Informe o ID do YouTube em <code>data.js</code>.</p>`;
    videoDialog.showModal();
  }
  videoDialog.addEventListener("close", () => { player.innerHTML = ""; });

  const docDialog = $("#doc-dialog");
  const docImg = $("#doc-image");
  const docView = $("#doc-viewport");
  let docScale = 1;
  const setDocScale = (s) => {
    docScale = Math.max(0.25, Math.min(4, s));
    docImg.style.width = `${docImg.naturalWidth * docScale}px`;
    $("#doc-scale").textContent = `${Math.round(docScale * 100)}%`;
  };
  const fitDoc = () => { if (docImg.naturalWidth) setDocScale((docView.clientWidth - 32) / docImg.naturalWidth); };
  function openDoc(src, title) {
    $("#doc-title").textContent = title || "Documento";
    docImg.alt = title || "";
    docImg.onload = fitDoc;
    docImg.src = src;
    docDialog.showModal();
    if (docImg.complete) fitDoc();
    docView.focus();
  }
  $("#doc-in").addEventListener("click", () => setDocScale(docScale * 1.25));
  $("#doc-out").addEventListener("click", () => setDocScale(docScale / 1.25));
  $("#doc-fit").addEventListener("click", fitDoc);

  $("#fullscreen").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  });
  document.addEventListener("fullscreenchange", () => {
    $("#fullscreen").textContent = document.fullscreenElement ? "Sair da tela cheia" : "Tela cheia";
    fit();
  });
  if (!document.documentElement.requestFullscreen) $("#fullscreen").hidden = true;

  /* ---------- Start ---------- */

  fit();
  const start = indexOfKey(decodeURIComponent(location.hash.slice(1)));
  go(start >= 0 ? start : 0);
  window.addEventListener("hashchange", () => {
    const i = indexOfKey(decodeURIComponent(location.hash.slice(1)));
    if (i >= 0) go(i);
  });
})();
