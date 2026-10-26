'use strict';

// Tactile paper movement only when a desktop mouse is available.
(() => {
  const desk = document.querySelector('.desk');
  if (!desk) return;
  const desktopPointer = window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = false;
  let scheduledFrame = 0;
  let pointerX = 0;
  let pointerY = 0;

  function reset() {
    cancelAnimationFrame(scheduledFrame);
    scheduledFrame = 0;
    pointerX = 0;
    pointerY = 0;
    desk.classList.remove('is-interacting');
    desk.style.setProperty('--paper-x', '0');
    desk.style.setProperty('--paper-y', '0');
  }
  function updateAvailability() {
    enabled = desktopPointer.matches && !reducedMotion.matches;
    reset();
    desk.classList.toggle('has-depth', enabled);
  }
  function scheduleMovement(event) {
    if (!enabled || event.pointerType !== 'mouse') return;
    const rect = desk.getBoundingClientRect();
    pointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2));
    pointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2));
    if (scheduledFrame) return;
    scheduledFrame = requestAnimationFrame(() => {
      desk.style.setProperty('--paper-x', pointerX.toFixed(3));
      desk.style.setProperty('--paper-y', pointerY.toFixed(3));
      scheduledFrame = 0;
    });
  }
  desk.addEventListener('pointerenter', event => {
    if (!enabled || event.pointerType !== 'mouse') return;
    desk.classList.add('is-interacting');
    scheduleMovement(event);
  });
  desk.addEventListener('pointermove', scheduleMovement, {passive:true});
  desk.addEventListener('pointerleave', reset);
  window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  desktopPointer.addEventListener('change', updateAvailability);
  reducedMotion.addEventListener('change', updateAvailability);
  updateAvailability();
})();
