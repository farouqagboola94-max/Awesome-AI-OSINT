(async function () {
  'use strict';
  const message = document.getElementById('authStatus');
  const params = new URLSearchParams(location.search);
  const fragment = new URLSearchParams(location.hash.slice(1));
  const failed = params.has('error') || fragment.has('error');
  try {
    if (failed) throw new Error('Sign-in was cancelled or the link expired. Return to the reader to try again.');
    await window.CatalystAccount.ready;
    if (!window.CatalystAccount.user) throw new Error('This sign-in link could not be verified. Open it in the browser where you requested it, or sign in again.');
    let next = '/';
    try { next = sessionStorage.getItem('catalystverse:auth-return') || '/'; sessionStorage.removeItem('catalystverse:auth-return'); } catch (_) {}
    history.replaceState(null, '', location.pathname);
    message.textContent = 'Signed in. Opening your saved reading…';
    location.replace(window.CatalystAccount.safeReturn(next));
  } catch (err) {
    history.replaceState(null, '', location.pathname);
    message.textContent = err.message;
  }
})();
