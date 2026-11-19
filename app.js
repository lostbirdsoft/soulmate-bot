(function () {
  "use strict";
  // Soulmate Mini App: бесконечная вертикальная лента анкет на весь экран.
  // Прокрутка вниз = пропуск (👎), ❤️ или двойное касание = лайк. Вся логика и проверки находятся на сервере.
  var tg = window.Telegram && window.Telegram.WebApp;
  var API = String((window.SM_CONFIG && window.SM_CONFIG.api) || "").replace(/\/$/, "");

  var TXT = {
    uk: {
      openInBot: "Відкрий застосунок із бота", openInBotP: "Цей екран працює лише всередині Telegram.",
      loading: "Завантаження…", empty: "Анкети закінчились", emptyP: "Заглянь трохи пізніше, з’являться нові.",
      refresh: "Оновити", err: "Щось пішло не так. Спробуй ще раз.", retry: "Спробувати ще",
      match: "Це метч! 🎉", matchP: "Ви сподобались одне одному з", write: "Написати", keep: "Дивитися далі",
      matchNoLink: "Відкрий чат у боті — там уже лежить ваш контакт.",
      reportQ: "Поскаржитись на цю анкету?", reported: "Дякуємо, скаргу надіслано.",
      disabled: "Застосунок тимчасово вимкнено", disabledP: "Скористайся ботом, поки ми це виправляємо.",
      noProfile: "Спершу створи анкету в боті", noProfileP: "Заповни анкету в чаті з ботом, потім повертайся сюди.",
      unauthorized: "Сесія застаріла", unauthorizedP: "Закрий застосунок і відкрий його знову.",
      close: "Закрити", like: "Подобається", report: "Поскаржитись"
    },
    ru: {
      openInBot: "Открой приложение из бота", openInBotP: "Этот экран работает только внутри Telegram.",
      loading: "Загрузка…", empty: "Анкеты закончились", emptyP: "Загляни чуть позже, появятся новые.",
      refresh: "Обновить", err: "Что-то пошло не так. Попробуй ещё раз.", retry: "Повторить",
      match: "Это мэтч! 🎉", matchP: "Вы понравились друг другу с", write: "Написать", keep: "Смотреть дальше",
      matchNoLink: "Открой чат с ботом — там уже лежит ваш контакт.",
      reportQ: "Пожаловаться на эту анкету?", reported: "Спасибо, жалоба отправлена.",
      disabled: "Приложение временно отключено", disabledP: "Пользуйся ботом, пока мы это исправляем.",
      noProfile: "Сначала создай анкету в боте", noProfileP: "Заполни анкету в чате с ботом, потом возвращайся сюда.",
      unauthorized: "Сессия устарела", unauthorizedP: "Закрой приложение и открой его снова.",
      close: "Закрыть", like: "Нравится", report: "Пожаловаться"
    }
  };
  var L = "uk";
  var t = function (k) { return (TXT[L] || TXT.uk)[k] || k; };

  var feed = document.getElementById("feed");
  var screen = document.getElementById("screen");
  var matchEl = document.getElementById("match");
  var toastEl = document.getElementById("toast");

  var cards = [];          // [{ el, p }]
  var seen = [];           // id всех присланных анкет (сервер не повторяет их в этой сессии)
  var rated = {};          // id -> 0 (пропуск) | 1 (лайк)
  var current = -1, loading = false, ended = false, endEl = null, observer = null;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text; // всегда textContent: данные анкет никогда не вставляются как HTML
    return e;
  }
  function haptic(kind) { try { tg.HapticFeedback.impactOccurred(kind || "light"); } catch (e) {} }
  function toast(msg) {
    toastEl.textContent = msg; toastEl.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { toastEl.hidden = true; }, 2600);
  }

  // ---------- API ----------
  function api(path, opts) {
    opts = opts || {};
    return fetch(API + path, {
      method: opts.method || "GET",
      headers: Object.assign({ Authorization: "tma " + (tg ? tg.initData : "") }, opts.body ? { "Content-Type": "application/json" } : {}),
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var e = new Error(j.error || "http_" + r.status); e.status = r.status; e.code = j.error; throw e; }
        return j;
      });
    });
  }

  // ---------- экраны ----------
  function showScreen(title, text, btn) {
    screen.textContent = "";
    screen.appendChild(el("h3", "", title));
    if (text) screen.appendChild(el("p", "", text));
    if (btn) { var b = el("button", "cta", btn.label); b.onclick = btn.fn; screen.appendChild(b); }
    screen.hidden = false;
  }
  function showLoading() {
    screen.textContent = ""; screen.appendChild(el("div", "spin")); screen.appendChild(el("p", "", t("loading"))); screen.hidden = false;
  }
  function failScreen(e) {
    var c = e && e.code;
    if (c === "disabled") return showScreen(t("disabled"), t("disabledP"), { label: t("close"), fn: function () { tg.close(); } });
    if (c === "no_profile") return showScreen(t("noProfile"), t("noProfileP"), { label: t("close"), fn: function () { tg.close(); } });
    if (c === "banned" || c === "unauthorized") return showScreen(t("unauthorized"), t("unauthorizedP"), { label: t("close"), fn: function () { tg.close(); } });
    showScreen(t("err"), "", { label: t("retry"), fn: start });
  }

  // ---------- карточка ----------
  function buildCard(p, index) {
    var card = el("section", "card");
    card.dataset.id = p.id;

    var media = el("div", "media");
    var dots = el("div", "dots");
    p.media.forEach(function (m, i) {
      var s = el("div", "slide");
      if (m.t === "v") {
        var v = document.createElement("video");
        v.src = m.url; v.muted = true; v.loop = true; v.playsInline = true; v.preload = "metadata";
        v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", "");
        s.appendChild(v);
      } else {
        var img = new Image();
        img.alt = ""; img.draggable = false; img.decoding = "async";
        img.loading = index < 2 && i === 0 ? "eager" : "lazy";
        img.src = m.url; s.appendChild(img);
      }
      media.appendChild(s);
      dots.appendChild(el("i", i === 0 ? "on" : ""));
    });
    if (p.media.length < 2) dots.hidden = true;
    card.appendChild(media);
    card.appendChild(dots);
    card.appendChild(el("div", "shade"));

    var info = el("div", "info");
    var h = el("h2", "", p.name + ", " + p.age);
    if (p.premium) h.appendChild(el("span", "badge", "💎"));
    info.appendChild(h);
    var meta = [p.city, p.distance].filter(Boolean).join("  ·  ");
    if (meta) info.appendChild(el("div", "meta", meta));
    if (p.about) {
      var about = el("div", "about", p.about);
      about.onclick = function () { about.classList.toggle("open"); };
      info.appendChild(about);
    }
    if (p.interests && p.interests.length) {
      var chips = el("div", "chips");
      p.interests.forEach(function (i) { chips.appendChild(el("span", "chip" + (i.shared ? " shared" : ""), i.t)); });
      info.appendChild(chips);
    }
    if (p.socials && p.socials.length) {
      var soc = el("div", "socials");
      p.socials.forEach(function (s) {
        var a = el("a", "", s.name); a.href = s.url;
        a.onclick = function (ev) { ev.preventDefault(); try { tg.openLink(s.url); } catch (e) { window.open(s.url, "_blank"); } };
        soc.appendChild(a);
      });
      info.appendChild(soc);
    }
    card.appendChild(info);

    var act = el("div", "actions");
    var likeBtn = el("button", "btn like", "❤️"); likeBtn.setAttribute("aria-label", t("like"));
    likeBtn.onclick = function () { like(card); };
    var repBtn = el("button", "btn small", "🚩"); repBtn.setAttribute("aria-label", t("report"));
    repBtn.onclick = function () { report(card); };
    act.appendChild(likeBtn);
    if (p.likes) act.appendChild(el("div", "cnt", String(p.likes)));
    act.appendChild(repBtn);
    card.appendChild(act);

    var pop = el("div", "pop", "❤️"); card.appendChild(pop);

    // двойное касание = лайк
    var last = 0;
    media.addEventListener("click", function () {
      var n = Date.now();
      if (n - last < 320) { last = 0; like(card); } else last = n;
    });
    // индикатор фото и видео
    var tmo;
    media.addEventListener("scroll", function () {
      clearTimeout(tmo);
      tmo = setTimeout(function () { syncDots(card); syncVideo(card, cards[current] && cards[current].el === card); }, 80);
    });

    card._p = p; card._likeBtn = likeBtn; card._pop = pop;
    if (rated[p.id] === 1) likeBtn.classList.add("on");
    return card;
  }

  function slideIndex(card) {
    var m = card.querySelector(".media");
    return m && m.clientWidth ? Math.round(m.scrollLeft / m.clientWidth) : 0;
  }
  function syncDots(card) {
    var idx = slideIndex(card);
    var ds = card.querySelectorAll(".dots i");
    for (var i = 0; i < ds.length; i++) ds[i].className = i === idx ? "on" : "";
  }
  function syncVideo(card, active) {
    var idx = slideIndex(card);
    var slides = card.querySelectorAll(".slide");
    for (var i = 0; i < slides.length; i++) {
      var v = slides[i].querySelector("video");
      if (!v) continue;
      if (active && i === idx) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.pause();
    }
  }

  // ---------- действия ----------
  function like(card) {
    var p = card._p;
    card._pop.classList.remove("go"); void card._pop.offsetWidth; card._pop.classList.add("go");
    haptic("medium");
    if (rated[p.id] === 1) return;
    var prev = rated[p.id];
    rated[p.id] = 1; card._likeBtn.classList.add("on");
    api("/api/swipe", { method: "POST", body: { id: p.id, v: 1 } }).then(function (r) {
      if (r.match) showMatch(p, r.contact);
    }).catch(function () {
      if (prev === undefined) delete rated[p.id]; else rated[p.id] = prev;
      card._likeBtn.classList.remove("on"); toast(t("err"));
    });
  }

  // Карточка покинута и не лайкнута — это пропуск
  function leave(idx) {
    var c = cards[idx]; if (!c) return;
    syncVideo(c.el, false);
    var id = c.p.id;
    if (rated[id] !== undefined) return;
    rated[id] = 0;
    api("/api/swipe", { method: "POST", body: { id: id, v: 0 } }).catch(function () { delete rated[id]; });
  }

  function report(card) {
    var p = card._p;
    var go = function () {
      api("/api/report", { method: "POST", body: { id: p.id } }).then(function () { toast(t("reported")); }).catch(function () { toast(t("err")); });
      rated[p.id] = 0;
      card.style.display = "none"; // следующая анкета встанет на место
    };
    if (tg && tg.showConfirm) tg.showConfirm(t("reportQ"), function (ok) { if (ok) go(); });
    else if (window.confirm(t("reportQ"))) go();
  }

  function showMatch(p, contact) {
    matchEl.textContent = "";
    matchEl.appendChild(el("h1", "", t("match")));
    matchEl.appendChild(el("p", "", t("matchP") + " " + (contact && contact.name ? contact.name : p.name)));
    var row = el("div", "row");
    if (contact && contact.url) {
      var w = el("button", "cta", t("write"));
      w.onclick = function () { try { tg.openTelegramLink(contact.url); } catch (e) { window.open(contact.url, "_blank"); } };
      row.appendChild(w);
    } else matchEl.appendChild(el("p", "", t("matchNoLink")));
    var k = el("button", "cta ghost", t("keep")); k.onclick = function () { matchEl.hidden = true; };
    row.appendChild(k); matchEl.appendChild(row); matchEl.hidden = false;
    haptic("heavy");
    try { tg.HapticFeedback.notificationOccurred("success"); } catch (e) {}
  }

  // ---------- загрузка и бесконечная прокрутка ----------
  function appendCards(list) {
    list.forEach(function (p) {
      if (seen.indexOf(p.id) !== -1) return;
      seen.push(p.id);
      var c = buildCard(p, cards.length);
      cards.push({ el: c, p: p });
      if (endEl) feed.insertBefore(c, endEl); else feed.appendChild(c);
      observer.observe(c);
    });
  }

  function showEnd() {
    if (endEl) return;
    endEl = el("section", "card end");
    endEl.appendChild(el("h3", "", t("empty")));
    endEl.appendChild(el("p", "", t("emptyP")));
    var b = el("button", "cta", t("refresh")); b.onclick = start; endEl.appendChild(b);
    feed.appendChild(endEl);
  }

  function loadMore() {
    if (loading || ended) return Promise.resolve();
    loading = true;
    return api("/api/feed?seen=" + seen.slice(-100).join(",")).then(function (r) {
      loading = false;
      if (!r.profiles || !r.profiles.length) { ended = true; showEnd(); return; }
      appendCards(r.profiles);
    }).catch(function (e) {
      loading = false;
      if (!cards.length) failScreen(e); else toast(t("err"));
    });
  }

  function onActive(idx) {
    if (idx === current) return;
    var prev = current;
    current = idx;
    if (prev >= 0) leave(prev);
    syncVideo(cards[idx].el, true);
    syncDots(cards[idx].el);
    if (idx >= cards.length - 2) loadMore();
  }

  function setupObserver() {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        for (var i = 0; i < cards.length; i++) if (cards[i].el === en.target) { onActive(i); return; }
      });
    }, { root: feed, threshold: 0.6 });
  }

  function start() {
    cards = []; seen = []; rated = {}; current = -1; ended = false; endEl = null; loading = false;
    feed.textContent = ""; feed.scrollTop = 0;
    setupObserver();
    showLoading();
    api("/api/me").then(function (me) {
      L = me.lang === "ru" ? "ru" : "uk";
      return loadMore();
    }).then(function () {
      screen.hidden = true;
      if (!cards.length && ended) { /* пустая лента: на экране карточка «Анкети закінчились» */ }
    }).catch(function (e) { failScreen(e); });
  }

  // ---------- запуск ----------
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.language_code === "ru") L = "ru";
  if (!tg || !tg.initData) {
    showScreen(t("openInBot"), t("openInBotP"));
  } else {
    try { tg.ready(); tg.expand(); } catch (e) {}
    try { tg.disableVerticalSwipes(); } catch (e) {} // иначе свайп вниз закрывает приложение
    try { tg.setHeaderColor("#000000"); tg.setBackgroundColor("#000000"); } catch (e) {}
    document.addEventListener("visibilitychange", function () {
      if (cards[current]) syncVideo(cards[current].el, !document.hidden);
    });
    start();
  }
})();
