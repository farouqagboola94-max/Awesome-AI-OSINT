'use strict';
const { newPage, watchErrors, watchBadRequests, Results, SITE } = require('./lib/harness');
const path = require('node:path');

module.exports = async function storeAccounts(ctx, base) {
  const r = new Results(), page = await newPage(ctx), errors = watchErrors(page), bad = watchBadRequests(page, base);
  page.setDefaultTimeout(8000);
  // The separate release archive is verified before deployment. CI uses a
  // catalog cover fixture for the store's five-page preview thumbnails.
  await page.route('**/private/issue01/lettered/pages/*.webp', route => route.fulfill({
    path: path.join(SITE, 'assets/cover-issue1.webp'), contentType: 'image/webp'
  }));
  await page.addInitScript(() => {
    localStorage.setItem('catalyst_vault_unlocked', 'true');
    localStorage.setItem('catalyst_user_profile', JSON.stringify({ id: 'forged', app_metadata: { is_premium: true } }));
    localStorage.setItem('catalyst_cart', JSON.stringify([
      { productId: 'catalyst-issue-01-digital', sku: 'CAT-AWK-01-DIGI', title: '<img src=x onerror=alert(1)>', prices: { NGN: 1 }, image: 'https://untrusted.invalid/pixel', quantity: 999 },
      { productId: 'catalyst-vault-scriptbook', sku: 'VAULT-CATALYST-VAULT-SCRIPTBOOK', quantity: 1 },
      { productId: 'not-in-catalog', sku: 'FAKE', quantity: 1 }
    ]));
    localStorage.setItem('catalyst_user_reviews', JSON.stringify([{ author: '<img src=x>', text: '<img src=x onerror="window.reviewExecuted=true">', location: '<script>bad</script>', rating: 5, affinity: 'sango' }]));
  });
  await page.goto(base + '/store.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => CatalystAccount.ready);
  r.ok('visitors can browse the public catalog', await page.locator('.product-card').count() > 0);
  r.ok('store account entry returns to the store after sign-in', (await page.locator('#storeAccountLink').getAttribute('href')) === '/?account=profile&return=/store.html');
  r.ok('local VIP flags cannot unlock membership', await page.locator('#vaultUnlockedView').isHidden());
  r.ok('unknown and unauthorized saved items are rejected', await page.evaluate(() => StoreState.cart.length === 1));
  r.ok('saved prices, names and quantities use catalog values', await page.evaluate(() => StoreState.cart[0].prices.NGN === 9500 && StoreState.cart[0].quantity === 20 && !StoreState.cart[0].title.includes('<')));
  r.ok('saved review drafts cannot inject markup', await page.evaluate(() => !window.reviewExecuted && !document.querySelector('#reviewsContainer img, #reviewsContainer script')));
  r.ok('reviews are identified as private drafts', (await page.locator('#reviewsContainer').textContent()).includes('Your saved review draft'));
  await page.evaluate(() => completeExpressForgeOrder({ preventDefault() {} }));
  r.ok('checkout cannot create a paid order or unlock a vault', await page.evaluate(() => !localStorage.getItem('catalyst_order_registry') && !CatalystAccount.user && getComputedStyle(document.getElementById('vaultUnlockedView')).display === 'none'));
  r.ok('checkout states that no payment was confirmed', (await page.locator('#storeToast').textContent()).includes('no payment or order'));
  await page.evaluate(() => openOrderTrackerModal());
  r.ok('signed-out visitors cannot view order details', await page.locator('#orderTrackerModalBackdrop').evaluate(el => !el.classList.contains('open')));
  await page.evaluate(async () => {
    window.CatalystAccount = { ready: Promise.resolve(), user: { id: 'verified-reader' }, getOrders: async () => [] };
    await openOrderTrackerModal('UNKNOWN-REFERENCE');
  });
  r.ok('unknown references do not generate a dispatch', await page.locator('#orderTrackerModalBackdrop').evaluate(el => !el.classList.contains('open')));
  await page.evaluate(async () => {
    CatalystAccount.getOrders = async () => [{ reference: 'REAL-READER-ORDER', status: 'paid' }];
    await openOrderTrackerModal();
  });
  r.ok('order detail shows the returned backend record', (await page.locator('#trackerOrderSerial').textContent()) === 'REAL-READER-ORDER' && (await page.locator('#trackerStatusText').textContent()) === 'PAID');
  r.ok('order detail never invents a courier or ETA', (await page.locator('#trackerEta').textContent()).includes('No delivery estimate') && (await page.locator('#trackerRiderName').textContent()).includes('not available'));
  await page.evaluate(() => closeOrderTrackerModal());
  await page.setViewportSize({ width: 390, height: 844 });
  r.ok('the store fits a mobile viewport', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  r.ok('store assets and account dependencies resolve', bad.length === 0, bad.join('\n'));
  r.ok('store and account flows introduce no browser errors', errors.length === 0, errors.join('\n'));
  await page.close(); return r;
};
