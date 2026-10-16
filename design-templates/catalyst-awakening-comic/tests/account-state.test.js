'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '../reader-account.js'), 'utf8');

function setup() {
  const data = new Map(), db = { reader_profiles: new Map(), reader_state: new Map() };
  const backend = { current: null, fail: false, oauth: null, signup: null, calls: 0 };
  const storage = { getItem: k => data.has(k) ? data.get(k) : null,
    setItem: (k, v) => data.set(k, String(v)), removeItem: k => data.delete(k),
    key: i => [...data.keys()][i], get length() { return data.size; } };
  const makeUser = email => ({ id: email.startsWith('b') ? 'user-b' : 'user-a', email, user_metadata: { full_name: 'Reader' }, app_metadata: {} });
  let change;
  const auth = {
    getUser: async () => ({ data: { user: backend.current }, error: null }),
    onAuthStateChange: callback => { change = callback; },
    signInWithPassword: async ({ email, password }) => {
      if (password !== 'correct-password') return { error: { message: 'Invalid login credentials' } };
      backend.current = makeUser(email); return { data: { session: { user: backend.current } }, error: null };
    },
    signUp: async args => { backend.signup = args; return { data: { user: makeUser(args.email), session: null }, error: null }; },
    signInWithOAuth: async args => { backend.oauth = args; return { data: { url: 'https://accounts.google.com/' }, error: null }; },
    signOut: async () => { if (backend.fail) return { error: {} }; backend.current = null; change('SIGNED_OUT'); return { error: null }; },
    resetPasswordForEmail: async () => ({ error: null }), updateUser: async () => ({ error: null })
  };
  function from(table) {
    let payload, op = 'read', filter;
    const q = {
      select() { return q; }, eq(k, v) { filter = v; return q; },
      upsert(v) { op = 'upsert'; payload = v; return q; },
      update(v) { op = 'update'; payload = v; return q; },
      async run(single) {
        backend.calls++;
        if (backend.fail) return { error: { message: 'offline' } };
        const owner = backend.current?.id;
        const key = r => table === 'reader_profiles' ? r.user_id : r.user_id + ':' + r.key;
        if (op === 'upsert') {
          for (const row of [].concat(payload)) {
            if (row.user_id !== owner) return { error: { message: 'RLS' } };
            db[table].set(key(row), { callsign: '', affinity: 'Ṣàngó', ...db[table].get(key(row)), ...row });
          }
        }
        if (op === 'update' && filter === owner && db[table].has(owner)) db[table].set(owner, { ...db[table].get(owner), ...payload });
        const rows = [...db[table].values()].filter(r => r.user_id === owner && (!filter || r.user_id === filter));
        return { data: single ? rows[0] || null : rows, error: null };
      },
      maybeSingle() { return q.run(true); }, single() { return q.run(true); },
      then(a, b) { return q.run(false).then(a, b); }
    };
    return q;
  }
  const win = new EventTarget();
  win.localStorage = storage; win.location = { origin: 'https://catalyst.example' }; win.URL = URL;
  win.supabase = { createClient: (url, key, options) => { backend.options = options; return { auth, from }; } };
  win.fetch = async () => ({ ok: true, json: async () => ({ external: { google: backend.googleEnabled !== false } }) });
  const doc = new EventTarget(); doc.visibilityState = 'visible';
  data.set('catalyst_user_profile', JSON.stringify({ id: 'fake', app_metadata: { is_premium: true } }));
  vm.runInNewContext(code, { window: win, document: doc, CustomEvent, setTimeout, clearTimeout, console });
  return { account: win.CatalystAccount, store: win.CatalystStorage, raw: storage, backend, db };
}

test('forged local identities, failed passwords and unconfirmed signup never authenticate', async () => {
  const { account, raw, backend } = setup(); await account.ready;
  assert.equal(account.user, null); assert.equal(raw.getItem('catalyst_user_profile'), null);
  await assert.rejects(account.signIn('a@example.invalid', 'wrong'), /Invalid login/);
  assert.equal(account.user, null);
  assert.equal((await account.signUp('Reader', 'a@example.invalid', 'long-password')).confirmed, false);
  assert.equal(account.user, null);
  assert.equal(backend.signup.options.emailRedirectTo, 'https://catalyst.example/auth/callback.html');
  assert.equal(backend.options.auth.flowType, 'pkce');
});

test('Google starts OAuth and cannot create a pretend signed-in reader', async () => {
  const { account, backend } = setup(); await account.ready; await account.google();
  assert.equal(backend.oauth.provider, 'google');
  assert.equal(backend.oauth.options.redirectTo, 'https://catalyst.example/auth/callback.html');
  backend.googleEnabled = false;
  await assert.rejects(account.google(), /use email/);
  assert.equal(account.user, null);
  assert.equal(account.safeReturn('https://evil.example'), '/');
  assert.equal(account.safeReturn('//evil.example'), '/');
  assert.equal(account.safeReturn('/\\evil.example'), '/');
  assert.equal(account.safeReturn('/read/issue-2#read-i2-p3'), '/read/issue-2#read-i2-p3');
});

test('reader data stays with its verified owner and device import is explicit', async () => {
  const { account, store, raw, db } = setup(); await account.ready;
  raw.setItem('catalyst_page_i1', '9');
  await account.signIn('a@example.invalid', 'correct-password');
  assert.equal(store.getItem('catalyst_page_i1'), null);
  await account.importDeviceHistory(); assert.equal(store.getItem('catalyst_page_i1'), '9');
  store.setItem('catalyst_field_notes_v1', '[{"quote":"private A note"}]'); await account.flush();
  store.setItem('catalyst_notes_i1', '{"12":"private comic note"}'); await account.flush();
  assert.equal(db.reader_state.get('user-a:catalyst_page_i1').value, '9');
  await account.signIn('b@example.invalid', 'correct-password');
  assert.equal(store.getItem('catalyst_field_notes_v1'), null);
  assert.equal(store.getItem('catalyst_notes_i1'), null);
  assert.equal(store.getItem('catalyst_page_i1'), null);
  store.setItem('catalyst_page_i1', '2'); await account.flush();
  assert.equal(db.reader_state.get('user-b:catalyst_page_i1').value, '2');
  await account.signOut(); assert.equal(account.user, null);
  assert.equal(store.getItem('catalyst_page_i1'), '9');
});

test('offline changes remain pending and profile failures never claim success', async () => {
  const { account, store, backend, db } = setup(); await account.ready;
  await account.signIn('a@example.invalid', 'correct-password');
  backend.fail = true; store.setItem('catalyst_page_i1', '5'); await account.flush();
  assert.equal(account.status, 'offline'); assert.equal(store.getItem('catalyst_page_i1'), '5');
  await assert.rejects(account.saveProfile({ callsign: 'READER_A' }), /could not be saved/);
  assert.equal(account.status, 'error');
  backend.fail = false; await account.flush();
  assert.equal(db.reader_state.get('user-a:catalyst_page_i1').value, '5');
  assert.equal(account.status, 'saved');
  await assert.rejects(account.saveProfile({ callsign: '<script>' }), /32 letters/);
  await account.saveProfile({ callsign: 'READER_A', affinity: 'Ògún' });
  assert.equal(account.profile.callsign, 'READER_A');
  assert.equal((await account.exportData()).saved_reading.catalyst_page_i1, '5');
});
