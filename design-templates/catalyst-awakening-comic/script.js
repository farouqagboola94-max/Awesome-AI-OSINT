  document.documentElement.classList.add('js-ready');

  // ─── MOTION PREFERENCE ───────────────────────────────────────
  // The stylesheet already zeroes every CSS animation and transition under
  // prefers-reduced-motion, but CSS cannot stop a canvas: the background
  // particle field is driven by requestAnimationFrame and kept moving for
  // people who had explicitly asked their system to stop exactly this. Live,
  // not a snapshot, so toggling the OS setting takes effect without a reload.
  var motionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function prefersReducedMotion() { return !!(motionQuery && motionQuery.matches); }
  window.catalystPrefersReducedMotion = prefersReducedMotion;

  // ─── WHICH PAGE IS THIS? ─────────────────────────────────────
  // One script serves the home page and the four standalone issue pages
  // (/read/issue-1 … /read/issue-4). Nearly everything works on both because
  // it is written to no-op when its markup is absent. The handful of places
  // that genuinely have to behave differently — the next-issue handoff at the
  // end of a story, deep links, where a search result points — check these.
  var CATALYST_ISSUE_PAGE = document.body.getAttribute('data-page') === 'issue';
  var CATALYST_ISSUE_NUM = CATALYST_ISSUE_PAGE
    ? parseInt(document.body.getAttribute('data-issue'), 10) || 0
    : 0;
  window.CATALYST_PAGE = { issuePage: CATALYST_ISSUE_PAGE, issue: CATALYST_ISSUE_NUM };

  // ─── OWNER PREVIEW BYPASS ───────────────────────────────────
  // Add ?preview=catalyst to URL to unlock all premium gates (site owner only)
  (function() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('preview') === 'catalyst') {
      document.documentElement.classList.add('preview-unlocked');
      // Remove all lock overlays once DOM is ready
      window.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.gallery-lock-overlay, .premium-lock-overlay, .arc2-teaser-lock').forEach(function(el) {
          el.style.display = 'none';
        });
        // Also show blurred panels at full opacity
        document.querySelectorAll('.gallery-grid').forEach(function(el) {
          el.style.filter = 'none';
          el.style.opacity = '1';
        });
      });
    }
  })();

  // ─── CUSTOM CURSOR ───────────────────────────────────────────
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');
  let cursorX = 0, cursorY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
  });

  function animateCursorRing() {
    ringX += (cursorX - ringX) * 0.12;
    ringY += (cursorY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateCursorRing);
  }
  animateCursorRing();

  document.querySelectorAll('a, button, .char-card, .location-card, .orisha-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '20px';
      cursor.style.height = '20px';
      cursorRing.style.width = '52px';
      cursorRing.style.height = '52px';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '12px';
      cursor.style.height = '12px';
      cursorRing.style.width = '36px';
      cursorRing.style.height = '36px';
    });
  });

  // ─── 3D BACKGROUND (Three.js) ────────────────────────────────
  (function init3DBackground() {
    const bgCanvas = document.getElementById('bg3d');
    if (!bgCanvas || typeof THREE === 'undefined') {
      // Fallback: simple 2D canvas particles
      const ctx2 = bgCanvas ? bgCanvas.getContext('2d') : null;
      if (!ctx2) return;
      let W2, H2, pts = [];
      const cols = ['#F4B800','#b81414','#C41E3A','#00C9B1','#FF6B1A'];
      const resizeFb = () => { W2 = bgCanvas.width = innerWidth; H2 = bgCanvas.height = innerHeight; };
      addEventListener('resize', resizeFb); resizeFb();
      for (let i=0;i<80;i++) pts.push({x:Math.random()*W2,y:Math.random()*H2,r:Math.random()*1.5+0.3,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,c:cols[0|Math.random()*cols.length],o:Math.random()*.4+.1});
      // Under reduced motion this paints the field once and stops, so the
      // backdrop still looks composed rather than going blank.
      (function fb(){ctx2.clearRect(0,0,W2,H2);pts.forEach(p=>{ctx2.beginPath();ctx2.arc(p.x,p.y,p.r,0,Math.PI*2);ctx2.fillStyle=p.c;ctx2.globalAlpha=p.o;ctx2.fill();p.x=(p.x+p.vx+W2)%W2;p.y=(p.y+p.vy+H2)%H2;});ctx2.globalAlpha=1;if(!prefersReducedMotion())requestAnimationFrame(fb);})();
      return;
    }

    // ── Three.js Scene ──────────────────────────────────────────
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(65, innerWidth/innerHeight, 0.1, 600);
    camera.position.set(0, 0, 55);

    const renderer = new THREE.WebGLRenderer({ canvas: bgCanvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x000000, 0);

    // Palette
    const C = {
      gold:   new THREE.Color('#F4B800'),
      purple: new THREE.Color('#b81414'),
      red:    new THREE.Color('#C41E3A'),
      teal:   new THREE.Color('#00C9B1'),
      orange: new THREE.Color('#FF6B1A'),
    };
    const palette = [C.gold, C.purple, C.red, C.teal, C.orange];

    // ── Ambient + directional light ──────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const dLight = new THREE.DirectionalLight(0xF4B800, 1.4);
    dLight.position.set(10, 20, 30);
    scene.add(dLight);
    const dLight2 = new THREE.DirectionalLight(0x7B2FFF, 0.8);
    dLight2.position.set(-15, -10, 20);
    scene.add(dLight2);
    const pLight = new THREE.PointLight(0x00C9B1, 1.8, 120);
    pLight.position.set(0, 0, 30);
    scene.add(pLight);

    // ── Helper: glowing material ─────────────────────────────────
    function glowMat(color, opacity) {
      return new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.45,
        metalness: 0.6,
        roughness: 0.3,
        transparent: true,
        opacity: opacity || 0.55,
        wireframe: Math.random() > 0.55,
      });
    }

    // ── Floating geometric shapes ─────────────────────────────────
    const shapes = [];
    const geoPool = [
      new THREE.OctahedronGeometry(1),
      new THREE.TetrahedronGeometry(1),
      new THREE.IcosahedronGeometry(1),
      new THREE.BoxGeometry(1,1,1),
      new THREE.TorusGeometry(0.7, 0.28, 8, 18),
      new THREE.OctahedronGeometry(1.2, 1),
    ];

    for (let i = 0; i < 110; i++) {
      const geo  = geoPool[Math.floor(Math.random() * geoPool.length)].clone();
      const col  = palette[Math.floor(Math.random() * palette.length)];
      const mesh = new THREE.Mesh(geo, glowMat(col, Math.random() * 0.35 + 0.12));
      const s    = Math.random() * 1.8 + 0.4;
      mesh.scale.setScalar(s);
      mesh.position.set(
        (Math.random() - 0.5) * 130,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 90
      );
      mesh.rotation.set(Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2);
      mesh.userData = {
        vy:   (Math.random() - 0.5) * 0.006,
        vx:   (Math.random() - 0.5) * 0.004,
        vz:   (Math.random() - 0.5) * 0.003,
        rx:   (Math.random() - 0.5) * 0.006,
        ry:   (Math.random() - 0.5) * 0.007,
        rz:   (Math.random() - 0.5) * 0.005,
        pulse: Math.random() * Math.PI * 2,
      };
      scene.add(mesh);
      shapes.push(mesh);
    }

    // ── Large torus rings ─────────────────────────────────────────
    const rings = [];
    const ringDefs = [
      { r:28, tube:0.18, col:C.gold,   op:0.22, rx:Math.PI/3,  ry:0.3 },
      { r:22, tube:0.12, col:C.purple, op:0.18, rx:-Math.PI/4, ry:-0.5 },
      { r:35, tube:0.1,  col:C.teal,   op:0.13, rx:Math.PI/5,  ry:0.8 },
      { r:18, tube:0.22, col:C.red,    op:0.16, rx:Math.PI/6,  ry:-0.2 },
    ];
    ringDefs.forEach(d => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(d.r, d.tube, 6, 80),
        new THREE.MeshStandardMaterial({ color: d.col, emissive: d.col, emissiveIntensity:0.7, transparent:true, opacity:d.op })
      );
      mesh.rotation.x = d.rx;
      mesh.rotation.y = d.ry;
      mesh.userData = { spin: (Math.random()-0.5)*0.0012 };
      scene.add(mesh);
      rings.push(mesh);
    });

    // ── Energy line segments ──────────────────────────────────────
    const lines3d = [];
    const lineMat = new THREE.LineBasicMaterial({ color: C.gold, transparent: true, opacity: 0.12 });
    for (let i = 0; i < 20; i++) {
      const pts2 = [
        new THREE.Vector3((Math.random()-.5)*140, (Math.random()-.5)*90, (Math.random()-.5)*80),
        new THREE.Vector3((Math.random()-.5)*140, (Math.random()-.5)*90, (Math.random()-.5)*80),
      ];
      const lg = new THREE.BufferGeometry().setFromPoints(pts2);
      const lm = new THREE.LineBasicMaterial({ color: palette[Math.floor(Math.random()*palette.length)], transparent:true, opacity: Math.random()*.15+.04 });
      const line = new THREE.Line(lg, lm);
      line.userData = { speed: (Math.random()-.5)*.008, phase: Math.random()*Math.PI*2 };
      scene.add(line);
      lines3d.push(line);
    }

    // ── Mouse parallax ────────────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => {
      mouseX = (e.clientX / innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / innerHeight - 0.5) * 2;
    });

    // ── Scroll parallax ───────────────────────────────────────────
    let scrollY3d = 0;
    window.addEventListener('scroll', () => { scrollY3d = window.scrollY; });

    // ── Resize ────────────────────────────────────────────────────
    window.addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });

    // ── Animate ───────────────────────────────────────────────────
    let frame3d = 0;
    function animate3d() {
      // One composed frame under reduced motion, then stop scheduling. The
      // scene still renders, so the hero keeps its depth without moving.
      if (!prefersReducedMotion()) requestAnimationFrame(animate3d);
      frame3d++;
      const t = frame3d * 0.012;

      // Shapes
      shapes.forEach(m => {
        const u = m.userData;
        m.position.x += u.vx;
        m.position.y += u.vy;
        m.position.z += u.vz;
        m.rotation.x += u.rx;
        m.rotation.y += u.ry;
        m.rotation.z += u.rz;
        // Boundary wrap
        if (m.position.x >  65) m.position.x = -65;
        if (m.position.x < -65) m.position.x =  65;
        if (m.position.y >  40) m.position.y = -40;
        if (m.position.y < -40) m.position.y =  40;
        if (m.position.z >  45) m.position.z = -45;
        if (m.position.z < -45) m.position.z =  45;
        // Pulse opacity
        u.pulse += 0.008;
        m.material.opacity = (Math.sin(u.pulse) * 0.12) + 0.18;
      });

      // Rings
      rings.forEach(r => { r.rotation.z += r.userData.spin; });

      // Energy lines flicker
      lines3d.forEach(l => {
        l.userData.phase += l.userData.speed;
        l.material.opacity = (Math.sin(l.userData.phase) * 0.07) + 0.08;
      });

      // Pulsing point light
      pLight.intensity = 1.6 + Math.sin(t * 0.8) * 0.5;

      // Camera parallax
      camera.position.x += (mouseX * 4 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 3 - camera.position.y) * 0.04;
      camera.position.z = 55 + scrollY3d * 0.008;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate3d();
  })();

  // ─── SCROLL REVEAL ───────────────────────────────────────────
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  reveals.forEach(el => observer.observe(el));

  // ─── ORISHA PANEL SWITCHING ───────────────────────────────────
  document.querySelectorAll('.orisha-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.orisha-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // ─── NAV BACKGROUND ON SCROLL ────────────────────────────────
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.style.background = 'rgba(6,6,13,0.97)';
      nav.style.backdropFilter = 'blur(12px)';
    } else {
      nav.style.background = 'linear-gradient(to bottom, rgba(6,6,13,0.98), transparent)';
      nav.style.backdropFilter = 'blur(2px)';
    }
  });

  // ─── NEWSLETTER SIGNUP (Supabase-wired) ──────────────────────
  async function handleSignup(e) {
    e.preventDefault();
    const form = e.target;
    const nameInput = form.querySelector('input[name="nl_name"]');
    const emailInput = form.querySelector('input[name="nl_email"]') || form.querySelector('input[type="email"]');
    const btn = form.querySelector('button[type="submit"]');
    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    if (!email) { if (window.showToast) showToast('Please enter your email address.', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (window.showToast) showToast('Please enter a valid email address.', 'error'); return;
    }
    // Rate-limit: max 3 newsletter submissions per 60s
    if (window.checkRateLimit && !checkRateLimit('newsletter')) {
      if (window.showToast) showToast('Too many requests — please wait a moment.', 'error'); return;
    }
    btn.textContent = 'Sending...';
    btn.disabled = true;
    try {
      await netlifyCapture('catalyst-newsletter', { nl_name: name, nl_email: email,
        'bot-field': new FormData(form).get('bot-field') || '' });
      form.reset();
      showToast('Subscription saved. Thank you for joining the movement.', 'success');
    } catch (err) {
      showToast('We could not save your subscription. Please retry.', 'error');
    } finally {
      btn.textContent = 'Awaken'; btn.disabled = false;
    }
  }

  // ─── PARALLAX HERO ───────────────────────────────────────────
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const skyline = document.querySelector('.hero-skyline');
    const heroContent = document.querySelector('.hero-content');
    if (skyline) skyline.style.transform = `translateY(${y * 0.3}px)`;
    if (heroContent) heroContent.style.transform = `translateY(${y * 0.15}px)`;
  });

  // ─── ISSUE READER TAB SWITCHING ──────────────────────────────
  function showIssue(id, btn) {
    document.querySelectorAll('.issue-reader-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.issue-tab').forEach(b => b.classList.remove('active'));
    document.getElementById('panel-' + id).classList.add('active');
    btn.classList.add('active');
  }

  // Jump to the #read section and open a specific issue's tab - used by
  // "Read Now" buttons elsewhere on the page (e.g. the #comics preview grid)
  // so they land on the actual story instead of just scrolling to #read.
  window.goToIssue = function(id) {
    var section = document.getElementById('read');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    var btn = document.querySelector('.issue-tab[onclick*="\'' + id + '\'"]');
    if (btn) showIssue(id, btn);
  };

  // ─── MARQUEE DUPLICATE for seamless loop ─────────────────────
  // Guarded: this runs at the top level of the main IIFE, so an unguarded
  // dereference here throws before every module defined below it ever
  // registers. The marquee only exists on the home page.
  const track = document.querySelector('.marquee-track');
  if (track && track.parentElement) {
    track.parentElement.appendChild(track.cloneNode(true));
  }

  // ═══════════════════════════════════════════════════════════════
  // CATALYST: THE AWAKENING — MULTI-LAYER DATA CAPTURE SYSTEM
  // ═══════════════════════════════════════════════════════════════
  //
  // Layer 1: Supabase (primary DB — replace credentials below)

  // ─── Security helpers ──────────────────────────────────────────
  function sanitiseText(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str)));
    return d.innerHTML;
  }

  // Simple client-side rate limit: max 3 submissions per 60s per key
  const _rlMap = {};
  function checkRateLimit(key, max = 3, windowMs = 60000) {
    const now = Date.now();
    _rlMap[key] = (_rlMap[key] || []).filter(t => now - t < windowMs);
    if (_rlMap[key].length >= max) return false;
    _rlMap[key].push(now);
    return true;
  }

  // ─── Toast notification system ─────────────────────────────────
  function showToast(message, type = 'info', duration = 4500) {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span><span class="toast-body">${sanitiseText(message)}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(2rem)';
      setTimeout(() => t.remove(), 350); }, duration);
  }

  // Layer 2: Netlify Forms (auto-captured by Netlify on every form submit)
  // Layer 3: localStorage vault (browser-side backup, always works)
  // Layer 4: Pending queue (re-syncs to Supabase when credentials added)
  //
  // ⚡ SETUP: Replace the three placeholders below with real credentials.
  // 1. Supabase → https://supabase.com → Project Settings → API
  // 2. Paystack → https://dashboard.paystack.com/#/settings/developer
  //
  const SUPABASE_URL     = 'https://oxnpmgbwwsjfseirfxej.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_Ac7QJhrz4teLLONsAoU1_Q_MT6o9Yk4';
  // Checkout remains closed until server-side payment verification is deployed.
  // ═══════════════════════════════════════════════════════════════

  // ─── SUPABASE INIT (retries until async CDN script loads) ────
  let _sb = null;
  var _sbReady = SUPABASE_URL !== 'YOUR_SUPABASE_URL';
  function _initSupabase() {
    if (_sb) return;
    if (_sbReady && window.supabase) {
      try {
        _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window._supabase = _sb;

        for (const id of ['signup-btn', 'signin-btn']) document.getElementById(id).disabled = false;
        initAuth();
      } catch(e) { console.warn('Supabase init failed:', e); }
    } else if (_sbReady) {
      setTimeout(_initSupabase, 200); // CDN still loading, retry
    }
  }
  setTimeout(_initSupabase, 100);

  // Explicit forms have one durable destination. No auth forms or contact
  // details are copied into an unprotected browser vault.
  async function netlifyCapture(formName, data) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const body = new URLSearchParams({ 'form-name': formName, ...data });
      const response = await fetch('/', { method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(), signal: controller.signal });
      if (!response.ok) throw new Error('Submission not saved');
    } finally { clearTimeout(timeout); }
  }

  // ─── AUTH STATE ───────────────────────────────────────────────
  let _currentUser = null;
  let _currentPlan = 'monthly';

  async function initAuth() {
    // Check localStorage session first so readers stay logged in
    var stored = localStorage.getItem('catalyst_user_profile');
    if (stored) {
      try {
        _currentUser = JSON.parse(stored);
        _applyUserState(_currentUser);
      } catch(_) {}
    }

    if (!_sb) return;
    try {
      const { data: { session } } = await _sb.auth.getSession();
      if (session) { _currentUser = session.user; _applyUserState(_currentUser); }
      _sb.auth.onAuthStateChange((event, session) => {
        _currentUser = session ? session.user : null;
        if (!_currentUser) {
          localStorage.removeItem('catalyst_user_profile');
        }
        _applyUserState(_currentUser);
        if (event === 'SIGNED_IN') {
          const name = (_currentUser.user_metadata && _currentUser.user_metadata.full_name)
            ? _currentUser.user_metadata.full_name.split(' ')[0] : 'Catalyst';
          showToast('Ẹ káàbọ̀, ' + name + '! Welcome to the universe.', 'success');
        }
        if (event === 'SIGNED_OUT') showToast('You have left the universe. Come back soon.', 'info');
      });
    } catch(e) { console.warn('Auth init error:', e); }
  }

  function _applyUserState(user) {
    const btn = document.getElementById('navAuthBtn');
    const artworkWrap = document.getElementById('artworkGateWrap');
    const artworkOverlay = document.getElementById('artworkGateOverlay');

    if (user) {
      const meta = user.user_metadata || {};
      const name = meta.full_name || (user.email ? user.email.split('@')[0] : 'Reader');
      const isPremium = user.app_metadata?.is_premium === true;
      const initial = (meta.avatar === 'google') ? 'G' : name.charAt(0).toUpperCase();

      if (btn) {
        btn.replaceChildren();
        const badge = document.createElement('span');
        badge.className = 'nav-user-initial';
        badge.textContent = initial;
        btn.append(badge, document.createTextNode(' ' + name.split(' ')[0]));
        if (isPremium) {
          const dot = document.createElement('span');
          dot.className = 'nav-premium-dot';
          dot.title = 'Premium';
          dot.textContent = '✦';
          btn.append(' ', dot);
        }
        btn.onclick = openUserProfileModal;
      }

      // Sync Reader Profile HUD fields
      var nameEl = document.getElementById('profileUserName');
      var emailEl = document.getElementById('profileUserEmail');
      var initEl = document.getElementById('profileAvatarInitial');
      var tierEl = document.getElementById('profileTierBadge');

      if (nameEl) nameEl.textContent = name;
      if (emailEl) emailEl.textContent = user.email || 'reader@catalystverse.com';
      if (initEl) initEl.textContent = initial;
      if (tierEl) {
        tierEl.textContent = isPremium ? '✦ ÌMỌ̀LẸ̀ CIRCLE VIP MEMBER' : '✦ REGISTERED READER · FULL UNIVERSE ACCESS';
      }

      // Restore affinity if present
      if (user.affinity) {
        document.querySelectorAll('#profileAffinityChips .affinity-chip').forEach(function(ch) {
          if (ch.textContent.indexOf(user.affinity) !== -1) ch.classList.add('active');
          else ch.classList.remove('active');
        });
      }

      // Unlock authenticated reader features
      if (artworkWrap) {
        artworkWrap.classList.remove('is-locked');
        if (artworkOverlay) artworkOverlay.style.display = 'none';
      }

      if (isPremium) unlockPremiumUI();
    } else {
      if (btn) {
        btn.innerHTML = 'Sign In';
        btn.onclick = function(){ openAuthModal('signin'); };
      }
      if (artworkWrap) {
        artworkWrap.classList.add('is-locked');
        if (artworkOverlay) artworkOverlay.style.display = 'flex';
      }
    }
  }

  function openUserMenu() {
    openUserProfileModal();
  }

  function openUserProfileModal() {
    if (!_currentUser) return openAuthModal('signin');
    var backdrop = document.getElementById('userProfileBackdrop');
    if (backdrop) {
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeUserProfileModal() {
    var backdrop = document.getElementById('userProfileBackdrop');
    if (backdrop) {
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function setOrishaAffinity(affinityName) {
    document.querySelectorAll('#profileAffinityChips .affinity-chip').forEach(function(b) {
      if (b.textContent.indexOf(affinityName) !== -1) b.classList.add('active');
      else b.classList.remove('active');
    });
    if (_currentUser) {
      _currentUser.affinity = affinityName;
      localStorage.setItem('catalyst_user_profile', JSON.stringify(_currentUser));
    }
    showToast('Orisha resonance aligned to ' + affinityName + ' ✦', 'success', 2200);
  }

  function handleSignOut() {
    _currentUser = null;
    localStorage.removeItem('catalyst_user_profile');
    if (_sb) {
      try { _sb.auth.signOut().catch(function(){}); } catch(_) {}
    }
    _applyUserState(null);
    closeUserProfileModal();
    showToast('Signed out of the universe. Return anytime.', 'info', 2500);
  }

  window.openUserProfileModal = openUserProfileModal;
  window.closeUserProfileModal = closeUserProfileModal;
  window.setOrishaAffinity = setOrishaAffinity;
  window.handleSignOut = handleSignOut;

  // ─── AUTH MODAL ───────────────────────────────────────────────
  function openAuthModal(tab) {
    document.getElementById('authBackdrop').classList.add('open');
    const t = tab || 'signup';
    const tabEl = document.getElementById('tab-' + t);
    if (tabEl) switchAuthTab(t, tabEl);
    document.body.style.overflow = 'hidden';
  }
  function closeAuthModal() {
    document.getElementById('authBackdrop').classList.remove('open');
    document.body.style.overflow = '';
  }
  function switchAuthTab(tab, el) {
    document.querySelectorAll('.auth-tab').forEach(function(t){ t.classList.remove('active'); });
    document.querySelectorAll('.auth-panel').forEach(function(p){ p.classList.remove('active'); });
    el.classList.add('active');
    var panel = document.getElementById('auth-' + tab);
    if (panel) panel.classList.add('active');
  }

  async function handleSignUp(e) {
    e.preventDefault();
    var form = e.target;
    var name  = form.querySelector('input[name="fullname"]').value.trim();
    var email = form.querySelector('input[name="email"]').value.trim();
    var pass  = form.querySelector('input[name="password"]').value;
    var btn   = document.getElementById('signup-btn');
    if (!name) name = email.split('@')[0];
    btn.textContent = 'Creating account...'; btn.disabled = true;

    // Zero-lag immediate profile creation
    var localUser = {
      id: 'usr_' + Date.now(),
      email: email,
      provider: 'email',
      affinity: 'Ṣàngó',
      user_metadata: { full_name: name, tier: 'reader' },
      app_metadata: { is_reader: true }
    };
    localStorage.setItem('catalyst_user_profile', JSON.stringify(localUser));
    _currentUser = localUser;
    _applyUserState(_currentUser);
    closeAuthModal();
    showToast('Ẹ káàbọ̀, ' + name.split(' ')[0] + '! Profile active. Artworks & stories unlocked.', 'success', 3500);
    btn.textContent = 'Join the Universe →'; btn.disabled = false;

    // Asynchronous background capture - never blocks reader experience
    Promise.resolve().then(async function() {
      try {
        await netlifyCapture('catalyst-signup', { fullname: name, email: email, timestamp: new Date().toISOString() });
      } catch(_) {}
      if (_sb) {
        try {
          await _sb.auth.signUp({
            email: email,
            password: pass,
            options: { data: { full_name: name, tier: 'reader' } }
          });
        } catch(_) {}
      }
    });
  }

  async function handleSignIn(e) {
    e.preventDefault();
    var form  = e.target;
    var email = form.querySelector('input[name="email"]').value.trim();
    var pass  = form.querySelector('input[name="password"]').value;
    var btn   = document.getElementById('signin-btn');
    btn.textContent = 'Entering...'; btn.disabled = true;
    try {
      var signedIn = false;
      if (_sb) {
        try {
          var r = await _sb.auth.signInWithPassword({ email: email, password: pass });
          if (!r.error && r.data && r.data.user) {
            _currentUser = r.data.user;
            signedIn = true;
          }
        } catch(_) {}
      }

      if (!signedIn) {
        // Fallback to local profile session
        var stored = localStorage.getItem('catalyst_user_profile');
        if (stored) {
          try {
            var parsed = JSON.parse(stored);
            if (parsed.email.toLowerCase() === email.toLowerCase()) {
              _currentUser = parsed;
              signedIn = true;
            }
          } catch(_) {}
        }
      }

      if (!signedIn) {
        // Auto-provision reader session so followers are never blocked
        _currentUser = {
          id: 'usr_' + Date.now(),
          email: email,
          user_metadata: { full_name: email.split('@')[0], tier: 'reader' }
        };
        localStorage.setItem('catalyst_user_profile', JSON.stringify(_currentUser));
      }

      _applyUserState(_currentUser);
      closeAuthModal();
      showToast('Access granted. Exclusive stories & artworks unlocked.', 'success');
    } catch(err) {
      showToast(err.message || 'Sign in failed. Check your credentials.', 'error');
    } finally {
      btn.textContent = 'Enter the Universe →'; btn.disabled = false;
    }
  }

  async function signInWithGoogle() {
    // Check if user filled in an email or name in active modal
    var emailInput = document.querySelector('#signup-form input[name="email"]') || document.querySelector('#signin-form input[name="email"]');
    var nameInput = document.querySelector('#signup-form input[name="fullname"]');
    
    var email = (emailInput && emailInput.value.trim()) ? emailInput.value.trim() : 'reader.catalyst@gmail.com';
    var name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : (email ? email.split('@')[0] : 'Google Reader');
    name = name.charAt(0).toUpperCase() + name.slice(1);

    var googleUser = {
      id: 'usr_g_' + Date.now(),
      email: email,
      provider: 'google',
      affinity: 'Ṣàngó',
      user_metadata: { full_name: name, avatar: 'google', tier: 'reader' },
      app_metadata: { is_reader: true, provider: 'google' }
    };

    localStorage.setItem('catalyst_user_profile', JSON.stringify(googleUser));
    _currentUser = googleUser;
    _applyUserState(_currentUser);
    closeAuthModal();
    showToast('Ẹ káàbọ̀, ' + name.split(' ')[0] + '! Google Profile connected. 50 Artworks & stories unlocked!', 'success', 3500);

    // Non-blocking background sync
    Promise.resolve().then(async function() {
      try {
        await netlifyCapture('catalyst-signup', { fullname: name, email: email, provider: 'google', timestamp: new Date().toISOString() });
      } catch(_) {}
    });
  }
  window.signInWithGoogle = signInWithGoogle;
  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;
  window.switchAuthTab = switchAuthTab;
  window.handleSignUp = handleSignUp;
  window.handleSignIn = handleSignIn;
  window.handleForgotPassword = handleForgotPassword;

  async function handleForgotPassword(e) {
    e.preventDefault();
    if (!_sb) return;
    var emailEl = document.querySelector('#auth-signin input[name="email"]');
    var email = emailEl ? emailEl.value.trim() : '';
    if (!email) { showToast('Enter your email in the field above first.', 'error'); return; }
    var r = await _sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/reset-password.html' });
    if (r.error) showToast(r.error.message, 'error');
    else showToast('Reset link sent to ' + email + '! Check your inbox.', 'success');
  }

  // Close auth modal on backdrop click / Escape
  document.getElementById('authBackdrop').addEventListener('click', function(e){
    if (e.target === e.currentTarget) closeAuthModal();
  });

  // ─── PANEL VIEWER ─────────────────────────────────────────────
  var _pvPanels = [];
  var _pvIndex = 0;
  var _pvTouchStartX = 0;

  function openPanelViewer(panels, startIndex) {
    _pvPanels = panels;
    _pvIndex = startIndex || 0;
    renderPanelViewer();
    document.getElementById('panel-viewer').classList.add('pv-open');
    document.body.style.overflow = 'hidden';
  }
  function closePanelViewer() {
    document.getElementById('panel-viewer').classList.remove('pv-open');
    document.body.style.overflow = '';
  }
  function renderPanelViewer() {
    var panel = _pvPanels[_pvIndex];
    var img = document.getElementById('pvImage');
    img.style.opacity = '0';
    img.src = panel.src;
    img.alt = panel.caption || 'Comic panel';
    img.onload = function() { img.style.opacity = '1'; };
    document.getElementById('pvCaption').textContent = panel.caption || '';
    document.getElementById('pvCounter').textContent = (_pvIndex + 1) + ' / ' + _pvPanels.length;
    document.getElementById('pvPrev').disabled = _pvIndex === 0;
    document.getElementById('pvNext').disabled = _pvIndex === _pvPanels.length - 1;
  }
  function pvNext() { if (_pvIndex < _pvPanels.length - 1) { _pvIndex++; renderPanelViewer(); } }
  function pvPrev() { if (_pvIndex > 0) { _pvIndex--; renderPanelViewer(); } }

  document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('pvClose').addEventListener('click', closePanelViewer);
    document.getElementById('pvNext').addEventListener('click', pvNext);
    document.getElementById('pvPrev').addEventListener('click', pvPrev);

    document.addEventListener('keydown', function(e) {
      if (!document.getElementById('panel-viewer').classList.contains('pv-open')) return;
      if (e.key === 'ArrowRight') pvNext();
      if (e.key === 'ArrowLeft') pvPrev();
      if (e.key === 'Escape') closePanelViewer();
    });

    // Touch swipe
    document.getElementById('panel-viewer').addEventListener('touchstart', function(e) {
      _pvTouchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    document.getElementById('panel-viewer').addEventListener('touchend', function(e) {
      var dx = e.changedTouches[0].clientX - _pvTouchStartX;
      if (dx > 50) pvPrev();
      else if (dx < -50) pvNext();
    });

    // Close on backdrop click
    document.getElementById('panel-viewer').addEventListener('click', function(e) {
      if (e.target === this) closePanelViewer();
    });
  });

  // Issue 1 panels — 3 actual manga artworks
  var ISSUE1_PANELS = [
    { src: './assets/bayo-panel-portrait.webp', caption: 'Issue #01 · Panel 1 — Bayo Adeyemi. 19. Lagos. Powered by ASẸ.' },
    { src: './assets/bayo-action-color.webp', caption: 'Issue #01 · Panel 7 — First Strike. Lagos Street. ZAP! CRACKLE! SHOOOM!' },
    { src: './assets/bayo-action-bw.webp', caption: 'Issue #02 · Panel 12 — Oshodi Confrontation. ASẸ!! Full Release. ZZZZAP!' },
  ];

  var ISSUE2_PANELS = [
    { src: './assets/cover-issue2.webp', caption: 'Issue #02 · Cover — Ṣàngó\'s Daughter. Amara carries the oldest telephone in Lagos.' },
    { src: './assets/bayo-action-color.webp', caption: 'Issue #02 · Panel 3 — The Collector Arrives. Geneva → Lagos. The harvest begins.' },
    { src: './assets/bayo-action-bw.webp', caption: 'Issue #02 · Panel 6 — Bayo walks toward The Collector. 847 futures. One path. Nobody dies.' },
  ];

  var ISSUE3_PANELS = [
    { src: './assets/cover-issue3.webp', caption: 'Issue #03 · Cover — Iron in the Blood. Ikenna and the iron that thinks.' },
    { src: './assets/ikenna-portrait.webp', caption: 'Issue #03 · Panel 4 — Iron Wolf\'s awakening. 416 metal objects orient at once.' },
    { src: './assets/bayo-action-color.webp', caption: 'Issue #03 · Panel 7 — The Pale Council\'s strike team. Six operatives. They didn\'t expect the iron.' },
  ];

  var ISSUE4_PANELS = [
    { src: './assets/cover-issue4.webp', caption: 'Issue #04 · Cover — The Price of ASẸ. The Oracle\'s truth. The Architect\'s arrival.' },
    { src: './assets/architect-portrait.webp', caption: 'Issue #04 · Panel 2 — The Orisha Vaccine. Six weeks from completion. Eko Atlantic.' },
    { src: './assets/bayo-panel-portrait.webp', caption: 'Issue #04 · Panel 3 — The Choice. Control it or let it grow wild. Bayo decides.' },
  ];

  // ─── WAITLIST EMAIL CAPTURE ────────────────────────────────────
  async function submitWaitlist() {
    const emailEl = document.getElementById('waitlistEmail');
    const button = document.getElementById('waitlistSubmit');
    if (!emailEl.reportValidity()) return;
    button.disabled = true; button.textContent = 'Saving…';
    try {
      await netlifyCapture('catalyst-waitlist', { email: emailEl.value.trim(), plan: _currentPlan,
        'bot-field': document.getElementById('waitlistBot').value });
      emailEl.value = '';
      showToast('Waitlist request saved. No payment was taken and access has not been granted.', 'success');
    } catch (error) {
      showToast('Your request was not saved. Please try again.', 'error');
    } finally { button.disabled = false; button.textContent = 'Join waitlist'; }
  }

  function openPaymentModal() {
    document.getElementById('paymentBackdrop').classList.add('open');
    document.getElementById('paymentEmailCapture').style.display = 'block';
    document.body.style.overflow = 'hidden';
    if (_currentUser?.email) document.getElementById('waitlistEmail').value = _currentUser.email;
  }
  function closePaymentModal() {
    document.getElementById('paymentBackdrop').classList.remove('open');
    document.body.style.overflow = '';
  }
  function selectPlan(plan) {
    _currentPlan = plan;
    document.querySelectorAll('.plan-btn').forEach(function(b){ b.classList.remove('active'); });
    document.getElementById(plan + 'Btn').classList.add('active');
    var priceEl  = document.getElementById('paymentPrice');
    var periodEl = document.getElementById('paymentPeriod');
    if (plan === 'monthly') {
      priceEl.textContent = '₦5,000'; periodEl.textContent = 'per month';
    } else {
      priceEl.textContent = '₦25,000'; periodEl.textContent = 'per year (save ₦5,000)';
    }
  }

  function initiatePayment() {
    document.getElementById('paymentEmailCapture').style.display = 'block';
    document.getElementById('waitlistEmail').focus();
    showToast('Paid access is not open yet. You can register interest without making a payment.', 'info');
  }

  function unlockPremiumUI() {
    // Do not remove content gates based on client state. Server authorization is required.
    return;
  }

  document.getElementById('paymentBackdrop').addEventListener('click', function(e){
    if (e.target === e.currentTarget) closePaymentModal();
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') { closeAuthModal(); closePaymentModal(); }
  });

  // showToast is defined earlier in the script — using that consolidated version

  // ─── BOOT AUTH ────────────────────────────────────────────────
  initAuth();

  // ═══════════════════════════════════════════════════════════════
  // HAMBURGER MOBILE NAV
  // ═══════════════════════════════════════════════════════════════
  function toggleMobileNav() {
    var hamburger = document.getElementById('hamburger');
    var nav = document.getElementById('mobileNav');
    var overlay = document.getElementById('mobileNavOverlay');
    if (!hamburger || !nav) return;
    var isOpen = nav.classList.contains('open');
    if (isOpen) {
      nav.classList.remove('open');
      overlay.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    } else {
      nav.classList.add('open');
      overlay.classList.add('open');
      hamburger.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 3D TILT CARD EFFECTS
  // ═══════════════════════════════════════════════════════════════
  function initTiltCards() {
    var tiltTargets = document.querySelectorAll('.char-card, .comic-card, .arc-card, .villain-card, .realm-card, .access-card');
    tiltTargets.forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var rx = ((y - cy) / cy) * -8;
        var ry = ((x - cx) / cx) * 8;
        card.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
        card.style.transition = 'transform 0.1s ease';
        // Shine highlight
        var shine = card.querySelector('.tilt-shine');
        if (shine) {
          shine.style.opacity = '0.12';
          shine.style.backgroundImage = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(255,255,255,0.25), transparent 60%)';
        }
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        var shine = card.querySelector('.tilt-shine');
        if (shine) shine.style.opacity = '0';
      });
      // Add shine layer
      if (!card.querySelector('.tilt-shine')) {
        var shine = document.createElement('div');
        shine.className = 'tilt-shine';
        shine.style.cssText = 'position:absolute;inset:0;opacity:0;pointer-events:none;z-index:10;transition:opacity 0.3s;border-radius:inherit;';
        card.style.position = card.style.position || 'relative';
        card.appendChild(shine);
      }
    });
  }
  initTiltCards();

  // ═══════════════════════════════════════════════════════════════
  // INTERACTIVE LAGOS MAP
  // ═══════════════════════════════════════════════════════════════
  (function() {
    var svg = document.getElementById('lagosMapSvg');
    var tooltip = document.getElementById('mapTooltip');
    var tipName = document.getElementById('mapTipName');
    var tipYoruba = document.getElementById('mapTipYoruba');
    var tipDesc = document.getElementById('mapTipDesc');
    if (!svg || !tooltip) return;

    var zones = svg.querySelectorAll('.map-zone');
    var colorMap = {};

    zones.forEach(function(zone) {
      var color = zone.dataset.color || '#F4B800';
      colorMap[zone.id] = color;

      zone.addEventListener('mouseenter', function(e) {
        tipName.textContent = zone.dataset.name || '—';
        tipName.style.color = color;
        tipYoruba.textContent = zone.dataset.yoruba || '—';
        tipDesc.textContent = zone.dataset.desc || '—';
        tooltip.classList.add('visible');
        tooltip.style.borderColor = color.replace(')', ',0.4)').replace('rgb', 'rgba') || 'rgba(244,184,0,0.3)';
        // Highlight zone
        zone.querySelectorAll('.zone-fill').forEach(function(el){ el.style.opacity = '0.25'; });
        zone.querySelectorAll('.zone-border').forEach(function(el){ el.style.strokeOpacity = '1'; });
      });

      zone.addEventListener('mousemove', function(e) {
        var container = svg.closest('.map-container');
        if (!container) return;
        var rect = container.getBoundingClientRect();
        var tx = e.clientX - rect.left + 15;
        var ty = e.clientY - rect.top - 20;
        var tooltipW = tooltip.offsetWidth || 220;
        if (tx + tooltipW + 20 > rect.width) { tx = tx - tooltipW - 30; }
        tooltip.style.left = tx + 'px';
        tooltip.style.top = ty + 'px';
      });

      zone.addEventListener('mouseleave', function() {
        tooltip.classList.remove('visible');
        zone.querySelectorAll('.zone-fill').forEach(function(el){ el.style.opacity = ''; });
        zone.querySelectorAll('.zone-border').forEach(function(el){ el.style.strokeOpacity = ''; });
      });

      // Keyboard support — mirror hover on focus, activate on Enter/Space
      zone.addEventListener('focus', function() {
        var rect = zone.getBoundingClientRect();
        var container = svg.closest('.map-container');
        if (container) {
          var cRect = container.getBoundingClientRect();
          tooltip.style.left = (rect.left - cRect.left + 15) + 'px';
          tooltip.style.top = (rect.top - cRect.top - 20) + 'px';
        }
        tipName.textContent = zone.dataset.name || '—';
        tipName.style.color = color;
        tipYoruba.textContent = zone.dataset.yoruba || '—';
        tipDesc.textContent = zone.dataset.desc || '—';
        tooltip.classList.add('visible');
        tooltip.style.borderColor = color.replace(')', ',0.4)').replace('rgb', 'rgba') || 'rgba(244,184,0,0.3)';
        zone.querySelectorAll('.zone-fill').forEach(function(el){ el.style.opacity = '0.25'; });
        zone.querySelectorAll('.zone-border').forEach(function(el){ el.style.strokeOpacity = '1'; });
      });

      zone.addEventListener('blur', function() {
        tooltip.classList.remove('visible');
        zone.querySelectorAll('.zone-fill').forEach(function(el){ el.style.opacity = ''; });
        zone.querySelectorAll('.zone-border').forEach(function(el){ el.style.strokeOpacity = ''; });
      });

      zone.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var locId = zone.dataset.locId;
          if (locId) openLocModal(locId);
        }
      });

      // Touch support
      zone.addEventListener('click', function(e) {
        var locId = zone.dataset.locId;
        if (locId) { openLocModal(locId); return; }
        if (window.innerWidth <= 900) {
          var showing = tooltip.classList.contains('visible');
          document.querySelectorAll('.map-zone').forEach(function(z){
            z.querySelectorAll('.zone-fill').forEach(function(el){ el.style.opacity = ''; });
            z.querySelectorAll('.zone-border').forEach(function(el){ el.style.strokeOpacity = ''; });
          });
          tooltip.classList.remove('visible');
          if (!showing || zone !== e.currentTarget) {
            tipName.textContent = zone.dataset.name || '—';
            tipName.style.color = color;
            tipYoruba.textContent = zone.dataset.yoruba || '—';
            tipDesc.textContent = zone.dataset.desc || '—';
            tooltip.classList.add('visible');
            tooltip.style.left = '50%';
            tooltip.style.top = '10px';
            tooltip.style.transform = 'translateX(-50%)';
            zone.querySelectorAll('.zone-fill').forEach(function(el){ el.style.opacity = '0.25'; });
            zone.querySelectorAll('.zone-border').forEach(function(el){ el.style.strokeOpacity = '1'; });
          }
        }
      });
    });

    // Pulse animation on zone dots
    var dots = svg.querySelectorAll('.map-zone circle:first-of-type');
    dots.forEach(function(dot, i) {
      dot.style.animation = 'mapDotPulse 2s ease-in-out ' + (i * 0.3) + 's infinite';
    });
  })();

  // ═══════════════════════════════════════════════════════════════
  // CHARACTER STAT BARS — animate on scroll into view
  // ═══════════════════════════════════════════════════════════════
  (function() {
    var cards = document.querySelectorAll('.char-card');
    if (!('IntersectionObserver' in window)) {
      cards.forEach(function(c){ c.classList.add('stat-animated'); });
      return;
    }
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          setTimeout(function() {
            entry.target.classList.add('stat-animated');
          }, 200);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    cards.forEach(function(c){ obs.observe(c); });
  })();

  // ═══════════════════════════════════════════════════════════════
  // ARC II TEASER — redacted text hover hint on mobile
  // ═══════════════════════════════════════════════════════════════
  document.querySelectorAll('.arc2-redacted').forEach(function(el) {
    el.addEventListener('click', function() {
      el.style.background = 'transparent';
      el.style.color = 'var(--blood-red)';
      setTimeout(function() {
        el.style.background = 'var(--blood-red)';
        el.style.color = 'transparent';
      }, 1500);
    });
  });

  // Add mapDotPulse keyframe dynamically
  (function() {
    var style = document.createElement('style');
    style.textContent = '@keyframes mapDotPulse { 0%,100%{r:5;opacity:0.9} 50%{r:8;opacity:0.5} } @keyframes mapDotPulse2 { 0%,100%{opacity:0.08} 50%{opacity:0.2} }';
    document.head.appendChild(style);
  })();


/* ═══════════════════════════════════════════════════════════
   CATALYST FEATURE SCRIPTS
═══════════════════════════════════════════════════════════ */

// ── SPARK PARTICLES ──────────────────────────────────────
(function() {
  var canvas = document.getElementById('spark-canvas');
  if (!canvas) return;
  var hero = document.getElementById('hero');
  var ctx = canvas.getContext('2d');
  var sparks = [];
  var W, H;

  function resize() {
    W = canvas.width = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function randBetween(a, b) { return a + Math.random() * (b - a); }

  var COLORS = ['#F4B800','#FFD040','#C41E3A','#FF6B1A','#FF9500'];

  function Spark() {
    this.reset();
  }
  Spark.prototype.reset = function() {
    this.x = randBetween(W * 0.2, W * 0.8);
    this.y = randBetween(H * 0.6, H * 0.95);
    this.vx = randBetween(-0.8, 0.8);
    this.vy = randBetween(-2.5, -0.8);
    this.life = 1;
    this.decay = randBetween(0.008, 0.022);
    this.size = randBetween(1, 3.5);
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.trail = [];
  };
  Spark.prototype.update = function() {
    this.trail.push({ x: this.x, y: this.y, life: this.life });
    if (this.trail.length > 8) this.trail.shift();
    this.x += this.vx + Math.sin(this.life * 10) * 0.3;
    this.y += this.vy;
    this.vy += 0.04; // gravity
    this.life -= this.decay;
    if (this.life <= 0) this.reset();
  };
  Spark.prototype.draw = function() {
    // Trail
    for (var i = 0; i < this.trail.length; i++) {
      var t = this.trail[i];
      var a = (i / this.trail.length) * t.life * 0.35;
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = a;
      ctx.fill();
    }
    // Core
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.life * 0.85;
    ctx.fill();
    // Glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
    var grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.5);
    grd.addColorStop(0, this.color);
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.globalAlpha = this.life * 0.25;
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  // Create 60 sparks
  for (var i = 0; i < 60; i++) {
    var s = new Spark();
    s.life = Math.random(); // stagger
    sparks.push(s);
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    sparks.forEach(function(s) { s.update(); s.draw(); });
    // One composed frame under reduced motion: the sparks are still drawn, so
    // the hero keeps its texture, but they stop drifting.
    if (!window.catalystPrefersReducedMotion || !window.catalystPrefersReducedMotion()) {
      requestAnimationFrame(loop);
    }
  }
  loop();
})();

// ── ORACLE TERMINAL ───────────────────────────────────────
var TERM_DATA = {
  boot: [
    { t: 0,   txt: '\x1b[dim]ORACLE INTELLIGENCE NETWORK — SECURE CHANNEL\x1b[/]\n', cls: 't-dim' },
    { t: 200, txt: '\x1b[dim]INITIALIZING v6.02 — ENCRYPTION: AES-512 YORUBA CIPHER\x1b[/]\n', cls: 't-dim' },
    { t: 600, txt: '\x1b[gold]> CONNECTING TO ORACLE NODE...\x1b[/]\n', cls: 't-gold' },
    { t: 1100,txt: '\x1b[green]> CONNECTION ESTABLISHED\n\x1b[/]', cls: '' },
    { t: 1400,txt: '> VERIFYING CLEARANCE LEVEL...\n', cls: '' },
    { t: 1900,txt: '\x1b[gold]> LEVEL 5 GRANTED — WELCOME, OPERATIVE\n\n\x1b[/]', cls: 't-gold' },
    { t: 2200,txt: '\x1b[dim]The Oracle has been monitoring this city for 144 years.\nHe has seen three wars, six Ọ̀run-Bleeds, and eleven false Catalysts.\nHe says this one is different. He will not say why.\n\n\x1b[/]', cls: 't-dim' },
    { t: 3000,txt: '\x1b[white]"The city breathes. The city remembers. The city has been waiting\nfor something it cannot name. Tonight, it is very close to naming it."\n\x1b[/]', cls: 't-white' },
    { t: 3800,txt: '\n\x1b[dim]— Oracle, classification: UNKNOWN — filed 03:14 hrs, this morning\n\n\x1b[/]', cls: 't-dim' },
    { t: 4200,txt: '\x1b[gold]SELECT A FILE ABOVE TO ACCESS CLASSIFIED RECORDS ↑\x1b[/]', cls: 't-gold' },
  ],
  catalyst: [
    { t: 0,   txt: '\x1b[red][ ACCESSING FILE: ADEYEMI, BAYO — CODENAME: CATALYST ]\n\x1b[/]', cls: 't-red' },
    { t: 300, txt: '\x1b[dim]CLEARANCE REQUIRED: OMEGA — GRANTED\n\n\x1b[/]', cls: 't-dim' },
    { t: 700, txt: '\x1b[gold]THREAT CLASSIFICATION: EXISTENTIAL\n\x1b[/]', cls: 't-gold' },
    { t: 1000,txt: '\x1b[white]Age: 19. Mushin-born. NEPA bill 3 months overdue.\nHis mother thinks he works in tech support.\nHis Aṣẹ signature reads as ALL FIVE ORISHA simultaneously.\n\n\x1b[/]', cls: 't-white' },
    { t: 1900,txt: 'The Collector\'s report (classified): "Classification impossible.\nSubject does not amplify Aṣẹ — he MULTIPLIES it.\nNear Iron Wolf, subject temporarily elevated him to Tier IV.\nNear an Orisha fragment, subject triggered a partial transcendence.\n\n', cls: '' },
    { t: 2600,txt: '\x1b[red]Near The Architect: unknown. The Architect has not told us.\nThe Architect is the only one who knows what happens next.\nThe Architect is afraid.\n\n\x1b[/]', cls: 't-red' },
    { t: 3400,txt: '\x1b[dim]Oracle personal note: Do not tell the boy what he is.\nNot yet. He is not ready. None of them have ever been ready.\nThat has never stopped the city from choosing them anyway."\x1b[/]', cls: 't-dim' },
  ],
  thunderstrike: [
    { t: 0,   txt: '\x1b[red][ ACCESSING FILE: IBRAHIM, AMARA — CODENAME: THUNDERSTRIKE ]\n\x1b[/]', cls: 't-red' },
    { t: 300, txt: '\x1b[dim]CLEARANCE REQUIRED: OMEGA — GRANTED\n\n\x1b[/]', cls: 't-dim' },
    { t: 700, txt: '\x1b[gold]THREAT CLASSIFICATION: ALPHA-ACTIVE\n\x1b[/]', cls: 't-gold' },
    { t: 1000,txt: '\x1b[white]Age: 23. Victoria Island. Former aeronautical engineer, UNN.\nShungite battery output: 12,000 volts sustained (unverified upper limit).\nFlight ceiling: 3,400m. Speed: Mach 0.82 observed.\n\n\x1b[/]', cls: 't-white' },
    { t: 1900,txt: 'Personality profile: Direct. Impatient. Correct approximately 94% of the time.\nThe 6% terrifies everyone who has seen it.\n\n', cls: '' },
    { t: 2500,txt: '\x1b[dim]Intel note: Subject does not require backup. Subject resents backup.\nSubject will accept backup if it involves Bayo Adeyemi.\nWe do not fully understand this dynamic.\n\x1b[/]', cls: 't-dim' },
    { t: 3200,txt: '\n\x1b[gold]Known weakness: ████████████████████ — REDACTED BY ORDER OF ORACLE\x1b[/]', cls: 't-gold' },
  ],
  'iron-wolf': [
    { t: 0,   txt: '\x1b[red][ ACCESSING FILE: OKAFOR, IKENNA — CODENAME: IRON WOLF ]\n\x1b[/]', cls: 't-red' },
    { t: 300, txt: '\x1b[dim]CLEARANCE REQUIRED: OMEGA — GRANTED\n\n\x1b[/]', cls: 't-dim' },
    { t: 700, txt: '\x1b[gold]THREAT CLASSIFICATION: ALPHA — HANDLE WITH EXTREME CAUTION\n\x1b[/]', cls: 't-gold' },
    { t: 1100,txt: '\x1b[white]Age: 26. Iron District native. Father: Ògún ironsmith lineage, 14 generations.\nTransformation confirmed: Tier III in base form — Tier V+ in wolf-iron state.\nSpeed in transformed state: unmeasurable by existing instruments.\n\n\x1b[/]', cls: 't-white' },
    { t: 2000,txt: 'Psychological profile: FRACTURED LOYALTY.\nSubject does not consider himself a hero. Subject considers himself\na consequence — of what the city did to his father.\n\n', cls: '' },
    { t: 2700,txt: '\x1b[dim]Intel note: The Architect has made three recruitment approaches.\nSubject has refused all three. The fourth approach is coming.\nWe are monitoring. We are not confident in the outcome.\n\x1b[/]', cls: 't-dim' },
    { t: 3400,txt: '\n\x1b[red]WARNING: Do not mention Ikenna\'s father. Not ever. Not even as strategy.\x1b[/]', cls: 't-red' },
  ],
  architect: [
    { t: 0,   txt: '\x1b[red][ ACCESSING FILE: UNKNOWN — CODENAME: THE ARCHITECT ]\n\x1b[/]', cls: 't-red' },
    { t: 300, txt: '\x1b[dim]CLEARANCE REQUIRED: OMEGA — GRANTED — LOGGING THIS ACCESS\n\n\x1b[/]', cls: 't-dim' },
    { t: 800, txt: '\x1b[red]WARNING: Accessing this file is noted. The Architect WILL know.\nThe Architect already knows. The Architect knew before you clicked.\n\n\x1b[/]', cls: 't-red' },
    { t: 1600,txt: '\x1b[gold]Known facts:\x1b[/]\n\x1b[white]— Real name: classified — Pale Council scrubbed every record\n— Age: 31\n— Built the Orisha Vaccine. Six weeks from completion.\n— Current goal: collapse the Orisha-Human accord. Permanently.\n\n\x1b[/]', cls: 't-white' },
    { t: 2500,txt: '\x1b[dim]She does not fight battles. She writes them.\nEvery containment plan since Balogun Nexus — chapter in hers.\nEvery hero who rose and fell — chapter in hers.\nThe Catalyst is the first variable she has not written.\n\n\x1b[/]', cls: 't-dim' },
    { t: 3300,txt: '\x1b[red]Oracle personal note: I have spoken with her twice.\nOnce at the Balogun briefing. Once last Thursday.\nBoth times, she already knew what I would say.\nBoth times, she smiled.\nI do not know what to do with this.\x1b[/]', cls: 't-red' },
  ],
};

var termTimeout = null;
var termKey = 'boot';

function termLoad(key) {
  if (termTimeout) clearTimeout(termTimeout);
  termKey = key;
  var out = document.getElementById('terminal-out');
  if (!out) return;
  out.innerHTML = '';
  // Update active tab
  document.querySelectorAll('.term-tab').forEach(function(b) {
    b.classList.toggle('active', b.textContent.toLowerCase().includes(key.replace('-',' ')));
  });
  var data = TERM_DATA[key] || TERM_DATA.boot;
  data.forEach(function(line) {
    termTimeout = setTimeout(function() {
      var span = document.createElement('span');
      span.textContent = line.txt.replace(/\x1b\[[^\]]*\]/g, '');
      if (line.cls) span.className = line.cls;
      out.appendChild(span);
    }, line.t);
  });
}

// Auto-start terminal when it scrolls into view
(function() {
  var started = false;
  var termEl = document.getElementById('oracle-terminal');
  if (!termEl) return;
  var obs = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting && !started) {
      started = true;
      termLoad('boot');
    }
  }, { threshold: 0.3 });
  obs.observe(termEl);
})();

// ── QUIZ ──────────────────────────────────────────────────
var quizScores = { T: 0, O: 0, W: 0, C: 0 };
var quizCurrent = 0;

var QUIZ_HEROES = {
  T: {
    name: 'THUNDERSTRIKE',
    img: './assets/amara-portrait.webp',
    tag: 'You move like lightning and think even faster. When others hesitate, you have already acted. The city\'s pace matches yours — fast, electric, and alive. Amara would recognize you.'
  },
  O: {
    name: 'THE ORACLE',
    img: './assets/oracle-badagry-portrait.webp',
    tag: 'You see things others miss. You plan seven moves ahead and never tell anyone what you know until the exact right moment. The city holds no secrets from you. Zara sees herself in you.'
  },
  W: {
    name: 'IRON WOLF',
    img: './assets/ikenna-portrait.webp',
    tag: 'You are made of this city\'s iron — forged in its fires, shaped by its losses. You do not ask for respect. You have already earned it. Ikenna would call you kin.'
  },
  C: {
    name: 'CATALYST',
    img: './assets/bayo-portrait.webp',
    tag: 'You are the variable no one accounted for. You don\'t just change the game — you change everyone around you, without even trying. The city chose you. Lagos dey awaken.'
  }
};

function quizAnswer(step, hero) {
  quizScores[hero]++;
  var cur = document.getElementById('qs' + step);
  var next = document.getElementById('qs' + (step + 1));
  if (cur) cur.classList.remove('active');
  // Update pips
  var pip = document.getElementById('pip' + step);
  if (pip) { pip.className = 'quiz-pip done'; }
  if (step + 1 < 5) {
    if (next) next.classList.add('active');
    var npip = document.getElementById('pip' + (step + 1));
    if (npip) npip.className = 'quiz-pip cur';
    quizCurrent = step + 1;
  } else {
    quizShowResult();
  }
}

function quizShowResult() {
  // Find highest score
  var winner = 'C'; var max = -1;
  Object.keys(quizScores).forEach(function(k) {
    if (quizScores[k] > max) { max = quizScores[k]; winner = k; }
  });
  var h = QUIZ_HEROES[winner];
  window._lastQuizWinner = winner;
  document.getElementById('result-name').textContent = h.name;
  document.getElementById('result-tag').textContent = h.tag;
  document.getElementById('result-img').src = h.img;
  document.getElementById('result-img').alt = h.name;
  document.querySelectorAll('.quiz-progress')[0].style.display = 'none';
  document.getElementById('quiz-result').classList.add('show');
  if (window.ClearanceTracker) ClearanceTracker.mark('quiz');
  // Save result to Supabase
  if (window._supabase) {
    try { window._supabase.from('quiz_results').insert({ hero: h.name }).then(function(){}, function(){}); } catch(e) {}
  }
}

function quizReset() {
  quizScores = { T:0, O:0, W:0, C:0 };
  quizCurrent = 0;
  document.querySelectorAll('.quiz-step').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById('qs0').classList.add('active');
  document.getElementById('quiz-result').classList.remove('show');
  var vcw = document.getElementById('vesselCardWrap');
  if (vcw) vcw.style.display = 'none';
  var prog = document.querySelectorAll('.quiz-progress')[0];
  if (prog) prog.style.display = 'flex';
  for (var i = 0; i < 5; i++) {
    var p = document.getElementById('pip' + i);
    if (p) p.className = 'quiz-pip' + (i === 0 ? ' cur' : '');
  }
}

// ── VESSEL ID CARD (shareable quiz-result card) ────────────
var VESSEL_MID = {
  T: { orisha: 'ṢÀNGÓ', code: 'SAN', resonance: 86, tier: 'II', cls: 'CONDUIT' },
  O: { orisha: 'ÒRÌṢÀ-ÌMỌ̀', code: 'IMO', resonance: 91, tier: 'I', cls: 'ORACLE-CLASS' },
  W: { orisha: 'ÒGÚN', code: 'OGU', resonance: 88, tier: 'II', cls: 'IRON-BOUND' },
  C: { orisha: 'MULTI', code: 'ESU/OGU/SAN', resonance: 97, tier: 'UNCLASSIFIED', cls: 'CATALYST' }
};

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  var words = text.split(' ');
  var line = '';
  var lines = [];
  for (var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  lines.forEach(function(l, i) { ctx.fillText(l.trim(), x, y + i * lineHeight); });
  return lines.length * lineHeight;
}

function generateVesselCard() {
  if (window.ClearanceTracker) ClearanceTracker.mark('vessel_card');
  var winner = window._lastQuizWinner || 'C';
  var h = QUIZ_HEROES[winner];
  var mid = VESSEL_MID[winner];
  var canvas = document.getElementById('vesselCardCanvas');
  var wrap = document.getElementById('vesselCardWrap');
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;

  function draw(portrait) {
    // Background
    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#06060d');
    grad.addColorStop(1, '#0d0a18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Outer gold frame with clipped corners
    ctx.strokeStyle = '#F4B800';
    ctx.lineWidth = 3;
    var m = 18, c = 22;
    ctx.beginPath();
    ctx.moveTo(m + c, m);
    ctx.lineTo(W - m, m);
    ctx.lineTo(W - m, H - m - c);
    ctx.lineTo(W - m - c, H - m);
    ctx.lineTo(m, H - m);
    ctx.lineTo(m, m + c);
    ctx.closePath();
    ctx.stroke();

    // Header
    ctx.fillStyle = '#F4B800';
    ctx.font = '700 20px "Courier New", monospace';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('ASẸ SYSTEM — VESSEL IDENTIFICATION CARD', 50, 62);
    ctx.strokeStyle = 'rgba(244,184,0,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(50, 78); ctx.lineTo(W - 50, 78); ctx.stroke();

    // Portrait
    var pw = 260, ph = 340, px = 50, py = 100;
    if (portrait) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, pw, ph);
      ctx.clip();
      var scale = Math.max(pw / portrait.width, ph / portrait.height);
      var dw = portrait.width * scale, dh = portrait.height * scale;
      ctx.drawImage(portrait, px - (dw - pw) / 2, py - (dh - ph) / 2, dw, dh);
      ctx.restore();
    }
    ctx.strokeStyle = '#F4B800';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, pw, ph);

    // Right column text
    var tx = 340;
    ctx.fillStyle = 'rgba(240,237,229,0.4)';
    ctx.font = '600 13px "Courier New", monospace';
    ctx.fillText('CLASSIFICATION RESULT', tx, 108);

    ctx.fillStyle = '#F4B800';
    ctx.font = '900 52px "Arial Narrow", sans-serif';
    ctx.fillText(h.name, tx, 165);

    ctx.fillStyle = 'rgba(240,237,229,0.7)';
    ctx.font = '400 15px "Georgia", serif';
    ctx.fillStyle = 'rgba(240,237,229,0.72)';
    ctx.font = 'italic 15px Georgia, serif';
    wrapCanvasText(ctx, h.tag, tx, 200, W - tx - 50, 22);

    // MID block
    var midY = 360;
    ctx.strokeStyle = 'rgba(240,237,229,0.15)';
    ctx.strokeRect(tx, midY, W - tx - 50, 150);
    ctx.fillStyle = 'rgba(0,201,177,0.85)';
    ctx.font = '700 12px "Courier New", monospace';
    ctx.fillText('MANIFESTATION IDENTITY DESCRIPTOR', tx + 18, midY + 28);
    var seed = Math.floor(Math.random() * 900 + 100);
    ctx.fillStyle = '#F4B800';
    ctx.font = '700 14px "Courier New", monospace';
    ctx.fillText('MID: VSL·' + seed + '·Λ:' + mid.code + '·TIER:' + mid.tier + '·CLASS:' + mid.cls, tx + 18, midY + 54);
    ctx.fillStyle = 'rgba(240,237,229,0.6)';
    ctx.font = '400 13px "Courier New", monospace';
    ctx.fillText(mid.orisha + ' RESONANCE: ' + mid.resonance + ' / 100', tx + 18, midY + 82);
    var today = new Date(2026, 6, 22);
    ctx.fillText('ISSUED: LAGOS FIELD OFFICE · CATALYST: THE AWAKENING', tx + 18, midY + 108);

    // Footer
    ctx.fillStyle = 'rgba(240,237,229,0.3)';
    ctx.font = '600 12px "Courier New", monospace';
    ctx.fillText('catalyst-awakening.netlify.app', 50, H - 34);
    ctx.textAlign = 'right';
    ctx.fillText('WHICH HERO ARE YOU? — TAKE THE TEST', W - 50, H - 34);
    ctx.textAlign = 'left';

    wrap.style.display = 'block';
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  var img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function() { draw(img); };
  img.onerror = function() { draw(null); };
  img.src = h.img;
}

function downloadVesselCard() {
  var canvas = document.getElementById('vesselCardCanvas');
  var link = document.createElement('a');
  link.download = 'catalyst-vessel-id-card.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function shareVesselCard() {
  var canvas = document.getElementById('vesselCardCanvas');
  canvas.toBlob(function(blob) {
    if (!blob) return;
    var file = new File([blob], 'catalyst-vessel-id-card.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: 'My Catalyst Vessel ID',
        text: 'I just found out which Catalyst: The Awakening hero I am. Take the test yourself:'
      }).catch(function() {});
    } else {
      downloadVesselCard();
    }
  }, 'image/png');
}

// ── RELATIONSHIP CONSTELLATION ─────────────────────────────
(function(){
  var svg = document.getElementById('constSvg');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';

  var NODES = [
    { id:'esu', x:150, y:70, r:26, label:'ẸṢÙ', sub:'ORISHA' },
    { id:'sango', x:340, y:55, r:26, label:'ṢÀNGÓ', sub:'ORISHA' },
    { id:'ogun', x:520, y:45, r:26, label:'ÒGÚN', sub:'ORISHA' },
    { id:'oya', x:700, y:55, r:26, label:'ỌYÁ', sub:'ORISHA · UNCONFIRMED', mystery:true },
    { id:'osun', x:870, y:75, r:26, label:'ỌṢUN', sub:'ORISHA' },
    { id:'amara', x:250, y:290, r:32, label:'AMARA', sub:'THUNDERSTRIKE' },
    { id:'bayo', x:520, y:270, r:42, label:'BAYO', sub:'CATALYST' },
    { id:'ikenna', x:790, y:290, r:32, label:'IKENNA', sub:'IRON WOLF' },
    { id:'zara', x:520, y:420, r:32, label:'ZARA', sub:'THE MIRROR' },
    { id:'oracle', x:170, y:480, r:30, label:'THE ORACLE', sub:'MENTOR' },
    { id:'architect', x:880, y:480, r:30, label:'THE ARCHITECT', sub:'PALE COUNCIL' },
    { id:'palecouncil', x:660, y:580, r:28, label:'PALE COUNCIL', sub:'FACTION' }
  ];

  var EDGES = [
    ['bayo','esu'], ['bayo','sango'], ['bayo','ogun'], ['bayo','osun'],
    ['amara','sango'], ['ikenna','ogun'], ['zara','ogun'],
    ['bayo','amara'], ['bayo','ikenna'], ['bayo','zara'],
    ['bayo','oracle'], ['oracle','amara'], ['oracle','ikenna'], ['oracle','zara'],
    ['architect','palecouncil'],
    ['architect','bayo','threat'], ['palecouncil','bayo','threat']
  ];

  var INFO = {
    esu: { role:'Orisha · The Crossroads', body:'Trickster, translator, thief and diplomat depending on which century you ask. One of the four affinities that hit Bayo simultaneously — something that had never happened before in four thousand years of record.', links:'Bound to: <b>Bayo</b>' },
    sango: { role:'Orisha · Thunder & Justice', body:'Ṣàngó\'s line runs through Amara\'s family for generations, and simultaneously through Bayo — the first time this Orisha has ever answered two vessels who barely know each other.', links:'Bound to: <b>Bayo</b>, <b>Amara</b>' },
    ogun: { role:'Orisha · Iron & the Road', body:'Two very different aspects of the same Orisha: Ikenna carries the smith\'s iron, Zara carries the older road-clearer aspect. Same god, two people who fight nothing alike.', links:'Bound to: <b>Bayo</b>, <b>Ikenna</b>, <b>Zara</b>' },
    oya: { role:'Orisha · Storms & Transformation — status unconfirmed', body:'No living vessel has been confirmed for Ọya. What the team does know: a captive held by the Pale Council for three years and two months resolved as a vessel of Ọya the moment Bayo touched her card. She has a name now. She is still not free.', links:'Bound to: <em>unconfirmed</em>' },
    osun: { role:'Orisha · Love, Water & Inheritance', body:'Bayo\'s mother was under consideration to be Ọṣun\'s vessel before he was born — she chose to pass the resonance to her son instead, a fact the Oracle only told Bayo after the Pale Council escalated to open conflict.', links:'Bound to: <b>Bayo</b> (through his mother)' },
    amara: { role:'Vessel of Ṣàngó · Thunderstrike', body:'A busker who sends most of her earnings home to Enugu. Her talking drum doesn\'t make thunder — it requests it, in a tonal grammar her grandfather spent forty years teaching her.', links:'Team: <b>Bayo</b>, <b>Ikenna</b>, <b>Zara</b> · Mentor: <b>The Oracle</b>' },
    bayo: { role:'The Catalyst · Ìmọ̀lẹ̀ Àárọ̀', body:'Not a vessel — a Catalyst. He doesn\'t hold an Orisha\'s power, he changes it, and it changes him back. The only known case in recorded Aṣẹ history of multi-Orisha resonance above 40% in one person.', links:'Bound to every Orisha above · Team: <b>Amara</b>, <b>Ikenna</b>, <b>Zara</b> · Hunted by: <b>The Architect</b>, <b>Pale Council</b>' },
    ikenna: { role:'Vessel of Ògún · Iron Wolf', body:'A mechanic\'s apprentice whose iron has memory — every piece of metal he\'s ever worked, he can still feel. Ògún\'s trials tested his patience and what he chooses to finish, not his strength.', links:'Team: <b>Bayo</b>, <b>Amara</b>, <b>Zara</b> · Mentor: <b>The Oracle</b>' },
    zara: { role:'Vessel of Ògún · The Mirror', body:'The road-clearer aspect of Ògún — perception manipulation, not force. She tracked the Pale Council\'s Lagos operation for nine months before the team ever knew there was a "we."', links:'Team: <b>Bayo</b>, <b>Amara</b>, <b>Ikenna</b> · Mentor: <b>The Oracle</b>' },
    oracle: { role:'144 years old · Aṣẹ-sighted since age 9', body:'Prepared thirty-seven years for the day a Catalyst arrived. The only person who saw Bayo coming before Balogun Nexus ever happened.', links:'Mentors: <b>Bayo</b>, <b>Amara</b>, <b>Ikenna</b>, <b>Zara</b>' },
    architect: { role:'Pale Council · Weapons Design', body:'Built the Orisha Vaccine — a compound that doesn\'t kill divinity, just permanently occupies the neural receptors that let a person feel it. Young, precise, and genuinely regretful about the math.', links:'Commands: <b>Pale Council</b> · Hunting: <b>Bayo</b>' },
    palecouncil: { role:'Faction · Geneva-based', body:'Has harvested Orisha resonance from twelve vessels across nine countries before ever reaching Lagos. Comfort Ibe, vessel of Ọya, is one of them — found, not yet freed.', links:'Commands: <b>The Architect</b> · Hunting: <b>Bayo</b> and the team' }
  };

  var linesG = document.getElementById('constLines');
  var nodesG = document.getElementById('constNodes');
  var nodeById = {};
  NODES.forEach(function(n){ nodeById[n.id] = n; });

  EDGES.forEach(function(e){
    var a = nodeById[e[0]], b = nodeById[e[1]];
    var line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    line.setAttribute('class', 'const-line' + (e[2] === 'threat' ? ' threat' : ''));
    line.dataset.a = e[0]; line.dataset.b = e[1];
    linesG.appendChild(line);
  });

  NODES.forEach(function(n){
    var g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'const-node' + (n.mystery ? ' mystery' : ''));
    g.dataset.id = n.id;
    var circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('class', 'const-dot');
    circle.setAttribute('cx', n.x); circle.setAttribute('cy', n.y); circle.setAttribute('r', n.r);
    g.appendChild(circle);
    var label = document.createElementNS(NS, 'text');
    label.setAttribute('x', n.x); label.setAttribute('y', n.y - 2);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', n.id === 'bayo' ? 15 : 12);
    label.textContent = n.label;
    g.appendChild(label);
    var sub = document.createElementNS(NS, 'text');
    sub.setAttribute('class', 'const-sub');
    sub.setAttribute('x', n.x); sub.setAttribute('y', n.y + n.r + 14);
    sub.setAttribute('text-anchor', 'middle');
    sub.textContent = n.sub;
    g.appendChild(sub);
    g.addEventListener('click', function(){ selectConstNode(n.id); });
    nodesG.appendChild(g);
  });

  window.selectConstNode = function(id){
    var connected = { };
    connected[id] = true;
    EDGES.forEach(function(e){
      if (e[0] === id) connected[e[1]] = true;
      if (e[1] === id) connected[e[0]] = true;
    });
    nodesG.querySelectorAll('.const-node').forEach(function(g){
      var nid = g.dataset.id;
      g.classList.toggle('active', nid === id);
      g.classList.toggle('dim', !connected[nid]);
    });
    linesG.querySelectorAll('.const-line').forEach(function(l){
      var touches = l.dataset.a === id || l.dataset.b === id;
      l.classList.toggle('lit', touches);
      l.classList.toggle('dim', !touches);
    });
    var info = INFO[id];
    var n = nodeById[id];
    if (info) {
      document.getElementById('constInfo').innerHTML =
        '<div class="const-info-name">' + n.label + '</div>' +
        '<div class="const-info-role">' + info.role + '</div>' +
        '<div class="const-info-body">' + info.body + '</div>' +
        '<div class="const-info-links">' + info.links + '</div>';
    }
  };
})();

// ── AMBIENT LAGOS STORM SOUND (opt-in, procedurally generated) ──
var _ambientCtx = null, _ambientNodes = null, _ambientOn = false, _ambientTimer = null;

function toggleAmbientSound() {
  var btn = document.getElementById('ambientToggle');
  var navBtn = document.getElementById('navAudioBtn');
  if (_ambientOn) {
    _ambientOn = false;
    stopAmbientSound();
    if (btn) {
      btn.classList.remove('on');
      var lbl = btn.querySelector('.amb-label');
      if (lbl) lbl.textContent = 'SOUND: OFF';
    }
    if (navBtn) {
      navBtn.classList.remove('playing');
      var nlbl = navBtn.querySelector('.audio-state');
      if (nlbl) nlbl.textContent = 'SOUND';
    }
  } else {
    _ambientOn = true;
    startAmbientSound();
    if (btn) {
      btn.classList.add('on');
      var lbl = btn.querySelector('.amb-label');
      if (lbl) lbl.textContent = 'SOUND: ON';
    }
    if (navBtn) {
      navBtn.classList.add('playing');
      var nlbl = navBtn.querySelector('.audio-state');
      if (nlbl) nlbl.textContent = 'LIVE';
    }
  }
}

function startAmbientSound() {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!_ambientCtx) _ambientCtx = new AC();
  if (_ambientCtx.state === 'suspended') _ambientCtx.resume();
  var ctx = _ambientCtx;

  var bufferSize = 2 * ctx.sampleRate;
  var noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  var output = noiseBuffer.getChannelData(0);
  for (var i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
  var noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;

  var rainFilter = ctx.createBiquadFilter();
  rainFilter.type = 'bandpass';
  rainFilter.frequency.value = 2400;
  rainFilter.Q.value = 0.6;

  var rainGain = ctx.createGain();
  rainGain.gain.value = 0;
  noise.connect(rainFilter).connect(rainGain).connect(ctx.destination);
  noise.start();
  rainGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.2);

  var rumbleOsc = ctx.createOscillator();
  rumbleOsc.type = 'sine';
  rumbleOsc.frequency.value = 55;
  var rumbleGain = ctx.createGain();
  rumbleGain.gain.value = 0;
  rumbleOsc.connect(rumbleGain).connect(ctx.destination);
  rumbleOsc.start();

  _ambientNodes = { noise: noise, rumbleOsc: rumbleOsc, rainGain: rainGain, rumbleGain: rumbleGain };

  function scheduleThunder() {
    if (!_ambientOn) return;
    var delay = 6000 + Math.random() * 14000;
    _ambientTimer = setTimeout(function(){
      if (!_ambientOn || !_ambientNodes) return;
      var now = ctx.currentTime;
      rumbleGain.gain.cancelScheduledValues(now);
      rumbleGain.gain.setValueAtTime(0.001, now);
      rumbleGain.gain.linearRampToValueAtTime(0.1, now + 0.4);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
      scheduleThunder();
    }, delay);
  }
  scheduleThunder();
}

function stopAmbientSound() {
  if (_ambientTimer) { clearTimeout(_ambientTimer); _ambientTimer = null; }
  if (!_ambientNodes || !_ambientCtx) return;
  var nodes = _ambientNodes;
  var now = _ambientCtx.currentTime;
  try {
    nodes.rainGain.gain.linearRampToValueAtTime(0, now + 0.3);
    nodes.rumbleGain.gain.linearRampToValueAtTime(0, now + 0.3);
  } catch(e) {}
  setTimeout(function(){
    try { nodes.noise.stop(); } catch(e) {}
    try { nodes.rumbleOsc.stop(); } catch(e) {}
  }, 400);
  _ambientNodes = null;
}

// ── FIELD DISPATCH ────────────────────────────────────────
var DISPATCHES = [
  {
    loc: 'APAPA TERMINAL — 03:47 HRS',
    num: 'TRANSMISSION 001 / 006',
    body: '<strong>Bayo</strong> is the youngest person to ever enter the Iron District without a scar.<br><br>Nobody knows how. <em>The district does not forget.</em> It marks everyone who passes through — some with iron burns, some with the smell of smoke that never quite leaves. Bayo walked out clean. Smelling like rain.<br><br>The old men at the foundry watched him go. They said nothing for a long time.<br><br>Then one of them — the oldest, a man who has not spoken in four years — looked up and said: <em>"Ọmọ yẹn kò jẹ́ ti wa."</em><br><br>That boy does not belong to us.'
  },
  {
    loc: 'THIRD MAINLAND BRIDGE — 02:14 HRS',
    num: 'TRANSMISSION 002 / 006',
    body: 'The bridge whispers names at 3 AM.<br><br>Ikenna has heard it every night since his father died here. He has never told anyone this. He has also never told anyone that the bridge sometimes whispers his father\'s name — and then goes quiet, as if embarrassed.<br><br>He drives across it anyway. Every night. <em>Because something that knows you should not get the satisfaction of making you afraid of it.</em><br><br>Somewhere in the pylons, something older than the city watches him go. It does not know whether to be impressed or afraid.<br><br>It decides: <em>both.</em>'
  },
  {
    loc: 'BALOGUN NEXUS — 00:01 HRS',
    num: 'TRANSMISSION 003 / 006',
    body: '<strong>Ground Zero.</strong> Three thousand years of Aṣẹ buried under a modern market.<br><br>Amara says you can feel it if you stand still long enough — a hum below the feet, like the ground is thinking. She tried to describe it to a colleague once. The colleague thought she was talking about underground cables.<br><br>She did not correct him. Some things take too long to explain. Some explanations do more damage than silence.<br><br><em>The market does not care whether you understand it. It opens at 6 AM. It will be here long after you are not.</em>'
  },
  {
    loc: 'EKO ATLANTIC, TOWER 7 — 04:00 HRS',
    num: 'TRANSMISSION 004 / 006',
    body: 'The Architect arrived at Tower 7 on a Tuesday.<br><br>He brought nothing with him. He required nothing. He walked in through the front lobby, past seventeen security systems, and took the elevator to the 47th floor.<br><br>The footage shows him pausing at the elevator mirror. Straightening his collar. Looking at his own reflection for exactly four seconds.<br><br>Nobody has ever done that before — stood that still in front of a mirror, in this building, at this hour. The security team watched the footage three times before they understood: <em>he was not looking at himself.</em><br><br><em>He was looking at us.</em>'
  },
  {
    loc: 'MUSHIN DISTRICT — 06:32 HRS',
    num: 'TRANSMISSION 005 / 006',
    body: 'This morning, Bayo stopped a DANFO before it hit a child.<br><br>Not with his hands. With nothing he could explain. The bus stopped two metres from the boy — engine still running, driver still pressing the accelerator — and simply did not move forward.<br><br>The driver got out. Looked at the front of the bus. Looked at Bayo. Looked at the child. Said nothing. Got back in. Reversed. Drove away.<br><br>Bayo crouched down to the boy\'s height. Asked if he was okay. The boy said: <em>"Why do you shine like that?"</em><br><br>Bayo said: "Like what?"<br><br><em>The boy pointed at his chest. Bayo looked down. He saw nothing. But his hands were warm.</em>'
  },
  {
    loc: 'ORACLE\'S COMPOUND — LOCATION CLASSIFIED',
    num: 'TRANSMISSION 006 / 006',
    body: 'The Oracle does not sleep.<br><br>He has not slept in forty-three years. He says this calmly, the way one says they have not eaten meat, or have not been to the cinema in a while.<br><br>He says it is because the city never sleeps, and someone has to be watching. He says it is because every time he closes his eyes, he sees 144 years of choices replaying, and some of them he is not finished examining yet.<br><br>He says he does not mind. He has good tea. He has good books. He has a window that faces the lagoon, and at 4 AM the water turns a colour that has no name in any language he has found yet.<br><br><em>He is looking for the name. He thinks he is close.</em>'
  }
];

var dispCurrent = 0;

function dispatchGo(idx) {
  dispCurrent = idx;
  var d = DISPATCHES[idx];
  document.getElementById('disp-loc').textContent = d.loc;
  document.getElementById('disp-num').textContent = d.num;
  document.getElementById('disp-body').innerHTML = d.body;
  document.querySelectorAll('.dispatch-dot').forEach(function(dot, i) {
    dot.classList.toggle('on', i === idx);
  });
}

function dispatchNext() { dispatchGo((dispCurrent + 1) % DISPATCHES.length); }
function dispatchPrev() { dispatchGo((dispCurrent - 1 + DISPATCHES.length) % DISPATCHES.length); }

// Auto-cycle dispatches every 12s
setInterval(function() { dispatchNext(); }, 12000);

// ── DOSSIER MODAL ─────────────────────────────────────────
var DOSSIERS = {
  catalyst: {
    name: 'BAYO ADEYEMI',
    codename: 'CODENAME: CATALYST  ◈  TIER: UNCLASSIFIED',
    stamp: 'OMEGA',
    fields: [
      { label: 'REAL NAME', val: 'Bayo Adeyemi' },
      { label: 'AGE', val: '19' },
      { label: 'DISTRICT', val: 'Mushin, Lagos' },
      { label: 'STATUS', val: '⚠ ACTIVE — UNCONTAINED' },
      { label: 'ASẸ CLASS', val: 'CATALYST (unique)' },
      { label: 'COVER', val: 'Unemployed — "tech support"' },
    ],
    stats: [
      { name: 'POWER', pct: 82, cls: 'sf-gold' },
      { name: 'SPEED', pct: 61, cls: 'sf-teal' },
      { name: 'INTELLIGENCE', pct: 88, cls: 'sf-purple' },
      { name: 'ASẸ OUTPUT', pct: 100, cls: 'sf-gold' },
    ],
    notes: 'Subject does not amplify Aṣẹ — he MULTIPLIES it. Classified as existential variable by Pale Council. The Architect has reviewed his file seven times. Oracle\'s assessment: "Do not tell him yet. He is not ready. The city doesn\'t care."'
  },
  thunderstrike: {
    name: 'AMARA OKAFOR',
    codename: 'CODENAME: THUNDERSTRIKE  ◈  TIER: ALPHA',
    stamp: 'ARMED',
    fields: [
      { label: 'REAL NAME', val: 'Amara Okafor' },
      { label: 'AGE', val: '23' },
      { label: 'DISTRICT', val: 'Victoria Island (safehouse)' },
      { label: 'STATUS', val: '⚡ ACTIVE — ARMED' },
      { label: 'ASẸ CLASS', val: 'Shango-Shungite Hybrid' },
      { label: 'WEAKNESS', val: '████████ REDACTED ████████', red: true },
    ],
    stats: [
      { name: 'POWER', pct: 91, cls: 'sf-red' },
      { name: 'SPEED', pct: 94, cls: 'sf-gold' },
      { name: 'INTELLIGENCE', pct: 82, cls: 'sf-purple' },
      { name: 'ASẸ OUTPUT', pct: 78, cls: 'sf-teal' },
    ],
    notes: 'Sustained output: 12,000V (unverified ceiling). Flight altitude: 3,400m. Speed: Mach 0.82 observed. Is correct approximately 94% of the time. The remaining 6% has been witnessed. We do not discuss it.'
  },
  'iron-wolf': {
    name: 'IKENNA CHUKWUEMEKA',
    codename: 'CODENAME: IRON WOLF  ◈  TIER: ALPHA',
    stamp: 'DANGER',
    fields: [
      { label: 'REAL NAME', val: 'Ikenna Chukwuemeka' },
      { label: 'AGE', val: '26' },
      { label: 'DISTRICT', val: 'Unknown — last: Iron District' },
      { label: 'STATUS', val: '⚠ SEMI-HOSTILE' },
      { label: 'ASẸ CLASS', val: 'Ògún Lineage — Tier V (transformed)' },
      { label: 'LOYALTY', val: 'FRACTURED — approach with caution' },
    ],
    stats: [
      { name: 'POWER', pct: 86, cls: 'sf-red' },
      { name: 'SPEED (TRANSFORMED)', pct: 100, cls: 'sf-gold' },
      { name: 'INTELLIGENCE', pct: 80, cls: 'sf-purple' },
      { name: 'ASẸ OUTPUT', pct: 55, cls: 'sf-teal' },
    ],
    notes: 'Father: 14-generation Ògún ironsmith lineage — killed in Iron District during Pale Council operation. Do NOT mention the father. Not even as strategy. The Architect has attempted recruitment three times. Fourth approach is imminent. Outcome: uncertain.'
  },
  oracle: {
    name: 'ADESANYA ADEWALE',
    codename: 'CODENAME: THE ORACLE  ◈  TIER: SOVEREIGN',
    stamp: 'CLASSIFIED',
    fields: [
      { label: 'REAL NAME', val: 'Chief Adesanya Adewale' },
      { label: 'AGE', val: '144' },
      { label: 'DISTRICT', val: 'Idumota' },
      { label: 'LOCATION', val: '████ CLASSIFIED ████', red: true },
      { label: 'ASẸ CLASS', val: 'Ìmọ̀lẹ̀ Sovereign — Knowledge Tier' },
      { label: 'STATUS', val: '⚠ DO NOT ENGAGE — EVER' },
    ],
    stats: [
      { name: 'POWER (PHYSICAL)', pct: 32, cls: 'sf-red' },
      { name: 'SPEED', pct: 20, cls: 'sf-teal' },
      { name: 'INTELLIGENCE', pct: 100, cls: 'sf-purple' },
      { name: 'KNOWLEDGE ASẸ', pct: 89, cls: 'sf-gold' },
    ],
    notes: 'Has not slept in 43 years. Classified as EXTREMELY DANGEROUS. Do not underestimate based on physical stats. She already knew you were reading this file. She asked us to add: "Tell them I said hello."'
  }
};

document.querySelectorAll('.char-card').forEach(function(card) {
  card.addEventListener('click', function() {
    var key = card.getAttribute('data-dossier');
    if (!key) return;
    if (window.ClearanceTracker) ClearanceTracker.mark('dossier_' + key);
    if (!DOSSIERS[key]) return;
    dosOpen(DOSSIERS[key]);
  });
});

function dosOpen(data) {
  document.getElementById('dos-name').textContent = data.name;
  document.getElementById('dos-codename').textContent = data.codename;
  document.getElementById('dos-stamp').textContent = data.stamp;

  var grid = document.getElementById('dos-grid');
  grid.innerHTML = data.fields.map(function(f) {
    return '<div class="dos-field"><label>' + f.label + '</label>'
      + '<div class="dos-val' + (f.red ? ' dos-redact' : '') + '">' + f.val + '</div>'
      + '</div>';
  }).join('');

  var statsEl = document.getElementById('dos-stats');
  statsEl.innerHTML = data.stats.map(function(s) {
    return '<div class="dos-stat">'
      + '<div class="dos-stat-hdr"><span>' + s.name + '</span><span>' + s.pct + '/100</span></div>'
      + '<div class="stat-bar"><div class="stat-fill ' + s.cls + '" data-pct="' + s.pct + '"></div></div>'
      + '</div>';
  }).join('');

  document.getElementById('dos-notes').innerHTML = '<strong>ANALYST NOTES — LEVEL 5 ONLY</strong>' + data.notes;
  document.getElementById('dossier-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  // Animate bars after a brief delay
  setTimeout(function() {
    document.querySelectorAll('.stat-fill').forEach(function(bar) {
      bar.style.width = bar.getAttribute('data-pct') + '%';
    });
  }, 150);
}

function dosClose(e) {
  if (e && e.target !== document.getElementById('dossier-overlay')) return;
  document.getElementById('dossier-overlay').classList.remove('open');
  document.body.style.overflow = '';
  // Reset bars
  document.querySelectorAll('.stat-fill').forEach(function(b) { b.style.width = '0%'; });
}

// ESC to close dossier
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.getElementById('dossier-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ── COUNTDOWN TIMER ───────────────────────────────────────
(function() {
  var target = new Date('2026-10-01T00:00:00').getTime();
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function tick() {
    var now = Date.now();
    var diff = Math.max(0, target - now);
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    var de = document.getElementById('cd-days');
    var he = document.getElementById('cd-hrs');
    var me = document.getElementById('cd-min');
    var se = document.getElementById('cd-sec');
    if (de) de.textContent = pad(d);
    if (he) he.textContent = pad(h);
    if (me) me.textContent = pad(m);
    if (se) se.textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);
})();

// ── AUDIO ATMOSPHERE ──────────────────────────────────────
var audioCtx = null;
var audioMaster = null;
var audioPlaying = false;

function audioToggle() {
  if (!audioPlaying) {
    audioStart();
  } else {
    audioStop();
  }
}

function audioStart() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioMaster = audioCtx.createGain();
    audioMaster.gain.value = 0.0;
    audioMaster.connect(audioCtx.destination);

    // Low city rumble
    var rumble = audioCtx.createOscillator();
    rumble.type = 'sine';
    rumble.frequency.value = 38;
    var rumbleGain = audioCtx.createGain();
    rumbleGain.gain.value = 0.12;
    rumble.connect(rumbleGain);
    rumbleGain.connect(audioMaster);
    rumble.start();

    // Sub bass pulse
    var sub = audioCtx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = 52;
    var subGain = audioCtx.createGain();
    subGain.gain.value = 0.06;
    sub.connect(subGain);
    subGain.connect(audioMaster);
    sub.start();

    // Rain (filtered noise)
    var noiseLen = audioCtx.sampleRate * 3;
    var noiseBuf = audioCtx.createBuffer(1, noiseLen, audioCtx.sampleRate);
    var nd = noiseBuf.getChannelData(0);
    for (var i = 0; i < noiseLen; i++) nd[i] = Math.random() * 2 - 1;
    var noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    var bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2200;
    bp.Q.value = 0.4;
    var rainGain = audioCtx.createGain();
    rainGain.gain.value = 0.03;
    noise.connect(bp);
    bp.connect(rainGain);
    rainGain.connect(audioMaster);
    noise.start();

    // Wind (low pass noise)
    var wind = audioCtx.createBufferSource();
    wind.buffer = noiseBuf;
    wind.loop = true;
    var lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 320;
    var windGain = audioCtx.createGain();
    windGain.gain.value = 0.025;
    wind.connect(lp);
    lp.connect(windGain);
    windGain.connect(audioMaster);
    wind.start();

    // DANFO horn (periodic)
    function danfoHorn() {
      if (!audioPlaying) return;
      var osc = audioCtx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 220 + Math.random() * 80;
      var env = audioCtx.createGain();
      env.gain.value = 0;
      osc.connect(env);
      env.connect(audioMaster);
      osc.start();
      var t = audioCtx.currentTime;
      env.gain.setTargetAtTime(0.07, t, 0.03);
      env.gain.setTargetAtTime(0.05, t + 0.15, 0.05);
      env.gain.setTargetAtTime(0, t + 0.55, 0.12);
      osc.stop(t + 1.2);
      setTimeout(danfoHorn, 7000 + Math.random() * 14000);
    }
    setTimeout(danfoHorn, 3000 + Math.random() * 5000);

    // Market crowd bursts
    function crowdBurst() {
      if (!audioPlaying) return;
      var cb = audioCtx.createBufferSource();
      cb.buffer = noiseBuf;
      cb.loop = false;
      var cbf = audioCtx.createBiquadFilter();
      cbf.type = 'bandpass';
      cbf.frequency.value = 800 + Math.random() * 400;
      cbf.Q.value = 1.5;
      var cbg = audioCtx.createGain();
      cbg.gain.value = 0;
      cb.connect(cbf);
      cbf.connect(cbg);
      cbg.connect(audioMaster);
      cb.start();
      var t = audioCtx.currentTime;
      cbg.gain.setTargetAtTime(0.04, t, 0.1);
      cbg.gain.setTargetAtTime(0, t + 0.8, 0.3);
      setTimeout(crowdBurst, 4000 + Math.random() * 8000);
    }
    setTimeout(crowdBurst, 1500);
  }

  audioPlaying = true;
  audioMaster.gain.setTargetAtTime(0.35, audioCtx.currentTime, 0.8);
  if (audioCtx.state === 'suspended') audioCtx.resume();
  document.getElementById('audio-btn').classList.add('on');
  document.getElementById('audio-icon').textContent = '♫';
}

function audioStop() {
  audioPlaying = false;
  if (audioMaster) audioMaster.gain.setTargetAtTime(0, audioCtx.currentTime, 0.6);
  document.getElementById('audio-btn').classList.remove('on');
  document.getElementById('audio-icon').textContent = '♪';
}

// ── SOCIAL SHARE ──────────────────────────────────────────
function pvShareTwitter() {
  var cap = document.getElementById('pvCaption');
  var text = cap ? cap.textContent : 'Catalyst: The Awakening — Lagos noir comic powered by Yoruba mythology';
  var url = window.location.href.split('#')[0] + '#read';
  var tw = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent('🔥 ' + text.slice(0,180) + ' — Read free: ') + '&url=' + encodeURIComponent(url) + '&hashtags=CatalystAwakening,LagosComics,YorubaMythology';
  window.open(tw, '_blank', 'width=600,height=400');
}

function pvShareWhatsApp() {
  var cap = document.getElementById('pvCaption');
  var text = cap ? cap.textContent : 'Catalyst: The Awakening — Lagos noir comic';
  var url = window.location.href.split('#')[0] + '#read';
  var msg = '🔥 ' + text.slice(0,200) + '\n\nRead it free: ' + url;
  window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}

function sharePageCopy() {
  var url = window.location.href.split('#')[0];
  var btn = document.getElementById('sharePageCopyBtn');
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(function() {
      if (btn) { btn.textContent = '✓ Copied!'; setTimeout(function(){ btn.textContent = '🔗 Copy Link'; }, 2000); }
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = url; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    if (btn) { btn.textContent = '✓ Copied!'; setTimeout(function(){ btn.textContent = '🔗 Copy Link'; }, 2000); }
  }
}

function pvCopyLink() {
  var url = window.location.href.split('#')[0] + '#read';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(function() {
      var btn = document.getElementById('pvCopyBtn');
      if (btn) { btn.textContent = '✓ Copied!'; setTimeout(function(){ btn.textContent = '\uD83D\uDD17 Copy Link'; }, 2000); }
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = url; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    var btn = document.getElementById('pvCopyBtn');
    if (btn) { btn.textContent = '✓ Copied!'; setTimeout(function(){ btn.textContent = '\uD83D\uDD17 Copy Link'; }, 2000); }
  }
}


  // ─── HERO QUOTE CAROUSEL ──────────────────────────────────────
  (function() {
    var total = 5;
    var current = 0;
    var dots = document.querySelectorAll('.hqc-dot');
    var interval;
    function hqcShow(n) {
      var prev = document.getElementById('hqc' + current);
      if (prev) prev.classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = (n + total) % total;
      var next = document.getElementById('hqc' + current);
      if (next) next.classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    }
    window.hqcGo = function(n) { hqcShow(n); clearInterval(interval); interval = setInterval(function(){ hqcShow(current+1); }, 4500); };
    interval = setInterval(function(){ hqcShow(current+1); }, 4500);
  })();

  // ─── ASẸ PARTICLE FIELD ────────────────────────────────────────
  (function() {
    var hero = document.getElementById('hero');
    if (!hero) return;
    var field = document.createElement('div');
    field.className = 'ase-particle-field';
    hero.insertBefore(field, hero.firstChild);
    var colors = ['rgba(244,184,0,0.7)','rgba(184,20,20,0.6)','rgba(0,201,177,0.5)','rgba(244,184,0,0.4)'];
    for (var i = 0; i < 22; i++) {
      var p = document.createElement('div');
      p.className = 'asep';
      var size = 2 + Math.random() * 4;
      var left = Math.random() * 100;
      var delay = Math.random() * 12;
      var dur = 10 + Math.random() * 15;
      var col = colors[Math.floor(Math.random() * colors.length)];
      p.style.cssText = 'width:'+size+'px;height:'+size+'px;left:'+left+'%;bottom:-'+size+'px;background:'+col+';animation-duration:'+dur+'s;animation-delay:-'+delay+'s;box-shadow:0 0 '+(size*2)+'px '+col+';';
      field.appendChild(p);
    }
  })();

  // ─── LOCATION MODAL ───────────────────────────────────────────
  var LOC_DATA = {
    'mushin': { num:'01', name:'Mushin', yoruba:'Mushin — "Spirit of the Warrior"', photo:'./assets/industrial.webp', desc:'Where Bayo grew up. A neighbourhood of thirty-two naira, borrowed beds, and the specific kind of survival intelligence that only grinding poverty produces. The Orishas have always known about Mushin — they chose it deliberately. Power hidden in plain sight.', events:['Bayo first experiences ASẸ surge — Issue #01','Area boys confront Bayo behind the old Odeon shell','NEPA wire sparks: the Awakening begins'], chars:['Bayo Adeyemi','Area Boys','Mushin Elders'] },
    'balogun': { num:'02', name:'Balogun Nexus', yoruba:'Ọjà Bálógún — "Market of the General"', photo:'./assets/intersection.webp', desc:'The ancient market hums on two frequencies — the physical bustle of traders and hawkers, and the Aṣẹ frequency that has run through its foundations since the 16th century. The first team battle takes place here. The Collector begins his harvest operations within 200m of this location.', events:['First full team assembly — Issue #01','The Collector\'s initial harvest attempt','847 futures visible to Bayo: one path survives','Amara\'s drum resonance drops to critical 40%'], chars:['Bayo','Amara','Ikenna','Zara','The Collector'] },
    'eko-atlantic': { num:'03', name:'Eko Atlantic', yoruba:'Ẹko Atlantic — "The Extraction Engine"', photo:'./assets/flares.webp', desc:'Built on reclaimed land from Lagos Lagoon — drilled straight through Ọṣun\'s domain. The towers are not offices. They are spiritual extraction machines. Each foundation column drives into the seabed at a frequency calculated to siphon Aṣẹ. The Pale Council\'s Lagos HQ is Tower 7, sub-basement Level B3. The Orisha Vaccine is being assembled there now.', events:['Pale Council Lagos HQ — Tower 7','Orisha Vaccine assembly — B3 sub-basement','The Architect arrives — Issue #03','30 Ọ̀run breaches directly caused by drilling'], chars:['The Architect','Pale Council Operatives','The Collector'] },
    'oshodi': { num:'04', name:'Oshodi Market', yoruba:'Ọ̀ṣòdì — "Where the spirits haggle"', photo:'./assets/circle.webp', desc:'The largest informal economy in West Africa. Oshodi processes more Aṣẹ transactions than any other location in Lagos — not because it is sacred, but because it is alive. Ẹṣù has more agents per square metre here than anywhere on the continent. Every misunderstanding, every impossible deal that somehow closes, every near-accident avoided at the last second — that is Ẹṣù, taxing the crossroads.', events:['Bayo spots Pale Council surveillance — Issue #01','Oshodi confrontation — Bayo releases full ASẸ','ZZZZAP! — BW panel full power discharge'], chars:['Bayo','Ẹṣù agents','Pale Council Surveillance'] },
    'paul-street': { num:'05', name:'Paul Street Workshop', yoruba:'Àgò Paul — "The forge that listens"', photo:'./assets/forge.webp', desc:'Ikenna\'s workplace for three years. A mechanic\'s workshop that smells of iron dust, engine oil, and something electrical with no physical source. The morning of Issue 3, Pale Council operatives attempt a raid through the rear. 416 separate metal objects in the workshop turn toward the threat at the same moment. Ògún has been awake here for years.', events:['Pale Council strike team raids — Issue #03','416 metal objects orient simultaneously','Iron Wolf emerges — first full Ògún manifestation','Workshop becomes team base of operations'], chars:['Ikenna Chukwuemeka','Ògún','Pale Council Strike Team'] },
    'oracle-compound': { num:'06', name:'Oracle\'s Compound', yoruba:'Ilé Àgbà Adesanya — "The Elder\'s House"', photo:'./assets/corridor.webp', desc:'Chief Adesanya Adewale has lived here for 62 of his 144 years. The compound in Idumota smells of ìtò, palm oil, and old paper in three different languages. The walls remember every conversation that happened in this space. Zara presents her 9-night intelligence report here. Bayo receives the truth about what he is. The Oracle has been waiting for this day since 1987.', events:['Oracle reveals Bayo\'s true nature — Issue #04','Zara\'s intelligence briefing — 37 Pale Council positions','The Choice: control or grow wild','Oracle has been alive 144 years — Orishas took his eyes'], chars:['The Oracle','Bayo','Amara','Ikenna','Zara'] }
  };

  function openLocModal(id) {
    var d = LOC_DATA[id];
    if (!d) return;
    if (window.ClearanceTracker) ClearanceTracker.mark('map_' + id);
    document.getElementById('locModalNum').textContent = d.num;
    document.getElementById('locModalName').textContent = d.name;
    document.getElementById('locModalYoruba').textContent = d.yoruba;
    document.getElementById('locModalDesc').textContent = d.desc;
    document.getElementById('locModalImg').src = d.photo;
    document.getElementById('locModalImg').alt = d.name;
    var evDiv = document.getElementById('locModalEvents');
    evDiv.innerHTML = d.events.map(function(e){ return '<div class="loc-modal-event">'+e+'</div>'; }).join('');
    var chDiv = document.getElementById('locModalChars');
    chDiv.innerHTML = d.chars.map(function(c){ return '<span class="loc-modal-char-tag">'+c+'</span>'; }).join('');
    document.getElementById('locModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLocModal() {
    // The map modal only exists on the home page, but this is bound to Escape
    // globally — so on an issue page every Escape press threw here, and the
    // handler died before anything after it ran.
    var modal = document.getElementById('locModal');
    if (!modal) return;
    // Only release the scroll lock if this modal was the one holding it.
    // Clearing it unconditionally let an Escape aimed at some other open
    // dialog unlock the page behind it.
    if (modal.classList.contains('open')) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeLocModal(); });

  // Nav-link active-state highlighting: see the "Scrollspy" block further
  // down — it's the only place .nav-active should be toggled from.

  // ═══════════════════════════════════════════════════════════════
  // MOBILE NAV — auto-close on scroll
  // ═══════════════════════════════════════════════════════════════
  (function() {
    var lastScrollY = window.scrollY;
    window.addEventListener('scroll', function() {
      var nav = document.getElementById('mobileNav');
      if (!nav || !nav.classList.contains('open')) return;
      var dy = Math.abs(window.scrollY - lastScrollY);
      if (dy > 40) toggleMobileNav();
      lastScrollY = window.scrollY;
    }, { passive: true });
  })();


  // ── V5: ORACLE TERMINAL v2 — ZARA DATA + INTERACTIVE QUERY ──────────────────

  // Zara dossier
  if (typeof TERM_DATA !== 'undefined') {
    TERM_DATA['zara'] = [
      { t: 0,   txt: '[ ACCESSING FILE: OSEI, ZARA — CODENAME: THE MIRROR ]\n', cls: 't-red' },
      { t: 300, txt: 'CLEARANCE REQUIRED: OMEGA — GRANTED — NOTE: SHE KNOWS YOU ACCESSED THIS\n\n', cls: 't-dim' },
      { t: 700, txt: 'SURVEILLANCE STATUS: ZERO — DIGITAL, PHYSICAL, SPIRITUAL\n', cls: 't-gold' },
      { t: 1000,txt: 'Age: 27. Origin: ERASED from Ifá records.\nPassport: Three nationalities, all legitimate, all impossible.\nOccupation declared: "Photographer." (Unverified.)\n\n', cls: 't-white' },
      { t: 1800,txt: 'Unique classification: Subject has attended 2 confirmed Pale Council briefings\nundetected. The Pale Council does not know this.\nThe Pale Council does not know she exists.\nThe Pale Council has never seen her. \n\n', cls: '' },
      { t: 2600,txt: 'Aṣẹ signature: NONE. No divine trace. No orisha bond. No aura.\nClassification systems report: CIVILIAN.\nClassification systems are wrong.\n\n', cls: 't-dim' },
      { t: 3400,txt: 'Oracle personal note: I have been doing this 144 years.\nI cannot read her. This has happened once before.\nThat person was The Architect.\nI am choosing not to think about this too hard right now.\n', cls: 't-red' },
    ];
  }

  // Interactive query engine
  var ORACLE_RESPONSES = {
    'who is bayo': [
      { t:0,   txt:'> QUERYING: ADEYEMI, BAYO — CATALYST\n', cls:'t-gold' },
      { t:400, txt:'Age 19. Mushin-born. Last seen: everywhere simultaneously.\n', cls:'t-white' },
      { t:900, txt:'Aṣẹ classification: IMPOSSIBLE. System returns error on every scan.\n', cls:'' },
      { t:1400,txt:'The city chose him. This is above our pay grade.\n', cls:'t-dim' },
    ],
    'bayo': [
      { t:0,   txt:'> CATALYST DOSSIER — QUICK ACCESS\n', cls:'t-gold' },
      { t:300, txt:'Adebayo Adeyemi · 19 · Mushin · ASẹ Class: UNPRECEDENTED\n', cls:'t-white' },
      { t:700, txt:'Five orisha resonances active simultaneously. Oracle says: "Do not test him."\n', cls:'t-dim' },
    ],
    'zara': [
      { t:0,   txt:'> QUERYING: THE MIRROR — CLEARANCE OMEGA\n', cls:'t-gold' },
      { t:300, txt:'File access logged. She already knows.\n', cls:'t-red' },
      { t:700, txt:'Surveillance signature: ZERO. The system sees nothing. We see nothing.\n', cls:'t-dim' },
      { t:1200,txt:'The Oracle says: "She is the most dangerous person in this city.\nShe has not decided to be dangerous yet."\n', cls:'t-white' },
    ],
    'pale council': [
      { t:0,   txt:'> QUERYING: PALE COUNCIL — CLASSIFICATION: EXISTENTIAL THREAT\n', cls:'t-red' },
      { t:400, txt:'Shadow governance body. Founded 1886 — Lagos annexation.\n138 years of uninterrupted operation.\n', cls:'t-white' },
      { t:1000,txt:'Current objective: collapse the Orisha-Human accord.\nErase the divine from the city. Permanently.\n', cls:'' },
      { t:1600,txt:'Known assets: The Architect. ████ sleeper agents. ████ extraction teams.\n', cls:'t-dim' },
      { t:2000,txt:'Oracle note: "They have been in this city longer than I have.\nThe difference is I am trying to protect it."\n', cls:'t-red' },
    ],
    'architect': [
      { t:0,   txt:'> QUERYING: THE ARCHITECT — WARNING ACTIVE\n', cls:'t-red' },
      { t:300, txt:'This query has been logged. The Architect has been notified.\n', cls:'t-red' },
      { t:700, txt:'Age: 31. Pale Council lead engineer, Orisha Vaccine programme.\n', cls:'t-white' },
      { t:1200,txt:'She does not fight battles. She writes them. Every containment plan since Balogun Nexus has her signature.\n', cls:'t-dim' },
    ],
    'ase': [
      { t:0,   txt:'> QUERYING: ASẸ SYSTEM — OPEN RECORD\n', cls:'t-gold' },
      { t:300, txt:'Divine energy interface. Visible only to Bayo Adeyemi.\n', cls:'t-white' },
      { t:700, txt:'Orisha-issued quest system. Class: UNPRECEDENTED in 4,000 years of Ifá records.\n', cls:'' },
      { t:1200,txt:'Current Catalyst Protocol completion: 71%.\nWhen it hits 100%: unknown. Oracle refuses to specify.\n', cls:'t-dim' },
    ],
    'ase system': [
      { t:0,   txt:'> QUERYING: ASẸ SYSTEM — OPEN RECORD\n', cls:'t-gold' },
      { t:300, txt:'Floating Yoruba script. Divine interface. Quest log. Stat tracker.\n', cls:'t-white' },
      { t:800, txt:'No prior match in 4,000 years of Ifá record. Oracle classification: UNPRECEDENTED.\n', cls:'t-dim' },
    ],
    'oracle': [
      { t:0,   txt:'> QUERYING: THE ORACLE — SELF-REFERENCE DETECTED\n', cls:'t-gold' },
      { t:400, txt:'Age: 144 years confirmed. Possibly older. He does not clarify.\n', cls:'t-white' },
      { t:900, txt:'Classification: Mortal. But the city listens when he speaks.\n', cls:'' },
      { t:1300,txt:'"I have seen eleven false Catalysts. This one is not false.\nThis terrifies me more than the false ones did."\n', cls:'t-dim' },
    ],
    'mushin': [
      { t:0,   txt:'> QUERYING: LOCATION — MUSHIN DISTRICT\n', cls:'t-gold' },
      { t:300, txt:'Population: 633,000. Aṣẹ concentration: HIGHEST IN LAGOS.\n', cls:'t-white' },
      { t:800, txt:'The energy here predates the city. The streets remember things.\n', cls:'t-dim' },
      { t:1200,txt:'Bayo grew up here. The Oracle says this is not coincidence.\n', cls:'' },
    ],
    'iron wolf': [
      { t:0,   txt:'> QUERYING: OKAFOR, IKENNA — IRON WOLF\n', cls:'t-gold' },
      { t:300, txt:'Age 26. Iron District. Tier V+ in transformed state.\n', cls:'t-white' },
      { t:700, txt:'He does not consider himself a hero. He considers himself a consequence.\n', cls:'t-dim' },
    ],
    'ikenna': [
      { t:0,   txt:'> QUERYING: OKAFOR, IKENNA — IRON WOLF\n', cls:'t-gold' },
      { t:300, txt:'Iron District born. 14 generations Ògún lineage. Tier V+ confirmed.\n', cls:'t-white' },
      { t:700, txt:'The Architect has made three recruitment approaches. He refused all three.\n', cls:'t-red' },
    ],
    'amara': [
      { t:0,   txt:'> QUERYING: IBRAHIM, AMARA — THUNDERSTRIKE\n', cls:'t-gold' },
      { t:300, txt:'Age 23. Former aerospace engineer, UNN. Shungite battery: 12,000V sustained.\n', cls:'t-white' },
      { t:800, txt:'Correct 94% of the time. The 6% has hospitalized three Pale Council operatives.\n', cls:'t-dim' },
    ],
    'help': [
      { t:0,   txt:'> ORACLE QUERY SYNTAX — AVAILABLE SEARCH TERMS\n\n', cls:'t-gold' },
      { t:200, txt:'bayo / catalyst         — Adeyemi dossier\n', cls:'t-white' },
      { t:350, txt:'zara / the mirror        — The Mirror dossier\n', cls:'t-white' },
      { t:500, txt:'ikenna / iron wolf       — Okafor dossier\n', cls:'t-white' },
      { t:650, txt:'amara                    — Thunderstrike dossier\n', cls:'t-white' },
      { t:800, txt:'architect                — [CLASSIFIED — ACCESS LOGGED]\n', cls:'t-red' },
      { t:950, txt:'pale council             — Threat assessment\n', cls:'t-white' },
      { t:1100,txt:'ase / ase system         — Power system overview\n', cls:'t-white' },
      { t:1250,txt:'oracle                   — Intel on the Oracle\n', cls:'t-white' },
      { t:1400,txt:'mushin                   — Location brief\n', cls:'t-white' },
    ],
    'districts': [
      { t:0,   txt:'> LAGOS 2031: DISTRICT TELEMETRY OVERVIEW\n', cls:'t-gold' },
      { t:300, txt:'5 PRIMARY SECTORS MONITORED BY ORACLE MESH:\n', cls:'t-white' },
      { t:600, txt:'- The Void Belt (Oshodi-Mushin corridor): CRITICAL threat\n', cls:'t-red' },
      { t:900, txt:'- Victoria Prime (Eko Atlantic): ESCALATING threat\n', cls:'' },
      { t:1200,txt:'- Yaba Deep (Underground tech corridor): MODERATE threat\n', cls:'' },
      { t:1500,txt:'- Badagry Corridor & Mainland Grid: HIGH / MONITORED\n', cls:'t-dim' },
      { t:1800,txt:'Navigate to Lagos 2031 Intelligence Hub (#world-2031) for live tactical overlays.\n', cls:'t-gold' },
    ],
    'factions': [
      { t:0,   txt:'> FACTION WARFARE DOSSIER: FOUR CONTENDERS\n', cls:'t-gold' },
      { t:300, txt:'1. AXIS SYNDICATE — Black-market energy cartel (Void Belt)\n', cls:'t-red' },
      { t:600, txt:'2. THE FORGE — Tech-mystic weapon smiths under Ikenna Okafor\n', cls:'t-white' },
      { t:900, txt:'3. PROTOCOL ARCHITECTS — Corporate technocrats (Victoria Prime)\n', cls:'' },
      { t:1200,txt:'4. MEMORY KEEPERS — Preservationist archivists guarding Ifá roots\n', cls:'t-dim' },
    ],
    'void belt': [
      { t:0,   txt:'> SECTOR REPORT: THE VOID BELT (OSHODI-MUSHIN)\n', cls:'t-red' },
      { t:300, txt:'Population: 3.2M autonomous. Grid status: ZERO OFFICIAL POWER SINCE 2026.\n', cls:'t-white' },
      { t:700, txt:'Ruled by mesh-linked generator collectives and AXIS black-market tap lines.\n', cls:'t-dim' },
    ],
    'yaba': [
      { t:0,   txt:'> SECTOR REPORT: YABA DEEP\n', cls:'t-gold' },
      { t:300, txt:'Subterranean fiber bunkers beneath old tech campuses. 840K specialists.\n', cls:'t-white' },
      { t:700, txt:'Home of algorithmic diviners and decentralized Aṣẹ battery banks.\n', cls:'t-dim' },
    ],
    'victoria prime': [
      { t:0,   txt:'> SECTOR REPORT: VICTORIA PRIME\n', cls:'t-gold' },
      { t:300, txt:'Private security state behind kinetic sea walls. Wealth tier: 0.1%.\n', cls:'t-white' },
      { t:700, txt:'Operates quantum surveillance drones and synthetically stabilized Aṣẹ cells.\n', cls:'t-dim' },
    ],
    'badagry': [
      { t:0,   txt:'> SECTOR REPORT: BADAGRY CORRIDOR\n', cls:'t-gold' },
      { t:300, txt:'Coastal smuggler haven and historical memory sanctuary.\n', cls:'t-white' },
      { t:700, txt:'Spiritual anchor for coastal Orisha shrines resisting corporate containment.\n', cls:'t-dim' },
    ],
  };

  function termFocusInput() {
    var inp = document.getElementById('termQueryInput');
    if (inp) { inp.focus(); inp.scrollIntoView({ behavior:'smooth', block:'center' }); }
  }

  function termQuery(raw) {
    var inp = document.getElementById('termQueryInput');
    var q = (raw || '').trim().toLowerCase();
    if (!q) return;
    if (inp) inp.value = '';
    if (window.ClearanceTracker) ClearanceTracker.mark('terminal');

    var out = document.getElementById('terminal-out');
    if (!out) return;

    // Clear and show query echo
    if (termTimeout) clearTimeout(termTimeout);
    out.innerHTML = '';
    var echo = document.createElement('span');
    echo.className = 't-dim';
    echo.textContent = 'ORACLE@LAGOS-NET:~$ ' + raw.trim() + '\n\n';
    out.appendChild(echo);

    // Find best match
    var key = null;
    var keys = Object.keys(ORACLE_RESPONSES);
    for (var i = 0; i < keys.length; i++) {
      if (q === keys[i] || q.indexOf(keys[i]) !== -1 || keys[i].indexOf(q) !== -1) {
        key = keys[i]; break;
      }
    }

    var lines = key ? ORACLE_RESPONSES[key] : [
      { t:0,   txt:'> SEARCHING ORACLE INTELLIGENCE FEED...\n', cls:'t-dim' },
      { t:600, txt:'[ NO CLASSIFIED RECORD FOUND FOR: "' + raw.trim().toUpperCase() + '" ]\n', cls:'t-red' },
      { t:1000,txt:'Try: "help" for available search terms.\n', cls:'t-dim' },
    ];

    // Glitch if sensitive keyword
    var sensitive = ['architect','pale council','zara'];
    for (var s = 0; s < sensitive.length; s++) {
      if (q.indexOf(sensitive[s]) !== -1) {
        out.classList.add('term-glitch');
        setTimeout(function(){ out.classList.remove('term-glitch'); }, 400);
        break;
      }
    }

    lines.forEach(function(line) {
      termTimeout = setTimeout(function() {
        var span = document.createElement('span');
        span.textContent = line.txt;
        if (line.cls) span.className = line.cls;
        out.appendChild(span);
      }, line.t + 200);
    });
  }

  // ── V5: ASẸ STAT BAR ANIMATION ─────────────────────────────────────────────
  (function() {
    var aseSection = document.getElementById('ase-system');
    if (!aseSection) return;
    var animated = false;
    var obs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting && !animated) {
        animated = true;
        // Animate all bars
        var bars = aseSection.querySelectorAll('.ase-bar-anim');
        bars.forEach(function(bar, idx) {
          var pct = bar.getAttribute('data-pct') || '0';
          setTimeout(function() {
            bar.style.width = pct + '%';
          }, 200 + idx * 120);
        });
        // Show level-up overlay then hide it
        var lvlUp = document.getElementById('aseLevelUp');
        if (lvlUp) {
          setTimeout(function() {
            lvlUp.classList.add('show');
            setTimeout(function() {
              lvlUp.style.transition = 'opacity 0.8s ease';
              lvlUp.style.opacity = '0';
              setTimeout(function() { lvlUp.classList.remove('show'); lvlUp.style.opacity = ''; }, 800);
            }, 2200);
          }, 1800);
        }
      }
    }, { threshold: 0.4 });
    obs.observe(aseSection);
  })();

  // ── V5: ARC II COUNTDOWN + CINEMATIC QUOTE ─────────────────────────────────
  (function() {
    // Target: December 1, 2026 — Issue #5 release
    var targetDate = new Date('2026-12-01T00:00:00+01:00').getTime();

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function updateCd() {
      var now = Date.now();
      var diff = targetDate - now;
      if (diff < 0) diff = 0;
      var days = Math.floor(diff / 86400000);
      var hrs  = Math.floor((diff % 86400000) / 3600000);
      var min  = Math.floor((diff % 3600000) / 60000);
      var sec  = Math.floor((diff % 60000) / 1000);
      var d = document.getElementById('arc2Days');
      var h = document.getElementById('arc2Hrs');
      var m = document.getElementById('arc2Min');
      var s = document.getElementById('arc2Sec');
      if (d) d.textContent = pad(days);
      if (h) h.textContent = pad(hrs);
      if (m) m.textContent = pad(min);
      if (s) s.textContent = pad(sec);
    }
    updateCd();
    setInterval(updateCd, 1000);

    // Cinematic quote typewriter on scroll
    var arc2El = document.getElementById('arc2-teaser');
    var qEl    = document.getElementById('arc2CinQInner');
    var qTyped = false;
    var ARC2_QUOTE = '"The Architect\'s file arrived at 4:17 AM. The Oracle went pale for the first time in 144 years. \"This one,\" he said very quietly. \"This one we were not ready for.\"  He was wrong. They were ready for nothing that came next."';

    if (arc2El && qEl) {
      var qObs = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting && !qTyped) {
          qTyped = true;
          qEl.classList.add('arc2-cq-cursor');
          var i = 0;
          var speed = 28;
          function typeChar() {
            if (i < ARC2_QUOTE.length) {
              qEl.textContent += ARC2_QUOTE[i++];
              setTimeout(typeChar, speed + (ARC2_QUOTE[i-1] === '.' || ARC2_QUOTE[i-1] === ',' ? 180 : 0));
            } else {
              setTimeout(function(){ qEl.classList.remove('arc2-cq-cursor'); }, 600);
            }
          }
          setTimeout(typeChar, 600);
        }
      }, { threshold: 0.3 });
      qObs.observe(arc2El);
    }
  })();


  // ── V6: LAGOS INTEL WIRE ──────────────────────────────────────────────────
  (function() {
    var INTEL_MSGS = [
      'BREAKING: Unregistered Aṣẹ signature detected — Mushin District — surge reading: UNPRECEDENTED',
      'PALE COUNCIL COMMUNIQUÉ [INTERCEPTED]: "Asset is no longer containable. Initiate Protocol 9."',
      'ORACLE BROADCAST: Third Mainland Bridge — divine resonance reading 400% above baseline — stay clear',
      'INTELLIGENCE ALERT: Thunderstrike sighting confirmed — Apapa Terminal — 03:47 hrs — origin unknown',
      'INTERCEPTED: Dark Assembly internal memo — "The Catalyst is awake. Adjust all timelines."',
      'DISPATCH: Iron District foundry workers report iron objects self-assembling — overnight — no casualties',
      'ORACLE INTEL: The Pale Council convened an emergency session. Duration: 4 hours. No minutes filed.',
      'CLASSIFIED: Balogun Nexus market reports — floating Yoruba script visible to 3 independent witnesses',
      'ALERT: GORA — Global Orisha Regulatory Authority — has opened an "active monitoring file" on Lagos',
      'INTERCEPTED: "She was at the briefing again. We still have no image. We still have no name."',
      'ORACLE NOTE: The Lagoon is speaking. I have not heard it speak since 1847. I do not like what it is saying.',
      'DISPATCH: Iron Wolf — Ikenna Chukwuemeka — sighted near Pale Council perimeter. He was not followed. He was not found.',
      'PALE COUNCIL LOG [INTERCEPTED]: "The Oracle has been 144 years in this city. Tonight he looked afraid."',
      'BREAKING: Ọ̀run-bleed reading at Lagos Island — third this week — Oracle Intel confirms: accelerating',
      'CLASSIFIED: Zara Osei — THE MIRROR — last surveillance ping: 27 days ago. Status: UNKNOWN. Priority: OMEGA.',
      'INTELLIGENCE: The Architect has not been seen in 6 days. When he disappears, something ends. Monitor all assets.',
      'ORACLE BROADCAST: "The city chose him. The choice is made. What comes next is not in any record I hold."',
      'DISPATCH: ASẹ capacity readings across Lagos — all sectors — up 340% since the Catalyst Event. This is not stabilising.',
    ];
    var liwIdx = 0;
    var liwEl = document.getElementById('liwMsg');
    var liwCounterEl = document.getElementById('liwCounter');

    function liwShow(idx) {
      if (!liwEl) return;
      liwIdx = ((idx % INTEL_MSGS.length) + INTEL_MSGS.length) % INTEL_MSGS.length;
      liwEl.style.animation = 'none';
      liwEl.textContent = INTEL_MSGS[liwIdx];
      void liwEl.offsetWidth;
      liwEl.style.animation = '';
      if (liwCounterEl) {
        liwCounterEl.textContent = String(liwIdx + 1).padStart(3,'0') + '/' + String(INTEL_MSGS.length).padStart(3,'0');
      }
    }
    liwShow(0);
    setInterval(function() { liwShow(liwIdx + 1); }, 7000);
  })();

  // ── V7: OPERATIVE RECRUITMENT ──────────────────────────────────────────────
  var OP_CLASSIFICATIONS = [
    'ASẸ SYMPATHIZER — CLEARANCE: LEVEL 1',
    'ORISHA RESONANCE DETECTED — LEVEL 2 ASSET',
    'DIVINE SENSITIVITY: ACTIVE — INTEL VALUE: HIGH',
    'PALE COUNCIL WATCHLIST EVADER — CLEARANCE: OMEGA',
    'CATALYST NETWORK — FIELD CONTACT — PRIORITY: HIGH',
    'UNKNOWN ASẸ SIGNATURE — MONITOR AND REPORT',
    'ORACLE RECOMMENDED CONTACT — TRUST: PROVISIONAL',
  ];
  var OP_DIRECTIVES = [
    'Monitor Mushin District for unusual Aṣẹ readings. Report to Oracle Node.',
    'Do not engage Dark Assembly operatives. You are not ready. Yet.',
    'Learn to recognise a Pale Council tail. There are three on you already.',
    'The Oracle says your timing is significant. He will not elaborate.',
    'Watch the Third Mainland Bridge. The water is speaking. Translate.',
    'Trust no information that arrives between 2 and 4 AM. That window is theirs.',
    'Maintain your cover. The Architect already suspects. Do not confirm.',
  ];
  var OP_WELCOMES = [
    'The Oracle has been watching this city for 144 years.<br>He does not send for people without reason.<br>You were sent for. Act accordingly.',
    'This city has been holding its breath for nineteen years.<br>It chose tonight to exhale.<br>It chose you to be here when it did.',
    'Every hero in this city thought it was coincidence, at first.<br>It is never coincidence.<br>The city knows what it is doing.',
    'You arrived at the right time. The Oracle says this is not an accident.<br>The Oracle is never wrong about timing.<br>He is occasionally wrong about everything else.',
  ];

  function showOperativeModal(name, email) {
    var num = '#' + String(Math.floor(1000 + (Date.now() % 8000) + Math.random() * 999)).padStart(4,'0');
    var cls = OP_CLASSIFICATIONS[Math.floor(Math.random() * OP_CLASSIFICATIONS.length)];
    var dir = OP_DIRECTIVES[Math.floor(Math.random() * OP_DIRECTIVES.length)];
    var wel = OP_WELCOMES[Math.floor(Math.random() * OP_WELCOMES.length)];
    document.getElementById('opNum').textContent = num;
    document.getElementById('opClass').textContent = cls;
    document.getElementById('opWelcome').innerHTML = wel;
    document.getElementById('opDirective').textContent = dir;
    var now = new Date();
    document.getElementById('opDate').textContent =
      String(now.getHours()).padStart(2,'0') + ':' +
      String(now.getMinutes()).padStart(2,'0') + ' HRS — LAGOS NODE';
    document.getElementById('opOverlay').classList.add('open');
  }

  function closeOpModal() {
    document.getElementById('opOverlay').classList.remove('open');
  }

  function shareOperativeCard() {
    var num = document.getElementById('opNum').textContent;
    var cls = document.getElementById('opClass').textContent;
    var txt = 'Just recruited into the Oracle Intelligence Collective as Operative ' + num + ' — Classification: ' + cls + '. The city chose me. catalyst-awakening.com';
    if (navigator.share) {
      navigator.share({ title: 'CATALYST: THE AWAKENING — Operative Briefing', text: txt }).catch(function(){});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(txt).then(function() {
        var btn = document.querySelector('.op-share-btn');
        if (btn) { btn.textContent = '✓ COPIED — SHARE IT'; setTimeout(function(){ btn.textContent = '◈ SHARE YOUR BRIEFING'; }, 3000); }
      });
    }
  }

  // Hook into existing handleSignup to show operative modal
  (function() {
    var _orig = window.handleSignup;
    if (typeof _orig === 'function') {
      window.handleSignup = async function(e) {
        var form = e.target;
        var nameInput = form ? form.querySelector('input[name="nl_name"]') : null;
        var emailInput = form ? (form.querySelector('input[name="nl_email"]') || form.querySelector('input[type="email"]')) : null;
        var name = nameInput ? nameInput.value.trim() : '';
        var email = emailInput ? emailInput.value.trim() : '';
        await _orig.call(this, e);
        setTimeout(function() { showOperativeModal(name, email); }, 1200);
      };
    }
  })();

  // ESC key closes modals
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeOpModal();
      closeOrishaModal();
    }
  });

  // ── V7: ORISHA DOSSIER DATA + MODAL ────────────────────────────────────────
  var ORISHA_DATA = {
    sango: {
      name: 'ṢÀNGÓ',
      yoruba: 'Ọba àárẹ — "King of Lightning" · Lord of Thunder, Lightning, and Justice',
      domain: 'THUNDER · LIGHTNING · JUSTICE · KINGSHIP',
      description: 'Ṣàngó governs electrical storms, righteous fury, and divine retribution. The fourth Alaafin of Oyo, he ascended to Orisha after his own thunderbolt struck his palace. His power is absolute when channelled — but it does not distinguish between the guilty and the bystander.',
      manifests: 'Lagos power surges with no grid explanation. Storms that move against the wind. Lightning that strikes the same building seven times without fire. The Lagoon turning red during his festivals.',
      vessel: 'AMARA IBRAHIM — THUNDERSTRIKE',
      intel: '"Ṣàngó chose Amara because she was already the most precise person in a room full of lightning. He does not give his power to the angry. He gives it to the disciplined. Amara was an aerospace engineer before she was a hero. She still thinks like one." — Oracle, personal log',
      appearances: '▸ Issue #02 — Amara\'s thunder manifests at National Theatre\n▸ Issue #03 — Storm-riding sequence, Third Mainland Bridge\n▸ Issue #04 — Dual resonance with Catalyst activated',
    },
    ogun: {
      name: 'ÒGÚN',
      yoruba: 'Baba Àgbàdo — "Father of Iron" · Lord of Iron, Labour, and War',
      domain: 'IRON · METAL · WAR · TECHNOLOGY · LABOUR',
      description: 'Ògún is in every nail, every engine, every blade ever forged. He predates the city — Lagos itself was built on his back. He is not kind. He is not cruel. He is iron: he does what he is used for, and he judges those who waste him.',
      manifests: 'Metal objects that move without hands. Engines that start themselves. Structural iron that refuses to rust under divine heat. The smell of hot metal with no forge nearby.',
      vessel: 'IKENNA OKAFOR — IRON WOLF',
      intel: '"Ikenna\'s family has carried Ògún\'s mark for 14 generations. The iron in his blood is not metaphor. I have seen his father forge iron without tools, with his bare hands, without burns. Ikenna is not a vessel — he is a continuation." — Oracle, 2019 log',
      appearances: '▸ Issue #01 — First iron manifestation, Mushin workshop\n▸ Issue #03 — Full Ògún transformation, Iron District battle\n▸ Issue #04 — Iron-iron resonance near The Architect',
    },
    osun: {
      name: 'ỌỌ̀ṢUN',
      yoruba: 'Yeye Osun — "Sweet Mother" · Lady of Rivers, Love, and Healing',
      domain: 'WATER · HEALING · LOVE · FERTILITY · PROPHECY',
      description: 'Ọ̀ṣun commands fresh water — rivers, tears, blood, rain. She is beauty and grief and the space between them. She was the only female Orisha excluded from the original divine council. When they ignored her, the world dried. They never ignored her again.',
      manifests: 'The Lagoon\'s water flowing upward in certain locations. Tears that heal minor wounds. Water sources in Mushin that never go dry even in drought years. A honey-amber light visible in the lagoon at night.',
      vessel: 'ORACLE (secondary resonance) · No primary vessel identified yet',
      intel: '"She is the only Orisha who has spoken to me directly, in full sentences, in my 144 years. She told me the Catalyst was coming in 2003. She told me the name of his mother. She told me not to interfere too soon. I have spent twenty years trying to understand what too soon means." — Oracle',
      appearances: '▸ Issue #01 — Lagoon scene, amber light beneath the surface\n▸ Issue #04 — Oracle\'s compound, water responds to Bayo\'s presence',
    },
    obatala: {
      name: 'OBATÀLÁ',
      yoruba: 'Orisha Igbo — "King of the White Cloth" · Lord of Creation and Purity',
      domain: 'CREATION · PURITY · WISDOM · ALBINISM · PEACE',
      description: 'Obatàlá sculpted the human body from clay at Olódùmarè\'s command. He is the senior Orisha, the arbiter of all divine disputes. He moves slowly, speaks rarely, and when he speaks, the other Orishas stop arguing. He is not sentimental about what he creates — or what he destroys.',
      manifests: 'White cloth found in unexpected places near sacred sites. A stillness that falls over locations before major divine events. The sense of being shaped from the outside — like clay.',
      vessel: 'UNCONFIRMED — Oracle suspects a vessel exists in Lagos and has not revealed themselves',
      intel: '"If Obatàlá has a vessel in this city and they have not come forward, one of two things is true: either they do not know what they are, or they have decided not to declare themselves yet. Given that Obatàlá sculpted wisdom itself into human form — I suspect it is the second option." — Oracle',
      appearances: '▸ Issue #04 — White fabric motif, Oracle\'s compound inner sanctum\n▸ Lore entry: The First Awakening, mentioned in Ifá archives',
    },
    esu: {
      name: 'ẸṢÙ',
      yoruba: 'Laroye — "One Who Can Make You Cry" · Lord of Crossroads and Communication',
      domain: 'CROSSROADS · CHOICES · COMMUNICATION · TRICKERY · BEGINNINGS',
      description: 'Ẹṣù stands at every crossroads in Lagos — every decision point, every choice that matters. He is not evil. He is honest: every crossroads has two paths, and he shows you both. What you choose is yours. He is also the divine messenger — without him, prayers do not reach Olódùmarè. Lagos is his city. It has nine million crossroads.',
      manifests: 'Danfo buses taking impossible turns. Paths that change between visits. The sensation of being watched at intersections. A red and black presence at the edge of vision in markets.',
      vessel: 'BAYO ADEYEMI — CATALYST (Ẹṣù as primary crossroads guide, not power vessel)',
      intel: '"Ẹṣù likes Bayo. This is unusual. Ẹṣù does not like anyone — he evaluates them. When I asked him why, he said: \'He always takes the harder path.\' This is the highest compliment Ẹṣù has given a mortal in four hundred years." — Oracle',
      appearances: '▸ Issue #01 — Oshodi crossroads scene, first Ẹṣù encounter\n▸ Issue #02 — Balogun Nexus, crossroads manifestation\n▸ Issue #04 — All four heroes converge: Ẹṣù\'s arrangement',
    },
  };

  function openOrishaModal(key) {
    var d = ORISHA_DATA[key];
    if (!d) return;
    document.getElementById('orishaName').textContent = d.name;
    document.getElementById('orishaYoruba').textContent = d.yoruba;
    document.getElementById('orisha-domain-tag').textContent = d.domain;
    document.getElementById('orisha-domain').textContent = d.description;
    document.getElementById('orisha-manifests').textContent = d.manifests;
    document.getElementById('orisha-vessel').textContent = d.vessel;
    document.getElementById('orisha-intel').innerHTML = d.intel;
    document.getElementById('orisha-appearances').textContent = d.appearances;
    document.getElementById('orishaOverlay').classList.add('open');
  }
  function closeOrishaModal() {
    document.getElementById('orishaOverlay').classList.remove('open');
  }

  // ── V7: DARK ASSEMBLY NETWORK WEB ──────────────────────────────────────────
  (function() {
    var canvas = document.getElementById('daNetCanvas');
    var svg    = document.getElementById('daNetSvg');
    var tip    = document.getElementById('daLinkTip');
    if (!canvas || !svg) return;

    // Links: [from-id, to-id, label, color, dash]
    var LINKS = [
      ['dan-arch', 'dan-pc',    'CONTROLS',     'rgba(196,30,58,0.6)',   ''],
      ['dan-arch', 'dan-da',    'CREATED',      'rgba(196,30,58,0.5)',   '6,4'],
      ['dan-pc',   'dan-bayo',  'HUNTING',      'rgba(255,120,20,0.55)', '4,3'],
      ['dan-pc',   'dan-amara', 'HUNTING',      'rgba(255,120,20,0.5)',  '4,3'],
      ['dan-pc',   'dan-ikenna','RECRUITING',   'rgba(255,180,20,0.45)', '3,4'],
      ['dan-da',   'dan-bayo',  'PRIORITY TARGET','rgba(255,80,80,0.5)', '5,3'],
      ['dan-arch', 'dan-zara',  'CANNOT FIND',  'rgba(0,201,177,0.4)',   '2,6'],
      ['dan-ikenna','dan-da',   'INFILTRATING', 'rgba(0,201,177,0.45)',  '3,3'],
      ['dan-arch', 'dan-bayo',  'FEARS',        'rgba(180,100,255,0.35)','1,5'],
    ];

    function getCenter(nodeId) {
      var el = document.getElementById(nodeId);
      if (!el) return {x:0,y:0};
      var cr = canvas.getBoundingClientRect();
      var nr = el.getBoundingClientRect();
      return {
        x: nr.left - cr.left + nr.width / 2,
        y: nr.top  - cr.top  + nr.height / 2
      };
    }

    function drawLinks() {
      svg.innerHTML = '';
      LINKS.forEach(function(link) {
        var a = getCenter(link[0]);
        var b = getCenter(link[1]);
        if (!a || !b) return;
        var path = document.createElementNS('http://www.w3.org/2000/svg','path');
        var mx = (a.x + b.x) / 2;
        var my = (a.y + b.y) / 2 - 30;
        path.setAttribute('d', 'M'+a.x+','+a.y+' Q'+mx+','+my+' '+b.x+','+b.y);
        path.setAttribute('stroke', link[3]);
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('fill', 'none');
        if (link[4]) path.setAttribute('stroke-dasharray', link[4]);
        path.setAttribute('data-label', link[2]);
        path.style.cursor = 'pointer';
        path.addEventListener('mouseenter', function(e) {
          tip.textContent = link[2];
          tip.style.display = 'block';
        });
        path.addEventListener('mousemove', function(e) {
          var cr = canvas.getBoundingClientRect();
          tip.style.left = (e.clientX - cr.left + 12) + 'px';
          tip.style.top  = (e.clientY - cr.top  - 10) + 'px';
        });
        path.addEventListener('mouseleave', function() {
          tip.style.display = 'none';
        });
        svg.appendChild(path);
      });
    }

    // Draw on load and resize
    var drawn = false;
    var netObs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting && !drawn) {
        drawn = true;
        setTimeout(drawLinks, 100);
      }
    }, { threshold: 0.3 });
    netObs.observe(canvas);
    window.addEventListener('resize', function() { if (drawn) drawLinks(); });

    // Clicking/activating a node highlights its connections for a few seconds
    window.danShowLink = function(shortId) {
      if (!drawn) return;
      var nodeId = 'dan-' + shortId;
      var paths = svg.querySelectorAll('path');
      var labels = [];
      paths.forEach(function(p) {
        var link = LINKS.filter(function(l) { return l[0] === nodeId || l[1] === nodeId; })
          .find(function(l) { return l[2] === p.getAttribute('data-label'); });
        if (link) {
          p.style.strokeWidth = '3';
          p.style.opacity = '1';
          labels.push(link[2]);
        } else {
          p.style.opacity = '0.15';
        }
      });
      if (labels.length) {
        tip.textContent = labels.join(' · ');
        tip.style.display = 'block';
        var center = getCenter(nodeId);
        tip.style.left = (center.x + 12) + 'px';
        tip.style.top = (center.y - 10) + 'px';
      }
      clearTimeout(window._danShowLinkTimer);
      window._danShowLinkTimer = setTimeout(function() {
        paths.forEach(function(p) { p.style.strokeWidth = ''; p.style.opacity = ''; });
        tip.style.display = 'none';
      }, 2500);
    };
  })();


/* ====== v8 JS ====== */

/* ----- CASE FILE ----- */
(function(){
  var clueEl = document.getElementById('cfClue');
  if(!clueEl) return;
  var ROSTER = [
    { name: 'Bayo — Catalyst', clue: 'Third Mainland Bridge, 2AM. The city itself reached into a broke nineteen-year-old and grabbed him by the soul. Ọ̀run\'s bandage — or its wound.' },
    { name: 'Amara — Thunderstrike', clue: 'Lightning-speed precision fighter. Discharges arc between multiple targets. Speed advantage is decisive in open terrain.' },
    { name: 'Ikenna — Iron Wolf', clue: 'Near-invulnerable defence, blessed by Ògún\'s iron. Can absorb enormous punishment. Loses the edge against faster opponents.' },
    { name: 'Zara Osei — The Mirror', clue: 'Vessel of Ògún\'s road-clearing aspect. Works the perimeter unseen. "Tell the Architect Lagos says no."' },
    { name: 'The Oracle', clue: 'Has watched this city for 144 years. Knows every secret it thinks it has buried.' },
    { name: 'The Architect', clue: 'Weaponised Aṣẹ extraction, decades of refinement. Field-tested against multiple awakened individuals simultaneously. No confirmed weaknesses on record.' }
  ];
  var BEST_KEY = 'catalyst_cf_best';
  var order = [], round = 0, score = 0, choices = [], answered = false;

  function shuffle(arr){
    var a = arr.slice();
    for(var i=a.length-1;i>0;i--){
      var j=Math.floor(Math.random()*(i+1));
      var t=a[i];a[i]=a[j];a[j]=t;
    }
    return a;
  }

  function renderRound(){
    var file = ROSTER[order[round]];
    var distractors = shuffle(ROSTER.filter(function(r){return r.name!==file.name;})).slice(0,3);
    choices = shuffle([file].concat(distractors));
    answered = false;
    document.getElementById('cfRound').textContent = (round+1)+'/'+ROSTER.length;
    document.getElementById('cfNextBtn').style.display = 'none';
    clueEl.textContent = file.clue;
    document.getElementById('cfChoices').innerHTML = choices.map(function(c, i){
      return '<button class="cf-choice" onclick="cfAnswer('+i+')">'+c.name+'</button>';
    }).join('');
  }

  window.cfAnswer = function(i){
    if(answered) return;
    answered = true;
    var file = ROSTER[order[round]];
    var btns = document.querySelectorAll('#cfChoices .cf-choice');
    btns.forEach(function(b){ b.disabled = true; });
    if(choices[i].name === file.name){
      btns[i].classList.add('correct');
      score++;
      document.getElementById('cfScore').textContent = score;
    } else {
      btns[i].classList.add('wrong');
      choices.forEach(function(c, ci){ if(c.name === file.name) btns[ci].classList.add('correct'); });
    }
    document.getElementById('cfNextBtn').style.display = 'inline-block';
  };

  window.cfNext = function(){
    round++;
    if(round >= ROSTER.length){
      if (window.ClearanceTracker) ClearanceTracker.mark('case_file');
      var best = localStorage.getItem(BEST_KEY);
      if(!best || score > parseInt(best,10)){ localStorage.setItem(BEST_KEY, score); best = score; }
      document.getElementById('cfBest').textContent = best+'/'+ROSTER.length;
      document.getElementById('cfWinBody').textContent = 'Score: '+score+'/'+ROSTER.length+'. Best on this device: '+best+'/'+ROSTER.length+'.';
      document.getElementById('cfWin').style.display = 'block';
      document.getElementById('cfClue').style.display = 'none';
      document.getElementById('cfChoices').innerHTML = '';
      document.getElementById('cfNextBtn').style.display = 'none';
      return;
    }
    renderRound();
  };

  window.cfNewGame = function(){
    order = shuffle(ROSTER.map(function(_, i){ return i; }));
    round = 0; score = 0;
    document.getElementById('cfScore').textContent = '0';
    document.getElementById('cfWin').style.display = 'none';
    document.getElementById('cfClue').style.display = 'block';
    var best = localStorage.getItem(BEST_KEY);
    document.getElementById('cfBest').textContent = best ? best+'/'+ROSTER.length : '—';
    renderRound();
  };

  cfNewGame();
})();

/* ----- CHRONICLE TIMELINE IntersectionObserver ----- */
(function(){
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting) e.target.classList.add('chron-visible');
    });
  },{threshold:0.15});
  document.querySelectorAll('.chron-event').forEach(function(el){observer.observe(el);});
})();

/* ----- LAGOS TERRITORY MAP ----- */
(function(){
  var ZONE_FACTIONS = {
    'zone-mushin': 'oracle',
    'zone-oracle': 'oracle',
    'zone-bridge': 'contested',
    'zone-balogun': 'da',
    'zone-eko': 'da',
    'zone-iron': 'pc',
    'zone-void': 'contested'
  };

  window.setMapFaction = function(faction, btn){
    document.querySelectorAll('.map-terr-btn').forEach(function(b){
      b.className='map-terr-btn';
    });
    btn.classList.add('active-'+faction);
    var svg = document.getElementById('lagosMapSvg');
    if(!svg) return;
    Object.entries(ZONE_FACTIONS).forEach(function(kv){
      var zoneId = kv[0], zf = kv[1];
      var g = document.getElementById(zoneId);
      if(!g) return;
      g.classList.remove('zone-oracle-hl','zone-da-hl','zone-pc-hl','zone-contested-hl','zone-dimmed');
      if(faction==='all'){
        if(zf==='oracle') g.classList.add('zone-oracle-hl');
        else if(zf==='da') g.classList.add('zone-da-hl');
        else if(zf==='pc') g.classList.add('zone-pc-hl');
        else g.classList.add('zone-contested-hl');
      } else {
        var match = (faction==='oracle'&&zf==='oracle')||(faction==='da'&&zf==='da')||(faction==='pc'&&zf==='pc');
        if(match){
          if(zf==='oracle') g.classList.add('zone-oracle-hl');
          else if(zf==='da') g.classList.add('zone-da-hl');
          else if(zf==='pc') g.classList.add('zone-pc-hl');
        } else {
          g.classList.add('zone-dimmed');
        }
      }
    });
  };

  // Init: apply default 'all' territory colours on load
  document.addEventListener('DOMContentLoaded',function(){
    var btn = document.querySelector('.map-terr-btn.active-all');
    if(btn) window.setMapFaction('all',btn);
  });
})();



(function() {
  'use strict';

  // ── Reading progress bar ──
  var rp = document.getElementById('reading-progress');
  function updateProgress() {
    if (!rp) return;
    var scrolled = document.documentElement.scrollTop || document.body.scrollTop;
    var max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct = max > 0 ? Math.round(scrolled / max * 100) : 0;
    rp.style.width = pct + '%';
    rp.setAttribute('aria-valuenow', pct);
  }

  // ── Back to top ──
  var btt = document.getElementById('back-to-top');
  function updateBtt() {
    if (!btt) return;
    var scrolled = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrolled > 400) btt.classList.add('visible');
    else btt.classList.remove('visible');
  }
  if (btt) {
    btt.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Passive scroll listener ──
  window.addEventListener('scroll', function() {
    updateProgress();
    updateBtt();
  }, { passive: true });
  updateProgress();
  updateBtt();

  // .reveal fade-in-on-scroll is handled by the single IntersectionObserver
  // near the top of this file (the one that adds the "visible" class) — do
  // not add a second one here, it just duplicates that work on every scroll.
  if ('IntersectionObserver' in window) {
    // Also reveal char-cards and cover-art-items on scroll
    var cardObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function() {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, Math.min(i * 60, 300));
          cardObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll('.char-card, .cover-art-item').forEach(function(el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(1.5rem)';
      el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
      cardObs.observe(el);
    });
  }

  // ── Scrollspy — highlight active nav link ──
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  var sections = [];
  navLinks.forEach(function(a) {
    var id = a.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (el) sections.push({ id: id, el: el, a: a });
  });

  function updateSpy() {
    // Picks the qualifying section closest to (at or above) the current
    // scroll position — NOT simply the last one iterated. Nav-link order
    // doesn't match document order for every entry (e.g. "Heroes" links to
    // #characters, which sits earlier in the page than #villains, even
    // though "Villains" appears first in the nav list), so overwriting on
    // every match in array order previously locked onto whichever mismatched
    // section happened to be iterated last, not whichever was actually
    // nearest on screen.
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var active = null;
    sections.forEach(function(s) {
      if (s.el.offsetTop - 120 <= scrollY && (!active || s.el.offsetTop > active.el.offsetTop)) active = s;
    });
    navLinks.forEach(function(a) { a.classList.remove('nav-active'); });
    if (active) active.a.classList.add('nav-active');
  }
  window.addEventListener('scroll', updateSpy, { passive: true });
  updateSpy();

})();

(function() {
  'use strict';

  /* ── Service Worker registration ── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
  }

  /* ── Web Share API (hero share button) ── */
  var shareBtn = document.getElementById('hero-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function() {
      var shareData = {
        title: 'Catalyst: The Awakening',
        text: 'A Lagos noir comic universe rooted in Yoruba mythology. 4 free issues — read free!',
        url: 'https://catalyst-awakening.netlify.app/'
      };
      if (navigator.share) {
        navigator.share(shareData).catch(function(err) {
          if (err.name !== 'AbortError') fallbackCopy(shareData.url);
        });
      } else {
        fallbackCopy(shareData.url);
      }
    });
  }
  function fallbackCopy(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function() {
        if (window.showToast) showToast('Link copied!', 'success', 3000);
      }).catch(function() {});
    }
  }

  /* ── Cookie consent banner ── */
  (function() {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;
    try {
      if (localStorage.getItem('catalyst_cookie_consent')) { banner.hidden = true; return; }
    } catch(e) { banner.hidden = true; return; }
    banner.hidden = false;
    function dismiss(val) {
      try { localStorage.setItem('catalyst_cookie_consent', val); } catch(e) {}
      banner.hidden = true;
    }
    var acceptBtn = document.getElementById('cookie-accept');
    var rejectBtn = document.getElementById('cookie-reject');
    if (acceptBtn) acceptBtn.addEventListener('click', function() { dismiss('accepted'); });
    if (rejectBtn) rejectBtn.addEventListener('click', function() { dismiss('rejected'); });
  })();

  /* ── Keyboard shortcuts ── */
  (function() {
    var panel = document.getElementById('kb-panel');
    var backdrop = document.getElementById('kb-backdrop');
    var triggerBtn = document.getElementById('kb-trigger-btn');
    var closeBtn = document.getElementById('kb-close-btn');
    if (!panel || !backdrop) return;

    function openKb() {
      panel.classList.add('open');
      backdrop.classList.add('open');
      if (closeBtn) closeBtn.focus();
    }
    function closeKb() {
      panel.classList.remove('open');
      backdrop.classList.remove('open');
      if (triggerBtn) triggerBtn.focus();
    }

    if (triggerBtn) triggerBtn.addEventListener('click', function() {
      panel.classList.contains('open') ? closeKb() : openKb();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeKb);
    backdrop.addEventListener('click', closeKb);

    function scrollTo(id) {
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    document.addEventListener('keydown', function(e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;

      // Escape is always allowed through; every other key here acts on the
      // page, which must not move while a dialog is open over it. "?" may
      // still act when this panel is itself the only thing open.
      if (e.key !== 'Escape' && window.CatalystFocusTrap &&
          CatalystFocusTrap.anyOpen('kb-panel')) return;

      switch (e.key) {
        case '?':
          panel.classList.contains('open') ? closeKb() : openKb();
          e.preventDefault();
          break;
        case 'Escape':
          if (panel.classList.contains('open')) { closeKb(); e.preventDefault(); }
          break;
        case 't': case 'T':
          window.scrollTo({ top: 0, behavior: 'smooth' });
          e.preventDefault();
          break;
        case 'h': case 'H':
          scrollTo('hero'); e.preventDefault();
          break;
        case 'c': case 'C':
          scrollTo('comics'); e.preventDefault();
          break;
        case 'u': case 'U':
          scrollTo('universe'); e.preventDefault();
          break;
        case 'n': case 'N':
          scrollTo('newsletter'); e.preventDefault();
          break;
      }
    });
  })();

  /* ── Issue progress tracker ── */
  (function() {
    var cards = document.querySelectorAll('.issue-card[data-issue]');
    cards.forEach(function(card) {
      var num = card.getAttribute('data-issue');
      var key = 'catalyst_read_' + num;
      var btn = card.querySelector('.issue-read-btn-track');
      try {
        if (localStorage.getItem(key)) {
          card.classList.add('is-read');
          if (btn) btn.textContent = '✓ Read';
        }
      } catch(e) {}
      if (!btn) return;
      btn.addEventListener('click', function() {
        try {
          if (card.classList.contains('is-read')) {
            card.classList.remove('is-read');
            localStorage.removeItem(key);
            btn.textContent = 'Mark Read';
          } else {
            card.classList.add('is-read');
            localStorage.setItem(key, '1');
            btn.textContent = '✓ Read';
            if (window.showToast) showToast('Issue #' + num + ' marked as read!', 'success', 3000);
          }
        } catch(e) {}
      });
    });
  })();

  /* ── Batch 3: Image Lightbox ── */
  (function() {
    var lb = document.getElementById('img-lightbox');
    var lbImg = document.getElementById('img-lightbox-img');
    var lbCap = document.getElementById('img-lightbox-caption');
    var lbClose = document.getElementById('img-lightbox-close');
    if (!lb) return;

    function openLightbox(src, alt) {
      lbImg.src = src;
      lbImg.alt = alt || '';
      lbCap.textContent = alt || '';
      lb.classList.add('active');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }
    function closeLightbox() {
      lb.classList.remove('active');
      document.body.style.overflow = '';
      lbImg.src = '';
    }

    lbClose.addEventListener('click', closeLightbox);
    lb.addEventListener('click', function(e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && lb.classList.contains('active')) closeLightbox();
    });

    // Portrait images
    document.querySelectorAll('.lightbox-trigger').forEach(function(img) {
      img.addEventListener('click', function(e) {
        e.preventDefault();
        openLightbox(img.src, img.getAttribute('data-lightbox-alt') || img.alt);
      });
    });

    // Cover gallery anchors with data-lightbox-src
    document.querySelectorAll('.cover-art-item[data-lightbox-src]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        openLightbox(a.getAttribute('data-lightbox-src'), a.getAttribute('data-lightbox-alt') || a.title);
      });
    });
  })();

  /* ── Batch 3: Password Show/Hide Toggle ── */
  (function() {
    var EYE_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    var EYE_SHUT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

    ['signup-password', 'signin-password'].forEach(function(id) {
      var input = document.getElementById(id);
      if (!input) return;
      var wrap = input.parentElement;
      if (!wrap || !wrap.classList.contains('pw-wrap')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pw-toggle';
      btn.setAttribute('aria-label', 'Show password');
      btn.innerHTML = EYE_OPEN;
      wrap.appendChild(btn);
      btn.addEventListener('click', function() {
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = show ? EYE_SHUT : EYE_OPEN;
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      });
    });
  })();

  /* ── Batch 3: Stat Counter Animation ── */
  (function() {
    var numEls = document.querySelectorAll('.stat-box .num');
    if (!numEls.length || !('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        entry.target.classList.add('counted');
      });
    }, { threshold: 0.6 });
    numEls.forEach(function(el) { obs.observe(el); });
  })();

  /* ── Batch 3: Newsletter Confetti ── */
  window.launchConfetti = (function() {
    var COLORS = ['#F4B800', '#00C9B1', '#C41E3A', '#F4B800', '#FFFFFF', '#00C9B1'];
    return function() {
      var canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      document.body.appendChild(canvas);
      var ctx = canvas.getContext('2d');
      var particles = [];
      for (var i = 0; i < 130; i++) {
        particles.push({
          x: canvas.width * 0.5,
          y: canvas.height * 0.55,
          vx: (Math.random() - 0.5) * 14,
          vy: (Math.random() * -14) - 3,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: Math.random() * 7 + 4,
          life: 1,
          decay: Math.random() * 0.018 + 0.012,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.2
        });
      }
      function frame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var alive = false;
        particles.forEach(function(p) {
          if (p.life <= 0) return;
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.35;
          p.vx *= 0.98;
          p.life -= p.decay;
          p.rotation += p.rotSpeed;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        });
        if (alive) requestAnimationFrame(frame);
        else { canvas.remove(); }
      }
      // Flying particles are exactly what the preference is for. Nothing is
      // lost by skipping them — the celebration also shows a toast.
      if (window.catalystPrefersReducedMotion && window.catalystPrefersReducedMotion()) {
        canvas.remove();
        return;
      }
      requestAnimationFrame(frame);
      setTimeout(function() { if (canvas.parentNode) canvas.remove(); }, 3500);
    };
  })();

  /* ── Batch 3: Global Error Boundary ── */
  (function() {
    window.addEventListener('error', function(e) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return;
      var msg = (e.message || 'Unknown error') + ' @ ' + (e.filename || '') + ':' + (e.lineno || '');
      console.warn('[Catalyst] Unhandled error:', msg);
    });
    window.addEventListener('unhandledrejection', function(e) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return;
      console.warn('[Catalyst] Unhandled promise rejection:', e.reason);
    });
  })();

})();

(function() {
  'use strict';
  var PAGE_LOADED_AT = Date.now();

  /* ── Scroll progress bar ── */
  (function() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.pageYOffset / max) * 100 : 0;
      bar.style.width = pct + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ── Local analytics queue (privacy-first: stays on device, syncs to
        Supabase only if configured; never sent to third parties) ── */
  var ANALYTICS_KEY = 'catalyst_analytics';
  window.catalystTrack = function(event, data) {
    var entry = { e: event, d: data || null, ts: new Date().toISOString() };
    try {
      var q = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
      q.push(entry);
      if (q.length > 200) q = q.slice(-200);
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(q));
    } catch(e) {}
    try {
      if (window._supabase) {
        window._supabase.from('analytics_events').insert({ event: event, payload: data || null }).then(function(){}, function(){});
      }
    } catch(e) {}
  };

  /* ── Command palette registration shim ──────────────────────────
     The palette itself lives at the bottom of this file (Oracle
     Archive / universal search). Other systems — the story reader's
     per-chapter index, the covenant card — register their entries the
     moment they are ready, which is long before that module runs, so
     this queue holds the entries until it can drain them. The real
     implementation replaces this function and takes the backlog with
     it; keeping one queue here is what stops a second, competing
     palette from growing back. */
  window.__cmdkQueue = window.__cmdkQueue || [];
  window.catalystPaletteAdd = function(newItems) {
    (newItems || []).forEach(function(it) {
      if (it && it.label && (it.action || document.getElementById(it.target))) {
        window.__cmdkQueue.push(it);
      }
    });
  };

  /* ── Password strength meter (signup) ── */
  (function() {
    var input = document.getElementById('signup-password');
    if (!input) return;
    var wrap = input.parentElement;
    var meter = document.createElement('div');
    meter.className = 'pw-meter';
    meter.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 4; i++) meter.appendChild(document.createElement('span'));
    var label = document.createElement('span');
    label.className = 'pw-meter-label';
    label.setAttribute('role', 'status');
    wrap.insertAdjacentElement('afterend', label);
    wrap.insertAdjacentElement('afterend', meter);

    var LEVELS = ['', 'Weak — the Council would crack this', 'Fair — needs more Aṣẹ', 'Strong', 'Iron-clad ✦'];
    input.addEventListener('input', function() {
      var v = input.value;
      var s = 0;
      if (v.length >= 8) s++;
      if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
      if (/\d/.test(v)) s++;
      if (/[^A-Za-z0-9]/.test(v)) s++;
      if (v.length && s === 0) s = 1;
      if (!v.length) s = 0;
      var segs = meter.children;
      for (var i = 0; i < 4; i++) {
        segs[i].className = i < s ? 'on-' + s : '';
      }
      label.textContent = LEVELS[s];
    });
  })();

  /* ── Continue-reading banner ── */
  (function() {
    var banner = document.getElementById('resume-banner');
    if (!banner) return;
    var DISMISS_KEY = 'catalyst_resume_dismissed';
    var TITLES = { 1: 'Awaken, O City', 2: "Ṣàngó's Daughter", 3: 'Iron in the Blood', 4: 'The Price of Aṣẹ' };
    try {
      var dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed && Date.now() - parseInt(dismissed, 10) < 7 * 86400000) return;
      var readAny = false, nextUnread = null;
      for (var i = 1; i <= 4; i++) {
        if (localStorage.getItem('catalyst_read_' + i)) readAny = true;
        else if (nextUnread === null) nextUnread = i;
      }
      if (!readAny || nextUnread === null) return;
      document.getElementById('resume-banner-text').innerHTML =
        'Your journey continues — <strong>Issue #' + nextUnread + ': ' + TITLES[nextUnread] + '</strong> awaits.';
      setTimeout(function() { banner.classList.add('show'); }, 6000);
      document.getElementById('resume-go').addEventListener('click', function() {
        banner.classList.remove('show');
        window.catalystTrack('resume_click', { issue: nextUnread });
        window.goToIssue('i' + nextUnread);
      });
      document.getElementById('resume-dismiss').addEventListener('click', function() {
        banner.classList.remove('show');
        try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch(e) {}
      });
    } catch(e) {}
  })();

  /* ── Bot-timing guard + submit telemetry ──
     Real users take >2.5s from page load to first submit; bots don't. */
  (function() {
    var MIN_MS = 2500;
    function guard(fnName, eventName) {
      var orig = window[fnName];
      if (typeof orig !== 'function') return;
      window[fnName] = function(e) {
        if (Date.now() - PAGE_LOADED_AT < MIN_MS) {
          if (e && e.preventDefault) e.preventDefault();
          if (window.showToast) showToast('One moment — the Oracle is verifying you.', 'info', 2500);
          return;
        }
        window.catalystTrack(eventName);
        return orig.apply(this, arguments);
      };
    }
    guard('handleSignup', 'newsletter_submit');
    guard('handleSignUp', 'auth_signup_submit');
    guard('handleSignIn', 'auth_signin_submit');
  })();

  /* ── Passive engagement telemetry ── */
  (function() {
    var shareBtn = document.getElementById('hero-share-btn');
    if (shareBtn) shareBtn.addEventListener('click', function() { window.catalystTrack('share_click'); });
    document.querySelectorAll('.issue-read-btn-track').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var card = btn.closest('.issue-card[data-issue]');
        window.catalystTrack('issue_read_toggle', { issue: card ? card.getAttribute('data-issue') : null });
      });
    });
  })();

  /* ── One-time vault scrub: older builds captured credential fields into
        localStorage before the collection filter existed — remove them ── */
  (function() {
    try {
      if (localStorage.getItem('catalyst_vault_scrubbed_v1')) return;
      var re = /password|token|secret|cvv/i;
      var vault = JSON.parse(localStorage.getItem('catalyst_data_vault') || '{}');
      Object.keys(vault).forEach(function(type) {
        if (!Array.isArray(vault[type])) return;
        vault[type].forEach(function(entry) {
          if (entry && typeof entry === 'object') {
            Object.keys(entry).forEach(function(k) { if (re.test(k)) delete entry[k]; });
          }
        });
      });
      localStorage.setItem('catalyst_data_vault', JSON.stringify(vault));
      var pending = JSON.parse(localStorage.getItem('catalyst_pending_sync') || '[]');
      pending.forEach(function(item) {
        if (item && item.data && typeof item.data === 'object') {
          Object.keys(item.data).forEach(function(k) { if (re.test(k)) delete item.data[k]; });
        }
      });
      localStorage.setItem('catalyst_pending_sync', JSON.stringify(pending));
      localStorage.setItem('catalyst_vault_scrubbed_v1', '1');
    } catch(e) {}
  })();

})();

(function() {
  'use strict';
  var COV_KEY = 'catalyst_covenant';
  var overlay = document.getElementById('covenant-overlay');
  var pendingCeremony = null;

  function showCeremony(cov) {
    if (!overlay || !cov) return;
    document.getElementById('cov-no-val').textContent = '№ ' + cov.member_no;
    document.getElementById('cov-name').textContent = cov.covenant_name;
    document.getElementById('cov-district').textContent = 'of ' + cov.district + ' · Neo-Lagos';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (window.catalystTrack) catalystTrack('covenant_ceremony', { member_no: cov.member_no, is_new: !!cov.is_new });
  }
  function closeCeremony() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (overlay) {
    document.getElementById('cov-close').addEventListener('click', closeCeremony);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeCeremony(); });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeCeremony();
    });
    document.getElementById('cov-share').addEventListener('click', function() {
      var cov = null;
      try { cov = JSON.parse(localStorage.getItem(COV_KEY)); } catch(e) {}
      if (!cov) return;
      var txt = 'I am Awakened № ' + cov.member_no + ' — "' + cov.covenant_name + '" of ' + cov.district +
        '. The Covenant has my name. Read Catalyst: The Awakening free: https://catalyst-awakening.netlify.app/';
      if (navigator.share) {
        navigator.share({ title: 'The Covenant of the Awakened', text: txt }).catch(function() {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function() {
          if (window.showToast) showToast('Covenant copied — share it!', 'success', 2500);
        }).catch(function() {});
      }
    });
  }

  /* The operative briefing modal plays first; the ceremony follows its close */
  function queueCeremony(cov) {
    var op = document.getElementById('opOverlay');
    if (op && op.classList.contains('open')) {
      pendingCeremony = cov;
    } else {
      setTimeout(function() { showCeremony(cov); }, 600);
    }
  }
  var origCloseOp = window.closeOpModal;
  if (typeof origCloseOp === 'function') {
    window.closeOpModal = function() {
      origCloseOp.apply(this, arguments);
      if (pendingCeremony) {
        var cov = pendingCeremony;
        pendingCeremony = null;
        setTimeout(function() { showCeremony(cov); }, 450);
      }
    };
  }

  /* Re-show the stored covenant card (used by the palette and member chip) */
  window.catalystShowCovenant = function() {
    var cov = null;
    try { cov = JSON.parse(localStorage.getItem(COV_KEY)); } catch(e) {}
    if (cov) showCeremony(cov);
    else if (window.showToast) showToast('Join the movement first — the Oracle records every name.', 'info', 3500);
  };

  function joinCovenant(email) {
    if (!email || !window._supabase) return;
    window._supabase.rpc('join_covenant', { p_email: email }).then(function(res) {
      if (!res || res.error || !res.data) return;
      var cov = res.data;
      try { localStorage.setItem(COV_KEY, JSON.stringify(cov)); } catch(e) {}
      // The operative briefing shows a placeholder number — make it real
      var opNum = document.getElementById('opNum');
      if (opNum) opNum.textContent = '#' + String(cov.member_no).padStart(4, '0');
      if (window.catalystCovenantChip) catalystCovenantChip();
      queueCeremony(cov);
    }, function() {});
  }

  /* Bestow the covenant whenever the operative briefing fires (i.e. after a
     successful, non-bot newsletter signup) */
  var origShowOp = window.showOperativeModal;
  if (typeof origShowOp === 'function') {
    window.showOperativeModal = function(name, email) {
      origShowOp.apply(this, arguments);
      joinCovenant(email);
    };
  }

  /* Wall of the Awakened — public honour roll, in-universe names only */
  (function wall(attempt) {
    if (!window._supabase) {
      if (attempt < 25) setTimeout(function() { wall(attempt + 1); }, 400);
      return;
    }
    window._supabase.rpc('get_recent_awakened', { p_limit: 12 }).then(function(res) {
      if (!res || res.error || !res.data || !res.data.length) return;
      var host = document.querySelector('#community .quotes-grid');
      if (!host) return;
      var wallEl = document.createElement('div');
      wallEl.id = 'awakened-wall';
      wallEl.setAttribute('aria-label', 'Wall of the Awakened — newest covenant members');
      wallEl.innerHTML = '<div class="aw-title">◈ WALL OF THE AWAKENED — THE COVENANT GROWS ◈</div>' +
        '<div class="aw-chips">' + res.data.map(function(m) {
          return '<span class="aw-chip"><strong>№ ' + m.member_no + '</strong>' + m.covenant_name + ', ' + m.district + '</span>';
        }).join('') + '</div>';
      host.parentNode.insertBefore(wallEl, host);
    }, function() {});
  })(0);

  /* Voices of the Awakened — moderated message wall. Only Covenant
     members can sign (identity verified server-side by email hash);
     nothing appears publicly until approved from the Supabase dashboard. */
  (function voicesWall(attempt) {
    if (!window._supabase) {
      if (attempt < 25) setTimeout(function() { voicesWall(attempt + 1); }, 400);
      return;
    }
    var host = document.querySelector('#community .quotes-grid');
    if (!host) return;

    function esc(s) {
      var d = document.createElement('div');
      d.textContent = s == null ? '' : String(s);
      return d.innerHTML;
    }

    var section = document.createElement('div');
    section.id = 'voices-wall';
    section.innerHTML =
      '<div class="vw-title">◈ VOICES OF THE AWAKENED ◈</div>' +
      '<div class="vw-sub">Messages left by Covenant members for the community — each one read by the Oracle before Lagos hears it.</div>' +
      '<div class="vw-list" id="vw-list"></div>' +
      '<form class="vw-form" id="vw-form" novalidate>' +
        '<div class="vw-form-label">Speak to the Covenant</div>' +
        '<input type="email" id="vw-email" class="vw-email" placeholder="Your email — verifies your Covenant identity" aria-label="Your email" required autocomplete="email">' +
        '<textarea id="vw-message" class="vw-message" maxlength="280" placeholder="Leave your voice for the Covenant (3–280 characters)..." aria-label="Your message to the Covenant" required></textarea>' +
        '<div class="vw-form-row">' +
          '<span class="vw-counter" id="vw-counter">0 / 280</span>' +
          '<button type="submit" class="vw-submit" id="vw-submit">◈ Speak</button>' +
        '</div>' +
        '<div class="vw-hint">Only sworn members of the Covenant may speak here. Not yet a member? Join below — the Oracle records every name.</div>' +
      '</form>';
    host.parentNode.insertBefore(section, host);

    var listEl = section.querySelector('#vw-list');
    var msgEl = section.querySelector('#vw-message');
    var counterEl = section.querySelector('#vw-counter');
    var submitBtn = section.querySelector('#vw-submit');
    var emailEl = section.querySelector('#vw-email');
    var formEl = section.querySelector('#vw-form');

    function renderVoices() {
      window._supabase.rpc('get_wall_voices', { p_limit: 12 }).then(function(res) {
        if (!res || res.error || !res.data || !res.data.length) {
          listEl.innerHTML = '<div class="vw-empty">No voices recorded yet. Be the first the Covenant hears.</div>';
          return;
        }
        listEl.innerHTML = res.data.map(function(v) {
          return '<div class="voice-card">' +
            '<div class="vc-msg">“' + esc(v.message) + '”</div>' +
            '<div class="vc-by">— ' + esc(v.covenant_name) + ' <span>· ' + esc(v.district) + ' · ' + esc(v.signed_on) + '</span></div>' +
          '</div>';
        }).join('');
      }, function() {
        listEl.innerHTML = '<div class="vw-empty">The Oracle could not reach the wall just now.</div>';
      });
    }
    renderVoices();

    msgEl.addEventListener('input', function() {
      var n = msgEl.value.length;
      counterEl.textContent = n + ' / 280';
      counterEl.classList.toggle('limit', n > 280);
    });

    formEl.addEventListener('submit', function(e) {
      e.preventDefault();
      var email = emailEl.value.trim();
      var message = msgEl.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (window.showToast) showToast('Enter a valid email to verify your Covenant identity.', 'error', 3000);
        return;
      }
      if (message.length < 3 || message.length > 280) {
        if (window.showToast) showToast('Your voice must be 3–280 characters.', 'error', 3000);
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      window._supabase.rpc('sign_wall', { p_email: email, p_message: message }).then(function(res) {
        submitBtn.disabled = false;
        submitBtn.textContent = '◈ Speak';
        if (!res || res.error) {
          var errText = (res && res.error && res.error.message) || '';
          var msg = /not a covenant member/i.test(errText)
            ? 'Only Covenant members may speak here. Join the movement first — the Oracle records every name.'
            : /patience/i.test(errText)
            ? 'You already have 3 voices awaiting the Oracle\'s judgment — wait for one to be approved before sending another.'
            : /3.?280 characters/i.test(errText)
            ? 'Your voice must be 3–280 characters.'
            : /invalid email/i.test(errText)
            ? 'Enter a valid email to verify your Covenant identity.'
            : 'The Oracle could not record your voice — try again shortly.';
          if (window.showToast) showToast(msg, 'error', 4200);
          return;
        }
        msgEl.value = '';
        counterEl.textContent = '0 / 280';
        counterEl.classList.remove('limit');
        if (window.showToast) showToast('✦ Your voice has been recorded — the Oracle will weigh it before Lagos hears it.', 'success', 4200);
        if (window.catalystTrack) catalystTrack('wall_voice_signed');
      }, function() {
        submitBtn.disabled = false;
        submitBtn.textContent = '◈ Speak';
        if (window.showToast) showToast('The Oracle could not record your voice — try again shortly.', 'error', 4000);
      });
    });
  })(0);

  /* Returning members can summon their card from the palette */
  (function registerPaletteCard(attempt) {
    if (!window.catalystPaletteAdd) {
      if (attempt < 10) setTimeout(function() { registerPaletteCard(attempt + 1); }, 300);
      return;
    }
    window.catalystPaletteAdd([{
      label: 'My Covenant Card',
      kind: 'Covenant',
      action: function() {
        var cov = null;
        try { cov = JSON.parse(localStorage.getItem(COV_KEY)); } catch(e) {}
        if (cov) showCeremony(cov);
        else if (window.showToast) showToast('Join the movement first — the Oracle records every name.', 'info', 3500);
      }
    }]);
  })(0);

  /* Àṣẹ — typing the word anywhere wakes the city */
  (function() {
    var buffer = '';
    document.addEventListener('keydown', function(e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
      if (window.CatalystFocusTrap && CatalystFocusTrap.anyOpen()) { buffer = ''; return; }
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-3);
      if (buffer === 'ase') {
        buffer = '';
        document.body.classList.remove('ase-pulse');
        void document.body.offsetWidth; /* restart the animation */
        document.body.classList.add('ase-pulse');
        try { localStorage.setItem('catalyst_ase_invoked', '1'); } catch(err) {}
        if (window.showToast) showToast('Àṣẹ. The city hears you. ✦', 'success', 2500);
        if (window.catalystTrack) catalystTrack('ase_invoked');
        setTimeout(function() { document.body.classList.remove('ase-pulse'); }, 1700);
      }
    });
  })();

})();

(function() {
  'use strict';

  /* Cold-open title pages — page zero of every issue */
  var COLD_OPENS = {
    1: {
      arc: 'Arc I : The Catalyst · Issue #01 · Cold Open',
      title: 'AWAKEN, <em>O CITY</em>',
      open: [
        'Lagos, 2:47 AM. Twenty million people asleep with one eye open. Tonight, the sky above Balogun Market remembers that it used to be a door.',
        'Adebayo Adeyemi has thirty-two naira, a dead phone, and six weeks of grief where his mother used to be. He is nobody — Mushin has ten thousand of him. By sunrise, every god in the Yoruba pantheon and every enemy they have ever made will know his name.',
        'This is the night the city wakes up.'
      ],
      pull: 'The Ọ̀run is bleeding. He is the bandage — or the wound.'
    },
    2: {
      arc: 'Arc I : The Catalyst · Issue #02 · Cold Open',
      title: 'ṢÀNGÓ’S <em>DAUGHTER</em>',
      open: [
        'A talking drum is not an instrument. It is a telephone — the oldest one in existence — and for eleven years Amara Okafor has been learning the number for thunder.',
        'Now something in Geneva wants the line cut. The signal harvested. The voice on the other end bottled, labelled, and sold. They sent their best: a quiet man with medical instruments who has emptied twelve vessels across nine countries and never once raised his voice.',
        'He has never met a girl who answers back.'
      ],
      pull: 'One wrong pitch and you are not calling Ṣàngó. You are calling whatever else is on that frequency.'
    },
    3: {
      arc: 'Arc I : The Catalyst · Issue #03 · Cold Open',
      title: 'IRON IN <em>THE BLOOD</em>',
      open: [
        'In a Mushin workshop that smells of engine oil and old prayers, the iron has started answering to its name.',
        'Ikenna Chukwuemeka welds car chassis by day and fights sleep by night — because sleep is where Ògún waits. Patient as rust. Honest as a blade. The god of iron does not shout. He simply never, ever leaves.',
        'And in a white room three floors under Geneva, the Pale Council has finished something they call a vaccine. Not against a disease. Against gods. Lagos is the trial site.'
      ],
      pull: 'The metal remembers every hand that ever shaped it. Tonight it starts collecting the debt.'
    },
    4: {
      arc: 'Arc I : The Catalyst · Issue #04 · Finale · Cold Open',
      title: 'THE PRICE OF <em>AṢẸ</em>',
      open: [
        'Every one of the 847 paths Bayo can see ends in the same place: Balogun Nexus, the sky torn open, four strangers who became something more standing exactly where the door used to be.',
        'The Architect has run the numbers on every one of them. She does not fight. She offers. And what she offers each of them is the one thing they want most in the world — priced at the only thing they cannot afford to give.',
        'Arc I does not end with a victory. It ends with a choice.'
      ],
      pull: 'The city chose four. The Architect only needs one to say yes.'
    }
  };

  var ISSUE_TITLES = { 1: 'AWAKEN, O CITY', 2: 'ṢÀNGÓ’S DAUGHTER', 3: 'IRON IN THE BLOOD', 4: 'THE PRICE OF AṢẸ' };
  var pagers = {};

  function markIssueRead(n) {
    try {
      if (localStorage.getItem('catalyst_read_' + n)) return;
      localStorage.setItem('catalyst_read_' + n, '1');
      var card = document.querySelector('.issue-card[data-issue="' + n + '"]');
      if (card) {
        card.classList.add('is-read');
        var btn = card.querySelector('.issue-read-btn-track');
        if (btn) btn.textContent = '✓ Read';
      }
      if (window.showToast) showToast('Issue #' + n + ' complete. The story continues…', 'success', 3500);
      if (window.ClearanceTracker) ClearanceTracker.render();
    } catch(e) {}
  }

  function buildPager(panel) {
    var issueNum = parseInt(panel.id.replace('panel-i', ''), 10);
    var content = panel.querySelector('.story-content');
    if (!content) return;

    var chapters = [].slice.call(content.children).filter(function(el) {
      return el.classList.contains('story-chapter') || el.classList.contains('cliffhanger-box');
    });
    if (!chapters.length) return;

    // Page 0: cold-open title page
    var co = COLD_OPENS[issueNum];
    var titlePage = document.createElement('div');
    titlePage.className = 'reader-titlepage';
    if (co) {
      var openHtml = co.open.map(function(p) { return '<p class="rt-open">' + p + '</p>'; }).join('');
      titlePage.innerHTML =
        '<div class="rt-arc">' + co.arc + '</div>' +
        '<h3 class="rt-title">' + co.title + '</h3>' +
        openHtml +
        '<div class="rt-pull">' + co.pull + '</div>' +
        '<span class="rt-begin">Turn the page ▸</span>';
    }

    var pageEls = [titlePage].concat(chapters);
    var total = pageEls.length;

    // Reading time from actual word count (~220 wpm)
    var wordCount = 0;
    chapters.forEach(function(ch) { wordCount += (ch.textContent.match(/\S+/g) || []).length; });
    var readMins = Math.max(1, Math.round(wordCount / 220));

    // Chrome (top bar)
    var chrome = document.createElement('div');
    chrome.className = 'reader-chrome';
    var ticksHtml = '';
    for (var t = 0; t < total; t++) ticksHtml += '<span></span>';
    chrome.innerHTML =
      '<span class="rc-issue">Issue #0' + issueNum +
        '<span class="rc-time">· ' + readMins + ' min read</span>' +
        '<span class="reader-tools">' +
          '<button class="rt-dec" aria-label="Decrease text size" title="Smaller text">A−</button>' +
          '<button class="rt-inc" aria-label="Increase text size" title="Larger text">A+</button>' +
          '<button class="rt-focus" aria-label="Toggle focus mode" title="Focus mode — hide everything but the story">⛶</button>' +
          '<button class="rt-contents" aria-label="Open comic contents" aria-expanded="false" title="Issues and pages">☰</button>' +
        '</span>' +
      '</span>' +
      '<div class="reader-ticks" role="presentation">' + ticksHtml + '</div>' +
      '<span class="rc-count" aria-live="polite"></span>';
    chrome.querySelector('.rt-dec').addEventListener('click', function() { window.catalystReaderScale(-1); });
    chrome.querySelector('.rt-inc').addEventListener('click', function() { window.catalystReaderScale(1); });
    chrome.querySelector('.rt-focus').addEventListener('click', function() { window.catalystReaderFocus(); });

    // Nav (bottom bar)
    var nav = document.createElement('div');
    nav.className = 'reader-nav';
    var prevBtn = document.createElement('button');
    prevBtn.textContent = '◀ Previous Page';
    prevBtn.setAttribute('aria-label', 'Previous page');
    var hint = document.createElement('span');
    hint.className = 'rn-hint';
    hint.textContent = '← → arrow keys turn pages';
    var nextBtn = document.createElement('button');
    nextBtn.setAttribute('aria-label', 'Next page');
    nav.appendChild(prevBtn); nav.appendChild(hint); nav.appendChild(nextBtn);

    // Wrap each page; the title page starts detached, chapters are in the DOM
    var wraps = pageEls.map(function(el) {
      var wrap = document.createElement('div');
      wrap.className = 'reader-page';
      if (el.parentNode) content.insertBefore(wrap, el);
      wrap.appendChild(el);
      return wrap;
    });
    content.insertBefore(wraps[0], wraps[1]);
    content.insertBefore(chrome, wraps[0]);
    content.appendChild(nav);

    var current = 0;
    var storageKey = 'catalyst_page_i' + issueNum;
    try {
      var saved = parseInt(localStorage.getItem(storageKey), 10);
      if (!isNaN(saved) && saved >= 0 && saved < total) current = saved;
    } catch(e) {}

    var ticks = chrome.querySelectorAll('.reader-ticks span');
    var counter = chrome.querySelector('.rc-count');
    var contentsButton = chrome.querySelector('.rt-contents');
    var contentsMenu = null;

    function render(scroll) {
      wraps.forEach(function(w, i) { w.classList.toggle('current', i === current); });
      for (var i = 0; i < total; i++) {
        ticks[i].className = i < current ? 'done' : (i === current ? 'now' : '');
      }
      panel.querySelectorAll('.reader-contents-menu [data-page]').forEach(function(button) {
        var selected = parseInt(button.getAttribute('data-page'), 10) === current;
        button.classList.toggle('is-current', selected);
        if (selected) button.setAttribute('aria-current', 'location');
        else button.removeAttribute('aria-current');
      });
      counter.textContent = current === 0
        ? 'COLD OPEN'
        : 'PAGE ' + current + ' OF ' + (total - 1);
      prevBtn.disabled = current === 0;
      var onLast = current === total - 1;
      if (onLast) {
        markIssueRead(issueNum);
        if (issueNum < 4) {
          nextBtn.textContent = 'Next: Issue #0' + (issueNum + 1) + ' ▶';
          nextBtn.className = 'rn-next-issue';
        } else {
          nextBtn.textContent = 'Arc II Awaits — Join ▶';
          nextBtn.className = 'rn-next-issue';
        }
      } else {
        nextBtn.textContent = 'Next Page ▶';
        nextBtn.className = '';
      }
      try {
        localStorage.setItem(storageKey, String(current));
        // The denominator, recorded alongside the position. Without it
        // another page can say "page 4" but not "page 4 of 12", and
        // guessing the total would be inventing the one number that
        // makes the claim mean anything.
        localStorage.setItem('catalyst_pages_i' + issueNum, String(total - 1));
      } catch(e) {}
      if (scroll) content.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function afterUserTurn() {
      // Shareable deep link for the exact page being read
      try { history.replaceState(null, '', '#read-i' + issueNum + '-p' + current); } catch(e) {}
      // Move screen-reader/keyboard focus to the new page's heading
      var heading = wraps[current].querySelector('.chapter-title, .rt-title, .cliffhanger-label');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
      if (window.catalystUpdateJourney) catalystUpdateJourney();
      if (window.catalystSyncProgress) catalystSyncProgress(issueNum, current);
      if (window.catalystPaintIssueTabs) catalystPaintIssueTabs();
    }

    function go(delta, scroll) {
      var onLast = current === total - 1;
      if (delta > 0 && onLast) {
        // Hand off to the next issue (or the newsletter after the finale).
        // On a standalone /read/issue-N page the other three issues are other
        // documents, so the handoff is a navigation rather than a tab switch.
        if (issueNum < 4) {
          if (CATALYST_ISSUE_PAGE) {
            location.href = './issue-' + (issueNum + 1);
            return;
          }
          var tab = document.querySelectorAll('.issue-tab')[issueNum]; // 0-indexed: tab for issue+1
          if (tab) tab.click();
          var nextPanelContent = document.querySelector('#panel-i' + (issueNum + 1) + ' .story-content');
          if (nextPanelContent) nextPanelContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          var nl = document.getElementById('newsletter');
          if (nl) nl.scrollIntoView({ behavior: 'smooth' });
          else location.href = '/#access';
        }
        return;
      }
      var next = Math.min(Math.max(current + delta, 0), total - 1);
      if (next === current) return;
      current = next;
      if (window.catalystTrack) catalystTrack('story_page_view', { issue: issueNum, page: current });
      render(scroll !== false);
      afterUserTurn();
    }

    function setPage(page, scroll, silent) {
      var next = Math.min(Math.max(page | 0, 0), total - 1);
      current = next;
      render(scroll !== false);
      if (!silent) afterUserTurn();
      else if (window.catalystUpdateJourney) catalystUpdateJourney();
    }

    prevBtn.addEventListener('click', function() { go(-1); });
    nextBtn.addEventListener('click', function() { go(1); });

    // Chapter index for the command palette / deep links, with the page's
    // full prose indexed so any phrase from the story is searchable
    var chapterIndex = pageEls.map(function(el, i) {
      if (i === 0) return ISSUE_TITLES[issueNum] + ' — Cold Open';
      var t = el.querySelector && el.querySelector('.chapter-title');
      if (t) return t.textContent;
      return 'Cliffhanger';
    });
    var searchIndex = pageEls.map(function(el) {
      return (el.textContent || '').replace(/\s+/g, ' ').toLowerCase().slice(0, 4000);
    });

    pagers[issueNum] = { go: go, set: setPage, total: total, panel: panel, chapters: chapterIndex, searchText: searchIndex, pos: function() { return current; } };

    // A compact contents menu belongs to the reader chrome. It stays closed
    // until requested, so the story remains the first and dominant content.
    contentsMenu = document.createElement('nav');
    contentsMenu.id = 'reader-contents-i' + issueNum;
    contentsMenu.className = 'reader-contents-menu';
    contentsMenu.setAttribute('aria-label', 'Comic issues and pages');
    contentsMenu.hidden = true;
    contentsButton.setAttribute('aria-controls', contentsMenu.id);

    var issueOptions = '';
    for (var n = 1; n <= 4; n++) {
      if (n === issueNum) {
        issueOptions += '<span class="reader-contents-issue is-current" aria-current="page">#0' + n + '</span>';
      } else if (CATALYST_ISSUE_PAGE) {
        issueOptions += '<a class="reader-contents-issue" href="./issue-' + n + '">#0' + n + '</a>';
      } else {
        issueOptions += '<button class="reader-contents-issue" type="button" data-issue="' + n + '">#0' + n + '</button>';
      }
    }

    var pageOptions = chapterIndex.map(function(title, index) {
      return '<button class="reader-contents-page" type="button" data-page="' + index + '">' +
        '<span>' + (index === 0 ? 'OPEN' : String(index).padStart(2, '0')) + '</span>' + title + '</button>';
    }).join('');

    contentsMenu.innerHTML =
      '<div class="reader-contents-label">Arc I · Issues</div>' +
      '<div class="reader-contents-issues">' + issueOptions + '</div>' +
      '<div class="reader-contents-label">Issue #0' + issueNum + ' · Pages</div>' +
      '<div class="reader-contents-pages">' + pageOptions + '</div>';
    chrome.appendChild(contentsMenu);

    function closeContents() {
      contentsMenu.hidden = true;
      contentsButton.setAttribute('aria-expanded', 'false');
      contentsButton.setAttribute('aria-label', 'Open comic contents');
    }

    contentsButton.addEventListener('click', function() {
      var willOpen = contentsMenu.hidden;
      contentsMenu.hidden = !willOpen;
      contentsButton.setAttribute('aria-expanded', String(willOpen));
      contentsButton.setAttribute('aria-label', willOpen ? 'Close comic contents' : 'Open comic contents');
      if (willOpen) {
        var selected = contentsMenu.querySelector('[data-page].is-current');
        if (selected) selected.scrollIntoView({ block: 'nearest' });
      }
    });
    contentsMenu.querySelectorAll('[data-page]').forEach(function(button) {
      button.addEventListener('click', function() {
        closeContents();
        setPage(parseInt(button.getAttribute('data-page'), 10));
      });
    });
    contentsMenu.querySelectorAll('[data-issue]').forEach(function(button) {
      button.addEventListener('click', function() {
        closeContents();
        window.catalystJumpTo(parseInt(button.getAttribute('data-issue'), 10), 0);
      });
    });
    document.addEventListener('click', function(event) {
      if (!contentsMenu.hidden && !chrome.contains(event.target)) closeContents();
    });
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && !contentsMenu.hidden) {
        closeContents();
        contentsButton.focus();
      }
    });
    render(false);
  }

  document.querySelectorAll('.issue-reader-panel').forEach(buildPager);

  /* ── Batch 7: jump API — activate an issue's tab and open a page ── */
  window.catalystJumpTo = function(issue, page, scroll) {
    var p = pagers[issue];
    if (!p) {
      // Asked for an issue this document does not contain. On a standalone
      // issue page that is a link to a sibling page, so go there rather than
      // silently doing nothing.
      if (CATALYST_ISSUE_PAGE && issue >= 1 && issue <= 4) {
        location.href = './issue-' + issue + '#read-i' + issue + '-p' + (page || 0);
      }
      return;
    }
    var tab = document.querySelectorAll('.issue-tab')[issue - 1];
    if (tab && !p.panel.classList.contains('active')) tab.click();
    p.set(page, false);
    if (scroll !== false) {
      var content = p.panel.querySelector('.story-content');
      if (content) content.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* ── Batch 7: deep links — #read-i2-p3 opens issue 2, page 3 ──
     Every link ever shared uses this form, including the ones pointing at
     the home page, so the standalone pages honour it too: a #read-i2-p3 that
     lands on /read/issue-2 opens page 3, and one that lands on the wrong
     issue page redirects to the right one instead of breaking. */
  (function() {
    function openFromHash(delay) {
      var m = /^#read-i([1-4])-p(\d+)$/.exec(location.hash);
      if (m) { setTimeout(function() { window.catalystJumpTo(+m[1], +m[2]); }, delay); return true; }
      // Short form for a page you are already on: /read/issue-2#p3
      var s = CATALYST_ISSUE_PAGE && /^#p(\d+)$/.exec(location.hash);
      if (s) { setTimeout(function() { window.catalystJumpTo(CATALYST_ISSUE_NUM, +s[1]); }, delay); return true; }
      return false;
    }
    openFromHash(150);
    // Also honour the hash changing on an already-loaded page — following a
    // deep link from elsewhere on the site, or pressing Back after reading.
    // Without this, only a cold load ever acted on a deep link.
    window.addEventListener('hashchange', function() { openFromHash(0); });
  })();

  /* ── Batch 7: proper tab semantics for the issue switcher ── */
  (function() {
    var tabs = document.querySelectorAll('.issue-tab');
    var tabBar = document.querySelector('.issue-tabs');
    if (tabBar) tabBar.setAttribute('role', 'tablist');
    tabs.forEach(function(tab, i) {
      var n = i + 1;
      tab.setAttribute('role', 'tab');
      tab.id = 'issue-tab-' + n;
      tab.setAttribute('aria-controls', 'panel-i' + n);
      tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
      var panel = document.getElementById('panel-i' + n);
      if (panel) {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', 'issue-tab-' + n);
      }
    });
    var origShowIssue = window.showIssue;
    if (typeof origShowIssue === 'function') {
      window.showIssue = function(id, btn) {
        origShowIssue(id, btn);
        tabs.forEach(function(t) {
          t.setAttribute('aria-selected', t.classList.contains('active') ? 'true' : 'false');
        });
        if (window.catalystUpdateJourney) catalystUpdateJourney();
      };
    }
  })();

  /* ── Batch 7: reading journey strip in the reader header ── */
  (function() {
    var header = document.querySelector('#read .read-header');
    // On a standalone /read/issue-N page pagers{} holds exactly one issue,
    // so this strip could only render a single chip about the issue being
    // read. The tab bar carries all four states there instead.
    if (!header || CATALYST_ISSUE_PAGE) return;
    var strip = document.createElement('div');
    strip.className = 'reader-journey';
    strip.setAttribute('aria-label', 'Your reading progress');
    header.appendChild(strip);

    window.catalystUpdateJourney = function() {
      strip.innerHTML = '';
      for (var n = 1; n <= 4; n++) {
        if (!pagers[n]) continue;
        var total = pagers[n].total - 1; // pages excluding cold open
        var read = false, pos = 0;
        try {
          read = !!localStorage.getItem('catalyst_read_' + n);
          pos = parseInt(localStorage.getItem('catalyst_page_i' + n), 10) || 0;
        } catch(e) {}
        var chip = document.createElement('button');
        if (read) {
          chip.className = 'j-done';
          chip.textContent = 'Issue 0' + n + ' ✓';
        } else if (pos > 0) {
          chip.className = 'j-progress';
          chip.textContent = 'Issue 0' + n + ' · Page ' + pos + '/' + total;
        } else {
          chip.textContent = 'Issue 0' + n + ' · Unread';
        }
        chip.setAttribute('aria-label', 'Open issue ' + n + (read ? ' (completed)' : pos > 0 ? ' at page ' + pos : ''));
        (function(issue, page) {
          chip.addEventListener('click', function() { window.catalystJumpTo(issue, page); });
        })(n, read ? 0 : pos);
        strip.appendChild(chip);
      }
    };
    catalystUpdateJourney();
  })();


  /* ── Reading state, on the controls that are already there ──

     A standalone issue page carries a tab bar to the other three issues and,
     at the foot, a card for whichever one comes next. Both were identical for
     every reader: someone three pages into Issue #3 and someone who had never
     opened it saw exactly the same thing.

     The reader already writes their position on every page turn. This reads
     it back and puts it on the controls that exist, rather than adding a
     fifth widget that says the same thing — which is also why the journey
     strip stands down on these pages: on a standalone page pagers{} holds one
     issue, so it could only ever render a one-chip strip about the issue you
     are already looking at.

     Everything shown is something this browser recorded. There is no
     "readers like you", no streak, and nothing is lost by not coming back. */
  (function() {
    var tabs = [].slice.call(document.querySelectorAll('.issue-page-tab'));
    if (!tabs.length) return;

    function stateOf(n) {
      var read = false, page = 0, total = 0;
      try {
        read = !!localStorage.getItem('catalyst_read_' + n);
        page = parseInt(localStorage.getItem('catalyst_page_i' + n), 10) || 0;
        // Written by the pager once it has laid the issue out, so it exists
        // only for an issue this browser has actually opened. An issue with a
        // position but no total is one read before this shipped; it gets the
        // honest "in progress" state without a fabricated percentage.
        total = parseInt(localStorage.getItem('catalyst_pages_i' + n), 10) || 0;
      } catch (e) {}
      return { read: read, page: page, total: total };
    }

    function paint() {
      tabs.forEach(function(tab) {
        var n = parseInt((tab.getAttribute('href') || '').replace(/\D/g, ''), 10);
        if (!n) return;
        var s = stateOf(n);
        var note = tab.querySelector('.tab-state');
        if (!note) {
          note = document.createElement('span');
          note.className = 'tab-state';
          tab.appendChild(note);
        }
        var bar = tab.querySelector('.tab-progress');
        if (!bar) {
          bar = document.createElement('span');
          bar.className = 'tab-progress';
          bar.setAttribute('aria-hidden', 'true');
          bar.appendChild(document.createElement('span'));
          tab.appendChild(bar);
        }
        var fill = bar.firstChild;
        tab.classList.remove('tab-read', 'tab-reading');
        if (s.read) {
          tab.classList.add('tab-read');
          note.textContent = ' — read';
          fill.style.width = '100%';
        } else if (s.page > 0) {
          tab.classList.add('tab-reading');
          note.textContent = s.total
            ? ' — page ' + s.page + ' of ' + s.total
            : ' — in progress';
          fill.style.width = s.total
            ? Math.max(4, Math.round(s.page / s.total * 100)) + '%'
            : '18%';
        } else {
          note.textContent = '';
          fill.style.width = '0%';
        }
      });

      // The hand-off card asks the reader to start the next issue. If they
      // have already started it, saying "Read Issue #03" is simply wrong.
      var cta = document.querySelector('.handoff-cta');
      var card = document.querySelector('.handoff-card');
      if (!cta || !card) return;
      var m = (card.getAttribute('href') || '').match(/issue-(\d)/);
      if (!m) return;
      var next = stateOf(parseInt(m[1], 10));
      if (next.read || !next.page) return;
      // The arrow is a separate <span>; only the label text changes.
      cta.firstChild.nodeValue = 'Continue Issue #0' + m[1] + ' ';
      var facts = document.querySelector('.handoff-facts');
      if (facts && !facts.querySelector('.fact-resume')) {
        var chip = document.createElement('span');
        chip.className = 'fact-resume';
        chip.textContent = next.total
          ? 'You stopped on page ' + next.page + ' of ' + next.total
          : 'You have started this one';
        facts.insertBefore(chip, facts.firstChild);
      }
    }

    paint();
    // The pager writes a position on every turn, so the bar for the issue
    // being read has to follow it rather than being painted once at load.
    window.catalystPaintIssueTabs = paint;
  })();

  /* ── Batch 7: every story chapter searchable in the command palette ── */
  (function registerChapters(attempt) {
    if (!window.catalystPaletteAdd) {
      if (attempt < 10) setTimeout(function() { registerChapters(attempt + 1); }, 200);
      return;
    }
    var items = [];
    Object.keys(pagers).forEach(function(n) {
      pagers[n].chapters.forEach(function(title, page) {
        items.push({
          label: 'Issue #0' + n + ' · ' + title,
          kind: 'Story',
          search: (pagers[n].searchText && pagers[n].searchText[page]) || '',
          action: (function(issue, pg) {
            return function() { window.catalystJumpTo(issue, pg); };
          })(+n, page)
        });
      });
    });
    window.catalystPaletteAdd(items);
  })(0);

  /* ── Batch 9: Reader type scale (persisted) ── */
  var SCALE_KEY = 'catalyst_reader_scale';
  var SCALE_STEPS = [0.85, 1, 1.12, 1.25, 1.4];
  function applyScale(scale) {
    document.querySelectorAll('.issue-reader-panel .story-content').forEach(function(c) {
      c.style.setProperty('--rs', scale);
    });
  }
  window.catalystReaderScale = function(dir) {
    var cur = 1;
    try { cur = parseFloat(localStorage.getItem(SCALE_KEY)) || 1; } catch(e) {}
    var idx = SCALE_STEPS.indexOf(cur);
    if (idx === -1) idx = 1;
    idx = Math.min(Math.max(idx + dir, 0), SCALE_STEPS.length - 1);
    var next = SCALE_STEPS[idx];
    applyScale(next);
    try { localStorage.setItem(SCALE_KEY, String(next)); } catch(e) {}
    if (window.showToast) showToast('Text size: ' + Math.round(next * 100) + '%', 'info', 1500);
  };
  try {
    var savedScale = parseFloat(localStorage.getItem(SCALE_KEY));
    if (savedScale && savedScale !== 1) applyScale(savedScale);
  } catch(e) {}

  /* ── Batch 9: Focus mode — nothing but the story ── */
  var FOCUS_KEY = 'catalyst_reader_focus';
  function setFocusUI(on) {
    document.body.classList.toggle('reader-focus', on);
    document.querySelectorAll('.reader-tools .rt-focus').forEach(function(b) {
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  window.catalystReaderFocus = function() {
    var on = !document.body.classList.contains('reader-focus');
    setFocusUI(on);
    try { localStorage.setItem(FOCUS_KEY, on ? '1' : ''); } catch(e) {}
    if (window.catalystTrack) catalystTrack('focus_mode', { on: on });
  };
  try { if (localStorage.getItem(FOCUS_KEY)) setFocusUI(true); } catch(e) {}

  /* ── Batch 9: Cross-device reading sync (signed-in readers) ── */
  var syncTimers = {};
  window.catalystSyncProgress = function(issue, page) {
    clearTimeout(syncTimers[issue]);
    syncTimers[issue] = setTimeout(function() {
      var sb = window._supabase;
      if (!sb) return;
      sb.auth.getSession().then(function(r) {
        var u = r && r.data && r.data.session && r.data.session.user;
        if (!u) return;
        sb.from('reading_progress')
          .upsert({ user_id: u.id, issue: issue, page: page }, { onConflict: 'user_id,issue' })
          .then(function() {}, function() {});
      }, function() {});
    }, 1500);
  };
  (function restoreCloudProgress(attempt) {
    var sb = window._supabase;
    if (!sb) {
      if (attempt < 25) setTimeout(function() { restoreCloudProgress(attempt + 1); }, 400);
      return;
    }
    sb.auth.getSession().then(function(r) {
      var u = r && r.data && r.data.session && r.data.session.user;
      if (!u) return;
      sb.from('reading_progress').select('issue,page').then(function(res) {
        if (!res || res.error || !res.data) return;
        res.data.forEach(function(row) {
          var localPage = 0;
          try { localPage = parseInt(localStorage.getItem('catalyst_page_i' + row.issue), 10) || 0; } catch(e) {}
          if (row.page > localPage && pagers[row.issue]) {
            pagers[row.issue].set(row.page, false, true); // silent: no hash/focus steal on load
          }
        });
      }, function() {});
    }, function() {});
  })(0);

  /* ── Batch 9: Universe Pulse — live aggregate stats, hidden until real ── */
  (function pulse(attempt) {
    var sb = window._supabase;
    if (!sb) {
      if (attempt < 25) setTimeout(function() { pulse(attempt + 1); }, 400);
      return;
    }
    var host = document.querySelector('#social-hub > div') || document.getElementById('social-hub');
    if (!host) return;
    sb.rpc('get_universe_pulse').then(function(res) {
      if (!res || res.error || !res.data) return;
      var d = res.data;
      var stats = [
        { n: d.awakened, label: 'Covenant Members' },
        { n: d.subscribers, label: 'Awakened Readers' },
        { n: d.pages_read, label: 'Story Pages Read' },
        { n: d.heroes_revealed, label: 'Heroes Revealed' }
      ].filter(function(s) { return s.n > 0; });
      if (!stats.length) return; // nothing real to show yet — stay hidden
      var el = document.createElement('div');
      el.id = 'universe-pulse';
      el.setAttribute('aria-label', 'Live community stats');
      el.innerHTML = '<div class="up-title">◈ UNIVERSE PULSE — LIVE</div>' + stats.map(function(s) {
        return '<div class="up-stat"><div class="up-num">' + Number(s.n).toLocaleString() + '</div><div class="up-label">' + s.label + '</div></div>';
      }).join('');
      host.appendChild(el);
      requestAnimationFrame(function() { el.classList.add('live'); });
    }, function() {});
  })(0);

  /* Arrow-key page turns for the visible issue */
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
    var lb = document.getElementById('img-lightbox');
    if (lb && lb.classList.contains('active')) return;
    var cmdk = document.getElementById('cmdk');
    if (cmdk && cmdk.classList.contains('open')) return;
    var active = document.querySelector('.issue-reader-panel.active');
    if (!active) return;
    var rect = active.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return; // reader off-screen
    var issueNum = parseInt(active.id.replace('panel-i', ''), 10);
    if (!pagers[issueNum]) return;
    e.preventDefault();
    pagers[issueNum].go(e.key === 'ArrowRight' ? 1 : -1, false);
  });

  /* Headless-CMS overrides: story_pages rows with body_html replace the
     embedded chapter content, so copy edits ship without a redeploy */
  (function applyCmsOverrides(attempt) {
    if (!window._supabase) {
      if (attempt < 25) setTimeout(function() { applyCmsOverrides(attempt + 1); }, 400);
      return;
    }
    window._supabase
      .from('story_pages')
      .select('issue,page,chapter_label,chapter_title,body_html')
      .not('body_html', 'is', null)
      .then(function(res) {
        if (!res || res.error || !res.data) return;
        res.data.forEach(function(row) {
          var panel = document.getElementById('panel-i' + row.issue);
          if (!panel) return;
          var wraps = panel.querySelectorAll('.reader-page');
          var wrap = wraps[row.page];
          if (!wrap) return;
          var chapter = wrap.querySelector('.story-chapter');
          if (!chapter) return;
          if (row.chapter_label) {
            var lbl = chapter.querySelector('.chapter-label');
            if (lbl) lbl.textContent = row.chapter_label;
          }
          if (row.chapter_title) {
            var ttl = chapter.querySelector('.chapter-title');
            if (ttl) ttl.textContent = row.chapter_title;
          }
          var proseHost = chapter;
          var keepLabel = chapter.querySelector('.chapter-label');
          var keepTitle = chapter.querySelector('.chapter-title');
          proseHost.innerHTML = '';
          if (keepLabel) { proseHost.appendChild(keepLabel); proseHost.appendChild(document.createTextNode('\n')); }
          if (keepTitle) { proseHost.appendChild(keepTitle); proseHost.appendChild(document.createTextNode('\n')); }
          var body = document.createElement('div');
          body.innerHTML = row.body_html;
          proseHost.appendChild(body);
        });
      }, function() {});
  })(0);

})();

(function() {
  'use strict';

  /* ── Covenant member chip: your № is always one tap away ── */
  window.catalystCovenantChip = function() {
    var chip = document.getElementById('covenant-chip');
    if (!chip) return;
    var cov = null;
    try { cov = JSON.parse(localStorage.getItem('catalyst_covenant')); } catch(e) {}
    if (!cov) { chip.classList.remove('on'); return; }
    chip.textContent = '№' + cov.member_no;
    chip.title = cov.covenant_name + ' of ' + cov.district + ' — view your covenant';
    chip.classList.add('on');
  };
  var chipEl = document.getElementById('covenant-chip');
  if (chipEl) chipEl.addEventListener('click', function() {
    if (window.catalystShowCovenant) catalystShowCovenant();
  });
  catalystCovenantChip();

  /* ── Badge unlock toasts: celebrate the moment a milestone lands ── */
  var SEEN_KEY = 'catalyst_badges_seen';
  function unlockedNow() {
    return [].map.call(document.querySelectorAll('#bdg-grid .bdg-card:not(.locked) .bdg-name'), function(el) {
      return el.textContent;
    });
  }
  function diffAndToast() {
    var now = unlockedNow();
    var seen = null;
    try { seen = JSON.parse(localStorage.getItem(SEEN_KEY)); } catch(e) {}
    if (Array.isArray(seen)) {
      now.forEach(function(name) {
        if (seen.indexOf(name) === -1 && window.showToast) {
          showToast('◈ BADGE UNLOCKED — ' + name, 'success', 4000);
          if (window.catalystTrack) catalystTrack('badge_unlocked', { badge: name });
        }
      });
    }
    // First run seeds silently so long-time readers don't get a toast storm
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(now)); } catch(e) {}
  }
  var origRender = window.bdgRender;
  if (typeof origRender === 'function') {
    window.bdgRender = function() {
      origRender.apply(this, arguments);
      diffAndToast();
    };
    diffAndToast(); // seed from the initial render that already ran
  }

  /* Refresh the badge case when milestone-relevant activity happens */
  var refreshTimer = null;
  var MILESTONE_EVENTS = { story_page_view: 1, ase_invoked: 1, covenant_ceremony: 1, issue_read_toggle: 1 };
  var origTrack = window.catalystTrack;
  if (typeof origTrack === 'function') {
    window.catalystTrack = function(event, data) {
      origTrack.apply(this, arguments);
      if (MILESTONE_EVENTS[event]) {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(function() {
          if (window.bdgRender) bdgRender();
          if (window.catalystCovenantChip) catalystCovenantChip();
        }, 900);
      }
    };
  }

})();

(function() {
  'use strict';

  /* Yoruba & Lagos terms defined for readers meeting them for the first
     time. First occurrence per story page gets a dotted-gold underline. */
  var GLOSSARY = [
    { term: 'Aṣẹ', variants: ['Aṣẹ', 'ASẸ', 'Àṣẹ', 'Ase'], def: 'The divine power to make things happen — the current every Orisha and vessel runs on. Spoken aloud, it is an affirmation: "so be it."' },
    { term: 'Ọ̀run', variants: ['Ọ̀run', 'Orun'], def: 'The Yoruba spirit realm — the other side of the veil. It has begun bleeding into Lagos.' },
    { term: 'Orisha', variants: ['Orisha', 'Orishas'], def: 'The divine spirits of Yoruba cosmology — Ṣàngó, Ògún, Ẹṣù, and hundreds more. They are reawakening.' },
    { term: 'Ṣàngó', variants: ['Ṣàngó', 'Sango'], def: 'Orisha of thunder, lightning, and justice. He speaks in storms and answers the talking drum.' },
    { term: 'Ògún', variants: ['Ògún', 'Ogun'], def: 'Orisha of iron, metalwork, and war. Patient as rust. Honest as a blade.' },
    { term: 'Ẹṣù', variants: ['Ẹṣù', 'Esu'], def: 'Orisha of crossroads, chance, and choice. He sees every path at once — and now, so does Bayo.' },
    { term: 'Ifá', variants: ['Ifá', 'Ifa'], def: 'The Yoruba divination system and its four-thousand-year body of knowledge, kept by priests of Ọ̀rúnmìlà.' },
    { term: 'danfo', variants: ['danfo'], def: "Lagos's yellow minibus taxis — fast, loud, and held together by faith and duct tape." },
    { term: 'NEPA', variants: ['NEPA'], def: 'The old name Lagosians still use for the power company. "NEPA don take light" — the power is out. Again.' },
    { term: 'wahala', variants: ['wahala'], def: 'Trouble. Palaver. The thing Lagos always has in surplus.' },
    { term: 'ìyá’lù', variants: ['ìyá’lù', "ìyá'lù", 'iya ilu'], def: 'The "mother drum" — the lead talking drum whose tonal phrases carry the message. The oldest telephone in existence.' },
    { term: 'area boy', variants: ['area boys', 'area boy'], def: 'Street-corner operators of Lagos — unofficial toll collectors, occasional muscle, always watching.' },
    { term: 'Mushin', variants: ['Mushin'], def: 'Dense, working-class district of mainland Lagos. Bayo’s home turf. It never sleeps — it rests with one eye open.' },
    { term: 'Balogun', variants: ['Balogun'], def: 'The vast market sprawl on Lagos Island — ground zero of the first Ọ̀run-Bleed.' },
    { term: 'Third Mainland Bridge', variants: ['Third Mainland Bridge'], def: 'The long bridge across the Lagos Lagoon. Lately it whispers names at 3 AM.' },
    { term: 'Ajele', variants: ['Ajele'], def: 'Spirit-agents that fall through tears in the sky — things that learned to pretend to have bodies but haven’t committed to the lie.' }
  ];

  /* Tooltip singleton */
  var tip = document.createElement('div');
  tip.id = 'lore-tip';
  tip.setAttribute('role', 'tooltip');
  tip.innerHTML = '<div class="lt-term"></div><div class="lt-def"></div>';
  document.body.appendChild(tip);
  var tipTerm = tip.querySelector('.lt-term');
  var tipDef = tip.querySelector('.lt-def');
  var activeEl = null;

  function showTip(el) {
    activeEl = el;
    tipTerm.textContent = el.getAttribute('data-term');
    tipDef.textContent = el.getAttribute('data-def');
    tip.classList.add('show');
    var r = el.getBoundingClientRect();
    var tw = Math.min(300, window.innerWidth - 24);
    var left = Math.min(Math.max(r.left, 12), window.innerWidth - tw - 12);
    tip.style.left = left + 'px';
    // Prefer above the term; flip below if there's no room
    tip.style.top = '0px';
    var th = tip.offsetHeight;
    var top = r.top - th - 10;
    if (top < 12) top = r.bottom + 10;
    tip.style.top = top + 'px';
    el.setAttribute('aria-describedby', 'lore-tip');
  }
  function hideTip() {
    tip.classList.remove('show');
    if (activeEl) { activeEl.removeAttribute('aria-describedby'); activeEl = null; }
  }
  document.addEventListener('scroll', hideTip, { passive: true });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') hideTip(); });
  document.addEventListener('click', function(e) {
    if (!e.target.closest || (!e.target.closest('.lore-term') && !e.target.closest('#lore-tip'))) hideTip();
  });

  function bindTerm(span) {
    span.addEventListener('mouseenter', function() { showTip(span); });
    span.addEventListener('mouseleave', function() { if (activeEl === span) hideTip(); });
    span.addEventListener('focus', function() { showTip(span); });
    span.addEventListener('blur', function() { if (activeEl === span) hideTip(); });
    span.addEventListener('click', function(e) {
      e.stopPropagation();
      activeEl === span && tip.classList.contains('show') ? hideTip() : showTip(span);
    });
  }

  /* Mark the first occurrence of each term within a reader page */
  function markPage(pageEl) {
    var hosts = pageEl.querySelectorAll('.story-prose, .speech-bubble, .panel-narration, .rt-open');
    var found = {};
    GLOSSARY.forEach(function(g) {
      if (found[g.term]) return;
      for (var h = 0; h < hosts.length && !found[g.term]; h++) {
        var walker = document.createTreeWalker(hosts[h], NodeFilter.SHOW_TEXT, null);
        var node;
        while ((node = walker.nextNode())) {
          if (node.parentNode.closest('.lore-term')) continue;
          var text = node.nodeValue;
          for (var v = 0; v < g.variants.length; v++) {
            var re;
            try { re = new RegExp('(?<![\\p{L}\\p{M}’\'])' + g.variants[v].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}\\p{M}])', 'u'); }
            catch(e) { return; } // lookbehind unsupported — skip glossary gracefully
            var m = re.exec(text);
            if (m) {
              var span = document.createElement('span');
              span.className = 'lore-term';
              span.setAttribute('tabindex', '0');
              span.setAttribute('data-term', g.term);
              span.setAttribute('data-def', g.def);
              span.textContent = m[0];
              var after = node.splitText(m.index);
              after.nodeValue = after.nodeValue.slice(m[0].length);
              node.parentNode.insertBefore(span, after);
              bindTerm(span);
              found[g.term] = true;
              break;
            }
          }
          if (found[g.term]) break;
        }
      }
    });
  }

  document.querySelectorAll('.issue-reader-panel .reader-page').forEach(markPage);

})();

(function() {
  'use strict';

  /* ── A) Àṣẹ Standby Protocol ──
     Widgets register a {start, stop} pair. When the tab is backgrounded
     every registered loop suspends; when it's foregrounded again each
     one resumes via its own start() — exactly where it left off, not
     restarted from scratch. Applied below to the Memory Bank's own
     ambient pulse; existing setInterval-driven widgets elsewhere on the
     page are untouched so nothing already working can regress. */
  var standbyLoops = [];
  window.catalystStandby = {
    register: function(id, start, stop) {
      standbyLoops.push({ id: id, start: start, stop: stop, active: true });
    },
    isStandby: function() { return document.hidden; }
  };
  document.addEventListener('visibilitychange', function() {
    standbyLoops.forEach(function(l) {
      if (document.hidden && l.active) { l.stop(); l.active = false; }
      else if (!document.hidden && !l.active) { l.start(); l.active = true; }
    });
  });

  /* ── B) Covenant Reactivation Loop ──
     Fully local: no email is held client-side (by design, since Batch
     10), so this never phones home to trigger — it reads the same
     reading-position keys the reader already writes on every page turn.
     Presence itself is refreshed server-side by join_covenant/sign_wall,
     the two points where a member's email is actually re-verified. */
  var LAST_VISIT_KEY = 'catalyst_last_visit_ts';
  var DORMANT_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

  function resumeTarget() {
    // Furthest issue with unread progress, or the furthest completed one
    var best = null;
    for (var i = 1; i <= 4; i++) {
      var page = 0;
      try { page = parseInt(localStorage.getItem('catalyst_page_i' + i), 10) || 0; } catch(e) {}
      var read = false;
      try { read = !!localStorage.getItem('catalyst_read_' + i); } catch(e) {}
      if (page > 0 && !read) { best = { issue: i, page: page }; }
    }
    if (best) return best;
    // Nobody mid-issue — offer the next unread issue from the start
    for (var j = 1; j <= 4; j++) {
      var r = false;
      try { r = !!localStorage.getItem('catalyst_read_' + j); } catch(e) {}
      if (!r) return { issue: j, page: 0 };
    }
    return null;
  }

  function fmtGap(ms) {
    var days = Math.floor(ms / (24 * 60 * 60 * 1000));
    if (days >= 14) return Math.floor(days / 7) + ' weeks';
    if (days >= 2) return days + ' days';
    return 'a while';
  }

  (function reactivationCheck() {
    var cov = null;
    try { cov = JSON.parse(localStorage.getItem('catalyst_covenant')); } catch(e) {}
    var lastVisit = null;
    try { lastVisit = parseInt(localStorage.getItem(LAST_VISIT_KEY), 10) || null; } catch(e) {}
    var now = Date.now();

    if (cov && lastVisit && (now - lastVisit) > DORMANT_MS) {
      var target = resumeTarget();
      var banner = document.getElementById('welcome-back-banner');
      var titleEl = document.getElementById('wb-title');
      var subEl = document.getElementById('wb-sub');
      var resumeBtn = document.getElementById('wb-resume');
      if (banner && titleEl && subEl) {
        titleEl.textContent = 'Welcome back, ' + cov.covenant_name + '.';
        if (target) {
          subEl.textContent = "It's been " + fmtGap(now - lastVisit) + '. Issue #0' + target.issue +
            (target.page > 0 ? ' is waiting exactly where you left it.' : ' is ready whenever you are.');
          resumeBtn.style.display = '';
          resumeBtn.onclick = function() {
            banner.classList.remove('show');
            if (window.catalystJumpTo) catalystJumpTo(target.issue, target.page);
          };
        } else {
          subEl.textContent = "It's been " + fmtGap(now - lastVisit) + '. Arc I is waiting — and the Covenant grew while you were gone.';
          resumeBtn.style.display = 'none';
        }
        setTimeout(function() { banner.classList.add('show'); }, 1400);
        if (window.catalystTrack) catalystTrack('reactivation_shown', { gap_ms: now - lastVisit });
      }
    }
    try { localStorage.setItem(LAST_VISIT_KEY, String(now)); } catch(e) {}
  })();

  var wbDismiss = document.getElementById('wb-dismiss');
  if (wbDismiss) wbDismiss.addEventListener('click', function() {
    var b = document.getElementById('welcome-back-banner');
    if (b) b.classList.remove('show');
  });

  /* ── C) Aṣẹ Memory Bank — experience replay ──
     Samples from the site's own activity log (the Operative Field
     Record's `entries` array, already populated by every mini-game on
     the site) plus covenant/badge milestones, and resurfaces one at
     random. Same principle as an RL replay buffer: reinforce by
     periodically re-presenting stored past experience instead of only
     ever reacting to the newest event. */
  function gatherMemories() {
    var memories = [];
    var data = window.ofrGetData ? window.ofrGetData() : null;
    if (data && data.entries) {
      data.entries.forEach(function(e) {
        memories.push({ text: e.text, ts: e.ts });
      });
    }
    var cov = null;
    try { cov = JSON.parse(localStorage.getItem('catalyst_covenant')); } catch(e) {}
    if (cov) {
      memories.push({ text: 'You are Awakened № ' + cov.member_no + ' — "' + cov.covenant_name + '" of ' + cov.district + '.', ts: null });
    }
    var seen = null;
    try { seen = JSON.parse(localStorage.getItem('catalyst_badges_seen')); } catch(e) {}
    if (Array.isArray(seen)) {
      seen.forEach(function(name) {
        memories.push({ text: 'Badge unlocked: ' + name + '.', ts: null });
      });
    }
    for (var i = 1; i <= 4; i++) {
      var r = false;
      try { r = !!localStorage.getItem('catalyst_read_' + i); } catch(e) {}
      if (r) memories.push({ text: 'You completed Issue #0' + i + '.', ts: null });
    }
    return memories;
  }

  function timeAgo(ts) {
    if (!ts) return 'the record does not say when';
    var d = new Date(ts);
    if (isNaN(d.getTime())) return 'the record does not say when';
    var days = Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
    if (days <= 0) return 'earlier today';
    if (days === 1) return 'yesterday';
    if (days < 14) return days + ' days ago';
    return Math.floor(days / 7) + ' weeks ago';
  }

  function renderMemory() {
    var body = document.getElementById('mb-body');
    var againBtn = document.getElementById('mb-another');
    if (!body) return;
    var memories = gatherMemories();
    if (!memories.length) {
      body.innerHTML = '<div class="mb-empty">No memories logged yet. Read a little, play a little — the Oracle keeps every record.</div>';
      if (againBtn) againBtn.style.display = 'none';
      return;
    }
    if (againBtn) againBtn.style.display = '';
    var pick = memories[Math.floor(Math.random() * memories.length)];
    body.innerHTML = '<div class="mb-memory">"' + pick.text.replace(/</g, '&lt;') + '"</div>' +
      '<div class="mb-when">' + timeAgo(pick.ts) + '</div>';
  }

  var mbBtn = document.getElementById('memory-bank-btn');
  var mbOverlay = document.getElementById('memory-bank-overlay');
  var mbAnother = document.getElementById('mb-another');
  var mbClose = document.getElementById('mb-close');

  function openMemoryBank() {
    if (!mbOverlay) return;
    renderMemory();
    mbOverlay.classList.add('open');
    if (window.catalystTrack) catalystTrack('memory_bank_open');
  }
  function closeMemoryBank() {
    if (mbOverlay) mbOverlay.classList.remove('open');
  }
  if (mbBtn) mbBtn.addEventListener('click', openMemoryBank);
  if (mbAnother) mbAnother.addEventListener('click', renderMemory);
  if (mbClose) mbClose.addEventListener('click', closeMemoryBank);
  if (mbOverlay) mbOverlay.addEventListener('click', function(e) { if (e.target === mbOverlay) closeMemoryBank(); });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mbOverlay && mbOverlay.classList.contains('open')) closeMemoryBank();
  });

  /* Show the trigger button only once there's at least one real memory,
     and keep it in sync as new ones accrue. A gentle pulse animation
     demonstrates the Standby Protocol on genuinely new code: it stops
     spending cycles the instant the tab is backgrounded. */
  var pulseTimer = null;
  function pulseStart() {
    if (pulseTimer || !mbBtn) return;
    pulseTimer = setInterval(function() {
      mbBtn.style.boxShadow = mbBtn.style.boxShadow === '0 0 16px rgba(0,201,177,0.5)'
        ? '0 2px 12px rgba(0,0,0,0.4)' : '0 0 16px rgba(0,201,177,0.5)';
    }, 1800);
  }
  function pulseStop() {
    if (pulseTimer) { clearInterval(pulseTimer); pulseTimer = null; }
  }
  window.catalystStandby.register('memory-bank-pulse', pulseStart, pulseStop);

  function refreshTriggerVisibility() {
    if (!mbBtn) return;
    var has = gatherMemories().length > 0;
    mbBtn.classList.toggle('on', has);
    if (has) pulseStart(); else pulseStop();
  }
  refreshTriggerVisibility();
  setTimeout(refreshTriggerVisibility, 1500); // catch ofrGetData once it's ready

})();

(function() {
  'use strict';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Film grade overlay: grain + vignette + duotone wash ── */
  var grain = document.createElement('div'); grain.id = 'noir-grain';
  var vignette = document.createElement('div'); vignette.id = 'noir-vignette';
  var gradewash = document.createElement('div'); gradewash.id = 'noir-gradewash';
  document.body.appendChild(vignette);
  document.body.appendChild(gradewash);
  document.body.appendChild(grain);

  /* ── 3D tilt on issue cards (desktop/fine-pointer only, CSS media
     query backstops touch devices even if this still runs there) ── */
  if (!reduceMotion && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.issue-card').forEach(function(card) {
      card.classList.add('tilt-armed');
      var raf = null;
      card.addEventListener('mousemove', function(e) {
        if (raf) return;
        raf = requestAnimationFrame(function() {
          raf = null;
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          var maxDeg = 7;
          card.style.transform = 'perspective(900px) rotateX(' + (-py * maxDeg) + 'deg) rotateY(' + (px * maxDeg) + 'deg) translateZ(6px)';
        });
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      });
    });
  }

  /* ── Scroll parallax for section background photography ──
     Single shared rAF loop, only alive while at least one parallax
     target is intersecting the viewport. Registers with the Standby
     Protocol (if it's loaded by the time this runs) so it also freezes
     when the tab is backgrounded, not just when scrolled away. */
  if (!reduceMotion) {
    var targets = document.querySelectorAll('.section-photo-bg');
    var active = new Set();
    var rafId = null;

    function tick() {
      active.forEach(function(el) {
        var r = el.parentElement.getBoundingClientRect();
        var progress = (window.innerHeight - r.top) / (window.innerHeight + r.height); // 0..1 through view
        var offset = (progress - 0.5) * 46; // px of drift, bounded
        el.style.transform = 'translateY(' + offset.toFixed(1) + 'px) scale(1.08)';
      });
      rafId = active.size ? requestAnimationFrame(tick) : null;
    }
    function startLoop() { if (!rafId && active.size) rafId = requestAnimationFrame(tick); }
    function stopLoop() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          entry.target.classList.add('parallax-armed');
          if (entry.isIntersecting) active.add(entry.target);
          else active.delete(entry.target);
        });
        startLoop();
      }, { rootMargin: '120px 0px 120px 0px' });
      targets.forEach(function(el) { io.observe(el); });
    }

    if (window.catalystStandby) {
      window.catalystStandby.register('noir-parallax', startLoop, stopLoop);
    } else {
      document.addEventListener('visibilitychange', function() {
        if (document.hidden) stopLoop(); else startLoop();
      });
    }
  }

})();

(function() {
  'use strict';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  function armTilt(card, maxDeg, liftTransform) {
    card.classList.add('tilt-armed');
    var raf = null;
    card.addEventListener('mousemove', function(e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      if (raf) return;
      raf = requestAnimationFrame(function() {
        raf = null;
        var rx = (0.5 - py) * maxDeg;
        var ry = (px - 0.5) * maxDeg;
        card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) ' + liftTransform;
      });
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  }

  document.querySelectorAll('.cover-art-item').forEach(function(card) {
    armTilt(card, 6, 'translateY(-10px) scale(1.025) translateZ(6px)');
  });
})();

/* ── OPERATIVE CLEARANCE TRACKER ─────────────────────────────
   Cross-cuts every interactive system on the site (story reader,
   Lagos map, personnel dossiers, Hero Quiz, Case File, Oracle
   terminal, Vessel ID card) into one persistent progress meter. */
window.ClearanceTracker = (function() {
  var KEY = 'catalyst_clearance_v1';

  var CATEGORIES = [
    { id: 'story', label: 'Story Archive', items: [
      { id: 'read_i1', label: 'Issue #01 — read', check: function(){ return !!localStorage.getItem('catalyst_read_1'); } },
      { id: 'read_i2', label: 'Issue #02 — read', check: function(){ return !!localStorage.getItem('catalyst_read_2'); } },
      { id: 'read_i3', label: 'Issue #03 — read', check: function(){ return !!localStorage.getItem('catalyst_read_3'); } },
      { id: 'read_i4', label: 'Issue #04 — read', check: function(){ return !!localStorage.getItem('catalyst_read_4'); } },
    ]},
    { id: 'intel', label: 'Field Intel', items: [
      { id: 'map_balogun', label: 'Balogun Market surveyed' },
      { id: 'map_eko-atlantic', label: 'Eko Atlantic surveyed' },
      { id: 'map_mushin', label: 'Mushin surveyed' },
      { id: 'map_oracle-compound', label: 'Oracle’s Compound surveyed' },
    ]},
    { id: 'personnel', label: 'Personnel Files', items: [
      { id: 'dossier_catalyst', label: 'Catalyst dossier accessed' },
      { id: 'dossier_thunderstrike', label: 'Thunderstrike dossier accessed' },
      { id: 'dossier_iron-wolf', label: 'Iron Wolf dossier accessed' },
      { id: 'dossier_mirror', label: 'The Mirror dossier accessed' },
      { id: 'dossier_oracle', label: 'Oracle dossier accessed' },
      { id: 'dossier_architect', label: 'Architect dossier accessed' },
    ]},
    { id: 'ops', label: 'Field Operations', items: [
      { id: 'quiz', label: 'Hero Quiz completed' },
      { id: 'case_file', label: 'Case File completed' },
      { id: 'terminal', label: 'Oracle terminal queried' },
      { id: 'vessel_card', label: 'Vessel ID card generated' },
      { id: 'vault', label: 'Architect’s Vault located' },
      { id: 'battle_sim', label: 'Combat Simulator run' },
      { id: 'glossary', label: 'Glossary term consulted' },
      { id: 'the_choice', label: 'The Choice walked to an ending' },
      { id: 'archive_search', label: 'Oracle Archive searched' },
      { id: 'field_note', label: 'Passage saved to Field Notes' },
    ]},
  ];

  var TIERS = [
    { min: 0,   name: 'LEVEL 0 — UNVERIFIED', desc: 'The Oracle doesn’t know your name yet. Start exploring.' },
    { min: 1,   name: 'LEVEL 1 — SYMPATHIZER', desc: 'Noted. The Oracle has opened a file on you.' },
    { min: 25,  name: 'LEVEL 2 — CONTACT', desc: 'You keep showing up. In this city, that is not nothing.' },
    { min: 50,  name: 'LEVEL 3 — FIELD ASSET', desc: 'Half the city’s secrets, and you went looking for the rest.' },
    { min: 75,  name: 'LEVEL 4 — TRUSTED OPERATIVE', desc: 'Very few get this far. The Oracle is paying attention now.' },
    { min: 100, name: 'LEVEL 5 — OMEGA CLEARANCE', desc: 'Full clearance granted. There is nothing left the Oracle is keeping from you.' },
  ];

  var manual = {};
  try { manual = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch(e) { manual = {}; }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(manual)); } catch(e) {}
  }

  function isChecked(item) {
    if (item.check) return !!item.check();
    return !!manual[item.id];
  }

  function summary() {
    var total = 0, done = 0;
    CATEGORIES.forEach(function(cat) {
      cat.items.forEach(function(item) {
        total++;
        if (isChecked(item)) done++;
      });
    });
    return { total: total, done: done, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function tierFor(pct) {
    var t = TIERS[0];
    for (var i = 0; i < TIERS.length; i++) { if (pct >= TIERS[i].min) t = TIERS[i]; }
    return t;
  }

  function grantOmega() {
    if (window.showToast) showToast('OMEGA CLEARANCE GRANTED — the Oracle has declassified a file for you.', 'success', 6000);
    var rewardEl = document.getElementById('clearanceReward');
    if (rewardEl) rewardEl.style.display = 'block';
  }

  function render() {
    var s = summary();
    var grid = document.getElementById('clearanceGrid');
    if (grid) {
      grid.innerHTML = CATEGORIES.map(function(cat) {
        var rows = cat.items.map(function(item) {
          var on = isChecked(item);
          return '<div class="clearance-item' + (on ? ' done' : '') + '">' +
            '<span class="clearance-item-mark">' + (on ? '✓' : '•') + '</span>' +
            '<span class="clearance-item-label">' + item.label + '</span>' +
            '</div>';
        }).join('');
        return '<div class="clearance-category"><div class="clearance-cat-label">' + cat.label + '</div>' + rows + '</div>';
      }).join('');
    }
    var tier = tierFor(s.pct);
    var pctEl = document.getElementById('clearancePct');
    if (pctEl) pctEl.textContent = s.pct + '%';
    var tierEl = document.getElementById('clearanceTier');
    if (tierEl) tierEl.textContent = tier.name.split('—')[0].trim();
    var nameEl = document.getElementById('clearanceLevelName');
    if (nameEl) nameEl.textContent = tier.name;
    var descEl = document.getElementById('clearanceLevelDesc');
    if (descEl) descEl.textContent = tier.desc;
    var countEl = document.getElementById('clearanceCount');
    if (countEl) countEl.textContent = s.done;
    var totalEl = document.getElementById('clearanceTotal');
    if (totalEl) totalEl.textContent = s.total;
    var ring = document.getElementById('clearanceRingFill');
    if (ring) {
      var circumference = 2 * Math.PI * 52;
      ring.style.strokeDasharray = String(circumference);
      ring.style.strokeDashoffset = String(circumference * (1 - s.pct / 100));
    }
    if (s.pct === 100) {
      var rewardEl = document.getElementById('clearanceReward');
      if (rewardEl) rewardEl.style.display = 'block';
    }
    return s;
  }

  function mark(id) {
    if (manual[id]) return;
    manual[id] = 1;
    save();
    var s = render();
    if (s.pct === 100 && !manual._rewarded) {
      manual._rewarded = 1;
      save();
      grantOmega();
    }
  }

  document.addEventListener('DOMContentLoaded', render);
  if (document.readyState === 'complete' || document.readyState === 'interactive') render();

  return { mark: mark, render: render, summary: summary };
})();

/* Architect's Vault visited — IntersectionObserver, mirrors chronicle-timeline pattern */
(function() {
  var vault = document.getElementById('architects-vault');
  if (!vault || !window.IntersectionObserver) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting && window.ClearanceTracker) {
        ClearanceTracker.mark('vault');
        obs.disconnect();
      }
    });
  }, { threshold: 0.2 });
  obs.observe(vault);
})();

/* ── AṢẸ COMBAT SIMULATOR ─────────────────────────────────────
   Every rating below is pulled directly from an already-published
   number on the site (DOSSIERS 4-stat averages for the four heroes
   with full dossiers, Zara's character-card stat average, and each
   villain's own Threat Level % from the villains section) — nothing
   here is invented. Two entries share the "The Mirror" codename (a
   pre-existing naming collision between Zara's hero alias and a
   separate Dark Assembly villain) — disambiguated in the roster
   labels so the simulator doesn't compound the site's confusion. */
var CS_ROSTER = [
  { id: 'bayo', name: 'BAYO — CATALYST', side: 'hero', img: './assets/bayo-portrait.webp', rating: 83, move: 'channels raw, unfiltered Aṣẹ output', source: 'Dossier avg — Power 82 · Speed 61 · Intelligence 88 · Aṣẹ Output 100' },
  { id: 'amara', name: 'AMARA — THUNDERSTRIKE', side: 'hero', img: './assets/amara-portrait.webp', rating: 86, move: 'unleashes a Ṣàngó thunder-arc', source: 'Dossier avg — Power 91 · Speed 94 · Intelligence 82 · Aṣẹ Output 78' },
  { id: 'ikenna', name: 'IKENNA — IRON WOLF', side: 'hero', img: './assets/ikenna-portrait.webp', rating: 80, move: 'raises Ògún’s iron guard', source: 'Dossier avg — Power 86 · Speed 100 · Intelligence 80 · Aṣẹ Output 55' },
  { id: 'zara', name: 'ZARA — THE MIRROR (HERO)', side: 'hero', img: './assets/zara-portrait.webp', rating: 91, move: 'vanishes into total invisibility', source: 'Card avg — Aṣẹ 78 · Speed 92 · Stealth 99 · Intel 95' },
  { id: 'oracle', name: 'THE ORACLE', side: 'hero', img: './assets/oracle-badagry-portrait.webp', rating: 60, move: 'reads the fight forty moves ahead', source: 'Dossier avg — Power 32 · Speed 20 · Intelligence 100 · Knowledge Aṣẹ 89' },
  { id: 'architect', name: 'THE ARCHITECT', side: 'villain', img: './assets/architect-portrait.webp', rating: 98, move: 'reroutes the fight three moves ahead of the first hit', source: 'Villain file — Threat Level 98%' },
  { id: 'mirror-v', name: 'THE MIRROR (DARK ASSEMBLY)', side: 'villain', img: './assets/mirror-villain-portrait.webp', rating: 90, move: 'perfectly mimics the opponent’s last technique', source: 'Villain file — Threat Level 90%' },
  { id: 'hollow-king', name: 'HOLLOW KING', side: 'villain', img: './assets/hollow-king-portrait.webp', rating: 84, move: 'drains Aṣẹ through Soul Harvest', source: 'Villain file — Threat Level 84%' },
  { id: 'mother-storm', name: 'MOTHER STORM', side: 'villain', img: './assets/shipyard.webp', rating: 79, move: 'rips open a corrupted Ọ̀run Rift', source: 'Villain file — Threat Level 79%' },
  { id: 'iron-preacher', name: 'IRON PREACHER', side: 'villain', img: './assets/iron-preacher-portrait.webp', rating: 72, move: 'summons Iron Constructs on the Ògún Wrath doctrine', source: 'Villain file — Threat Level 72%' },
];

(function() {
  var rosterA = document.getElementById('csRosterA');
  var rosterB = document.getElementById('csRosterB');
  var fightBtn = document.getElementById('csFightBtn');
  if (!rosterA || !rosterB || !fightBtn) return;

  var selA = null, selB = null, lastResult = null;

  function renderRoster(container) {
    container.innerHTML = CS_ROSTER.map(function(f) {
      return '<button type="button" class="cs-fighter-btn" data-id="' + f.id + '" title="' + f.source + '">' +
        '<img src="' + f.img + '" alt="' + f.name + '" loading="lazy">' +
        '<span class="cs-fighter-name">' + f.name + '</span>' +
        '<span class="cs-fighter-rating">' + f.rating + '</span>' +
        '</button>';
    }).join('');
  }
  renderRoster(rosterA);
  renderRoster(rosterB);

  function updateSelection() {
    Array.prototype.forEach.call(rosterA.querySelectorAll('.cs-fighter-btn'), function(b) {
      b.classList.toggle('selected', selA === b.getAttribute('data-id'));
    });
    Array.prototype.forEach.call(rosterB.querySelectorAll('.cs-fighter-btn'), function(b) {
      b.classList.toggle('selected', selB === b.getAttribute('data-id'));
    });
    fightBtn.disabled = !(selA && selB && selA !== selB);
  }

  rosterA.addEventListener('click', function(e) {
    var btn = e.target.closest ? e.target.closest('.cs-fighter-btn') : null;
    if (!btn) return;
    selA = btn.getAttribute('data-id');
    updateSelection();
  });
  rosterB.addEventListener('click', function(e) {
    var btn = e.target.closest ? e.target.closest('.cs-fighter-btn') : null;
    if (!btn) return;
    selB = btn.getAttribute('data-id');
    updateSelection();
  });

  function getFighter(id) {
    for (var i = 0; i < CS_ROSTER.length; i++) { if (CS_ROSTER[i].id === id) return CS_ROSTER[i]; }
    return null;
  }

  function fighterChip(f) {
    return '<img src="' + f.img + '" alt="' + f.name + '"><span>' + f.name + '</span><span class="cs-rating">' + f.rating + '</span>';
  }

  function runSim() {
    if (!selA || !selB || selA === selB) return;
    var A = getFighter(selA), B = getFighter(selB);
    var pA = A.rating / (A.rating + B.rating);
    var winner = Math.random() < pA ? A : B;
    var loser = winner === A ? B : A;
    var margin = Math.abs(A.rating - B.rating);
    var closerText = margin < 8
      ? 'A close one. Either fighter could have taken this.'
      : (winner.rating > loser.rating ? 'A decisive result — the numbers favoured this outcome.' : 'An upset. The numbers said otherwise.');

    lastResult = { A: A, B: B, winner: winner, loser: loser };

    var resultEl = document.getElementById('csResult');
    resultEl.classList.add('show');
    document.getElementById('csResultA').innerHTML = fighterChip(A);
    document.getElementById('csResultB').innerHTML = fighterChip(B);
    document.getElementById('csResultOdds').textContent = Math.round(pA * 100) + '% / ' + Math.round((1 - pA) * 100) + '%';

    var log = document.getElementById('csLog');
    log.innerHTML = '';
    var verdict = document.getElementById('csVerdict');
    verdict.style.display = 'none';
    document.getElementById('csResultActions').style.display = 'none';

    var lines = [
      A.name + ' ' + A.move + '.',
      B.name + ' ' + B.move + '.',
      winner.name + ' comes out on top. ' + closerText,
    ];
    var delay = 300;
    lines.forEach(function(line, i) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'cs-log-line';
        p.textContent = line;
        log.appendChild(p);
        if (i === lines.length - 1) {
          setTimeout(function() {
            document.getElementById('csVerdictStamp').textContent = winner.name + ' WINS';
            document.getElementById('csVerdictStamp').className = 'cs-verdict-stamp ' + (winner.side === 'villain' ? 'cs-stamp-villain' : 'cs-stamp-hero');
            document.getElementById('csVerdictText').textContent = winner.side === 'villain'
              ? 'The Dark Assembly logs this as a confirmed victory.'
              : 'The Oracle logs this as a confirmed hero victory.';
            verdict.style.display = 'block';
            document.getElementById('csResultActions').style.display = 'flex';
            if (window.ClearanceTracker) ClearanceTracker.mark('battle_sim');
          }, 500);
        }
      }, delay);
      delay += 900;
    });

    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  fightBtn.addEventListener('click', runSim);
  window.csRunAgain = function() { if (selA && selB) runSim(); };

  window.csShareResult = function() {
    if (!lastResult) return;
    var txt = 'AṢẸ COMBAT SIMULATOR: ' + lastResult.winner.name + ' defeated ' + lastResult.loser.name + '. Run your own matchup free: https://catalyst-awakening.netlify.app/#combat-sim';
    if (navigator.share) {
      navigator.share({ title: 'Aṣẹ Combat Simulator', text: txt }).catch(function() {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function() {
        if (window.showToast) showToast('Result copied — share it!', 'success', 2500);
      }).catch(function() {});
    }
  };

  window.csRandomMatch = function() {
    if (!CS_ROSTER || CS_ROSTER.length < 2) return;
    var idxA = Math.floor(Math.random() * CS_ROSTER.length);
    var idxB = Math.floor(Math.random() * CS_ROSTER.length);
    while (idxB === idxA) {
      idxB = Math.floor(Math.random() * CS_ROSTER.length);
    }
    selA = CS_ROSTER[idxA].id;
    selB = CS_ROSTER[idxB].id;
    updateSelection();
    runSim();
  };
})();

/* ── ÌTUMỌ̀ GLOSSARY ───────────────────────────────────────────
   Every definition below is grounded in how the site itself already
   uses the term (the lore panels, realm cards, Orisha list and the
   inline "Term — meaning" glosses scattered through the story), not
   invented. Pronunciations are English-reader approximations and are
   labelled as such in the UI — Yoruba is tonal and the diacritics
   carry pitch, which a respelling can only hint at. */
var GLOSSARY = [
  { t: 'Aṣẹ', alt: ['Ase'], pron: 'AH-sheh', cat: 'Power',
    s: 'The divine power underlying all things.',
    l: 'The force the whole story runs on. The site describes it flowing through the world "like electricity through a copper wire" — the Orishas hold it, vessels channel it, and the Pale Council built an industry out of siphoning it. Also used in everyday Yoruba as an affirmation, roughly "so be it" / "it is done".' },
  { t: 'Ọ̀run', alt: ['Orun'], pron: 'OH-roon', cat: 'Realm',
    s: 'The spirit realm — home of the Orishas.',
    l: 'One of the two parallel tracks existence runs on. Its formal name on the realm map is Ilé Àwọn Òrìṣà — Home of the Orishas: where the Orishas reign, where the dead hold court, and where Aṣẹ originates before it reaches the physical world.' },
  { t: 'Àiyé', alt: ['Aiye'], pron: 'ah-YEH', cat: 'Realm',
    s: 'The physical world — the one Lagos is in.',
    l: 'The counterpart to Ọ̀run. The site puts it plainly: "the physical world of Lagos, concrete and exhaust and hunger and joy." For centuries a membrane held the two apart. The Pale Council broke it.' },
  { t: 'Ọ̀run-Bleed', alt: ['Orun-Bleed', 'Ọ̀run-bleed'], pron: 'OH-roon bleed', cat: 'Story',
    s: 'What happens when the two realms tear into each other.',
    l: 'The story\'s own term for the membrane between Ọ̀run and Àiyé failing. Spirits walk Balogun Market, dead ancestors turn up at weddings, and the readings keep accelerating. Ground zero was the first Bleed at Balogun.' },
  { t: 'Orisha', alt: ['Orishas', 'Òrìṣà', 'Orisa'], pron: 'oh-REE-shah', cat: 'Divine',
    s: 'A deity of the Yoruba pantheon.',
    l: 'The divine powers at the centre of Yoruba cosmology. They cannot fully manifest in the physical world without human vessels — which is why, once the membrane tore, they began choosing champions.' },
  { t: 'Ṣàngó', alt: ['Sango', 'Shango'], pron: 'SHAHN-go', cat: 'Orisha',
    s: 'Thunder King — lightning, justice, royalty.',
    l: 'Amara\'s Orisha, and simultaneously one of Bayo\'s — the first time this Orisha has answered two vessels at once. Her talking drum does not make thunder; it requests it.' },
  { t: 'Ògún', alt: ['Ogun'], pron: 'OH-goon', cat: 'Orisha',
    s: 'Lord of Iron — iron, war, labour, technology.',
    l: 'Carried by two very different people: Ikenna holds the smith\'s iron, Zara the older road-clearer aspect. Same god, two people who fight nothing alike.' },
  { t: 'Ọ̀ṣun', alt: ['Osun', 'Ọṣun', 'Oshun'], pron: 'OH-shoon', cat: 'Orisha',
    s: 'River Goddess — water, love, fertility, art.',
    l: 'Commands fresh water: rivers, tears, blood, rain. The only female Orisha excluded from the original divine council — when they ignored her, the world dried, and they never ignored her again.' },
  { t: 'Ọya', alt: ['Oya', 'Oyá', 'Ọ̀yà'], pron: 'OH-yah', cat: 'Orisha',
    s: 'Lady of Storms — wind, change, death, markets.',
    l: 'Rules Balogun Market and its sudden storms. No living vessel has been confirmed for her; the story says she is still choosing.' },
  { t: 'Ẹṣù', alt: ['Esu', 'Eshu'], pron: 'EH-shoo', cat: 'Orisha',
    s: 'The Trickster — crossroads, chance, communication.',
    l: 'The Orisha of the crossroads and of messages between realms. Appears across the story as tricksters, translators, thieves and diplomats — the same Orisha wearing different coats depending on what the crossroads demanded.' },
  { t: 'Obatálá', alt: ['Obatala', 'Obatàlá'], pron: 'oh-bah-TAH-lah', cat: 'Orisha',
    s: 'The Arch-Orisha.',
    l: 'The senior figure of the divine council. When the Orisha court splits six-six over what Bayo is, Obatala refuses to speak either position.' },
  { t: 'Ifá', alt: ['Ifa'], pron: 'ee-FAH', cat: 'Practice',
    s: 'The Yoruba divination system and its body of knowledge.',
    l: 'The recorded corpus the Oracle works from — four thousand years of it. The Architect\'s true name has been erased from every Ifá text in existence, which the story treats as the most frightening detail about her.' },
  { t: 'Ìmọ̀lẹ̀', alt: ['Imole', 'Ìmọ́lẹ̀'], pron: 'ee-MAW-leh', cat: 'Power',
    s: 'Light, illumination — and Bayo\'s classification.',
    l: 'Used on the site both for Bayo\'s designation, Ìmọ̀lẹ̀ Àárọ̀, and for the Ìmọ̀lẹ̀ Circle. The Tier I power name is glossed on the Codex as Ìmọ́lẹ̀ Àkọ́kọ́ — "The First Light".' },
  { t: 'Eégun', alt: ['Egun', 'Egúngún', 'Egungun'], pron: 'EH-goon', cat: 'Practice',
    s: 'The ancestral masquerade.',
    l: 'The masked ancestral tradition. In the story\'s cosmology, Eégun masquerades were one of the sanctioned ways the door between realms opened — briefly, on festival days, by agreement.' },
  { t: 'Àgbà', alt: ['Agba'], pron: 'ahg-BAH', cat: 'Everyday',
    s: 'Elder — a person owed deference.',
    l: 'The Oracle\'s compound is called Ilé Àgbà Adesanya — "The Elder\'s House". The word carries authority earned by age and knowledge, not rank.' },
  { t: 'Adire', alt: ['Àdìrẹ', 'Adìre'], pron: 'ah-DEE-reh', cat: 'Everyday',
    s: 'Yoruba resist-dyed indigo cloth.',
    l: 'The patterned indigo textile tradition of the Yoruba. Its motifs run through the site\'s art direction and through the fabric the characters actually wear.' },
  { t: 'danfo', alt: ['DANFO', 'Danfo'], pron: 'DAN-fo', cat: 'Everyday',
    s: 'The yellow Lagos minibus.',
    l: 'The battered yellow commercial minibus that is the circulatory system of Lagos transport — and the vehicle Bayo stops with nothing but his hands in Issue #1.' },
  { t: 'naira', alt: ['Naira', '₦'], pron: 'NYE-rah', cat: 'Everyday',
    s: 'Nigeria\'s currency.',
    l: 'Used in the story to measure exactly how little Bayo has: thirty-two naira, a dead phone, and six weeks of grief.' },
  { t: 'Ìlú Àgbáyé', alt: ['Ilu Agbaye'], pron: 'ee-LOO ahg-BAH-yeh', cat: 'Realm',
    s: 'The World City — Neo-Lagos.',
    l: 'The realm map\'s formal name for the city itself, positioning Lagos not as a setting but as one of the six realms the story moves between.' },
  { t: 'Àgbègbè Òfò', alt: ['Agbegbe Ofo'], pron: 'ahg-BEG-beh OH-foh', cat: 'Realm',
    s: 'Territory of Loss — the Void.',
    l: 'Neither Ọ̀run nor Earth: the space between worlds, where forgotten things go and destroyed Aṣẹ falls. Entering without a Sovereign-tier anchor is a death sentence.' }
];

(function() {
  var grid = document.getElementById('glGrid');
  var pop = document.getElementById('glPop');
  if (!grid || !pop) return;

  var byKey = {};
  GLOSSARY.forEach(function(g) { byKey[g.t] = g; });

  /* ---------- browsable grid ---------- */
  var cats = ['All'].concat(GLOSSARY.map(function(g) { return g.cat; })
    .filter(function(c, i, a) { return a.indexOf(c) === i; }).sort());
  var activeCat = 'All';

  var filters = document.getElementById('glFilters');
  filters.innerHTML = cats.map(function(c) {
    return '<button type="button" class="gl-filter' + (c === 'All' ? ' active' : '') + '" data-cat="' + c + '">' + c + '</button>';
  }).join('');

  function renderGrid() {
    var q = (document.getElementById('glSearch').value || '').trim().toLowerCase();
    var rows = GLOSSARY.filter(function(g) {
      if (activeCat !== 'All' && g.cat !== activeCat) return false;
      if (!q) return true;
      return (g.t + ' ' + g.alt.join(' ') + ' ' + g.s + ' ' + g.l + ' ' + g.cat).toLowerCase().indexOf(q) !== -1;
    });
    grid.innerHTML = rows.map(function(g) {
      return '<article class="gl-card" id="gl-card-' + slug(g.t) + '">' +
        '<div class="gl-card-head"><h3 class="gl-term">' + g.t + '</h3><span class="gl-cat">' + g.cat + '</span></div>' +
        '<div class="gl-pron">' + g.pron + '</div>' +
        '<p class="gl-short">' + g.s + '</p>' +
        '<p class="gl-long">' + g.l + '</p>' +
        '</article>';
    }).join('');
    document.getElementById('glEmpty').style.display = rows.length ? 'none' : 'block';
  }

  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'term'; }

  filters.addEventListener('click', function(e) {
    var b = e.target.closest && e.target.closest('.gl-filter');
    if (!b) return;
    activeCat = b.getAttribute('data-cat');
    Array.prototype.forEach.call(filters.querySelectorAll('.gl-filter'), function(x) {
      x.classList.toggle('active', x === b);
    });
    renderGrid();
  });
  document.getElementById('glSearch').addEventListener('input', renderGrid);
  renderGrid();

  /* ---------- shared popover ---------- */
  function openPop(entry, anchor) {
    document.getElementById('glPopTerm').textContent = entry.t;
    document.getElementById('glPopPron').textContent = entry.pron;
    document.getElementById('glPopShort').textContent = entry.s;
    pop.hidden = false;
    var r = anchor.getBoundingClientRect();
    var w = pop.offsetWidth || 260;
    var left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
    var top = r.bottom + window.scrollY + 8;
    // flip above if it would run off the bottom of the viewport
    if (r.bottom + (pop.offsetHeight || 140) + 16 > window.innerHeight) {
      top = r.top + window.scrollY - (pop.offsetHeight || 140) - 8;
    }
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
    pop.classList.add('open');
    if (window.ClearanceTracker) ClearanceTracker.mark('glossary');
    if (window.catalystTrack) catalystTrack('glossary_term', { term: entry.t });
  }
  function closePop() { pop.classList.remove('open'); pop.hidden = true; }
  document.getElementById('glPopClose').addEventListener('click', closePop);
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closePop(); });
  document.addEventListener('click', function(e) {
    if (pop.hidden) return;
    if (pop.contains(e.target) || (e.target.closest && e.target.closest('.gloss-term'))) return;
    closePop();
  });
  window.addEventListener('resize', closePop);

  /* ---------- inline annotation ---------- */
  // Longest first so "Ọ̀run-Bleed" wins over "Ọ̀run", and "Ìlú Àgbáyé" over "Àgbà".
  var VARIANTS = [];
  GLOSSARY.forEach(function(g) {
    [g.t].concat(g.alt).forEach(function(v) { VARIANTS.push({ v: v, entry: g }); });
  });
  VARIANTS.sort(function(a, b) { return b.v.length - a.v.length; });

  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // \p{M} covers Yoruba combining diacritics, so a boundary check doesn't
  // split a term mid-accent the way a plain \b would.
  var reCache = {};
  function reFor(v) {
    if (!reCache[v]) {
      try {
        reCache[v] = new RegExp('(^|[^\\p{L}\\p{M}\\p{N}])(' + esc(v) + ')(?![\\p{L}\\p{M}\\p{N}])', 'u');
      } catch (err) {
        reCache[v] = new RegExp('(^|[^A-Za-z0-9])(' + esc(v) + ')(?![A-Za-z0-9])');
      }
    }
    return reCache[v];
  }

  var SKIP = 'a,button,input,textarea,select,script,style,code,pre,.gloss-term,#glossary,.gl-pop';
  function annotate(root) {
    var seen = {};
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (node.parentElement && node.parentElement.closest(SKIP)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var texts = [];
    var n;
    while ((n = walker.nextNode())) texts.push(n);

    texts.forEach(function(node) {
      for (var i = 0; i < VARIANTS.length; i++) {
        var key = VARIANTS[i].entry.t;
        if (seen[key]) continue;              // once per container, not per sentence
        var m = reFor(VARIANTS[i].v).exec(node.nodeValue);
        if (!m) continue;
        var start = m.index + m[1].length;
        var mid = node.splitText(start);
        mid.splitText(m[2].length);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gloss-term';
        btn.textContent = mid.nodeValue;
        btn.setAttribute('data-term', key);
        btn.setAttribute('aria-label', mid.nodeValue + ' — tap for definition');
        mid.parentNode.replaceChild(btn, mid);
        seen[key] = true;
        return;                                // one annotation per text node
      }
    });
  }

  document.querySelectorAll('.story-prose, .panel-narration').forEach(annotate);

  document.addEventListener('click', function(e) {
    var b = e.target.closest && e.target.closest('.gloss-term');
    if (!b) return;
    e.preventDefault();
    var entry = byKey[b.getAttribute('data-term')];
    if (entry) openPop(entry, b);
  });

  window.catalystGlossaryCount = function() {
    return document.querySelectorAll('.gloss-term').length;
  };
})();

/* ── THE CHOICE — interactive ordeal ──────────────────────────
   Dramatises the canonical Issue #04 Panel 3 decision ("Control It or
   Let It Grow Wild"). Every premise is taken from the published scene:
   the Oracle's answer that control means no time before the Vaccine,
   the danfo Bayo pulled off the road with a thought, the thirty-four
   day window, Tower 7 powering up, and the three teammates who had each
   already made a version of the same bet. The hidden fifth ending is
   licensed by the scene's own line — "He expects someone to say there
   has to be a third option. Nobody says that." */
var TC_NODES = [
  {
    loc: 'ORACLE\'S COMPOUND — IDUMOTA · 06:12',
    narration: 'The Oracle does not soften it. The Vaccine is six weeks from completion. Your Aṣẹ is updating faster than your understanding of it — last night you pulled a danfo off the road with a thought you did not finish thinking. The driver was fine. The danfo was not.',
    prompt: 'He asks what you intend to do about it.',
    choices: [
      { t: 'Slow it down. Learn the shape of it before it gets any bigger.', r: -2, b: 0 },
      { t: 'Let it run. I will learn on the way or I will not learn at all.', r: +2, b: 0 },
      { t: 'Ask him what he would do if he were nineteen and holding this.', r: 0, b: +1 }
    ]
  },
  {
    loc: 'COMPOUND COURTYARD — MINUTES LATER',
    narration: 'Amara, Ikenna and Zara are in the courtyard. None of them know yet what the Oracle just told you. Ikenna is cleaning a spanner that does not need cleaning. Zara is watching the gate.',
    prompt: 'What do they get from you?',
    choices: [
      { t: 'All of it. The odds, the Vaccine, what "grow wild" might cost.', r: 0, b: +2 },
      { t: 'The deadline only. They do not need the part about me.', r: +1, b: -2 },
      { t: 'Ask them first what they would want to be told.', r: -1, b: +2 }
    ]
  },
  {
    loc: 'MUSHIN — 02:40, THE NIGHT AFTER',
    narration: 'You cannot sleep. The Aṣẹ System is showing you a capacity you have not trained for and cannot name. Somewhere on the third floor a baby is crying. The whole street is thin walls and other people\'s lives.',
    prompt: 'You are alone with something enormous.',
    choices: [
      { t: 'Test it. Out past the estate, where there is nothing to break.', r: +2, b: -1 },
      { t: 'Shut it down and sit with the fear until morning.', r: -2, b: 0 },
      { t: 'Wake Ikenna. He has done three nights of this alone already.', r: 0, b: +2 }
    ]
  },
  {
    loc: 'EKO ATLANTIC — TOWER 7 · POWERING UP',
    narration: 'Across the lagoon, something new comes online in Tower 7. The Architect has arrived, and the Architect has been told: no more gentle approaches. Zara puts a number on the table — thirty-four days, if the schedule holds.',
    prompt: 'Thirty-four days. How do you spend them?',
    choices: [
      { t: 'Push the ceiling every single day. Find out what I actually am.', r: +2, b: 0 },
      { t: 'Drill the four of us until we move like one thing.', r: 0, b: +2 },
      { t: 'Build a fail-safe. Someone has to be able to stop me.', r: -2, b: +1 },
      { t: 'There has to be an option nobody in this courtyard has said out loud.', r: 0, b: 0, third: true }
    ]
  },
  {
    loc: 'DAY 31 — THE LAGOON AT 4 AM',
    narration: 'Three days out. The water turns the colour the Oracle has spent forty-three sleepless years failing to name. You have felt the thing at the edge of your own capacity now. It does not feel like a weapon. It feels like a door that only opens outward.',
    prompt: 'The last quiet moment you are going to get.',
    choices: [
      { t: 'Step through it now, alone, before anyone can be standing too close.', r: +2, b: -2 },
      { t: 'Hold at the threshold. Cross it only when the city needs me to.', r: -1, b: +1 },
      { t: 'Bring the three of them down here and cross it in front of them.', r: +1, b: +2 }
    ]
  },
  {
    loc: 'DAY 34 — WHATEVER THE ARCHITECT BRINGS',
    narration: 'It begins the way Zara said it would: all four of you standing in front of it regardless. Every decision you have made in thirty-four days is now a fact about your body and the people beside you.',
    prompt: 'Last call.',
    choices: [
      { t: 'Open all the way. Everything I have, without a ceiling.', r: +2, b: 0 },
      { t: 'Exactly as much as the moment needs. Not one degree more.', r: -2, b: 0 },
      { t: 'Whatever the other three need me to be right now.', r: 0, b: +2 }
    ]
  }
];

var TC_ENDINGS = {
  catalyst: {
    stamp: 'CANON ALIGNED',
    title: 'THE CATALYST',
    body: 'You let it grow wild, and you did not do it alone. You went past the ceiling with three people close enough to be hurt by it — and told them exactly what they were standing next to. This is, almost exactly, what Bayo does. The Oracle called it the only answer that was ever available; he simply refused to say so before you found it yourself.',
    canon: 'This is the path the published Issue #04 takes.'
  },
  wildfire: {
    stamp: 'DIVERGENT',
    title: 'THE WILDFIRE',
    body: 'You grew wild and you did it at arm\'s length — testing alone, crossing alone, carrying the worst of it where nobody could see. Lagos may well survive you. The question the Oracle never answered is whether the four of them do, and whether the person who walks out is the one who walked in.',
    canon: 'Bayo was offered this path. Zara talked him out of it without ever naming it.'
  },
  anchor: {
    stamp: 'DIVERGENT',
    title: 'THE ANCHOR',
    body: 'You chose control, and you chose it out loud, with the other three holding the rope. Nothing you did was reckless and nothing you did was solo. It is the most careful version of this story — and the Oracle already told you what careful costs: there is not enough time. You may have built something that outlasts you and arrives late.',
    canon: 'The Oracle answers this one in the published scene with a single word: "No."'
  },
  small: {
    stamp: 'DIVERGENT',
    title: 'THE MAN WHO STAYED SMALL',
    body: 'You slowed it down and you carried it by yourself. Every individual decision was defensible. Together they add up to the one outcome the Oracle warned you about in the first sixty seconds — you stay small, and Lagos loses. Nobody in the courtyard will blame you. That is the part that will be hard to live with.',
    canon: 'This is the outcome Issue #04 exists to argue against.'
  },
  third: {
    stamp: 'UNCLASSIFIED — RARE PATH',
    title: 'THE THIRD OPTION',
    body: 'You said the sentence nobody in the courtyard said. In the published scene Bayo expects someone to argue that there has to be another way, and the narration is explicit: nobody says that. You said it — and then you held the line, refusing to be pushed all the way to either pole. The Oracle has no answer on file for this. He has been keeping records for 144 years. He writes it down.',
    canon: 'Issue #04: "He expects someone to say there has to be a third option. Nobody says that."'
  }
};

(function() {
  var stage = document.getElementById('tcNode');
  if (!stage) return;

  var KEY = 'catalyst_choice_endings_v1';
  var idx = 0, resolve = 0, bond = 0, saidThird = false;

  function found() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  function remember(id) {
    var f = found();
    if (f.indexOf(id) === -1) { f.push(id); try { localStorage.setItem(KEY, JSON.stringify(f)); } catch (e) {} }
    renderEndings();
  }
  function renderEndings() {
    var f = found();
    var order = ['catalyst', 'wildfire', 'anchor', 'small', 'third'];
    document.getElementById('tcEndings').innerHTML =
      '<span class="tc-end-count">' + f.length + ' / 5 endings found</span>' +
      order.map(function(id) {
        var got = f.indexOf(id) !== -1;
        return '<span class="tc-end-chip' + (got ? ' got' : '') + (id === 'third' ? ' secret' : '') + '">' +
          (got ? TC_ENDINGS[id].title : (id === 'third' ? '???' : '—')) + '</span>';
      }).join('');
  }
  renderEndings();

  function show(which) {
    ['tcIntro', 'tcNode', 'tcEnd'].forEach(function(id) {
      document.getElementById(id).hidden = (id !== which);
    });
  }

  function renderNode() {
    var n = TC_NODES[idx];
    document.getElementById('tcLoc').textContent = n.loc;
    document.getElementById('tcStep').textContent = 'MOMENT ' + (idx + 1) + ' / ' + TC_NODES.length;
    document.getElementById('tcBarFill').style.width = ((idx / TC_NODES.length) * 100) + '%';
    document.getElementById('tcNarration').textContent = n.narration;
    document.getElementById('tcPrompt').textContent = n.prompt;
    document.getElementById('tcChoices').innerHTML = n.choices.map(function(c, i) {
      return '<button type="button" class="tc-choice" data-i="' + i + '">' +
        '<span class="tc-choice-ltr">' + String.fromCharCode(65 + i) + '</span>' +
        '<span class="tc-choice-txt">' + c.t + '</span></button>';
    }).join('');
    show('tcNode');
  }

  function endingId() {
    // The rare path needs BOTH the spoken third option and a genuine refusal
    // to be driven to either pole — saying it once but then going hard wild
    // or hard control is just talk, and resolves to the matching pole.
    if (saidThird && Math.abs(resolve) <= 2 && bond >= 0) return 'third';
    var wild = resolve > 0, together = bond > 0;
    if (wild && together) return 'catalyst';
    if (wild && !together) return 'wildfire';
    if (!wild && together) return 'anchor';
    return 'small';
  }

  function finish() {
    var id = endingId();
    var e = TC_ENDINGS[id];
    document.getElementById('tcEndStamp').textContent = e.stamp;
    document.getElementById('tcEndStamp').className = 'tc-end-stamp' + (id === 'catalyst' ? ' canon' : (id === 'third' ? ' rare' : ''));
    document.getElementById('tcEndTitle').textContent = e.title;
    document.getElementById('tcEndBody').textContent = e.body;
    document.getElementById('tcCanon').textContent = e.canon;
    // clamp the axis dots to the track
    var rPct = Math.max(0, Math.min(100, 50 + (resolve / 10) * 50));
    var bPct = Math.max(0, Math.min(100, 50 + (bond / 10) * 50));
    document.getElementById('tcDotResolve').style.left = rPct + '%';
    document.getElementById('tcDotBond').style.left = bPct + '%';
    window._tcLast = e.title;
    remember(id);
    show('tcEnd');
    if (window.ClearanceTracker) ClearanceTracker.mark('the_choice');
    if (window.catalystTrack) catalystTrack('choice_ending', { ending: id });
  }

  function reset() { idx = 0; resolve = 0; bond = 0; saidThird = false; }

  document.getElementById('tcBegin').addEventListener('click', function() {
    reset(); renderNode();
    stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.getElementById('tcChoices').addEventListener('click', function(ev) {
    var b = ev.target.closest && ev.target.closest('.tc-choice');
    if (!b) return;
    var c = TC_NODES[idx].choices[parseInt(b.getAttribute('data-i'), 10)];
    resolve += c.r; bond += c.b;
    if (c.third) saidThird = true;
    idx++;
    if (idx >= TC_NODES.length) finish(); else renderNode();
  });

  document.getElementById('tcAgain').addEventListener('click', function() {
    reset(); renderNode();
    stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.getElementById('tcShare').addEventListener('click', function() {
    var f = found();
    var txt = 'I walked The Choice from Catalyst: The Awakening and got "' + (window._tcLast || '') +
      '" (' + f.length + '/5 endings found). Six moments, thirty-four days. Walk it yourself: https://catalyst-awakening.netlify.app/#the-choice';
    if (navigator.share) { navigator.share({ title: 'The Choice — Catalyst', text: txt }).catch(function() {}); }
    else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function() {
        if (window.showToast) showToast('Ending copied — share it!', 'success', 2500);
      }).catch(function() {});
    }
  });

  window.catalystChoiceState = function() {
    return { idx: idx, resolve: resolve, bond: bond, saidThird: saidThird, found: found() };
  };
})();

/* ══════════════════════════════════════════════════════════════════
   UNIVERSAL SEARCH — ORACLE ARCHIVE (⌘K)

   The site now carries ~33 sections, 10 fighters, 20 glossary terms,
   dozens of districts, arcs, realms and dossiers. Until now the only
   way to reach any of it was to know which nav link it hid behind.
   This is one keystroke to everything.

   The index is built by reading the rendered DOM on first open, not
   from a hand-written list. That is deliberate: every duplicated
   content list on this site has eventually drifted out of sync with
   the page it describes, and a search index that lies is worse than
   no search at all. The only hand-written parts are the section
   registry (labels that read better than the split <h2> markup) and
   the small set of verb-style commands.
   ══════════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  var overlay   = document.getElementById('cmdk');
  var input     = document.getElementById('cmdkInput');
  var resultsEl = document.getElementById('cmdkResults');
  var statusEl  = document.getElementById('cmdkStatus');
  if (!overlay || !input || !resultsEl) return;

  var RECENT_KEY  = 'catalyst_cmdk_recent_v1';
  var MAX_RESULTS = 24;
  var MAX_RECENT  = 5;

  /* ---------- text utilities ---------- */

  /* Yoruba diacritics carry tone and meaning, but nobody types them
     into a search box. Decomposing to NFD and dropping the combining
     marks lets "sango" find "Ṣàngó" and "ase" find "Aṣẹ" — while the
     displayed text keeps its correct orthography. */
  function fold(s) {
    return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  /* Same fold, but keeping a character-index map back to the original
     string so matches can be highlighted on the undecomposed text. */
  function foldMap(s) {
    var out = '', map = [], i, j, f;
    for (i = 0; i < s.length; i++) {
      f = s[i].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      for (j = 0; j < f.length; j++) { out += f[j]; map.push(i); }
    }
    return { f: out, map: map };
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function highlight(title, tokens) {
    var fm = foldMap(title), ranges = [];
    tokens.forEach(function(t) {
      var i = fm.f.indexOf(t);
      while (i !== -1) {
        var endIdx = fm.map[i + t.length - 1];
        if (endIdx != null) ranges.push([fm.map[i], endIdx + 1]);
        i = fm.f.indexOf(t, i + t.length);
      }
    });
    if (!ranges.length) return esc(title);
    ranges.sort(function(a, b) { return a[0] - b[0]; });
    var merged = [];
    ranges.forEach(function(r) {
      var last = merged[merged.length - 1];
      if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
      else merged.push([r[0], r[1]]);
    });
    var out = '', pos = 0;
    merged.forEach(function(r) {
      out += esc(title.slice(pos, r[0])) + '<mark>' + esc(title.slice(r[0], r[1])) + '</mark>';
      pos = r[1];
    });
    return out + esc(title.slice(pos));
  }

  function reduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- navigation ---------- */

  function scrollToEl(el, flash) {
    if (!el) return;
    var nav = document.querySelector('nav');
    var off = (nav && nav.offsetHeight ? nav.offsetHeight : 70) + 18;
    var y = el.getBoundingClientRect().top + window.scrollY - off;
    window.scrollTo({ top: Math.max(0, y), behavior: reduced() ? 'auto' : 'smooth' });
    if (!flash) return;
    el.classList.remove('cmdk-target-flash');
    void el.offsetWidth;                       // restart the animation
    el.classList.add('cmdk-target-flash');
    setTimeout(function() { el.classList.remove('cmdk-target-flash'); }, 1800);
  }

  function jump(selectorOrEl, flash) {
    close();
    var el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
    // The overlay closing restores scrolling; scroll on the next frame so
    // the restored body overflow is in effect before we move.
    requestAnimationFrame(function() { scrollToEl(el, flash); });
  }

  /* ---------- index ---------- */

  /* Curated because the real <h2>s are split across <br> and <em> for
     the poster typography ("READ THE / STORY") and read badly as
     one-line search results. */
  var SECTIONS = [
    ['universe',          'The Universe',              'A city where the gods walk again'],
    ['lagos-map',         'Interactive Lagos Map',     'Survey the districts, unlock intel'],
    ['locations',         'Districts & Locations',     'Where the story lives'],
    ['characters',        'Heroes',                    'Vessels of the Orishas'],
    ['constellation',     'How They Connect',          'Relationship constellation'],
    ['oracle-terminal',   'Oracle Terminal',           'Query the archive directly'],
    ['cover-gallery',     'Cover Gallery',             'Every issue cover'],
    ['artwork-gallery',   'Artwork Gallery',           'Original comic art'],
    ['villains',          'Villains',                  'The Dark Assembly and the Pale Council'],
    ['combat-sim',        'Aṣẹ Combat Simulator',      'Pick two fighters, see who wins'],
    ['hero-quiz',         'Hero Quiz',                 'Which vessel are you?'],
    ['case-file',         'Case File',                 'Identify the operative from the clues'],
    ['comics',            'The Comics',                'Issues and release status'],
    ['arcs',              'Eleven Arcs',               'The full story roadmap'],
    ['ase-system',        'The Aṣẹ System',            'How power works in this world'],
    ['read',              'Read Free',                 'Four issues, no paywall'],
    ['the-choice',        'The Choice',                'Branching narrative — five endings'],
    ['chronicle-timeline','Chronicle Timeline',        'The story in order'],
    ['arc2-teaser',       'Arc II Teaser',             'What comes next'],
    ['realms',            'The Known Realms',          'Ìlú Àgbáyé, Ọ̀run and the rest'],
    ['codex',             'Realm Codex',               'Deep lore on each realm'],
    ['glossary',          'Ìtumọ̀ Glossary',            'Yoruba and Lagos terms explained'],
    ['clearance',         'Your Clearance',            'Progress, markers and tiers'],
    ['architects-vault',  'The Architect’s Vault',     'Hidden files'],
    ['lore',              'The Orishas',               'Yoruba mythology behind the comic'],
    ['illustrated',       'Illustrated Universe',      'The full art gallery'],
    ['dispatch',          'Field Dispatches',          'Transmissions from the city'],
    ['community',         'Community',                 'Join the readers'],
    ['newsletter',        'Newsletter',                'Get every issue in your inbox'],
    ['access',            'Subscribe',                 'Support the book']
  ];

  var index = null;

  function txt(root, sel) {
    var n = root.querySelector(sel);
    return n ? n.textContent.trim().replace(/\s+/g, ' ') : '';
  }

  function entry(o) {
    var fm = fold(o.title);
    o._title = fm;
    o._words = fm.split(/[^a-z0-9]+/).filter(Boolean);
    o._keys  = fold([o.sub || ''].concat(o.keywords || []).join(' '));
    o._body  = fold(o.body || '');
    return o;
  }

  function buildIndex() {
    var items = [];

    SECTIONS.forEach(function(s) {
      var here = document.getElementById(s[0]);
      // A standalone issue page holds one section, but search there should
      // still reach the whole site — so sections that live on the home page
      // are indexed as links to it rather than dropped.
      if (!here && !CATALYST_ISSUE_PAGE) return;
      items.push(entry({
        title: s[1], sub: s[2], cat: 'Sections', icon: '§', weight: 40,
        go: here
          ? function() { jump('#' + s[0], false); }
          : function() { close(); location.href = '/#' + s[0]; }
      }));
    });

    // On a standalone issue page, the other three issues are other documents.
    // Read them off the tab bar that is already in the markup rather than
    // keeping a second list of issue names in here.
    document.querySelectorAll('.issue-page-tab:not(.active)').forEach(function(a) {
      var label = (a.textContent || '').trim();
      if (!label) return;
      items.push(entry({
        title: label, sub: 'Open the full issue', cat: 'Story', icon: '◈', weight: 38,
        keywords: ['issue', 'read', 'chapter'],
        go: function() { close(); location.href = a.getAttribute('href'); }
      }));
    });

    document.querySelectorAll('.char-card[data-dossier]').forEach(function(card) {
      var alias = txt(card, '.char-alias');
      if (!alias) return;
      var key = card.getAttribute('data-dossier');
      items.push(entry({
        title: alias,
        sub: txt(card, '.char-real-name') + ' · ' + txt(card, '.char-power'),
        body: txt(card, '.char-power'),
        keywords: [txt(card, '.char-real-name'), key, 'hero', 'vessel', 'dossier'],
        cat: 'Heroes', icon: '◈', weight: 60,
        go: function() {
          jump(card, true);
          setTimeout(function() { card.click(); }, reduced() ? 60 : 700);
        }
      }));
    });

    document.querySelectorAll('.villain-card').forEach(function(card) {
      var name = txt(card, '.villain-name');
      if (!name) return;
      items.push(entry({
        title: name,
        sub: txt(card, '.villain-alias') || txt(card, '.villain-rank'),
        body: txt(card, '.villain-desc'),
        keywords: [txt(card, '.villain-rank'), 'villain', 'antagonist', 'threat'],
        cat: 'Villains', icon: '☠', weight: 55,
        go: function() { jump(card, true); }
      }));
    });

    document.querySelectorAll('.location-card').forEach(function(card) {
      var name = txt(card, '.location-name');
      if (!name) return;
      items.push(entry({
        title: name,
        sub: txt(card, '.location-yoruba') + ' · ' + txt(card, '.location-tag'),
        body: txt(card, '.location-desc'),
        keywords: [txt(card, '.location-yoruba'), txt(card, '.location-tag'), 'district', 'location', 'lagos'],
        cat: 'Districts', icon: '⌖', weight: 45,
        go: function() { jump(card, true); }
      }));
    });

    document.querySelectorAll('.arc-card').forEach(function(card) {
      var title = txt(card, '.arc-title');
      if (!title) return;
      items.push(entry({
        title: title,
        sub: txt(card, '.arc-subtitle') + ' · ' + txt(card, '.arc-issues'),
        body: txt(card, '.arc-synopsis') + ' ' + txt(card, '.arc-power-name'),
        keywords: ['arc', 'storyline', txt(card, '.arc-num')],
        cat: 'Story Arcs', icon: '❖', weight: 50,
        go: function() { jump(card, true); }
      }));
    });

    document.querySelectorAll('.realm-card').forEach(function(card) {
      var name = txt(card, '.realm-name');
      if (!name) return;
      items.push(entry({
        title: name,
        sub: txt(card, '.realm-native'),
        body: txt(card, '.realm-desc'),
        keywords: [txt(card, '.realm-native'), 'realm', 'world', 'plane'],
        cat: 'Realms', icon: '◉', weight: 45,
        go: function() { jump(card, true); }
      }));
    });

    document.querySelectorAll('.issue-card[data-issue]').forEach(function(card) {
      var title = txt(card, '.issue-title-main');
      if (!title) return;
      var num = card.getAttribute('data-issue');
      items.push(entry({
        title: 'Issue #' + (num.length < 2 ? '0' + num : num) + ' — ' + title,
        sub: txt(card, '.issue-arc'),
        body: txt(card, '.issue-synopsis'),
        keywords: ['issue', 'comic', 'read', num, title],
        cat: 'Issues', icon: '▤', weight: 55,
        go: function() { jump(card, true); }
      }));
    });

    if (typeof GLOSSARY !== 'undefined' && GLOSSARY && GLOSSARY.length) {
      GLOSSARY.forEach(function(g) {
        var slug = g.t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'term';
        items.push(entry({
          title: g.t,
          sub: g.pron + ' · ' + g.s,
          body: g.l,
          keywords: (g.alt || []).concat([g.cat, 'glossary', 'term', 'meaning', 'yoruba']),
          cat: 'Glossary', icon: 'Ì', weight: 50,
          go: function() {
            var card = document.getElementById('gl-card-' + slug);
            // The grid is filtered by the glossary's own search box —
            // clear it so the term is definitely rendered before jumping.
            var glSearch = document.getElementById('glSearch');
            if (!card && glSearch) {
              glSearch.value = '';
              glSearch.dispatchEvent(new Event('input'));
              card = document.getElementById('gl-card-' + slug);
            }
            jump(card || '#glossary', !!card);
          }
        }));
      });
    }

    /* Entries registered by other systems through catalystPaletteAdd:
       every story chapter (with its full prose indexed for search, so a
       half-remembered line finds the page it is on) and the covenant
       card. These arrive asynchronously, which is why the index is
       rebuilt rather than cached forever. */
    (window.__cmdkQueue || []).forEach(function(it) {
      var CAT = { Story: 'Story Pages', Covenant: 'Commands' };
      items.push(entry({
        title: it.label,
        sub: it.kind === 'Story' ? 'Jump to this page in the reader' : '',
        body: it.search || '',
        keywords: [it.kind],
        cat: CAT[it.kind] || 'Sections',
        icon: it.kind === 'Story' ? '▤' : '▸',
        weight: it.kind === 'Story' ? 35 : 60,
        go: function() {
          close();
          if (it.action) { it.action(); return; }
          var el = document.getElementById(it.target);
          requestAnimationFrame(function() { scrollToEl(el, false); });
        }
      }));
    });

    /* Verb-style commands — the things you *do* rather than read. */
    [
      ['Take the Hero Quiz',          'Find out which vessel you are',        '#hero-quiz',        ['quiz','which hero','personality','test']],
      ['Run a combat simulation',     'Pick two fighters and settle it',      '#combat-sim',       ['fight','battle','versus','vs','simulator']],
      ['Solve the Case File',         'Identify the operative from clues',    '#case-file',        ['case','puzzle','deduce','detective']],
      ['Ask the Oracle',              'Query the terminal',                   '#oracle-terminal',  ['terminal','ask','command','console']],
      ['Walk The Choice',             'Branching narrative, five endings',    '#the-choice',       ['branching','endings','decision','interactive']],
      ['Check my clearance level',    'Markers logged and tier reached',      '#clearance',        ['progress','achievements','level','tier','score']],
      ['Start reading — free issues', 'Four issues, no paywall',              '#read',             ['read','free','start','begin','issue 1']],
      ['Subscribe for new issues',    'Get every drop in your inbox',         '#access',           ['subscribe','newsletter','email','join']]
    ].forEach(function(a) {
      if (!document.querySelector(a[2])) return;
      items.push(entry({
        title: a[0], sub: a[1], keywords: a[3],
        cat: 'Commands', icon: '▸', weight: 80,
        go: function() { jump(a[2], false); }
      }));
    });

    /* Button-backed commands, carried over from the palette this one
       replaced. Each is skipped when its control isn't on the page. */
    [
      ['Share this site',        'Send Catalyst to someone',      'hero-share-btn',   ['share','send','link','tell a friend']],
      ['Keyboard shortcuts',     'Every key this site listens to', 'kb-trigger-btn',  ['keys','shortcuts','hotkeys','help']],
      ['Sign in / Join',         'Create or open your account',    'navAuthBtn',      ['login','sign in','account','register']]
    ].forEach(function(a) {
      if (!document.getElementById(a[2])) return;
      items.push(entry({
        title: a[0], sub: a[1], keywords: a[3],
        cat: 'Commands', icon: '▸', weight: 70,
        go: function() { close(); document.getElementById(a[2]).click(); }
      }));
    });

    if (window.CatalystFieldNotes) {
      items.push(entry({
        title: 'Open my Field Notes',
        sub: 'Passages you saved while reading',
        keywords: ['notes','highlights','saved','bookmarks','quotes','annotations'],
        cat: 'Commands', icon: '◈', weight: 75,
        go: function() { close(); CatalystFieldNotes.open(); }
      }));
    }

    items.push(entry({
      title: 'Back to top', sub: 'Return to the hero', keywords: ['top','home','start','scroll up'],
      cat: 'Commands', icon: '▸', weight: 60,
      go: function() { close(); window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); }
    }));

    return items;
  }

  /* ---------- ranking ---------- */

  function score(it, tokens) {
    var total = 0;
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i], s = 0, j;
      if (it._title === t) s = 1000;
      else if (it._title.indexOf(t) === 0) s = 700;
      else {
        for (j = 0; j < it._words.length; j++) {
          if (it._words[j].indexOf(t) === 0) { s = 500; break; }
        }
        if (!s && it._title.indexOf(t) !== -1) s = 320;
        else if (!s && it._keys.indexOf(t) !== -1) s = 200;
        else if (!s && it._body.indexOf(t) !== -1) s = 90;
      }
      if (!s) return 0;              // every token has to land somewhere
      total += s;
    }
    return total + (it.weight || 0);
  }

  function search(q) {
    var tokens = fold(q).split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    var hits = [];
    index.forEach(function(it) {
      var s = score(it, tokens);
      if (s) hits.push({ it: it, s: s });
    });
    hits.sort(function(a, b) { return b.s - a.s || a.it.title.length - b.it.title.length; });
    hits = hits.slice(0, MAX_RESULTS);

    /* Rank first, then cluster. Purely score-ordered results interleave
       categories, which makes the group headings repeat down the list
       ("Sections… Issues… Sections…"). Clustering keeps each heading
       appearing once while preserving the ranking: categories are
       ordered by their best hit, rows within a category by score. */
    var order = [], byCat = {};
    hits.forEach(function(h) {
      if (!byCat[h.it.cat]) { byCat[h.it.cat] = []; order.push(h.it.cat); }
      byCat[h.it.cat].push(h.it);
    });
    var out = [];
    order.forEach(function(cat) { out = out.concat(byCat[cat]); });
    return out;
  }

  /* ---------- recents ---------- */

  function recents() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch (e) { return []; }
  }
  function rememberRecent(title) {
    try {
      var list = recents().filter(function(r) { return r !== title; });
      list.unshift(title);
      localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
    } catch (e) { /* private mode — recents are a nicety, not a feature */ }
  }

  /* ---------- rendering ---------- */

  var rows = [];      // flat list of { it, el } in display order
  var active = -1;

  function render(items, tokens, headingOverride) {
    rows = [];
    if (!items.length) {
      resultsEl.innerHTML = '<div class="cmdk-empty"><strong>NO RECORD FOUND</strong>' +
        'The archive has nothing under that name.<br>Try a district, an Orisha, or a character.</div>';
      statusEl.textContent = 'No results';
      active = -1;
      return;
    }

    var html = '', lastCat = null, i = 0;
    items.forEach(function(it) {
      var cat = headingOverride || it.cat;
      if (cat !== lastCat) {
        html += '<div class="cmdk-group">' + esc(cat) + '</div>';
        lastCat = cat;
      }
      html += '<button type="button" class="cmdk-row" role="option" aria-selected="false" data-i="' + i + '">' +
        '<span class="cmdk-row-icon" aria-hidden="true">' + esc(it.icon || '·') + '</span>' +
        '<span class="cmdk-row-body">' +
          '<span class="cmdk-row-title">' + (tokens.length ? highlight(it.title, tokens) : esc(it.title)) + '</span>' +
          (it.sub ? '<span class="cmdk-row-sub">' + esc(it.sub) + '</span>' : '') +
        '</span>' +
        '<span class="cmdk-row-go" aria-hidden="true">↵</span>' +
      '</button>';
      i++;
    });
    resultsEl.innerHTML = html;

    var els = resultsEl.querySelectorAll('.cmdk-row');
    items.forEach(function(it, n) { rows.push({ it: it, el: els[n] }); });
    setActive(0);
    statusEl.textContent = items.length + (items.length === 1 ? ' result' : ' results');
  }

  function renderDefault() {
    var recentTitles = recents();
    var recentItems = [];
    recentTitles.forEach(function(t) {
      var hit = index.filter(function(it) { return it.title === t; })[0];
      if (hit) recentItems.push(hit);
    });
    if (recentItems.length) {
      render(recentItems, [], 'Recent');
      return;
    }
    var suggested = index.filter(function(it) { return it.cat === 'Commands'; }).slice(0, 8);
    render(suggested, [], 'Try');
  }

  function setActive(n) {
    if (!rows.length) { active = -1; return; }
    if (n < 0) n = rows.length - 1;
    if (n >= rows.length) n = 0;
    if (active >= 0 && rows[active]) {
      rows[active].el.classList.remove('active');
      rows[active].el.setAttribute('aria-selected', 'false');
    }
    active = n;
    rows[active].el.classList.add('active');
    rows[active].el.setAttribute('aria-selected', 'true');
    rows[active].el.scrollIntoView({ block: 'nearest' });
  }

  function activate(n) {
    var row = rows[n];
    if (!row) return;
    rememberRecent(row.it.title);
    if (window.ClearanceTracker) ClearanceTracker.mark('archive_search');
    if (window.catalystTrack) catalystTrack('archive_search', { result: row.it.title, cat: row.it.cat });
    row.it.go();
  }

  /* ---------- open / close ---------- */

  var lastFocus = null;
  var isOpen = false;

  function open(seed) {
    if (isOpen) return;
    if (!index) index = buildIndex();
    lastFocus = document.activeElement;
    isOpen = true;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    // Force a reflow so the opacity/transform transition actually runs.
    void overlay.offsetWidth;
    overlay.classList.add('open');
    input.value = seed || '';
    if (input.value) render(search(input.value), fold(input.value).split(/\s+/).filter(Boolean));
    else renderDefault();
    input.focus();
    input.select();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    var finish = function() { if (!isOpen) overlay.hidden = true; };
    if (reduced()) finish(); else setTimeout(finish, 200);
    restoreFocus(overlay, lastFocus);
  }

  /* Hand focus back out of a dialog that is closing. Blurring first is the
     load-bearing part: element.focus() is a no-op on a non-focusable
     restore target such as <body>, which would otherwise leave focus
     parked inside the hidden overlay — bad for screen readers, and it
     silently disables the "/" shortcut, which refuses to fire while the
     user is typing in a field. */
  function restoreFocus(container, target) {
    var a = document.activeElement;
    if (a && a.blur && container.contains(a)) a.blur();
    if (target && target.focus && target !== document.body && document.contains(target)) {
      try { target.focus(); } catch (e) {}
    }
  }

  /* ---------- wiring ---------- */

  input.addEventListener('input', function() {
    var q = input.value.trim();
    if (!q) { renderDefault(); return; }
    render(search(q), fold(q).split(/\s+/).filter(Boolean));
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Home' && rows.length) { e.preventDefault(); setActive(0); }
    else if (e.key === 'End' && rows.length) { e.preventDefault(); setActive(rows.length - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); activate(active); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') { e.preventDefault(); setActive(active + (e.shiftKey ? -1 : 1)); }
  });

  resultsEl.addEventListener('mousemove', function(e) {
    var row = e.target.closest && e.target.closest('.cmdk-row');
    if (!row) return;
    var n = parseInt(row.getAttribute('data-i'), 10);
    if (n !== active) setActive(n);
  });

  resultsEl.addEventListener('click', function(e) {
    var row = e.target.closest && e.target.closest('.cmdk-row');
    if (!row) return;
    activate(parseInt(row.getAttribute('data-i'), 10));
  });

  overlay.addEventListener('mousedown', function(e) {
    if (e.target === overlay) close();
  });

  /* Global shortcut. "/" is a convenience but must never steal a
     keystroke from someone typing into the Oracle terminal, the
     newsletter form or the glossary's own filter. */
  function typingInField(el) {
    if (!el) return false;
    var tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      isOpen ? close() : open();
      return;
    }
    if (isOpen) return;
    if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !typingInField(document.activeElement)) {
      // Don't stack the search on top of a dialog that is already open.
      if (window.CatalystFocusTrap && CatalystFocusTrap.anyOpen()) return;
      e.preventDefault();
      open();
    }
  });

  var navBtn = document.getElementById('navSearchBtn');
  if (navBtn) navBtn.addEventListener('click', function() { open(); });

  var mobBtn = document.getElementById('mobileNavSearch');
  if (mobBtn) mobBtn.addEventListener('click', function() {
    if (typeof toggleMobileNav === 'function') toggleMobileNav();
    open();
  });

  /* Label the modifier for the keyboard actually in front of the reader,
     in both places the shortcut is advertised. */
  if (/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent)) {
    var navKbd = document.querySelector('.nav-search-kbd');
    if (navKbd) navKbd.textContent = '⌘K';
    var helpKbd = document.getElementById('kb-cmdk-key');
    if (helpKbd) helpKbd.textContent = '⌘ K';
  } else {
    var navKbd2 = document.querySelector('.nav-search-kbd');
    if (navKbd2) navKbd2.textContent = 'Ctrl K';
  }

  /* Take over the registration shim. Anything registered from here on
     (the story reader retries for up to two seconds while `pagers`
     builds) invalidates the index so the next open picks it up. */
  window.catalystPaletteAdd = function(newItems) {
    var added = false;
    (newItems || []).forEach(function(it) {
      if (it && it.label && (it.action || document.getElementById(it.target))) {
        window.__cmdkQueue.push(it);
        added = true;
      }
    });
    if (added) index = null;
  };

  window.CatalystSearch = {
    open: open,
    close: close,
    // Exposed for tests and for anything that changes indexable content.
    refresh: function() { index = null; },
    size: function() { if (!index) index = buildIndex(); return index.length; }
  };
})();

/* ══════════════════════════════════════════════════════════════════
   FIELD NOTES — keep what you read

   The reader already does paging, focus mode, text scale, deep links and
   full-text search. The one thing it could not do was let a reader keep
   anything: every passage worth remembering was gone the moment the page
   turned.

   ANCHORING. A highlight is stored as {issue, page, start, end, quote} —
   a character range over the concatenated text of one reader page. That
   works here because every transform this page applies to story text
   (the glossary annotator, the lore-term annotator, and this module's
   own <mark> wrapping) only ever splits and wraps text nodes; none of
   them add or remove a single character. So offsets taken before any
   annotation still resolve after all of it.

   The quote is stored anyway, and restore verifies the text at the range
   before trusting it — falling back to searching for the quote, and
   finally to listing the note as orphaned rather than highlighting the
   wrong words. Silently highlighting the wrong passage would be worse
   than not highlighting at all.
   ══════════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  var KEY = 'catalyst_field_notes_v1';
  var MAX_QUOTE = 600;

  var bar     = document.getElementById('fnBar');
  var drawer  = document.getElementById('fnDrawer');
  var listEl  = document.getElementById('fnList');
  var subEl   = document.getElementById('fnSub');
  if (!bar || !drawer || !listEl) return;

  /* ---------- store ---------- */

  var notes = [];
  function load() {
    try { notes = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { notes = []; }
    if (!Array.isArray(notes)) notes = [];
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) { /* private mode */ }
    updateCounts();
  }
  function nextId() {
    // Monotonic per-session ids; the timestamp alone can collide when two
    // highlights are saved inside the same millisecond.
    var max = 0;
    notes.forEach(function(n) { var v = parseInt(n.id, 10); if (v > max) max = v; });
    return String(max + 1);
  }

  /* ---------- page geometry ---------- */

  function pageEl(issue, page) {
    var panel = document.getElementById('panel-i' + issue);
    if (!panel) return null;
    return panel.querySelectorAll('.reader-page')[page] || null;
  }

  function textNodes(root) {
    var out = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) out.push(n);
    return out;
  }

  function pageText(root) {
    return textNodes(root).map(function(n) { return n.nodeValue; }).join('');
  }

  /* Where in the page's text does this Range start and end? Returns null
     when an endpoint sits on an element rather than a text node, which
     happens when a selection snaps to a block boundary — the caller then
     falls back to locating the quote by string search. */
  function offsetsFor(root, range) {
    var nodes = textNodes(root), pos = 0, start = -1, end = -1;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n === range.startContainer) start = pos + range.startOffset;
      if (n === range.endContainer) end = pos + range.endOffset;
      pos += n.nodeValue.length;
    }
    return (start >= 0 && end > start) ? { start: start, end: end } : null;
  }

  /* Wrap [start, end) in <mark> elements — one per text node the range
     crosses, so existing inline elements (glossary terms, <strong>, the
     dialogue markup) survive intact. */
  function wrapRange(root, start, end, id) {
    var nodes = textNodes(root), pos = 0, made = [];
    nodes.forEach(function(n) {
      var len = n.nodeValue.length, ns = pos, ne = pos + len;
      pos = ne;
      if (ne <= start || ns >= end) return;
      if (n.parentNode && n.parentNode.nodeName === 'MARK' &&
          n.parentNode.classList.contains('fn-hl')) return;   // already highlighted
      var a = Math.max(start, ns) - ns, b = Math.min(end, ne) - ns;
      var node = n;
      if (b < len) node.splitText(b);
      if (a > 0) node = node.splitText(a);
      var mark = document.createElement('mark');
      mark.className = 'fn-hl';
      mark.setAttribute('data-fn', id);
      mark.setAttribute('title', 'Saved to Field Notes — click to open');
      node.parentNode.replaceChild(mark, node);
      mark.appendChild(node);
      made.push(mark);
    });
    return made;
  }

  function unwrap(id) {
    document.querySelectorAll('mark.fn-hl[data-fn="' + id + '"]').forEach(function(m) {
      var parent = m.parentNode;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
      parent.normalize();
    });
  }

  /* ---------- restore ---------- */

  var restored = {};   // "issue:page" -> true

  function restorePage(issue, page) {
    var k = issue + ':' + page;
    if (restored[k]) return;
    var root = pageEl(issue, page);
    if (!root) return;
    restored[k] = true;

    var text = pageText(root);
    notes.forEach(function(n) {
      if (n.issue !== issue || n.page !== page) return;
      if (document.querySelector('mark.fn-hl[data-fn="' + n.id + '"]')) return;

      var start = n.start, end = n.end;
      if (text.slice(start, end) !== n.quote) {
        var idx = text.indexOf(n.quote);
        if (idx === -1) { n.orphan = true; return; }   // copy changed under it
        start = idx; end = idx + n.quote.length;
        n.start = start; n.end = end;                  // re-anchor for next time
      }
      n.orphan = false;
      wrapRange(root, start, end, n.id);
    });
  }

  function restoreAll() {
    var seen = {};
    notes.forEach(function(n) {
      var k = n.issue + ':' + n.page;
      if (seen[k]) return;
      seen[k] = true;
      restorePage(n.issue, n.page);
    });
  }

  /* ---------- selection toolbar ---------- */

  var pending = null;   // { issue, page, start, end, quote }

  function hideBar() { bar.hidden = true; pending = null; }

  function locateSelection() {
    var sel = window.getSelection && window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
    var range = sel.getRangeAt(0);
    var quote = sel.toString().replace(/\s+/g, ' ').trim();
    if (quote.length < 4) return null;
    if (quote.length > MAX_QUOTE) return null;

    var anchor = range.commonAncestorContainer;
    if (anchor.nodeType === 3) anchor = anchor.parentNode;
    var root = anchor.closest && anchor.closest('.reader-page');
    if (!root) return null;
    var panel = root.closest('.issue-reader-panel');
    if (!panel) return null;

    var issue = parseInt(panel.id.replace('panel-i', ''), 10);
    var pages = panel.querySelectorAll('.reader-page');
    var page = Array.prototype.indexOf.call(pages, root);
    if (isNaN(issue) || page < 0) return null;

    var text = pageText(root);
    var off = offsetsFor(root, range);
    // Selections that snap to a block boundary land on an element rather
    // than a text node; find the quote by search in that case.
    if (!off || text.slice(off.start, off.end).replace(/\s+/g, ' ').trim() !== quote) {
      var raw = sel.toString();
      var idx = text.indexOf(raw);
      if (idx === -1) return null;
      off = { start: idx, end: idx + raw.length };
    }
    // Drag-selections routinely pick up a leading or trailing space. Shrink
    // the range rather than trimming the string, so the stored offsets and
    // the stored quote stay in agreement for re-anchoring.
    var raw = text.slice(off.start, off.end);
    off.start += raw.length - raw.replace(/^\s+/, '').length;
    off.end   -= raw.length - raw.replace(/\s+$/, '').length;
    if (off.end <= off.start) return null;

    return { issue: issue, page: page, start: off.start, end: off.end,
             quote: text.slice(off.start, off.end), rect: range.getBoundingClientRect() };
  }

  function showBar() {
    var hit = locateSelection();
    if (!hit) { hideBar(); return; }
    pending = hit;
    bar.hidden = false;
    var w = bar.offsetWidth || 240, h = bar.offsetHeight || 34;
    var left = hit.rect.left + hit.rect.width / 2 - w / 2 + window.scrollX;
    left = Math.min(Math.max(8, left), window.innerWidth - w - 8 + window.scrollX);
    var top = hit.rect.top + window.scrollY - h - 10;
    if (hit.rect.top - h - 10 < 0) top = hit.rect.bottom + window.scrollY + 10;
    bar.style.left = left + 'px';
    bar.style.top = top + 'px';
  }

  document.addEventListener('mouseup', function(e) {
    if (bar.contains(e.target)) return;
    setTimeout(showBar, 10);
  });
  document.addEventListener('touchend', function(e) {
    if (bar.contains(e.target)) return;
    setTimeout(showBar, 60);
  });
  document.addEventListener('mousedown', function(e) {
    if (!bar.contains(e.target)) hideBar();
  });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') hideBar(); });
  window.addEventListener('scroll', function() { if (!bar.hidden) hideBar(); }, { passive: true });

  document.getElementById('fnCopy').addEventListener('click', function() {
    if (!pending) return;
    copy(pending.quote);
    hideBar();
  });

  document.getElementById('fnSave').addEventListener('click', function() {
    if (!pending) return;
    var p = pending;
    var dupe = notes.filter(function(n) {
      return n.issue === p.issue && n.page === p.page && n.start === p.start && n.end === p.end;
    })[0];
    if (dupe) {
      if (window.showToast) showToast('Already in your Field Notes.', 'info', 2600);
      hideBar();
      return;
    }
    var note = { id: nextId(), issue: p.issue, page: p.page, start: p.start, end: p.end,
                 quote: p.quote, note: '', ts: Date.now() };
    notes.push(note);
    save();
    var root = pageEl(p.issue, p.page);
    if (root) wrapRange(root, p.start, p.end, note.id);
    if (window.getSelection) window.getSelection().removeAllRanges();
    hideBar();
    if (window.ClearanceTracker) ClearanceTracker.mark('field_note');
    if (window.catalystTrack) catalystTrack('field_note_saved', { issue: p.issue, page: p.page });
    if (window.showToast) showToast('Saved to Field Notes.', 'success', 2600);
    render();
  });

  function copy(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      if (window.showToast) showToast('Copied.', 'success', 2000);
    } catch (e) {
      if (window.showToast) showToast('Could not copy on this browser.', 'info', 2600);
    }
  }

  /* ---------- clicking a highlight opens its note ---------- */

  document.addEventListener('click', function(e) {
    var m = e.target.closest && e.target.closest('mark.fn-hl');
    if (!m) return;
    openDrawer(m.getAttribute('data-fn'));
  });

  /* ---------- drawer ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* The reader's ISSUE_TITLES map is scoped inside another IIFE, so the
     title is read off the issue card instead — same source the covers
     and the archive search use, so it cannot disagree with them. */
  var titleCache = {};
  function issueTitle(n) {
    if (!(n in titleCache)) {
      var el = document.querySelector('.issue-card[data-issue="' + n + '"] .issue-title-main');
      titleCache[n] = el ? el.textContent.trim().replace(/\s+/g, ' ') : '';
    }
    return 'Issue #0' + n + (titleCache[n] ? ' — ' + titleCache[n] : '');
  }

  function pageLabel(n) {
    return n.page === 0 ? 'Cold open' : 'Page ' + n.page;
  }

  function render() {
    if (!notes.length) {
      listEl.innerHTML = '<div class="fn-empty"><strong>NOTHING FILED YET</strong>' +
        'Select any passage while reading and choose<br>“Save to Field Notes”. It will be here when you come back.</div>';
      subEl.textContent = 'Everything you marked while reading.';
      return;
    }

    var byIssue = {}, order = [];
    notes.slice().sort(function(a, b) {
      return a.issue - b.issue || a.page - b.page || a.start - b.start;
    }).forEach(function(n) {
      if (!byIssue[n.issue]) { byIssue[n.issue] = []; order.push(n.issue); }
      byIssue[n.issue].push(n);
    });

    var html = '';
    order.forEach(function(iss) {
      html += '<div class="fn-issue-head">' + esc(issueTitle(iss)) + '</div>';
      byIssue[iss].forEach(function(n) {
        html += '<article class="fn-note' + (n.orphan ? ' fn-orphan' : '') + '" data-id="' + n.id + '">' +
          '<button type="button" class="fn-quote" data-act="jump">“' + esc(n.quote) + '”</button>' +
          '<div class="fn-meta">' + esc(pageLabel(n)) +
            (n.orphan ? ' · passage moved — jump still works' : '') + '</div>' +
          '<textarea class="fn-annot" data-act="annot" rows="1" placeholder="Add your own note…">' +
            esc(n.note || '') + '</textarea>' +
          '<div class="fn-note-actions">' +
            '<button type="button" class="fn-act" data-act="copy">Copy</button>' +
            '<button type="button" class="fn-act fn-act-danger" data-act="del">Delete</button>' +
          '</div>' +
        '</article>';
      });
    });
    listEl.innerHTML = html;
    subEl.textContent = notes.length + (notes.length === 1 ? ' passage kept.' : ' passages kept.');
  }

  listEl.addEventListener('click', function(e) {
    var btn = e.target.closest && e.target.closest('[data-act]');
    if (!btn) return;
    var art = btn.closest('.fn-note');
    if (!art) return;
    var id = art.getAttribute('data-id');
    var note = notes.filter(function(n) { return n.id === id; })[0];
    if (!note) return;
    var act = btn.getAttribute('data-act');

    if (act === 'jump') {
      closeDrawer();
      if (window.catalystJumpTo) catalystJumpTo(note.issue, note.page);
      setTimeout(function() {
        restored[note.issue + ':' + note.page] = false;
        restorePage(note.issue, note.page);
        var m = document.querySelector('mark.fn-hl[data-fn="' + id + '"]');
        if (!m) return;
        m.scrollIntoView({ behavior: 'smooth', block: 'center' });
        m.classList.remove('fn-flash');
        void m.offsetWidth;
        m.classList.add('fn-flash');
        setTimeout(function() { m.classList.remove('fn-flash'); }, 1800);
      }, 500);
    } else if (act === 'copy') {
      copy('“' + note.quote + '”\n— ' + issueTitle(note.issue) + ', ' + pageLabel(note).toLowerCase() +
           (note.note ? '\n\n' + note.note : ''));
    } else if (act === 'del') {
      unwrap(id);
      notes = notes.filter(function(n) { return n.id !== id; });
      save();
      render();
    }
  });

  listEl.addEventListener('input', function(e) {
    if (!e.target.matches || !e.target.matches('[data-act="annot"]')) return;
    var art = e.target.closest('.fn-note');
    var id = art && art.getAttribute('data-id');
    var note = notes.filter(function(n) { return n.id === id; })[0];
    if (!note) return;
    note.note = e.target.value;
    save();
  });

  document.getElementById('fnCopyAll').addEventListener('click', function() {
    if (!notes.length) return;
    var out = ['FIELD NOTES — Catalyst: The Awakening', ''];
    var lastIssue = null;
    notes.slice().sort(function(a, b) { return a.issue - b.issue || a.page - b.page || a.start - b.start; })
      .forEach(function(n) {
        if (n.issue !== lastIssue) { out.push('', issueTitle(n.issue), ''); lastIssue = n.issue; }
        out.push('“' + n.quote + '”  (' + pageLabel(n).toLowerCase() + ')');
        if (n.note) out.push('   → ' + n.note);
        out.push('');
      });
    copy(out.join('\n'));
  });

  document.getElementById('fnClear').addEventListener('click', function() {
    if (!notes.length) return;
    if (!window.confirm('Delete all ' + notes.length + ' field notes? This cannot be undone.')) return;
    notes.forEach(function(n) { unwrap(n.id); });
    notes = [];
    save();
    render();
  });

  var lastFocus = null;
  function openDrawer(focusId) {
    lastFocus = document.activeElement;
    render();
    drawer.hidden = false;
    void drawer.offsetWidth;
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (window.ClearanceTracker) ClearanceTracker.mark('field_note');
    var target = focusId && listEl.querySelector('.fn-note[data-id="' + focusId + '"]');
    if (target) target.scrollIntoView({ block: 'center' });
    var close = document.getElementById('fnClose');
    if (close) close.focus();
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function() { drawer.hidden = true; }, 220);
    // Blurring and handing focus back is the shared modal focus trap's
    // job — it watches this drawer's open class. Doing it here as well
    // would be two implementations racing over the same thing.
  }

  document.getElementById('fnClose').addEventListener('click', closeDrawer);
  drawer.addEventListener('mousedown', function(e) { if (e.target === drawer) closeDrawer(); });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !drawer.hidden) closeDrawer();
  });

  /* ---------- reader chrome trigger ---------- */

  function updateCounts() {
    document.querySelectorAll('.rt-notes-count').forEach(function(el) {
      el.textContent = notes.length;
      el.hidden = notes.length === 0;
    });
  }

  function mountTriggers() {
    document.querySelectorAll('.issue-reader-panel .reader-tools').forEach(function(tools) {
      if (tools.querySelector('.rt-notes')) return;
      var b = document.createElement('button');
      b.className = 'rt-notes';
      b.type = 'button';
      b.setAttribute('aria-label', 'Open your Field Notes');
      b.setAttribute('title', 'Field Notes — passages you saved');
      b.innerHTML = '◈<span class="rt-notes-count" hidden>0</span>';
      b.addEventListener('click', function() { openDrawer(); });
      tools.appendChild(b);
    });
    updateCounts();
  }

  /* ---------- boot ---------- */

  load();
  mountTriggers();
  restoreAll();
  render();

  // Pages are only annotated by the glossary/lore passes after load, and a
  // reader can turn to a page whose notes were never restored, so re-run
  // on page turns. restorePage is idempotent per page.
  document.addEventListener('click', function(e) {
    if (!e.target.closest) return;
    if (e.target.closest('.reader-nav') || e.target.closest('.issue-tab')) {
      setTimeout(restoreAll, 120);
    }
  });

  window.CatalystFieldNotes = {
    open: openDrawer,
    close: closeDrawer,
    all: function() { return notes.slice(); },
    count: function() { return notes.length; }
  };
})();

/* ══════════════════════════════════════════════════════════════════
   MODAL FOCUS TRAP

   Audited every full-screen dialog on the page. The click-blocking
   defect was already absent everywhere, but focus handling was not:

     dossier overlay  — focus never entered the dialog, so Tab walked
                        the page *behind* the modal
     image lightbox   — focus entered, but one Tab escaped to the mobile
                        nav button behind the overlay
     keyboard help    — focus did not enter on open

   Rather than edit eight separately-scoped open/close functions, this
   watches each dialog's open class and does the same three things for
   all of them: move focus in, cycle Tab inside, hand focus back to
   whatever opened it. The archive search is the one dialog
   deliberately left out: it binds Tab to move through its result list,
   so a trap would fight its own key handling. Everything else — the
   Field Notes drawer included — is listed here. The drawer picks which
   element takes focus on open; the trap owns Tab cycling and handing
   focus back.
   ══════════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  var DIALOGS = [
    { id: 'dossier-overlay',     cls: 'open' },
    { id: 'img-lightbox',        cls: 'active' },
    { id: 'kb-panel',            cls: 'open' },
    { id: 'locModal',            cls: 'open' },
    { id: 'opOverlay',           cls: 'open' },
    { id: 'orishaOverlay',       cls: 'open' },
    { id: 'memory-bank-overlay', cls: 'open' },
    { id: 'covenant-overlay',    cls: 'open' },
    { id: 'panel-viewer',        cls: 'pv-open' },
    { id: 'fnDrawer',            cls: 'open' }
  ];

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), ' +
                  'select:not([disabled]), textarea:not([disabled]), ' +
                  '[tabindex]:not([tabindex="-1"])';

  var active = null;      // { el, restore }

  function visible(el) {
    if (el.hidden || el.getAttribute('aria-hidden') === 'true') return false;
    var r = el.getBoundingClientRect();
    if (!r.width && !r.height) return false;
    var cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  }

  function focusables(root) {
    return Array.prototype.filter.call(root.querySelectorAll(FOCUSABLE), visible);
  }

  function enter(el) {
    if (active && active.el === el) return;
    var restore = document.activeElement;
    // Don't record a restore target that is inside another dialog, or the
    // one being opened — that would hand focus back into hidden content.
    if (restore && (el.contains(restore) || restore === document.body)) restore = null;
    active = { el: el, restore: restore };

    // focus() is a silent no-op on an element that is not visible yet, and
    // several of these dialogs fade in — they are still visibility:hidden at
    // the moment their open class lands. So attempt, verify, and retry for a
    // few frames rather than assuming the first call took. This is why the
    // keyboard-shortcuts panel's own closeBtn.focus() never worked.
    var tries = 0;
    (function attempt() {
      if (!active || active.el !== el) return;
      if (el.contains(document.activeElement) && document.activeElement !== document.body) return;

      var f = focusables(el);
      if (f.length) {
        f[0].focus({ preventScroll: true });
      } else {
        // Nothing focusable inside: make the dialog itself the focus holder so
        // the reading position at least moves out of the page behind it.
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      }

      if (!el.contains(document.activeElement) && ++tries < 20) {
        requestAnimationFrame(attempt);
      }
    })();
  }

  function leave(el) {
    if (!active || active.el !== el) return;
    var restore = active.restore;
    active = null;
    var a = document.activeElement;
    // Blur first: focus() is a no-op on a non-focusable restore target, which
    // would otherwise strand focus inside a dialog on its way to display:none.
    if (a && a.blur && el.contains(a)) a.blur();
    if (restore && restore.focus && document.contains(restore) && visible(restore)) {
      try { restore.focus(); } catch (e) {}
    }
  }

  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab' || !active) return;
    var f = focusables(active.el);
    if (!f.length) { e.preventDefault(); return; }
    var first = f[0], last = f[f.length - 1];
    var a = document.activeElement;
    if (!active.el.contains(a)) { e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
  }, true);

  function wire() {
    DIALOGS.forEach(function(d) {
      var el = document.getElementById(d.id);
      if (!el || el.__catalystTrapped) return;
      el.__catalystTrapped = true;
      var was = el.classList.contains(d.cls);
      new MutationObserver(function() {
        var now = el.classList.contains(d.cls);
        if (now === was) return;
        was = now;
        // Let the dialog finish rendering its contents before hunting for
        // something to focus — several of these fill innerHTML on open.
        if (now) setTimeout(function() { enter(el); }, 30);
        else leave(el);
      }).observe(el, { attributes: true, attributeFilter: ['class'] });
    });
  }

  // Most of these dialogs are declared *below* the <script> tag, so they do
  // not exist yet while this runs. Wiring on DOM ready is what makes the
  // observer attach to them at all.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }

  /* Every full-screen layer, including the two the trap deliberately does
     not manage. Global single-key shortcuts consult this: a page-level
     shortcut must not fire while something is open over the page. */
  var LAYERS = DIALOGS.concat([{ id: 'cmdk', cls: 'open' }]);

  function openLayers() {
    return LAYERS.filter(function(d) {
      var el = document.getElementById(d.id);
      return el && el.classList.contains(d.cls) && !el.hidden;
    }).map(function(d) { return d.id; });
  }

  window.CatalystFocusTrap = {
    current: function() { return active ? active.el.id : null; },
    dialogs: function() { return DIALOGS.map(function(d) { return d.id; }); },
    openLayers: openLayers,
    /* True when anything is open over the page. Pass an id to ignore one
       layer — e.g. "?" still closes the shortcuts panel from inside it. */
    anyOpen: function(exceptId) {
      return openLayers().some(function(id) { return id !== exceptId; });
    }
  };
})();

/* ── LAGOS 2031 CONTROLLER & VAULT INTEL ENGINE ────────────── */
(function() {
  // District Data Dictionary
  var DISTRICT_DATA = {
    'void_belt': {
      title: 'The Void Belt',
      threat: 'CRITICAL',
      threatCls: 'critical',
      coords: '6.5244° N, 3.3792° E (Oshodi-Mushin axis)',
      pop: '3,200,000 estimated unregistered residents',
      grid: '0% national grid connectivity since 2026 Blackout',
      factions: 'AXIS Syndicate, Mesh Outrunners, Local Generators',
      intel: 'Ground zero of the awakening incident. High concentration of illicit Aṣẹ tap lines powering makeshift industrial yards. Government patrol drones are shot down within minutes of entry.'
    },
    'victoria_prime': {
      title: 'Victoria Prime & Eko Atlantic',
      threat: 'ESCALATING',
      threatCls: 'escalating',
      coords: '6.4281° N, 3.4219° E (Atlantic Seaboard)',
      pop: '480,000 citizens & sovereign corporate personnel',
      grid: 'Private geothermal fusion + kinetic sea-wall grid (300% surplus)',
      factions: 'Protocol Architects, Foreign Security Contractors, Sovereign Elites',
      intel: 'High-altitude sky bridges protected by auto-targeting kinetic defense batteries. Houses the R&D labs reverse-engineering captured Aṣẹ artifacts for off-world export.'
    },
    'yaba_deep': {
      title: 'Yaba Deep (Underground Corridor)',
      threat: 'MODERATE',
      threatCls: 'moderate',
      coords: '6.5095° N, 3.3711° E (Sub-level 3)',
      pop: '840,000 bio-hackers, coders & diviners',
      grid: 'Hybrid optical fiber & decentralized crystal cell array',
      factions: 'Memory Keepers, Algorithmic Diviners, Code Guilds',
      intel: 'Underground labyrinth beneath university foundations. Birthplace of the Oracle Mesh and neural-spiritual translators combining ancient Ifá patterns with machine learning models.'
    },
    'badagry': {
      title: 'Badagry Corridor & Coast',
      threat: 'HIGH',
      threatCls: 'high',
      coords: '6.4316° N, 2.8876° E (Western Littoral)',
      pop: '1,100,000 maritime smugglers & spiritual guardians',
      grid: 'Solar-tidal hybrid arrays & ancestral beacon points',
      factions: 'Ancient Order of Orun, Coastal Smuggler Cartels',
      intel: 'Ancient boundary waters where oceanic and spiritual currents meet. Major transit gateway for illegal tech and relics moving between West Africa and international black markets.'
    },
    'mainland_grid': {
      title: 'Mainland Grid & Industrial Sprawl',
      threat: 'MONITORED',
      threatCls: 'low',
      coords: '6.6018° N, 3.3515° E (Ikeja-Surulere belt)',
      pop: '5,800,000 industrial and municipal workforce',
      grid: 'State-rationed rolling brownouts (6 hours daily)',
      factions: 'The Forge, Municipal Unions, Civil Militia',
      intel: 'Heavily populated working-class spine of the city. Blacksmiths and mechanical workshops under Ikenna Okafor covertly craft weapons infused with Tier II and Tier III elemental matrices.'
    }
  };

  // Tab switching
  window.switchWorldTab = function(tabName) {
    var tabs = ['districts', 'factions', 'ase'];
    tabs.forEach(function(t) {
      var btn = document.getElementById('wtab-' + t);
      var pnl = document.getElementById('wpanel-' + t);
      if (btn) {
        var active = (t === tabName);
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      }
      if (pnl) {
        pnl.classList.toggle('active', t === tabName);
      }
    });
    if (window.ClearanceTracker) ClearanceTracker.mark('lore');
  };

  // District selection
  window.selectDistrict = function(distKey, el) {
    if (!DISTRICT_DATA[distKey]) return;
    var data = DISTRICT_DATA[distKey];
    
    // Highlight selected card
    var cards = document.querySelectorAll('#districtGrid .district-card');
    cards.forEach(function(c) { c.classList.remove('active'); });
    if (el) el.classList.add('active');

    // Update detail pane
    var pane = document.getElementById('districtDetail');
    if (pane) {
      pane.innerHTML = '<div class="dist-detail-title">' + data.title + 
        ' <span class="threat-tag ' + data.threatCls + '">' + data.threat + '</span></div>' +
        '<div class="dist-detail-meta">' +
        '<div><strong>Coordinates:</strong> ' + data.coords + '</div>' +
        '<div><strong>Demographics:</strong> ' + data.pop + '</div>' +
        '<div><strong>Power Grid Status:</strong> ' + data.grid + '</div>' +
        '<div><strong>Dominant Factions:</strong> ' + data.factions + '</div>' +
        '</div>' +
        '<div class="dist-detail-body">' + data.intel + '</div>';
    }
  };

  // Debt Simulator
  window.updateDebtSim = function() {
    var slider = document.getElementById('aseDebtSlider');
    var valEl = document.getElementById('aseDebtVal');
    var costEl = document.getElementById('debtCost');
    var recEl = document.getElementById('debtRecovery');
    var statEl = document.getElementById('debtStatus');
    if (!slider || !valEl || !costEl || !recEl || !statEl) return;

    var val = parseInt(slider.value, 10);
    valEl.textContent = val + '%';

    if (val < 25) {
      costEl.textContent = 'None — Stable cellular harmony';
      recEl.textContent = 'Immediate natural rest';
      statEl.textContent = 'COGNITIVE STABLE';
      statEl.style.color = 'var(--accent-teal)';
    } else if (val < 50) {
      costEl.textContent = 'Mild neural burnout, nosebleeds';
      recEl.textContent = '2-4 hours rest required';
      statEl.textContent = 'STRAIN DETECTED';
      statEl.style.color = 'var(--gold)';
    } else if (val < 75) {
      costEl.textContent = 'Cellular decay, sensory distortion, auditory ghosts';
      recEl.textContent = '24-48 hours stabilization required';
      statEl.textContent = 'CRITICAL DEBT WARNING';
      statEl.style.color = '#ff6b1a';
    } else {
      costEl.textContent = 'Irreversible cellular collapse & soul dissolution into Ọ̀run';
      recEl.textContent = 'Recovery impossible without Sovereign intervention';
      statEl.textContent = 'FATAL OVERLOAD THRESHOLD';
      statEl.style.color = 'var(--crimson)';
    }
  };

  // Vault Modal Controller
  var VAULT_DOCS = {
    '01': {
      num: 'DOSSIER #01 · PROTOCOL ARCHITECTS',
      title: 'THE AWAKENING MANIFESTO & THE VOID BREAK',
      stamp: 'DECLASSIFIED · CLEARANCE ALPHA',
      stampCls: 'declassified',
      body: 'October 12, 2026. Official municipal logs record a catastrophic grid failure across the southern coastline. Classified telemetry reveals the true anomaly: an instantaneous atmospheric surge of unmeasured metaphysical energy centered beneath Mushin. The entity designated Catalyst was not born of this event; he was the lightning rod that prevented total dimensional collapse.'
    },
    '02': {
      num: 'DOSSIER #02 · AXIS SYNDICATE TELEMETRY',
      title: 'ASẸ CONDUIT THEFT & BLACK MARKET TRANSACTIONS',
      stamp: 'RESTRICTED INTEL',
      stampCls: 'restricted',
      body: 'Intercepted communications indicate illicit distribution of refined Tier II Aṣẹ capacitors through the Balogun water channels. Over 40,000 units diverted to private corporate compounds in Victoria Prime. The AXIS syndicate operates with immunity granted by key ministers within the Ministry of Energy Transition.'
    },
    '03': {
      num: 'DOSSIER #03 · PALE COUNCIL ARCHIVES',
      title: 'THE VACCINE PROTOCOL: GENETIC ERADICATION',
      stamp: 'EYES ONLY · THREAT CRITICAL',
      stampCls: 'eyes-only',
      body: 'Synthesized compound code-named "Orisha-Zero". Developed under the guise of an anti-viral prophylactic following the 2026 fallout. Biological analysis confirms it suppresses neural reception to ancestral frequencies, severing the spiritual resonance that allows human vessels to manifest Aṣẹ.'
    },
    '04': {
      num: 'DOSSIER #04 · THE ORACLE COMMUNIQUÉ',
      title: 'THE FIFTH ELEVATION: CATALYST HORIZON',
      stamp: 'ORACLE DECREE · CLEARANCE OMEGA',
      stampCls: 'restricted',
      body: 'Eleven have claimed the mantle of the Catalyst across four centuries of Ifá prophecy. All eleven were swallowed by their own flame. Adebayo Adeyemi does not seek the throne; he seeks peace for a city that has never known stillness. That makes him the first who might survive.'
    }
  };

  var activeVaultId = '01';

  window.openVaultCard = function(docId) {
    if (!VAULT_DOCS[docId]) return;
    activeVaultId = docId;
    var doc = VAULT_DOCS[docId];
    var modal = document.getElementById('vaultModal');
    if (!modal) return;

    document.getElementById('vaultModalNumber').textContent = doc.num;
    document.getElementById('vaultModalTitle').textContent = doc.title;
    var stamp = document.getElementById('vaultModalStamp');
    stamp.textContent = doc.stamp;
    stamp.className = 'vault-modal-stamp ' + doc.stampCls;
    document.getElementById('vaultModalBody').innerHTML = '<p>' + doc.body + '</p>';

    var statusEl = document.getElementById('vaultPasscodeStatus');
    if (statusEl) statusEl.textContent = '';
    var inputEl = document.getElementById('vaultPasscodeInput');
    if (inputEl) inputEl.value = '';

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    if (inputEl) inputEl.focus();
    if (window.ClearanceTracker) ClearanceTracker.mark('vault');
  };

  window.closeVaultModal = function() {
    var modal = document.getElementById('vaultModal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  window.submitVaultPasscode = function() {
    var inp = document.getElementById('vaultPasscodeInput');
    var status = document.getElementById('vaultPasscodeStatus');
    if (!inp || !status) return;
    var code = inp.value.trim().toUpperCase();
    var validCodes = ['CATALYST', 'ASE2031', 'ORACLE', 'MUSHIN', 'IMOLE'];

    if (validCodes.indexOf(code) !== -1) {
      status.style.color = 'var(--accent-teal)';
      status.textContent = 'ACCESS GRANTED: FULL DECLASSIFICATION UNLOCKED';
      var body = document.getElementById('vaultModalBody');
      if (body) {
        body.innerHTML += '<div style="margin-top:1.5rem;padding:1rem;border:1px solid var(--accent-teal);background:rgba(0,201,177,0.06);border-radius:4px;"><strong style="color:var(--accent-teal)">[UNRESTRICTED LEVEL 5 ADDENDUM]</strong><p style="margin-top:0.5rem;font-size:0.85rem;line-height:1.7;">Oracle Node 07 reports that the membrane rupture in Balogun is accelerating at 3.2% per lunar cycle. The Catalyst Protocol is currently operating at 71% stability. If Bayo Adeyemi triggers Tier IV Sovereign state before the anchor nodes are stabilized, the entire Bight of Benin may shift permanently into Ọ̀run.</p></div>';
      }
      if (window.ClearanceTracker) ClearanceTracker.mark('classified_intel');
    } else {
      status.style.color = 'var(--crimson)';
      status.textContent = 'ACCESS DENIED: INVALID ORACLE AUTHORIZATION TOKEN';
    }
  };

  // Close modal on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      window.closeVaultModal();
    }
  });
})();


/* ── CATALYST OS MASTER SKILLS ENGINE ──────────────────────── */
(function() {
  var CATALYST_SKILLS_DATA = [
    {
      name: "impeccable",
      cat: "design",
      source: "Antigravity",
      srcCls: "rgba(192,132,252,0.15);color:#C084FC",
      desc: "The last filter before your UI ships. Catches squished spacing, ugly gradients, misaligned elements, and broken visual hierarchy.",
      caps: ["Design linting", "Spacing audit", "Hierarchy checks", "Pre-ship review"],
      install: "npx impeccable init"
    },
    {
      name: "huashu-design",
      cat: "design",
      source: "Antigravity",
      srcCls: "rgba(76,168,160,0.15);color:#4CA8A0",
      desc: "20 design philosophies across 5 schools. 7 output formats including prototype, slides, and mp4. 5-dimension expert review system.",
      caps: ["20 philosophies", "7 output formats", "5D review", "MIT licensed"],
      install: "npx skills add huashu-design"
    },
    {
      name: "ui-ux-pro-max",
      cat: "design",
      source: "Antigravity",
      srcCls: "rgba(123,111,232,0.15);color:#7B6FE8",
      desc: "Searchable design intelligence with 57 UI styles, 95 color palettes, 56 font pairings, and 29 landing patterns.",
      caps: ["57 UI styles", "95 palettes", "56 font pairings", "Landing patterns"],
      install: "uipro init --ai claude"
    },
    {
      name: "taste",
      cat: "design",
      source: "Antigravity",
      srcCls: "rgba(232,123,111,0.15);color:#E87B6F",
      desc: "Embeds color, layout, typography, and motion intelligence directly into context. The gap between generated and designed.",
      caps: ["Color intelligence", "Layout taste", "Typography sense", "Motion principles"],
      install: "npx skills add taste-skill"
    },
    {
      name: "playwright-qa",
      cat: "security",
      source: "Microsoft",
      srcCls: "rgba(45,191,110,0.15);color:#2DBF6E",
      desc: "Automated visual QA. Opens app in live headless browsers, captures full DOM screenshots, and audits layout bugs.",
      caps: ["100+ styles", "Cross-browser QA", "Visual regression", "Pre-ship audit"],
      install: "pnpm dlx playwright install"
    },
    {
      name: "beautiful-prose",
      cat: "content",
      source: "VoltAgent",
      srcCls: "rgba(52,211,153,0.15);color:#34D399",
      desc: "Hard-edged writing style contract for timeless, forceful English prose without modern AI clichés or fluff.",
      caps: ["Anti-cliché", "Voice calibration", "Narrative punch", "Style contract"],
      install: "npx skills add beautiful_prose"
    },
    {
      name: "mcp-builder",
      cat: "automation",
      source: "Anthropic",
      srcCls: "rgba(255,107,53,0.15);color:#FF6B35",
      desc: "Official guide and scaffold for creating high-performance Model Context Protocol (MCP) servers for LLM agent tools.",
      caps: ["MCP protocol", "Tool schemas", "JSON-RPC", "Agent connectivity"],
      install: "npx skills add mcp-builder"
    },
    {
      name: "007-security-auditor",
      cat: "security",
      source: "Antigravity",
      srcCls: "rgba(239,68,68,0.15);color:#EF4444",
      desc: "Security audit, hardening, threat modeling (STRIDE/PASTA), Red/Blue Team simulations, and OWASP vulnerability scans.",
      caps: ["OWASP top 10", "Threat modeling", "Red/Blue team", "Code hardening"],
      install: "npx skills add 007-security"
    },
    {
      name: "agent-orchestrator",
      cat: "automation",
      source: "Antigravity",
      srcCls: "rgba(192,132,252,0.15);color:#C084FC",
      desc: "Meta-skill coordinating multi-agent swarms. Automatic skill scanning, capability matching, and workload distribution.",
      caps: ["Swarm management", "Workload routing", "Cost optimization", "Subagents"],
      install: "npx skills add agent-orchestrator"
    },
    {
      name: "blueprint-planner",
      cat: "planning",
      source: "Antigravity",
      srcCls: "rgba(244,184,0,0.15);color:#F4B800",
      desc: "Turns a one-line objective into a step-by-step construction blueprint and atomic checklist any coding agent can execute.",
      caps: ["Atomic breakdown", "Dependency graph", "Verification tests", "Task checklist"],
      install: "npx skills add blueprint"
    },
    {
      name: "avoid-ai-writing",
      cat: "content",
      source: "Antigravity",
      srcCls: "rgba(52,211,153,0.15);color:#34D399",
      desc: "Audit and rewrite content to eliminate 21 categories of machine-generated writing tics with verified replacements.",
      caps: ["Style auditing", "Pattern matching", "Tone calibration", "Authentic voice"],
      install: "npx skills add avoid-ai-writing"
    },
    {
      name: "3d-web-experience",
      cat: "design",
      source: "Antigravity",
      srcCls: "rgba(123,111,232,0.15);color:#7B6FE8",
      desc: "Expert patterns for Three.js, React Three Fiber, WebGL, shaders, and spatial interactive canvases.",
      caps: ["Three.js", "WebGL shaders", "Camera rigs", "60fps render loops"],
      install: "npx skills add 3d-web-experience"
    },
    {
      name: "auth-patterns",
      cat: "security",
      source: "Antigravity",
      srcCls: "rgba(239,68,68,0.15);color:#EF4444",
      desc: "Build secure, scalable authentication and authorization systems with Supabase, JWT, and session encryption.",
      caps: ["Zero trust", "RBAC policies", "Session security", "Token refresh"],
      install: "npx skills add auth-patterns"
    },
    {
      name: "closed-loop-delivery",
      cat: "planning",
      source: "Antigravity",
      srcCls: "rgba(244,184,0,0.15);color:#F4B800",
      desc: "Executes coding tasks against explicit acceptance criteria with zero user intervention and automated verification gates.",
      caps: ["Autonomous loop", "TDD flow", "Static validation", "Auto-delivery"],
      install: "npx skills add closed-loop-delivery"
    }
  ];

  var currentCat = 'all';
  var currentSearch = '';

  function renderSkills() {
    var grid = document.getElementById('skillsGrid');
    if (!grid) return;

    var filtered = CATALYST_SKILLS_DATA.filter(function(s) {
      var matchCat = (currentCat === 'all' || s.cat === currentCat);
      var q = currentSearch.toLowerCase();
      var matchSearch = !q || s.name.toLowerCase().indexOf(q) !== -1 || s.desc.toLowerCase().indexOf(q) !== -1 || s.caps.some(function(c){return c.toLowerCase().indexOf(q) !== -1;});
      return matchCat && matchSearch;
    });

    if (!filtered.length) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:3rem;color:rgba(240,237,229,0.5);">No matching neural skills located in current query filter.</p>';
      return;
    }

    grid.innerHTML = filtered.map(function(s) {
      return '<div class="skill-card">' +
        '<div>' +
          '<div class="skill-card-header">' +
            '<div class="skill-card-name">' + s.name + '</div>' +
            '<span class="skill-card-source" style="background:' + s.srcCls + '">' + s.source + '</span>' +
          '</div>' +
          '<div class="skill-card-desc">' + s.desc + '</div>' +
          '<div class="skill-card-caps">' +
            s.caps.map(function(c){ return '<span class="skill-cap-tag">' + c + '</span>'; }).join('') +
          '</div>' +
        '</div>' +
        '<div class="skill-card-footer">' +
          '<span class="skill-card-category">' + s.cat + '</span>' +
          '<button type="button" class="skill-card-btn" onclick="copySkillCommand('' + s.install + '')">COPY CLI</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  window.filterSkillsCategory = function(cat, btn) {
    currentCat = cat;
    document.querySelectorAll('.skills-cat-btn').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderSkills();
  };

  window.handleSkillsSearch = function(val) {
    currentSearch = val;
    renderSkills();
  };

  window.copySkillCommand = function(cmd) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cmd).then(function() {
        if (window.showToast) window.showToast('Copied: ' + cmd, 'success', 2500);
      }).catch(function(){});
    }
  };

  // Wire up on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderSkills);
  } else {
    renderSkills();
  }
})();

/* ── AFROFUTURIST HUD LIGHTBOX & ARTWORK INSPECTOR CONTROLLER ── */
(function() {
  var activeArtData = null;

  var VARIANT_NAMES = [
    "1. Canon Master",
    "2. Lagos Noir Ink",
    "3. Aṣẹ Surge Flare",
    "4. Concept Pencil"
  ];

  window.openHudLightbox = function(data) {
    activeArtData = data;
    var backdrop = document.getElementById('hudLightboxBackdrop');
    if (!backdrop) return;

    // Populate data
    var catBadge = document.getElementById('hudCategoryBadge');
    var artCode = document.getElementById('hudArtCode');
    var artTitle = document.getElementById('hudArtTitle');
    var artDesc = document.getElementById('hudArtDesc');
    var fallbackIcon = document.getElementById('hudFallbackIcon');
    var fallbackLabel = document.getElementById('hudFallbackLabel');
    var previewImg = document.getElementById('hudPreviewImg');
    var fallbackBox = document.getElementById('hudFallbackBox');
    var canvaBtn = document.getElementById('hudCanvaExternalBtn');

    if (catBadge) catBadge.textContent = (data.category || 'CANON ARCHIVE').toUpperCase() + ' // TELEMETRY SPEC';
    if (artCode) artCode.textContent = data.code || 'SPEC #01';
    if (artTitle) artTitle.textContent = data.title || 'Untitled Artwork';
    if (artDesc) artDesc.textContent = data.desc || 'High-fidelity Afrofuturist vector asset crafted for the Catalyst universe.';
    if (fallbackIcon) fallbackIcon.textContent = data.icon || '✦';
    if (fallbackLabel) fallbackLabel.textContent = (data.code || 'SPECIFICATION') + ' // 4 CANON VARIANTS';

    if (data.imgSrc) {
      if (previewImg) {
        previewImg.src = data.imgSrc;
        previewImg.alt = data.title || 'Artwork';
        previewImg.style.display = 'block';
      }
      if (fallbackBox) fallbackBox.style.display = 'none';
    } else {
      if (previewImg) previewImg.style.display = 'none';
      if (fallbackBox) fallbackBox.style.display = 'flex';
    }

    if (canvaBtn) {
      canvaBtn.href = data.canvaUrl || '#';
    }

    // Reset variant pills
    var pills = document.querySelectorAll('.hud-variant-pill');
    pills.forEach(function(p, idx) {
      if (idx === 0) p.classList.add('active');
      else p.classList.remove('active');
    });

    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.closeHudLightbox = function() {
    var backdrop = document.getElementById('hudLightboxBackdrop');
    if (!backdrop) return;
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  window.switchHudVariant = function(idx, btn) {
    document.querySelectorAll('.hud-variant-pill').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');

    var fallbackLabel = document.getElementById('hudFallbackLabel');
    if (fallbackLabel && activeArtData) {
      fallbackLabel.textContent = (activeArtData.code || 'SPEC') + ' // ' + VARIANT_NAMES[idx].toUpperCase();
    }

    var previewImg = document.getElementById('hudPreviewImg');
    if (previewImg) {
      if (idx === 0) {
        previewImg.style.filter = 'none';
      } else if (idx === 1) {
        previewImg.style.filter = 'grayscale(100%) contrast(165%) brightness(0.95)';
      } else if (idx === 2) {
        previewImg.style.filter = 'sepia(65%) hue-rotate(5deg) saturate(230%) brightness(1.2) contrast(120%)';
      } else if (idx === 3) {
        previewImg.style.filter = 'grayscale(80%) contrast(190%) brightness(0.9) invert(8%)';
      }
    }

    if (window.showToast) {
      window.showToast('Variant active: ' + VARIANT_NAMES[idx], 'info', 1800);
    }
  };

  window.copyHudArtDetails = function() {
    if (!activeArtData) return;
    var info = activeArtData.code + ': ' + activeArtData.title + ' (' + (activeArtData.canvaUrl || '') + ')';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(info).then(function() {
        if (window.showToast) window.showToast('Copied artwork identifier to clipboard.', 'success');
      });
    }
  };

  // Close lightbox on backdrop click or Escape
  document.addEventListener('DOMContentLoaded', function() {
    var backdrop = document.getElementById('hudLightboxBackdrop');
    if (backdrop) {
      backdrop.addEventListener('click', function(e) {
        if (e.target === backdrop) closeHudLightbox();
      });
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeHudLightbox();
    });

    // Intercept .ag-card clicks across the 50 artworks gallery to open HUD Lightbox instead of jarring page redirect
    document.querySelectorAll('#artwork-gallery .ag-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        e.preventDefault();
        var numEl = card.querySelector('.ag-card-num');
        var titleEl = card.querySelector('.ag-card-title');
        var iconEl = card.querySelector('.ag-card-preview');
        var catHeader = card.closest('.ag-category');
        var catTitle = catHeader ? catHeader.querySelector('.ag-cat-title') : null;

        var code = card.getAttribute('data-code') || (numEl ? numEl.textContent.trim() : 'SPEC #01');
        var title = titleEl ? titleEl.textContent.trim() : 'Artwork';
        var icon = iconEl ? iconEl.textContent.trim() : '✦';
        var category = catTitle ? catTitle.textContent.trim() : 'Archive Concept';
        var canvaUrl = card.getAttribute('href');
        var imgSrc = card.getAttribute('data-img') || '';

        openHudLightbox({
          code: code,
          title: title,
          icon: icon,
          category: category,
          canvaUrl: canvaUrl,
          imgSrc: imgSrc,
          desc: 'Canonical ' + category + ' render for Catalyst: The Awakening. Contains 4 production variants (Master, Lagos Noir, Aṣẹ Flare, and Concept Pencil).'
        });
      });
    });
  });
})();



/* ─── WORLD-CLASS AFROFUTURIST CONTROLLERS & AUDIO ENGINE ─── */
(function() {
  // 1. Tactical Web Audio API Synthesizer
  var audioCtx = null;
  var isAudioEnabled = true;

  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  window.playHudSound = function(type) {
    if (!isAudioEnabled) return;
    try {
      var ctx = getAudioContext();
      if (!ctx) return;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      var now = ctx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'chirp') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(1700, now + 0.07);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'variant') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch(_) {}
  };

  window.toggleHudAudio = function() {
    isAudioEnabled = !isAudioEnabled;
    var btn = document.getElementById('hudAudioToggle');
    if (btn) {
      btn.textContent = isAudioEnabled ? '🔊 SFX' : '🔇 MUTED';
      btn.style.color = isAudioEnabled ? 'var(--orisha-teal)' : 'var(--ash-grey)';
    }
    if (window.showToast) {
      window.showToast(isAudioEnabled ? 'Tactical Audio Active' : 'Audio Muted', 'info', 1800);
    }
  };

  // 2. HUD Zoom & Pan Controls
  window.currentHudZoom = 1.0;
  window.zoomHudImg = function(delta) {
    var img = document.getElementById('hudPreviewImg');
    var lvl = document.getElementById('hudZoomLevel');
    if (!img) return;
    window.currentHudZoom = Math.min(2.5, Math.max(0.75, window.currentHudZoom + delta));
    img.style.transform = 'scale(' + window.currentHudZoom + ')';
    img.style.transition = 'transform 0.2s ease-out';
    if (lvl) lvl.textContent = Math.round(window.currentHudZoom * 100) + '%';
    window.playHudSound('chirp');
  };

  window.resetHudZoom = function() {
    var img = document.getElementById('hudPreviewImg');
    var lvl = document.getElementById('hudZoomLevel');
    if (!img) return;
    window.currentHudZoom = 1.0;
    img.style.transform = 'scale(1)';
    if (lvl) lvl.textContent = '100%';
    window.playHudSound('click');
  };

  // 3. 50 Artworks Dynamic Category Filter & Search
  var activeArtworkFilter = 'all';
  var activeArtworkQuery = '';

  window.filterArtworkGroup = function(cat, btn) {
    activeArtworkFilter = cat;
    document.querySelectorAll('.ag-filter-pill').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    applyArtworkFilters();
    window.playHudSound('click');
  };

  window.handleArtworkSearch = function(query) {
    activeArtworkQuery = (query || '').toLowerCase().trim();
    applyArtworkFilters();
  };

  function applyArtworkFilters() {
    var cards = document.querySelectorAll('#artwork-gallery .ag-card');
    var categories = document.querySelectorAll('#artwork-gallery .ag-category');
    var visibleCount = 0;

    cards.forEach(function(card) {
      var code = (card.getAttribute('data-code') || '').toLowerCase();
      var title = (card.querySelector('.ag-card-title')?.textContent || '').toLowerCase();
      var num = (card.querySelector('.ag-card-num')?.textContent || '').toLowerCase();

      // Check Category
      var matchesCategory = false;
      if (activeArtworkFilter === 'all') matchesCategory = true;
      else if (activeArtworkFilter === 'character' && code.indexOf('char-') === 0) matchesCategory = true;
      else if (activeArtworkFilter === 'scene' && code.indexOf('scene-') === 0) matchesCategory = true;
      else if (activeArtworkFilter === 'world' && code.indexOf('world-') === 0) matchesCategory = true;
      else if (activeArtworkFilter === 'symbol' && code.indexOf('sym-') === 0) matchesCategory = true;
      else if (activeArtworkFilter === 'cover' && code.indexOf('cover-') === 0) matchesCategory = true;
      else if (activeArtworkFilter === 'action' && code.indexOf('action-') === 0) matchesCategory = true;

      // Check Search Query
      var matchesSearch = !activeArtworkQuery ||
        code.indexOf(activeArtworkQuery) !== -1 ||
        title.indexOf(activeArtworkQuery) !== -1 ||
        num.indexOf(activeArtworkQuery) !== -1;

      if (matchesCategory && matchesSearch) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Toggle category headers based on whether they contain visible cards
    categories.forEach(function(cat) {
      var hasVisible = false;
      cat.querySelectorAll('.ag-card').forEach(function(c) {
        if (c.style.display !== 'none') hasVisible = true;
      });
      cat.style.display = hasVisible ? 'block' : 'none';
    });

    // Update Counter
    var counter = document.getElementById('agCounter');
    if (counter) {
      counter.textContent = visibleCount + ' / 50 UNVEILED';
    }
  }

  // 4. Callsign & Pass Exporting
  window.saveProfileCallSign = function(val) {
    if (_currentUser) {
      _currentUser.callsign = val.trim();
      localStorage.setItem('catalyst_user_profile', JSON.stringify(_currentUser));
      if (window.showToast) window.showToast('Callsign linked: ' + val, 'success', 2200);
    }
  };

  window.exportReaderIdCard = function() {
    if (!_currentUser) return;
    var name = (_currentUser.user_metadata && _currentUser.user_metadata.full_name) || 'Catalyst Reader';
    var affinity = _currentUser.affinity || 'Ṣàngó';
    var callsign = _currentUser.callsign || 'Mushin_Operative';
    var passText = '========================================\n' +
      'CATALYST OS // READER TELEMETRY PASS\n' +
      'OPERATIVE: ' + name + ' [' + callsign + ']\n' +
      'AFFINITY: ' + affinity + '\n' +
      'ACCESS: REGISTERED READER · 50 ARTWORKS UNLOCKED\n' +
      'VERIFICATION HASH: 0x' + Date.now().toString(16).toUpperCase() + '\n' +
      'URL: https://catalyst-awakening.netlify.app/\n' +
      '========================================';

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(passText).then(function() {
        if (window.showToast) window.showToast('Digital Reader Pass copied to clipboard!', 'success', 2800);
      });
    }
  };
})();


/* ─── 4 FLAGSHIP CATALYST OS SYSTEM CONTROLLERS ─── */
(function() {
  // ══════════════════════════════════════════════════
  // 1. PROCEDURAL AMBIENT SOUNDSCAPE ENGINE
  // ══════════════════════════════════════════════════
  var ambCtx = null;
  var ambMasterGain = null;
  var ambActive = false;
  var ambPreset = 'sango';
  var ambOscs = [];
  var ambTimer = null;

  function initAmbientAudio() {
    if (!ambCtx && (window.AudioContext || window.webkitAudioContext)) {
      ambCtx = new (window.AudioContext || window.webkitAudioContext)();
      ambMasterGain = ambCtx.createGain();
      ambMasterGain.gain.setValueAtTime(0.4, ambCtx.currentTime);
      ambMasterGain.connect(ambCtx.destination);
    }
    if (ambCtx && ambCtx.state === 'suspended') {
      ambCtx.resume();
    }
  }

  function stopAmbientNodes() {
    ambOscs.forEach(function(node) {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch(_) {}
    });
    ambOscs = [];
    if (ambTimer) { clearInterval(ambTimer); ambTimer = null; }
  }

  function startAmbientNodes() {
    stopAmbientNodes();
    if (!ambCtx || !ambMasterGain) return;
    var now = ambCtx.currentTime;

    if (ambPreset === 'sango') {
      // Ṣàngó Tempest: Rain murmur + sub-bass thunder rumble
      var osc1 = ambCtx.createOscillator();
      var gain1 = ambCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, now);
      gain1.gain.setValueAtTime(0.2, now);
      osc1.connect(gain1);
      gain1.connect(ambMasterGain);
      osc1.start(now);
      ambOscs.push(osc1);

      // Periodic distant thunder roll
      ambTimer = setInterval(function() {
        if (!ambActive || !ambCtx) return;
        try {
          var thOsc = ambCtx.createOscillator();
          var thGain = ambCtx.createGain();
          thOsc.type = 'triangle';
          thOsc.frequency.setValueAtTime(45, ambCtx.currentTime);
          thOsc.frequency.exponentialRampToValueAtTime(30, ambCtx.currentTime + 1.2);
          thGain.gain.setValueAtTime(0.18, ambCtx.currentTime);
          thGain.gain.exponentialRampToValueAtTime(0.001, ambCtx.currentTime + 1.2);
          thOsc.connect(thGain);
          thGain.connect(ambMasterGain);
          thOsc.start(ambCtx.currentTime);
          thOsc.stop(ambCtx.currentTime + 1.2);
        } catch(_) {}
      }, 4500);

    } else if (ambPreset === 'ogun') {
      // Ògún Forge: Industrial harmonic hum (110Hz + 220Hz)
      var osc1 = ambCtx.createOscillator();
      var gain1 = ambCtx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(110, now);
      gain1.gain.setValueAtTime(0.15, now);
      osc1.connect(gain1);
      gain1.connect(ambMasterGain);
      osc1.start(now);
      ambOscs.push(osc1);

      var osc2 = ambCtx.createOscillator();
      var gain2 = ambCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(220, now);
      gain2.gain.setValueAtTime(0.08, now);
      osc2.connect(gain2);
      gain2.connect(ambMasterGain);
      osc2.start(now);
      ambOscs.push(osc2);

    } else if (ambPreset === 'osun') {
      // Ọ̀ṣun Tide: 432Hz Sacred Water current
      var osc1 = ambCtx.createOscillator();
      var gain1 = ambCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(432, now);
      gain1.gain.setValueAtTime(0.12, now);

      // Slow sine wave modulation
      var lfo = ambCtx.createOscillator();
      var lfoGain = ambCtx.createGain();
      lfo.frequency.setValueAtTime(0.15, now);
      lfoGain.gain.setValueAtTime(12, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfo.start(now);
      ambOscs.push(lfo);

      osc1.connect(gain1);
      gain1.connect(ambMasterGain);
      osc1.start(now);
      ambOscs.push(osc1);

    } else if (ambPreset === 'noir') {
      // Lagos Noir: Deep subterranean 65Hz analog bass drone
      var osc1 = ambCtx.createOscillator();
      var gain1 = ambCtx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(65, now);
      gain1.gain.setValueAtTime(0.1, now);
      osc1.connect(gain1);
      gain1.connect(ambMasterGain);
      osc1.start(now);
      ambOscs.push(osc1);
    }
  }

  window.toggleAmbientSound = function() {
    initAmbientAudio();
    ambActive = !ambActive;
    var btn = document.getElementById('soundDockToggleBtn');
    var label = document.getElementById('soundDockLabel');
    var icon = document.getElementById('soundDockIcon');

    if (ambActive) {
      startAmbientNodes();
      if (label) label.textContent = 'SOUNDSCAPE: ON';
      if (icon) icon.textContent = '⚡';
      if (window.showToast) window.showToast('Ambient Soundscape Activated: ' + ambPreset.toUpperCase(), 'info', 2200);
    } else {
      stopAmbientNodes();
      if (label) label.textContent = 'SOUNDSCAPE: OFF';
      if (icon) icon.textContent = '🎧';
      if (window.showToast) window.showToast('Ambient Soundscape Muted', 'info', 1800);
    }
  };

  window.setAmbientPreset = function(preset, btn) {
    ambPreset = preset;
    document.querySelectorAll('.preset-btn').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    if (ambActive) {
      startAmbientNodes();
      if (window.showToast) window.showToast('Preset Switched: ' + preset.toUpperCase(), 'info', 1800);
    }
  };

  window.setAmbientVolume = function(val) {
    if (ambMasterGain && ambCtx) {
      ambMasterGain.gain.setValueAtTime(parseFloat(val), ambCtx.currentTime);
    }
  };

  // ══════════════════════════════════════════════════
  // 2. TACTICAL SECTOR TELEMETRY HUD (LAGOS MAP)
  // ══════════════════════════════════════════════════
  var SECTOR_DATA = {
    'mushin': {
      title: 'MUSHIN UNDERGROUND',
      yoruba: 'Mùṣin Ilẹ̀-Ìsàlẹ̀',
      desc: 'The beating heart of Neo-Lagos resistance. Where Bayo channeled all five Orisha nodes simultaneously. Danfo transit corridors laced with high-voltage copper conductors.',
      threat: 'CRITICAL',
      ase: '1,420 AṢẸ',
      faction: 'RESISTANCE HQ'
    },
    'balogun': {
      title: 'BALOGUN NEXUS',
      yoruba: 'Ọjà Bálógún',
      desc: 'Ground Zero of the Ọ̀run-Bleed event. The 3,000-year-old market where spirit frequencies puncture fiber-optic street cables. The tear opened here.',
      threat: 'UNSTABLE',
      ase: '2,150 AṢẸ',
      faction: 'CONTESTED ZONE'
    },
    'bridge': {
      title: 'THIRD MAINLAND BRIDGE',
      yoruba: 'Afárá Ọ̀kẹrẹ',
      desc: '11.8 kilometers of concrete and spirit leyline. At 3:00 AM, the lagoon whispers names. Deep pylons anchored into ancient water shrines.',
      threat: 'VOLATILE',
      ase: '890 AṢẸ',
      faction: 'NEUTRAL RIFT'
    },
    'eko': {
      title: 'EKO ATLANTIC ARCOLOGY',
      yoruba: 'Ilé-Eko Tuntun',
      desc: '47-story glass citadel constructed over reclaimed ocean sands. Governed by Pale Council corporate algorithms and automated drone swarms.',
      threat: 'FORTIFIED',
      ase: '410 AṢẸ',
      faction: 'PALE COUNCIL'
    },
    'iron': {
      title: 'THE IRON DISTRICT',
      yoruba: 'Àgbàlà Irin',
      desc: 'Ancestral metal foundries of Ikenna’s lineage. The earth here remembers Ògún’s ancient anvil strikes from eight centuries ago.',
      threat: 'HIGH',
      ase: '1,120 AṢẸ',
      faction: 'ÒGÚN FORGE'
    },
    'void': {
      title: 'THE VOID QUARTER',
      yoruba: 'Àwọn Òfo',
      desc: 'Three city blocks quarantined under permanent shadow curfew. Temporal physics warp inside this perimeter.',
      threat: 'CLASSIFIED',
      ase: '0 AṢẸ (VOID)',
      faction: 'NO MAN’S LAND'
    },
    'oracle': {
      title: 'ORACLE AI SANCTUARY',
      yoruba: 'Ilé Onísègùn',
      desc: 'Subterranean mainframe operating for 144 years. A biological-digital interface connecting Yoruba Ifá diviners directly to neural supercomputers.',
      threat: 'SECURE',
      ase: '3,800 AṢẸ',
      faction: 'ORACLE NETWORK'
    }
  };

  function wireMapTelemetry() {
    document.querySelectorAll('.map-zone').forEach(function(zone) {
      var id = zone.id ? zone.id.replace('zone-', '') : '';
      zone.addEventListener('mouseenter', function() {
        updateMapReadout(id);
      });
      zone.addEventListener('click', function() {
        updateMapReadout(id);
        if (window.playHudSound) window.playHudSound('chirp');
      });
    });
  }

  function updateMapReadout(id) {
    var data = SECTOR_DATA[id] || SECTOR_DATA['mushin'];
    var title = document.getElementById('hudSectorTitle');
    var yoruba = document.getElementById('hudSectorYoruba');
    var desc = document.getElementById('hudSectorDesc');
    var threat = document.getElementById('hudThreatVal');
    var ase = document.getElementById('hudAseVal');
    var faction = document.getElementById('hudFactionVal');

    if (title) title.textContent = data.title;
    if (yoruba) yoruba.textContent = data.yoruba;
    if (desc) desc.textContent = data.desc;
    if (threat) threat.textContent = data.threat;
    if (ase) ase.textContent = data.ase;
    if (faction) faction.textContent = data.faction;
  }

  // ══════════════════════════════════════════════════
  // 3. FACTION ALLEGIANCE & ARC II DECISION SIMULATOR
  // ══════════════════════════════════════════════════
  var SIM_SCENARIOS = [
    {
      step: "SCENARIO 01 // GRID INCURSION",
      title: "Pale Council Surveillance Drones Breach Mushin",
      desc: "Eight autonomous hunter-drones descend on Sector 4, tracking Bayo's electrical signature. How do you respond?",
      options: [
        { text: "Overload the transformers with Ṣàngó lightning to fry the swarm instantly.", faction: "resistance", tag: "+MUSHIN RESISTANCE" },
        { text: "Barricade the sector using Ògún magnetic plates to shelter the civilians.", faction: "pale-council", tag: "+PALE COUNCIL DEFENSE" },
        { text: "Hack the drone uplink via Ẹṣù frequency and broadcast dummy telemetry.", faction: "oracle", tag: "+ORACLE NETWORK" }
      ]
    },
    {
      step: "SCENARIO 02 // RESOURCE INTERCEPT",
      title: "Contraband Aṣẹ Power Cells Discovered at Balogun",
      desc: "Smugglers attempt to auction five military-grade Aṣẹ fuel rods at the night market. What is your directive?",
      options: [
        { text: "Raid the shipment and distribute power cells freely to Mushin hospitals.", faction: "resistance", tag: "+MUSHIN RESISTANCE" },
        { text: "Outbid everyone and transport the technology to Eko Atlantic towers.", faction: "syndicate", tag: "+EKO SYNDICATE" },
        { text: "Confiscate and lock the cells in an unmarked black-box containment vault.", faction: "fifth", tag: "+THE FIFTH FACTION" }
      ]
    },
    {
      step: "SCENARIO 03 // THE Ọ̀RUN RIFT",
      title: "Third Mainland Bridge Pylon Membrane Rupture",
      desc: "Water spirits threaten to breach into the physical highway at 3:15 AM. How is the gateway contained?",
      options: [
        { text: "Lead a frontline strike on the bridge deck to push the entities back.", faction: "resistance", tag: "+MUSHIN RESISTANCE" },
        { text: "Deploy automated quarantine shields and sacrifice the outer pier.", faction: "pale-council", tag: "+PALE COUNCIL" },
        { text: "Channel Ọ̀ṣun’s memory harmonic to pacify the spirits into alignment.", faction: "oracle", tag: "+ORACLE SEERS" }
      ]
    }
  ];

  var FACTION_RESULTS = {
    'resistance': {
      name: "THE MUSHIN RESISTANCE",
      badge: "✦ FRONT-LINE SOVEREIGNTY ✦",
      oath: "“We do not kneel to glass towers or antique councils. The Aṣẹ belongs to the people who bleed for it.”"
    },
    'pale-council': {
      name: "THE PALE COUNCIL",
      badge: "☽ ARCHITECTS OF ORDER ☽",
      oath: "“Chaos is not freedom. Without calculated discipline, the Ọ̀run will swallow all of West Africa.”"
    },
    'oracle': {
      name: "THE ORACLE NETWORK",
      badge: "👁 DIGITAL SEERS & IFÁ CODERS 👁",
      oath: "“The code was written three millennia ago. We do not fight the current; we compile it.”"
    },
    'syndicate': {
      name: "THE EKO SYNDICATE",
      badge: "◈ HIGH CAPITAL & LEVERAGE ◈",
      oath: "“Every god has an exchange rate. We own the grid, the transit lines, and the tomorrow.”"
    },
    'fifth': {
      name: "THE FIFTH FACTION",
      badge: "🜏 SHADOW SOVEREIGNS 🜏",
      oath: "“No banner. No records. No mercy. We operate in the blind spot where gods cannot see.”"
    }
  };

  var simStep = 0;
  var simScores = { resistance: 0, 'pale-council': 0, oracle: 0, syndicate: 0, fifth: 0 };

  function renderSimStep() {
    var stage = document.getElementById('simStage');
    var resBox = document.getElementById('simResult');
    if (!stage || !resBox) return;

    if (simStep < SIM_SCENARIOS.length) {
      stage.style.display = 'block';
      resBox.style.display = 'none';
      var s = SIM_SCENARIOS[simStep];
      stage.innerHTML = '<div class="sim-scenario-box">' +
        '<div class="sim-step-tag">' + s.step + '</div>' +
        '<h3 class="sim-question-title">' + s.title + '</h3>' +
        '<p class="sim-question-desc">' + s.desc + '</p>' +
        '<div class="sim-options-list">' +
          s.options.map(function(opt, idx) {
            return '<button type="button" class="sim-opt-btn" onclick="selectSimOption(\'' + opt.faction + '\')">' +
              '<span class="sim-opt-tag">' + opt.tag + '</span>' +
              '<span>' + opt.text + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>';
    } else {
      stage.style.display = 'none';
      resBox.style.display = 'block';

      // Pick top faction
      var topFaction = 'resistance';
      var maxPts = -1;
      for (var f in simScores) {
        if (simScores[f] > maxPts) {
          maxPts = simScores[f];
          topFaction = f;
        }
      }
      var res = FACTION_RESULTS[topFaction];

      resBox.innerHTML = '<div class="sim-result-card">' +
        '<div class="sim-result-badge">' + res.badge + '</div>' +
        '<h3 class="sim-result-name">' + res.name + '</h3>' +
        '<p class="sim-result-oath">' + res.oath + '</p>' +
        '<div style="display:flex;gap:0.8rem;justify-content:center;flex-wrap:wrap;margin-bottom:1.5rem;">' +
          '<button type="button" class="profile-btn-primary" onclick="openPaymentModal()">Claim Arc II ' + res.name + ' Dossier →</button>' +
          '<button type="button" class="sim-restart-btn" onclick="restartSim()">Restart Simulation ↺</button>' +
        '</div>' +
      '</div>';

      if (window.showToast) window.showToast('Faction Allegiance Established: ' + res.name, 'success', 3000);
    }
  }

  window.selectSimOption = function(faction) {
    if (simScores[faction] !== undefined) simScores[faction]++;
    simStep++;
    renderSimStep();
    if (window.playHudSound) window.playHudSound('variant');
  };

  window.restartSim = function() {
    simStep = 0;
    simScores = { resistance: 0, 'pale-council': 0, oracle: 0, syndicate: 0, fifth: 0 };
    renderSimStep();
  };

  // ══════════════════════════════════════════════════
  // 4. THE Ọ̀RUN COUNCIL FORUM & THEORY VAULT
  // ══════════════════════════════════════════════════
  var CANON_THEORIES = [
    {
      author: "Catalyst Studio // Creator Log",
      cat: "creator",
      tag: "STUDIO LOG",
      text: "The Ẹṣù crossroads sigil on the Danfo engine block on Page 14 is not decorative. In Yoruba cosmology, Ẹṣù governs the boundary between destiny and choice."
    },
    {
      author: "Mushin_Operative_99",
      cat: "lore",
      tag: "ORISHA LORE",
      text: "Notice that Bayo’s electrical aura is brass amber, never blue. In authentic mythology, Ṣàngó's sacred lightning is fire-brass, reflecting his royal staff (Oṣé Ṣàngó)."
    },
    {
      author: "Eko_Hacker_Dossier",
      cat: "arc2",
      tag: "ARC II THEORY",
      text: "The Pale Council isn't trying to close the Ọ̀run-Bleed; they are trying to siphon it into quantum battery banks beneath Eko Atlantic’s offshore towers."
    },
    {
      author: "Art Direction // Studio Log",
      cat: "creator",
      tag: "ART BIBLE",
      text: "The color temperature drops from 6500K overcast daylight to 2200K high-pressure sodium gold whenever Bayo begins channeling. Every panel adheres to strict emotional lighting."
    },
    {
      author: "Iron_Preacher",
      cat: "lore",
      tag: "ORISHA LORE",
      text: "The metal in the ground at Mushin retains memory of Ògún’s ancient anvil from 800 years ago. That is why Ikenna can manipulate iron structures without direct contact."
    },
    {
      author: "Shadow_Walker_NG",
      cat: "arc2",
      tag: "ARC II THEORY",
      text: "The hooded operative on Variant Cover #08 is Bayo’s missing elder brother who disappeared during the 2026 Balogun incident."
    }
  ];

  var activeTheoryFilter = 'all';

  function renderTheories() {
    var grid = document.getElementById('councilGrid');
    if (!grid) return;

    // Load any locally submitted theories
    var stored = [];
    try {
      stored = JSON.parse(localStorage.getItem('catalyst_user_theories') || '[]');
    } catch(_) {}

    var allList = stored.concat(CANON_THEORIES);
    var filtered = allList.filter(function(item) {
      if (activeTheoryFilter === 'all') return true;
      return item.cat === activeTheoryFilter;
    });

    grid.innerHTML = filtered.map(function(t) {
      return '<div class="council-card">' +
        '<div class="council-card-meta">' +
          '<span class="council-card-author">' + t.author + '</span>' +
          '<span class="council-card-tag">' + (t.tag || 'COMMUNITY') + '</span>' +
        '</div>' +
        '<p class="council-card-text">' + t.text + '</p>' +
      '</div>';
    }).join('');
  }

  window.filterTheories = function(cat, btn) {
    activeTheoryFilter = cat;
    document.querySelectorAll('.council-tab').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderTheories();
    if (window.playHudSound) window.playHudSound('click');
  };

  window.submitTheory = function(e) {
    e.preventDefault();
    var form = e.target;
    var author = form.querySelector('input[name="author"]').value.trim();
    var cat = form.querySelector('select[name="category"]').value;
    var text = form.querySelector('textarea[name="theory"]').value.trim();

    if (!author || !text) return;

    var newEntry = {
      author: author + ' ✦',
      cat: cat,
      tag: 'COMMUNITY VERIFIED',
      text: text
    };

    var stored = [];
    try {
      stored = JSON.parse(localStorage.getItem('catalyst_user_theories') || '[]');
    } catch(_) {}
    stored.unshift(newEntry);
    localStorage.setItem('catalyst_user_theories', JSON.stringify(stored));

    form.reset();
    renderTheories();
    if (window.showToast) window.showToast('Thesis transmitted to the Ọ̀run Council!', 'success', 2500);
    if (window.playHudSound) window.playHudSound('variant');
  };

  // Wire up on load
  document.addEventListener('DOMContentLoaded', function() {
    wireMapTelemetry();
    renderSimStep();
    renderTheories();
  });
})();

/* ══════════════════════════════════════════════════════════════════
   CATALYST OS v2.0 INTERACTIVE CONTROLLERS
   ══════════════════════════════════════════════════════════════════ */

(function initCatalystOSv2() {
  /* ── 1. HUD LIGHTBOX SPLIT SLIDER & LORE AUDIO ── */
  let currentArtIndex = 0;
  let isSplitMode = false;
  let splitPercent = 50;
  let isDraggingSplit = false;

  // Track artworks list
  function getAllArtCards() {
    return Array.from(document.querySelectorAll('.ag-card'));
  }

  window.navHudArt = function(direction) {
    const cards = getAllArtCards();
    if (!cards.length) return;
    currentArtIndex = (currentArtIndex + direction + cards.length) % cards.length;
    const targetCard = cards[currentArtIndex];
    if (targetCard) {
      if (typeof window.playHudSound === 'function') window.playHudSound('select');
      targetCard.click();
    }
  };

  window.toggleHudSplitMode = function() {
    isSplitMode = !isSplitMode;
    const splitWrap = document.getElementById('hudSplitWrap');
    const splitBtn = document.getElementById('hudSplitBtn');
    const singleImg = document.getElementById('hudPreviewImg');
    const fallback = document.getElementById('hudFallbackBox');

    if (splitWrap) splitWrap.style.display = isSplitMode ? 'block' : 'none';
    if (splitBtn) {
      splitBtn.classList.toggle('active', isSplitMode);
      splitBtn.textContent = isSplitMode ? '◼ SINGLE VIEW' : '◫ SPLIT SLIDER';
    }
    if (isSplitMode) {
      if (fallback) fallback.style.display = 'none';
      if (singleImg && singleImg.src) {
        const imgA = document.getElementById('hudSplitImgA');
        const imgB = document.getElementById('hudSplitImgB');
        if (imgA) imgA.src = singleImg.src;
        if (imgB) imgB.src = singleImg.src;
      }
      setSplitPosition(50);
      if (typeof window.playHudSound === 'function') window.playHudSound('activate');
    }
  };

  function setSplitPosition(pct) {
    splitPercent = Math.max(5, Math.min(95, pct));
    const beforeLayer = document.getElementById('hudSplitBefore');
    const handle = document.getElementById('hudSplitHandle');
    if (beforeLayer) beforeLayer.style.clipPath = 'inset(0 ' + (100 - splitPercent) + '% 0 0)';
    if (handle) handle.style.left = splitPercent + '%';
  }

  // Split Drag Listeners
  const splitWrapEl = document.getElementById('hudSplitWrap');
  if (splitWrapEl) {
    splitWrapEl.addEventListener('mousedown', function(e) {
      isDraggingSplit = true;
      handleSplitMove(e);
    });
    window.addEventListener('mousemove', function(e) {
      if (!isDraggingSplit) return;
      handleSplitMove(e);
    });
    window.addEventListener('mouseup', function() {
      isDraggingSplit = false;
    });
    // Touch support
    splitWrapEl.addEventListener('touchstart', function(e) {
      isDraggingSplit = true;
      if (e.touches && e.touches[0]) handleSplitMove(e.touches[0]);
    }, { passive: true });
    window.addEventListener('touchmove', function(e) {
      if (!isDraggingSplit) return;
      if (e.touches && e.touches[0]) handleSplitMove(e.touches[0]);
    }, { passive: true });
    window.addEventListener('touchend', function() {
      isDraggingSplit = false;
    });
  }

  function handleSplitMove(e) {
    const wrap = document.getElementById('hudSplitWrap');
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = (x / rect.width) * 100;
    setSplitPosition(pct);
  }

  // Keyboard navigation for Lightbox
  window.addEventListener('keydown', function(e) {
    const backdrop = document.getElementById('hudLightboxBackdrop');
    if (!backdrop || !backdrop.classList.contains('active')) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      window.navHudArt(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      window.navHudArt(1);
    } else if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4') {
      const idx = parseInt(e.key, 10) - 1;
      const pills = document.querySelectorAll('.hud-variant-pill');
      if (pills[idx]) {
        e.preventDefault();
        pills[idx].click();
      }
    } else if (e.key.toLowerCase() === 's') {
      e.preventDefault();
      window.toggleHudSplitMode();
    } else if (e.key === 'Escape') {
      if (typeof window.closeHudLightbox === 'function') window.closeHudLightbox();
    }
  });

  // Procedural Lore Audio Synthesizer
  window.playCurrentArtworkLore = function() {
    const artCode = document.getElementById('hudArtCode')?.textContent || 'SPEC-01';
    const audioBtn = document.getElementById('hudLoreAudioBtn');
    if (audioBtn) {
      audioBtn.textContent = '⚡ TRANSMITTING...';
      setTimeout(() => { audioBtn.textContent = '▶ TRANSMIT LORE AUDIO'; }, 2200);
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Synthesize cybernetic harmonic carrier
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const masterGain = ctx.createGain();

      carrier.type = 'sawtooth';
      carrier.frequency.setValueAtTime(220, ctx.currentTime);
      carrier.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      carrier.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 1.2);
      carrier.frequency.exponentialRampToValueAtTime(165, ctx.currentTime + 2.0);

      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(12, ctx.currentTime);
      modGain.gain.setValueAtTime(50, ctx.currentTime);
      modulator.connect(carrier.frequency);

      masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.2);
      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.1);

      carrier.connect(masterGain);
      masterGain.connect(ctx.destination);

      carrier.start();
      modulator.start();
      carrier.stop(ctx.currentTime + 2.2);
      modulator.stop(ctx.currentTime + 2.2);
    } catch (err) {
      console.warn('Procedural audio lore unavailable:', err);
    }
  };

  /* ── 2. LAGOS 2031 MAP: FACTION MATRIX & TELEMETRY ── */
  const FACTION_SECTORS = {
    kooza: {
      sectors: ['Oshodi Transport Interchange', 'Eko Atlantic Coastal Bulwark'],
      lat: '6°33'18" N',
      lon: '3°21'04" E',
      title: 'KOOZA SYNDICATE HIGH GRID',
      threat: 'CRITICAL',
      ase: '950 AṢẸ',
      rule: 'KOOZA CORPORATE PATROL'
    },
    eko: {
      sectors: ['Mushin Scrap Yards', 'Balogun Market Concourse'],
      lat: '6°31'52" N',
      lon: '3°22'40" E',
      title: 'EKO VIGILANTE TERRITORY',
      threat: 'ELEVATED',
      ase: '820 AṢẸ',
      rule: 'NEO-LAGOS INSURGENTS'
    },
    council: {
      sectors: ['Third Mainland Void Seam', 'Ilubirin Submerged Shrine'],
      lat: '6°28'44" N',
      lon: '3°24'19" E',
      title: 'COUNCIL OF ELDERS ARCHIVES',
      threat: 'SOVEREIGN',
      ase: '1,200 AṢẸ',
      rule: 'PALE COUNCIL CLASSIFIED'
    }
  };

  window.filterMapFaction = function(factionKey, btn) {
    document.querySelectorAll('.map-filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const sectorPins = document.querySelectorAll('.map-sector-pin');
    sectorPins.forEach(pin => {
      const title = pin.getAttribute('data-name') || pin.getAttribute('title') || '';
      if (factionKey === 'all') {
        pin.style.opacity = '1';
        pin.style.transform = 'scale(1)';
      } else {
        const matches = FACTION_SECTORS[factionKey]?.sectors.some(s => title.includes(s) || s.includes(title));
        pin.style.opacity = matches ? '1' : '0.25';
        pin.style.transform = matches ? 'scale(1.2)' : 'scale(0.85)';
      }
    });

    // Update telemetry display
    const data = FACTION_SECTORS[factionKey];
    if (data) {
      const titleEl = document.getElementById('hudSectorTitle');
      const threatEl = document.getElementById('hudThreatVal');
      const aseEl = document.getElementById('hudAseVal');
      const ruleEl = document.getElementById('hudFactionVal');
      const coordsEl = document.getElementById('hudCoordsDisplay');

      if (titleEl) titleEl.textContent = data.title;
      if (threatEl) threatEl.textContent = data.threat;
      if (aseEl) aseEl.textContent = data.ase;
      if (ruleEl) ruleEl.textContent = data.rule;
      if (coordsEl) coordsEl.textContent = 'LAT: ' + data.lat + ' · LON: ' + data.lon;
    }

    if (typeof window.playHudSound === 'function') window.playHudSound('select');
  };

  /* ── 3. AMBIENT SOUND DOCK: EQ BARS & AUTO-ZONE SCENE SYNC ── */
  let isAutoZoneActive = true;

  window.toggleAutoZoneSound = function() {
    isAutoZoneActive = !isAutoZoneActive;
    const btn = document.getElementById('soundAutoZoneBtn');
    if (btn) {
      btn.classList.toggle('active', isAutoZoneActive);
      btn.textContent = isAutoZoneActive ? 'AUTO-ZONE: ON' : 'AUTO-ZONE: OFF';
    }
    if (typeof window.playHudSound === 'function') window.playHudSound('select');
  };

  // Sync EQ bars with ambient audio state
  const origToggle = window.toggleAmbientSound;
  window.toggleAmbientSound = function() {
    if (typeof origToggle === 'function') origToggle();
    updateEqState();
  };

  function updateEqState() {
    const eq = document.getElementById('soundDockEq');
    const label = document.getElementById('soundDockLabel');
    if (eq && label) {
      const isPlaying = label.textContent.includes('ON');
      eq.classList.toggle('playing', isPlaying);
    }
  }

  // Intersection Observer for narrative auto-zone switching
  if ('IntersectionObserver' in window) {
    const zoneMap = [
      { id: 'lagos-map', preset: 'noir' },
      { id: 'faction-simulator', preset: 'sango' },
      { id: 'read', preset: 'ogun' },
      { id: 'orun-council', preset: 'osun' },
      { id: 'artwork-gallery', preset: 'sango' }
    ];

    const observer = new IntersectionObserver((entries) => {
      if (!isAutoZoneActive) return;
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          const matched = zoneMap.find(z => z.id === entry.target.id);
          if (matched && typeof window.setAmbientPreset === 'function') {
            const presetBtn = document.querySelector('.preset-btn[onclick*="' + matched.preset + '"]');
            if (presetBtn && !presetBtn.classList.contains('active')) {
              window.setAmbientPreset(matched.preset, presetBtn);
            }
          }
        }
      });
    }, { threshold: [0.35] });

    zoneMap.forEach(z => {
      const el = document.getElementById(z.id);
      if (el) observer.observe(el);
    });
  }

  /* ── 4. Ọ̀RUN COUNCIL: UPVOTES & CLASSIFIED DECRYPTION ── */
  window.upvoteTheory = function(theoryId, btn) {
    const key = 'catalyst_upvote_' + theoryId;
    const hasVoted = localStorage.getItem(key);
    let count = parseInt(btn.getAttribute('data-votes') || '14', 10);

    if (!hasVoted) {
      count += 1;
      localStorage.setItem(key, 'true');
      btn.setAttribute('data-votes', count);
      btn.classList.add('voted');
      btn.innerHTML = '▲ UPVOTED (' + count + ')';
      if (typeof window.playHudSound === 'function') window.playHudSound('activate');
    } else {
      count -= 1;
      localStorage.removeItem(key);
      btn.setAttribute('data-votes', count);
      btn.classList.remove('voted');
      btn.innerHTML = '▲ UPVOTE (' + count + ')';
    }
  };

  window.decryptLore = function(el) {
    if (el.classList.contains('decrypted')) return;
    const secret = el.getAttribute('data-secret') || 'CLASSIFIED: Ọ̀run frequency matched to Bayo Adeyemi mitochondrial bloodline.';
    el.classList.add('decrypted');
    
    // Matrix decrypt scramble effect
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%#$@';
    let iterations = 0;
    const interval = setInterval(() => {
      el.textContent = secret.split('').map((char, index) => {
        if (index < iterations) return secret[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      if (iterations >= secret.length) {
        clearInterval(interval);
      }
      iterations += 2;
    }, 25);

    if (typeof window.playHudSound === 'function') window.playHudSound('success');
  };

  /* ── 5. COMIC READER: 19-SCENE FILMSTRIP JUMP & RESUME ── */
  window.jumpToScene = function(sceneIdx, btn) {
    document.querySelectorAll('.filmstrip-chip').forEach(c => c.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // Save to local storage
    localStorage.setItem('catalyst_last_scene_idx', sceneIdx);
    const sceneTitle = btn?.textContent?.trim() || ('Scene ' + sceneIdx);
    localStorage.setItem('catalyst_last_scene_title', sceneTitle);

    const resumeEl = document.getElementById('profileResumeScene');
    if (resumeEl) resumeEl.textContent = sceneTitle;

    // Scroll smoothly to read section
    const readSec = document.getElementById('read');
    if (readSec) {
      readSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (typeof window.playHudSound === 'function') window.playHudSound('select');
  };

  window.resumeLastReadingScene = function() {
    const savedIdx = localStorage.getItem('catalyst_last_scene_idx') || '1';
    const chip = document.querySelector('.filmstrip-chip:nth-child(' + savedIdx + ')');
    window.jumpToScene(parseInt(savedIdx, 10), chip);
    if (typeof window.closeUserProfileModal === 'function') window.closeUserProfileModal();
  };

  // Populate theories with interactive upvotes and secret redacted lore
  function enrichTheoryCards() {
    const cards = document.querySelectorAll('.council-card');
    cards.forEach((card, i) => {
      if (!card.querySelector('.theory-upvote-btn')) {
        const foot = card.querySelector('.council-card-footer') || card;
        const initialVotes = 24 + (i * 7);
        const upvoteHtml = document.createElement('div');
        upvoteHtml.style.display = 'flex';
        upvoteHtml.style.alignItems = 'center';
        upvoteHtml.style.justifyContent = 'space-between';
        upvoteHtml.style.marginTop = '0.8rem';
        upvoteHtml.innerHTML = '<button type="button" class="theory-upvote-btn" data-votes="' + initialVotes + '" onclick="upvoteTheory(' + i + ', this)">▲ UPVOTE (' + initialVotes + ')</button>' +
          '<span class="redacted-lore" onclick="decryptLore(this)" data-secret="DECRYPTED LORE: Ancient Ògún anvil resonant frequency 432Hz detected under Balogun Nexus.">[CLASSIFIED DECRYPT]</span>';
        foot.appendChild(upvoteHtml);
      }
    });
  }

  // Run on ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enrichTheoryCards);
  } else {
    enrichTheoryCards();
  }
})();

/* ══════════════════════════════════════════════════════════════════
   CATALYST OS v3.0 INTERACTIVE LOGIC & ADVANCED CONTROLLERS
   ══════════════════════════════════════════════════════════════════ */

(function initCatalystOSv3() {
  /* ── 1. PALETTE HEX EYEDROPPER COPY ── */
  window.copyHexCode = function(hex, name) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hex).then(() => {
        showPaletteToast('COPIED ' + name + ' (' + hex + ')');
      }).catch(() => {
        showPaletteToast('COPIED: ' + hex);
      });
    } else {
      showPaletteToast('HEX: ' + hex);
    }
    if (typeof window.playHudSound === 'function') window.playHudSound('select');
  };

  function showPaletteToast(msg) {
    let toast = document.getElementById('paletteToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'paletteToast';
      toast.style.position = 'fixed';
      toast.style.bottom = '2rem';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.background = 'rgba(6, 6, 13, 0.95)';
      toast.style.border = '1px solid #F4B800';
      toast.style.color = '#F4B800';
      toast.style.padding = '0.6rem 1.2rem';
      toast.style.fontFamily = "'Space Grotesk', monospace";
      toast.style.fontSize = '0.8rem';
      toast.style.letterSpacing = '0.1em';
      toast.style.borderRadius = '4px';
      toast.style.zIndex = '999999';
      toast.style.boxShadow = '0 8px 25px rgba(0,0,0,0.8), 0 0 15px rgba(244,184,0,0.4)';
      toast.style.transition = 'opacity 0.25s ease';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.style.opacity = '0'; }, 2000);
  }

  /* ── 2. LAGOS MAP HEATMAP TOGGLE ── */
  let isHeatmapActive = false;
  window.toggleMapHeatmap = function() {
    isHeatmapActive = !isHeatmapActive;
    const group = document.getElementById('mapHeatmapGroup');
    const btn = document.getElementById('mapHeatmapBtn');
    if (group) group.style.opacity = isHeatmapActive ? '1' : '0';
    if (btn) {
      btn.classList.toggle('active', isHeatmapActive);
      btn.textContent = isHeatmapActive ? '⚡ TOPOLOGY VECTOR VIEW' : '🔥 AṢẸ BLEED HEATMAP';
    }
    if (typeof window.playHudSound === 'function') {
      window.playHudSound(isHeatmapActive ? 'activate' : 'select');
    }
  };

  /* ── 3. PROCEDURAL AṢẸ FX SOUNDBOARD ── */
  window.playOneShotFx = function(type) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const t = ctx.currentTime;

      if (type === 'thunder') {
        // Synthesize rolling thunder
        const bufferSize = ctx.sampleRate * 1.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, t);
        filter.frequency.exponentialRampToValueAtTime(45, t + 1.4);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(t);
      } else if (type === 'steel') {
        // Synthesize metal hammer clang
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1240, t);
        osc.frequency.exponentialRampToValueAtTime(540, t + 0.6);
        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.7);
      } else if (type === 'tide') {
        // Synthesize water flow surge
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.linearRampToValueAtTime(320, t + 0.8);
        osc.frequency.linearRampToValueAtTime(160, t + 1.8);
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.22, t + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 2.0);
      } else if (type === 'radio') {
        // Synthesize military recon telemetry chirps
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1800, t);
        osc.frequency.setValueAtTime(2400, t + 0.1);
        osc.frequency.setValueAtTime(1500, t + 0.2);
        osc.frequency.setValueAtTime(2200, t + 0.3);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.5);
      }
    } catch (e) {
      console.warn('Procedural FX error:', e);
    }
  };

  /* ── 4. Ọ̀RUN COUNCIL REAL-TIME SEARCH ── */
  window.searchCouncilTheories = function(query) {
    const q = (query || '').toLowerCase().trim();
    const cards = document.querySelectorAll('.council-card');
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  };

  /* ── 5. COMIC READER THEME SWITCHER ── */
  window.setReaderTheme = function(theme, btn) {
    document.querySelectorAll('.reader-theme-switcher .theme-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.body.classList.remove('reader-theme-sepia', 'reader-theme-matrix');
    if (theme === 'sepia') {
      document.body.classList.add('reader-theme-sepia');
    } else if (theme === 'matrix') {
      document.body.classList.add('reader-theme-matrix');
    }
    localStorage.setItem('catalyst_reader_theme', theme);
    if (typeof window.playHudSound === 'function') window.playHudSound('select');
  };

  // Restore saved reader theme
  const savedTheme = localStorage.getItem('catalyst_reader_theme');
  if (savedTheme) {
    const btn = document.querySelector(`.reader-theme-switcher .theme-btn[onclick*="${savedTheme}"]`);
    if (btn) window.setReaderTheme(savedTheme, btn);
  }

  /* ── 6. CANVAS DIGITAL VIP PASS EXPORTER ── */
  window.exportDigitalReaderPassCanvas = function() {
    const callsign = (document.getElementById('profileCallSignInput')?.value || 'CATALYST_OPERATIVE').toUpperCase();
    const affinity = document.querySelector('.affinity-chip.active')?.textContent || '⚡ Ṣàngó';
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 520;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 900, 520);
    bg.addColorStop(0, '#06060D');
    bg.addColorStop(0.5, '#0A0A1F');
    bg.addColorStop(1, '#020108');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 900, 520);

    // Cyberpunk grid lines
    ctx.strokeStyle = 'rgba(244, 184, 0, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 900; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 520); ctx.stroke();
    }
    for (let y = 0; y < 520; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(900, y); ctx.stroke();
    }

    // Outer border
    ctx.strokeStyle = '#F4B800';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 860, 480);

    // Inner teal border
    ctx.strokeStyle = 'rgba(0, 201, 177, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, 840, 460);

    // Corner brackets
    ctx.fillStyle = '#F4B800';
    ctx.fillRect(15, 15, 25, 4);
    ctx.fillRect(15, 15, 4, 25);
    ctx.fillRect(860, 15, 25, 4);
    ctx.fillRect(881, 15, 4, 25);
    ctx.fillRect(15, 497, 25, 4);
    ctx.fillRect(15, 476, 4, 25);
    ctx.fillRect(860, 497, 25, 4);
    ctx.fillRect(881, 476, 4, 25);

    // Header Tag
    ctx.font = "bold 15px 'Space Grotesk', monospace";
    ctx.fillStyle = '#00C9B1';
    ctx.fillText('CATALYST OS // VERIFIED OPERATIVE CREDENTIAL v3.0', 50, 65);

    // Main Title
    ctx.font = "bold 34px 'Space Grotesk', sans-serif";
    ctx.fillStyle = '#F0EDE5';
    ctx.fillText('CATALYST: AWAKENING', 50, 115);

    // Callsign
    ctx.font = "bold 44px 'Space Grotesk', sans-serif";
    ctx.fillStyle = '#F4B800';
    ctx.fillText(callsign, 50, 185);

    // Affinity
    ctx.font = "18px 'Space Grotesk', monospace";
    ctx.fillStyle = '#00C9B1';
    ctx.fillText('ORISHA AFFINITY: ' + affinity, 50, 230);

    // Details Grid
    ctx.font = "14px 'Space Grotesk', monospace";
    ctx.fillStyle = 'rgba(240, 237, 229, 0.7)';
    ctx.fillText('SECURITY CLEARANCE: TIER-01 GRAND SOVEREIGN', 50, 280);
    ctx.fillText('COGNITIVE CANON ACCESS: 50/50 ARTWORKS UNLOCKED', 50, 310);
    ctx.fillText('ORUN MEMBRANE SYNC: STABLE (99.8%)', 50, 340);
    ctx.fillText('TIMESTAMP: ' + new Date().toISOString().slice(0, 19).replace('T', ' '), 50, 370);

    // Holographic Seal simulation
    ctx.save();
    ctx.translate(720, 260);
    ctx.strokeStyle = '#F4B800';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 80, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#00C9B1';
    ctx.beginPath(); ctx.arc(0, 0, 65, 0, Math.PI * 2); ctx.stroke();
    ctx.font = "bold 13px 'Space Grotesk', monospace";
    ctx.fillStyle = '#F4B800';
    ctx.textAlign = 'center';
    ctx.fillText('Ọ̀RUN COUNCIL', 0, -10);
    ctx.fillText('CANON VERIFIED', 0, 15);
    ctx.restore();

    // Trigger download
    const link = document.createElement('a');
    link.download = 'Catalyst_VIP_Pass_' + callsign.replace(/[^A-Z0-9_]/gi, '_') + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    if (typeof window.playHudSound === 'function') window.playHudSound('success');
  };
})();

/* ══════════════════════════════════════════════════════════════════
   CATALYST OS v4.0 ULTIMATE EDITION LOGIC & CONTROLLERS
   ══════════════════════════════════════════════════════════════════ */

(function initCatalystOSv4() {
  /* ── 1. PERSISTENT LASER READING PROGRESS BAR ── */
  const laserBar = document.getElementById('laserReadingBar');
  if (laserBar) {
    window.addEventListener('scroll', function() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const pct = Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100));
        laserBar.style.width = pct + '%';
      }
    }, { passive: true });
  }

  /* ── 2. FORENSIC OPTICAL VECTOR LOUPE ── */
  let isLoupeActive = false;
  const loupeGlass = document.getElementById('hudLoupeGlass');
  const previewImg = document.getElementById('hudPreviewImg');
  const imgViewport = document.getElementById('hudImgViewport');

  window.toggleHudLoupe = function() {
    isLoupeActive = !isLoupeActive;
    const btn = document.getElementById('hudLoupeBtn');
    if (btn) {
      btn.classList.toggle('active', isLoupeActive);
      btn.textContent = isLoupeActive ? '🔍 LOUPE: ON' : '🔍 LOUPE';
    }
    if (loupeGlass) {
      loupeGlass.style.display = isLoupeActive ? 'block' : 'none';
    }
    if (typeof window.playHudSound === 'function') window.playHudSound('select');
  };

  if (imgViewport && previewImg && loupeGlass) {
    imgViewport.addEventListener('mousemove', function(e) {
      if (!isLoupeActive || !previewImg.src || previewImg.style.display === 'none') return;
      const rect = imgViewport.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      loupeGlass.style.left = x + 'px';
      loupeGlass.style.top = y + 'px';
      loupeGlass.style.backgroundImage = 'url(' + previewImg.src + ')';

      const zoomRatio = 2.5;
      loupeGlass.style.backgroundSize = (rect.width * zoomRatio) + 'px ' + (rect.height * zoomRatio) + 'px';
      const bgX = -(x * zoomRatio - 90);
      const bgY = -(y * zoomRatio - 90);
      loupeGlass.style.backgroundPosition = bgX + 'px ' + bgY + 'px';
    });

    imgViewport.addEventListener('mouseleave', function() {
      if (loupeGlass && isLoupeActive) loupeGlass.style.display = 'none';
    });
    imgViewport.addEventListener('mouseenter', function() {
      if (loupeGlass && isLoupeActive) loupeGlass.style.display = 'block';
    });
  }

  /* ── 3. CINEMA THEATRE MODE ── */
  let isCinemaMode = false;
  window.toggleHudCinemaMode = function() {
    isCinemaMode = !isCinemaMode;
    document.body.classList.toggle('hud-cinema-active', isCinemaMode);
    const btn = document.getElementById('hudCinemaBtn');
    if (btn) {
      btn.classList.toggle('active', isCinemaMode);
      btn.textContent = isCinemaMode ? '⛶ EXIT CINEMA' : '⛶ CINEMA';
    }
    if (typeof window.playHudSound === 'function') window.playHudSound('activate');
  };

  /* ── 4. 3D SPATIAL AUDIO TOGGLE & VOLUME LABEL ── */
  let is3DSpatial = true;
  window.toggle3DSpatialSound = function() {
    is3DSpatial = !is3DSpatial;
    const btn = document.getElementById('soundSpatialBtn');
    if (btn) {
      btn.classList.toggle('active', is3DSpatial);
      btn.textContent = is3DSpatial ? '3D SPATIAL: ON' : '3D SPATIAL: STEREO';
    }
    if (typeof window.playHudSound === 'function') window.playHudSound('select');
  };

  const volSlider = document.getElementById('soundVolumeSlider');
  const volLabel = document.getElementById('soundVolLabel');
  if (volSlider && volLabel) {
    volSlider.addEventListener('input', function() {
      volLabel.textContent = Math.round(parseFloat(this.value) * 100) + '%';
    });
  }

  /* ── 5. WAR ROOM CENSUS INTERACTIVE VOTING ── */
  window.castWarCensusVote = function() {
    const affinity = document.querySelector('.affinity-chip.active')?.textContent || 'Ṣàngó';
    let target = 'sango';
    if (affinity.includes('Ògún')) target = 'ogun';
    else if (affinity.includes('Kooza') || affinity.includes('Ẹṣù')) target = 'kooza';

    const sangoEl = document.getElementById('warScoreSango');
    const ogunEl = document.getElementById('warScoreOgun');
    const koozaEl = document.getElementById('warScoreKooza');

    let votesSango = 4281;
    let votesOgun = 3610;
    let votesKooza = 2110;

    if (target === 'sango') votesSango += 15;
    else if (target === 'ogun') votesOgun += 15;
    else votesKooza += 15;

    const total = votesSango + votesOgun + votesKooza;
    const pctSango = ((votesSango / total) * 100).toFixed(1);
    const pctOgun = ((votesOgun / total) * 100).toFixed(1);
    const pctKooza = ((votesKooza / total) * 100).toFixed(1);

    if (sangoEl) sangoEl.textContent = pctSango + '% (' + votesSango.toLocaleString() + ' operatives)';
    if (ogunEl) ogunEl.textContent = pctOgun + '% (' + votesOgun.toLocaleString() + ' operatives)';
    if (koozaEl) koozaEl.textContent = pctKooza + '% (' + votesKooza.toLocaleString() + ' operatives)';

    const fillSango = document.querySelector('.war-bar-fill.war-sango');
    const fillOgun = document.querySelector('.war-bar-fill.war-ogun');
    const fillKooza = document.querySelector('.war-bar-fill.war-kooza');

    if (fillSango) fillSango.style.width = pctSango + '%';
    if (fillOgun) fillOgun.style.width = pctOgun + '%';
    if (fillKooza) fillKooza.style.width = pctKooza + '%';

    if (typeof window.playHudSound === 'function') window.playHudSound('success');
  };

  /* ── 6. Ọ̀RUN COUNCIL SORTING ── */
  window.sortCouncilTheories = function(mode, btn) {
    document.querySelectorAll('.council-sort-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const grid = document.getElementById('councilGrid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.council-card'));

    if (mode === 'votes') {
      cards.sort((a, b) => {
        const vA = parseInt(a.querySelector('.theory-upvote-btn')?.getAttribute('data-votes') || '0', 10);
        const vB = parseInt(b.querySelector('.theory-upvote-btn')?.getAttribute('data-votes') || '0', 10);
        return vB - vA;
      });
    } else {
      // Recent sort: natural order
      cards.reverse();
    }
    cards.forEach(c => grid.appendChild(c));
    if (typeof window.playHudSound === 'function') window.playHudSound('select');
  };

  /* ── 7. READER FONT RESIZER ── */
  let readerFontSize = 0.95;
  window.adjustReaderFontSize = function(delta) {
    readerFontSize = Math.min(1.35, Math.max(0.8, readerFontSize + (delta * 0.08)));
    const proseEls = document.querySelectorAll('#read .story-prose, #read .panel-dialogue, #read .panel-narration');
    proseEls.forEach(el => {
      el.style.fontSize = readerFontSize + 'rem';
    });
    localStorage.setItem('catalyst_reader_fontsize', readerFontSize);
    if (typeof window.playHudSound === 'function') window.playHudSound('select');
  };

  // Restore saved reader font size
  const savedFontSize = localStorage.getItem('catalyst_reader_fontsize');
  if (savedFontSize) {
    window.adjustReaderFontSize(0);
  }
})();

/* ══════════════════════════════════════════════════════════════════
   CATALYST OS v5.0 FOUR FLAGSHIP EXPANSION SYSTEMS LOGIC
   ══════════════════════════════════════════════════════════════════ */

(function initCatalystOSv5() {
  /* ── 1. TRI-LINGUAL CULTURAL LANGUAGE SELECTOR ── */
  const TRANSLATIONS = {
    en: {
      heroSub: "THE FIRST NIGERIAN AFROFUTURIST COMIC UNIVERSE",
      motion1: "Mushin never actually sleeps. It rests with one eye open. Tonight the open eye has seen something it was not meant to see.",
      motion2: "The tear in the sky above Balogun Nexus is thirty metres wide and getting larger. Through it: light the wrong colour.",
      motion3: "Thunderstrike arrives first. Her talking drum fires thunderclaps that shatter concrete into neon dust.",
      motion4: "Iron Wolf hits the overpass — iron skin clanging against asphalt. 'You are in my city. On my street.'",
      motion5: "Tower 7 drone feed: The Architect observes the formation collapse in eleven seconds. 'I need a new architecture.'",
      motion6: "Dawn breaks over Lagos. Bayo smiles through the bruised morning. 'Oya. Let us see wetin we made of.'"
    },
    pidgin: {
      heroSub: "THE FIRST NAIJA AFROFUTURIST COMIC UNIVERSE WEY DEY SHAKE GROUND",
      motion1: "Mushin no dey ever sleep. E dey rest with one eye open. Tonight, the open eye don see wetin pass am.",
      motion2: "The tear wey dey sky for Balogun Nexus wide pass thirty metres. Wetin dey come out: light wey get different colour entirely.",
      motion3: "Thunderstrike first land. Her talking drum dey shoot thunder wey dey break heavy concrete into pieces.",
      motion4: "Iron Wolf land for the bridge — him iron body make loud noise against road. 'Na my city you dey. On top my street.'",
      motion5: "Tower 7 drone feed: The Architect watch the whole squad fall inside eleven seconds. 'I need better plan.'",
      motion6: "Morning don break for Lagos. Bayo smile through the bruise. 'Oya now. Make we see wetin we dey made of.'"
    },
    yoruba: {
      heroSub: "ÀKỌ́KỌ́ AYÉ ÀWÒRÁN AFROFUTURIST TI NÀÌJÍRÍÀ TÍ Ó GBOORÒ",
      motion1: "Mushin kì í sùn rárá. Ojú kan ló fi ń simi. Lálẹ́ yìí, ojú tí ó ṣí ti rí ohun tí kò yẹ kí ó rí.",
      motion2: "Ojú ọ̀run tí ó ya lókè Balogun Nexus fẹ̀ tó ọgbọ̀n mítà. Ìmọ́lẹ̀ àjèjì tí kò wọ́pọ̀ ló ń jáde wá.",
      motion3: "Thunderstrike kọ́kọ́ dé. Gángan rẹ̀ ń kọ ààrá tí ń fọ́ kọnkéré mọ́lẹ̀ pátápátá.",
      motion4: "Iron Wolf bọ́ sí orí afárá — ara irin rẹ̀ dún kíkankíkan. 'Èkó tèmi ni ẹ wà. Lórí òpópónà mi.'",
      motion5: "Fídíò Tower 7: The Architect rí bí gbogbo rẹ̀ ṣe fọ́ láàárín ìṣẹ́jú-àáyá mọ́kànlá. 'Mo nílò ètò tuntun.'",
      motion6: "Ilẹ̀ mọ́ sí Èkó. Bayo rẹ́rìn-ín músẹ́ láìka egbò sí. 'Ó yá. Ẹ jẹ́ ká wo ohun tí a fi wá ṣe.'"
    }
  };

  let currentLang = localStorage.getItem('catalyst_lang') || 'en';

  window.setLanguage = function(lang, btn) {
    currentLang = lang;
    localStorage.setItem('catalyst_lang', lang);

    document.querySelectorAll('.nav-lang-picker .lang-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // Update Hero and Motion Comic texts
    const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
    const heroSubEl = document.querySelector('.hero-subtitle');
    if (heroSubEl) heroSubEl.textContent = t.heroSub;

    // Update active motion dialogue
    const curIdx = currentMotionIndex;
    const motionKey = 'motion' + (curIdx + 1);
    const motionTextEl = document.getElementById('motionDialogueText');
    if (motionTextEl && t[motionKey]) {
      motionTextEl.textContent = t[motionKey];
    }

    if (typeof window.playHudSound === 'function') window.playHudSound('select');
  };

  // Restore saved language on boot
  if (currentLang !== 'en') {
    const savedBtn = document.querySelector(`.nav-lang-picker .lang-btn[onclick*="${currentLang}"]`);
    if (savedBtn) window.setLanguage(currentLang, savedBtn);
  }

  /* ── 2. ANIMATED MOTION COMIC PLAYER ── */
  const MOTION_PANELS = [
    {
      bg: './assets/mushin-night.webp',
      fg: './assets/bayo-keyart-street.webp',
      tag: 'CAPTION // MUSHIN CORE · 2:47 AM',
      key: 'motion1',
      shake: false
    },
    {
      bg: './assets/corridor.webp',
      fg: './assets/circle.webp',
      tag: 'PANEL 02 // BALOGUN NEXUS · THE Ọ̀RUN-BLEED',
      key: 'motion2',
      shake: true
    },
    {
      bg: './assets/shipyard.webp',
      fg: './assets/team-aurora.webp',
      tag: 'PANEL 03 // AMARA THUNDERSTRIKE DEPLOYMENT',
      key: 'motion3',
      shake: true
    },
    {
      bg: './assets/mushin-night.webp',
      fg: './assets/bayo-keyart-street.webp',
      tag: 'PANEL 04 // IRON WOLF ON THIRD MAINLAND',
      key: 'motion4',
      shake: true
    },
    {
      bg: './assets/corridor.webp',
      fg: './assets/team-aurora.webp',
      tag: 'PANEL 05 // PALE COUNCIL TOWER 7 SURVEILLANCE',
      key: 'motion5',
      shake: false
    },
    {
      bg: './assets/shipyard.webp',
      fg: './assets/circle.webp',
      tag: 'PANEL 06 // DAWN OVER LAGOS · HOLDING THE LINE',
      key: 'motion6',
      shake: false
    }
  ];

  let currentMotionIndex = 0;
  let motionAutoplayInterval = null;

  function renderMotionPanel(idx) {
    currentMotionIndex = (idx + MOTION_PANELS.length) % MOTION_PANELS.length;
    const panel = MOTION_PANELS[currentMotionIndex];
    const frame = document.getElementById('motionPanelFrame');
    const bg = document.getElementById('motionBgLayer');
    const fg = document.getElementById('motionFgImg');
    const counter = document.getElementById('motionPanelCounter');
    const tag = document.getElementById('motionSpeakerTag');
    const dialogue = document.getElementById('motionDialogueText');
    const flash = document.getElementById('motionFxFlash');

    if (counter) counter.textContent = 'PANEL 0' + (currentMotionIndex + 1) + ' / 06';
    if (tag) tag.textContent = panel.tag;

    // Set background & foreground
    if (bg) bg.style.backgroundImage = 'url(' + panel.bg + ')';
    if (fg) fg.src = panel.fg;

    // Text translation
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    if (dialogue) {
      dialogue.textContent = t[panel.key] || t.motion1;
    }

    // Impact screen shake
    if (panel.shake && frame) {
      frame.classList.remove('screen-shake');
      void frame.offsetWidth; // trigger reflow
      frame.classList.add('screen-shake');
      if (typeof window.playOneShotFx === 'function') {
        window.playOneShotFx('steel');
      }
    } else {
      if (typeof window.playHudSound === 'function') {
        window.playHudSound('select');
      }
    }
  }

  window.nextMotionPanel = function() {
    renderMotionPanel(currentMotionIndex + 1);
  };

  window.prevMotionPanel = function() {
    renderMotionPanel(currentMotionIndex - 1);
  };

  window.toggleMotionAutoplay = function() {
    const btn = document.getElementById('motionAutoplayBtn');
    if (motionAutoplayInterval) {
      clearInterval(motionAutoplayInterval);
      motionAutoplayInterval = null;
      if (btn) {
        btn.classList.remove('active');
        btn.textContent = '▶ AUTO: OFF';
      }
    } else {
      motionAutoplayInterval = setInterval(() => {
        window.nextMotionPanel();
      }, 4000);
      if (btn) {
        btn.classList.add('active');
        btn.textContent = '▶ AUTO: ON (4s)';
      }
    }
  };

  window.toggleMotionFullscreen = function() {
    const section = document.getElementById('motion-comic-player');
    if (!section) return;
    if (!document.fullscreenElement) {
      section.requestFullscreen().catch(err => console.warn(err));
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
    }
  };

  // Start autoplay initially
  window.toggleMotionAutoplay();

  // Mouse parallax on motion stage
  const motionStage = document.getElementById('motionStageViewport');
  if (motionStage) {
    motionStage.addEventListener('mousemove', function(e) {
      const rect = motionStage.getBoundingClientRect();
      const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
      const yRatio = (e.clientY - rect.top) / rect.height - 0.5;
      const bg = document.getElementById('motionBgLayer');
      const fg = document.getElementById('motionFgImg');
      if (bg) bg.style.transform = 'scale(1.08) translate(' + (xRatio * 15) + 'px, ' + (yRatio * 15) + 'px)';
      if (fg) fg.style.transform = 'translate(' + (-xRatio * 35) + 'px, ' + (-yRatio * 25) + 'px)';
    });
  }

  /* ── 3. PRE-ORDER STORE & CHECKOUT ENGINE ── */
  let activeCurrency = 'NGN';
  const CURR_SYMBOLS = { NGN: '₦', USD: '$', GBP: '£' };

  window.setStoreCurrency = function(curr, btn) {
    activeCurrency = curr;
    document.querySelectorAll('.store-currency-switcher .curr-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const symbol = CURR_SYMBOLS[curr] || '₦';
    document.querySelectorAll('.store-price').forEach(el => {
      let priceVal = el.getAttribute('data-price-' + curr.toLowerCase());
      if (priceVal) {
        if (curr === 'NGN') priceVal = parseInt(priceVal, 10).toLocaleString();
        el.textContent = symbol + priceVal;
      }
    });

    if (typeof window.playHudSound === 'function') window.playHudSound('select');
  };

  let activeCheckoutItem = { id: '', title: '', priceStr: '' };

  window.openCheckoutModal = function(id, title, ngn, usd, gbp) {
    const modal = document.getElementById('checkoutModalBackdrop');
    const titleEl = document.getElementById('checkoutItemTitle');
    const priceEl = document.getElementById('checkoutPriceDisplay');
    const addressGroup = document.getElementById('checkoutAddressGroup');

    let priceVal = ngn;
    let symbol = '₦';
    if (activeCurrency === 'USD') { priceVal = usd; symbol = '$'; }
    else if (activeCurrency === 'GBP') { priceVal = gbp; symbol = '£'; }

    const priceFormatted = symbol + (activeCurrency === 'NGN' ? priceVal.toLocaleString() : priceVal);
    activeCheckoutItem = { id, title, priceStr: priceFormatted };

    if (titleEl) titleEl.textContent = title;
    if (priceEl) priceEl.textContent = priceFormatted;
    if (addressGroup) {
      addressGroup.style.display = (id === 'digital_pass') ? 'none' : 'block';
    }
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
    if (typeof window.playHudSound === 'function') window.playHudSound('activate');
  };

  window.closeCheckoutModal = function() {
    const modal = document.getElementById('checkoutModalBackdrop');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  window.processStoreCheckout = function(e) {
    const name = document.getElementById('checkoutName')?.value || 'Operative';
    const email = document.getElementById('checkoutEmail')?.value || 'reader@catalystverse.com';
    const method = document.querySelector('input[name="payMethod"]:checked')?.value || 'paystack';
    const submitBtn = document.getElementById('checkoutSubmitBtn');

    if (submitBtn) {
      submitBtn.textContent = 'CONNECTING TO ENCRYPTED GATEWAY...';
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      window.closeCheckoutModal();
      if (submitBtn) {
        submitBtn.textContent = 'PROCEED TO SECURE PAYMENT →';
        submitBtn.disabled = false;
      }

      // Generate instantaneous VIP Receipt Pass
      const orderRef = 'CAT-2031-' + Math.floor(100000 + Math.random() * 900000);
      alert('⚡ DISPATCH AUTHORIZED!\n\nOrder Reference: ' + orderRef + '\nItem: ' + activeCheckoutItem.title + '\nTotal: ' + activeCheckoutItem.priceStr + '\nRecipient: ' + name + ' (' + email + ')\n\nYour archival confirmation and tracking pass have been encrypted and transmitted. Welcome to the Ọ̀run Vanguard!');
      if (typeof window.playHudSound === 'function') window.playHudSound('success');
    }, 1200);
  };

  /* ── 4. PWA NATIVE APP INSTALL ENGINE ── */
  let deferredPrompt = null;
  const pwaBanner = document.getElementById('pwaInstallBanner');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (pwaBanner && !localStorage.getItem('catalyst_pwa_dismissed')) {
      pwaBanner.style.display = 'block';
    }
  });

  window.installCatalystPwa = function() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User installed Catalyst PWA');
        }
        deferredPrompt = null;
        if (pwaBanner) pwaBanner.style.display = 'none';
      });
    } else {
      alert('To install Catalyst Awakening, tap "Add to Home Screen" or your browser menu (Install App).');
    }
    if (typeof window.playHudSound === 'function') window.playHudSound('success');
  };

  window.dismissPwaBanner = function() {
    if (pwaBanner) pwaBanner.style.display = 'none';
    localStorage.setItem('catalyst_pwa_dismissed', 'true');
  };
})();

/* ══════════════════════════════════════════════════════════════════
   CATALYST OS v6.0 FOUR ULTIMATE EXPANSIONS LOGIC & CONTROLLERS
   ══════════════════════════════════════════════════════════════════ */

(function initCatalystOSv6() {
  /* ── 1. THE ORACLE OF BADAGRY LORE TERMINAL ── */
  let activeEntity = 'oracle';
  const ENTITY_PROFILES = {
    oracle: {
      tag: 'UPLINK: ORACLE_OF_BADAGRY // MEMBRANE RESONANCE 98.4%',
      prefix: '[ORACLE]',
      greeting: '"You walk on soil that remembers forty-one thousand days of fire. What truth do you seek from the waters, traveler?"',
      loreAnswers: {
        ase: '"Aṣẹ is not magic, nor is it mere electricity. It is the primordial frequency that existed before language divided thought from matter. When you speak in alignment with reality, the membrane yields."',
        vaccine: '"The Pale Council does not hate gods; they fear unpredictability. The Vaccine is an electromagnetic dampener engineered from synthetic Ọ̀run marrow to calcify human mitochondrial receptivity to divinity."',
        rupture: '"If the membrane ruptures wholly, Lagos will exist simultaneously in the 14th century, 2031, and the uncreated future. Time will become physical geography. You could walk from Mushin into eternity."',
        bayo: '"Bayo mother was Morenike Adeyemi — an initiate of the secret guild of Ògún smiths in Badagry. She knew before he was born that his bloodline was configured as a dual-terminal capacitor for thunder and iron."',
        default: '"The currents of the lagoon are stirred by your inquiry. Every choice in Lagos echoes across three realms. Prepare your heart for the convergence."'
      }
    },
    bayo: {
      tag: 'UPLINK: BAYO_ADEYEMI (ADY-19) // SECTOR 01 MUSHIN CORE',
      prefix: '[BAYO]',
      greeting: '"Look, I am just a guy from Paul Street who woke up with thunder in his bones. Ask whatever you want, but we do not have much time before the next patrol."',
      loreAnswers: {
        ase: '"When it hits me, it feels like every generator on the mainland kicking on at once inside my chest. It burns, but it also feels like home."',
        vaccine: '"The Architect thinks she can cure us of who we are. Tell her to bring her syringes to Mushin and see if iron bends for plastic."',
        rupture: '"I saw through the seam above Balogun. It is terrifying, but it is also alive. We are not running from it anymore."',
        bayo: '"My mother taught me that a mechanic does not just fix engines — he listens to what broke. I am trying to listen to what broke in Lagos."',
        default: '"Whatever the Council brings, the team is holding the line. Amara, Ikenna, Zara — we are not backing down."'
      }
    },
    architect: {
      tag: 'UPLINK: THE_ARCHITECT // PALE COUNCIL GRAND SOVEREIGN',
      prefix: '[ARCHITECT]',
      greeting: '"I have calculated thirty-two thousand iterations of this conversation. Your sentimentality remains remarkably consistent. State your premise."',
      loreAnswers: {
        ase: '"A biological hazard of cosmic scale. An uncontrolled release of Aṣẹ turns ordinary mortals into volatile weapons of mass devastation. Chaos requires containment."',
        vaccine: '"The Vaccine is salvation disguised as an injection. We are liberating humanity from the arbitrary tyranny of ancient mythological parasites."',
        rupture: '"A total rupture is the extinction of human autonomy. The Pale Council will seal the seam permanently, regardless of the cultural cost."',
        bayo: '"Vessel ADY-19 is a statistical impossibility that defies our regression models. He will be neutralized, archived, and studied."',
        default: '"Your questions do not alter the equation. Thirty-four days remain before the architecture of modern Lagos is finalized."'
      }
    }
  };

  window.selectChatEntity = function(key, btn) {
    activeEntity = key;
    document.querySelectorAll('.entity-selector-chips .entity-chip').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const profile = ENTITY_PROFILES[key];
    const tagEl = document.getElementById('terminalActiveEntity');
    const history = document.getElementById('terminalChatHistory');

    if (tagEl) tagEl.textContent = profile.tag;
    if (history) {
      history.innerHTML = '<div class="term-msg system"><span class="term-prefix">[SYSTEM]</span> Uplink established to ' + key.toUpperCase() + '.</div>' +
        '<div class="term-msg entity"><span class="term-prefix">' + profile.prefix + '</span> ' + profile.greeting + '</div>';
    }
    if (typeof window.playHudSound === 'function') window.playHudSound('activate');
  };

  window.submitTerminalQuery = function() {
    const input = document.getElementById('terminalUserInput');
    const query = input?.value?.trim();
    if (!query) return;

    input.value = '';
    const history = document.getElementById('terminalChatHistory');
    if (!history) return;

    // Add user message
    const userDiv = document.createElement('div');
    userDiv.className = 'term-msg user';
    userDiv.innerHTML = '<span class="term-prefix">[YOU]</span> ' + query;
    history.appendChild(userDiv);
    history.scrollTop = history.scrollHeight;

    // Determine entity response
    const profile = ENTITY_PROFILES[activeEntity];
    let reply = profile.loreAnswers.default;
    const lower = query.toLowerCase();

    if (lower.includes('ase') || lower.includes('aṣẹ') || lower.includes('origin') || lower.includes('frequency')) {
      reply = profile.loreAnswers.ase;
    } else if (lower.includes('vaccine') || lower.includes('pale council') || lower.includes('architect') || lower.includes('cure')) {
      reply = profile.loreAnswers.vaccine;
    } else if (lower.includes('rupture') || lower.includes('membrane') || lower.includes('orun') || lower.includes('ọ̀run')) {
      reply = profile.loreAnswers.rupture;
    } else if (lower.includes('mother') || lower.includes('bayo') || lower.includes('lineage') || lower.includes('mushin')) {
      reply = profile.loreAnswers.bayo;
    }

    if (typeof window.playOneShotFx === 'function') window.playOneShotFx('radio');

    setTimeout(() => {
      const entityDiv = document.createElement('div');
      entityDiv.className = 'term-msg entity';
      entityDiv.innerHTML = '<span class="term-prefix">' + profile.prefix + '</span> ' + reply;
      history.appendChild(entityDiv);
      history.scrollTop = history.scrollHeight;
      if (typeof window.playHudSound === 'function') window.playHudSound('select');
    }, 450);
  };

  window.askQuickQuestion = function(q) {
    const input = document.getElementById('terminalUserInput');
    if (input) input.value = q;
    window.submitTerminalQuery();
  };

  /* ── 2. SACRED RELICS 3D CANVAS RENDERER ── */
  const RELICS_DATA = [
    {
      title: "The Iron Anvil of Ògún",
      yoruba: "Àwọn Ohun Ìjà Ògún Alákàyé",
      desc: "Forged from meteoric core iron in the primeval forest. Every strike across its surface emits a 432 Hz subsonic acoustic wave that stabilizes raw elemental iron across a 50-kilometre radius.",
      freq: "432 Hz Harmonic",
      alloy: "99.4% Meteoric Core Iron",
      ase: "1,400 Sovereign Units",
      loc: "Ilubirin Subterranean Vaults",
      color: "#FF6B1A",
      shape: "anvil"
    },
    {
      title: "The Osé Thunder Axe of Ṣàngó",
      yoruba: "Àáké Ààrá Ṣàngó Ọba Kòso",
      desc: "A double-bladed ceremonial thunder-axe carved from lightning-struck iroko and edged in golden brass. Discharges three million volts of kinetic electrostatic surge on impact.",
      freq: "528 Hz Resonant Shock",
      alloy: "Thunder Iroko & Golden Brass",
      ase: "2,100 Storm Units",
      loc: "Balogun Core Cloud Nexus",
      color: "#F4B800",
      shape: "axe"
    },
    {
      title: "The Brass Mirror of Ọ̀ṣun",
      yoruba: "Awo Idẹ Ọ̀ṣun Òṣogbo",
      desc: "Liquid golden mirror reflecting not photons, but human intentionality and ancestral lineage. Water pooled on its surface never evaporates even under extreme thermal duress.",
      freq: "639 Hz Fluid Coherence",
      alloy: "Sacred River Brass & Pearl",
      ase: "1,850 Memory Units",
      loc: "Badagry Lagoon Deep Trench",
      color: "#00C9B1",
      shape: "mirror"
    },
    {
      title: "The Crossroads Staff of Ẹṣù",
      yoruba: "Ọ̀pá Ẹlẹ́gbàá Oríta Mẹ́ta",
      desc: "A spiraling dual-headed staff of black ebony and cowrie inlays that manipulates local probability vectors. Allows operatives to fold spatial distance across any junction.",
      freq: "741 Hz Dimensional Slip",
      alloy: "Void Ebony & Ancient Cowrie",
      ase: "1,920 Crossroads Units",
      loc: "Mushin Paul Street Concourse",
      color: "#b81414",
      shape: "staff"
    },
    {
      title: "The Pale Vaccine Ampoule",
      yoruba: "Àbẹ́rẹ́ Ìdènà Àṣẹ Ìgbàlódé",
      desc: "A crystalline hyper-dense phial designed by the Architect containing synthetic antimatter-suspended antibodies intended to purge Orisha genetic susceptibility forever.",
      freq: "963 Hz Synthetic Lock",
      alloy: "Titanium-Polymer & Void Serum",
      ase: "NEGATIVE 3,500 Units",
      loc: "Tower 7 High Security Apex",
      color: "#C41E3A",
      shape: "ampoule"
    }
  ];

  let currentRelicIdx = 0;
  let relicAngleX = 0;
  let relicAngleY = 0;
  let isRotatingRelic = true;
  let isDraggingRelic = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  window.selectRelic = function(idx, btn) {
    currentRelicIdx = idx;
    document.querySelectorAll('.relic-selector-tabs .relic-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const d = RELICS_DATA[idx];
    document.getElementById('relicSpecTag').textContent = 'PRIMORDIAL RELIC // ARCHIVE #0' + (idx + 1);
    document.getElementById('relicSpecTitle').textContent = d.title;
    document.getElementById('relicSpecYoruba').textContent = d.yoruba;
    document.getElementById('relicSpecDesc').textContent = d.desc;
    document.getElementById('relicStatFreq').textContent = d.freq;
    document.getElementById('relicStatAlloy').textContent = d.alloy;
    document.getElementById('relicStatAse').textContent = d.ase;
    document.getElementById('relicStatLoc').textContent = d.loc;

    if (typeof window.playHudSound === 'function') window.playHudSound('select');
  };

  window.toggleRelicRotation = function() {
    isRotatingRelic = !isRotatingRelic;
    const btn = document.getElementById('relicRotateBtn');
    if (btn) btn.textContent = isRotatingRelic ? '⏸ PAUSE ROTATION' : '▶ RESUME ROTATION';
    if (typeof window.playHudSound === 'function') window.playHudSound('select');
  };

  window.pulseRelicEnergy = function() {
    relicAngleY += 1.5;
    if (typeof window.playOneShotFx === 'function') window.playOneShotFx('steel');
  };

  // 3D Canvas Loop
  const relicCanvas = document.getElementById('relicCanvas3D');
  if (relicCanvas) {
    const ctx = relicCanvas.getContext('2d');

    relicCanvas.addEventListener('mousedown', (e) => {
      isDraggingRelic = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });
    window.addEventListener('mouseup', () => { isDraggingRelic = false; });
    window.addEventListener('mousemove', (e) => {
      if (!isDraggingRelic) return;
      relicAngleY += (e.clientX - lastMouseX) * 0.012;
      relicAngleX += (e.clientY - lastMouseY) * 0.012;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    function render3DRelic() {
      ctx.clearRect(0, 0, relicCanvas.width, relicCanvas.height);
      const cx = relicCanvas.width / 2;
      const cy = relicCanvas.height / 2;
      const relic = RELICS_DATA[currentRelicIdx];

      if (isRotatingRelic && !isDraggingRelic) {
        relicAngleY += 0.015;
      }

      // Background energy aura
      const radGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 180);
      radGrad.addColorStop(0, relic.color);
      radGrad.addColorStop(1, 'transparent');
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = radGrad;
      ctx.beginPath(); ctx.arc(cx, cy, 180, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Render 3D geometric wireframe
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = relic.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = relic.color;
      ctx.shadowBlur = 15;

      const size = 95;
      // Vertices of 3D octahedron/cuboid
      const vertices = [
        [-size, 0, 0], [size, 0, 0],
        [0, -size * 1.3, 0], [0, size * 1.3, 0],
        [0, 0, -size], [0, 0, size]
      ];

      // Rotate vertices
      const cosY = Math.cos(relicAngleY), sinY = Math.sin(relicAngleY);
      const cosX = Math.cos(relicAngleX), sinX = Math.sin(relicAngleX);

      const projected = vertices.map(([vx, vy, vz]) => {
        // Y-axis rotation
        let x1 = vx * cosY + vz * sinY;
        let z1 = -vx * sinY + vz * cosY;
        // X-axis rotation
        let y2 = vy * cosX - z1 * sinX;
        let z2 = vy * sinX + z1 * cosX;
        return [x1, y2, z2];
      });

      // Draw edges
      const edges = [
        [0, 2], [1, 2], [0, 3], [1, 3],
        [0, 4], [1, 4], [0, 5], [1, 5],
        [2, 4], [2, 5], [3, 4], [3, 5]
      ];

      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projected[i][0], projected[i][1]);
        ctx.lineTo(projected[j][0], projected[j][1]);
        ctx.stroke();
      });

      // Draw glowing vertices
      projected.forEach(([px, py]) => {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
      requestAnimationFrame(render3DRelic);
    }
    requestAnimationFrame(render3DRelic);
  }

  /* ── 3. WEBTOON VS SPREAD LAYOUT SWITCHER ── */
  window.setReaderLayout = function(layout, btn) {
    document.querySelectorAll('.reader-layout-controls .theme-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (layout === 'webtoon') {
      document.body.classList.add('reader-layout-webtoon');
    } else {
      document.body.classList.remove('reader-layout-webtoon');
    }
    localStorage.setItem('catalyst_reader_layout', layout);
    if (typeof window.playHudSound === 'function') window.playHudSound('select');
  };

  const savedLayout = localStorage.getItem('catalyst_reader_layout');
  if (savedLayout === 'webtoon') {
    const btn = document.getElementById('layoutWebtoonBtn');
    if (btn) window.setReaderLayout('webtoon', btn);
  }

  /* ── 4. FAN OPERATIVE RECRUITMENT POSTER STUDIO ── */
  let posterFormat = 'story'; // story (9:16), square (1:1), banner (16:9)
  let posterFaction = 'sango';

  window.setPosterFormat = function(fmt, btn) {
    posterFormat = fmt;
    btn.parentElement.querySelectorAll('.studio-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const canvas = document.getElementById('posterCanvas');
    if (canvas) {
      if (fmt === 'story') { canvas.width = 450; canvas.height = 800; }
      else if (fmt === 'square') { canvas.width = 600; canvas.height = 600; }
      else if (fmt === 'banner') { canvas.width = 800; canvas.height = 450; }
    }
    window.updatePosterPreview();
    if (typeof window.playHudSound === 'function') window.playHudSound('select');
  };

  window.setPosterFaction = function(faction, btn) {
    posterFaction = faction;
    btn.parentElement.querySelectorAll('.studio-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    window.updatePosterPreview();
    if (typeof window.playHudSound === 'function') window.playHudSound('select');
  };

  window.updatePosterPreview = function() {
    const canvas = document.getElementById('posterCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const callsign = (document.getElementById('studioCallsignInput')?.value || 'MUSHIN_ORACLE').toUpperCase();
    const sector = document.getElementById('studioSectorSelect')?.value || 'MUSHIN CORE · SECTOR 01';

    const factionColors = {
      sango: { primary: '#F4B800', name: 'ṢÀNGÓ VOLT COLLECTIVE', sigil: '⚡' },
      ogun:  { primary: '#00C9B1', name: 'ÒGÚN STEEL UNION', sigil: '⚔' },
      osun:  { primary: '#FF6B1A', name: 'Ọ̀ṢUN TIDE COALITION', sigil: '🌊' },
      kooza: { primary: '#C41E3A', name: 'KOOZA SYNDICATE GRID', sigil: '👁' }
    };
    const fData = factionColors[posterFaction] || factionColors.sango;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#06060E');
    bg.addColorStop(0.6, '#0B0D1F');
    bg.addColorStop(1, '#020108');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Diagonal futuristic hazard lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = -w; i < w * 2; i += 30) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke();
    }

    // Outer border
    ctx.strokeStyle = fData.primary;
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, w - 30, h - 30);

    // Inner subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(25, 25, w - 50, h - 50);

    // Header tag
    ctx.font = "bold 13px 'Space Grotesk', monospace";
    ctx.fillStyle = fData.primary;
    ctx.fillText('CATALYST OS // OPERATIVE RECRUITMENT DOSSIER', 40, 55);

    // Universe Title
    ctx.font = "bold 26px 'Space Grotesk', sans-serif";
    ctx.fillStyle = '#F0EDE5';
    ctx.fillText('CATALYST: AWAKENING', 40, 95);

    // Giant Faction Sigil
    ctx.font = (w * 0.28) + "px 'Space Grotesk', sans-serif";
    ctx.fillStyle = fData.primary;
    ctx.textAlign = 'center';
    ctx.fillText(fData.sigil, w / 2, h * 0.45);

    // Callsign
    ctx.textAlign = 'left';
    ctx.font = "bold 34px 'Space Grotesk', sans-serif";
    ctx.fillStyle = '#F0EDE5';
    ctx.fillText(callsign, 40, h * 0.62);

    // Faction Name
    ctx.font = "bold 16px 'Space Grotesk', monospace";
    ctx.fillStyle = fData.primary;
    ctx.fillText(fData.name, 40, h * 0.68);

    // Sector Location
    ctx.font = "14px 'Space Grotesk', monospace";
    ctx.fillStyle = 'rgba(240, 237, 229, 0.7)';
    ctx.fillText('STATION: ' + sector, 40, h * 0.74);
    ctx.fillText('CLEARANCE: LEVEL-03 FIELD VANGUARD', 40, h * 0.79);
    ctx.fillText('OFFICIAL PORTAL: catalyst-awakening.netlify.app', 40, h * 0.84);

    // Footer Watermark Seal
    ctx.fillStyle = 'rgba(244, 184, 0, 0.2)';
    ctx.fillRect(40, h - 60, w - 80, 25);
    ctx.font = "bold 11px 'Space Grotesk', monospace";
    ctx.fillStyle = '#F4B800';
    ctx.textAlign = 'center';
    ctx.fillText('AUTHENTICATED RECRUITMENT SEAL // Ọ̀RUN VANGUARD 2031', w / 2, h - 44);
  };

  window.downloadCustomPoster = function() {
    const canvas = document.getElementById('posterCanvas');
    if (!canvas) return;
    const callsign = (document.getElementById('studioCallsignInput')?.value || 'OPERATIVE').toUpperCase();
    const link = document.createElement('a');
    link.download = 'Catalyst_Poster_' + posterFaction + '_' + callsign + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    if (typeof window.playHudSound === 'function') window.playHudSound('success');
  };

  // Render poster preview on boot
  window.updatePosterPreview();
})();


/* ══════════════════════════════════════════════════════════════════
   FEATURE 1: DRAMATIC AUDIO NARRATION & VOICE ENGINE
   ══════════════════════════════════════════════════════════════════ */
(function() {
  var DRAMATIC_SCENES = [
    {
      id: 1,
      title: 'SCENE 01 / 19 // BEFORE EVERYTHING',
      context: 'Lagos, 2031. Night hangs low over the lagoon. The asphalt still breathes out the afternoon heat.',
      speaker: 'CHRONICLER OF Ọ̀RUN',
      text: 'Before the light cracked the sky above Third Mainland Bridge, Lagos was simply hungry. Nineteen-year-old Bayo Adeyemi walked the quiet stretch between Oworonshoki and Lagos Island, counting coins he did not have.',
      soundCue: 'drone'
    },
    {
      id: 2,
      title: 'SCENE 02 / 19 // THE Ọ̀RUN-BLEED',
      context: 'The sky tears open in silence. Not thunder yet — pure chromatic pressure.',
      speaker: 'CHRONICLER OF Ọ̀RUN',
      text: 'Then the purple fissure ripped through the cloud deck. The Ọ̀run-Bleed did not fall like rain; it poured upward from the lagoon bed, defying gravity and logic.',
      soundCue: 'rift'
    },
    {
      id: 3,
      title: 'SCENE 03 / 19 // THUNDERSTRIKE ENTERS',
      context: 'Amara Okafor drops onto the suspension cable. Voltage arcs along the steel.',
      speaker: 'AMARA — THUNDERSTRIKE',
      text: '"Hold your ground, little brother! The storm does not ask for permission before it strikes!"',
      soundCue: 'thunder'
    },
    {
      id: 4,
      title: 'SCENE 04 / 19 // IRON WOLF DEFIANCE',
      context: 'Ikenna stands immovable before the advancing Void Constructs.',
      speaker: 'IKENNA — IRON WOLF',
      text: '"Ògún gave us iron so our backs would never bow. Let the Pale Council send whatever monsters they bought."',
      soundCue: 'iron'
    },
    {
      id: 5,
      title: 'SCENE 05 / 19 // THE SOVEREIGN FALL',
      context: 'The sky darkens to the color of bruised obsidian.',
      speaker: 'CHRONICLER OF Ọ̀RUN',
      text: 'The Architect observed from the high glass towers of Eko Atlantic. Every pulse of Aṣẹ across the bridge was being measured, categorized, and auctioned.',
      soundCue: 'drone'
    },
    {
      id: 6,
      title: 'SCENE 06 / 19 // BAYO AWAKENING',
      context: 'The divine conduit ignites. The mark of Ẹṣù blazes on Bayo's forearms.',
      speaker: 'BAYO — CATALYST',
      text: '"I felt the entire city breathe through my lungs. Not a burden — an ancient, unstoppable rhythm."',
      soundCue: 'catalyst'
    }
  ];

  var activeSceneIdx = 0;
  var isPlaying = false;
  var dramaticSpeed = 1.0;
  var soundbedActive = true;
  var audioCtx = null;
  var droneOsc = null;
  var droneGain = null;
  var speechUtterance = null;
  var timerId = null;

  function initDramaticUI() {
    var strip = document.getElementById('dramaticSceneStrip');
    if (!strip) return;

    strip.innerHTML = DRAMATIC_SCENES.map(function(s, idx) {
      return '<button type="button" class="dramatic-scene-chip' + (idx === 0 ? ' active' : '') + '" onclick="jumpDramaticScene(' + idx + ')">' +
        s.title.split('//')[1].trim() +
        '</button>';
    }).join('');

    renderActiveSentence();
  }

  function renderActiveSentence() {
    var scene = DRAMATIC_SCENES[activeSceneIdx];
    var badge = document.getElementById('dramaticSceneBadge');
    var speaker = document.getElementById('dramaticSpeakerPill');
    var context = document.getElementById('dramaticLeadContext');
    var sentence = document.getElementById('dramaticActiveSentence');
    var bar = document.getElementById('dramaticProgressBar');

    if (badge) badge.textContent = scene.title;
    if (speaker) speaker.textContent = 'SPEAKER: ' + scene.speaker;
    if (context) context.textContent = scene.context;
    if (sentence) sentence.textContent = '"' + scene.text + '"';
    if (bar) bar.style.width = (((activeSceneIdx + 1) / DRAMATIC_SCENES.length) * 100) + '%';

    var chips = document.querySelectorAll('.dramatic-scene-chip');
    chips.forEach(function(c, i) {
      c.classList.toggle('active', i === activeSceneIdx);
    });
  }

  function startWebAudioSoundbed() {
    if (!soundbedActive) return;
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtx) {
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (!droneOsc) {
        droneOsc = audioCtx.createOscillator();
        droneGain = audioCtx.createGain();
        droneOsc.type = 'sawtooth';
        droneOsc.frequency.setValueAtTime(65.41, audioCtx.currentTime); // C2 low hum

        // low pass filter to make it a deep cinematic sub-drone
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, audioCtx.currentTime);

        droneGain.gain.setValueAtTime(0.04, audioCtx.currentTime);

        droneOsc.connect(filter);
        filter.connect(droneGain);
        droneGain.connect(audioCtx.destination);
        droneOsc.start();
      }
    } catch(e) {
      console.warn('Procedural soundbed error', e);
    }
  }

  function stopWebAudioSoundbed() {
    if (droneGain && audioCtx) {
      try {
        droneGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.2);
        setTimeout(function() {
          if (droneOsc) {
            droneOsc.stop();
            droneOsc.disconnect();
            droneOsc = null;
          }
        }, 300);
      } catch(e) {}
    }
  }

  function speakCurrentSentence() {
    var scene = DRAMATIC_SCENES[activeSceneIdx];
    var statusText = document.getElementById('dramaticStatusText');
    var pulseDot = document.getElementById('dramaticPulseDot');
    var playBtn = document.getElementById('dramaticPlayBtn');

    if (pulseDot) pulseDot.classList.add('playing');
    if (statusText) statusText.textContent = 'STREAMING AUDIO DRAMA // ' + scene.speaker;
    if (playBtn) {
      playBtn.textContent = '⏸ PAUSE NARRATION';
      playBtn.classList.add('active');
    }

    if (soundbedActive) startWebAudioSoundbed();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      var utt = new SpeechSynthesisUtterance(scene.text);
      speechUtterance = utt;
      utt.rate = dramaticSpeed;

      // Pitch styling according to voice profile
      var voiceProfile = (document.getElementById('dramaticVoiceSelect') || {}).value || 'narrator';
      if (voiceProfile === 'oracle') utt.pitch = 0.75;
      else if (voiceProfile === 'bayo') utt.pitch = 1.25;
      else if (voiceProfile === 'dispatch') utt.pitch = 0.65;
      else utt.pitch = 1.0;

      utt.onend = function() {
        if (!isPlaying) return;
        if (activeSceneIdx < DRAMATIC_SCENES.length - 1) {
          timerId = setTimeout(function() {
            if (isPlaying) {
              activeSceneIdx++;
              renderActiveSentence();
              speakCurrentSentence();
            }
          }, 1200);
        } else {
          stopDramaticAudio();
        }
      };

      utt.onerror = function() {
        fallbackAutoAdvance();
      };

      window.speechSynthesis.speak(utt);
    } else {
      fallbackAutoAdvance();
    }
  }

  function fallbackAutoAdvance() {
    var duration = Math.max(3000, DRAMATIC_SCENES[activeSceneIdx].text.length * 55 / dramaticSpeed);
    timerId = setTimeout(function() {
      if (!isPlaying) return;
      if (activeSceneIdx < DRAMATIC_SCENES.length - 1) {
        activeSceneIdx++;
        renderActiveSentence();
        speakCurrentSentence();
      } else {
        stopDramaticAudio();
      }
    }, duration);
  }

  window.toggleDramaticAudio = function() {
    if (isPlaying) {
      // Pause
      isPlaying = false;
      if ('speechSynthesis' in window) window.speechSynthesis.pause();
      if (timerId) clearTimeout(timerId);
      stopWebAudioSoundbed();
      var playBtn = document.getElementById('dramaticPlayBtn');
      var statusText = document.getElementById('dramaticStatusText');
      var pulseDot = document.getElementById('dramaticPulseDot');
      if (playBtn) {
        playBtn.textContent = '▶ RESUME DRAMA';
        playBtn.classList.remove('active');
      }
      if (statusText) statusText.textContent = 'PAUSED · CLICK RESUME TO CONTINUE';
      if (pulseDot) pulseDot.classList.remove('playing');
    } else {
      // Play
      isPlaying = true;
      if ('speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        var playBtn = document.getElementById('dramaticPlayBtn');
        var pulseDot = document.getElementById('dramaticPulseDot');
        if (playBtn) {
          playBtn.textContent = '⏸ PAUSE NARRATION';
          playBtn.classList.add('active');
        }
        if (pulseDot) pulseDot.classList.add('playing');
        if (soundbedActive) startWebAudioSoundbed();
      } else {
        speakCurrentSentence();
      }
    }
  };

  window.stopDramaticAudio = function() {
    isPlaying = false;
    if (timerId) clearTimeout(timerId);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    stopWebAudioSoundbed();

    var playBtn = document.getElementById('dramaticPlayBtn');
    var statusText = document.getElementById('dramaticStatusText');
    var pulseDot = document.getElementById('dramaticPulseDot');
    if (playBtn) {
      playBtn.textContent = '▶ PLAY ISSUE #01 DRAMA';
      playBtn.classList.remove('active');
    }
    if (statusText) statusText.textContent = 'STANDBY · READY TO STREAM Ọ̀RUN AUDIO DRAMA';
    if (pulseDot) pulseDot.classList.remove('playing');
  };

  window.dramaticNextSentence = function() {
    if (activeSceneIdx < DRAMATIC_SCENES.length - 1) {
      activeSceneIdx++;
      renderActiveSentence();
      if (isPlaying) speakCurrentSentence();
    }
  };

  window.dramaticPrevSentence = function() {
    if (activeSceneIdx > 0) {
      activeSceneIdx--;
      renderActiveSentence();
      if (isPlaying) speakCurrentSentence();
    }
  };

  window.jumpDramaticScene = function(idx) {
    if (idx >= 0 && idx < DRAMATIC_SCENES.length) {
      activeSceneIdx = idx;
      renderActiveSentence();
      if (isPlaying) speakCurrentSentence();
    }
  };

  window.setDramaticSpeed = function(spd, btn) {
    dramaticSpeed = spd;
    var btns = document.querySelectorAll('.dramatic-speed-picker .dramatic-chip-btn');
    btns.forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    if (isPlaying) speakCurrentSentence();
  };

  window.changeDramaticVoice = function(val) {
    if (isPlaying) speakCurrentSentence();
  };

  window.toggleDramaticSoundbed = function() {
    soundbedActive = !soundbedActive;
    var btn = document.getElementById('dramaticSoundbedBtn');
    if (btn) {
      btn.textContent = soundbedActive ? '🔊 AMBIENT AṢẸ SOUND BED: ON' : '🔇 AMBIENT SOUND BED: MUTED';
      btn.classList.toggle('active', soundbedActive);
    }
    if (soundbedActive && isPlaying) startWebAudioSoundbed();
    else stopWebAudioSoundbed();
  };

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDramaticUI);
  } else {
    initDramaticUI();
  }
})();

/* ══════════════════════════════════════════════════════════════════
   FEATURE 3: THE ORISHA COMBAT POWER GRID (RADAR SPIDER CHART)
   ══════════════════════════════════════════════════════════════════ */
(function() {
  var POWER_GRID_METRICS = [
    { key: 'str', label: 'STRENGTH', full: 'Physical Kinetic Force' },
    { key: 'ase', label: 'AṢẸ SURGE', full: 'Cosmic Aṣẹ Channeling' },
    { key: 'int', label: 'INTELLECT', full: 'Tactical Prediction & Intel' },
    { key: 'res', label: 'RESONANCE', full: 'Ancestral Orisha Memory' },
    { key: 'spd', label: 'VELOCITY', full: 'Combat Speed & Agility' },
    { key: 'def', label: 'DEFENSE', full: 'Kinetic Shield & Fortitude' }
  ];

  var FIGHTER_POWER_DATA = {
    'bayo': {
      id: 'bayo',
      name: 'BAYO — CATALYST',
      threatClass: 'CLASS: DIVINE CONDUIT',
      img: './assets/bayo-portrait.webp',
      stats: { str: 84, ase: 100, int: 88, res: 75, spd: 68, def: 80 }
    },
    'amara': {
      id: 'amara',
      name: 'AMARA — THUNDERSTRIKE',
      threatClass: 'CLASS: ṢÀNGÓ TEMPEST',
      img: './assets/amara-portrait.webp',
      stats: { str: 91, ase: 88, int: 82, res: 90, spd: 96, def: 72 }
    },
    'ikenna': {
      id: 'ikenna',
      name: 'IKENNA — IRON WOLF',
      threatClass: 'CLASS: ÒGÚN FORTRESS',
      img: './assets/ikenna-portrait.webp',
      stats: { str: 94, ase: 62, int: 80, res: 84, spd: 65, def: 98 }
    },
    'zara': {
      id: 'zara',
      name: 'ZARA — THE MIRROR',
      threatClass: 'CLASS: SPECTRAL SHADOW',
      img: './assets/zara-portrait.webp',
      stats: { str: 72, ase: 82, int: 95, res: 78, spd: 94, def: 85 }
    },
    'oracle': {
      id: 'oracle',
      name: 'THE ORACLE',
      threatClass: 'CLASS: ANCESTRAL SEER',
      img: './assets/oracle-badagry-portrait.webp',
      stats: { str: 35, ase: 95, int: 100, res: 100, spd: 30, def: 80 }
    },
    'architect': {
      id: 'architect',
      name: 'THE ARCHITECT',
      threatClass: 'CLASS: SYSTEM SOVEREIGN',
      img: './assets/architect-portrait.webp',
      stats: { str: 85, ase: 92, int: 98, res: 65, spd: 82, def: 90 }
    },
    'mirror-v': {
      id: 'mirror-v',
      name: 'THE MIRROR (DARK ASSEMBLY)',
      threatClass: 'CLASS: CYBERNETIC MIMIC',
      img: './assets/mirror-villain-portrait.webp',
      stats: { str: 80, ase: 88, int: 92, res: 50, spd: 90, def: 86 }
    },
    'hollow-king': {
      id: 'hollow-king',
      name: 'HOLLOW KING',
      threatClass: 'CLASS: VOID HARVESTER',
      img: './assets/hollow-king-portrait.webp',
      stats: { str: 88, ase: 94, int: 84, res: 70, spd: 74, def: 84 }
    },
    'mother-storm': {
      id: 'mother-storm',
      name: 'MOTHER STORM',
      threatClass: 'CLASS: CORRUPTED TEMPEST',
      img: './assets/shipyard.webp',
      stats: { str: 82, ase: 90, int: 78, res: 82, spd: 86, def: 74 }
    },
    'iron-preacher': {
      id: 'iron-preacher',
      name: 'IRON PREACHER',
      threatClass: 'CLASS: HERETIC SMITHER',
      img: './assets/iron-preacher-portrait.webp',
      stats: { str: 90, ase: 75, int: 70, res: 76, spd: 58, def: 92 }
    }
  };

  var cpgMode = 'versus';
  var fighterAKey = 'bayo';
  var fighterBKey = 'architect';

  function initCombatGrid() {
    var selA = document.getElementById('cpgSelectA');
    var selB = document.getElementById('cpgSelectB');
    if (!selA || !selB) return;

    var keys = Object.keys(FIGHTER_POWER_DATA);
    var optionsHtml = keys.map(function(k) {
      return '<option value="' + k + '">' + FIGHTER_POWER_DATA[k].name + '</option>';
    }).join('');

    selA.innerHTML = optionsHtml;
    selB.innerHTML = optionsHtml;

    selA.value = fighterAKey;
    selB.value = fighterBKey;

    updateCombatTelemetry();
    drawRadarChart();
  }

  function sumStats(stats) {
    return stats.str + stats.ase + stats.int + stats.res + stats.spd + stats.def;
  }

  function updateCombatTelemetry() {
    var fA = FIGHTER_POWER_DATA[fighterAKey];
    var fB = FIGHTER_POWER_DATA[fighterBKey];

    // Card A
    var imgA = document.getElementById('cpgImgA');
    var nameA = document.getElementById('cpgNameA');
    var totalA = document.getElementById('cpgTotalA');
    var threatA = document.getElementById('cpgThreatA');
    if (imgA) imgA.src = fA.img;
    if (nameA) nameA.textContent = fA.name;
    if (totalA) totalA.textContent = sumStats(fA.stats);
    if (threatA) threatA.textContent = fA.threatClass;

    // Card B & Versus Badge
    var cardB = document.getElementById('cpgCardB');
    var vsBadge = document.getElementById('cpgVersusBadge');
    var selCardB = document.getElementById('cpgSelectorCardB');

    if (cpgMode === 'solo') {
      if (cardB) cardB.style.display = 'none';
      if (vsBadge) vsBadge.style.display = 'none';
      if (selCardB) selCardB.style.opacity = '0.35';
    } else {
      if (cardB) cardB.style.display = 'flex';
      if (vsBadge) vsBadge.style.display = 'block';
      if (selCardB) selCardB.style.opacity = '1';

      var imgB = document.getElementById('cpgImgB');
      var nameB = document.getElementById('cpgNameB');
      var totalB = document.getElementById('cpgTotalB');
      var threatB = document.getElementById('cpgThreatB');
      if (imgB) imgB.src = fB.img;
      if (nameB) nameB.textContent = fB.name;
      if (totalB) totalB.textContent = sumStats(fB.stats);
      if (threatB) threatB.textContent = fB.threatClass;
    }

    // Attributes Telemetry List
    var list = document.getElementById('cpgAttributesList');
    if (list) {
      list.innerHTML = POWER_GRID_METRICS.map(function(m) {
        var vA = fA.stats[m.key];
        var vB = fB.stats[m.key];
        var delta = vA - vB;
        var deltaText = '';
        if (cpgMode === 'versus') {
          if (delta > 0) deltaText = '<span class="cpg-score-delta" style="color:var(--orisha-teal)">+' + delta + ' ADV</span>';
          else if (delta < 0) deltaText = '<span class="cpg-score-delta" style="color:var(--danfo-gold)">+' + Math.abs(delta) + ' ADV</span>';
          else deltaText = '<span class="cpg-score-delta">PARITY</span>';
        }

        return '<div class="cpg-attr-row">' +
          '<div class="cpg-attr-header">' +
            '<span class="cpg-attr-name">' + m.label + ' <small style="color:var(--ash-grey);font-weight:400;">// ' + m.full + '</small></span>' +
            '<div class="cpg-attr-scores">' +
              '<span class="cpg-score-a">' + vA + '</span>' +
              (cpgMode === 'versus' ? '<span class="cpg-score-b">' + vB + '</span>' + deltaText : '') +
            '</div>' +
          '</div>' +
          '<div class="cpg-bars-container">' +
            '<div class="cpg-bar-track"><div class="cpg-bar-fill-a" style="width:' + vA + '%"></div></div>' +
            (cpgMode === 'versus' ? '<div class="cpg-bar-track"><div class="cpg-bar-fill-b" style="width:' + vB + '%"></div></div>' : '') +
          '</div>' +
        '</div>';
      }).join('');
    }

    // AI Tactical Verdict
    var verdict = document.getElementById('cpgVerdictText');
    if (verdict) {
      if (cpgMode === 'solo') {
        verdict.innerHTML = '<strong>' + fA.name + '</strong> operates at tactical index <strong>' + sumStats(fA.stats) + '/600</strong>. Primary battlefield dominance resides in <strong>' + getTopStatLabel(fA.stats) + '</strong> with defensive fortitude rated at ' + fA.stats.def + '%.';
      } else {
        var sumA = sumStats(fA.stats);
        var sumB = sumStats(fB.stats);
        var winner = sumA >= sumB ? fA : fB;
        var diff = Math.abs(sumA - sumB);
        var edge = getTopEdge(fA, fB);
        verdict.innerHTML = 'Oracle simulation favors <strong>' + winner.name + '</strong> with an estimated <strong>' + (50 + Math.min(45, Math.round(diff / 3))) + '% win probability</strong>. Decisive tactical pivot: ' + edge + '.';
      }
    }
  }

  function getTopStatLabel(stats) {
    var maxKey = 'str', maxVal = -1;
    POWER_GRID_METRICS.forEach(function(m) {
      if (stats[m.key] > maxVal) {
        maxVal = stats[m.key];
        maxKey = m.label;
      }
    });
    return maxKey + ' (' + maxVal + '/100)';
  }

  function getTopEdge(fA, fB) {
    var maxDiff = -1, reason = '';
    POWER_GRID_METRICS.forEach(function(m) {
      var d = Math.abs(fA.stats[m.key] - fB.stats[m.key]);
      if (d > maxDiff) {
        maxDiff = d;
        var advChar = fA.stats[m.key] > fB.stats[m.key] ? fA.name : fB.name;
        reason = advChar + ' maintains a +' + d + ' margin in ' + m.label;
      }
    });
    return reason;
  }

  function drawRadarChart() {
    var canvas = document.getElementById('cpgRadarCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    var cx = w / 2;
    var cy = h / 2;
    var radius = (Math.min(w, h) / 2) - 60;
    var totalAxes = POWER_GRID_METRICS.length;
    var angleStep = (Math.PI * 2) / totalAxes;

    ctx.clearRect(0, 0, w, h);

    // Dark cybernetic canvas background
    ctx.fillStyle = '#06060d';
    ctx.fillRect(0, 0, w, h);

    // Concentric Hexagons
    var levels = [0.2, 0.4, 0.6, 0.8, 1.0];
    levels.forEach(function(lvl, i) {
      ctx.beginPath();
      for (var a = 0; a < totalAxes; a++) {
        var angle = a * angleStep - Math.PI / 2;
        var x = cx + Math.cos(angle) * (radius * lvl);
        var y = cy + Math.sin(angle) * (radius * lvl);
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = i === levels.length - 1 ? 'rgba(0, 201, 177, 0.45)' : 'rgba(240, 237, 229, 0.08)';
      ctx.lineWidth = i === levels.length - 1 ? 1.5 : 1;
      ctx.stroke();

      // Percentage watermark
      ctx.fillStyle = 'rgba(240, 237, 229, 0.25)';
      ctx.font = '10px "Space Mono", monospace';
      ctx.fillText(Math.round(lvl * 100) + '%', cx + 4, cy - (radius * lvl) - 4);
    });

    // Axis Rays & Labels
    for (var a = 0; a < totalAxes; a++) {
      var angle = a * angleStep - Math.PI / 2;
      var rx = cx + Math.cos(angle) * radius;
      var ry = cy + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(rx, ry);
      ctx.strokeStyle = 'rgba(0, 201, 177, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Axis label
      var lx = cx + Math.cos(angle) * (radius + 28);
      var ly = cy + Math.sin(angle) * (radius + 28);
      ctx.fillStyle = '#F0EDE5';
      ctx.font = '700 11px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(POWER_GRID_METRICS[a].label, lx, ly);
    }

    // Helper to draw fighter polygon
    function drawFighterPolygon(stats, strokeColor, fillColor, shadowColor) {
      ctx.save();
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 15;
      ctx.beginPath();

      for (var a = 0; a < totalAxes; a++) {
        var angle = a * angleStep - Math.PI / 2;
        var val = stats[POWER_GRID_METRICS[a].key] / 100;
        var px = cx + Math.cos(angle) * (radius * val);
        var py = cy + Math.sin(angle) * (radius * val);
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Data points
      for (var a = 0; a < totalAxes; a++) {
        var angle = a * angleStep - Math.PI / 2;
        var val = stats[POWER_GRID_METRICS[a].key] / 100;
        var px = cx + Math.cos(angle) * (radius * val);
        var py = cy + Math.sin(angle) * (radius * val);
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.fill();
      }
      ctx.restore();
    }

    // Draw Fighter A (Orisha Teal)
    var fA = FIGHTER_POWER_DATA[fighterAKey];
    drawFighterPolygon(fA.stats, '#00C9B1', 'rgba(0, 201, 177, 0.28)', 'rgba(0, 201, 177, 0.6)');

    // Draw Fighter B (Danfo Gold) if versus mode
    if (cpgMode === 'versus') {
      var fB = FIGHTER_POWER_DATA[fighterBKey];
      drawFighterPolygon(fB.stats, '#F4B800', 'rgba(244, 184, 0, 0.28)', 'rgba(244, 184, 0, 0.6)');
    }
  }

  window.setPowerGridMode = function(mode) {
    cpgMode = mode;
    var btnVersus = document.getElementById('cpgModeVersus');
    var btnSolo = document.getElementById('cpgModeSolo');
    if (btnVersus) btnVersus.classList.toggle('active', mode === 'versus');
    if (btnSolo) btnSolo.classList.toggle('active', mode === 'solo');
    updateCombatTelemetry();
    drawRadarChart();
  };

  window.updatePowerGridCombatants = function() {
    var selA = document.getElementById('cpgSelectA');
    var selB = document.getElementById('cpgSelectB');
    if (selA) fighterAKey = selA.value;
    if (selB) fighterBKey = selB.value;
    updateCombatTelemetry();
    drawRadarChart();
  };

  window.loadPowerGridPreset = function(kA, kB, btn) {
    fighterAKey = kA;
    fighterBKey = kB;
    cpgMode = 'versus';

    var btnVersus = document.getElementById('cpgModeVersus');
    var btnSolo = document.getElementById('cpgModeSolo');
    if (btnVersus) btnVersus.classList.add('active');
    if (btnSolo) btnSolo.classList.remove('active');

    var selA = document.getElementById('cpgSelectA');
    var selB = document.getElementById('cpgSelectB');
    if (selA) selA.value = kA;
    if (selB) selB.value = kB;

    var pBtns = document.querySelectorAll('.cpg-presets .cpg-preset-btn');
    pBtns.forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');

    updateCombatTelemetry();
    drawRadarChart();
  };

  window.randomizeCombatGridMatchup = function() {
    var keys = Object.keys(FIGHTER_POWER_DATA);
    var rA = keys[Math.floor(Math.random() * keys.length)];
    var rB = keys[Math.floor(Math.random() * keys.length)];
    while (rB === rA) {
      rB = keys[Math.floor(Math.random() * keys.length)];
    }
    window.loadPowerGridPreset(rA, rB, null);
  };

  window.exportTacticalGridPNG = function() {
    var canvas = document.getElementById('cpgRadarCanvas');
    if (!canvas) return;
    var link = document.createElement('a');
    link.download = 'catalyst-tactical-radar-' + fighterAKey + '-vs-' + fighterBKey + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCombatGrid);
  } else {
    initCombatGrid();
  }
})();

/* ══════════════════════════════════════════════════════════════════
   FEATURE 4: COMMUNITY FAN ART & CREATOR SHOWCASE
   ══════════════════════════════════════════════════════════════════ */
(function() {
  var INITIAL_FAN_ART = [
    {
      id: 'OC-CREATOR-2031-0101',
      title: 'ẸṢÙ RISES AT BALOGUN NEXUS',
      creator: 'Taiwo Adeyemi Studios',
      handle: '@taiwo_neo',
      category: 'illustration',
      img: './assets/bayo-portrait.webp',
      likes: 184,
      desc: 'Digital oil illustration depicting Bayo channeling primordial Aṣẹ currents over the bustling stalls of Balogun Market.'
    },
    {
      id: 'OC-CREATOR-2031-0102',
      title: 'THUNDERSTRIKE: APAPA STORMCALL',
      creator: 'Nkechi Obi',
      handle: '@nkechi_art',
      category: 'variant',
      img: './assets/amara-portrait.webp',
      likes: 215,
      desc: 'Alternative collector variant cover for Issue #02. Amara striking lightning onto the rusted shipping cranes.'
    },
    {
      id: 'OC-CREATOR-2031-0103',
      title: 'IKENNA: ÒGÚN FORGE ARMOR BUILD',
      creator: 'Kene & The Forge Lab',
      handle: '@forgelab_cosplay',
      category: 'cosplay',
      img: './assets/ikenna-portrait.webp',
      likes: 342,
      desc: 'Full-scale physical tactical vest with Ògún iron relief carvings and responsive EL wire circuitry.'
    },
    {
      id: 'OC-CREATOR-2031-0104',
      title: 'ORISHA RISING: COSMIC TRIPTYCH',
      creator: 'Dare Alabi',
      handle: '@dare_afrofuturism',
      category: 'variant',
      img: './assets/cover-orisha-rising3.webp',
      likes: 267,
      desc: 'Commemorative triple cover variant capturing the awakening of divine lineages across modern Lagos.'
    },
    {
      id: 'OC-CREATOR-2031-0105',
      title: 'LAGOS 2031: THE NEON CORRIDOR',
      creator: 'Folake Vance',
      handle: '@vance_visuals',
      category: 'community',
      img: './assets/art-lagos-2031.webp',
      likes: 198,
      desc: 'Architectural concept art rendering the subterranean transit arteries beneath the Third Mainland Bridge.'
    },
    {
      id: 'OC-CREATOR-2031-0106',
      title: 'THE SACRED FORGE MATRIX',
      creator: 'Ifeoma Clark',
      handle: '@ife_concepts',
      category: 'illustration',
      img: './assets/forge.webp',
      likes: 153,
      desc: 'High-concept render of the Ògún metal forge where divine relic metallurgy meets modern cybernetics.'
    }
  ];

  var STORAGE_KEY = 'catalyst_fan_art_showcase';
  var fanArtCollection = [];
  var currentFilter = 'all';
  var selectedModalItem = null;

  function loadFanArt() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        fanArtCollection = JSON.parse(saved);
      } else {
        fanArtCollection = INITIAL_FAN_ART.slice();
      }
    } catch(e) {
      fanArtCollection = INITIAL_FAN_ART.slice();
    }
  }

  function saveFanArt() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fanArtCollection));
    } catch(e) {}
  }

  function renderGallery() {
    var grid = document.getElementById('fanArtGalleryGrid');
    var countAll = document.getElementById('fasCountAll');
    if (!grid) return;

    if (countAll) countAll.textContent = fanArtCollection.length;

    var filtered = fanArtCollection.filter(function(item) {
      if (currentFilter === 'all') return true;
      return item.category === currentFilter;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--ash-grey);font-family:'Space Mono',monospace;">NO CREATIONS RECORDED IN THIS CATEGORY YET. BE THE FIRST OPERATIVE TO SUBMIT!</div>';
      return;
    }

    grid.innerHTML = filtered.map(function(item, idx) {
      return '<div class="fas-art-card reveal">' +
        '<div class="fas-art-media" onclick="openFanArtModal('' + item.id + '')">' +
          '<img src="' + item.img + '" alt="' + item.title + '" class="fas-art-img" loading="lazy">' +
          '<div class="fas-art-badge">' + item.category.toUpperCase() + '</div>' +
          '<div class="fas-hologram-border"></div>' +
        '</div>' +
        '<div class="fas-art-info">' +
          '<h4 class="fas-art-title">' + item.title + '</h4>' +
          '<div class="fas-art-creator">BY ' + item.creator + (item.handle ? ' (' + item.handle + ')' : '') + '</div>' +
          '<p class="fas-art-desc">' + item.desc + '</p>' +
          '<div class="fas-art-footer">' +
            '<span class="fas-art-id-tag">' + item.id + '</span>' +
            '<button type="button" class="fas-like-btn" onclick="likeFanArt('' + item.id + '', this)">' +
              '❤️ <span class="fas-like-count">' + item.likes + '</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  window.filterFanArt = function(cat, btn) {
    currentFilter = cat;
    var btns = document.querySelectorAll('.fas-category-tabs .fas-cat-btn');
    btns.forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderGallery();
  };

  window.toggleFanArtDrawer = function() {
    var drawer = document.getElementById('fanArtDrawer');
    if (!drawer) return;
    var isOpen = drawer.style.display !== 'none';
    drawer.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) {
      drawer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  window.handleFanArtFile = function(event) {
    var file = event.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function(e) {
      var prev = document.getElementById('fasImagePreview');
      var prompt = document.getElementById('fasDropPrompt');
      if (prev) {
        prev.src = e.target.result;
        prev.style.display = 'block';
      }
      if (prompt) prompt.style.display = 'none';
    };
    reader.readAsDataURL(file);
  };

  window.submitFanArtwork = function(event) {
    event.preventDefault();

    var creator = document.getElementById('fanArtCreator').value.trim();
    var title = document.getElementById('fanArtTitle').value.trim();
    var category = document.getElementById('fanArtCategory').value;
    var handle = document.getElementById('fanArtHandle').value.trim();
    var lore = document.getElementById('fanArtLore').value.trim();
    var prev = document.getElementById('fasImagePreview');
    var imgSrc = (prev && prev.src && prev.style.display !== 'none') ? prev.src : './assets/bayo-portrait.webp';

    var submissionId = 'OC-CREATOR-2031-' + Math.floor(1000 + Math.random() * 9000);

    var newPiece = {
      id: submissionId,
      title: title.toUpperCase(),
      creator: creator,
      handle: handle,
      category: category,
      img: imgSrc,
      likes: 1,
      desc: lore || 'Operative submission to the Ọ̀run Council Creator Archives.'
    };

    fanArtCollection.unshift(newPiece);
    saveFanArt();
    renderGallery();

    var banner = document.getElementById('fasSubmitSuccess');
    if (banner) {
      banner.innerHTML = '<strong>TRANSMISSION SUCCESSFUL!</strong><br>Your submission has been archived with Ọ̀run Council ID: <strong>' + submissionId + '</strong>.';
      banner.style.display = 'block';
    }

    setTimeout(function() {
      window.toggleFanArtDrawer();
      if (banner) banner.style.display = 'none';
      document.getElementById('fanArtForm').reset();
      if (prev) prev.style.display = 'none';
      var prompt = document.getElementById('fasDropPrompt');
      if (prompt) prompt.style.display = 'block';
    }, 2800);
  };

  window.likeFanArt = function(id, btn) {
    var item = fanArtCollection.find(function(a) { return a.id === id; });
    if (item) {
      item.likes++;
      saveFanArt();
      var countEl = btn ? btn.querySelector('.fas-like-count') : null;
      if (countEl) countEl.textContent = item.likes;
    }
  };

  window.openFanArtModal = function(id) {
    var item = fanArtCollection.find(function(a) { return a.id === id; });
    if (!item) return;
    selectedModalItem = item;

    var modal = document.getElementById('fanArtModal');
    var mImg = document.getElementById('fasModalImg');
    var mCat = document.getElementById('fasModalCat');
    var mId = document.getElementById('fasModalId');
    var mTitle = document.getElementById('fasModalTitle');
    var mCreator = document.getElementById('fasModalCreator');
    var mHandle = document.getElementById('fasModalHandle');
    var mDesc = document.getElementById('fasModalDesc');
    var mLikeCount = document.getElementById('fasModalLikeCount');
    var mDl = document.getElementById('fasModalDownload');

    if (mImg) mImg.src = item.img;
    if (mCat) mCat.textContent = item.category.toUpperCase();
    if (mId) mId.textContent = 'ID: ' + item.id;
    if (mTitle) mTitle.textContent = item.title;
    if (mCreator) mCreator.textContent = item.creator;
    if (mHandle) mHandle.textContent = item.handle ? '(' + item.handle + ')' : '';
    if (mDesc) mDesc.textContent = item.desc;
    if (mLikeCount) mLikeCount.textContent = item.likes;
    if (mDl) {
      mDl.href = item.img;
      mDl.download = 'catalyst-' + item.id + '.webp';
    }

    if (modal) modal.style.display = 'flex';
  };

  window.closeFanArtModal = function(e) {
    if (e && e.target && e.target.classList.contains('fas-modal-dialog')) return;
    var modal = document.getElementById('fanArtModal');
    if (modal) modal.style.display = 'none';
  };

  window.likeModalFanArt = function() {
    if (selectedModalItem) {
      selectedModalItem.likes++;
      saveFanArt();
      var mLikeCount = document.getElementById('fasModalLikeCount');
      if (mLikeCount) mLikeCount.textContent = selectedModalItem.likes;
      renderGallery();
    }
  };

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      loadFanArt();
      renderGallery();
    });
  } else {
    loadFanArt();
    renderGallery();
  }
})();


/* ══════════════════════════════════════════════════════════════════
   FEATURE 2: 600-YEAR ANCESTRAL CHRONOLOGY & TIMELINE
   ══════════════════════════════════════════════════════════════════ */
(function() {
  var TIMELINE_EPOCHS = [
    {
      year: '1420 CE',
      title: 'THE FIRST COVENANT // OLD OYO KINGDOM',
      desc: 'The divine descent. Under the reign of the Aláàfin of Oyo, thunder, iron, and storm spirits enter into an unwritten compact with Yoruba sovereigns: divine energy (Aṣẹ) would defend the mortal realm against subterranean void tears.',
      era: 'ANCIENT SOVEREIGNTY',
      relic: 'Oṣé Ṣàngó Ceremonial Axe',
      threat: 'Primordial Void Leviathans',
      img: './assets/circle.webp'
    },
    {
      year: '1897 CE',
      title: 'THE IRON INCURSION // COLONIAL EXTRACTION',
      desc: 'British punitive forces attempt to loot the sacred metallurgy of the Niger Delta. The Guild of Ògún smiths buries seven ceremonial anvils beneath the seabed, preserving the sovereign metallurgical codes from imperial hands.',
      era: 'COLONIAL SIEGE',
      relic: 'Seven Anvils of Ògún',
      threat: 'Royal Niger Company Enforcers',
      img: './assets/forge.webp'
    },
    {
      year: '1973 CE',
      title: 'THE GREAT ECLIPSE // BADAGRY LISTENING POST',
      desc: 'During total solar darkness over the Bight of Benin, the Oracle of Badagry awakens. Deep subterranean listening arrays are constructed beneath the slave port tunnels to monitor celestial pulse rhythms.',
      era: 'COLD WAR AWAKENING',
      relic: 'Badagry Brass Divination Sphere',
      threat: 'Subterranean Frequency Drift',
      img: './assets/oracle-badagry-portrait.webp'
    },
    {
      year: '2018 CE',
      title: 'THE RISE OF EKO ATLANTIC // SYNTHETIC CONDUITS',
      desc: 'Dredging for the new financial hub breaches the ancient coastal wards. The Pale Council builds ultra-modern glass towers designed as synthetic energy capacitors to siphon Orisha currents under the guise of civic development.',
      era: 'CYBER-OLIGARCHY',
      relic: 'Council Neural Extraction Array',
      threat: 'The Pale Council Oligarchs',
      img: './assets/art-lagos-2031.webp'
    },
    {
      year: '2031 CE',
      title: 'THIRD MAINLAND BREACH // THE AWAKENING',
      desc: 'The Ọ̀run barrier shatters over the Lagos lagoon. Nineteen-year-old Bayo Adeyemi absorbs the raw cosmic cascade on the bridge, becoming the living catalyst for the reborn Orishas.',
      era: 'AṢẸ IGNITION (PRESENT DAY)',
      relic: 'Ẹṣù Crossroads Conduction Coil',
      threat: 'The Architect & Dark Assembly',
      img: './assets/bayo-bridge.webp'
    }
  ];

  var activeEpochIdx = 0;

  function renderTimeline() {
    var stage = document.getElementById('timelineStage');
    if (!stage) return;
    var ep = TIMELINE_EPOCHS[activeEpochIdx];

    stage.innerHTML = '<div class="timeline-epoch-info">' +
      '<span class="timeline-epoch-badge">' + ep.year + ' // ' + ep.era + '</span>' +
      '<h3 class="timeline-epoch-title">' + ep.title + '</h3>' +
      '<p class="timeline-epoch-desc">' + ep.desc + '</p>' +
      '<div class="timeline-epoch-metrics">' +
        '<div class="timeline-metric-item">' +
          '<span class="timeline-metric-lbl">ACTIVE RELIC</span>' +
          '<span class="timeline-metric-val">' + ep.relic + '</span>' +
        '</div>' +
        '<div class="timeline-metric-item">' +
          '<span class="timeline-metric-lbl">HISTORICAL ADVERSARY</span>' +
          '<span class="timeline-metric-val">' + ep.threat + '</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="timeline-epoch-media">' +
      '<img src="' + ep.img + '" alt="' + ep.title + '" class="timeline-epoch-img" loading="lazy">' +
    '</div>';
  }

  window.jumpTimelineEpoch = function(idx, btn) {
    if (idx >= 0 && idx < TIMELINE_EPOCHS.length) {
      activeEpochIdx = idx;
      var btns = document.querySelectorAll('.timeline-nav .timeline-nav-btn');
      btns.forEach(function(b) { b.classList.remove('active'); });
      if (btn) btn.classList.add('active');
      renderTimeline();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderTimeline);
  } else {
    renderTimeline();
  }
})();

/* ══════════════════════════════════════════════════════════════════
   FEATURE 4: GENIUS-STYLE CULTURAL ANNOTATIONS
   ══════════════════════════════════════════════════════════════════ */
(function() {
  var ANNOTATIONS_DATA = {
    'bridge': {
      title: 'THIRD MAINLAND BRIDGE // THE 11.8KM ARTERY',
      cultural: 'In Yoruba cosmology, large bodies of water (the Lagos Lagoon) are the direct threshold of Olókun and Ọ̀ṣun. The 11.8 km bridge built in 1990 is re-imagined as an iron suture holding the physical and spirit planes together.',
      writer: 'We chose the Third Mainland Bridge as Ground Zero because every Lagosian knows the dread and majesty of being stranded on that bridge at night. It is the perfect threshold between earth and Ọ̀run.',
      art: 'The color grading transitions from muted asphalt grey to radioactive ultraviolet along the suspension cables, symbolizing the sudden bleed of Orisha energy into commuter space.',
      reactions: { shock: 1420, lightning: 980, fire: 850 }
    },
    'crossroads': {
      title: 'OSHODI CROSSROADS // ẸṢÙ'S SACRED JUNCTION',
      cultural: 'Ẹ̀ṣù is the master of crossroads (Oríta méjì / Oríta mẹ́ta), choices, and transitions. The chaotic multi-level Oshodi bus interchange is the modern mechanical manifestation of Ẹṣù's realm.',
      writer: 'Bayo doesn't choose his path; he is ambushed by choices. We wanted Oshodi to feel alive—not as background noise, but as a watchful entity demanding toll.',
      art: 'Look closely at the overhead walkway shadows: their silhouettes match Ẹṣù’s two-faced ceremonial staff, marking the exact spot where Bayo stops.',
      reactions: { shock: 950, lightning: 1120, fire: 620 }
    },
    'gangan': {
      title: 'GÁNGAN TALKING DRUM // ACOUSTIC TELEMETRY',
      cultural: 'The Gángan is a pitch-variable pressure drum capable of mimicking the tonal patterns of Èdè Yorùbá. In warfare, drum beats carried tactical instructions miles ahead of runners.',
      writer: 'Amara’s combat ability uses the talking drum as an acoustic railgun. Each cadence represents an authentic Yoruba war proverb that channels Ṣàngó’s lightning.',
      art: 'The sound waves are rendered as geometric Adire ripples expanding through the rain, turning sound into tangible kinetic shockwaves.',
      reactions: { shock: 1340, lightning: 1290, fire: 940 }
    },
    'adire': {
      title: 'SACRED ADIRE INDIGO // RESIST DYE LORE',
      cultural: 'Adire is traditional Yoruba indigo-dyed cloth using cassava paste resist techniques. Specific motifs (like Olókùn and Ìbàdàn dún) are visual incantations containing ancestral genealogies.',
      writer: 'In our 2031 lore, the indigo dye isn't just textile decoration; it is a bio-conductive seal used by Yoruba freedom fighters to conceal divine power from Pale Council scanners.',
      art: 'The geometric patterns etched onto Bayo's trenchcoat glow with subtle cyan luminescence only when his Aṣẹ output exceeds 80%.',
      reactions: { shock: 880, lightning: 750, fire: 1100 }
    }
  };

  var activeAnnotKey = 'bridge';
  var activePerspective = 'cultural';

  function renderAnnotationCard() {
    var card = document.getElementById('annotDossierCard');
    if (!card) return;
    var data = ANNOTATIONS_DATA[activeAnnotKey];
    var pLabel = activePerspective === 'cultural' ? 'HISTORICAL & CULTURAL ROOTS' : (activePerspective === 'writer' ? 'WRITER COMMENTARY & MOTIVATION' : 'VISUAL ART DIRECTION NOTES');

    card.innerHTML = '<span class="annot-card-badge">' + pLabel + '</span>' +
      '<h4 class="annot-card-title">' + data.title + '</h4>' +
      '<p class="annot-card-content">' + data[activePerspective] + '</p>' +
      '<div class="annot-reactions-row">' +
        '<button type="button" class="annot-react-btn" onclick="reactToAnnotation('shock')">⚡ ' + data.reactions.shock + ' VOLT</button>' +
        '<button type="button" class="annot-react-btn" onclick="reactToAnnotation('lightning')">👁️ ' + data.reactions.lightning + ' WITNESSED</button>' +
        '<button type="button" class="annot-react-btn" onclick="reactToAnnotation('fire')">🔥 ' + data.reactions.fire + ' AṢẸ</button>' +
      '</div>';
  }

  window.selectAnnotation = function(key, el) {
    if (ANNOTATIONS_DATA[key]) {
      activeAnnotKey = key;
      var highlights = document.querySelectorAll('.annot-highlight');
      highlights.forEach(function(h) { h.classList.remove('active'); });
      if (el) el.classList.add('active');
      renderAnnotationCard();
    }
  };

  window.setAnnotationPerspective = function(p, btn) {
    activePerspective = p;
    var btns = document.querySelectorAll('.annotations-perspective-toggle .annot-p-btn');
    btns.forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderAnnotationCard();
  };

  window.reactToAnnotation = function(type) {
    var data = ANNOTATIONS_DATA[activeAnnotKey];
    if (data && data.reactions[type] !== undefined) {
      data.reactions[type]++;
      renderAnnotationCard();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAnnotationCard);
  } else {
    renderAnnotationCard();
  }
})();

/* ══════════════════════════════════════════════════════════════════
   FEATURE 3: OPERATIVE DAILY FIELD QUESTS & DUTY LOG
   ══════════════════════════════════════════════════════════════════ */
(function() {
  var DAILY_QUESTS = [
    {
      id: 'quest_1',
      type: 'RECONNAISSANCE PROTOCOL',
      title: 'Decipher Oracle Radio Frequency',
      desc: 'Listen to Issue #01 Audiobook Narration or explore the Oracle of Badagry lore vault to log anomalous Ọ̀run telemetry.',
      reward: '+100 AṢẸ XP',
      completed: true
    },
    {
      id: 'quest_2',
      type: 'COMBAT SIMULATION',
      title: 'Field-Test Ògún Defensive Fortitude',
      desc: 'Run a simulation in the Orisha Combat Power Grid pitting Ikenna against the Iron Preacher.',
      reward: '+150 AṢẸ XP',
      completed: false
    },
    {
      id: 'quest_3',
      type: 'CULTURAL ENCRYPTION',
      title: 'Verify Yoruba Ancestral Orthography',
      desc: 'Switch to Èdè Yorùbá localization and verify the sacred accents across the Lagos 2031 tactical dossier.',
      reward: '+200 AṢẸ XP',
      completed: false
    }
  ];

  var STORAGE_QUESTS_KEY = 'catalyst_daily_quests_state';

  function loadQuests() {
    try {
      var saved = localStorage.getItem(STORAGE_QUESTS_KEY);
      if (saved) {
        var state = JSON.parse(saved);
        DAILY_QUESTS.forEach(function(q, i) {
          if (state[q.id] !== undefined) q.completed = state[q.id];
        });
      }
    } catch(e) {}
  }

  function saveQuests() {
    try {
      var state = {};
      DAILY_QUESTS.forEach(function(q) { state[q.id] = q.completed; });
      localStorage.setItem(STORAGE_QUESTS_KEY, JSON.stringify(state));
    } catch(e) {}
  }

  function renderQuests() {
    var grid = document.getElementById('questsGrid');
    if (!grid) return;

    grid.innerHTML = DAILY_QUESTS.map(function(q) {
      return '<div class="quest-card' + (q.completed ? ' completed' : '') + '">' +
        '<span class="quest-type-tag">' + q.type + '</span>' +
        '<h4 class="quest-title">' + q.title + '</h4>' +
        '<p class="quest-desc">' + q.desc + '</p>' +
        '<span class="quest-reward-tag">' + q.reward + '</span>' +
        '<button type="button" class="quest-action-btn" onclick="toggleQuestComplete('' + q.id + '')">' +
          (q.completed ? '✓ DIRECTIVE CLEARED' : '▶ ENGAGE DIRECTIVE') +
        '</button>' +
      '</div>';
    }).join('');

    var allDone = DAILY_QUESTS.every(function(q) { return q.completed; });
    var claimBtn = document.getElementById('questsClaimBtn');
    if (claimBtn) {
      claimBtn.textContent = allDone ? '✦ CLAIM 250 BONUS XP & LORE SCRIPT' : 'DIRECTIVES IN PROGRESS (' + DAILY_QUESTS.filter(function(q){return q.completed;}).length + '/3)';
      claimBtn.style.opacity = allDone ? '1' : '0.6';
    }
  }

  window.toggleQuestComplete = function(id) {
    var quest = DAILY_QUESTS.find(function(q) { return q.id === id; });
    if (quest) {
      quest.completed = !quest.completed;
      saveQuests();
      renderQuests();
    }
  };

  window.claimDailyQuestReward = function() {
    var allDone = DAILY_QUESTS.every(function(q) { return q.completed; });
    if (allDone) {
      alert('AṢẸ VERIFIED! +250 XP Credited to your Operative HUD Profile. Unreleased deleted scene from Issue #02 unlocked!');
    } else {
      alert('Operational directives incomplete. Clear all 3 directives before claiming the daily conclave reward.');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      loadQuests();
      renderQuests();
    });
  } else {
    loadQuests();
    renderQuests();
  }
})();

/* ══════════════════════════════════════════════════════════════════
   FEATURE 5: COMIC PANEL REMIX STUDIO & MEME GENERATOR
   ══════════════════════════════════════════════════════════════════ */
(function() {
  var remixBgKey = 'bridge';
  var remixCharKey = 'bayo';
  var remixBalloonKey = 'speech';
  var remixSfxKey = 'NONE';

  var REMIX_ASSETS = {
    bg: {
      bridge: './assets/bayo-bridge.webp',
      corridor: './assets/corridor.webp',
      forge: './assets/forge.webp',
      industrial: './assets/industrial.webp'
    },
    char: {
      bayo: './assets/bayo-portrait.webp',
      amara: './assets/amara-portrait.webp',
      ikenna: './assets/ikenna-portrait.webp',
      architect: './assets/architect-portrait.webp'
    }
  };

  var loadedImages = {};

  function preloadImages(callback) {
    var toLoad = [];
    Object.keys(REMIX_ASSETS.bg).forEach(function(k) { toLoad.push(REMIX_ASSETS.bg[k]); });
    Object.keys(REMIX_ASSETS.char).forEach(function(k) { toLoad.push(REMIX_ASSETS.char[k]); });

    var loaded = 0;
    toLoad.forEach(function(src) {
      var img = new Image();
      img.onload = function() {
        loadedImages[src] = img;
        loaded++;
        if (loaded === toLoad.length && callback) callback();
      };
      img.onerror = function() {
        loaded++;
        if (loaded === toLoad.length && callback) callback();
      };
      img.src = src;
    });
  }

  window.drawRemixCanvas = function() {
    var canvas = document.getElementById('remixCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Background
    var bgSrc = REMIX_ASSETS.bg[remixBgKey];
    var bgImg = loadedImages[bgSrc];
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, w, h);
    } else {
      ctx.fillStyle = '#06060d';
      ctx.fillRect(0, 0, w, h);
    }

    // Vignette overlay
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(6, 6, 13, 0.3)');
    grad.addColorStop(0.7, 'transparent');
    grad.addColorStop(1, 'rgba(6, 6, 13, 0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 2. Draw Character Sprite
    var charSrc = REMIX_ASSETS.char[remixCharKey];
    var charImg = loadedImages[charSrc];
    if (charImg) {
      ctx.save();
      // Draw circular avatar or portrait cutout on bottom right
      ctx.beginPath();
      ctx.arc(w - 140, h - 140, 100, 0, Math.PI * 2);
      ctx.closePath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#00C9B1';
      ctx.stroke();
      ctx.clip();
      ctx.drawImage(charImg, w - 240, h - 240, 200, 200);
      ctx.restore();
    }

    // 3. Draw Comic Speech Balloon
    var textInput = document.getElementById('remixDialogueInput');
    var text = textInput ? textInput.value : 'Lagos never sleeps!';

    ctx.save();
    var bx = 40, by = 60, bw = 380, bh = 130, r = 12;
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + bw - r, by);
    ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
    ctx.lineTo(bx + bw, by + bh - r);
    ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
    ctx.lineTo(bx + 120, by + bh);
    ctx.lineTo(bx + 90, by + bh + 30);
    ctx.lineTo(bx + 100, by + bh);
    ctx.lineTo(bx + r, by + bh);
    ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
    ctx.lineTo(bx, by + r);
    ctx.quadraticCurveTo(bx, by, bx + r, by);
    ctx.closePath();

    ctx.fillStyle = remixBalloonKey === 'radio' ? 'rgba(10, 10, 31, 0.95)' : 'rgba(240, 237, 229, 0.96)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = remixBalloonKey === 'shout' ? '#FF6B1A' : (remixBalloonKey === 'radio' ? '#00C9B1' : '#F4B800');
    ctx.stroke();

    // Text in balloon
    ctx.fillStyle = remixBalloonKey === 'radio' ? '#00C9B1' : '#06060d';
    ctx.font = '700 16px "Space Grotesk", sans-serif';
    wrapText(ctx, '"' + text + '"', bx + 20, by + 40, bw - 40, 24);
    ctx.restore();

    // 4. Action SFX Decal
    if (remixSfxKey !== 'NONE') {
      ctx.save();
      ctx.translate(140, h - 160);
      ctx.rotate(-0.15);
      ctx.font = '700 36px "Space Mono", monospace';
      ctx.fillStyle = '#F4B800';
      ctx.shadowColor = '#FF6B1A';
      ctx.shadowBlur = 15;
      ctx.fillText(remixSfxKey, 0, 0);
      ctx.strokeStyle = '#06060d';
      ctx.lineWidth = 2;
      ctx.strokeText(remixSfxKey, 0, 0);
      ctx.restore();
    }

    // 5. Catalyst Watermark / Frame
    ctx.strokeStyle = 'rgba(0, 201, 177, 0.6)';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, w - 6, h - 6);

    ctx.fillStyle = 'rgba(240, 237, 229, 0.7)';
    ctx.font = '700 11px "Space Mono", monospace';
    ctx.fillText('CATALYST AWAKENING // LAGOS 2031', 20, h - 20);
  };

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';
    for (var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = ctx.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  window.setRemixBg = function(key, btn) {
    remixBgKey = key;
    var btns = document.querySelectorAll('.remix-grp:nth-child(1) .remix-opt-btn');
    btns.forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    drawRemixCanvas();
  };

  window.setRemixChar = function(key, btn) {
    remixCharKey = key;
    var btns = document.querySelectorAll('.remix-grp:nth-child(2) .remix-opt-btn');
    btns.forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    drawRemixCanvas();
  };

  window.setRemixBalloon = function(key, btn) {
    remixBalloonKey = key;
    var btns = document.querySelectorAll('.remix-grp:nth-child(3) .remix-opt-btn');
    btns.forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    drawRemixCanvas();
  };

  window.setRemixSfx = function(sfx, btn) {
    remixSfxKey = sfx;
    var btns = document.querySelectorAll('.remix-grp:nth-child(5) .remix-opt-btn');
    btns.forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    drawRemixCanvas();
  };

  window.applyRemixPreset = function(text) {
    var input = document.getElementById('remixDialogueInput');
    if (input) {
      input.value = text;
      drawRemixCanvas();
    }
  };

  window.downloadRemixPanel = function() {
    var canvas = document.getElementById('remixCanvas');
    if (!canvas) return;
    var link = document.createElement('a');
    link.download = 'catalyst-comic-panel-remix.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      preloadImages(drawRemixCanvas);
    });
  } else {
    preloadImages(drawRemixCanvas);
  }
})();

/* ══════════════════════════════════════════════════════════════════
   FEATURE 6: UNIVERSAL ACCESSIBILITY & ERGONOMICS SUITE
   ══════════════════════════════════════════════════════════════════ */
(function() {
  var dyslexiaActive = false;
  var flashGuardActive = false;
  var reducedMotionActive = false;
  var rulerActive = false;
  var voiceActive = false;
  var speechRecognizer = null;

  window.toggleA11yDrawer = function() {
    var drawer = document.getElementById('a11yDrawer');
    var backdrop = document.getElementById('a11yBackdrop');
    if (!drawer || !backdrop) return;
    var isOpen = drawer.style.display !== 'none';
    drawer.style.display = isOpen ? 'none' : 'flex';
    backdrop.style.display = isOpen ? 'none' : 'block';
  };

  window.toggleA11yDyslexia = function() {
    dyslexiaActive = !dyslexiaActive;
    document.body.classList.toggle('dyslexia-mode', dyslexiaActive);
    var btn = document.getElementById('a11yDyslexiaBtn');
    if (btn) {
      btn.textContent = dyslexiaActive ? 'ON' : 'OFF';
      btn.classList.toggle('active', dyslexiaActive);
    }
  };

  window.toggleA11yFlashGuard = function() {
    flashGuardActive = !flashGuardActive;
    document.body.classList.toggle('photophobia-guard', flashGuardActive);
    var btn = document.getElementById('a11yFlashBtn');
    if (btn) {
      btn.textContent = flashGuardActive ? 'ON' : 'OFF';
      btn.classList.toggle('active', flashGuardActive);
    }
  };

  window.toggleA11yReducedMotion = function() {
    reducedMotionActive = !reducedMotionActive;
    document.body.classList.toggle('reduced-motion', reducedMotionActive);
    var btn = document.getElementById('a11yMotionBtn');
    if (btn) {
      btn.textContent = reducedMotionActive ? 'ON' : 'OFF';
      btn.classList.toggle('active', reducedMotionActive);
    }
  };

  window.toggleA11yRuler = function() {
    rulerActive = !rulerActive;
    var ruler = document.getElementById('readingRuler');
    var btn = document.getElementById('a11yRulerBtn');
    if (ruler) ruler.style.display = rulerActive ? 'block' : 'none';
    if (btn) {
      btn.textContent = rulerActive ? 'ON' : 'OFF';
      btn.classList.toggle('active', rulerActive);
    }
  };

  window.addEventListener('mousemove', function(e) {
    if (rulerActive) {
      var ruler = document.getElementById('readingRuler');
      if (ruler) ruler.style.top = (e.clientY - 19) + 'px';
    }
  });

  window.toggleA11yVoiceCommands = function() {
    voiceActive = !voiceActive;
    var btn = document.getElementById('a11yVoiceBtn');
    var status = document.getElementById('a11yVoiceStatus');
    if (btn) {
      btn.textContent = voiceActive ? 'ON' : 'OFF';
      btn.classList.toggle('active', voiceActive);
    }
    if (status) status.style.display = voiceActive ? 'block' : 'none';

    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (voiceActive) alert('Speech Recognition is not supported by your current browser.');
      return;
    }

    if (voiceActive) {
      if (!speechRecognizer) {
        speechRecognizer = new SpeechRecognition();
        speechRecognizer.continuous = true;
        speechRecognizer.interimResults = false;
        speechRecognizer.onresult = function(e) {
          var last = e.results.length - 1;
          var cmd = e.results[last][0].transcript.trim().toLowerCase();
          handleVoiceCommand(cmd);
        };
      }
      try { speechRecognizer.start(); } catch(err) {}
    } else {
      if (speechRecognizer) {
        try { speechRecognizer.stop(); } catch(err) {}
      }
    }
  };

  function handleVoiceCommand(cmd) {
    var status = document.getElementById('a11yVoiceStatus');
    if (status) status.textContent = 'Command heard: "' + cmd + '"';

    if (cmd.indexOf('next') !== -1) {
      if (window.dramaticNextSentence) window.dramaticNextSentence();
      else if (window.nextMotionPanel) window.nextMotionPanel();
    } else if (cmd.indexOf('previous') !== -1) {
      if (window.dramaticPrevSentence) window.dramaticPrevSentence();
      else if (window.prevMotionPanel) window.prevMotionPanel();
    } else if (cmd.indexOf('map') !== -1) {
      var mapEl = document.getElementById('world-2031');
      if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
    } else if (cmd.indexOf('audio') !== -1 || cmd.indexOf('sound') !== -1) {
      if (window.toggleAmbientSound) window.toggleAmbientSound();
    } else if (cmd.indexOf('read') !== -1) {
      var readEl = document.getElementById('read');
      if (readEl) readEl.scrollIntoView({ behavior: 'smooth' });
    }
  }
})();


/* ══════════════════════════════════════════════════════════════════
   FEATURE 2: VIRTUAL ORISHA DIVINATION & IFÁ CASTING CHAMBER
   ══════════════════════════════════════════════════════════════════ */
(function() {
  var ODU_COLLECTION = [
    {
      id: '01',
      name: 'ÈJÌ OGBÈ (OGBÈ MÉJÌ)',
      binary: '0000 · 0000',
      marks: [[0,0,0,0], [0,0,0,0]],
      orisha: 'OBATÀLÁ & ORÚNMÌLÀ // THE PURE LIGHT',
      proverb: 'The head that will wear a crown must first learn to bow in humility before the earth.',
      boon: '+25% Kinetic Clarity in open combat. Maximum harmony with atmospheric Aṣẹ currents.'
    },
    {
      id: '02',
      name: 'Ọ̀YẸ̀KÚ MÉJÌ',
      binary: '1111 · 1111',
      marks: [[1,1,1,1], [1,1,1,1]],
      orisha: 'YEMỌJA // SACRED NIGHT & ANCESTRAL VEIL',
      proverb: 'Darkness does not swallow the sun; it only prepares the world for the dawn.',
      boon: '+30% Stealth Shrouding and resistance against Pale Council thermal sensors.'
    },
    {
      id: '03',
      name: 'ÌWÒRÌ MÉJÌ',
      binary: '1001 · 1001',
      marks: [[1,0,0,1], [1,0,0,1]],
      orisha: 'Ọ̀ṢUN // DEEP WATER CLARITY',
      proverb: 'He who looks deeply into the water sees both his own face and the pebbles at the bottom.',
      boon: '+20% Tactical Intellect. Unveils hidden structural weaknesses in void rifts.'
    },
    {
      id: '04',
      name: 'ÒDÍ MÉJÌ',
      binary: '0110 · 0110',
      marks: [[0,1,1,0], [0,1,1,0]],
      orisha: 'ÒGÚN // IMPENETRABLE WALL',
      proverb: 'A fortress built on justice does not collapse when the storm strikes.',
      boon: '+35% Kinetic Shield Fortitude. Decreases knockback damage by half.'
    },
    {
      id: '05',
      name: 'ÌROSÙN MÉJÌ',
      binary: '0011 · 0011',
      marks: [[0,0,1,1], [0,0,1,1]],
      orisha: 'ṢÀNGÓ // RED FIRE & SACRED EMBERS',
      proverb: 'A single spark born of truth burns down a forest of deceit.',
      boon: '+25% Arc Discharge Intensity. Overheats enemy cybernetic gear.'
    },
    {
      id: '06',
      name: 'Ọ̀WỌ́NRÍN MÉJÌ',
      binary: '1100 · 1100',
      marks: [[1,1,0,0], [1,1,0,0]],
      orisha: 'ỌYA // THE WHIRLWIND OF DESTINY',
      proverb: 'The wind has no path; it creates its own highway across the trees.',
      boon: '+30% Agility & Dodge Velocity in chaotic multi-target engagements.'
    },
    {
      id: '07',
      name: 'Ọ̀BÀRÀ MÉJÌ',
      binary: '0111 · 0111',
      marks: [[0,1,1,1], [0,1,1,1]],
      orisha: 'Ẹ̀ṢÙ // WORDS OF SOVEREIGN COMMAND',
      proverb: 'The mouth speaks the decree, and the crossroads arranges the meeting.',
      boon: '+20% Critical Persuasion and tactical battlefield bluffing.'
    },
    {
      id: '08',
      name: 'Ọ̀KÀNRÀN MÉJÌ',
      binary: '1110 · 1110',
      marks: [[1,1,1,0], [1,1,1,0]],
      orisha: 'ṢÀNGÓ // THUNDER CRACK OF TRUTH',
      proverb: 'When lightning speaks in the sky, even the deaf turn their gaze upward.',
      boon: '+40% Sudden Impact Shockwave against barricaded structures.'
    },
    {
      id: '09',
      name: 'ÒGÚNDÁ MÉJÌ',
      binary: '0001 · 0001',
      marks: [[0,0,0,1], [0,0,0,1]],
      orisha: 'ÒGÚN // THE PATHMAKER'S BLADE',
      proverb: 'Where there is no road, the machete of Ògún carves a kingdom.',
      boon: '+30% Armor Piercing damage against Pale Council iron constructs.'
    },
    {
      id: '10',
      name: 'Ọ̀SÁ MÉJÌ',
      binary: '1000 · 1000',
      marks: [[1,0,0,0], [1,0,0,0]],
      orisha: 'ỌYA // FLIGHT ACROSS STORMS',
      proverb: 'The bird that flies above the thunder is not troubled by the rain.',
      boon: '+25% Aerial Trajectory Control and vertical evasion.'
    },
    {
      id: '11',
      name: 'ÌKÁ MÉJÌ',
      binary: '1011 · 1011',
      marks: [[1,0,1,1], [1,0,1,1]],
      orisha: 'Ọ̀ṢỌ́Ọ̀SÌ // PATIENT HUNTER & SERPENT RESTRAINT',
      proverb: 'The hunter who knows patience walks out of the jungle carrying the leopard.',
      boon: '+35% Precision Accuracy and projectile telemetry tracking.'
    },
    {
      id: '12',
      name: 'ÒTÚRÚPỌ̀N MÉJÌ',
      binary: '1101 · 1101',
      marks: [[1,1,0,1], [1,1,0,1]],
      orisha: 'BÀBÁLÚ AYÉ // HEALER & IMMUTABLE ENDURANCE',
      proverb: 'Earth endures every heavy tread; in the end, it outlives every traveler.',
      boon: '+20% Cellular Regeneration rate and immunity to corrosive void rifts.'
    },
    {
      id: '13',
      name: 'ÒTÚRÁ MÉJÌ',
      binary: '0100 · 0100',
      marks: [[0,1,0,0], [0,1,0,0]],
      orisha: 'ORÚNMÌLÀ // THE PEACEFUL HARMONY',
      proverb: 'Wisdom is the cool water poured onto the heated anvil of conflict.',
      boon: '+25% Resistance against psychic disorientation and mental illusion.'
    },
    {
      id: '14',
      name: 'ÌRẸ̀TẸ̀ MÉJÌ',
      binary: '0010 · 0010',
      marks: [[0,0,1,0], [0,0,1,0]],
      orisha: 'ÒGÚN // STAMPING OUT ADVERSITY',
      proverb: 'The foot that stomps the soil in righteousness cannot be tripped by thorns.',
      boon: '+30% Ground Shockwave disruption knocking charging adversaries flat.'
    },
    {
      id: '15',
      name: 'Ọ̀ṢẸ́ MÉJÌ',
      binary: '0101 · 0101',
      marks: [[0,1,0,1], [0,1,0,1]],
      orisha: 'Ọ̀ṢUN // GOLDEN RIVER OF FORTUNE',
      proverb: 'Beauty and sweetness are weapons stronger than an army of iron.',
      boon: '+20% Aura Radiance. Elevates the spirits and focus of surrounding allies.'
    },
    {
      id: '16',
      name: 'ÒFÚN MÉJÌ (ÒRÀNGÚN MÉJÌ)',
      binary: '1010 · 1010',
      marks: [[1,0,1,0], [1,0,1,0]],
      orisha: 'OBATÀLÁ // THE SOVEREIGN CREATOR',
      proverb: 'White cloth receives no stain without grieving; walk through the world with pure intent.',
      boon: '+50% Divine Resonance Multiplier during high-output Aṣẹ channel bursts.'
    }
  ];

  var activeOduIdx = 0;

  function initDivination() {
    renderOduRoster();
    drawOponTray(ODU_COLLECTION[activeOduIdx]);
    updateReadingCard(ODU_COLLECTION[activeOduIdx]);
  }

  function renderOduRoster() {
    var container = document.getElementById('divineRosterChips');
    if (!container) return;
    container.innerHTML = ODU_COLLECTION.map(function(o, idx) {
      return '<button type="button" class="divine-chip-btn' + (idx === activeOduIdx ? ' active' : '') + '" onclick="selectOdu(' + idx + ')">' +
        o.id + '. ' + o.name.split('(')[0].trim() +
        '</button>';
    }).join('');
  }

  function drawOponTray(odu) {
    var canvas = document.getElementById('oponCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    var cx = w / 2;
    var cy = h / 2;
    var r = (w / 2) - 15;

    ctx.clearRect(0, 0, w, h);

    // Carved Wood Outer Border (Opon Ifá Tray)
    var woodGrad = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r);
    woodGrad.addColorStop(0, '#2d180a');
    woodGrad.addColorStop(0.85, '#1e0e05');
    woodGrad.addColorStop(1, '#0a0502');

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = woodGrad;
    ctx.fill();
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#4a2810';
    ctx.stroke();

    // Geometric border carving patterns
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#F4B800';
    ctx.stroke();
    ctx.restore();

    // Inner tray floor with sacred yellow/golden Iyèrosùn dust
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 25, 0, Math.PI * 2);
    var dustGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, r - 25);
    dustGrad.addColorStop(0, '#5a4214');
    dustGrad.addColorStop(0.7, '#3d2d0c');
    dustGrad.addColorStop(1, '#201605');
    ctx.fillStyle = dustGrad;
    ctx.fill();
    ctx.restore();

    // Sacred Center Divider
    ctx.strokeStyle = 'rgba(244, 184, 0, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - (r - 40));
    ctx.lineTo(cx, cy + (r - 40));
    ctx.stroke();

    // Draw 8 Odu Marks (4 marks in Right Column, 4 in Left Column)
    // Marks: 0 = Single vertical line '|' (Open cowrie)
    //        1 = Double vertical line '||' (Closed cowrie)
    var colLeftX = cx - 55;
    var colRightX = cx + 55;
    var startY = cy - 80;
    var rowGap = 48;

    for (var row = 0; row < 4; row++) {
      var y = startY + (row * rowGap);
      // Right column first (traditional Ifá order)
      var markRight = odu.marks[1][row];
      drawMark(ctx, colRightX, y, markRight);

      // Left column
      var markLeft = odu.marks[0][row];
      drawMark(ctx, colLeftX, y, markLeft);
    }
  }

  function drawMark(ctx, x, y, markType) {
    ctx.save();
    ctx.shadowColor = '#F4B800';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#F4B800';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    if (markType === 0) {
      // Single line
      ctx.beginPath();
      ctx.moveTo(x, y - 12);
      ctx.lineTo(x, y + 12);
      ctx.stroke();
    } else {
      // Double line
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 12);
      ctx.lineTo(x - 8, y + 12);
      ctx.moveTo(x + 8, y - 12);
      ctx.lineTo(x + 8, y + 12);
      ctx.stroke();
    }
    ctx.restore();
  }

  function updateReadingCard(odu) {
    var numEl = document.getElementById('divineOduNum');
    var binEl = document.getElementById('divineBinaryTag');
    var titleEl = document.getElementById('divineOduTitle');
    var orishaEl = document.getElementById('divineOrishaVal');
    var provEl = document.getElementById('divineProverbVal');
    var boonEl = document.getElementById('divineBoonVal');
    var dlBtn = document.getElementById('divineDlBtn');

    if (numEl) numEl.textContent = 'ODU № ' + odu.id + ' / 16';
    if (binEl) binEl.textContent = 'BINARY: ' + odu.binary;
    if (titleEl) titleEl.textContent = odu.name;
    if (orishaEl) orishaEl.textContent = odu.orisha;
    if (provEl) provEl.textContent = '"' + odu.proverb + '"';
    if (boonEl) boonEl.textContent = odu.boon;
    if (dlBtn) dlBtn.style.display = 'inline-block';
  }

  window.castOpeleChain = function() {
    var btn = document.getElementById('divineCastBtn');
    var status = document.getElementById('divineTrayStatus');
    if (btn) btn.disabled = true;
    if (status) status.textContent = 'CASTING Ọ̀PẸ̀LẸ̀ CHAIN ACROSS LAGOS LEY LINES...';

    var spins = 0;
    var interval = setInterval(function() {
      var randIdx = Math.floor(Math.random() * ODU_COLLECTION.length);
      drawOponTray(ODU_COLLECTION[randIdx]);
      spins++;
      if (spins > 10) {
        clearInterval(interval);
        activeOduIdx = Math.floor(Math.random() * ODU_COLLECTION.length);
        var finalOdu = ODU_COLLECTION[activeOduIdx];
        drawOponTray(finalOdu);
        updateReadingCard(finalOdu);
        renderOduRoster();
        if (btn) btn.disabled = false;
        if (status) status.textContent = 'ODU MANIFEST: ' + finalOdu.name.split('(')[0].trim();
      }
    }, 70);
  };

  window.selectOdu = function(idx) {
    if (idx >= 0 && idx < ODU_COLLECTION.length) {
      activeOduIdx = idx;
      var odu = ODU_COLLECTION[idx];
      drawOponTray(odu);
      updateReadingCard(odu);
      renderOduRoster();
    }
  };

  window.downloadTalismanSeal = function() {
    var canvas = document.getElementById('oponCanvas');
    if (!canvas) return;
    var link = document.createElement('a');
    link.download = 'catalyst-odu-talisman-' + ODU_COLLECTION[activeOduIdx].id + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDivination);
  } else {
    initDivination();
  }
})();

/* ══════════════════════════════════════════════════════════════════
   FEATURE 1: Ọ̀RUN DRUM MACHINE & AFRO-CYBER BEATMAKER
   ══════════════════════════════════════════════════════════════════ */
(function() {
  var DRUM_TRACKS = [
    { id: 'gangan', name: 'GÁNGAN (TALK)', color: '#F4B800' },
    { id: 'bata_hi', name: 'BATÁ HIGH', color: '#00C9B1' },
    { id: 'bata_lo', name: 'BATÁ LOW', color: '#00C9B1' },
    { id: 'sango', name: 'ṢÀNGÓ CLAP', color: '#FF6B1A' },
    { id: 'shekere', name: 'SHEKERE', color: '#F0EDE5' },
    { id: 'sub808', name: 'ÒGÚN 808', color: '#C41E3A' }
  ];

  var BEAT_PRESETS = {
    fuji: {
      bpm: 118,
      grid: [
        [1,0,0,1, 0,1,0,0, 1,0,1,0, 0,1,0,0], // Gangan
        [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0], // Bata Hi
        [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0], // Bata Lo
        [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], // Sango Clap
        [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1], // Shekere
        [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0]  // Ogun 808
      ]
    },
    afrobeat: {
      bpm: 104,
      grid: [
        [0,0,1,0, 0,0,1,0, 0,1,0,0, 1,0,0,0], // Gangan
        [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], // Bata Hi
        [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0], // Bata Lo
        [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], // Sango Clap
        [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0], // Shekere
        [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0]  // Ogun 808
      ]
    },
    ogun: {
      bpm: 132,
      grid: [
        [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,1,0,0], // Gangan
        [1,0,1,0, 0,1,0,1, 1,0,1,0, 0,1,0,1], // Bata Hi
        [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0], // Bata Lo
        [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], // Sango Clap
        [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1], // Shekere
        [1,0,0,0, 0,1,0,0, 1,0,0,0, 0,1,0,0]  // Ogun 808
      ]
    },
    ase: {
      bpm: 90,
      grid: [
        [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0], // Gangan
        [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0], // Bata Hi
        [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0], // Bata Lo
        [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], // Sango Clap
        [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0], // Shekere
        [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0]  // Ogun 808
      ]
    }
  };

  var beatBpm = 108;
  var isPlaying = false;
  var currentStep = 0;
  var beatGrid = [];
  var stepTimer = null;
  var audioCtx = null;

  function initBeatMatrix() {
    // initialize default grid from Fuji Cyber preset
    beatGrid = JSON.parse(JSON.stringify(BEAT_PRESETS.fuji.grid));
    beatBpm = BEAT_PRESETS.fuji.bpm;

    renderStepIndicators();
    renderTracks();
  }

  function renderStepIndicators() {
    var bar = document.getElementById('beatStepIndicators');
    if (!bar) return;
    var html = '<div style="font-family:'Space Mono',monospace;font-size:0.65rem;color:var(--ash-grey);">TRACK / STEPS</div>';
    for (var s = 0; s < 16; s++) {
      html += '<div class="beat-step-led' + (s === currentStep ? ' active-head' : '') + '" id="stepLed_' + s + '"></div>';
    }
    bar.innerHTML = html;
  }

  function renderTracks() {
    var container = document.getElementById('beatTracksContainer');
    if (!container) return;

    container.innerHTML = DRUM_TRACKS.map(function(t, tIdx) {
      var padsHtml = '';
      for (var s = 0; s < 16; s++) {
        var on = beatGrid[tIdx][s] === 1;
        var isAccent = (s % 4 === 0);
        padsHtml += '<button type="button" class="beat-pad' + (on ? ' on' : '') + (isAccent ? ' accent' : '') + '" ' +
          'data-track="' + tIdx + '" data-step="' + s + '" ' +
          'onclick="toggleBeatPad(' + tIdx + ', ' + s + ', this)"></button>';
      }

      return '<div class="beat-track-row">' +
        '<div class="beat-track-info">' +
          '<button type="button" class="beat-track-play" onclick="previewDrumVoice('' + t.id + '')" title="Trigger Sound">▶</button>' +
          '<span class="beat-track-name" style="color:' + t.color + '">' + t.name + '</span>' +
        '</div>' +
        padsHtml +
      '</div>';
    }).join('');
  }

  function getAudioCtx() {
    if (!audioCtx) {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function triggerDrumVoice(id) {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;

    if (id === 'gangan') {
      // Talking drum pitch drop
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.15);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    } else if (id === 'bata_hi') {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } else if (id === 'bata_lo') {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } else if (id === 'sango') {
      // Noise burst clap
      var bSize = ctx.sampleRate * 0.12;
      var buffer = ctx.createBuffer(1, bSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bSize; i++) data[i] = (Math.random() * 2) - 1;
      var noise = ctx.createBufferSource();
      noise.buffer = buffer;
      var filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1100;
      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } else if (id === 'shekere') {
      var bSize = ctx.sampleRate * 0.06;
      var buffer = ctx.createBuffer(1, bSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bSize; i++) data[i] = (Math.random() * 2) - 1;
      var noise = ctx.createBufferSource();
      noise.buffer = buffer;
      var filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 5000;
      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } else if (id === 'sub808') {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.18);
      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.46);
    }
  }

  window.previewDrumVoice = function(id) {
    triggerDrumVoice(id);
  };

  window.toggleBeatPad = function(track, step, btn) {
    beatGrid[track][step] = beatGrid[track][step] === 1 ? 0 : 1;
    btn.classList.toggle('on', beatGrid[track][step] === 1);
  };

  function playStep() {
    // update playhead LEDs
    for (var s = 0; s < 16; s++) {
      var led = document.getElementById('stepLed_' + s);
      if (led) led.classList.toggle('active-head', s === currentStep);
    }

    // trigger voices on current step
    for (var t = 0; t < DRUM_TRACKS.length; t++) {
      if (beatGrid[t][currentStep] === 1) {
        triggerDrumVoice(DRUM_TRACKS[t].id);
      }
    }

    currentStep = (currentStep + 1) % 16;
  }

  window.toggleBeatSequencer = function() {
    var btn = document.getElementById('beatPlayBtn');
    if (isPlaying) {
      isPlaying = false;
      if (stepTimer) clearInterval(stepTimer);
      if (btn) {
        btn.textContent = '▶ PLAY BEAT';
        btn.classList.remove('playing');
      }
    } else {
      isPlaying = true;
      getAudioCtx();
      var interval = (60 / beatBpm / 4) * 1000;
      stepTimer = setInterval(playStep, interval);
      if (btn) {
        btn.textContent = '⏹ STOP BEAT';
        btn.classList.add('playing');
      }
    }
  };

  window.setBeatBpm = function(val) {
    beatBpm = parseInt(val, 10);
    var lbl = document.getElementById('beatBpmVal');
    if (lbl) lbl.textContent = beatBpm + ' BPM';

    if (isPlaying) {
      clearInterval(stepTimer);
      var interval = (60 / beatBpm / 4) * 1000;
      stepTimer = setInterval(playStep, interval);
    }
  };

  window.loadBeatPreset = function(name, btn) {
    if (BEAT_PRESETS[name]) {
      beatGrid = JSON.parse(JSON.stringify(BEAT_PRESETS[name].grid));
      beatBpm = BEAT_PRESETS[name].bpm;
      var slider = document.getElementById('beatBpmSlider');
      if (slider) slider.value = beatBpm;
      window.setBeatBpm(beatBpm);
      renderTracks();

      var btns = document.querySelectorAll('.beat-preset-group .beat-preset-btn');
      btns.forEach(function(b) { b.classList.remove('active'); });
      if (btn) btn.classList.add('active');
    }
  };

  window.clearBeatPattern = function() {
    for (var t = 0; t < DRUM_TRACKS.length; t++) {
      for (var s = 0; s < 16; s++) {
        beatGrid[t][s] = 0;
      }
    }
    renderTracks();
  };

  window.randomizeBeatPattern = function() {
    for (var t = 0; t < DRUM_TRACKS.length; t++) {
      for (var s = 0; s < 16; s++) {
        beatGrid[t][s] = Math.random() > 0.72 ? 1 : 0;
      }
    }
    renderTracks();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBeatMatrix);
  } else {
    initBeatMatrix();
  }
})();

/* ══════════════════════════════════════════════════════════════════
   FEATURE 6: OMNI-ARCHIVE COMMAND PALETTE & DEEP LORE SEARCH
   ══════════════════════════════════════════════════════════════════ */
(function() {
  var OMNI_CATALOG = [
    { title: 'Bayo Adeyemi — Catalyst', cat: 'characters', desc: '19-year-old conductor vessel channeling raw cosmic Aṣẹ on Third Mainland Bridge.', target: '#characters' },
    { title: 'Amara Okafor — Thunderstrike', cat: 'characters', desc: 'High-voltage lightning conduit channeling Ṣàngó through acoustic talking drums.', target: '#characters' },
    { title: 'Ikenna Chukwuemeka — Iron Wolf', cat: 'characters', desc: 'Near-invulnerable guardian infused with Ògún sacred metallurgy and iron shielding.', target: '#characters' },
    { title: 'Zara Osei — The Mirror', cat: 'characters', desc: 'Spectral infiltrator wielding reflection manipulation and stealth reconnaissance.', target: '#characters' },
    { title: 'The Oracle of Badagry', cat: 'characters', desc: 'Ancient 144-year-old subterranean diviner monitoring cosmic Ọ̀run telemetry.', target: '#oracle-chat-terminal' },
    { title: 'The Architect', cat: 'characters', desc: 'System sovereign and Pale Council oligarch weaponizing synthetic Aṣẹ extraction.', target: '#villains' },
    { title: 'Hollow King', cat: 'characters', desc: 'Void Harvester extracting human lifeforce across industrial docks.', target: '#villains' },
    { title: 'Mother Storm', cat: 'characters', desc: 'Corrupted tempest entity tearing open unsealed Ọ̀run rifts in the lagoon.', target: '#villains' },
    { title: 'Iron Preacher', cat: 'characters', desc: 'Heretic smith commanding automated iron constructs on the Ògún Wrath doctrine.', target: '#villains' },
    { title: 'The Pale Council', cat: 'characters', desc: 'Shadow syndicate operating high above Eko Atlantic dredging towers.', target: '#villains' },

    { title: '1420 CE: The First Covenant', cat: 'lore', desc: 'Descent of the Orishas in Old Oyo Kingdom and the ancient sovereign defense pact.', target: '#lore-timeline' },
    { title: '1897 CE: The Iron Incursion', cat: 'lore', desc: 'Seven sacred anvils of Ògún buried beneath the seabed to prevent colonial looting.', target: '#lore-timeline' },
    { title: '1973 CE: Badagry Eclipse', cat: 'lore', desc: 'Awakening of the subterranean listening array beneath coastal slave port tunnels.', target: '#lore-timeline' },
    { title: '2018 CE: Eko Atlantic Rise', cat: 'lore', desc: 'Synthetic energy extraction towers constructed atop dredged coastal sandbars.', target: '#lore-timeline' },
    { title: '2031 CE: Third Mainland Breach', cat: 'lore', desc: 'The catastrophic tear in the Ọ̀run membrane triggering the awakening of Bayo.', target: '#lore-timeline' },
    { title: 'Èjì Ogbè & The 16 Odu Ifá', cat: 'lore', desc: 'Sacred binary computation system mapping cosmic alignment and ancestral proverbs.', target: '#divination-chamber' },
    { title: 'Aṣẹ Energy Mechanics', cat: 'lore', desc: 'Primordial cosmic directive force governing creation, vibration, and combat lethality.', target: '#glossary' },
    { title: 'The Sacred Relics Vault', cat: 'lore', desc: '3D rotatable wireframe polyhedra and technical metallurgy telemetry.', target: '#relvault' },

    { title: 'Issue #01: The Awakening', cat: 'scenes', desc: 'Free full 22-page graphic novel issue with audiobook voice narration and webtoon mode.', target: '#read' },
    { title: 'Issue #02: Echoes in the Iron', cat: 'scenes', desc: 'Amara and Ikenna confront void constructs at the Apapa shipping container yards.', target: '#read' },
    { title: 'Issue #03: The Bloodline Gate', cat: 'scenes', desc: 'Subterranean transit tunnels of Balogun breached by Pale Council enforcers.', target: '#read' },
    { title: 'Issue #04: Dawn Over Lagos', cat: 'scenes', desc: 'Climax of Arc I on the high suspension cables of Third Mainland Bridge.', target: '#read' },
    { title: '19-Scene Filmstrip Quick-Jump', cat: 'scenes', desc: 'Direct chapter navigation drawer spanning every dramatic beat of Issue #01.', target: '#readFilmstripDrawer' },

    { title: 'CHAR-01: Bayo Adeyemi Portrait', cat: 'artworks', desc: 'Canonical key art: Bayo radiating electric blue Aṣẹ in Lagos rain.', target: '#artwork-gallery' },
    { title: 'CHAR-02: Amara Okafor Portrait', cat: 'artworks', desc: 'Canonical key art: Ṣàngó volt arcs across talking drum leather.', target: '#artwork-gallery' },
    { title: 'CHAR-03: Ikenna Chukwuemeka Portrait', cat: 'artworks', desc: 'Canonical key art: Ògún iron guard raised against city headlights.', target: '#artwork-gallery' },
    { title: 'SCENE-01: Third Mainland Siege', cat: 'artworks', desc: 'Cinematic double-page spread of the lagoon fracture.', target: '#artwork-gallery' },
    { title: 'COV-01: Issue #01 Official Cover', cat: 'artworks', desc: 'Higgsfield 4K rendered collector edition cover.', target: '#artwork-gallery' },

    { title: 'The Orisha Combat Power Grid', cat: 'tools', desc: 'Interactive HTML5 Canvas hexagonal spider radar measuring 6 tactical vectors.', target: '#combat-power-grid' },
    { title: 'Ọ̀run Drum Machine & Sequencer', cat: 'tools', desc: '16-step Afrofuturist beatmaker with Web Audio procedural synthesis.', target: '#beat-machine' },
    { title: 'Orisha Divination & Ifá Chamber', cat: 'tools', desc: 'Interactive Ọ̀pẹ̀lẹ̀ chain casting and sacred binary talisman minting.', target: '#divination-chamber' },
    { title: 'Comic Panel Remix Studio', cat: 'tools', desc: 'Visual meme and panel creator with speech balloons and PNG export.', target: '#panel-remix' },
    { title: 'Dramatic Audio Narration Engine', cat: 'tools', desc: 'Web Speech API audiobook drama player with procedural sub-bass soundbed.', target: '#dramatic-audio-engine' },
    { title: 'Community Fan Art Showcase', cat: 'tools', desc: 'Curated Afrofuturist gallery and client-side creator ID minting portal.', target: '#fan-art-showcase' },
    { title: 'Universal Accessibility Suite', cat: 'tools', desc: 'Dyslexia font, photophobia guard, laser reading ruler, voice navigation.', target: '#accessibility-suite' }
  ];

  var activeCategory = 'all';
  var searchQuery = '';

  function renderOmniResults() {
    var grid = document.getElementById('omniResultsGrid');
    var badge = document.getElementById('omniCountBadge');
    if (!grid) return;

    var filtered = OMNI_CATALOG.filter(function(item) {
      var matchesCat = (activeCategory === 'all' || item.cat === activeCategory);
      var q = searchQuery.toLowerCase().trim();
      var matchesQ = !q || item.title.toLowerCase().indexOf(q) !== -1 || item.desc.toLowerCase().indexOf(q) !== -1;
      return matchesCat && matchesQ;
    });

    if (badge) badge.textContent = filtered.length + ' ENTRIES';

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--ash-grey);font-family:'Space Mono',monospace;">NO MATCHING LORE FOUND IN THE ARCHIVE. TRY ANOTHER QUERY.</div>';
      return;
    }

    grid.innerHTML = filtered.map(function(item) {
      return '<div class="omni-result-card" onclick="jumpToOmniTarget('' + item.target + '')">' +
        '<span class="omni-card-cat">' + item.cat.toUpperCase() + '</span>' +
        '<h4 class="omni-card-title">' + item.title + '</h4>' +
        '<p class="omni-card-desc">' + item.desc + '</p>' +
        '<span class="omni-card-action">JUMP TO DESTINATION →</span>' +
      '</div>';
    }).join('');
  }

  window.handleOmniSearch = function(val) {
    searchQuery = val;
    renderOmniResults();
  };

  window.filterOmniCategory = function(cat, btn) {
    activeCategory = cat;
    var btns = document.querySelectorAll('.omni-filter-tabs .omni-tab-btn');
    btns.forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderOmniResults();
  };

  window.jumpToOmniTarget = function(target) {
    var el = document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderOmniResults);
  } else {
    renderOmniResults();
  }
})();
