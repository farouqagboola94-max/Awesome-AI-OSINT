'use strict';
(() => {
  const status = document.getElementById('reset-status'), button = document.getElementById('save-password');
  if (!window.supabase) { status.textContent = 'Account service could not load. Please retry.'; return; }
  const client = window.supabase.createClient('https://oxnpmgbwwsjfseirfxej.supabase.co', 'sb_publishable_Ac7QJhrz4teLLONsAoU1_Q_MT6o9Yk4');
  const update = session => { button.disabled = !session; status.textContent = session ? 'Enter your new password.' : 'Open a valid recovery link from your email.'; };
  client.auth.onAuthStateChange((_event, session) => update(session));
  client.auth.getSession().then(({data, error}) => { if (error) status.textContent = error.message; else update(data.session); });
  document.getElementById('reset-form').addEventListener('submit', async event => {
    event.preventDefault();
    const password = document.getElementById('new-password').value;
    if (password !== document.getElementById('confirm-password').value) { status.textContent = 'Passwords must match.'; return; }
    button.disabled = true;
    try {
      const {error} = await client.auth.updateUser({password});
      if (error) throw error;
      event.target.reset(); status.textContent = 'Your password has been updated.';
    } catch (error) { status.textContent = error.message || 'Password could not be updated. Try again.'; }
    finally { button.disabled = false; }
  });
})();
