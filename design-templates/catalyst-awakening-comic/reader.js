'use strict';
(() => {
  const el = id => document.getElementById(id);
  const status = el('status'), art = el('page-art'), viewport = el('art-viewport');
  const key = 'catalyst-issue01-reading-page';
  let pages = [], current = 1, saved = 1, galleryBuilt = false;
  try { saved = Number(localStorage.getItem(key)) || 1; } catch { /* Reading works without storage. */ }
  const safePage = n => Math.max(1, Math.min(pages.length, Number.isFinite(n) ? Math.floor(n) : 1));
  function loadArt() {
    const page = pages[current - 1];
    status.textContent = `Loading page ${current}…`;
    el('retry-art').hidden = true;
    viewport.setAttribute('aria-busy', 'true');
    art.src = page.image;
    art.alt = `Issue 01, page ${current}: ${page.title}. Lettered proof page. Full source dialogue follows.`;
  }
  art.addEventListener('load', () => {
    viewport.setAttribute('aria-busy', 'false');
    status.textContent = `Page ${current} of ${pages.length}. Lettered proof.`;
  });
  art.addEventListener('error', () => {
    viewport.setAttribute('aria-busy', 'false');
    status.textContent = 'Artwork could not load. The complete dialogue is still available below. Retry, or check your private-site access.';
    el('retry-art').hidden = false;
  });
  function show(n, scroll = true) {
    if (!pages.length) return;
    current = safePage(n);
    const page = pages[current - 1];
    viewport.classList.remove('zoomed');
    el('zoom-button').setAttribute('aria-pressed', 'false');
    el('zoom-button').textContent = 'Zoom page';
    loadArt();
    el('page-caption').textContent = `ISSUE 01 · PAGE ${String(current).padStart(2, '0')} / 88`;
    el('scene-label').textContent = `SCENE ${page.scene} · ${page.title}`;
    el('progress').textContent = `${current} / 88`;
    el('reading-progress').value = current;
    el('page-select').value = String(current);
    el('scene-select').value = String(pages.find(p => p.scene === page.scene).page);
    el('cues').replaceChildren();
    for (const cue of page.cues) {
      if (!cue.text.trim()) continue;
      const section = document.createElement('section'), label = document.createElement('small'), p = document.createElement('p');
      section.className = 'source-cue';
      label.textContent = `${cue.type}${cue.speaker ? ' · ' + cue.speaker : ''}`;
      p.textContent = cue.text;
      section.append(label, p); el('cues').append(section);
    }
    if (!el('cues').children.length) el('cues').textContent = 'Visual hold — no spoken dialogue on this page.';
    for (const id of ['prev', 'prev-bottom']) el(id).disabled = current === 1;
    for (const id of ['next', 'next-bottom']) el(id).disabled = current === pages.length;
    history.replaceState(null, '', `#page-${current}`);
    try { localStorage.setItem(key, String(current)); } catch { /* Optional local progress only. */ }
    if (scroll) document.querySelector('.comic-page-grid').scrollIntoView({ block: 'start' });
  }
  for (const id of ['prev','prev-bottom']) el(id).addEventListener('click', () => show(current - 1));
  for (const id of ['next','next-bottom']) el(id).addEventListener('click', () => show(current + 1));
  for (const id of ['page-select','scene-select']) el(id).addEventListener('change', event => show(Number(event.target.value)));
  el('retry-art').addEventListener('click', loadArt);
  el('resume').addEventListener('click', () => { show(saved); el('resume').hidden = true; });
  el('zoom-button').addEventListener('click', () => {
    const zoomed = viewport.classList.toggle('zoomed');
    el('zoom-button').setAttribute('aria-pressed', String(zoomed));
    el('zoom-button').textContent = zoomed ? 'Fit page' : 'Zoom page';
  });
  document.addEventListener('keydown', event => {
    if (event.target.closest('select,button,input,textarea,[contenteditable]') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  window.addEventListener('hashchange', () => show(Number(location.hash.match(/^#page-(\d+)$/)?.[1] || 1)));
  function buildGallery() {
    if (galleryBuilt || !pages.length || !el('production-overview').open) return;
    galleryBuilt = true;
    let scene = null, group;
    for (const page of pages) {
      if (scene !== page.scene) {
        scene = page.scene;
        const heading = document.createElement('h2');
        heading.textContent = `Scene ${scene} · ${page.title}`;
        group = document.createElement('div'); group.className = 'page-thumbnails';
        el('page-gallery').append(heading, group);
      }
      const link = document.createElement('a'), img = document.createElement('img'), label = document.createElement('span');
      link.href = `#page-${page.page}`;
      img.src = page.image; img.alt = `Page ${page.page} preview`; img.loading = 'lazy'; img.width = 128; img.height = 192;
      label.textContent = `Page ${page.page}`;
      link.append(img, label); group.append(link);
      link.addEventListener('click', event => { event.preventDefault(); show(page.page); });
    }
  }
  el('production-overview').addEventListener('toggle', buildGallery);
  fetch('/private/issue01/manifest.json', { cache: 'no-store' }).then(response => {
    if (!response.ok) throw new Error('The private comic package is unavailable. Check your access and reload.');
    return response.json();
  }).then(data => {
    if (!Array.isArray(data.pages) || data.pages.length !== 88 || data.pages.some((p,i) => p.page !== i+1 || !p.image?.startsWith('/private/issue01/lettered/pages/') || !Array.isArray(p.cues))) throw new Error('The comic sequence could not be validated.');
    pages = data.pages;
    for (const page of pages) el('page-select').add(new Option(String(page.page).padStart(2,'0'), String(page.page)));
    for (const page of pages.filter((p,i) => !i || p.scene !== pages[i-1].scene)) el('scene-select').add(new Option(`${page.scene} · ${page.title}`, String(page.page)));
    saved = safePage(saved);
    if (saved > 1) { el('resume').textContent = `Resume page ${saved}`; el('resume').hidden = false; }
    show(Number(location.hash.match(/^#page-(\d+)$/)?.[1] || 1), false);
    buildGallery();
  }).catch(error => { status.textContent = error.message; });
})();
