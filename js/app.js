/* Trip App - application logic.
   No libraries, no build step. Hash-based navigation; all content and
   UI strings come from js/trip.js (the single data file). */

(function () {
  "use strict";

  const app = document.getElementById("app");
  const tabbar = document.getElementById("tabbar");
  const toast = document.getElementById("toast");

  /* All user-facing UI strings live in the data file (TRIP.strings),
     so translating the app = editing trip.js only. */
  const S = TRIP.strings;

  /* Language + direction are data-driven. RTL languages (the app was
     originally built in Arabic) work out of the box: the stylesheet uses
     logical properties throughout. */
  const isRTL = (TRIP.dir || "ltr") === "rtl";
  document.documentElement.lang = TRIP.lang || "en";
  document.documentElement.dir = TRIP.dir || "ltr";

  /* Direction-aware chevrons: "back" points against reading direction,
     "go" points along it. */
  const IC_BACK = isRTL ? "caret-right" : "caret-left";
  const IC_GO = isRTL ? "caret-left" : "caret-right";

  /* ------------------------------ helpers ------------------------------ */

  const ic = (name, cls) =>
    `<span class="ic${cls ? " " + cls : ""}">${ICONS[name] || ""}</span>`;

  /* Static icons already present in the page (PIN gate and tab bar) */
  document.querySelectorAll(".ic[data-icon]").forEach((el) => {
    el.innerHTML = ICONS[el.dataset.icon] || "";
  });

  /* Static texts in index.html (PIN gate and tab bar) */
  document.querySelector("#pin-screen h1").textContent = TRIP.title;
  document.querySelector("#pin-screen .sub").textContent = S.pinPrompt;
  tabbar.querySelector('[data-tab="trip"] .lbl').textContent = S.tabTrip;
  tabbar.querySelector('[data-tab="info"] .lbl').textContent = S.tabInfo;
  document.title = TRIP.title;

  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  /* Phone numbers inside RTL text: isolate them left-to-right so the
     digits don't flip. Harmless in LTR. */
  const escBidi = (s) => esc(s).replace(/\+\d[\d\s]*\d/g,
    (m) => `<span class="ltr num">${m}</span>`);

  const mapsDir = (q) => "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q);
  const mapsSearch = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  async function copyText(text, msg) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(msg || S.copied);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); ta.remove();
      showToast(msg || S.copied);
    }
  }
  window.__copy = copyText;

  /* Reveal-on-scroll */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { threshold: 0.12 });

  function activateReveals() {
    let i = 0;
    app.querySelectorAll(".reveal").forEach((el) => {
      el.style.transitionDelay = Math.min(i * 45, 240) + "ms";
      i++;
      io.observe(el);
    });
  }

  /* ------------------------------ dates ------------------------------ */

  const DAY = 86400000;
  const toDate = (iso) => new Date(iso + "T00:00:00");
  function todayISO() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function tripStatus() {
    const t = todayISO();
    if (t < TRIP.start) {
      const days = Math.round((toDate(TRIP.start) - toDate(t)) / DAY);
      return { phase: "before", days };
    }
    if (t > TRIP.end) return { phase: "after" };
    return { phase: "during", today: t, plan: TRIP.dayplan[t] || null };
  }
  function currentStage() {
    const t = todayISO();
    return TRIP.stages.find((s) => t >= s.from && t <= s.to) || null;
  }

  /* ------------------------------ screens ------------------------------ */

  function renderHome() {
    const st = tripStatus();
    const cur = st.phase === "during" ? currentStage() : null;

    let chip = "";
    if (st.phase === "before") {
      chip = `<div class="status-chip">${ic("clock")}${esc(S.countdown(st.days))}</div>`;
    } else if (st.phase === "after") {
      chip = `<div class="status-chip">${ic("check")}${esc(S.tripOver)}</div>`;
    }

    const todayStrip = st.phase === "during" && st.plan ? `
      <div class="today-strip reveal">
        <div class="t-label">${esc(S.today)}</div>
        <div class="t-text">${esc(st.plan)}</div>
      </div>` : "";

    const items = [];
    for (const s of TRIP.stages) {
      if (s.arrive) {
        const isFlight = s.arrive.kind === "flight";
        const first = s.arrive.lines[0] ? s.arrive.lines[0].value : "";
        items.push(`
          <div class="transit reveal">
            <div class="t-ic">${ic(isFlight ? "airplane-takeoff" : "car-simple", "sm")}</div>
            <div class="t-main"><b>${esc(s.arrive.title)}</b>${esc(first)}</div>
          </div>`);
      }
      if (s.id === "home") continue;
      const isNow = cur && cur.id === s.id;
      items.push(`
        <a class="stage-card reveal${isNow ? " now" : ""}" href="#/stage/${s.id}">
          <div class="shell"><div class="core">
            <div class="media"><img src="${s.img}" alt="${esc(s.city)}" loading="lazy"></div>
            <div class="body">
              ${isNow ? `<span class="now-badge">${ic("map-pin", "sm")}${esc(S.youAreHere)}</span>` : ""}
              <div class="dates num">${esc(s.dates)}</div>
              <h3>${esc(s.city)}<span class="latin ltr">${esc(s.cityLatin)}</span></h3>
              <div class="teaser">${esc(s.teaser)}</div>
              <div class="meta">
                ${s.nights ? ic("bed") + `<span>${esc(S.nights(s.nights))}</span>` : ic("shopping-bag-open") + `<span>${esc(S.dayStop)}</span>`}
                <span>·</span><span>${esc(s.who)}</span>
                <span class="go">${esc(S.details)} ${ic(IC_GO, "sm")}</span>
              </div>
            </div>
          </div></div>
        </a>`);
    }

    /* The return leg renders as a transit row plus a small card */
    const ret = TRIP.stages.find((s) => s.id === "home");
    if (ret) {
      items.push(`
        <a class="stage-card reveal" href="#/stage/home">
          <div class="shell"><div class="core">
            <div class="media"><img src="${ret.img}" alt="${esc(ret.city)}" loading="lazy"></div>
            <div class="body">
              <div class="dates num">${esc(ret.dates)}</div>
              <h3>${esc(ret.city)}</h3>
              <div class="teaser">${esc(ret.teaser)}</div>
              <div class="meta">${ic("airplane-landing")}<span>${esc(ret.flightsLabel || "")}</span>
                <span class="go">${esc(S.details)} ${ic(IC_GO, "sm")}</span></div>
            </div>
          </div></div>
        </a>`);
    }

    app.innerHTML = `
      <div class="screen">
        <header class="home-head">
          <h1>${esc(TRIP.subtitle)}</h1>
          <div class="range num">${esc(TRIP.dateRange)}</div>
          ${chip}
        </header>
        ${todayStrip}
        <div class="timeline">${items.join("")}</div>
        <div class="footer-note">${esc(TRIP.footer || "")} ${ic("sparkle")}</div>
      </div>`;
    activateReveals();
  }

  /* ---------- stage page ---------- */

  function infoBlock(a) {
    if (!a) return "";
    const rows = a.lines.map((l) => `
      <div class="info-row"><div class="k">${esc(l.label)}</div><div class="v num">${esc(l.value)}</div></div>`).join("");
    const routeBtn = a.kind === "drive" && a.mapsTo ? `
      <div style="padding:0 20px 20px">
        <a class="btn btn-primary" target="_blank" rel="noopener" href="${mapsDir(a.mapsTo)}">
          ${ic("map-pin")}${esc(S.openRoute)}
        </a>
      </div>` : "";
    return `
      <section class="section-gap reveal">
        <div class="sec-h">${ic(a.kind === "flight" ? "airplane-takeoff" : "car-simple")}${esc(a.title)}</div>
        <div class="shell"><div class="core">
          <div class="info-rows">${rows}</div>
          ${a.note ? `<div class="note-line">${esc(a.note)}</div>` : ""}
          ${routeBtn}
        </div></div>
      </section>`;
  }

  function hotelBlock(h) {
    if (!h) return "";
    const imgs = h.imgs || [];
    const media = imgs.length ? `
      <div class="room-gallery${imgs.length > 1 ? " multi" : ""}">
        ${imgs.map((src, i) => `<div class="slide"><img src="${src}" alt="${esc(h.room)} ${i + 1}" loading="lazy"></div>`).join("")}
      </div>
      ${imgs.length > 1 ? `<div class="gallery-hint">${ic(IC_BACK, "sm")}${esc(S.swipeRooms(h.room))}</div>` : ""}` : "";
    const tips = (h.tips || []).map((t) => `<div class="tip">${ic("check")}<div>${escBidi(t)}</div></div>`).join("");
    const confRow = (label, value) => `
      <div class="conf-row">
        <div>
          <div class="k">${label}</div>
          <div class="v ltr num">${esc(value)}</div>
        </div>
        <button class="copy-btn" onclick="__copy('${esc(value)}','${esc(S.confCopied)}')">${ic("copy")}${esc(S.copy)}</button>
      </div>`;
    const conf = (h.conf ? confRow(esc(S.confNumber) + (h.confPin ? " · " + esc(S.confPin) + " " + esc(h.confPin) : ""), h.conf) : "")
      + (h.conf2 ? confRow(esc(h.conf2Label || S.confExtra), h.conf2) : "");
    return `
      <section class="section-gap reveal">
        <div class="sec-h">${ic("bed")}${esc(S.stay)}</div>
        <div class="shell"><div class="core">
          ${media}
          <div class="hotel-body">
            <h3>${esc(h.name)}</h3>
            <div class="latin ltr">${esc(h.nameLatin)}</div>
            <div class="addr ltr">${esc(h.address)}</div>
            <div class="btn-row">
              <a class="btn btn-primary" target="_blank" rel="noopener" href="${h.maps || mapsSearch(h.nameLatin + ", " + h.address)}">${ic("map-pin")}${esc(S.viewOnMap)}</a>
              <a class="btn btn-quiet" href="tel:${esc(h.phone)}">${ic("phone")}${esc(S.call)}</a>
            </div>
            ${h.pass ? `<div class="btn-row" style="margin-top:10px">
              <a class="btn btn-quiet" href="${h.pass}">${ic("wallet")}${esc(S.walletBooking)}</a>
            </div>` : ""}
            <div class="checks">
              <div class="check-tile"><div class="k">${esc(S.checkin)}</div><div class="v num">${esc(h.checkin)}</div></div>
              <div class="check-tile"><div class="k">${esc(S.checkout)}</div><div class="v num">${esc(h.checkout)}</div></div>
            </div>
            ${conf}
            <div class="tips">${tips}</div>
            ${h.doc ? `<a class="doc-link" href="${h.doc}" target="_blank" rel="noopener">${ic("file-pdf")}${esc(S.bookingDoc)}</a>` : ""}
          </div>
        </div></div>
      </section>`;
  }

  /* Boarding passes: same visual language as the park tickets. The code
     image is a pre-rendered barcode (e.g. a real Aztec from a .pkpass -
     the built-in QR renderer cannot draw Aztec codes, so ship a PNG). */
  function boardingBlock(b) {
    if (!b) return "";
    const cards = b.passes.map((x) => {
      const p = TRIP.people[x.person];
      return `
      <div class="pass reveal"><div class="shell"><div class="core">
        <div class="p-head">
          <div class="p-name">${esc(p.name)}</div>
          <div class="p-tariff num">${esc(S.seat)} ${esc(x.seat)}</div>
        </div>
        <div class="p-cut"></div>
        <div class="qr-wrap">
          <div class="qr-panel"><img src="${x.img}" alt="Boarding ${esc(x.seat)}" style="display:block;width:168px;height:168px;image-rendering:pixelated"></div>
          <div class="code ltr">${esc(b.codeLabel || "")}${b.codeLabel ? " · " : ""}${esc(x.seat)}</div>
        </div>
        ${x.pass ? `<div class="p-actions">
          <a class="btn btn-primary" href="${x.pass}">${ic("wallet")}${esc(S.addToWallet)}</a>
        </div>` : ""}
      </div></div></div>`;
    }).join("");
    return `
      <section class="section-gap reveal">
        <div class="sec-h">${ic("airplane-takeoff")}${esc(S.boarding)}: ${esc(b.route)}</div>
        <div class="park-note reveal">${esc(b.info)}</div>
        <div class="tickets-list">${cards}</div>
      </section>`;
  }

  /* Private driver (pre-booked chauffeur rides) */
  function transferBlock(t) {
    if (!t) return "";
    const rides = t.rides.map((r) => `
      <div class="conf-row">
        <div>
          <div class="k">${esc(r.route)}</div>
          <div class="v num">${esc(r.when)}</div>
        </div>
        <button class="copy-btn" onclick="__copy('${esc(r.id)}','${esc(S.rideCopied)}')">${ic("copy")}${esc(r.id)}</button>
      </div>`).join("");
    const tips = (t.tips || []).map((x) => `<div class="tip">${ic("check")}<div>${escBidi(x)}</div></div>`).join("");
    return `
      <section class="section-gap reveal">
        <div class="sec-h">${ic("car-simple")}${esc(S.driver)}</div>
        <div class="shell"><div class="core">
          <div class="hotel-body" style="padding-top:14px">
            ${rides}
            <div class="tips">${tips}</div>
          </div>
        </div></div>
      </section>`;
  }

  /* Rental-car return reminder (shown on the departure stage) */
  function carReturnBlock(c) {
    if (!c) return "";
    const tips = (c.tips || []).map((t) => `<div class="tip">${ic("check")}<div>${escBidi(t)}</div></div>`).join("");
    return `
      <section class="section-gap reveal">
        <div class="sec-h">${ic("car-simple")}${esc(c.title)}</div>
        <div class="shell"><div class="core">
          <div class="hotel-body" style="padding-top:16px">
            <div class="check-tile" style="background:var(--bg)"><div class="k">${esc(S.dropoffTime)}</div><div class="v num">${esc(c.when)}</div></div>
            <div class="addr ltr" style="margin-top:12px">${esc(c.place)}</div>
            <div class="btn-row">
              <a class="btn btn-primary" target="_blank" rel="noopener" href="${c.maps}">${ic("map-pin")}${esc(S.dropoffOnMap)}</a>
            </div>
            <div class="conf-row">
              <div><div class="k">${esc(S.confNumber)}</div><div class="v ltr num">${esc(c.conf)}</div></div>
              <button class="copy-btn" onclick="__copy('${esc(c.conf)}','${esc(S.confCopied)}')">${ic("copy")}${esc(S.copy)}</button>
            </div>
            <div class="tips">${tips}</div>
          </div>
        </div></div>
      </section>`;
  }

  /* Rental car: shown on the pickup stage */
  function carBlock(c) {
    if (!c) return "";
    const tips = (c.tips || []).map((t) => `<div class="tip">${ic("check")}<div>${escBidi(t)}</div></div>`).join("");
    return `
      <section class="section-gap reveal">
        <div class="sec-h">${ic("car-simple")}${esc(S.tripCar)}</div>
        <div class="shell"><div class="core">
          <div class="car-media"><img src="${c.img}" alt="${esc(c.nameLatin)}" loading="lazy"></div>
          <div class="hotel-body">
            <h3>${esc(c.name)}</h3>
            <div class="latin ltr">${esc(c.nameLatin)}</div>
            <p class="car-desc">${esc(c.desc)}</p>
            <div class="checks">
              <div class="check-tile"><div class="k">${esc(S.pickup)}</div><div class="v num">${esc(c.pickupWhen)}</div></div>
              <div class="check-tile"><div class="k">${esc(S.dropoff)}</div><div class="v num">${esc(c.dropWhen)}</div></div>
            </div>
            ${c.pickupHint ? `<div class="addr">${esc(c.pickupHint)}</div>` : ""}
            <div class="btn-row">
              <a class="btn btn-primary" target="_blank" rel="noopener" href="${c.pickupMaps || mapsSearch(c.pickupPlace)}">${ic("map-pin")}${esc(S.pickupStation)}</a>
            </div>
            <div class="btn-row" style="margin-top:10px">
              <a class="btn btn-quiet" target="_blank" rel="noopener" href="${c.dropMaps || mapsSearch(c.dropPlace)}">${ic("map-pin")}${esc(S.dropoffStation)}</a>
            </div>
            <div class="conf-row">
              <div>
                <div class="k">${esc(S.confNumber)}</div>
                <div class="v ltr num">${esc(c.conf)}</div>
              </div>
              <button class="copy-btn" onclick="__copy('${esc(c.conf)}','${esc(S.confCopied)}')">${ic("copy")}${esc(S.copy)}</button>
            </div>
            ${c.included ? `<div class="note-line" style="margin:14px 0 0;border-radius:12px">${esc(c.included)}</div>` : ""}
            <div class="tips">${tips}</div>
            ${c.doc ? `<a class="doc-link" href="${c.doc}" target="_blank" rel="noopener">${ic("file-pdf")}${esc(S.carDoc)}</a>` : ""}
          </div>
        </div></div>
      </section>`;
  }

  /* Spontaneous evening outing: a timed walking plan plus map pins */
  function outingBlock(o) {
    if (!o) return "";
    const rows = o.schedule.map((r) => `
      <div class="info-row"><div class="k num">${esc(r.t)}</div><div class="v" style="font-weight:500">${esc(r.x)}</div></div>`).join("");
    const places = o.places.map((p, i) => `
      <div class="btn-row"${i ? ' style="margin-top:10px"' : ""}>
        <a class="btn ${i === 0 ? "btn-primary" : "btn-quiet"}" target="_blank" rel="noopener" href="${p.url || mapsSearch(p.maps)}">${ic("map-pin")}${esc(p.name)}</a>
      </div>`).join("");
    const tips = (o.tips || []).map((t) => `<div class="tip">${ic("check")}<div>${escBidi(t)}</div></div>`).join("");
    return `
      <section class="section-gap reveal">
        <div class="sec-h">${ic("sparkle")}${esc(o.name)}</div>
        <div class="shell"><div class="core">
          <div class="hotel-body" style="padding-bottom:0">
            <h3>${esc(o.date)}</h3>
            <div class="latin ltr">${esc(o.latin)}</div>
            <p class="car-desc">${esc(o.teaser)}</p>
          </div>
          <div class="info-rows">${rows}</div>
          <div class="hotel-body" style="padding-top:4px">
            ${places}
            <div class="tips">${tips}</div>
          </div>
        </div></div>
      </section>`;
  }

  /* Pre-booked activity (e.g. a guided tour): entry card with QR + wallet */
  function activityBlock(a) {
    if (!a) return "";
    const tips = (a.tips || []).map((t) => `<div class="tip">${ic("check")}<div>${escBidi(t)}</div></div>`).join("");
    return `
      <section class="section-gap reveal">
        <div class="sec-h">${ic("sparkle")}${esc(S.bookedActivity)}</div>
        <div class="pass"><div class="shell"><div class="core">
          ${a.img ? `<div class="act-media"><img src="${a.img}" alt="${esc(a.name)}" loading="lazy"></div>` : ""}
          <div class="p-head">
            <div>
              <div class="p-name">${esc(a.name)}</div>
              <div class="latin ltr" style="color:var(--muted);font-size:12.5px">${esc(a.latin)}</div>
            </div>
            <div class="p-tariff num">${esc(a.date)}</div>
          </div>
          <div class="day-card" style="padding-top:0">
            <div class="d-date num">${esc(S.when)}: ${esc(a.time)}</div>
            <p>${esc(a.teaser)}</p>
          </div>
          <div class="p-cut"></div>
          <div class="qr-wrap">
            <div class="qr-panel">${qrSVG(a.qr)}</div>
            <div class="code ltr">${esc(a.code)}</div>
          </div>
          <div class="p-actions">
            ${a.pass ? `<a class="btn btn-primary" href="${a.pass}">${ic("wallet")}${esc(S.addToWallet)}</a>` : ""}
            ${a.meetMaps ? `<div class="btn-row" style="margin-top:10px">
              <a class="btn btn-quiet" target="_blank" rel="noopener" href="${a.meetMaps}">${ic("map-pin")}${esc(S.meetingPoint)}</a>
            </div>` : ""}
            <div class="tips">${tips}</div>
          </div>
        </div></div></div>
      </section>`;
  }

  function daysBlock(days, withTickets) {
    if (!days || !days.length) return "";
    return `
      <section class="section-gap reveal">
        <div class="sec-h">${ic("calendar-blank")}${esc(S.yourProgram)}</div>
        <div style="display:flex;flex-direction:column;gap:14px">
          ${days.map((d) => `
            <div class="shell"><div class="core day-card">
              <div class="d-ic">${ic(d.icon)}</div>
              <div class="d-date num">${esc(d.date)}</div>
              <h4>${esc(d.title)}</h4>
              <p>${esc(d.text)}</p>
            </div></div>`).join("")}
        </div>
        ${withTickets ? `
          <div style="margin-top:14px">
            <a class="btn btn-primary" href="#/tickets">${ic("ticket")}${esc(S.ticketsReady)}</a>
          </div>` : ""}
      </section>`;
  }

  function infoCardsBlock(info) {
    if (!info || !info.length) return "";
    return `
      <section class="section-gap reveal">
        <div class="tip-grid">
          ${info.map((t) => `
            <div class="tip-card">
              <div class="t-ic">${ic(t.icon)}</div>
              <h4>${esc(t.title)}</h4>
              <p>${esc(t.text)}</p>
            </div>`).join("")}
        </div>
      </section>`;
  }

  function recsBlock(recs) {
    if (!recs || !recs.length) return "";
    return `
      <section class="section-gap">
        <div class="sec-h reveal">${ic("sparkle")}${esc(S.dontMiss)}</div>
        <div class="recs-scroll">
          ${recs.map((r) => `
            <a class="rec-card" target="_blank" rel="noopener" href="${mapsSearch(r.maps)}">
              <div class="r-top">
                <div class="r-ic">${ic(r.icon)}</div>
                <div><h4>${esc(r.name)}</h4><div class="r-latin ltr">${esc(r.latin)}</div></div>
                ${r.halal ? `<span class="halal-badge">${esc(S.halal)}</span>` : ""}
              </div>
              <p>${esc(r.why)}</p>
              <div class="r-go">${ic("map-pin", "sm")}${esc(S.openInMaps)}</div>
            </a>`).join("")}
        </div>
      </section>`;
  }

  function renderStage(id) {
    const s = TRIP.stages.find((x) => x.id === id);
    if (!s) { location.hash = "#/trip"; return; }

    app.innerHTML = `
      <div class="screen">
        <div class="page-head">
          <button class="back-btn" onclick="location.hash='#/trip'">${ic(IC_BACK)}</button>
          <div class="ttl">${esc(s.city)}</div>
        </div>
        <div class="hero-media reveal"><img src="${s.img}" alt="${esc(s.city)}"></div>
        <div class="stage-title reveal">
          <h2>${esc(s.city)}</h2>
          <div class="latin ltr">${esc(s.cityLatin)}</div>
          <div class="sub num">${esc(s.dates)} · ${esc(s.who)}</div>
        </div>
        ${infoBlock(s.arrive)}
        ${carReturnBlock(s.carReturn)}
        ${transferBlock(s.transfer)}
        ${hotelBlock(s.hotel)}
        ${carBlock(s.car)}
        ${outingBlock(s.outing)}
        ${activityBlock(s.activity)}
        ${daysBlock(s.days, !!s.hasTickets)}
        ${infoCardsBlock(s.info)}
        ${recsBlock(s.recs)}
        ${boardingBlock(s.boarding)}
      </div>`;
    window.scrollTo(0, 0);
    activateReveals();
  }

  /* ---------- tickets ---------- */

  let personFilter = "all";

  function qrSVG(code) {
    const qr = qrcode(0, "M");
    qr.addData(code);
    qr.make();
    const n = qr.getModuleCount();
    const cell = 4, quiet = 2, size = (n + quiet * 2) * cell;
    let path = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
      if (qr.isDark(r, c)) path += `M${(c + quiet) * cell} ${(r + quiet) * cell}h${cell}v${cell}h-${cell}z`;
    return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="QR ${esc(code)}"><rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#111"/></svg>`;
  }

  function renderTickets() {
    const chips = [["all", S.everyone], ...Object.entries(TRIP.people).map(([k, p]) => [k, p.name])];
    const parks = TRIP.parks.map((park) => {
      const list = park.tickets
        .filter((t) => personFilter === "all" || t.person === personFilter)
        .map((t) => {
          const p = TRIP.people[t.person];
          return `
          <div class="pass reveal"><div class="shell"><div class="core">
            <div class="p-head">
              <div class="p-name">${esc(p.name)}</div>
              <div class="p-tariff">${esc(t.tariff)}</div>
            </div>
            <div class="p-cut"></div>
            <div class="qr-wrap">
              <div class="qr-panel">${qrSVG(t.code)}</div>
              <div class="code ltr">${esc(t.code)}</div>
            </div>
            ${t.pass ? `<div class="p-actions">
              <a class="btn btn-primary" href="${t.pass}">${ic("wallet")}${esc(S.addToWallet)}</a>
            </div>` : ""}
          </div></div></div>`;
        }).join("");
      return `
        <div class="park-head reveal">
          <h2>${esc(park.name)}</h2><span class="latin ltr">${esc(park.latin)}</span>
          <div class="when num">${esc(park.date)}<br>${esc(park.time)}</div>
        </div>
        <div class="park-note reveal">${esc(park.note)}
          ${park.pdf ? ` <a href="${park.pdf}" target="_blank" rel="noopener" style="color:var(--accent);font-weight:600">${esc(S.ticketsPdf)}</a>` : ""}
        </div>
        <div class="tickets-list">${list}</div>`;
    }).join("");

    const backStage = TRIP.stages.find((x) => x.hasTickets);
    app.innerHTML = `
      <div class="screen">
        <div class="page-head">
          <button class="back-btn" onclick="location.hash='${backStage ? "#/stage/" + backStage.id : "#/trip"}'">${ic(IC_BACK)}</button>
          <div class="ttl">${esc(S.ticketsTitle)}</div>
        </div>
        <header class="home-head" style="padding-top:6px">
          <h1>${esc(S.tickets)}</h1>
          <div class="range">${esc(S.ticketsSub)}</div>
        </header>
        <div class="person-filter">
          ${chips.map(([k, n]) => `<button class="p-chip${personFilter === k ? " on" : ""}" data-p="${k}">${esc(n)}</button>`).join("")}
        </div>
        ${parks}
      </div>`;

    app.querySelectorAll(".p-chip").forEach((b) =>
      b.addEventListener("click", () => { personFilter = b.dataset.p; renderTickets(); }));
    window.scrollTo(0, 0);
    activateReveals();
  }

  /* ---------- essentials ---------- */

  function renderInfo() {
    const e = TRIP.essentials;
    app.innerHTML = `
      <div class="screen">
        <header class="home-head">
          <h1>${esc(S.tabInfo)}</h1>
          <div class="range">${esc(S.infoSub)}</div>
        </header>

        <section class="reveal">
          <div class="shell"><div class="core emergency-card">
            <div class="e-num ltr num">${esc(e.emergency.number)}</div>
            <p>${esc(e.emergency.text)}</p>
            <a class="btn btn-primary" style="max-width:230px;margin:0 auto" href="tel:${esc(e.emergency.number)}">${ic("siren")}${esc(S.emergencyCall)}</a>
          </div></div>
        </section>

        ${e.areasMap ? `
        <section class="section-gap reveal">
          <div class="shell"><div class="core" style="padding:18px 20px 20px">
            <h3 style="font-size:17px;font-weight:700">${esc(e.areasMap.title)}</h3>
            <p style="color:var(--muted);font-size:14px;line-height:1.9;margin-top:6px">${esc(e.areasMap.text)}</p>
            <div class="btn-row">
              <a class="btn btn-primary" target="_blank" rel="noopener" href="${e.areasMap.url}">${ic("map-pin")}${esc(e.areasMap.btn)}</a>
            </div>
          </div></div>
        </section>` : ""}

        ${e.docs && e.docs.length ? `
        <section class="section-gap reveal">
          <div class="sec-h">${ic("file-pdf")}${esc(S.allDocs)}</div>
          <div class="shell"><div class="core docs-list">
            ${e.docs.map((d) => `
              <a class="doc-row" href="${d.file}" target="_blank" rel="noopener">
                ${ic("file-pdf")}<span>${esc(d.name)}</span>${ic("download-simple", "sm dl")}
              </a>`).join("")}
          </div></div>
        </section>` : ""}

        <section class="section-gap reveal">
          <div class="sec-h">${ic("key")}${esc(S.bookingNumbers)}</div>
          <div class="shell"><div class="core contact-list">
            ${e.bookings.map((b) => `
              <div class="bk-row">
                <div class="bk-main">
                  <div class="bk-name">${esc(b.name)}</div>
                  <div class="bk-sub">
                    <span class="bk-code ltr num">${esc(b.conf)}</span>
                    ${b.pin ? `<span class="bk-pin">${esc(S.confPin)} ${esc(b.pin)}</span>` : ""}
                  </div>
                </div>
                <button class="copy-btn" onclick="__copy('${esc(b.conf)}','${esc(S.confCopied)}')">${ic("copy")}${esc(S.copy)}</button>
              </div>`).join("")}
          </div></div>
        </section>

        <section class="section-gap reveal">
          <div class="sec-h">${ic("phone")}${esc(S.usefulNumbers)}</div>
          <div class="shell"><div class="core contact-list">
            ${e.contacts.map((c) => `
              <div class="contact-row">
                <div class="c-name">${esc(c.name)}</div>
                <a class="call-chip" href="tel:${esc(c.phone)}">${ic("phone")}<span class="ltr num">${esc(c.display)}</span></a>
              </div>`).join("")}
          </div></div>
        </section>

        <section class="section-gap">
          <div class="sec-h reveal">${ic("sparkle")}${esc(S.tipsTitle)}</div>
          <div class="tip-grid">
            ${e.tips.map((t) => `
              <div class="tip-card reveal">
                <div class="t-ic">${ic(t.icon)}</div>
                <h4>${esc(t.title)}</h4>
                <p>${esc(t.text)}</p>
              </div>`).join("")}
          </div>
        </section>
      </div>`;
    activateReveals();
  }

  /* ------------------------------ routing ------------------------------ */

  function setTab(name) {
    tabbar.querySelectorAll(".tab").forEach((t) => t.classList.toggle("on", t.dataset.tab === name));
  }

  function route() {
    const h = location.hash || "#/trip";
    const stage = h.match(/^#\/stage\/(.+)$/);
    if (stage) { setTab("trip"); renderStage(stage[1]); return; }
    if (h === "#/tickets") { setTab("trip"); renderTickets(); return; }
    if (h === "#/info") { setTab("info"); renderInfo(); return; }
    setTab("trip"); renderHome();
  }

  tabbar.querySelectorAll(".tab").forEach((t) =>
    t.addEventListener("click", () => { location.hash = "#/" + t.dataset.tab; }));

  window.addEventListener("hashchange", route);

  /* ------------------------------ PIN gate ------------------------------ */

  const pinScreen = document.getElementById("pin-screen");
  const pinDots = document.getElementById("pin-dots");
  const pinPad = document.getElementById("pin-pad");
  let pinBuf = "";

  function unlock() {
    pinScreen.classList.add("away");
    tabbar.hidden = false;
    route();
    setTimeout(() => pinScreen.remove(), 700);
  }

  function drawDots() {
    pinDots.querySelectorAll("i").forEach((d, i) => d.classList.toggle("full", i < pinBuf.length));
  }

  function pressKey(k) {
    if (k === "del") { pinBuf = pinBuf.slice(0, -1); drawDots(); return; }
    if (pinBuf.length >= 4) return;
    pinBuf += k;
    drawDots();
    if (pinBuf.length === 4) {
      if (pinBuf === TRIP.pin) {
        try { localStorage.setItem("trip-ok", "1"); } catch (e) {}
        setTimeout(unlock, 240);
      } else {
        if (navigator.vibrate) navigator.vibrate(120);
        pinDots.classList.add("err");
        setTimeout(() => { pinDots.classList.remove("err"); pinBuf = ""; drawDots(); }, 480);
      }
    }
  }

  function buildPad() {
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];
    pinPad.innerHTML = keys.map((k) => {
      if (k === "") return "<span></span>";
      if (k === "del") return `<button class="pin-key ghost" data-k="del">${ic("backspace")}</button>`;
      return `<button class="pin-key num" data-k="${k}">${k}</button>`;
    }).join("");
    pinPad.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => pressKey(b.dataset.k)));
  }

  /* ------------------------------ boot ------------------------------ */

  let known = false;
  try { known = localStorage.getItem("trip-ok") === "1"; } catch (e) {}

  /* Direct-unlock link: ?key=<pin> (share once with the family) */
  const qk = new URLSearchParams(location.search).get("key");
  if (qk === TRIP.pin) {
    known = true;
    try { localStorage.setItem("trip-ok", "1"); } catch (e) {}
  }

  if (known) {
    pinScreen.remove();
    tabbar.hidden = false;
    route();
  } else {
    buildPad();
  }

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
    /* When a new version arrives: reload once, automatically */
    let hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController) { hadController = true; return; }
      if (reloaded) return;
      reloaded = true;
      location.reload();
    });
  }
})();
