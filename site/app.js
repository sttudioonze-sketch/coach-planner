'use strict';

const groups = {
  treino: [
    {id:5,title:'Plano de treino',detail:'Campo inteiro'},
    {id:4,title:'Sessão de treino',detail:'Organização das atividades'},
    {id:10,title:'Plano de treino',detail:'Dois campos e anotações'},
    {id:22,title:'Plano de treino',detail:'Três momentos da sessão'},
    {id:16,title:'Campos de treino',detail:'Mais espaço para suas ideias'},
    {id:28,title:'Sequência de treino',detail:'Organização por etapas'}
  ],
  jogo: [
    {id:60,title:'Organização de jogo',detail:'Informações da partida'},
    {id:41,title:'Controle de cartões',detail:'Acompanhamento da equipe'},
    {id:94,title:'Análise de desempenho',detail:'Observação da equipe'},
    {id:34,title:'Campo de jogo',detail:'Organização em campo'}
  ],
  gestao: [
    {id:54,title:'Reunião',detail:'Pauta e registro de ideias'},
    {id:48,title:'Tarefas',detail:'Organização da comissão'},
    {id:41,title:'Controle de cartões',detail:'Informações do elenco'},
    {id:60,title:'Ficha de jogo',detail:'Informações da partida'}
  ],
  planejamento: [
    {id:74,title:'Microciclo',detail:'Planejamento da semana'},
    {id:80,title:'Mesociclo',detail:'Organização do período'},
    {id:86,title:'Macrociclo',detail:'Visão da temporada'},
    {id:5,title:'Plano de treino',detail:'Do planejamento ao campo'}
  ]
};
const gallery = document.querySelector('#document-gallery');
const panel = document.querySelector('#document-panel');
const collection = document.querySelector('#documentos');
const tabs = [...document.querySelectorAll('[data-category]')];
const autoplayToggle = document.querySelector('#carousel-toggle');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeCategory = 'treino';
let userPaused = false;
let inView = false;
let pointerInside = false;
let focusInside = false;
let loopWidth = 0;
let animationFrame = 0;
let lastTimestamp = 0;
let autoPosition = 0;

function renderCategory(category) {
  activeCategory = category;
  cancelAnimationFrame(animationFrame);
  const fragment = document.createDocumentFragment();
  groups[category].forEach(doc => {
    const figure = document.createElement('figure');
    figure.className = 'document-card';
    const sheet = document.createElement('div');
    sheet.className = 'doc-sheet';
    sheet.style.setProperty('--paper', `url("assets/docs/${doc.id}.webp")`);
    sheet.setAttribute('role', 'img');
    sheet.setAttribute('aria-label', `Amostra do documento ${doc.title}`);
    const caption = document.createElement('figcaption');
    caption.textContent = doc.title;
    const detail = document.createElement('span');
    detail.textContent = doc.detail;
    caption.append(detail);
    figure.append(sheet, caption);
    fragment.append(figure);
  });
  // One visual copy allows a seamless loop. It stays outside the accessibility tree.
  if (!reduceMotion.matches) {
    [...fragment.children].forEach(figure => {
      const copy = figure.cloneNode(true);
      copy.classList.add('carousel-copy');
      copy.setAttribute('aria-hidden', 'true');
      copy.setAttribute('inert', '');
      fragment.append(copy);
    });
  }
  gallery.replaceChildren(fragment);
  gallery.scrollLeft = 0;
  panel.setAttribute('aria-labelledby', `tab-${category}`);
  requestAnimationFrame(() => { updateLoopMetrics(); syncAutoplay(); });
}
function updateLoopMetrics() {
  const first = gallery.querySelector('.document-card');
  const copy = gallery.querySelector('.carousel-copy');
  loopWidth = first && copy ? copy.offsetLeft - first.offsetLeft : 0;
  gallery.classList.toggle('has-loop', loopWidth > 0);
  updateGalleryControls();
}
function updateGalleryControls() {
  const manualOnly = reduceMotion.matches || !loopWidth;
  document.querySelector('#previous-doc').disabled = manualOnly && gallery.scrollLeft <= 2;
  document.querySelector('#next-doc').disabled = manualOnly && gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 2;
}
function canAutoplay() {
  return loopWidth > 0 && inView && !userPaused && !pointerInside && !focusInside && !document.hidden && !reduceMotion.matches;
}
function animateCarousel(timestamp) {
  if (!canAutoplay()) return;
  if (lastTimestamp) {
    // A calm 22 px/s; cap elapsed time to avoid a jump after a suspended frame.
    autoPosition = (autoPosition + Math.min(timestamp - lastTimestamp, 64) * .022) % loopWidth;
    gallery.scrollLeft = autoPosition;
  }
  lastTimestamp = timestamp;
  animationFrame = requestAnimationFrame(animateCarousel);
}
function syncAutoplay() {
  cancelAnimationFrame(animationFrame);
  lastTimestamp = 0;
  const playing = canAutoplay();
  gallery.classList.toggle('is-playing', playing);
  autoplayToggle.hidden = reduceMotion.matches;
  autoplayToggle.setAttribute('aria-pressed', String(userPaused));
  autoplayToggle.setAttribute('aria-label', userPaused ? 'Reproduzir carrossel' : 'Pausar carrossel');
  autoplayToggle.querySelector('span').textContent = userPaused ? 'Reproduzir' : 'Pausar';
  autoplayToggle.querySelector('use').setAttribute('href', userPaused ? '#play' : '#pause');
  if (playing) {
    autoPosition = gallery.scrollLeft % loopWidth;
    gallery.scrollLeft = autoPosition;
    animationFrame = requestAnimationFrame(animateCarousel);
  }
}
function pauseForInteraction() {
  userPaused = true;
  syncAutoplay();
}
function selectTab(tab, focus = false) {
  tabs.forEach(item => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  renderCategory(tab.dataset.category);
  if (focus) tab.focus();
}
tabs.forEach((tab,index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTab(tabs[next],true); }
  });
});
function scrollDocs(direction) {
  pauseForInteraction();
  const first = gallery.querySelector('.document-card');
  const gap = parseFloat(getComputedStyle(gallery).columnGap) || 0;
  const step = first ? first.getBoundingClientRect().width + gap : gallery.clientWidth;
  if (loopWidth) {
    if (direction < 0 && gallery.scrollLeft < step) gallery.scrollLeft += loopWidth;
    else if (direction > 0 && gallery.scrollLeft >= loopWidth) gallery.scrollLeft -= loopWidth;
  }
  gallery.scrollBy({left: direction * step, behavior: reduceMotion.matches ? 'instant' : 'smooth'});
}
document.querySelector('#previous-doc').addEventListener('click', () => scrollDocs(-1));
document.querySelector('#next-doc').addEventListener('click', () => scrollDocs(1));
autoplayToggle.addEventListener('click', () => {
  userPaused = !userPaused;
  syncAutoplay();
});
gallery.addEventListener('pointerdown', pauseForInteraction, {passive:true});
gallery.addEventListener('wheel', pauseForInteraction, {passive:true});
gallery.addEventListener('scroll', updateGalleryControls, {passive:true});
collection.addEventListener('pointerenter', event => {
  if (event.pointerType === 'mouse') { pointerInside = true; syncAutoplay(); }
});
collection.addEventListener('pointerleave', () => { pointerInside = false; syncAutoplay(); });
collection.addEventListener('focusin', event => {
  focusInside = !autoplayToggle.contains(event.target);
  syncAutoplay();
});
collection.addEventListener('focusout', event => {
  focusInside = collection.contains(event.relatedTarget) && !autoplayToggle.contains(event.relatedTarget);
  syncAutoplay();
});
panel.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); scrollDocs(event.key === 'ArrowRight' ? 1 : -1);
  }
});
new IntersectionObserver(entries => {
  inView = entries[0].isIntersecting;
  syncAutoplay();
}, {threshold: .15}).observe(gallery);
document.addEventListener('visibilitychange', syncAutoplay);
window.addEventListener('resize', () => { updateLoopMetrics(); syncAutoplay(); });
reduceMotion.addEventListener('change', () => renderCategory(activeCategory));
renderCategory('treino');
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu(restoreFocus = false) {
  menuButton.setAttribute('aria-expanded','false');
  menuButton.setAttribute('aria-label','Abrir menu');
  mobileNav.hidden = true;
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open ? 'Fechar menu' : 'Abrir menu');
  mobileNav.hidden = !open;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => { if(event.key === 'Escape' && !mobileNav.hidden) closeMenu(true); });
