/* Ellie Sheppard Media — carousels, lightbox, mobile menu */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Carousels ---------- */
  document.querySelectorAll(".group").forEach((group) => {
    const track = group.querySelector(".track");
    if (!track) return;
    const prev = group.querySelector('[data-dir="-1"]');
    const next = group.querySelector('[data-dir="1"]');
    const bar = group.querySelector(".progress span");

    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
      if (bar) {
        const ratio = Math.min(1, track.clientWidth / track.scrollWidth);
        const pos = max > 0 ? track.scrollLeft / max : 0;
        bar.style.width = ratio * 100 + "%";
        bar.style.marginLeft = pos * (1 - ratio) * 100 + "%";
        bar.parentElement.style.visibility = ratio >= 0.999 ? "hidden" : "visible";
      }
    };

    [prev, next].forEach((btn) => {
      if (!btn) return;
      btn.addEventListener("click", () => {
        const dir = Number(btn.dataset.dir);
        track.scrollBy({ left: dir * track.clientWidth * 0.75, behavior: "smooth" });
      });
    });

    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    track.querySelectorAll("img").forEach((img) => img.addEventListener("load", update));
    update();

    /* click-and-drag with a mouse (touch already swipes natively) */
    let startX = 0, startScroll = 0, down = false, moved = false;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
    });
    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        track.classList.add("dragging");
      }
      if (moved) track.scrollLeft = startScroll - dx;
    });
    window.addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      if (moved) {
        track.classList.remove("dragging");
        // let it snap to the nearest card
        const cards = [...track.children];
        const left = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft);
        let best = cards[0], dist = Infinity;
        cards.forEach((c) => {
          const d = Math.abs(c.getBoundingClientRect().left - left);
          if (d < dist) { dist = d; best = c; }
        });
        if (best) track.scrollBy({ left: best.getBoundingClientRect().left - left, behavior: "smooth" });
      }
    });
    // stop a drag from also opening the lightbox
    track.addEventListener("click", (e) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- Lightbox ---------- */
  const lb = document.querySelector(".lightbox");
  if (!lb) return;
  const content = lb.querySelector(".lb-content");

  const close = () => {
    lb.close();
    content.innerHTML = "";
  };
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  lb.addEventListener("close", () => (content.innerHTML = ""));

  const vimeoSrc = (val) => {
    // accepts "123456789", "vimeo.com/123456789", unlisted "vimeo.com/123456789/abc123",
    // and copied share links with extra "?fl=...&share=copy" bits on the end
    const str = String(val);
    const id = (str.match(/(\d{6,})/) || [])[1];
    if (!id) return null;
    const hash = (str.match(new RegExp(id + "/([a-z0-9]+)", "i")) || str.match(/[?&]h=([a-z0-9]+)/i) || [])[1];
    let src = `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0`;
    if (hash) src += `&h=${hash}`;
    return src;
  };
  const youtubeSrc = (val) => {
    const m = String(val).match(/(?:youtu\.be\/|v=|shorts\/|embed\/)?([\w-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0` : null;
  };

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-vimeo], [data-youtube], [data-photo]");
    if (!trigger) return;
    e.preventDefault();
    lb.classList.toggle("is-portrait", trigger.dataset.orientation === "portrait");

    if (trigger.dataset.photo !== undefined) {
      const img = trigger.querySelector("img");
      const src = trigger.dataset.photo || img.src;
      content.innerHTML = `<img src="${src}" alt="${img ? img.alt : ""}">`;
    } else {
      const src = trigger.dataset.vimeo !== undefined ? vimeoSrc(trigger.dataset.vimeo) : youtubeSrc(trigger.dataset.youtube);
      content.innerHTML = src
        ? `<iframe src="${src}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video player"></iframe>`
        : `<div class="lb-note">Video coming soon — add the Vimeo link to this card's <code>data-vimeo</code>.</div>`;
    }
    lb.showModal();
  });
});

/* ---------- Load thumbnails straight from Vimeo ---------- */
document.querySelectorAll("[data-vimeo] img").forEach((img) => {
  if (!img.src.includes("vumbnail")) return; // only replace the auto thumbnails
  const card = img.closest("[data-vimeo]");
  const id = (card.dataset.vimeo.match(/(\d{6,})/) || [])[1];
  if (!id) return;
  fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}&width=720`)
    .then((r) => r.json())
    .then((data) => { if (data.thumbnail_url) img.src = data.thumbnail_url; })
    .catch(() => {});
});

/* ---------- Play videos right on the page (cards with data-inline) ---------- */
document.querySelectorAll("[data-vimeo][data-inline]").forEach((card) => {
  card.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation(); // stops the pop-up player from opening
    const str = card.dataset.vimeo;
    const id = (str.match(/(\d{6,})/) || [])[1];
    if (!id) return;
    const hash = (str.match(new RegExp(id + "/([a-z0-9]+)", "i")) || [])[1];
    const player = document.createElement("div");
    player.className = "inline-player" + (card.dataset.orientation === "portrait" ? " is-portrait" : "");
    player.innerHTML = `<iframe src="https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0${hash ? "&h=" + hash : ""}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video player"></iframe>`;
    card.replaceWith(player);
  });
});
