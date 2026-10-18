'use strict';
// Compatibility for an older cached recovery page. Preserve its one-time link.
location.replace('/auth/reset-password.html' + location.search + location.hash);
