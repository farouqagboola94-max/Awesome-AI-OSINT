/* Shared brandmark + finisher for motion-pack videos. */
window.brandmark = function(t0 = 5000, t1 = 7000) {
  const el = document.querySelector('.brandmark');
  if (!el) return;
  KIT.fade(el, t0, t0 + 400, 0, 1);
  KIT.fade(el, t1 - 300, t1, 1, 0);
};
window.cornerFrame = function(t0 = 300, t1 = 900) {
  document.querySelectorAll('.corner-tl,.corner-tr,.corner-bl,.corner-br').forEach((c, i) => {
    KIN.add(c, {t0: t0 + i*40, t1: t1 + i*40, from: {opacity: 0, scale: 0.4}, to: {opacity: 1, scale: 1}, ease: 'outBack'});
  });
};
