/**
 * CATALYST: THE AWAKENING — OFFICIAL COMIC STORE CONTROLLER
 * Powering Shopify integration, Multi-Currency, 5-Page Preview, & Catalyst OS AI Concierge
 */

// ═══════════════════════════════════════════════════════════
// 1. PRODUCT CATALOG DATA MASTER
// ═══════════════════════════════════════════════════════════
const CATALYST_PRODUCTS = [
  {
    id: "catalyst-issue-01-digital",
    title: "Issue #01: \"Awaken, O City\" (Digital Master Edition)",
    category: "comic",
    affinity: "sango",
    badge: "Bestseller",
    badgeType: "gold",
    rating: "5.0 ★★★★★ (480+ Reads)",
    excerpt: "The 88-page landmark debut. Bayo Adeyemi awakens to the combined Aṣẹ of Ṣàngó, Ògún, and Obatàlá. High-definition DRM-free PDF + Web Reader Key.",
    specs: ["88 Master Pages", "1024x1536 HD PDF", "Instant Reader Access", "Production Dossier"],
    image: "./assets/cover-issue1.webp",
    hasPreview: true,
    variants: [
      { name: "Digital DRM-Free PDF + Web Reader", sku: "CAT-AWK-01-DIGI", prices: { USD: 7.99, NGN: 9500, GBP: 6.50, EUR: 7.50 }, compare: { USD: 12.00, NGN: 15000, GBP: 9.50, EUR: 11.00 } }
    ]
  },
  {
    id: "catalyst-issue-01-physical",
    title: "Issue #01: \"Awaken, O City\" (Physical Deluxe Print)",
    category: "comic",
    affinity: "obatala",
    badge: "Deluxe Hardcover",
    badgeType: "deluxe",
    rating: "5.0 ★★★★★ (Collector's Pick)",
    excerpt: "Museum-grade print edition. 350 GSM soft-touch matte hardcover with gold foil-stamped embossed Aṣẹ sigil, archival satin art paper, and Lagos 2031 map.",
    specs: ["Heavyweight 350 GSM Cover", "Sewn Lay-Flat Binding", "Gold Foil Stamping", "Fold-out Lagos Map"],
    image: "./assets/cover-bayo-orisha1.webp",
    hasPreview: true,
    variants: [
      { name: "Deluxe Foil Hardcover", sku: "CAT-AWK-01-HC", prices: { USD: 29.99, NGN: 36000, GBP: 24.50, EUR: 28.00 }, compare: { USD: 35.00, NGN: 42000, GBP: 29.00, EUR: 33.00 } },
      { name: "Standard Softcover Print", sku: "CAT-AWK-01-SC", prices: { USD: 19.99, NGN: 24000, GBP: 16.50, EUR: 18.50 }, compare: { USD: 24.00, NGN: 29000, GBP: 20.00, EUR: 22.50 } }
    ]
  },
  {
    id: "catalyst-issue-02-preorder",
    title: "Issue #02: \"Ṣàngó's Daughter\" (Pre-Order)",
    category: "comic",
    affinity: "sango",
    badge: "Arc II Pre-Order",
    badgeType: "preorder",
    rating: "Anticipated Q4 '26",
    excerpt: "The War for Lagos expands. Amara Okafor (Thunderstrike — Ṣàngó's Daughter) and Zara Osei (The Mirror — Ẹṣù's vessel) join Bayo against The Collector. Includes immediate digital access to the 32-page Classified Concept Art Dossier.",
    specs: ["Day-One Digital Delivery", "32-Page Art Dossier", "Backer Ledger Credit", "Arc II Early HUD"],
    image: "./assets/cover-issue2.webp",
    hasPreview: false,
    variants: [
      { name: "Digital Pre-Order + Concept Dossier", sku: "CAT-AWK-02-PRE", prices: { USD: 7.99, NGN: 9500, GBP: 6.50, EUR: 7.50 }, compare: { USD: 10.00, NGN: 12000, GBP: 8.50, EUR: 9.50 } },
      { name: "Physical Print + Digital Pre-Order", sku: "CAT-AWK-02-PRT", prices: { USD: 21.99, NGN: 26000, GBP: 18.00, EUR: 20.00 }, compare: { USD: 28.00, NGN: 34000, GBP: 23.00, EUR: 26.00 } }
    ]
  },
  {
    id: "catalyst-issue-03-edition",
    title: "Issue #03: \"Iron in the Blood\" (Collector Edition)",
    category: "comic",
    affinity: "ogun",
    badge: "Ògún Arc",
    badgeType: "gold",
    rating: "5.0 ★★★★★ (Fan Favorite)",
    excerpt: "Ancient truths about the Pale Council surface as Apapa Iron District ignites. Ikenna and the Iron Wolf clash on the Third Mainland Bridge.",
    specs: ["Full-Color Issue #03", "Apapa Foundry Lore", "Ògún Blueprint Pages", "DRM-Free 4K PDF"],
    image: "./assets/cover-issue3.webp",
    hasPreview: false,
    variants: [
      { name: "Digital Master Edition", sku: "CAT-AWK-03-DIGI", prices: { USD: 7.99, NGN: 9500, GBP: 6.50, EUR: 7.50 }, compare: { USD: 10.00, NGN: 12000, GBP: 8.50, EUR: 9.50 } },
      { name: "Collector Foil Softcover", sku: "CAT-AWK-03-SC", prices: { USD: 19.99, NGN: 24000, GBP: 16.50, EUR: 18.50 }, compare: { USD: 24.00, NGN: 29000, GBP: 20.00, EUR: 22.50 } }
    ]
  },
  {
    id: "catalyst-issue-04-finale",
    title: "Issue #04: \"The Price of Aṣẹ\" (Arc I Finale)",
    category: "comic",
    affinity: "esu",
    badge: "Season Finale",
    badgeType: "deluxe",
    rating: "5.0 ★★★★★ (Masterpiece)",
    excerpt: "Bayo Adeyemi confronts The Architect atop Eko Atlantic Tower 7 in the cataclysmic battle for the soul of Lagos. Includes all 5 alternate Choice endings.",
    specs: ["Oversized Finale Issue", "5 Alternate Ending Scripts", "Architect Dossier", "Holographic Cover"],
    image: "./assets/cover-issue4.webp",
    hasPreview: false,
    variants: [
      { name: "Digital Master + 5 Endings", sku: "CAT-AWK-04-DIGI", prices: { USD: 8.99, NGN: 10500, GBP: 7.50, EUR: 8.50 }, compare: { USD: 12.00, NGN: 15000, GBP: 9.50, EUR: 11.00 } },
      { name: "Deluxe Finale Foil Hardcover", sku: "CAT-AWK-04-HC", prices: { USD: 29.99, NGN: 36000, GBP: 24.50, EUR: 28.00 }, compare: { USD: 36.00, NGN: 43000, GBP: 30.00, EUR: 34.00 } }
    ]
  },
  {
    id: "catalyst-quad-omnibus",
    title: "Complete Arc I Quad-Pack Omnibus (Issues #01–#04)",
    category: "bundle",
    affinity: "obatala",
    badge: "Save 25%",
    badgeType: "bundle",
    rating: "5.0 ★★★★★ (Best Value)",
    excerpt: "Own the complete first saga of Catalyst: The Awakening. Includes Issues #01 through #04, all digital 4K masters, and the 50-piece high-DPI wallpaper vault.",
    specs: ["All 4 Canonical Issues", "Digital + Print Options", "50 4K Wallpapers", "Full FLAC Soundtrack"],
    image: "./assets/team-constellation.webp",
    hasPreview: true,
    variants: [
      { name: "Complete Digital Quad-Pack", sku: "CAT-QUAD-DIGI", prices: { USD: 24.99, NGN: 28000, GBP: 20.00, EUR: 23.00 }, compare: { USD: 33.00, NGN: 40000, GBP: 27.00, EUR: 31.00 } },
      { name: "Complete Print + Digital Omnibus", sku: "CAT-QUAD-PRINT", prices: { USD: 69.99, NGN: 84000, GBP: 56.00, EUR: 64.00 }, compare: { USD: 95.00, NGN: 115000, GBP: 78.00, EUR: 88.00 } }
    ]
  },
  {
    id: "catalyst-supreme-bundle",
    title: "The Catalyst OS Supreme Collector's Box Set",
    category: "bundle",
    affinity: "obatala",
    badge: "Exclusive Box Set",
    badgeType: "bundle",
    rating: "5.0 ★★★★★ (Ultra-Limited 250 Units)",
    excerpt: "The master artifact. Issue #01 Deluxe Foil Hardcover + Issue #02 Advance Copy + Catalyst Protocol Strategy Dossier + Cast Bronze Aṣẹ Talisman.",
    specs: ["Hardcover Issues #01 & #02", "Catalyst Protocol Manifesto", "Cast Bronze Talisman", "Signed Bookplate"],
    image: "./assets/circle.webp",
    hasPreview: false,
    variants: [
      { name: "Complete Box Set (Limited 250 Run)", sku: "CAT-BOX-SUPREME", prices: { USD: 59.99, NGN: 72000, GBP: 49.00, EUR: 55.00 }, compare: { USD: 75.00, NGN: 90000, GBP: 62.00, EUR: 70.00 } }
    ]
  },
  {
    id: "catalyst-universe-dossier",
    title: "The Catalyst Protocol & Universe Classified Dossier",
    category: "bundle",
    affinity: "esu",
    badge: " Lore & Strategy",
    badgeType: "preorder",
    rating: "5.0 ★★★★★ (Executive Guide)",
    excerpt: "64-page classified lore manual & strategic manifesto by Oluwatobiloba. Maps the Orisha power grid, Lagos 2031 factions, and the 5 Pillars of Catalyst OS.",
    specs: ["64-Page Lore & Strategy Book", "Orisha Power Tier Charts", "Mushin to Eko Map", "Instant PDF Download"],
    image: "./assets/art-ase-economy.webp",
    hasPreview: false,
    variants: [
      { name: "Digital Classified Dossier PDF", sku: "CAT-DOSS-DIGI", prices: { USD: 14.99, NGN: 18000, GBP: 12.00, EUR: 14.00 }, compare: { USD: 20.00, NGN: 24000, GBP: 16.50, EUR: 19.00 } },
      { name: "Print Dossier + Gold Foil Cover", sku: "CAT-DOSS-PRT", prices: { USD: 29.99, NGN: 36000, GBP: 24.50, EUR: 28.00 }, compare: { USD: 38.00, NGN: 45000, GBP: 31.00, EUR: 35.00 } }
    ]
  },
  {
    id: "catalyst-merch-ogun-tee",
    title: "Lagos 2031 Cyber-Streetwear — Ògún Forge Tee",
    category: "merch",
    affinity: "ogun",
    badge: "Limited Apparel",
    badgeType: "gold",
    rating: "5.0 ★★★★★ (Streetwear)",
    excerpt: "280 GSM luxury heavyweight combed organic cotton. Multi-layer puff-print typography with reflective cyber-Aṣẹ circuitry on reverse. Boxy streetwear fit.",
    specs: ["280 GSM Heavyweight Cotton", "Drop-Shoulder Boxy Cut", "Reflective 3M Glyphs", "Designed in Lagos"],
    image: "./assets/ogun-portrait.webp",
    hasPreview: false,
    variants: [
      { name: "Medium / Obsidian Noir", sku: "CAT-TEE-OGUN-M", prices: { USD: 34.99, NGN: 42000, GBP: 28.50, EUR: 32.50 }, compare: { USD: 40.00, NGN: 48000, GBP: 33.00, EUR: 37.50 } },
      { name: "Large / Obsidian Noir", sku: "CAT-TEE-OGUN-L", prices: { USD: 34.99, NGN: 42000, GBP: 28.50, EUR: 32.50 }, compare: { USD: 40.00, NGN: 48000, GBP: 33.00, EUR: 37.50 } },
      { name: "XL / Obsidian Noir", sku: "CAT-TEE-OGUN-XL", prices: { USD: 34.99, NGN: 42000, GBP: 28.50, EUR: 32.50 }, compare: { USD: 40.00, NGN: 48000, GBP: 33.00, EUR: 37.50 } }
    ]
  },
  {
    id: "catalyst-merch-sango-hoodie",
    title: "Lagos 2031 Cyber-Streetwear — Ṣàngó Thunderstrike Hoodie",
    category: "merch",
    affinity: "sango",
    badge: "Heavyweight 480 GSM",
    badgeType: "deluxe",
    rating: "5.0 ★★★★★ (Luxury Streetwear)",
    excerpt: "480 GSM French terry luxury hoodie with metallic gold thread embroidery of the Ṣàngó double-axe Oṣé sigil and custom distress wash.",
    specs: ["480 GSM French Terry", "Gold Metallic Embroidery", "Double-Lined Hood", "Hidden NFC Pocket"],
    image: "./assets/sango-portrait.webp",
    hasPreview: false,
    variants: [
      { name: "Medium / Crimson & Obsidian", sku: "CAT-HOOD-SANGO-M", prices: { USD: 54.99, NGN: 65000, GBP: 45.00, EUR: 51.00 }, compare: { USD: 68.00, NGN: 82000, GBP: 55.00, EUR: 63.00 } },
      { name: "Large / Crimson & Obsidian", sku: "CAT-HOOD-SANGO-L", prices: { USD: 54.99, NGN: 65000, GBP: 45.00, EUR: 51.00 }, compare: { USD: 68.00, NGN: 82000, GBP: 55.00, EUR: 63.00 } },
      { name: "XL / Crimson & Obsidian", sku: "CAT-HOOD-SANGO-XL", prices: { USD: 54.99, NGN: 65000, GBP: 45.00, EUR: 51.00 }, compare: { USD: 68.00, NGN: 82000, GBP: 55.00, EUR: 63.00 } }
    ]
  },
  {
    id: "catalyst-variant-covers-pack",
    title: "Holofoil Variant Cover Collector Portfolio (Set of 9)",
    category: "art",
    affinity: "esu",
    badge: "9 Holofoil Covers",
    badgeType: "bundle",
    rating: "5.0 ★★★★★ (Gallery Set)",
    excerpt: "Complete set of 9 virgin holofoil variant covers (Amara Awakening, Never A Choice, Fifth Faction, Orisha Rising, Lagos Eternal) on 350 GSM card stock.",
    specs: ["9 Virgin Variant Covers", "Iridescent Holofoil Finish", "350 GSM Archival Card", "Presentation Portfolio"],
    image: "./assets/cover-orisha-rising3.webp",
    hasPreview: false,
    variants: [
      { name: "9-Cover Holofoil Portfolio", sku: "CAT-VAR-9PACK", prices: { USD: 44.99, NGN: 54000, GBP: 36.50, EUR: 42.00 }, compare: { USD: 60.00, NGN: 72000, GBP: 49.00, EUR: 56.00 } }
    ]
  },
  {
    id: "catalyst-art-print-architect",
    title: "Metallic Foil Art Print: \"The Architect Over Eko Atlantic\"",
    category: "art",
    affinity: "esu",
    badge: "Museum Print",
    badgeType: "preorder",
    rating: "5.0 ★★★★★ (Archival 1/250)",
    excerpt: "18x24 museum-grade archival metallic pearl art paper. Iridescent metallic sheen capturing the neon monoliths of Eko Atlantic City. Numbered run of 250.",
    specs: ["18 x 24 Inches (Standard Frame)", "310 GSM Metallic Pearl", "Holographic Studio Seal", "Shipped Flat in Rigid Mailer"],
    image: "./assets/architect-portrait.webp",
    hasPreview: false,
    variants: [
      { name: "18x24 Metallic Print (Numbered)", sku: "CAT-ART-ARCH-1824", prices: { USD: 24.99, NGN: 30000, GBP: 20.00, EUR: 23.50 }, compare: { USD: 30.00, NGN: 36000, GBP: 25.00, EUR: 28.00 } }
    ]
  }
];

