# Filigrana Studio – test site (GitHub Pages)

Static test copy of the new filigrana.no. **Not indexed** by search engines
(`noindex` + `robots.txt`), **no CNAME**, and Google Analytics is **disabled**
on every host except `*.filigrana.no`.

## Deploy in 5 steps
1. Create a **new empty repository** on GitHub, e.g. `filigrana-preview` (Public; Pages on a free
   account needs a public repo).
2. In a terminal, from this folder:
   ```bash
   git init -b main
   git add -A
   git commit -m "Filigrana test site"
   git remote add origin https://github.com/<your-user>/filigrana-preview.git
   git push -u origin main
   ```
3. GitHub → the repo → **Settings → Pages** → *Build and deployment*:
   **Source: Deploy from a branch**, **Branch: `main`**, **Folder: `/ (root)`** → Save.
4. Wait ~1 minute. The site is at `https://<your-user>.github.io/filigrana-preview/`.
5. Open it on your phone / tablet (or scan a QR code of that link).

## Things to know while testing
* The contact form posts to the **real Formspree inbox** – a test submission sends a real e-mail.
* "Bestill" buttons open the **real Timma** booking pages.
* The cookie banner remembers your choice per browser; clear site data to see it again.
* To update the test site: replace the files, then `git add -A && git commit -m "update" && git push`.

## Going live later
Do **not** publish this folder as-is: it is `noindex`. Use `filigrana-UPLOAD-pakke.zip`
(production package) for Simply.com instead.
