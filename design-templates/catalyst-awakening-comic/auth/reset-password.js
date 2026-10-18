(async function () {
  'use strict';
  const form = document.getElementById('recoveryForm'), button = document.getElementById('savePassword');
  const message = document.getElementById('authStatus');
  await window.CatalystAccount.ready;
  history.replaceState(null, '', location.pathname);
  if (!window.CatalystAccount.user) { message.textContent = 'This reset link is invalid or expired. Request a new link from Sign In.'; return; }
  message.textContent = 'Use at least eight characters.'; button.disabled = false;
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (form.elements.password.value !== form.elements.confirmation.value) { message.textContent = 'The two passwords don’t match.'; return; }
    if (form.elements.password.value.length < 8) { message.textContent = 'Use at least eight characters.'; return; }
    button.disabled = true;
    try {
      await window.CatalystAccount.updatePassword(form.elements.password.value);
      form.reset(); form.hidden = true; message.textContent = 'Your password has been updated. You can return to the reader.';
    } catch (err) { message.textContent = err.message; button.disabled = false; }
  });
})();