// Sample 5-Page Preview data
const PREVIEW_PAGES = [
  { page: 1, title: "Scene 1: Before Everything", img: "./private/issue01/lettered/pages/p01.webp", fallback: "./assets/cover-issue1.webp", caption: "Mushin never actually sleeps. It rests with one eye open." },
  { page: 2, title: "Scene 1: The Alleyway Sprint", img: "./private/issue01/lettered/pages/p02.webp", fallback: "./assets/bayo-bridge.webp", caption: "Adebayo Adeyemi — 19 years old and running from four area boys." },
  { page: 3, title: "Scene 2: The Neon Downpour", img: "./private/issue01/lettered/pages/p03.webp", fallback: "./assets/team-highway.webp", caption: "The rain hits the zinc roofs like copper coin." },
  { page: 4, title: "Scene 2: Cornered at Ojuelegba", img: "./private/issue01/lettered/pages/p04.webp", fallback: "./assets/ogun-portrait.webp", caption: "Nowhere left to run. The dead end under the overpass." },
  { page: 5, title: "Scene 3: The Ignition of Aṣẹ", img: "./private/issue01/lettered/pages/p05.webp", fallback: "./assets/sango-portrait.webp", caption: "Thunder without clouds. Gold fire where sweat should be." }
];

// ═══════════════════════════════════════════════════════════
// 2. STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════
const storeStorage = window.CatalystStorage || window.localStorage;
function readStoreValue(key, fallback) {
  try { return JSON.parse(storeStorage.getItem(key) || 'null') || fallback; } catch (_) { return fallback; }
}
function normalizeStoreCart(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 50).flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const quantity = Math.min(20, Math.max(1, Math.floor(Number(item.quantity || item.qty) || 1)));
    if (item.sku === 'CAT-VAR-3CRATE-CUSTOM') {
      return [{ productId: 'catalyst-variant-covers-pack', title: 'Custom 3-Cover Holofoil Collector Crate',
        variantName: String(item.variantName || 'Custom 3-cover selection').replace(/[<>&"']/g, '').slice(0, 200),
        sku: item.sku, image: './assets/cover-issue1.webp',
        prices: { USD: 34.99, NGN: 42000, GBP: 28, EUR: 32.5 }, quantity }];
    }
    const relic = VAULT_RELICS.find(r => r.id === item.productId);
    if (relic && window.CatalystAccount?.user?.app_metadata?.is_premium === true) {
      return [{ productId: relic.id, title: relic.title, variantName: 'Exclusive Vault Edition',
        sku: 'VAULT-' + relic.id.toUpperCase(), image: relic.image, prices: relic.prices, quantity }];
    }
    const product = CATALYST_PRODUCTS.find(p => p.id === item.productId);
    const index = product ? product.variants.findIndex(v => v.sku === item.sku) : -1;
    if (index < 0) return [];
    const variant = product.variants[index];
    return [{ productId: product.id, title: product.title, variantName: variant.name,
      variantIndex: index, sku: variant.sku, image: product.image, prices: variant.prices,
      quantity }];
  });
}
const StoreState = {
  currency: ['NGN','USD','GBP','EUR'].includes(storeStorage.getItem('catalyst_currency')) ? storeStorage.getItem('catalyst_currency') : 'NGN',
  currentFilter: "all",
  currentAffinity: "all",
  searchQuery: "",
  cart: [],
  appliedCoupon: null,
  activePreviewPage: 0,
  customCrateCovers: [],
  shopifyConfig: {
    shopDomain: localStorage.getItem("catalyst_shopify_domain") || "catalyst-forge.myshopify.com",
    storefrontToken: localStorage.getItem("catalyst_shopify_token") || "",
    storeName: "CATALYST FORGE"
  }
};

// Currency symbols
const CURRENCY_SYMBOLS = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€"
};

// ═══════════════════════════════════════════════════════════
// 3. INITIALIZATION
// ═══════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", async () => {
  await window.CatalystAccount.ready;
  restoreStoreAccount();
  initCurrencySelector();
  initFilterTabs();
  initSearch();
  renderProducts();
  updateCartUI();
  initShopifyConfigModal();
  initAiConcierge();
});

// ═══════════════════════════════════════════════════════════
// 4. CURRENCY LOGIC
// ═══════════════════════════════════════════════════════════
function initCurrencySelector() {
  const sel = document.getElementById("currencySelector");
  if (!sel) return;
  sel.value = StoreState.currency;
  sel.addEventListener("change", (e) => {
    StoreState.currency = e.target.value;
    storeStorage.setItem("catalyst_currency", StoreState.currency);
    renderProducts();
    updateCartUI();
    showToast(`Currency switched to ${StoreState.currency} (${CURRENCY_SYMBOLS[StoreState.currency]})`);
  });
}