document.addEventListener('click', event => { if(!mobileNav.hidden && !event.target.closest('.site-header')) closeMenu(); });
window.matchMedia('(min-width: 701px)').addEventListener('change', event => { if(event.matches) closeMenu(); });
document.querySelector('#year').textContent = String(new Date().getFullYear());

// Public form endpoint recovered from the existing project. No production test submissions.
const formEndpoint = 'https://23c2599f.sibforms.com/serve/MUIFAPSUxv8_O5MQpuvy8cPjEKYH78MHOEb-WvtDlAL5E3e-vNyhgwqO-Q02IMKjQXyahW4pHK-H_oJSsrwuYhYQ9s4dWrCO6mthOFxBmSPlNRR3aaG8BUsQ2lcEcyBHNFiqXd5MYGOmzN-XPiqaaoOXetHTUvh58nEKiF5_DoeboO8mIz5Fe85K7lx3z1GonDO7MlGaWNYPNxOggg==';
const form = document.querySelector('#sample-form');
const submitButton = document.querySelector('#sample-submit');
const status = document.querySelector('#form-status');
form.addEventListener('submit', async event => {
  event.preventDefault();
  if(!form.reportValidity() || form.elements.email_address_check.value) return;
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando…';
  status.textContent = '';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const payload = new URLSearchParams({EMAIL: form.elements.EMAIL.value.trim(),email_address_check:'',locale:'pt'});
    const response = await fetch(formEndpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:payload.toString(),signal:controller.signal});
    if (!response.ok) throw new Error('Form request failed');
    status.replaceChildren();
    const link = document.createElement('a');
    link.href = 'assets/coachplanner-plano-de-treino.pdf';
    link.download = 'Coach-Planner-Plano-de-Treino.pdf';
    link.textContent = 'Baixar meu documento de Plano de Treino';
    status.append(link);
    link.click();
  } catch {
    status.textContent = 'Não foi possível confirmar o envio. Tente novamente ou ';
    const contact = document.createElement('a');
    contact.href='https://wa.me/5551991736138?text=Ol%C3%A1%2C%20quero%20receber%20o%20documento%20de%20degusta%C3%A7%C3%A3o%20do%20Coach%20Planner.';
    contact.target='_blank'; contact.rel='noopener noreferrer';
    contact.textContent='peça seu documento pelo WhatsApp.';
    status.append(contact);
  } finally {
    clearTimeout(timeout);
    submitButton.disabled = false;
    submitButton.textContent = 'Receber meu documento';
  }
});
