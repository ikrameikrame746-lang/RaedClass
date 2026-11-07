# RaedClass — Owner's Guide

RaedClass is a plain website: HTML + CSS + JavaScript + JSON files. There is no database, no framework, no build step and **no dependency on any AI tool**. You own every file. It works on any hosting (Netlify, GitHub Pages, Cloudflare Pages, cPanel/shared hosting, your own server).

## 1. Folder structure

```
RaedClass/
├─ index.html            the website (you rarely touch this)
├─ assets/css, assets/js  design and logic
├─ data/
│  ├─ site.json          name, logo, menu, homepage sections, footer, interface words
│  ├─ taxonomy.json      levels, grades, subjects, types (lesson/exam/…)
│  ├─ resources.json     every lesson / exercise / exam / correction
│  └─ pages.json         extra pages (About, Contact, …)
├─ files/                your PDF and Word downloads
├─ images/               logo, cover images
├─ admin/index.html      the editor (use on your own computer)
├─ serve.bat / serve.sh  start the site on your computer
```

## 2. Preview and edit on your computer

1. Install Python once (python.org). Windows: double-click **serve.bat**. Mac/Linux: run `./serve.sh`.
2. Website: http://localhost:8000 — Admin: http://localhost:8000/admin/
3. Open the admin in **Chrome or Edge**.
4. Click **1. Connect site folder** and choose the `RaedClass` folder (allow access).
5. Edit, then click **2. Save all changes**. Refresh the website.

(Firefox/Safari can't write into folders: edit, press "Download JSON backup", and copy the downloaded files into `data/`.)

## 3. Everyday tasks (in the admin)

| I want to… | Do this |
|---|---|
| Add a lesson / exercise / exam / correction | Tab **Lessons, exercises, exams…** → **+ Add new** → choose language, type, grade, subject → fill title → **Upload…** a PDF/Word under "Downloadable files" → Save |
| Same lesson in Arabic and French | Add two items, one per language. Visitors see only the language they selected |
| Edit text, title, image, file | Open the item, change it, Save |
| Replace an outdated file | Open the item → in the file row click **Upload…** and pick the new file → Save |
| Delete content | Open the item → **Delete** → Save |
| New subject / grade / level / type | Tab **Levels, grades, subjects, types** → **+ Add new** |
| New page | Tab **Pages** → add (give it an address like `help`) → open at `#/page/help` |
| Change the menu | Tab **Homepage & menu** → "Navigation menu". Links: `#/` home · `#/browse` library · `#/browse?category=exam` filtered · `#/page/help` a page · or full `https://…` |
| Change homepage | Same tab: title, intro, image, and reorder/add/remove sections |
| Change button words | Same tab → "Interface words" |

Resources are automatically organized by grade, subject, level and type; filters on the Library page update by themselves.

## 4. Editing without the admin (optional)

Everything is readable JSON — open `data/resources.json` in any text editor. Each resource looks like:

```json
{ "id": "res-1", "lang": "fr", "title": "Cours : Les fractions",
  "category": "lesson", "grade": "g-1ac", "subject": "s-math",
  "date": "2026-11-02", "description": "…", "body": "<p>…</p>", "image": "",
  "files": [ { "label": "Cours PDF", "path": "files/fractions.pdf" } ] }
```
Copy `files/…` PDFs into the `files` folder by hand and reference them as above. IDs of grades/subjects/types are in `taxonomy.json`.

## 5. Putting it online

Upload the whole folder to any static host (e.g. drag the folder to Netlify Drop). After changing content locally, upload `data/`, `files/` and `images/` again. The `admin/` folder can't change anything online (it only saves into a folder on your own computer), but you can leave it out when uploading if you prefer.

## 6. Backups & ownership

Copy the whole folder regularly (USB, cloud drive, or a private GitHub repo). Nothing else is needed to restore the site.

## 7. Growing the site later

- New content types, grades or languages' words need no code.
- New features (comments, login, payments) can be added by any web developer: the data is plain JSON, and `assets/js/app.js` is a small readable file. If traffic grows, the JSON can be moved to a database or a CMS such as Decap CMS, Strapi or WordPress without losing content.
- Adding a third language requires a small code change (`app.js` language toggle and admin fields).