function formatPrice(amount, curr = StoreState.currency) {
  const sym = CURRENCY_SYMBOLS[curr] || "$";
  if (curr === "NGN") {
    return `${sym}${Number(amount).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
  }
  return `${sym}${Number(amount).toFixed(2)}`;
}

// ═══════════════════════════════════════════════════════════
// 5. PRODUCTS RENDERING & FILTERING
// ═══════════════════════════════════════════════════════════
function initFilterTabs() {
  const tabs = document.querySelectorAll(".filter-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      StoreState.currentFilter = tab.dataset.category;
      renderProducts();
    });
  });
}

function filterByOrisha(affinity, btn) {
  document.querySelectorAll(".orisha-filter-pill").forEach(p => p.classList.remove("active"));
  if (btn) btn.classList.add("active");
  StoreState.currentAffinity = affinity;
  renderProducts();
  const labels = {
    all: "All Orisha Pantheons (12 Relics)",
    sango: "⚡ Ṣàngó — Thunder & Sovereign Fire",
    ogun: "⚔ Ògún — Iron, Blood & Kinetic Forge",
    esu: "🌀 Èṣù — Crossroads & Quantum Chaos",
    obatala: "👑 Obatàlá — Creation & Sacred White Gold"
  };
  showToast(`Filtered by: ${labels[affinity] || affinity}`);
}

function initSearch() {
  const input = document.getElementById("storeSearchInput");
  if (!input) return;
  input.addEventListener("input", (e) => {
    StoreState.searchQuery = e.target.value.toLowerCase().trim();
    renderProducts();
  });
}

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  const filtered = CATALYST_PRODUCTS.filter(p => {
    const matchesCategory = StoreState.currentFilter === "all" || p.category === StoreState.currentFilter;
    const matchesAffinity = StoreState.currentAffinity === "all" || p.affinity === StoreState.currentAffinity;
    const matchesSearch = !StoreState.searchQuery ||
                          p.title.toLowerCase().includes(StoreState.searchQuery) ||
                          p.excerpt.toLowerCase().includes(StoreState.searchQuery) ||
                          p.specs.some(s => s.toLowerCase().includes(StoreState.searchQuery));
    return matchesCategory && matchesAffinity && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <p style="font-size: 1.2rem; font-family: var(--font-display);">No relics or issues found matching your active filter</p>
        <button class="filter-tab active" style="margin-top: 1rem;" onclick="resetFilters()">View All 12 Relics</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => {
    const defaultVariant = product.variants[0];
    const priceStr = formatPrice(defaultVariant.prices[StoreState.currency]);
    const compareStr = defaultVariant.compare ? formatPrice(defaultVariant.compare[StoreState.currency]) : null;

    return `
      <article class="product-card" data-product-id="${product.id}" onmousemove="handleCardTilt(event, this)" onmouseleave="resetCardTilt(this)">
        <span class="card-badge ${product.badgeType}">${product.badge}</span>

        <div class="product-img-wrap" onclick="handleCardImageClick('${product.id}')">
          <img src="${product.image}" alt="${product.title}" class="product-img" loading="lazy" onerror="this.src='./assets/cover-issue1.webp'">
          ${product.hasPreview ? `
            <div class="product-preview-overlay">
              <button class="btn-preview-inside" onclick="event.stopPropagation(); openPreviewModal(0)">
                👁 Peek Inside (5-Page Preview)
              </button>
            </div>
          ` : ''}
        </div>

        <div class="product-content">
          <div class="product-category-row">
            <span>CATALYST ${product.category.toUpperCase()}</span>
            <span class="product-rating">${product.rating}</span>
          </div>

          <h3 class="product-title">${product.title}</h3>
          <p class="product-excerpt">${product.excerpt}</p>

          <div class="product-specs">
            ${product.specs.map(s => `<span class="spec-pill">${s}</span>`).join('')}
          </div>

          ${product.variants.length > 1 ? `
            <div class="product-variant-picker">
              <label class="variant-label">Select Edition / Size:</label>
              <div class="variant-options">
                ${product.variants.map((v, idx) => `
                  <button type="button" class="variant-opt-btn ${idx === 0 ? 'active' : ''}"
                          onclick="selectVariant('${product.id}', ${idx}, this)">
                    ${v.name}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div class="product-footer-row">
            <div class="product-price-box" id="price-box-${product.id}">
              <span class="price-current">${priceStr}</span>
              ${compareStr ? `<span class="price-compare">${compareStr}</span>` : ''}
            </div>

            <div class="card-btn-group">
              <button class="btn-add-cart" onclick="openRelicModal('${product.id}')" title="Inspect Relic Lore" style="padding:0.55rem 0.65rem; background:rgba(244,184,0,0.1); border-color:rgba(244,184,0,0.3); color:var(--accent-gold);">
                📜 Lore
              </button>
              <button class="btn-add-cart" onclick="addToCart('${product.id}')" title="Add to Cart">
                + Cart
              </button>
              <button class="btn-buy-now" onclick="quickBuy('${product.id}')" title="Buy Now via Shopify">
                ⚡ Buy
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function resetFilters() {
  StoreState.currentFilter = "all";
  StoreState.currentAffinity = "all";
  StoreState.searchQuery = "";
  const input = document.getElementById("storeSearchInput");
  if (input) input.value = "";
  document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
  document.querySelector('.filter-tab[data-category="all"]')?.classList.add("active");
  document.querySelectorAll(".orisha-filter-pill").forEach(p => p.classList.remove("active"));
  document.querySelector('.orisha-filter-pill[data-affinity="all"]')?.classList.add("active");
  renderProducts();
}

function handleCardImageClick(productId) {
  const product = CATALYST_PRODUCTS.find(p => p.id === productId);
  if (product && product.hasPreview) {
    openPreviewModal(0);
  }
}

function selectVariant(productId, variantIndex, btn) {
  const card = btn.closest(".product-card");
  card.querySelectorAll(".variant-opt-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  const product = CATALYST_PRODUCTS.find(p => p.id === productId);
  const variant = product.variants[variantIndex];
  const priceBox = document.getElementById(`price-box-${productId}`);
  if (priceBox && variant) {
    const priceStr = formatPrice(variant.prices[StoreState.currency]);
    const compareStr = variant.compare ? formatPrice(variant.compare[StoreState.currency]) : null;
    priceBox.innerHTML = `
      <span class="price-current">${priceStr}</span>
      ${compareStr ? `<span class="price-compare">${compareStr}</span>` : ''}
    `;
  }
}

function handleCardTilt(e, card) {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((y - centerY) / centerY) * -5;
  const rotateY = ((x - centerX) / centerX) * 5;
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
}

function resetCardTilt(card) {
  card.style.transform = '';
}


// ═══════════════════════════════════════════════════════════
// 6. CART MANAGEMENT
// ═══════════════════════════════════════════════════════════
function getSelectedVariantIndex(productId) {
  const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
  if (!card) return 0;
  const activeBtn = card.querySelector(".variant-opt-btn.active");
  if (!activeBtn) return 0;
  const btns = Array.from(card.querySelectorAll(".variant-opt-btn"));
  return Math.max(0, btns.indexOf(activeBtn));
}

function addToCart(productId) {
  const product = CATALYST_PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const varIdx = getSelectedVariantIndex(productId);
  const variant = product.variants[varIdx];

  const existingIndex = StoreState.cart.findIndex(
    item => item.productId === productId && item.variantIndex === varIdx
  );

  if (existingIndex > -1) {
    StoreState.cart[existingIndex].quantity += 1;
  } else {
    StoreState.cart.push({
      productId: product.id,
      title: product.title,
      variantName: variant.name,
      variantIndex: varIdx,
      sku: variant.sku,
      image: product.image,
      prices: variant.prices,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast(`Added "${product.title}" to cart`);
  openCartDrawer();
}

function quickBuy(productId) {
  addToCart(productId);
  proceedToCheckout();
}

function updateCartQty(cartIndex, delta) {
  if (!StoreState.cart[cartIndex]) return;
  StoreState.cart[cartIndex].quantity += delta;
  if (StoreState.cart[cartIndex].quantity <= 0) {
    StoreState.cart.splice(cartIndex, 1);
  }
  saveCart();
  updateCartUI();
}

function removeCartItem(cartIndex) {
  if (!StoreState.cart[cartIndex]) return;
  StoreState.cart.splice(cartIndex, 1);
  saveCart();
  updateCartUI();
  showToast("Item removed from cart");
}

function saveCart() {
  StoreState.cart = normalizeStoreCart(StoreState.cart);
  storeStorage.setItem("catalyst_cart", JSON.stringify(StoreState.cart));
}

function restoreStoreAccount() {
  StoreState.cart = normalizeStoreCart(readStoreValue('catalyst_cart', []));
  const currency = storeStorage.getItem('catalyst_currency');
  StoreState.currency = ['NGN','USD','GBP','EUR'].includes(currency) ? currency : 'NGN';
  StoreState.appliedCoupon = null;
  const selector = document.getElementById('currencySelector');
  if (selector) selector.value = StoreState.currency;
  const link = document.getElementById('storeAccountLink'), a = window.CatalystAccount;
  if (link) link.textContent = a.user ? (a.profile?.display_name || 'Reader Passport') : 'Sign In / Reader Passport';
  closeCatalystForgeCheckoutModal(); closeOrderTrackerModal();
  ['forgeOrderFullName','forgeOrderEmail','forgeOrderAddress'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  updateCartUI(); renderProducts(); initVipVault();
  renderReviews();
}
function updateStoreSyncStatus() {
  const el = document.getElementById('storeSyncStatus'), account = window.CatalystAccount;
  if (!el) return;
  const labels = { loading: 'Loading your saved items…', pending: 'Saving your items…', saved: 'Your items are saved to your account.', offline: 'Offline. Changes are saved on this device and waiting to sync.', error: 'Sync needs attention. Your device changes are still available.' };
  el.textContent = 'Store preview. Checkout is coming soon. ' + (account?.user ? (labels[account.status] || 'Signed in with Reader Passport.') : 'Sign in to sync your saved items.');
}
window.addEventListener('catalyst:reader-state', restoreStoreAccount);
window.addEventListener('catalyst:account', () => { initVipVault(); });
window.addEventListener('catalyst:sync', updateStoreSyncStatus);
window.addEventListener('DOMContentLoaded', updateStoreSyncStatus);

function updateCartUI() {
  // Update badge
  const totalCount = StoreState.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badges = document.querySelectorAll(".cart-count-badge");
  badges.forEach(b => b.textContent = totalCount);

  // Update Drawer list
  const container = document.getElementById("cartItemsContainer");
  if (!container) return;

  if (StoreState.cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-icon">📖</div>
        <h4 class="cart-empty-title">Your Cart is Empty</h4>
        <p>No relics in your cache yet. Explore the graphic novel issues, deluxe prints, or collector merch.</p>
        <button class="btn-primary-hero" style="margin-top: 1.2rem; font-size: 0.85rem;" onclick="closeCartDrawer()">
          Explore Catalog →
        </button>
      </div>
    `;
    updateSubtotal(0);
    updatePerkMeter(0);
    return;
  }

  let subtotal = 0;
  container.innerHTML = StoreState.cart.map((item, idx) => {
    const unitPrice = item.prices[StoreState.currency] || 0;
    const linePrice = unitPrice * item.quantity;
    subtotal += linePrice;

    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img" onerror="this.src='./assets/cover-issue1.webp'">
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.title}</h4>
          <span class="cart-item-variant">${item.variantName}</span>

          <div class="cart-item-bottom">
            <div class="cart-qty-ctrls">
              <button class="qty-btn" onclick="updateCartQty(${idx}, -1)">−</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="updateCartQty(${idx}, 1)">+</button>
            </div>

            <div>
              <span class="cart-item-price">${formatPrice(linePrice)}</span>
              <button class="btn-remove-item" onclick="removeCartItem(${idx})">✕</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  updateSubtotal(subtotal);
  updatePerkMeter(subtotal);
}

function updateSubtotal(subtotal) {
  let finalTotal = subtotal;
  if (StoreState.appliedCoupon) {
    finalTotal = subtotal * (1 - StoreState.appliedCoupon.discount);
  }

  const subtotalEl = document.getElementById("cartSubtotalVal");
  if (subtotalEl) {
    subtotalEl.textContent = formatPrice(finalTotal);
  }
}

function updatePerkMeter(subtotal) {
  // Free bonus milestone target
  const target = StoreState.currency === "NGN" ? 25000 : 25;
  const pct = Math.min(100, Math.round((subtotal / target) * 100));
  const fill = document.getElementById("perkProgressFill");
  const text = document.getElementById("perkProgressText");
  if (fill) fill.style.width = `${pct}%`;
  if (text) {
    if (pct >= 100) {
      text.innerHTML = `<span>🎉 <strong>BONUS UNLOCKED:</strong> Free Classified Lore Audio Dossier Added!</span>`;
    } else {
      const remaining = target - subtotal;
      text.innerHTML = `<span>Add <strong>${formatPrice(remaining)}</strong> more to unlock Free Classified Lore Audio Dossier</span> <span>${pct}%</span>`;
    }
  }
}

function applyCouponCode() {
  const input = document.getElementById("couponInput");
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (code === "CATALYSTOS10" || code === "CATALYSTOS") {
    StoreState.appliedCoupon = { code: "CATALYSTOS10", discount: 0.10 };
    showToast("✓ Coupon applied: 10% Catalyst OS discount!");
    updateCartUI();
  } else if (code === "SOLEDOMINANCE") {
    StoreState.appliedCoupon = { code: "SOLEDOMINANCE", discount: 0.15 };
    showToast("✓ Coupon applied: 15% VIP discount!");
    updateCartUI();
  } else {
    showToast("⚠ Invalid or expired promo code");
  }
}

// Drawer toggle
function openCartDrawer() {
  document.getElementById("cartBackdrop")?.classList.add("open");
}
function closeCartDrawer() {
  document.getElementById("cartBackdrop")?.classList.remove("open");
}

// ═══════════════════════════════════════════════════════════
// 7. SHOPIFY CHECKOUT & WHATSAPP INTEGRATION
// ═══════════════════════════════════════════════════════════
function proceedToCheckout() {
  if (StoreState.cart.length === 0) {
    showToast("Your cart is empty!");
    return;
  }
  playHapticSound('chime');
  closeCartDrawer();
  openCatalystForgeCheckoutModal();
}

function openCatalystForgeCheckoutModal() {
  const modal = document.getElementById("forgeCheckoutBackdrop");
  if (!modal) return;

  const subtotal = StoreState.cart.reduce((sum, item) => sum + (item.prices[StoreState.currency] * item.quantity), 0);
  const total = StoreState.appliedCoupon ? subtotal * (1 - StoreState.appliedCoupon.discount) : subtotal;

  const summaryEl = document.getElementById("forgeCheckoutSummary");
  if (summaryEl) {
    summaryEl.innerHTML = StoreState.cart.map(item => `
      <div style="display:flex;justify-content:space-between;font-size:0.85rem;padding:0.4rem 0;border-bottom:1px solid rgba(255,255,255,0.06);">
        <span style="color:#fff;">${item.title} <small style="color:var(--accent-gold);">x${item.quantity}</small></span>
        <strong style="color:var(--accent-gold);font-family:var(--font-mono);">${formatPrice(item.prices[StoreState.currency] * item.quantity)}</strong>
      </div>
    `).join('');
  }

  const totalEl = document.getElementById("forgeCheckoutTotal");
  if (totalEl) totalEl.textContent = formatPrice(total);

  const domainEl = document.getElementById("forgeActiveDomain");
  if (domainEl) domainEl.textContent = (StoreState.shopifyConfig.shopDomain && StoreState.shopifyConfig.shopDomain !== "catalyst-forge.myshopify.com") ? StoreState.shopifyConfig.shopDomain : "catalyst-world.netlify.app (Official Master Portal)";

  modal.classList.add("open");
}

function closeCatalystForgeCheckoutModal() {
  document.getElementById("forgeCheckoutBackdrop")?.classList.remove("open");
}

function redirectToShopifyStorefront() {
  showToast('Checkout is coming soon. Contact catalystcomicstudio@gmail.com for availability.');
}

function completeExpressForgeOrder(e) {
  if (e) e.preventDefault();
  showToast('Checkout is coming soon. Your cart is saved; no payment or order has been confirmed.');
}

function checkoutViaWhatsApp() {
  showToast('For availability, contact catalystcomicstudio@gmail.com. Checkout is coming soon.');
}

// ═══════════════════════════════════════════════════════════
// 8. 5-PAGE TEASER PREVIEW MODAL
// ═══════════════════════════════════════════════════════════
function openPreviewModal(pageIndex = 0) {
  StoreState.activePreviewPage = pageIndex;
  renderPreviewPage();
  document.getElementById("previewModalBackdrop")?.classList.add("open");
}

function closePreviewModal() {
  document.getElementById("previewModalBackdrop")?.classList.remove("open");
}

function renderPreviewPage() {
  const page = PREVIEW_PAGES[StoreState.activePreviewPage];
  if (!page) return;

  const imgEl = document.getElementById("previewPageImg");
  const pillEl = document.getElementById("previewPagePill");
  const captionEl = document.getElementById("previewPageCaption");
  const titleEl = document.getElementById("previewPageTitle");

  if (imgEl) {
    imgEl.src = page.img;
    imgEl.onerror = () => { imgEl.src = page.fallback; };
  }
  if (pillEl) pillEl.textContent = `PAGE ${page.page} OF 88 (TEASER)`;
  if (titleEl) titleEl.textContent = page.title;
  if (captionEl) captionEl.textContent = `"${page.caption}"`;

  // Update thumbnails
  const thumbs = document.querySelectorAll(".preview-thumb");
  thumbs.forEach((t, i) => {
    t.classList.toggle("active", i === StoreState.activePreviewPage);
  });
}

function prevPreviewPage() {
  if (StoreState.activePreviewPage > 0) {
    StoreState.activePreviewPage--;
    renderPreviewPage();
  }
}

function nextPreviewPage() {
  if (StoreState.activePreviewPage < PREVIEW_PAGES.length - 1) {
    StoreState.activePreviewPage++;
    renderPreviewPage();
  } else {
    showToast("Teaser ended! Unlock all 88 pages with the Digital Edition");
  }
}

// ═══════════════════════════════════════════════════════════
// 9. SHOPIFY CONFIGURATION MODAL
// ═══════════════════════════════════════════════════════════
function initShopifyConfigModal() {
  const domainInput = document.getElementById("shopifyDomainInput");
  const tokenInput = document.getElementById("shopifyTokenInput");
  if (domainInput) domainInput.value = StoreState.shopifyConfig.shopDomain;
  if (tokenInput) tokenInput.value = StoreState.shopifyConfig.storefrontToken;
}

function openShopifyConfigModal() {
  initShopifyConfigModal();
  document.getElementById("shopifyConfigBackdrop")?.classList.add("open");
}

function closeShopifyConfigModal() {
  document.getElementById("shopifyConfigBackdrop")?.classList.remove("open");
}

function saveShopifyConfig(e) {
  if (e) e.preventDefault();
  const domain = document.getElementById("shopifyDomainInput")?.value.trim();
  const token = document.getElementById("shopifyTokenInput")?.value.trim();

  StoreState.shopifyConfig.shopDomain = domain;
  StoreState.shopifyConfig.storefrontToken = token;

  localStorage.setItem("catalyst_shopify_domain", domain);
  localStorage.setItem("catalyst_shopify_token", token);

  showToast("✓ Shopify store settings saved successfully!");
  closeShopifyConfigModal();
}

// ═══════════════════════════════════════════════════════════
// 10. CATALYST OS COMMERCE AI CONCIERGE
// ═══════════════════════════════════════════════════════════
function initAiConcierge() {
  const fab = document.getElementById("catalystAiFab");
  const win = document.getElementById("aiChatWindow");
  if (!fab || !win) return;

  fab.addEventListener("click", () => {
    win.classList.toggle("open");
  });
}

function closeAiChat() {
  document.getElementById("aiChatWindow")?.classList.remove("open");
}

function sendAiPrompt(text) {
  const input = document.getElementById("aiChatInput");
  if (input) input.value = text;
  handleAiSend();
}

function handleAiSend() {
  const input = document.getElementById("aiChatInput");
  if (!input) return;
  const q = input.value.trim();
  if (!q) return;

  appendChatMessage("user", q);
  input.value = "";

  // Simulate typing delay
  setTimeout(() => {
    const answer = generateCatalystAiResponse(q);
    appendChatMessage("bot", answer);
  }, 400);
}

function appendChatMessage(sender, text) {
  const msgContainer = document.getElementById("aiChatMessages");
  if (!msgContainer) return;
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = text;
  msgContainer.appendChild(bubble);
  msgContainer.scrollTop = msgContainer.scrollHeight;
}

function generateCatalystAiResponse(question) {
  const q = question.toLowerCase();

  if (q.includes("start") || q.includes("which issue") || q.includes("edition") || q.includes("recommend")) {
    return "⚡ <strong>Start with Issue #01: \"Awaken, O City\"</strong>! It contains the entire 88-page master origin arc of Bayo Adeyemi in Mushin. If you want instant reading, grab the <strong>Digital Master Edition (₦9,500 / $7.99)</strong>. If you are a physical collector, get the <strong>Deluxe Foil Hardcover (₦36,000 / $29.99)</strong> which comes with the fold-out Lagos 2031 map!";
  }
  if (q.includes("bundle") || q.includes("supreme") || q.includes("box")) {
    return "👑 <strong>The Supreme Box Set (₦72,000 / $59.99)</strong> is our limited museum run (only 250 units worldwide). It includes both Issue #01 Deluxe Hardcover, Issue #02 advance edition, the 64-page <em>Catalyst Protocol Strategy Dossier</em>, and a hand-crafted cast bronze Aṣẹ talisman!";
  }
  if (q.includes("discount") || q.includes("promo") || q.includes("coupon") || q.includes("code")) {
    return "🎁 You carry the sharp eye of an architect! Use coupon code <strong>CATALYSTOS10</strong> at checkout for 10% off your entire order, or <strong>SOLEDOMINANCE</strong> for VIP collector rates!";
  }
  if (q.includes("ship") || q.includes("delivery") || q.includes("lagos")) {
    return "Checkout is coming soon. Contact <strong>catalystcomicstudio@gmail.com</strong> to ask about availability, shipping and digital editions before ordering.";
  }
  if (q.includes("bayo") || q.includes("orisha") || q.includes("sango") || q.includes("ogun") || q.includes("power")) {
    return "⚔ Adebayo Adeyemi is 19 from Mushin. Unlike past warriors who bonded with single deities, Bayo holds the combined Aṣẹ of the Orisha pantheon: the thunder of <strong>Ṣàngó</strong>, the iron manipulation of <strong>Ògún</strong>, and the pure spiritual balance of <strong>Obatàlá</strong>. That is why the Pale Council in Eko Atlantic is terrified.";
  }
  if (q.includes("track") || q.includes("dispatch") || q.includes("where is my order") || q.includes("courier")) {
    return "Open <strong>My Orders</strong> after signing in with Reader Passport to view your confirmed order status. Checkout is coming soon; no sample delivery is treated as a real order.";
  }
  if (q.includes("vault") || q.includes("vip") || q.includes("secret") || q.includes("keycard") || q.includes("passkey")) {
    return "Your Reader Passport shows membership from your verified account. Sign in to check your access. Checkout is coming soon.";
  }
  if (q.includes("invoice") || q.includes("receipt") || q.includes("tax")) {
    return "Receipts will be issued with verified checkout. A saved cart or personal collector card is not a payment receipt.";
  }
  if (q.includes("sound") || q.includes("music") || q.includes("rain") || q.includes("ambient")) {
    return "🎧 Our built-in procedural Web Audio synthesizer generates authentic Lagos 2031 rain, Ṣàngó thunder, and Apapa industrial drones with zero latency. Click the <strong>Ambience</strong> button in the navbar to activate!";
  }

  return "⚡ <em>I am the Catalyst OS Commerce Concierge</em>. I can assist you with comic orders, digital downloads, sizing for the Ogun Forge Tee, or worldwide shipping. Which edition of <strong>Catalyst: The Awakening</strong> are you acquiring today?";
}

// ═══════════════════════════════════════════════════════════
// 11. TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════
function showToast(message) {
  let toast = document.getElementById("storeToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "storeToast";
    toast.className = "store-toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
  toast.classList.add("show");
  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// ═══════════════════════════════════════════════════════════
// 12. CATALYST STANDARD: WEB AUDIO API SYNTHESIZER
// ═══════════════════════════════════════════════════════════
let audioContext = null;
let ambientSoundOsc = null;
let isAmbientPlaying = false;

function getAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioContext = new AudioCtx();
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

function playHapticSound(type = 'chime') {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (type === 'chime') {
    // Aṣẹ resonance chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (type === 'swoosh') {
    // Comic page turn swoosh
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'thunder') {
    // Ṣàngó thunder resonance
    const bufferSize = ctx.sampleRate * 0.8;
    const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
  }
}

function toggleStoreAmbientSound() {
  const ctx = getAudioContext();
  const btn = document.getElementById("storeAudioBtn");
  if (!ctx) return;

  if (!isAmbientPlaying) {
    // Generate atmospheric Lagos noir cyber synth drone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 bass
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(110, ctx.currentTime); // A2

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, ctx.currentTime);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();

    ambientSoundOsc = { osc1, osc2, gain };
    isAmbientPlaying = true;
    if (btn) btn.classList.add("active");
    showToast("🎧 Lagos Noir Ambience Active");
  } else {
    if (ambientSoundOsc) {
      ambientSoundOsc.gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      setTimeout(() => {
        ambientSoundOsc.osc1.stop();
        ambientSoundOsc.osc2.stop();
        ambientSoundOsc = null;
      }, 400);
    }
    isAmbientPlaying = false;
    if (btn) btn.classList.remove("active");
    showToast("Ambience muted");
  }
}

// ═══════════════════════════════════════════════════════════
// 13. CATALYST STANDARD: CYBER-AṢẸ PARTICLE CANVAS
// ═══════════════════════════════════════════════════════════
function initStoreCanvas() {
  const canvas = document.getElementById("storeCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width, height;
  let particles = [];
  const particleCount = 42;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.6 - 0.2,
      color: Math.random() > 0.4 ? 'rgba(244, 184, 0, 0.45)' : 'rgba(0, 240, 255, 0.35)',
      life: Math.random() * 100
    });
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.y < 0) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();
}

// ═══════════════════════════════════════════════════════════
// 14. CATALYST STANDARD: COMMAND PALETTE (⌘K / CTRL+K)
// ═══════════════════════════════════════════════════════════
let cmdActiveIndex = 0;

function initCommandPalette() {
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      toggleCommandPalette();
    }
    const modal = document.getElementById("commandPaletteBackdrop");
    if (modal && modal.classList.contains("open")) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const max = (window._cmdResults || []).length;
        if (max > 0) {
          cmdActiveIndex = (cmdActiveIndex + 1) % max;
          updateCmdHighlight();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const max = (window._cmdResults || []).length;
        if (max > 0) {
          cmdActiveIndex = (cmdActiveIndex - 1 + max) % max;
          updateCmdHighlight();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        executeCmdItem(cmdActiveIndex);
      } else if (e.key === "Escape") {
        closeCommandPalette();
        closeRelicModal();
        closePreviewModal();
        closeCartDrawer();
        closeShopifyConfigModal();
        closeOrderTrackerModal();
        closeInvoiceModal();
        closeSoundscapeModal();
        closeReviewModal();
      }
    }
  });
}

function updateCmdHighlight() {
  const items = document.querySelectorAll(".cmd-result-item");
  items.forEach((item, idx) => {
    item.classList.toggle("selected", idx === cmdActiveIndex);
    if (idx === cmdActiveIndex) {
      item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
}

function toggleCommandPalette() {
  const modal = document.getElementById("commandPaletteBackdrop");
  if (!modal) return;
  modal.classList.toggle("open");
  if (modal.classList.contains("open")) {
    cmdActiveIndex = 0;
    const input = document.getElementById("cmdInput");
    if (input) {
      input.value = "";
      input.focus();
    }
    renderCmdResults("");
  }
}

function closeCommandPalette() {
  document.getElementById("commandPaletteBackdrop")?.classList.remove("open");
}

function handleCmdInput(e) {
  cmdActiveIndex = 0;
  renderCmdResults(e.target.value.toLowerCase().trim());
}

function renderCmdResults(query) {
  const container = document.getElementById("cmdResultsList");
  if (!container) return;

  const results = [];

  // 1. Navigation & Hub Commands
  if (!query || query.includes("track") || query.includes("dispatch") || query.includes("logistics")) {
    results.push({
      title: "📍 My Orders",
      desc: "View confirmed status for orders on your reader account",
      action: () => { openOrderTrackerModal(); closeCommandPalette(); }
    });
  }
  if (!query || query.includes("vault") || query.includes("vip") || query.includes("secret")) {
    results.push({
      title: "⚡ Aṣẹ VIP Collector Vault & Secret Relics",
      desc: "Unlock unreleased manuscripts & bronze replicas",
      action: () => {
        const vaultSection = document.getElementById("vault");
        vaultSection?.scrollIntoView({ behavior: "smooth" });
        closeCommandPalette();
      }
    });
  }
  if (!query || query.includes("invoice") || query.includes("receipt") || query.includes("print")) {
    results.push({
      title: "🖨️ Generate & Print Sovereign Tax Invoice / Slip",
      desc: "Itemized breakdown & cryptographic verification",
      action: () => { generateCartInvoice(); closeCommandPalette(); }
    });
  }
  if (!query || query.includes("sound") || query.includes("audio") || query.includes("ambient")) {
    results.push({
      title: "🎵 Lagos 2031 Ambient Soundscape Selector",
      desc: "Mushin Rain, Apapa Cyber-Drone, Eko Ocean Waves",
      action: () => { openSoundscapeModal(); closeCommandPalette(); }
    });
  }
  if (!query || query.includes("review") || query.includes("feedback") || query.includes("rate")) {
    results.push({
      title: "✍️ Write Verified Reader Review",
      desc: "Post impressions to Sovereign Ledger",
      action: () => { openReviewModal(); closeCommandPalette(); }
    });
  }

  // 2. Standard Catalog Search
  CATALYST_PRODUCTS.forEach(p => {
    if (!query || p.title.toLowerCase().includes(query) || p.category.includes(query) || (p.affinity && p.affinity.includes(query))) {
      results.push({
        title: p.title,
        desc: `Catalog relic · ${formatPrice(p.variants[0].prices[StoreState.currency])}`,
        action: () => { addToCart(p.id); closeCommandPalette(); }
      });
    }
  });

  // 3. VIP Vault Relics Search
  if (typeof VAULT_RELICS !== "undefined") {
    VAULT_RELICS.forEach(r => {
      if (!query || r.title.toLowerCase().includes(query) || query.includes("vault") || query.includes("secret")) {
        results.push({
          title: `[VIP VAULT] ${r.title}`,
          desc: `Confidential Relic · ${formatPrice(r.prices[StoreState.currency])}`,
          action: () => { addVaultRelicToCart(r.id); closeCommandPalette(); }
        });
      }
    });
  }

  // 4. Promo & Reader Actions
  if (!query || query.includes("coupon") || query.includes("discount") || query.includes("code")) {
    results.push({
      title: "⚡ Apply Secret Code: CATALYSTOS10 (10% OFF)",
      desc: "Instant 10% discount on cache subtotal",
      action: () => { applyCouponCodeDirect("CATALYSTOS10"); closeCommandPalette(); }
    });
  }
  if (!query || query.includes("preview") || query.includes("peek") || query.includes("read")) {
    results.push({
      title: "👁 Peek Inside: Issue #01 (5-Page Reader)",
      desc: "Cinematic sample panels from Scene 1 to Scene 3",
      action: () => { openPreviewModal(0); closeCommandPalette(); }
    });
  }
  if (!query || query.includes("shopify")) {
    results.push({
      title: "⚙ Configure Shopify Storefront Connection",
      desc: "Connected to catalyst-forge.myshopify.com",
      action: () => { openShopifyConfigModal(); closeCommandPalette(); }
    });
  }

  container.innerHTML = results.map((r, idx) => `
    <div class="cmd-result-item ${idx === cmdActiveIndex ? 'selected' : ''}" onclick="executeCmdItem(${idx})">
      <div>
        <div style="font-weight:600;color:#fff;">${r.title}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);">${r.desc}</div>
      </div>
      <span class="cmd-shortcut-tag">↵ SELECT</span>
    </div>
  `).join('');

  window._cmdResults = results;
}

function executeCmdItem(idx) {
  if (window._cmdResults && window._cmdResults[idx]) {
    window._cmdResults[idx].action();
  }
}

function applyCouponCodeDirect(code) {
  StoreState.appliedCoupon = { code, discount: 0.10 };
  showToast(`✓ Applied ${code}: 10% Discount!`);
  updateCartUI();
  openCartDrawer();
}

// ═══════════════════════════════════════════════════════════
// 15. CATALYST STANDARD: RELIC INSPECTOR & LORE MODAL
// ═══════════════════════════════════════════════════════════
const RELIC_LORE = {
  "catalyst-issue-01-digital": {
    loreTitle: "THE GENESIS ARBITRAGE (MUSHIN · 2031)",
    loreText: "The awakening occurs at 03:47 in Mushin under heavy tropical downpour. Adebayo Adeyemi was merely trying to survive the night before celestial lightning carved through the Lagos power grid. This DRM-free digital master contains all 88 canonical pages, color-graded for HDR displays.",
    materials: "1024x1536 Master Resolution · PDF / CBZ / Web HUD",
    origin: "Mushin Sector 4, Lagos"
  },
  "catalyst-issue-01-physical": {
    loreTitle: "THE CONCRETE & GOLD COVENANT",
    loreText: "Engineered under the strict print specifications of Oluwatobiloba. Printed on heavyweight 157 GSM satin archival stock with double-hit metallic gold foil stamping on the cover, ensuring it outlasts ordinary commercial paperbacks.",
    materials: "350 GSM Soft-Touch Hardcover · Archival Satin Art Stock · Sewn Lay-Flat",
    origin: "Eko Atlantic Master Print Works"
  },
  "catalyst-issue-02-preorder": {
    loreTitle: "THE ORACLE'S CONVERGENCE",
    loreText: "Zara enters the fray carrying the direct flame of Ṣàngó. As the Pale Council begins the systematic quarantine of the Third Mainland Bridge, Bayo must determine if other awakened beings are allies or extinction-level rivals.",
    materials: "Guaranteed Day-One Delivery · 32-Page Production Dossier Included",
    origin: "Badagry Oracle Sanctuary"
  },
  "catalyst-issue-03-edition": {
    loreTitle: "THE BLOOD OF THE ORISHAS",
    loreText: "In the subterranean forge beneath Surulere, the ancient covenant of Ògún and Ṣàngó collides with modern cybernetic warfare. Ikenna's iron discipline is tested against the Mirror Villain's psychological siege.",
    materials: "96-Page Master Edition · Metallic Crimson Spot UV · Fold-Out Pantheon Map",
    origin: "Surulere Sub-Grid Foundry"
  },
  "catalyst-issue-04-finale": {
    loreTitle: "THE ARCHITECT'S RECKONING",
    loreText: "The explosive 104-page Arc I finale. The sky above Victoria Island splits into a crimson meridian as The Architect unveils the true design of the Aṣẹ grid. Every faction converges on the Eko Atlantic Citadel.",
    materials: "104-Page Oversized Finale · Gatefold Cover · Gold Foil Spine",
    origin: "Eko Atlantic Sovereign Spire"
  },
  "catalyst-quad-omnibus": {
    loreTitle: "THE COMPLETE ARC I CODEX (ISSUES #01–#04)",
    loreText: "All 380+ pages of Arc I bound into a single sovereign collection. Includes Issues #01 through #04, director commentary by Oluwatobiloba, unpublished character design sheets, and the complete Lagos 2031 timeline.",
    materials: "4-Volume Slipcase & Digital Master · Sewn Binding · Gold Gilded Edges",
    origin: "Catalyst Forge Sovereign Archive"
  },
  "catalyst-supreme-bundle": {
    loreTitle: "THE CATALYST OS APOTHEOSIS",
    loreText: "The definitive physical relic of the universe. Includes both graphic novels, the complete classified 64-page Catalyst Protocol Strategy Dossier, and an authentic cast bronze Aṣẹ talisman individually forged in Lagos.",
    materials: "Museum Box · Cast Bronze Talisman · Signed & Numbered Certificate",
    origin: "Lagos Vault Sovereign Reserve (Strictly 250 Units)"
  },
  "catalyst-universe-dossier": {
    loreTitle: "CLASSIFIED UNIVERSE DOSSIER & SCRIPT BIBLE",
    loreText: "Declassified intelligence straight from the Catalyst Comics Studio vault. Contains full power-scaling charts for all 12 Orisha hosts, Pale Council hierarchy diagrams, Lagos 2031 sector maps, and raw script excerpts.",
    materials: "120-Page Lore Encyclopedia · Tactical Grid Diagrams · Instant PDF + Print",
    origin: "Catalyst Intelligence Directorate"
  },
  "catalyst-merch-ogun-tee": {
    loreTitle: "ÒGÚN'S HEAVYWEIGHT ARMOR",
    loreText: "Constructed for operatives and architects. 280 GSM heavyweight combed cotton that holds its structure in humid equatorial heat. Screenprinted with 3M reflective cyber-Aṣẹ circuitry that flares under flash photography.",
    materials: "280 GSM Combed Organic Cotton · 3M Reflective · Puff Print",
    origin: "Mushin Ironworks Streetwear Atelier"
  },
  "catalyst-merch-sango-hoodie": {
    loreTitle: "ṢÀNGÓ THUNDERSTRIKE SOVEREIGN HOODIE",
    loreText: "Engineered from 450 GSM heavyweight French Terry cotton with metallic gold embroidered double-axe insignia on the chest and luminous Aṣẹ lightning sigils across the back.",
    materials: "450 GSM Heavyweight French Terry · Gold Bullion Embroidery · Custom Matte Hardware",
    origin: "Lagos Island Tactical Apparel Lab"
  },
  "catalyst-variant-covers-pack": {
    loreTitle: "THE 9-COVER HOLOFOIL VARIANT PORTFOLIO",
    loreText: "A breathtaking gallery collection of all 9 official alternate covers from Arc I — featuring Amara's Awakening, The Fifth Faction, Memory Keeper, and Lagos Eternal — pressed on prismatic rainbow holofoil card stock.",
    materials: "9x 350 GSM Prismatic Holofoil Art Boards · Collector Portfolio Sleeve",
    origin: "Catalyst Studio Master Press"
  },
  "catalyst-art-print-architect": {
    loreTitle: "THE HOLOGRAPHIC MONOLITH",
    loreText: "A haunting wide-angle perspective of The Architect looking over the glowing artificial islands of Eko Atlantic. Printed on 310 GSM Hahnemühle Metallic Pearl paper that shimmers with an iridescent wet-street reflection.",
    materials: "310 GSM Metallic Pearl Fine Art Paper · Holographic Numbered Seal",
    origin: "Numbered Run 1 of 250"
  }
};

let RelicModal3DState = {
  initialized: false,
  scene: null,
  camera: null,
  renderer: null,
  bookMesh: null,
  talismanMesh: null,
  particleSystem: null,
  wireframe: false,
  isDragging: false,
  targetRotationX: 0.15,
  targetRotationY: -0.35,
  currentRotationX: 0.15,
  currentRotationY: -0.35,
  pulseScale: 1.0,
  clock: null,
  animId: null,
  materials: {},
  textures: {}
};

function openRelicModal(productId) {
  const product = CATALYST_PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  StoreState.activeRelicProductId = productId;
  const lore = RELIC_LORE[productId] || {
    loreTitle: "CANONICAL ARCHIVE ENTRY",
    loreText: product.excerpt,
    materials: (product.specs || []).join(" · "),
    origin: "Lagos 2031 Sovereign Vault"
  };

  const modal = document.getElementById("relicModalBackdrop");
  if (!modal) return;

  document.getElementById("relicTitle").textContent = product.title;
  document.getElementById("relicTag").textContent = `CATALYST ${product.category.toUpperCase()} RELIC // ${product.badge}`;
  document.getElementById("relicImg").src = product.image;
  document.getElementById("relicLoreTitle").textContent = lore.loreTitle;
  document.getElementById("relicLoreBody").textContent = lore.loreText;
  document.getElementById("relicSpecMaterials").textContent = lore.materials;
  document.getElementById("relicSpecOrigin").textContent = lore.origin;
  document.getElementById("relicPriceDisplay").textContent = formatPrice(product.variants[0].prices[StoreState.currency]);

  // Default to 2D cover view on open
  switchRelicModalView('2d');

  document.getElementById("relicAddToCartBtn").onclick = () => {
    addToCart(productId);
    closeRelicModal();
  };

  modal.classList.add("open");
  playHapticSound('chime');
}

function closeRelicModal() {
  document.getElementById("relicModalBackdrop")?.classList.remove("open");
  switchRelicModalView('2d');
}

function switchRelicModalView(mode) {
  const view2d = document.getElementById("relic2dView");
  const view3d = document.getElementById("relic3dView");
  const btn2d = document.getElementById("relicMode2dBtn");
  const btn3d = document.getElementById("relicMode3dBtn");

  if (mode === "3d") {
    if (view2d) view2d.style.display = "none";
    if (view3d) view3d.style.display = "block";
    btn2d?.classList.remove("active");
    btn3d?.classList.add("active");
    initOrUpdateRelicModal3d(StoreState.activeRelicProductId);
    playHapticSound('thunder');
  } else {
    if (view2d) view2d.style.display = "block";
    if (view3d) view3d.style.display = "none";
    btn2d?.classList.add("active");
    btn3d?.classList.remove("active");
    playHapticSound('click');
  }
}

function initOrUpdateRelicModal3d(productId) {
  const canvas = document.getElementById("relicModalCanvas");
  const wrap = document.getElementById("relic3dView");
  if (!canvas || !wrap || typeof THREE === "undefined") return;

  const product = CATALYST_PRODUCTS.find(p => p.id === productId) || CATALYST_PRODUCTS[0];
  const isTalisman = product.id === "catalyst-supreme-bundle";

  if (!RelicModal3DState.initialized) {
    const width = wrap.clientWidth || 320;
    const height = wrap.clientHeight || 340;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.3);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xF4B800, 1.6);
    goldKeyLight.position.set(3, 4, 5);
    scene.add(goldKeyLight);

    const cyanRimLight = new THREE.DirectionalLight(0x00F0FF, 1.1);
    cyanRimLight.position.set(-3, -2, -3);
    scene.add(cyanRimLight);

    // Book geometry
    const bookGeo = new THREE.BoxGeometry(1.9, 2.7, 0.25);
    const pageMat = new THREE.MeshStandardMaterial({ color: 0xF7E7CE, roughness: 0.8, metalness: 0.1 });
    const spineMat = new THREE.MeshStandardMaterial({ color: 0x090D16, roughness: 0.4, metalness: 0.3 });
    const backMat = new THREE.MeshStandardMaterial({ color: 0x0A0E18, roughness: 0.5, metalness: 0.2 });
    const coverMat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.25 });

    const bookMaterials = [pageMat, spineMat, pageMat, pageMat, coverMat, backMat];
    const bookMesh = new THREE.Mesh(bookGeo, bookMaterials);
    bookMesh.rotation.set(RelicModal3DState.currentRotationX, RelicModal3DState.currentRotationY, 0);
    scene.add(bookMesh);

    // Bronze Talisman geometry
    const talismanGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.16, 36);
    const talismanMat = new THREE.MeshStandardMaterial({ color: 0xCD7F32, roughness: 0.35, metalness: 0.75 });
    const talismanMesh = new THREE.Mesh(talismanGeo, talismanMat);
    talismanMesh.rotation.x = Math.PI / 2;
    talismanMesh.visible = false;
    scene.add(talismanMesh);

    // Particle Aura
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.6 + Math.random() * 1.3;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      particlePos[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      particlePos[i * 3 + 1] = radius * Math.sin(phi);
      particlePos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      const isGold = Math.random() > 0.4;
      particleColors[i * 3] = isGold ? 0.96 : 0.0;
      particleColors[i * 3 + 1] = isGold ? 0.72 : 0.94;
      particleColors[i * 3 + 2] = isGold ? 0.0 : 1.0;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    RelicModal3DState.scene = scene;
    RelicModal3DState.camera = camera;
    RelicModal3DState.renderer = renderer;
    RelicModal3DState.bookMesh = bookMesh;
    RelicModal3DState.talismanMesh = talismanMesh;
    RelicModal3DState.particleSystem = particleSystem;
    RelicModal3DState.materials.cover = coverMat;
    RelicModal3DState.materials.talisman = talismanMat;
    RelicModal3DState.materials.all = [...bookMaterials, talismanMat];
    RelicModal3DState.clock = new THREE.Clock();
    RelicModal3DState.initialized = true;

    // Interactive Drag Controls
    let prevPos = { x: 0, y: 0 };
    const onDown = (e) => {
      RelicModal3DState.isDragging = true;
      prevPos = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e) => {
      if (!RelicModal3DState.isDragging) return;
      const dx = e.clientX - prevPos.x;
      const dy = e.clientY - prevPos.y;
      RelicModal3DState.targetRotationY += dx * 0.012;
      RelicModal3DState.targetRotationX += dy * 0.012;
      RelicModal3DState.targetRotationX = Math.max(-1.1, Math.min(1.1, RelicModal3DState.targetRotationX));
      prevPos = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => { RelicModal3DState.isDragging = false; };

    wrap.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    wrap.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) onDown(e.touches[0]);
    }, { passive: true });
    window.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1 && RelicModal3DState.isDragging) onMove(e.touches[0]);
    }, { passive: true });
    window.addEventListener("touchend", onUp);

    // Zoom
    wrap.addEventListener("wheel", (e) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.003;
      camera.position.z = Math.max(2.8, Math.min(6.5, camera.position.z));
    }, { passive: false });

    // ResizeObserver
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    ro.observe(wrap);

    // Loop
    function modalRenderLoop() {
      RelicModal3DState.animId = requestAnimationFrame(modalRenderLoop);
      const dt = RelicModal3DState.clock.getDelta();

      RelicModal3DState.currentRotationX += (RelicModal3DState.targetRotationX - RelicModal3DState.currentRotationX) * 0.1;
      RelicModal3DState.currentRotationY += (RelicModal3DState.targetRotationY - RelicModal3DState.currentRotationY) * 0.1;

      if (!RelicModal3DState.isDragging) {
        RelicModal3DState.targetRotationY += 0.004;
      }

      RelicModal3DState.pulseScale += (1.0 - RelicModal3DState.pulseScale) * 0.08;

      const active = isTalisman ? talismanMesh : bookMesh;
      if (active) {
        active.rotation.x = RelicModal3DState.currentRotationX;
        active.rotation.y = RelicModal3DState.currentRotationY;
        active.scale.set(RelicModal3DState.pulseScale, RelicModal3DState.pulseScale, RelicModal3DState.pulseScale);
      }

      if (particleSystem) {
        particleSystem.rotation.y += dt * 0.2;
      }

      renderer.render(scene, camera);
    }
    modalRenderLoop();
  }

  // Update mesh visibility & texture
  if (isTalisman) {
    RelicModal3DState.bookMesh.visible = false;
    RelicModal3DState.talismanMesh.visible = true;
  } else {
    RelicModal3DState.bookMesh.visible = true;
    RelicModal3DState.talismanMesh.visible = false;

    if (RelicModal3DState.textures[product.id]) {
      RelicModal3DState.materials.cover.map = RelicModal3DState.textures[product.id];
      RelicModal3DState.materials.cover.needsUpdate = true;
    } else {
      const loader = new THREE.TextureLoader();
      loader.load(product.image, (tex) => {
        RelicModal3DState.textures[product.id] = tex;
        RelicModal3DState.materials.cover.map = tex;
        RelicModal3DState.materials.cover.needsUpdate = true;
      });
    }
  }

  // Trigger pulse
  RelicModal3DState.pulseScale = 1.25;
}

