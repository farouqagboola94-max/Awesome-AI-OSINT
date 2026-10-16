/* Verified audience accounts. Only the SDK owns credentials and sessions. */
(function () {
  'use strict';
  const URL = 'https://oxnpmgbwwsjfseirfxej.supabase.co';
  const KEY = 'sb_publishable_Ac7QJhrz4teLLONsAoU1_Q_MT6o9Yk4';
  const MANAGED = /^catalyst_(?:(?:page_i|pages_i|read_|comic_page_i|bookmarks_i|notes_i)\d{1,4}|field_notes_v1|reader_scale|reader_focus|reader_theme|reader_fontsize|reader_layout|comic_theme|last_scene_idx|last_scene_title|choice_endings_v1)$/;
  const raw = window.localStorage;
  let client = null, user = null, profile = null, generation = 0;
  let restoring = false, timer = null, pending = {}, syncStatus = 'guest';
  let refreshWork = null;

  function read(key) { try { return raw.getItem(key); } catch (_) { return null; } }
  function write(key, value) { try { raw.setItem(key, value); } catch (_) {} }
  function prefix(id) { return 'catalystverse:' + id + ':'; }
  function emit(name) {
    window.dispatchEvent(new CustomEvent(name, { detail: { user, profile, status: syncStatus } }));
  }
  function status(value) { syncStatus = value; emit('catalyst:sync'); }
  function stash() { if (user) write(prefix(user.id) + 'pending', JSON.stringify(pending)); }
  const storage = {
    getItem(key) { return read(user && MANAGED.test(key) ? prefix(user.id) + key : key); },
    setItem(key, value) {
      value = String(value);
      write(user && MANAGED.test(key) ? prefix(user.id) + key : key, value);
      if (user && MANAGED.test(key)) {
        pending[key] = value;
        stash(); status('pending');
        clearTimeout(timer); timer = setTimeout(flush, 900);
      }
    },
    removeItem(key) {
      // A tombstone also removes a value on the next signed-in device.
      if (user && MANAGED.test(key)) this.setItem(key, '');
      else { try { raw.removeItem(key); } catch (_) {} }
    }
  };
  window.CatalystStorage = storage;

  async function flush() {
    if (!client || !user || restoring || !Object.keys(pending).length) return;
    const id = user.id, batch = { ...pending };
    try {
      const { error } = await client.from('reader_state').upsert(
        Object.keys(batch).map(key => ({ user_id: id, key, value: batch[key] })),
        { onConflict: 'user_id,key' }
      );
      if (error) throw error;
      if (!user || user.id !== id) return;
      Object.keys(batch).forEach(key => { if (pending[key] === batch[key]) delete pending[key]; });
      stash(); status(Object.keys(pending).length ? 'pending' : 'saved');
    } catch (_) { if (user && user.id === id) status('offline'); }
  }

  function signedOut() {
    generation++; user = null; profile = null; pending = {}; restoring = false;
    clearTimeout(timer); status('guest');
    emit('catalyst:account'); emit('catalyst:reader-state');
  }
  async function refresh() {
    if (!client) throw new Error('Sign-in is unavailable. Please reload and try again.');
    if (refreshWork) return refreshWork;
    const epoch = ++generation;
    refreshWork = (async function () {
      const result = await client.auth.getUser();
      if (epoch !== generation) return;
      if (result.error || !result.data || !result.data.user) { signedOut(); return; }
      const verified = result.data.user;
      if (user && user.id === verified.id && profile) { user = verified; emit('catalyst:account'); return; }
      user = verified; profile = null; restoring = true;
      try { pending = JSON.parse(read(prefix(user.id) + 'pending') || '{}'); } catch (_) { pending = {}; }
      status('loading'); emit('catalyst:account');
      try {
        let res = await client.from('reader_profiles').select('*').eq('user_id', verified.id).maybeSingle();
        if (res.error) throw res.error;
        if (!res.data) {
          res = await client.from('reader_profiles').upsert({
            user_id: verified.id,
            display_name: String(verified.user_metadata?.full_name || 'Catalyst Reader').slice(0, 80)
          }, { onConflict: 'user_id', ignoreDuplicates: true }).select('*').single();
          if (res.error) throw res.error;
        }
        if (epoch !== generation) return;
        profile = res.data;
        const cloud = await client.from('reader_state').select('key,value').eq('user_id', verified.id);
        if (cloud.error) throw cloud.error;
        if (epoch !== generation) return;
        (cloud.data || []).forEach(row => {
          if (MANAGED.test(row.key) && !Object.hasOwn(pending, row.key)) write(prefix(verified.id) + row.key, row.value);
        });
        status(Object.keys(pending).length ? 'pending' : 'saved');
      } catch (_) { if (epoch === generation) status('offline'); }
      finally {
        if (epoch === generation) {
          emit('catalyst:account'); emit('catalyst:reader-state');
          restoring = false; flush();
        }
      }
    })().finally(() => { refreshWork = null; });
    return refreshWork;
  }
  async function requireClient() { await ready; if (!client) throw new Error('Sign-in is unavailable. Please reload.'); return client; }
  async function requireUser() { await requireClient(); if (!user) throw new Error('Sign in to save your reader profile.'); return user; }
  function callbackPath(file) { return window.location.origin + '/auth/' + file; }
  function safeReturn(value) {
    if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value)) return '/';
    try { const u = new window.URL(value, window.location.origin); return u.origin === window.location.origin ? u.pathname + u.search + u.hash : '/'; }
    catch (_) { return '/'; }
  }

  const ready = (async function () {
    // Ignore the old pretend identities, including their user-editable roles.
    try { raw.removeItem('catalyst_user_profile'); } catch (_) {}
    if (!window.supabase?.createClient) { status('unavailable'); return; }
    client = window.supabase.createClient(URL, KEY, { auth: {
      flowType: 'pkce', persistSession: true, autoRefreshToken: true,
      detectSessionInUrl: true, storageKey: 'catalystverse-auth-oxnpmgbwwsjfseirfxej'
    } });
    window._supabase = client;
    // Never await Supabase operations inside this callback: the SDK auth lock
    // is still held here. Defer hydration to a new task.
    client.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT') { signedOut(); return; }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'PASSWORD_RECOVERY') {
        setTimeout(() => refresh().catch(() => status('offline')), 0);
      }
    });
    try { await refresh(); } catch (_) { status('offline'); }
  })();

  window.CatalystAccount = {
    ready, get client() { return client; }, get user() { return user; }, get profile() { return profile; },
    get status() { return syncStatus; }, refresh, flush, safeReturn,
    async signIn(email, password) {
      const sb = await requireClient();
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error || !data?.session) throw new Error(error?.message || 'Sign-in failed. Check your email and password.');
      await refresh(); if (!user) throw new Error('Your session could not be verified. Please try again.');
      return user;
    },
    async signUp(name, email, password) {
      const sb = await requireClient();
      const { data, error } = await sb.auth.signUp({ email, password,
        options: { data: { full_name: name }, emailRedirectTo: callbackPath('callback.html') } });
      if (error) throw new Error(error.message);
      if (data?.session) await refresh();
      return { confirmed: !!data?.session };
    },
    async google() {
      const sb = await requireClient();
      // The SDK can build an authorize URL even when the provider is disabled.
      // Check the public provider settings before navigating away from the reader.
      try {
        const response = await window.fetch(URL + '/auth/v1/settings', { headers: { apikey: KEY }, cache: 'no-store' });
        if (!response.ok || (await response.json()).external?.google !== true) throw new Error('disabled');
      } catch (_) { throw new Error('Google sign-in is unavailable. Please use email for now.'); }
      const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callbackPath('callback.html') } });
      if (error) throw new Error('Google sign-in is unavailable. Please use email for now.');
    },
    async signOut() {
      await requireClient(); await flush();
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) throw new Error('Could not sign out. Please check your connection and try again.');
      signedOut();
    },
    async saveProfile(changes) {
      const owner = await requireUser();
      const patch = {};
      if (typeof changes.callsign === 'string') {
        if (!/^[A-Za-z0-9_-]{0,32}$/.test(changes.callsign)) throw new Error('Use up to 32 letters, numbers, underscores or hyphens.');
        patch.callsign = changes.callsign;
      }
      if (typeof changes.affinity === 'string') patch.affinity = changes.affinity;
      if (typeof changes.display_name === 'string') patch.display_name = changes.display_name.trim().slice(0, 80);
      const { data, error } = await client.from('reader_profiles').update(patch).eq('user_id', owner.id).select('*').single();
      if (error) { status('error'); throw new Error('Your profile could not be saved. Please try again.'); }
      if (user?.id === owner.id) { profile = data; status(Object.keys(pending).length ? 'pending' : 'saved'); emit('catalyst:account'); }
    },
    async resetEmail(email) {
      const sb = await requireClient();
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: callbackPath('reset-password.html') });
      if (error) throw new Error(error.message);
    },
    async updatePassword(password) {
      await requireUser();
      const { error } = await client.auth.updateUser({ password });
      if (error) throw new Error(error.message);
    },
    async importDeviceHistory() {
      await requireUser();
      for (let i = 0; i < raw.length; i++) {
        const key = raw.key(i);
        if (MANAGED.test(key) && read(prefix(user.id) + key) === null) storage.setItem(key, read(key));
      }
      emit('catalyst:reader-state'); await flush();
    },
    async exportData() {
      const owner = await requireUser();
      const data = {};
      for (let i = 0; i < raw.length; i++) {
        const key = raw.key(i), p = prefix(owner.id);
        if (key.startsWith(p) && MANAGED.test(key.slice(p.length))) data[key.slice(p.length)] = read(key);
      }
      return { exported_at: new Date().toISOString(), profile, saved_reading: data };
    }
  };
  window.addEventListener('online', () => { if (user) flush(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
})();
