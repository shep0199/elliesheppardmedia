# Ellie Sheppard Media — Portfolio

## Files
```
index.html          Home: best work + About + Contact
videography.html    More video
photography.html    More photos
css/style.css       All styling (colours/fonts at the top in :root)
js/main.js          Carousels, lightbox, mobile menu (no need to edit)
images/             All images
fonts/              Fonts (stored locally)
```

## 1. Swap in your real images
The current images are low-res crops from your Wix screenshots, used as placeholders.
The easiest fix is to export full-quality versions and **save them over the old files with the same name**:

- `photo-01.jpg` … `photo-04.jpg`: your photos
- `video-joanna.jpg`, `video-social-01.jpg` … `-06.jpg`: video thumbnails (export a frame from Premiere or screenshot your Vimeo)
- `reel-01.jpg` … `reel-03.jpg`: vertical reel thumbnails (9:16)
- `showreel.jpg`: the big image on the home page
- `about-ellie.jpg`: your photo for About Me

Keep each image under about 500 KB (use squoosh.app or tinypng.com). To add more, copy a whole `<button class="card ...">…</button>` block and change the image.

## 2. Add your Vimeo videos
On every video card, replace `ADD_VIMEO_ID` with the Vimeo link or number:
```html
<button class="card card--landscape" data-vimeo="https://vimeo.com/123456789">
```
For unlisted videos, paste the full link (including the part after the second `/`).
For YouTube, use `data-youtube="https://youtu.be/xxxx"` instead.
For vertical reels, use `class="card card--portrait"` and `data-orientation="portrait"`.

## 3. Things to change (search for "CHANGE" in index.html)
- Your email (in two places)
- Instagram / LinkedIn / Vimeo links
- Put your `resume.pdf` in the main folder
- Captions/titles on the video cards

## 4. Put it online (GitHub Pages)
1. Create a GitHub repo named **`elliesheppardmedia.github.io`**. Your GitHub username must be `elliesheppardmedia`.
2. Upload everything in this folder, with `index.html` at the top level and not inside another folder.
3. In the repo, go to **Settings → Pages**, set Source to *Deploy from a branch*, choose `main` / `root` and click Save.
4. After about a minute, your site is live at **https://elliesheppardmedia.github.io**.

To preview the site while you edit, use the VS Code **Live Server** extension: right-click `index.html` and choose *Open with Live Server*.