function toggleRelicModalWireframe() {
  RelicModal3DState.wireframe = !RelicModal3DState.wireframe;
  const btn = document.getElementById("relicModalWireframeBtn");
  btn?.classList.toggle("active", RelicModal3DState.wireframe);

  if (RelicModal3DState.materials.all) {
    RelicModal3DState.materials.all.forEach(m => {
      m.wireframe = RelicModal3DState.wireframe;
    });
  }
  playHapticSound('click');
  showToast(RelicModal3DState.wireframe ? "◈ Modal Hologram: Wireframe Scan" : "◈ Modal Hologram: Solid Render");
}

function resetRelicModal3dView() {
  RelicModal3DState.targetRotationX = 0.15;
  RelicModal3DState.targetRotationY = -0.35;
  if (RelicModal3DState.camera) {
    RelicModal3DState.camera.position.set(0, 0, 4.3);
  }
  playHapticSound('swoosh');
  showToast("↺ Modal 3D Perspective Centered");
}

// ═══════════════════════════════════════════════════════════
// 16. CERTIFICATE OF AUTHENTICITY GENERATOR & EXPORT
// ═══════════════════════════════════════════════════════════
function openCertificateModal() {
  const modal = document.getElementById("certificateModalBackdrop");
  if (!modal) return;

  const certNumber = "CAT-" + Math.floor(100000 + Math.random() * 900000);
  document.getElementById("certSerial").textContent = certNumber;
  document.getElementById("certDate").textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const currentCollector = document.getElementById("certCollectorInput")?.value || "Adebayo Adeyemi";
  updateCertCollectorName(currentCollector);

  modal.classList.add("open");
  playHapticSound('thunder');
}

