'use strict';
const { newPage, watchErrors, Results } = require('./lib/harness');

module.exports = async function authFlows(ctx, base) {
  const r = new Results(), page = await newPage(ctx), errors = watchErrors(page);
  page.setDefaultTimeout(8000);
  page.setDefaultNavigationTimeout(15000);
  await page.route('**/auth/v1/settings', route => route.fulfill({ json: { external: { google: true } } }));
  await page.addInitScript(() => {
    localStorage.setItem('catalyst_user_profile', JSON.stringify({ id: 'forged', email: 'fake@example.invalid', app_metadata: { is_premium: true } }));
    const empty = { select() { return this; }, not() { return this; }, eq() { return this; }, then(fn) { return Promise.resolve({ data: [], error: null }).then(fn); } };
    window.supabase = { createClient() { return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({}),
        signInWithPassword: async () => ({ error: { message: 'Invalid login credentials' } }),
        signUp: async () => ({ data: { user: { id: 'unconfirmed' }, session: null }, error: null }),
        signInWithOAuth: async options => { window.oauthAttempt = options; return { error: { message: 'Provider disabled' } }; }
      }, from: () => empty, rpc: async () => ({ data: null, error: {} })
    }; } };
  });
  await page.goto(base + '/?preview=catalyst', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.CatalystAccount);
  await page.evaluate(() => CatalystAccount.ready);
  r.ok('a local profile cannot impersonate a reader', await page.evaluate(() => !CatalystAccount.user && !localStorage.getItem('catalyst_user_profile')));
  r.ok('the old preview query cannot bypass access', await page.evaluate(() => !document.documentElement.classList.contains('preview-unlocked')));
  await page.click('#navProfileBtn');
  r.ok('profile entry asks a signed-out visitor to sign in', await page.locator('#authBackdrop').evaluate(el => el.classList.contains('open')));
  r.ok('it does not reveal a fabricated profile', await page.locator('#userProfileBackdrop').evaluate(el => !el.classList.contains('open')));
  await page.fill('#signin-form input[name="email"]', 'reader@example.invalid');
  await page.fill('#signin-form input[name="password"]', 'incorrect-password');
  await page.click('#signin-btn');
  await page.waitForFunction(() => !document.getElementById('signin-btn').disabled);
  r.ok('failed passwords leave the login form open', await page.locator('#authBackdrop').evaluate(el => el.classList.contains('open')));
  r.ok('failed passwords never turn on signed-in state', await page.evaluate(() => !CatalystAccount.user && document.getElementById('navAuthBtn').textContent === 'Sign In'));
  r.ok('the reader sees the login failure', (await page.locator('#toast-container').textContent()).includes('Invalid login credentials'));
  await page.click('#auth-signin .google-btn');
  await page.waitForFunction(() => !!window.oauthAttempt);
  r.ok('Google calls the real OAuth entry point', await page.evaluate(() => oauthAttempt.provider === 'google' && oauthAttempt.options.redirectTo.endsWith('/auth/callback.html')));
  r.ok('a disabled OAuth provider never creates a local Google user', await page.evaluate(() => !CatalystAccount.user));
  await page.click('#tab-signup');
  await page.fill('#signup-form input[name="fullname"]', 'Reader');
  await page.fill('#signup-form input[name="email"]', 'reader@example.invalid');
  await page.fill('#signup-form input[name="password"]', 'unconfirmed-password');
  await page.click('#signup-btn');
  await page.waitForFunction(() => !document.getElementById('signup-btn').disabled);
  r.ok('confirmation is requested without pretending the reader is signed in', await page.evaluate(() => !CatalystAccount.user && document.getElementById('toast-container').textContent.includes('Check your email')));
  await page.goto(base + '/auth/reset-password.html', { waitUntil: 'networkidle' });
  r.ok('an unverified recovery link cannot change a password', await page.locator('#savePassword').isDisabled());
  await page.goto(base + '/reset-password.html', { waitUntil: 'networkidle' });
  r.ok('the legacy reset route uses the same verified session', await page.locator('#savePassword').isDisabled());
  await page.goto(base + '/auth/callback.html?code=unverified', { waitUntil: 'networkidle' });
  r.ok('a failed callback stays on the recovery screen', (await page.locator('#authStatus').textContent()).includes('could not be verified'));
  r.ok('auth codes are removed from the address bar', !page.url().includes('?'));
  r.ok('the login and callback code introduce no browser errors', errors.length === 0, errors.join('\n'));
  await page.close();
  return r;
};
