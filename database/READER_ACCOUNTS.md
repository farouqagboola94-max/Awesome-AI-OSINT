# Catalystverse reader accounts

Audience identity uses verified Supabase Auth users in project `oxnpmgbwwsjfseirfxej`. Reader records use `auth.uid()` ownership policies. Neither local profiles nor editable user metadata can grant access or paid membership.

## Available in this change

- Email/password sign-in, signup with confirmation, password recovery and Google PKCE callback handling.
- Reader Passport with saved callsign, affinity, actual reading progress and notes count.
- Account-owned progress, field notes, bookmarks, comic notes, reading display preferences and story choices. The 88-page comic uses separate progress and theme keys from the prose reader.
- Explicit import of existing device history, per-account offline queues and JSON data export. Guest history is never silently assigned to a new account.
- Passwords are sent only to Supabase Auth. Auth forms aren't Netlify lead forms. Recovery URLs aren't cached by the service worker.

## Database setup

`reader_accounts.sql` is the complete schema for a fresh project. The live Catalyst project has already applied the initial account migration and `reader_comic_state_upgrade.sql`. Don't reapply the fresh schema to that project.

`test_reader_rls.sql` runs owner, cross-user, anonymous and ownership-reassignment checks in a transaction, then rolls back its disposable test users and records. It passed against the restored Catalyst database. It must be run with an administrator connection, never exposed as an audience endpoint.

## Provider configuration still required

The public Auth settings confirmed email is enabled, signup requires email confirmation, and Google is disabled. The Supabase dashboard currently requires an administrator sign-in before URL/provider settings can be changed.

1. Set Site URL to `https://catalyst-awakening.netlify.app`.
2. Allow the exact redirect URLs `https://catalyst-awakening.netlify.app/auth/callback.html` and `https://catalyst-awakening.netlify.app/auth/reset-password.html`. Add future custom-domain URLs explicitly. Avoid broad wildcard redirects.
3. Configure the existing Google OAuth application's client ID and secret directly in Supabase's Google provider settings. Google must authorize Supabase's callback `https://oxnpmgbwwsjfseirfxej.supabase.co/auth/v1/callback`. Never commit the secret or put it in frontend code.
4. Verify production SMTP sender/domain and email delivery. Run a real confirmation, sign-in, reset and Google round trip using a consenting test account after configuration. Mock browser tests don't prove provider or email delivery readiness.

The frontend checks public provider availability before redirecting, so a disabled Google provider gives an email fallback instead of fabricating a user or opening an error page.

## Release and access controls

Netlify project `63501cea-b8a2-4cd5-b9af-05cc42acaeb4` has team SSO enabled for production, branch deploys and previews. Keep it enabled. A Supabase reader account does not grant Netlify team membership or bypass that gate.

Public audience onboarding cannot work across a site that requires Netlify team membership for every visitor. A separate public audience portal is the recommended next release, with team SSO retained for private comic proofs and team tools. Creating that portal or changing the gate requires a separate access decision.

The Git source is missing the deployed `/private/issue01/` artwork package. Don't replace it with another story's archive. The Netlify build guard stops incomplete Git builds until the existing manifest, cover and all 88 page images are restored to the release package. The current live deployment is preserved while this change is reviewed.

## Feature recommendations

| Add | Reader benefit |
| --- | --- |
| Reader Passport | A personal, synced identity with a clear continue-reading entry and private saved notes. Implemented here. |
| Spoiler-aware Codex | Reveal character dossiers, maps and lore as readers finish the relevant chapters. Keep a reader-controlled spoiler switch. Proposed next. |

| Remove from the audience journey | Reason |
| --- | --- |
| Developer Skills Vault | Move developer downloads and OS setup instructions into team resources to keep the comic journey focused. |
| Preset XP, VIP credentials and duplicate badges | Show earned milestones based on real activity. This change removes fabricated rewards and access claims from the account profile. |

## Local checks

Run `npm run test:accounts`, `npm test`, `npm run check:pages`, `npm run check:css` and `npm run check:static`. The existing missing private cover must be restored before the full static/release checks can pass. Generated issue pages and issue.css must be rebuilt from their source after changes.