function closeCertificateModal() {
  document.getElementById("certificateModalBackdrop")?.classList.remove("open");
}

function updateCertCollectorName(name) {
  const display = document.getElementById("certCollectorDisplay");
  if (display) {
    display.textContent = name.trim() || "Adebayo Adeyemi";
  }
}

function downloadCertificatePng() {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1000;
  const ctx = canvas.getContext("2d");

  // 1. Deep Obsidian Radial Background
  const bgGrad = ctx.createRadialGradient(800, 500, 50, 800, 500, 900);
  bgGrad.addColorStop(0, "#131b2e");
  bgGrad.addColorStop(0.6, "#0a0e18");
  bgGrad.addColorStop(1, "#05070c");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1600, 1000);

  // 2. Outer Ornate Gold Border
  ctx.strokeStyle = "#F4B800";
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, 1520, 920);

  // 3. Inner Dashed Aṣẹ Line
  ctx.strokeStyle = "rgba(244, 184, 0, 0.4)";
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 8]);
  ctx.strokeRect(60, 60, 1480, 880);
  ctx.setLineDash([]);

  // 4. Corner Tech Brackets
  const bracketSize = 36;
  ctx.fillStyle = "#F4B800";
  // Top-left
  ctx.fillRect(40, 40, bracketSize, 6);
  ctx.fillRect(40, 40, 6, bracketSize);
  // Top-right
  ctx.fillRect(1560 - bracketSize, 40, bracketSize, 6);
  ctx.fillRect(1554, 40, 6, bracketSize);
  // Bottom-left
  ctx.fillRect(40, 954, bracketSize, 6);
  ctx.fillRect(40, 960 - bracketSize, 6, bracketSize);
  // Bottom-right
  ctx.fillRect(1560 - bracketSize, 954, bracketSize, 6);
  ctx.fillRect(1554, 960 - bracketSize, 6, bracketSize);

  // 5. Header & Titles
  ctx.textAlign = "center";
  ctx.fillStyle = "#00F0FF";
  ctx.font = "600 22px 'Space Grotesk', -apple-system, sans-serif";
  ctx.fillText("CATALYST COMICS STUDIO // LAGOS SOVEREIGN ARCHIVE", 800, 130);

  ctx.fillStyle = "#F4B800";
  ctx.font = "bold 58px 'Cinzel Decorative', Georgia, serif";
  ctx.fillText("PERSONAL COLLECTOR CARD", 800, 210);

  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.font = "500 20px 'Space Grotesk', -apple-system, sans-serif";
  ctx.fillText("CATALYST: THE AWAKENING // CANONICAL ARTIFACT SAGA LEDGER", 800, 260);

  // 6. Central Aṣẹ Sigil Seal
  ctx.save();
  ctx.beginPath();
  ctx.arc(800, 360, 55, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(244, 184, 0, 0.12)";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#F4B800";
  ctx.stroke();

  ctx.fillStyle = "#F4B800";
  ctx.font = "bold 44px 'Cinzel Decorative', serif";
  ctx.fillText("AṢẸ", 800, 376);
  ctx.restore();

  // 7. Authentication Statement
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "18px 'Space Grotesk', sans-serif";
  ctx.fillText("A personal keepsake from Catalyst: The Awakening.", 800, 460);
  ctx.fillText("This card is not proof of purchase, membership or delivery.", 800, 490);

  // 8. Registered Collector Box
  const collector = document.getElementById("certCollectorInput")?.value.trim() || "Adebayo Adeyemi";
  ctx.fillStyle = "rgba(18, 26, 42, 0.85)";
  ctx.fillRect(350, 530, 900, 90);
  ctx.strokeStyle = "rgba(244, 184, 0, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(350, 530, 900, 90);

  ctx.fillStyle = "#8E99A8";
  ctx.font = "600 15px 'Space Grotesk', monospace";
  ctx.fillText("REGISTERED SOVEREIGN COLLECTOR & KEEPER OF AṢẸ:", 800, 560);

  ctx.fillStyle = "#F4B800";
  ctx.font = "bold 32px 'Space Grotesk', sans-serif";
  ctx.fillText(collector.toUpperCase(), 800, 600);

  // 9. Serial, Date & Ledger Node Row
  const serial = document.getElementById("certSerial")?.textContent || "CAT-889124";
  const dateStr = document.getElementById("certDate")?.textContent || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  ctx.fillStyle = "#121A2A";
  ctx.fillRect(200, 660, 1200, 65);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.strokeRect(200, 660, 1200, 65);

  ctx.font = "16px 'Space Grotesk', monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = "#8E99A8";
  ctx.fillText("SERIAL LEDGER: ", 250, 700);
  ctx.fillStyle = "#F4B800";
  ctx.fillText(serial, 390, 700);

  ctx.fillStyle = "#8E99A8";
  ctx.fillText("ISSUED: ", 680, 700);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(dateStr, 755, 700);

  ctx.fillStyle = "#8E99A8";
  ctx.fillText("LEDGER NODE: ", 1060, 700);
  ctx.fillStyle = "#00F0FF";
  ctx.fillText("LAGOS SOVEREIGN // MUSHIN", 1190, 700);

  // 10. Executive Authority Signatures
  ctx.textAlign = "center";
  ctx.fillStyle = "#F4B800";
  ctx.font = "bold 26px 'Cinzel Decorative', Georgia, serif";
  ctx.fillText("OLUWATOBILOBA — THE CATALYST", 800, 810);

  ctx.fillStyle = "#8E99A8";
  ctx.font = "14px 'Space Grotesk', monospace";
  ctx.fillText("Executive Authority · Catalyst OS & Catalyst Comics Studio", 800, 835);

  ctx.fillStyle = "rgba(244, 184, 0, 0.7)";
  ctx.font = "13px 'Space Grotesk', monospace";
  ctx.fillText("CONFIDENTIAL SECURE PROVENANCE · ENCRYPTED UNDER SHOPIFY LEVEL 1 & AṢẸ LEDGER PROTOCOLS", 800, 900);

  // 11. Trigger Instant PNG Download
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = `Catalyst_Certificate_of_Authenticity_${serial}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  playHapticSound('thunder');
  showToast(`⚡ Certificate ${serial} for ${collector} successfully downloaded!`);
}

// ═══════════════════════════════════════════════════════════
// 17. CUSTOM 3-COVER HOLOFOIL VAULT CRATE BUILDER
// ═══════════════════════════════════════════════════════════
function toggleCrateCover(coverImg, coverTitle, el) {
  const idx = StoreState.customCrateCovers.findIndex(c => c.title === coverTitle);
  if (idx > -1) {
    StoreState.customCrateCovers.splice(idx, 1);
    el?.classList.remove("selected");
    playHapticSound('click');
  } else {
    if (StoreState.customCrateCovers.length >= 3) {
      showToast("⚡ Your 3-Cover Crate is full! Deselect a cover or add crate to cache.");
      return;
    }
    StoreState.customCrateCovers.push({ img: coverImg, title: coverTitle });
    el?.classList.add("selected");
    playHapticSound('chime');
  }
  updateCrateBuilderUI();
}

function updateCrateBuilderUI() {
  const countEl = document.getElementById("crateSlotCount");
  const slotsEl = document.getElementById("crateSelectedSlots");
  const btnEl = document.getElementById("crateAddBtn");
  if (countEl) countEl.textContent = `${StoreState.customCrateCovers.length} / 3 SELECTED`;
  if (slotsEl) {
    slotsEl.innerHTML = [0, 1, 2].map(i => {
      const picked = StoreState.customCrateCovers[i];
      if (picked) {
        return `<div class="crate-slot filled"><img src="${picked.img}" alt="${picked.title}"><span>${picked.title}</span></div>`;
      }
      return `<div class="crate-slot empty"><span>SLOT #0${i + 1}</span><small>Click a cover below</small></div>`;
    }).join("");
  }
  if (btnEl) {
    btnEl.disabled = StoreState.customCrateCovers.length < 3;
    btnEl.style.opacity = StoreState.customCrateCovers.length === 3 ? "1" : "0.55";
  }
}

