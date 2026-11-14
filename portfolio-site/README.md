# Dynamic portfolio (GitHub Pages)

A static site whose content lives in `content/site.json`. Press **Edit**, unlock with your password, change anything on the page, then **Save & publish**. The editor commits straight to your repo and GitHub Pages redeploys.

## Set up (once)
1. Create a GitHub repo (public for free Pages) and upload everything in this folder, including the hidden `.nojekyll`.
2. Repo **Settings > Pages > Deploy from a branch > main / (root)**.
3. Create a token: GitHub **Settings > Developer settings > Fine-grained tokens > Generate**. Repository access: *Only select repositories* > your portfolio repo. Permissions: **Contents > Read and write**. Copy the token.
4. Open your site and click **Edit** (or add `#edit` to the URL). Enter the token, `owner/repo`, branch, and choose a password (8+ characters). The token is encrypted with the password and stored only in this browser.
5. Next time you only type the password. On a new device, repeat step 4.

## Editing
- Click any text to type. Click a photo to replace it (resized to 1600px WebP automatically).
- Hover an item for the up/down/Link/delete buttons. Section buttons (top right) move, hide or delete a whole section.
- **+ Add ...** adds items; **Add section...** in the bottom bar adds new sections. Colour pickers change the accent colours.
- **Save & publish** makes one commit with the content and any new images.

## Security notes
- Anyone can open the editor dialog, but nobody can save without the GitHub token. Revoke the token on GitHub to cut off access at any time.
- Use a strong password: someone who copies this browser's storage could try guessing it offline.
- Never commit the token into the repo.
