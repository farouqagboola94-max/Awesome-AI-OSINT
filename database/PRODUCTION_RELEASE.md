# Protected production release, 23 October 2026

The owner approved a public showcase and a protected production reader. This supersedes the public production access instruction recorded on 18 October. Audience accounts and private reader records retain their existing ownership rules.

The Netlify edge handler checks the authenticated user with Supabase on every protected request, then checks the owner-controlled `production_reader_access` table. Public signup and editable user metadata cannot grant approval. Roles are `reviewer` and `admin`; administration requires `admin`. Session cookies are HttpOnly, Secure, SameSite Strict and renewed from the verified SDK session. Production responses are no-store and excluded from service-worker caches.

Protected namespaces include `/production-reader/`, its full transcript, manifest, folio artwork and fonts, `/production-admin/`, the historical `/private/` archive, the old Issue 01/02 reading URLs, and Script Studio. Old reading URLs forward approved users to the new reader. The homepage retains public introductions and previews, removes the embedded old full reader, and describes both 150-page editions as in production.

Apply `production_reader_access.sql` once. It was applied and tested on the configured project. Tests in a rolled-back transaction passed for own approval reads, anonymous denial, cross-account isolation, self-enrolment denial and self-escalation denial. There were zero registered users and zero approved administrators before these checks. An actual owner account must be registered through the normal Auth workflow, confirmed, and then assigned an approval row by the trusted database administrator. Do not auto-promote the first signup, grant access by user metadata, create a bypass account or manufacture a live test session.

Build the private reader from the separately supplied edition using `python3 tools/assemble_protected_reader.py /absolute/path/Catalyst_Production_150`. It verifies the two 150-story-page counts and copies each supplied folio into its protected namespace. This directory and all artwork are excluded from the public Git repository.

Deploy the complete project including `netlify/edge-functions`, `netlify.toml` and the privately assembled production-reader directory. A plain static ZIP upload that omits the edge handler does not provide this boundary. Before deployment, confirm the complete archive is assembled. Then verify signed-out denial for HTML, JSON, transcript and image URLs and approved access using a real account. Current local security tests use controlled fixtures, and do not certify production login or a physical phone.

The local browser package was present, but its Chromium binary download returned an invalid archive. Browser and physical-device checks remain pending until a working browser environment and real approved account are available.