function addCustomCrateToCart() {
  if (StoreState.customCrateCovers.length < 3) {
    showToast("Select 3 variant covers first to forge your Custom Holofoil Crate!");
    return;
  }
  const coverNames = StoreState.customCrateCovers.map(c => c.title).join(" + ");
  const customCartKey = `catalyst-variant-covers-pack::custom-${Date.now()}`;
  StoreState.cart.push({
    cartKey: customCartKey,
    productId: "catalyst-variant-covers-pack",
    title: "Custom 3-Cover Holofoil Collector Crate",
    variantName: `3-Pack: ${coverNames}`,
    sku: "CAT-VAR-3CRATE-CUSTOM",
    image: StoreState.customCrateCovers[0].img,
    prices: { USD: 34.99, NGN: 42000, GBP: 28.00, EUR: 32.50 },
    qty: 1
  });
  saveCart();
  updateCartUI();
  playHapticSound('thunder');
  showToast("⚡ Custom 3-Cover Holofoil Crate added to your cache!");
  openCartDrawer();
}

// ═══════════════════════════════════════════════════════════
// 18. THREE.JS 3D RELIC ENGINE & HOLO-DECK CONTROLLER
// ═══════════════════════════════════════════════════════════
const RELIC_3D_CATALOG = {
  issue1: {
    productId: "catalyst-issue-01-physical",
    title: "Issue #01 Deluxe Foil Hardcover",
    badge: "MASTER ISSUE #01",
    img: "./assets/cover-issue1.webp",
    color: 0xF4B800,
    type: "book"
  },
  issue2: {
    productId: "catalyst-issue-02-preorder",
    title: "Issue #02: Ṣàngó's Daughter",
    badge: "ARC II PRE-ORDER",
    img: "./assets/cover-issue2.webp",
    color: 0xFF3B30,
    type: "book"
  },
  issue3: {
    productId: "catalyst-issue-03-edition",
    title: "Issue #03: Blood of the Orishas",
    badge: "ÒGÚN FORGE EDITION",
    img: "./assets/cover-issue3.webp",
    color: 0xE65100,
    type: "book"
  },
  issue4: {
    productId: "catalyst-issue-04-finale",
    title: "Issue #04: The Architect's Reckoning",
    badge: "ARC I FINALE OVERSIZED",
    img: "./assets/cover-issue4.webp",
    color: 0x9C27B0,
    type: "book"
  },
  talisman: {
    productId: "catalyst-supreme-bundle",
    title: "Cast Bronze Sovereign Aṣẹ Talisman",
    badge: "FORGED RELIC // 1/250",
    img: "./assets/team-highway.webp",
    color: 0xCD7F32,
    type: "talisman"
  }
};

let Relic3DState = {
  currentKey: "issue1",
  wireframe: false,
  isDragging: false,
  targetRotationX: 0.15,
  targetRotationY: -0.35,
  currentRotationX: 0.15,
  currentRotationY: -0.35,
  pulseScale: 1.0,
  scene: null,
  camera: null,
  renderer: null,
  bookMesh: null,
  talismanMesh: null,
  particleSystem: null,
  clock: null,
  materials: {},
  textures: {}
};

function init3dRelicEngine() {
  const canvas = document.getElementById("relic3dCanvas");
  const wrap = document.getElementById("holoCanvasWrap");
  if (!canvas || !wrap) return;

  // Fallback check: if THREE is not loaded, use CSS 3D fallback
  if (typeof THREE === "undefined") {
    wrap.classList.add("fallback-active");
    initCss3dFallback(wrap);
    return;
  }

  try {
    const width = wrap.clientWidth || 360;
    const height = wrap.clientHeight || 380;

    // 1. Scene, Camera (FOV 48 for close-up), Renderer (PBR-ready)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.3);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    // 2. Cyber-Afrofuturistic PBR Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xF4B800, 1.5);
    goldKeyLight.position.set(3, 4, 5);
    scene.add(goldKeyLight);

    const cyanRimLight = new THREE.DirectionalLight(0x00F0FF, 1.0);
    cyanRimLight.position.set(-3, -2, -3);
    scene.add(cyanRimLight);

    // 3. 3D Hardcover Book Mesh
    const bookGeo = new THREE.BoxGeometry(1.95, 2.75, 0.26);

    // Create materials for book sides
    const textureLoader = new THREE.TextureLoader();
    const coverTex = textureLoader.load(RELIC_3D_CATALOG.issue1.img, () => renderer.render(scene, camera));
    Relic3DState.textures.issue1 = coverTex;

    const pageMat = new THREE.MeshStandardMaterial({ color: 0xF7E7CE, roughness: 0.8, metalness: 0.1 });
    const spineMat = new THREE.MeshStandardMaterial({ color: 0x090D16, roughness: 0.4, metalness: 0.3 });
    const backMat = new THREE.MeshStandardMaterial({ color: 0x0A0E18, roughness: 0.5, metalness: 0.2 });
    const coverMat = new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.35, metalness: 0.25 });

    // Materials order: +X (pages), -X (spine), +Y (pages), -Y (pages), +Z (front cover), -Z (back cover)
    const bookMaterials = [pageMat, spineMat, pageMat, pageMat, coverMat, backMat];
    const bookMesh = new THREE.Mesh(bookGeo, bookMaterials);
    bookMesh.rotation.set(Relic3DState.currentRotationX, Relic3DState.currentRotationY, 0);
    scene.add(bookMesh);

    // 4. Bronze Talisman 3D Mesh (Cylinder)
    const talismanGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.15, 36);
    const talismanMat = new THREE.MeshStandardMaterial({
      color: 0xCD7F32,
      roughness: 0.35,
      metalness: 0.75,
      bumpScale: 0.05
    });
    const talismanMesh = new THREE.Mesh(talismanGeo, talismanMat);
    talismanMesh.rotation.x = Math.PI / 2;
    talismanMesh.visible = false;
    scene.add(talismanMesh);

    // 5. Orbiting Aṣẹ Energy Particles (BufferGeometry)
    const particleCount = 350;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.6 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      particlePos[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      particlePos[i * 3 + 1] = radius * Math.sin(phi);
      particlePos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      const isGold = Math.random() > 0.35;
      particleColors[i * 3] = isGold ? 0.96 : 0.0;
      particleColors[i * 3 + 1] = isGold ? 0.72 : 0.94;
      particleColors[i * 3 + 2] = isGold ? 0.0 : 1.0;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Store references
    Relic3DState.scene = scene;
    Relic3DState.camera = camera;
    Relic3DState.renderer = renderer;
    Relic3DState.bookMesh = bookMesh;
    Relic3DState.talismanMesh = talismanMesh;
    Relic3DState.particleSystem = particleSystem;
    Relic3DState.materials.cover = coverMat;
    Relic3DState.materials.talisman = talismanMat;
    Relic3DState.materials.all = [...bookMaterials, talismanMat];
    Relic3DState.clock = new THREE.Clock();

    // 6. Interactive Mouse & Touch Drag Controls
    let prevPointer = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      Relic3DState.isDragging = true;
      prevPointer = { x: e.clientX, y: e.clientY };
      document.getElementById("holoDragHint")?.style.setProperty("opacity", "0");
    };

    const onPointerMove = (e) => {
      if (!Relic3DState.isDragging) return;
      const dx = e.clientX - prevPointer.x;
      const dy = e.clientY - prevPointer.y;
      Relic3DState.targetRotationY += dx * 0.01;
      Relic3DState.targetRotationX += dy * 0.01;
      Relic3DState.targetRotationX = Math.max(-1.1, Math.min(1.1, Relic3DState.targetRotationX));
      prevPointer = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => { Relic3DState.isDragging = false; };

    wrap.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Touch support
    wrap.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) onPointerDown(e.touches[0]);
    }, { passive: true });
    window.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1 && Relic3DState.isDragging) onPointerMove(e.touches[0]);
    }, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // Scroll to Zoom
    wrap.addEventListener("wheel", (e) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.003;
      camera.position.z = Math.max(2.8, Math.min(6.5, camera.position.z));
    }, { passive: false });

    // 7. Container-Aware ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(wrap);

    // 8. Reduced Motion Detection
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;
    motionQuery.addEventListener('change', (e) => { reducedMotion = e.matches; });

    // 9. Render Loop with Delta Time and Smooth Lerp
    let animFrameId = null;
    function renderLoop() {
      animFrameId = requestAnimationFrame(renderLoop);
      const dt = Relic3DState.clock.getDelta();

      // Smooth lerp toward target rotation
      Relic3DState.currentRotationX += (Relic3DState.targetRotationX - Relic3DState.currentRotationX) * 0.1;
      Relic3DState.currentRotationY += (Relic3DState.targetRotationY - Relic3DState.currentRotationY) * 0.1;

      // Subtle ambient auto-rotation when not dragging
      if (!Relic3DState.isDragging && !reducedMotion) {
        Relic3DState.targetRotationY += 0.003;
      }

      // Smooth spring return for pulse scale
      Relic3DState.pulseScale += (1.0 - Relic3DState.pulseScale) * 0.08;

      const activeMesh = Relic3DState.currentKey === "talisman" ? talismanMesh : bookMesh;
      if (activeMesh) {
        activeMesh.rotation.x = Relic3DState.currentRotationX;
        activeMesh.rotation.y = Relic3DState.currentRotationY;
        activeMesh.scale.set(Relic3DState.pulseScale, Relic3DState.pulseScale, Relic3DState.pulseScale);
      }

      // Particle aura orbit
      if (particleSystem && !reducedMotion) {
        particleSystem.rotation.y += dt * 0.15;
        particleSystem.rotation.x = Math.sin(Relic3DState.clock.getElapsedTime() * 0.4) * 0.1;
      }

      renderer.render(scene, camera);
    }
    renderLoop();

    // 10. Pause loop when tab is hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrameId);
      } else {
        Relic3DState.clock.getDelta();
        renderLoop();
      }
    });

  } catch (err) {
    console.warn("WebGL initialization note:", err);
    wrap.classList.add("fallback-active");
    initCss3dFallback(wrap);
  }
}

