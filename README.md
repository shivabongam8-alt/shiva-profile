# Dynamic portfolio (GitHub Pages)

Upload these files to the root of your repo (Settings > Pages > main / root).
Edits are made on the site itself: click **Edit**, enter the 6-digit code from your authenticator app, change anything, then **Save & publish**.

Login is handled by a free Cloudflare Worker, so no token is stored in any browser and it works on every device.
Follow `SETUP.md` (in worker-setup.zip) once, then put the Worker address in `assets/config.js`.