function initCss3dFallback(wrap) {
  wrap.classList.add("fallback-active");
  const fallback = document.getElementById("heroBookFallback");
  if (!fallback) return;

  let isDown = false;
  let startX = 0;
  let startY = 0;
  let currentRotY = 0;
  let currentRotX = 0;

  wrap.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    currentRotY += dx * 0.4;
    currentRotX -= dy * 0.4;
    fallback.style.transform = `perspective(1000px) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
    startX = e.clientX;
    startY = e.clientY;
  });

  window.addEventListener("mouseup", () => { isDown = false; });
}

function switch3dRelic(relicKey, btn) {
  const relic = RELIC_3D_CATALOG[relicKey];
  if (!relic) return;

  Relic3DState.currentKey = relicKey;
  document.querySelectorAll(".holo-relic-pill").forEach(p => p.classList.remove("active"));
  if (btn) btn.classList.add("active");

  // Update Fallback Cover & Badge
  const fallbackImg = document.getElementById("fallbackCoverImg");
  const fallbackBadge = document.getElementById("fallbackBadge");
  if (fallbackImg) fallbackImg.src = relic.img;
  if (fallbackBadge) fallbackBadge.textContent = relic.badge;

  // Update Three.js Meshes
  if (Relic3DState.scene && typeof THREE !== "undefined") {
    if (relic.type === "talisman") {
      Relic3DState.bookMesh.visible = false;
      Relic3DState.talismanMesh.visible = true;
    } else {
      Relic3DState.bookMesh.visible = true;
      Relic3DState.talismanMesh.visible = false;

      // Load or reuse texture
      if (Relic3DState.textures[relicKey]) {
        Relic3DState.materials.cover.map = Relic3DState.textures[relicKey];
        Relic3DState.materials.cover.needsUpdate = true;
      } else {
        const loader = new THREE.TextureLoader();
        loader.load(relic.img, (tex) => {
          Relic3DState.textures[relicKey] = tex;
          Relic3DState.materials.cover.map = tex;
          Relic3DState.materials.cover.needsUpdate = true;
        });
      }
    }
  }

  trigger3dAsePulse();
  showToast(`⚡ Loaded 3D Relic: ${relic.title}`);
}

function toggle3dWireframe() {
  Relic3DState.wireframe = !Relic3DState.wireframe;
  const btn = document.getElementById("holoWireframeBtn");
  if (btn) btn.classList.toggle("active", Relic3DState.wireframe);

  if (Relic3DState.materials.all) {
    Relic3DState.materials.all.forEach(m => {
      m.wireframe = Relic3DState.wireframe;
    });
  }
  playHapticSound('click');
  showToast(Relic3DState.wireframe ? "◈ Holographic Wireframe Scan: ON" : "◈ Solid Render: RESTORED");
}

function trigger3dAsePulse() {
  Relic3DState.pulseScale = 1.25;
  playHapticSound('thunder');

  // Flash lighting briefly
  const wrap = document.getElementById("holoCanvasWrap");
  if (wrap) {
    wrap.style.boxShadow = "0 0 45px rgba(244, 184, 0, 0.6), inset 0 0 30px rgba(0, 240, 255, 0.4)";
    setTimeout(() => { wrap.style.boxShadow = ""; }, 400);
  }
}

function reset3dView() {
  Relic3DState.targetRotationX = 0.15;
  Relic3DState.targetRotationY = -0.35;
  if (Relic3DState.camera) {
    Relic3DState.camera.position.set(0, 0, 4.3);
  }
  playHapticSound('swoosh');
  showToast("↺ 3D Perspective Centered");
}

function addActive3dRelicToCart() {
  const relic = RELIC_3D_CATALOG[Relic3DState.currentKey];
  if (relic && relic.productId) {
    addToCart(relic.productId);
    showToast(`⚡ Added 3D Relic: ${relic.title} to cache!`);
  }
}

// Hook audio sound feedback to existing cart & preview actions
const _origAddToCart = addToCart;
addToCart = function(productId) {
  playHapticSound('chime');
  return _origAddToCart(productId);
};

const _origPrevPreviewPage = prevPreviewPage;
prevPreviewPage = function() {
  playHapticSound('swoosh');
  return _origPrevPreviewPage();
};

const _origNextPreviewPage = nextPreviewPage;
nextPreviewPage = function() {
  playHapticSound('swoosh');
  return _origNextPreviewPage();
};

// Initialize Canvas, Sound, Command Palette & 3D Engine on DOM load
window.addEventListener("DOMContentLoaded", () => {
  initStoreCanvas();
  initCommandPalette();
  updateCrateBuilderUI();
  init3dRelicEngine();
});



// ═══════════════════════════════════════════════════════════
// 19. AṢẸ VIP COLLECTOR VAULT ENGINE
// ═══════════════════════════════════════════════════════════
const VAULT_RELICS = [
  {
    id: "catalyst-vault-scriptbook",
    title: 'Issue #05: "The Golden Eclipse" (Confidential Script & Storyboard Book)',
    category: "vault",
    badge: "CONFIDENTIAL // 1/100",
    excerpt: "Classified 64-page early production script bible, raw thumbnail breakdowns, and unreleased dialogue drafts by Oluwatobiloba for Arc II. Strictly 100 printed copies.",
    specs: ["64 Classified Master Pages", "Embossed Silver Foil Seal", "Individual Serial Number", "Instant Arc II Reader Beta Key"],
    image: "./assets/cover-issue1.webp",
    prices: { USD: 12.99, NGN: 15000, GBP: 10.50, EUR: 12.00 }
  },
  {
    id: "catalyst-vault-mirror-mask",
    title: "The Pale Council Mirror Mask — Hand-Forged Museum Replica (Limited 1/50)",
    category: "vault",
    badge: "RELIC ARTIFACT // 1/50",
    excerpt: "Individually forged in solid cast bronze with custom high-polish obsidian mirror finish. Wearable collector sculpture mounted on a charred Nigerian mahogany display plinth.",
    specs: ["Solid Cast Bronze", "High-Polish Obsidian Mirror", "Mahogany Display Plinth", "Certificate Signed by Oluwatobiloba"],
    image: "./assets/architect-portrait.webp",
    prices: { USD: 149.99, NGN: 180000, GBP: 120.00, EUR: 139.00 }
  },
  {
    id: "catalyst-vault-gold-bookplate",
    title: "Director's 1-of-1 Gold Foil Bookplate + Signature Archive Card",
    category: "vault",
    badge: "DIRECTOR RESERVE",
    excerpt: "Archival 350 GSM cotton rag bookplate double-hit stamped in pure 24K gold foil, hand-signed and numbered in crimson ink by creator Oluwatobiloba (@catalystggg).",
    specs: ["24K Gold Foil Stamped", "Hand-Signed in Crimson Ink", "Self-Adhesive Archival Backing", "Shipped in Rigid Gold Foil Sleeve"],
    image: "./assets/circle.webp",
    prices: { USD: 39.99, NGN: 45000, GBP: 32.00, EUR: 36.00 }
  }
];

function initVipVault() {
  const isUnlocked = window.CatalystAccount?.user?.app_metadata?.is_premium === true;
  const lockedView = document.getElementById("vaultLockedView");
  const unlockedView = document.getElementById("vaultUnlockedView");
  const pill = document.getElementById("vaultStatusPill");
  const pillText = document.getElementById("vaultStatusText");

  if (isUnlocked) {
    if (lockedView) lockedView.style.display = "none";
    if (unlockedView) unlockedView.style.display = "grid";
    if (pill) pill.classList.add("unlocked");
    if (pillText) pillText.textContent = "SECTOR AUTHENTICATED // ACCESS GRANTED";
    renderVaultRelics();
  } else {
    if (lockedView) lockedView.style.display = "block";
    if (unlockedView) unlockedView.style.display = "none";
    if (pill) pill.classList.remove("unlocked");
    if (pillText) pillText.textContent = "SECTOR LOCKED";
  }
}

function handleVaultPasskeySubmit(e) {
  if (e) e.preventDefault();
  initVipVault();
  if (!window.CatalystAccount?.user) {
    showToast('Sign in through Reader Passport to check your membership.');
  } else if (window.CatalystAccount.user.app_metadata?.is_premium !== true) {
    showToast('Your account does not have a verified membership yet.');
  }
}

function renderVaultRelics() {
  const container = document.getElementById("vaultUnlockedView");
  if (!container) return;

  const relicCardsHtml = VAULT_RELICS.map(relic => {
    const priceStr = formatPrice(relic.prices[StoreState.currency]);
    return `
      <div class="vault-relic-card">
        <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--accent-gold);margin-bottom:0.4rem;">
          ${relic.badge}
        </div>
        <h3 style="font-family:var(--font-display);font-size:1.35rem;color:#fff;margin-bottom:0.5rem;line-height:1.2;">
          ${relic.title}
        </h3>
        <p style="color:var(--text-secondary);font-size:0.85rem;line-height:1.5;margin-bottom:1rem;flex-grow:1;">
          ${relic.excerpt}
        </p>
        <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text-muted);margin-bottom:1rem;line-height:1.6;">
          ${relic.specs.map(s => `<div>• ${s}</div>`).join("")}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.08);padding-top:0.8rem;margin-top:auto;">
          <div style="font-family:var(--font-display);font-size:1.6rem;color:var(--accent-gold);">
            ${priceStr}
          </div>
          <button type="button" class="btn-primary-hero" onclick="addVaultRelicToCart('${relic.id}')" style="font-size:0.8rem;padding:0.5rem 1rem;">
            <span>⚡</span> <span>Add Vault Relic</span>
          </button>
        </div>
      </div>
    `;
  }).join("");

  const digitalReaderVaultCard = `
    <div class="vault-relic-card" style="border-color:rgba(0,240,255,0.4);background:linear-gradient(160deg,rgba(12,18,34,0.96),rgba(6,10,20,0.98));">
      <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--accent-cyan);margin-bottom:0.4rem;">
        SOVEREIGN DIGITAL ARCHIVE // UNLOCKED
      </div>
      <h3 style="font-family:var(--font-display);font-size:1.35rem;color:#fff;margin-bottom:0.5rem;line-height:1.2;">
        Arc I Complete Digital Reader &amp; Script Studio
      </h3>
      <p style="color:var(--text-secondary);font-size:0.85rem;line-height:1.5;margin-bottom:1rem;">
        Direct operative access to all four canonical Arc I graphic novel issues, the Interactive Script Studio, and the Official Master Portal.
      </p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.45rem;margin-bottom:0.8rem;">
        <a href="./read/issue-1.html" style="text-align:center;background:rgba(244,184,0,0.12);border:1px solid rgba(244,184,0,0.35);color:var(--accent-gold);padding:0.45rem 0.5rem;border-radius:6px;font-family:var(--font-mono);font-size:0.72rem;text-decoration:none;font-weight:700;">📖 ISSUE #01</a>
        <a href="./read/issue-2.html" style="text-align:center;background:rgba(244,184,0,0.12);border:1px solid rgba(244,184,0,0.35);color:var(--accent-gold);padding:0.45rem 0.5rem;border-radius:6px;font-family:var(--font-mono);font-size:0.72rem;text-decoration:none;font-weight:700;">📖 ISSUE #02</a>
        <a href="./read/issue-3.html" style="text-align:center;background:rgba(244,184,0,0.12);border:1px solid rgba(244,184,0,0.35);color:var(--accent-gold);padding:0.45rem 0.5rem;border-radius:6px;font-family:var(--font-mono);font-size:0.72rem;text-decoration:none;font-weight:700;">📖 ISSUE #03</a>
        <a href="./read/issue-4.html" style="text-align:center;background:rgba(244,184,0,0.12);border:1px solid rgba(244,184,0,0.35);color:var(--accent-gold);padding:0.45rem 0.5rem;border-radius:6px;font-family:var(--font-mono);font-size:0.72rem;text-decoration:none;font-weight:700;">📖 ISSUE #04</a>
      </div>
      <div style="display:flex;flex-direction:column;gap:0.45rem;margin-top:auto;">
        <a href="./script-studio/index.html" style="text-align:center;background:rgba(0,240,255,0.12);border:1px solid rgba(0,240,255,0.4);color:var(--accent-cyan);padding:0.55rem 0.75rem;border-radius:6px;font-family:var(--font-mono);font-size:0.74rem;text-decoration:none;font-weight:700;">🎬 OPEN INTERACTIVE SCRIPT STUDIO ➔</a>
        <a href="https://catalyst-world.netlify.app/" target="_blank" rel="noopener noreferrer" style="text-align:center;background:var(--accent-gold);color:#05070c;padding:0.55rem 0.75rem;border-radius:6px;font-family:var(--font-mono);font-size:0.74rem;text-decoration:none;font-weight:800;">🌐 OFFICIAL MASTER PORTAL ➔</a>
      </div>
    </div>
  `;

  container.innerHTML = relicCardsHtml + digitalReaderVaultCard;
}

function addVaultRelicToCart(relicId) {
  if (window.CatalystAccount?.user?.app_metadata?.is_premium !== true) {
    showToast('This collection is available to verified members.'); return;
  }
  const relic = VAULT_RELICS.find(r => r.id === relicId);
  if (!relic) return;

  const cartKey = `${relic.id}::vault`;
  const existing = StoreState.cart.find(item => item.productId === relicId);
  if (existing) {
    existing.quantity = Math.min(20, existing.quantity + 1);
  } else {
    StoreState.cart.push({
      cartKey,
      productId: relic.id,
      title: `[VIP VAULT] ${relic.title}`,
      variantName: "Exclusive Vault Edition",
      sku: `VAULT-${relicId.toUpperCase()}`,
      image: relic.image,
      prices: relic.prices,
      quantity: 1
    });
  }
  saveCart();
  updateCartUI();
  playHapticSound('thunder');
  showToast(`⚡ ${relic.title} added to your cache!`);
  openCartDrawer();
}

// ═══════════════════════════════════════════════════════════
// 20. LAGOS SOVEREIGN LOGISTICS & DISPATCH TRACKER HUD
// ═══════════════════════════════════════════════════════════
function initOrderTracker() {
  // Order records come only from the owner's authenticated database query.
}

async function openOrderTrackerModal(orderId = '') {
  const account = window.CatalystAccount;
  await account.ready;
  if (!account.user) { showToast('Sign in through Reader Passport to view your orders.'); return; }
  let orders;
  try { orders = await account.getOrders(orderId); }
  catch (error) { showToast(error.message); return; }
  const order = orders[0], modal = document.getElementById('orderTrackerModalBackdrop');
  if (!order) { showToast(orderId ? 'No order with that reference belongs to your account.' : 'Your account has no orders yet.'); return; }
  if (!modal) return;
  document.getElementById('trackerSearchInput').value = order.reference;
  document.getElementById('trackerOrderSerial').textContent = order.reference;
  document.getElementById('trackerStatusText').textContent = String(order.status).toUpperCase();
  document.getElementById('trackerRiderName').textContent = 'Courier details are not available here.';
  document.getElementById('trackerDest').textContent = 'See your confirmed order receipt.';
  document.getElementById('trackerEta').textContent = 'No delivery estimate is available.';
  const step = { pending: 0, paid: 1, processing: 2, shipped: 4, delivered: 5 }[order.status] || 0;
  const line = document.getElementById('waypointProgressLine');
  if (line) line.style.width = (step / 5 * 100) + '%';
  for (let i = 1; i <= 5; i++) {
    const node = document.getElementById('node' + i);
    if (node) { node.classList.toggle('complete', i < step); node.classList.toggle('active', i === step); }
  }
  modal.classList.add('open');
}

function closeOrderTrackerModal() {
  document.getElementById("orderTrackerModalBackdrop")?.classList.remove("open");
}

function searchOrderTracker() {
  const reference = (document.getElementById('trackerSearchInput')?.value || '').trim();
  if (reference) openOrderTrackerModal(reference);
}

// ═══════════════════════════════════════════════════════════
// 21. OFFICIAL TAX INVOICE & DISPATCH SLIP GENERATOR
// ═══════════════════════════════════════════════════════════
function generateCartInvoice() {
  showToast('Official receipts will be available with verified checkout. View your saved items in the cart.');
}

function printOfficialOrderSlip() {
  showToast('Official receipts will be available after verified payment. Contact catalystcomicstudio@gmail.com for help.');
}

function openInvoiceModal(data) {
  const modal = document.getElementById("invoiceModalBackdrop");
  if (!modal) return;

  document.getElementById("invoiceSerialDisplay").textContent = `#${data.serial}`;
  document.getElementById("invoiceDateDisplay").textContent = data.date;
  document.getElementById("invoiceCustomerName").textContent = data.customerName;
  document.getElementById("invoiceCustomerEmail").textContent = data.customerEmail;
  document.getElementById("invoiceCustomerAddress").textContent = data.customerAddress;

  let subtotal = 0;
  const tbody = document.getElementById("invoiceTableBody");
  if (tbody) {
    tbody.innerHTML = data.items.map(item => {
      const lineTotal = item.price * item.qty;
      subtotal += lineTotal;
      return `
        <tr>
          <td><strong>${item.title}</strong></td>
          <td style="text-align:center;font-family:var(--font-mono);">${item.sku}</td>
          <td style="text-align:center;font-weight:700;">${item.qty}</td>
          <td style="text-align:right;font-family:var(--font-mono);">${formatPrice(item.price)}</td>
          <td style="text-align:right;font-family:var(--font-mono);font-weight:700;">${formatPrice(lineTotal)}</td>
        </tr>
      `;
    }).join("");
  }

  document.getElementById("invoiceSubtotal").textContent = formatPrice(subtotal);
  document.getElementById("invoiceGrandTotal").textContent = formatPrice(subtotal);

  modal.classList.add("open");
  playHapticSound('chime');
}

function closeInvoiceModal() {
  document.getElementById("invoiceModalBackdrop")?.classList.remove("open");
}

// ═══════════════════════════════════════════════════════════
// 22. PROCEDURAL MULTI-TRACK SOUNDSCAPE SYNTHESIZER
// ═══════════════════════════════════════════════════════════
let SoundscapeState = {
  currentTrack: 'mushin',
  isPlaying: false,
  volume: 0.4,
  ctx: null,
  activeNodes: []
};

function openSoundscapeModal() {
  document.getElementById("soundscapeModalBackdrop")?.classList.add("open");
}

function closeSoundscapeModal() {
  document.getElementById("soundscapeModalBackdrop")?.classList.remove("open");
}

function selectSoundscapeTrack(trackKey) {
  SoundscapeState.currentTrack = trackKey;
  document.querySelectorAll(".soundscape-track-item").forEach(item => {
    item.classList.remove("active");
    const badge = item.querySelector(".track-badge");
    if (badge) badge.textContent = "PLAY";
  });

  const activeItem = document.getElementById(`trackItem_${trackKey}`);
  if (activeItem) {
    activeItem.classList.add("active");
    const badge = activeItem.querySelector(".track-badge");
    if (badge) badge.textContent = "ACTIVE";
  }

  if (SoundscapeState.isPlaying) {
    stopSoundscapeAudio();
    startSoundscapeAudio();
  }
  showToast(`🎧 Loaded Soundscape: ${trackKey.toUpperCase()}`);
}

function handleSoundscapeVolume(val) {
  SoundscapeState.volume = val / 100;
  document.getElementById("soundscapeVolDisplay").textContent = `${val}%`;
  if (SoundscapeState.masterGain) {
    SoundscapeState.masterGain.gain.setValueAtTime(SoundscapeState.volume * 0.15, SoundscapeState.ctx.currentTime);
  }
}

function startSoundscapeAudio() {
  const ctx = getAudioContext();
  if (!ctx) return;
  SoundscapeState.ctx = ctx;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(SoundscapeState.volume * 0.15, ctx.currentTime);
  masterGain.connect(ctx.destination);
  SoundscapeState.masterGain = masterGain;

  SoundscapeState.activeNodes = [];

  if (SoundscapeState.currentTrack === "mushin") {
    // Generate pink noise for rain
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, ctx.currentTime);
    filter.Q.setValueAtTime(1.2, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(masterGain);
    whiteNoise.start();
    SoundscapeState.activeNodes.push(whiteNoise);

  } else if (SoundscapeState.currentTrack === "apapa") {
    // Cyber synth drone (A1 + E2)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, ctx.currentTime);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(82.4, ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);

    osc1.start();
    osc2.start();
    SoundscapeState.activeNodes.push(osc1, osc2);

  } else {
    // Eko Atlantic ocean swells
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(110, ctx.currentTime);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // 10s swell cycle
    lfoGain.gain.setValueAtTime(20, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);

    osc1.connect(masterGain);
    osc1.start();
    lfo.start();
    SoundscapeState.activeNodes.push(osc1, lfo);
  }

  SoundscapeState.isPlaying = true;
  document.getElementById("storeAudioBtn")?.classList.add("active");
  const navText = document.getElementById("navAudioText");
  if (navText) navText.textContent = "Ambience: ON";
  const bars = document.getElementById("navAudioBars");
  if (bars) bars.classList.add("animated");
}

function stopSoundscapeAudio() {
  if (SoundscapeState.activeNodes) {
    SoundscapeState.activeNodes.forEach(node => {
      try { node.stop(); } catch(e) {}
    });
    SoundscapeState.activeNodes = [];
  }
  SoundscapeState.isPlaying = false;
  document.getElementById("storeAudioBtn")?.classList.remove("active");
  const navText = document.getElementById("navAudioText");
  if (navText) navText.textContent = "Ambience";
  const bars = document.getElementById("navAudioBars");
  if (bars) bars.classList.remove("animated");
}

// Override existing toggleStoreAmbientSound
toggleStoreAmbientSound = function() {
  if (!SoundscapeState.isPlaying) {
    startSoundscapeAudio();
    showToast("🎧 Lagos Noir Ambience Synthesizer: PLAYING");
  } else {
    stopSoundscapeAudio();
    showToast("🔇 Lagos Noir Ambience: PAUSED");
  }
};

// ═══════════════════════════════════════════════════════════
// 23. DYNAMIC REVIEW LEDGER & COMMUNITY PROOF ENGINE
// ═══════════════════════════════════════════════════════════
const CANONICAL_REVIEWS = [
  {
    author: "Femi O.",
    location: "Lagos, Nigeria",
    rating: 5,
    affinity: "sango",
    badge: "Verified Hardcover Collector",
    initials: "FO",
    bg: "var(--accent-gold)",
    color: "#000",
    text: "The scale of world-building in Catalyst: The Awakening is unlike anything ever published out of Nigeria. Mushin feels alive, dangerous, and sacred. Bayo’s ignition in Scene 3 gave me literal chills."
  },
  {
    author: "Tariq A.",
    location: "London, UK",
    rating: 5,
    affinity: "obatala",
    badge: "Digital Master Reader",
    initials: "TA",
    bg: "var(--accent-cyan)",
    color: "#000",
    text: "The 88-page digital edition is crisp, cinematic, and the web reader HUD is seamless on iPad. The lettered dialogue and pacing match the best Image and Dark Horse titles."
  },
  {
    author: "Chuka K.",
    location: "Abuja, Nigeria",
    rating: 5,
    affinity: "ogun",
    badge: "Supreme Box Set Backer",
    initials: "CK",
    bg: "var(--accent-crimson)",
    color: "#fff",
    text: "The Supreme Collector Box Set is a masterpiece. The cast bronze Aṣẹ talisman and the Catalyst Protocol manifesto make this feel like an artifact from 2056. Worth every Naira."
  },
  {
    author: "Amara N.",
    location: "Toronto, Canada",
    rating: 5,
    affinity: "esu",
    badge: "Lagos Noir Backer",
    initials: "AN",
    bg: "#9C27B0",
    color: "#fff",
    text: "The fusion of Yoruba cosmogony with cyber-noir architecture is pure genius. The variant holofoil covers look incredible framed in my studio gallery."
  },
  {
    author: "Ibrahim D.",
    location: "Lekki, Lagos",
    rating: 5,
    affinity: "sango",
    badge: "Verified Hardcover Collector",
    initials: "ID",
    bg: "var(--accent-gold)",
    color: "#000",
    text: "Shipped to Lekki Phase 1 in under 36 hours. The gold foil stamping on the cover catches the sunlight beautifully. Proud to support Oluwatobiloba and the Catalyst team."
  },
  {
    author: "Marcus V.",
    location: "Brooklyn, New York",
    rating: 5,
    affinity: "ogun",
    badge: "Digital Master Reader",
    initials: "MV",
    bg: "var(--accent-cyan)",
    color: "#000",
    text: "As a comic collector for over 20 years, Catalyst brings a vital, fresh mythos to superhero fiction. The coloring and panel composition are world-class."
  }
];

function initReviews() {
  renderReviews('all');
}

function renderReviews(filterAffinity = 'all') {
  const container = document.getElementById("reviewsContainer");
  if (!container) return;

  const userReviews = readStoreValue('catalyst_user_reviews', []);
  const escape = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const allReviews = (Array.isArray(userReviews) ? userReviews : []).map(r => ({
    author: escape(r.author), text: escape(r.text), location: escape(r.location), initials: escape(r.initials),
    affinity: ['sango','ogun','osun','obatala','esu'].includes(r.affinity) ? r.affinity : 'sango',
    rating: Math.min(5, Math.max(1, Number(r.rating) || 1)), badge: 'Your saved review draft'
  }));

  const filtered = filterAffinity === 'all'
    ? allReviews
    : allReviews.filter(r => r.affinity === filterAffinity);

  container.innerHTML = filtered.map(r => `
    <div class="review-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.8rem;">
        <div style="color:var(--accent-gold);font-size:1.05rem;">${"★".repeat(r.rating)}</div>
        <span style="font-family:var(--font-mono);font-size:0.68rem;color:var(--accent-cyan);text-transform:uppercase;">
          AFFINITY: ${r.affinity.toUpperCase()}
        </span>
      </div>
      <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.6;margin-bottom:1.2rem;flex-grow:1;">
        "${r.text}"
      </p>
      <div style="display:flex;align-items:center;gap:0.8rem;border-top:1px solid rgba(255,255,255,0.06);padding-top:0.8rem;">
        <div style="width:36px;height:36px;border-radius:50%;background:${r.bg || 'var(--accent-gold)'};color:${r.color || '#000'};font-weight:800;display:flex;align-items:center;justify-content:center;font-size:0.85rem;">
          ${r.initials || r.author.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h4 style="font-size:0.88rem;font-weight:700;color:#fff;">${r.author}</h4>
          <span style="font-size:0.7rem;color:var(--text-muted);font-family:var(--font-mono);">${r.badge} · ${r.location}</span>
        </div>
      </div>
    </div>
  `).join("");
}

function filterReviewsByAffinity(affinity, btn) {
  document.querySelectorAll(".review-filter-pill").forEach(p => p.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderReviews(affinity);
}

function openReviewModal() {
  document.getElementById("reviewModalBackdrop")?.classList.add("open");
}

function closeReviewModal() {
  document.getElementById("reviewModalBackdrop")?.classList.remove("open");
}

function setReviewRating(rating) {
  document.getElementById("reviewRatingVal").value = rating;
  const stars = document.querySelectorAll("#starRatingPicker .picker-star");
  stars.forEach(s => {
    const val = parseInt(s.dataset.rating, 10);
    s.classList.toggle("active", val <= rating);
  });
  const labels = {
    1: "1.0 / 5.0 (Critical)",
    2: "2.0 / 5.0 (Developing)",
    3: "3.0 / 5.0 (Commendable)",
    4: "4.0 / 5.0 (Exceptional)",
    5: "5.0 / 5.0 (Masterpiece)"
  };
  const labelEl = document.getElementById("starRatingLabel");
  if (labelEl) labelEl.textContent = labels[rating] || `${rating}.0 / 5.0`;
}

function handleReviewSubmit(e) {
  e.preventDefault();
  const author = document.getElementById("reviewAuthorInput")?.value.trim();
  const location = document.getElementById("reviewCityInput")?.value.trim();
  const rating = parseInt(document.getElementById("reviewRatingVal")?.value || "5", 10);
  const affinity = document.getElementById("reviewAffinitySelect")?.value || "sango";
  const badge = document.getElementById("reviewBadgeSelect")?.value || "Verified Hardcover Collector";
  const text = document.getElementById("reviewTextInput")?.value.trim();

  if (!author || !text) return;

  const newReview = {
    author,
    location,
    rating,
    affinity,
    badge,
    initials: author.slice(0, 2).toUpperCase(),
    bg: affinity === 'sango' ? 'var(--accent-gold)' : affinity === 'ogun' ? 'var(--accent-crimson)' : 'var(--accent-cyan)',
    color: '#000',
    text
  };

  const saved = readStoreValue('catalyst_user_reviews', []);
  const stored = Array.isArray(saved) ? saved : [];
  stored.unshift(newReview);
  storeStorage.setItem("catalyst_user_reviews", JSON.stringify(stored));

  closeReviewModal();
  renderReviews('all');
  playHapticSound('chime');
  showToast('Review draft saved. It has not been published.');
}

// ═══════════════════════════════════════════════════════════
// 24. INTEGRATION HOOKS & DOM LOAD EXPANSION
// ═══════════════════════════════════════════════════════════
window.addEventListener("DOMContentLoaded", () => {
  initVipVault();
  initOrderTracker();
  initReviews();
});
