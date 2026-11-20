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
      close: "Закрити", like: "Подобається", report: "Поскаржитись",
      edTitle: "Моя анкета", save: "Зберегти", saved: "Збережено ✅", leaveQ: "Вийти без збереження змін?",
      sPhotos: "Фото та відео", addPhoto: "Додати", mainTag: "Головне", delPhotoQ: "Видалити це фото?", uploading: "Завантажую…",
      videoHint: "Відео додається в чаті з ботом: Моя анкета → Змінити фото/відео (там список медіа заповнюється наново).",
      fName: "Ім’я", fAge: "Вік", ageLockedHint: "Вік рахується за датою народження (її змінюють у боті: Налаштування).",
      fGender: "Я", male: "👨 Хлопець", female: "👩 Дівчина", fLooking: "Шукаю", lookM: "👨 Хлопців", lookF: "👩 Дівчат", lookA: "👥 Всіх",
      fCity: "Місто", fAbout: "Про себе", aboutPh: "Розкажи трохи про себе та кого шукаєш", fInterests: "Інтереси", customInterest: "＋ Свій інтерес", customPh: "Твій інтерес", add: "Додати", maxInterests: "Максимум 5 інтересів. Спочатку прибери якийсь.",
      e_bad_name: "Ім’я має бути від 1 до 30 символів.", e_name_chars: "В імені мають бути літери.", e_bad_age: "Вік: число від 18 до 80.", e_age_locked: "Вік змінюється через дату народження.",
      e_bad_gender: "Обери стать.", e_bad_looking: "Обери, кого шукаєш.", e_city_chars: "У назві міста мають бути літери.", e_bad_city: "Напиши назву міста (до 40 символів).",
      e_about_long: "Занадто довго — максимум 300 символів.", e_bad_interests: "Інтерес не підходить: 2–20 символів без посилань і спецсимволів.",
      e_media_full: "Досягнуто ліміт фото і відео.", e_media_last: "У анкеті має лишитися хоча б одне фото.", e_too_big: "Файл завеликий.", e_bad_image: "Це не схоже на фото.",
      e_upload_failed: "Не вдалося завантажити фото. Спробуй ще раз.", e_upload_disabled: "Завантаження фото тут вимкнено — додай фото в боті.", e_conflict: "Анкету щойно змінили, спробуй ще раз.",
      e_edit_disabled: "Редагування тимчасово вимкнено.", e_not_found: "Файл уже видалено.", e_bad_order: "Список змінився, спробуй ще раз."
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
      close: "Закрыть", like: "Нравится", report: "Пожаловаться",
      edTitle: "Моя анкета", save: "Сохранить", saved: "Сохранено ✅", leaveQ: "Выйти без сохранения изменений?",
      sPhotos: "Фото и видео", addPhoto: "Добавить", mainTag: "Главное", delPhotoQ: "Удалить это фото?", uploading: "Загружаю…",
      videoHint: "Видео добавляется в чате с ботом: Моя анкета → Изменить фото/видео (там список медиа заполняется заново).",
      fName: "Имя", fAge: "Возраст", ageLockedHint: "Возраст считается по дате рождения (её меняют в боте: Настройки).",
      fGender: "Я", male: "👨 Парень", female: "👩 Девушка", fLooking: "Ищу", lookM: "👨 Парней", lookF: "👩 Девушек", lookA: "👥 Всех",
      fCity: "Город", fAbout: "О себе", aboutPh: "Расскажи немного о себе и о том, кого ищешь", fInterests: "Интересы", customInterest: "＋ Свой интерес", customPh: "Твой интерес", add: "Добавить", maxInterests: "Максимум 5 интересов. Сначала убери какой-нибудь.",
      e_bad_name: "Имя должно быть от 1 до 30 символов.", e_name_chars: "В имени должны быть буквы.", e_bad_age: "Возраст: число от 18 до 80.", e_age_locked: "Возраст меняется через дату рождения.",
      e_bad_gender: "Выбери пол.", e_bad_looking: "Выбери, кого ищешь.", e_city_chars: "В названии города должны быть буквы.", e_bad_city: "Напиши название города (до 40 символов).",
      e_about_long: "Слишком длинно — максимум 300 символов.", e_bad_interests: "Интерес не подходит: 2–20 символов без ссылок и спецсимволов.",
      e_media_full: "Достигнут лимит фото и видео.", e_media_last: "В анкете должно остаться хотя бы одно фото.", e_too_big: "Файл слишком большой.", e_bad_image: "Это не похоже на фото.",
      e_upload_failed: "Не удалось загрузить фото. Попробуй ещё раз.", e_upload_disabled: "Загрузка фото здесь выключена — добавь фото в боте.", e_conflict: "Анкету только что изменили, попробуй ещё раз.",
      e_edit_disabled: "Редактирование временно выключено.", e_not_found: "Файл уже удалён.", e_bad_order: "Список изменился, попробуй ещё раз."
    }
  };
  var L = "uk";
  var t = function (k) { return (TXT[L] || TXT.uk)[k] || k; };

  var feed = document.getElementById("feed");
  var screen = document.getElementById("screen");
  var matchEl = document.getElementById("match");
  var toastEl = document.getElementById("toast");
  var editorEl = document.getElementById("editor");
  var meBtn = document.getElementById("meBtn");

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
      headers: Object.assign({ Authorization: "tma " + (tg ? tg.initData : "") }, opts.raw ? { "Content-Type": opts.raw.type || "application/octet-stream" } : opts.body ? { "Content-Type": "application/json" } : {}),
      body: opts.raw ? opts.raw : opts.body ? JSON.stringify(opts.body) : undefined
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
      if (meBtn) { meBtn.hidden = !me.edit; meBtn.setAttribute("aria-label", t("edTitle")); }
      return loadMore();
    }).then(function () {
      screen.hidden = true;
      if (!cards.length && ended) { /* пустая лента: на экране карточка «Анкети закінчились» */ }
    }).catch(function (e) { failScreen(e); });
  }

  // ---------- редактор анкеты ----------
  var ed = null; // состояние открытого редактора

  function mkBtn(cls, text, fn) { var b = el("button", cls, text); b.type = "button"; b.onclick = fn; return b; }
  function errText(e) { var k = "e_" + (e && e.code); var v = (TXT[L] || TXT.uk)[k]; return v || t("err"); }
  function eqList(a, b) { return JSON.stringify(a.slice().sort()) === JSON.stringify(b.slice().sort()); }

  function openEditor() {
    if (!ed) {
      ed = { busy: false, data: null, base: null, dirty: false, interests: [], gender: null, looking: null, media: [] };
      if (cards[current]) syncVideo(cards[current].el, false);
      editorEl.textContent = ""; editorEl.appendChild(el("div", "spin")); editorEl.hidden = false;
      try { tg.BackButton.show(); tg.BackButton.onClick(onBack); } catch (e) {}
      api("/api/profile").then(function (d) { if (ed) buildEditor(d); }).catch(function (e) { toast(errText(e)); closeEditor(true); });
    }
  }

  function onBack() { closeEditor(false); }

  function closeEditor(force) {
    if (!ed) return;
    var go = function () {
      ed = null; editorEl.hidden = true; editorEl.textContent = "";
      try { tg.BackButton.offClick(onBack); tg.BackButton.hide(); } catch (e) {}
      if (cards[current] && !document.hidden) syncVideo(cards[current].el, true);
    };
    if (!force && ed.dirty) {
      if (tg && tg.showConfirm) tg.showConfirm(t("leaveQ"), function (ok) { if (ok) go(); });
      else if (window.confirm(t("leaveQ"))) go();
    } else go();
  }

  function segment(items, value, onPick) {
    var box = el("div", "seg"), btns = {};
    items.forEach(function (it) {
      var b = mkBtn(it.v === value ? "on" : "", it.label, function () {
        Object.keys(btns).forEach(function (k) { btns[k].className = k === it.v ? "on" : ""; });
        onPick(it.v);
      });
      btns[it.v] = b; box.appendChild(b);
    });
    return box;
  }

  function section(label, node) {
    var s = el("div", "ed-sec");
    if (label) s.appendChild(el("div", "lbl", label));
    s.appendChild(node);
    return s;
  }

  function buildEditor(d) {
    ed.data = d;
    ed.base = { name: d.name, age: d.age, gender: d.gender, looking: d.looking, city: d.city, about: d.about || "", interests: (d.interests || []).slice() };
    ed.gender = d.gender; ed.looking = d.looking; ed.interests = (d.interests || []).slice(); ed.media = d.media || [];
    var lim = d.limits;
    editorEl.textContent = "";

    var head = el("div", "ed-head");
    head.appendChild(el("h3", "", t("edTitle")));
    head.appendChild(mkBtn("ed-close", "✕", function () { closeEditor(false); }));
    editorEl.appendChild(head);

    var body = el("div", "ed-body");
    editorEl.appendChild(body);

    // фото и видео
    ed.tiles = el("div", "tiles");
    ed.photoSec = el("div", "ed-sec");
    ed.photoSec.appendChild(el("div", "lbl", t("sPhotos")));
    ed.photoSec.appendChild(ed.tiles);
    body.appendChild(ed.photoSec);
    ed.file = document.createElement("input");
    ed.file.type = "file"; ed.file.accept = "image/*"; ed.file.multiple = true; ed.file.hidden = true;
    ed.file.onchange = onFiles;
    ed.photoSec.appendChild(ed.file);
    renderMedia();

    // имя и возраст
    ed.name = el("input", "ed-in"); ed.name.type = "text"; ed.name.maxLength = lim.name; ed.name.value = d.name; ed.name.oninput = syncDirty;
    body.appendChild(section(t("fName"), ed.name));
    ed.age = el("input", "ed-in"); ed.age.type = "number"; ed.age.inputMode = "numeric"; ed.age.min = 18; ed.age.max = 80; ed.age.value = d.age; ed.age.oninput = syncDirty;
    var ageSec = section(t("fAge"), ed.age);
    if (d.ageLocked) { ed.age.readOnly = true; ageSec.appendChild(el("div", "ed-hint", t("ageLockedHint"))); }
    body.appendChild(ageSec);

    body.appendChild(section(t("fGender"), segment([{ v: "m", label: t("male") }, { v: "f", label: t("female") }], d.gender, function (v) { ed.gender = v; syncDirty(); })));
    body.appendChild(section(t("fLooking"), segment([{ v: "m", label: t("lookM") }, { v: "f", label: t("lookF") }, { v: "a", label: t("lookA") }], d.looking, function (v) { ed.looking = v; syncDirty(); })));

    // город
    ed.city = el("input", "ed-in"); ed.city.type = "text"; ed.city.maxLength = 40; ed.city.value = d.city; ed.city.oninput = syncDirty;
    var citySec = section(t("fCity"), ed.city);
    var cp = el("div", "pills"); cp.style.marginTop = "8px";
    (d.cities || []).forEach(function (c) { cp.appendChild(mkBtn("pill mini", c, function () { ed.city.value = c; syncDirty(); })); });
    citySec.appendChild(cp);
    body.appendChild(citySec);

    // о себе
    ed.about = el("textarea", "ed-in"); ed.about.maxLength = lim.about; ed.about.value = d.about || ""; ed.about.placeholder = t("aboutPh");
    ed.cnt = el("div", "ed-cnt");
    ed.about.oninput = function () { syncCount(); syncDirty(); };
    var aboutSec = section(t("fAbout"), ed.about); aboutSec.appendChild(ed.cnt);
    body.appendChild(aboutSec);
    syncCount();

    // интересы
    if (d.showInterests) {
      ed.intBox = el("div", "pills");
      var intSec = section(t("fInterests"), ed.intBox);
      ed.addRow = el("div", "row2"); ed.addRow.hidden = true;
      ed.custom = el("input", "ed-in"); ed.custom.type = "text"; ed.custom.maxLength = 20; ed.custom.placeholder = t("customPh");
      var addB = mkBtn("cta", t("add"), addCustom);
      ed.custom.onkeydown = function (ev) { if (ev && ev.key === "Enter") addCustom(); };
      ed.addRow.appendChild(ed.custom); ed.addRow.appendChild(addB);
      intSec.appendChild(ed.addRow);
      body.appendChild(intSec);
      renderInterests();
    }

    var foot = el("div", "ed-foot");
    ed.saveBtn = mkBtn("cta", t("save"), save); ed.saveBtn.disabled = true;
    foot.appendChild(ed.saveBtn);
    editorEl.appendChild(foot);
  }

  function syncCount() { ed.cnt.textContent = ed.about.value.length + " / " + ed.data.limits.about; }

  function current_() {
    var f = {}, b = ed.base;
    var name = ed.name.value.trim(); if (name !== b.name) f.name = name;
    if (!ed.data.ageLocked) { var av = String(ed.age.value).trim(), age = av === "" ? NaN : Number(av); if (age !== b.age) f.age = isNaN(age) ? av : age; }
    if (ed.gender !== b.gender) f.gender = ed.gender;
    if (ed.looking !== b.looking) f.looking = ed.looking;
    var city = ed.city.value.trim(); if (city !== b.city) f.city = city;
    var about = ed.about.value.trim(); if (about !== b.about) f.about = about;
    if (ed.data.showInterests && !eqList(ed.interests, b.interests)) f.interests = ed.interests.slice();
    return f;
  }
  function syncDirty() {
    var f = current_();
    ed.dirty = Object.keys(f).length > 0;
    ed.saveBtn.disabled = !ed.dirty;
  }

  // ----- интересы -----
  function renderInterests() {
    var box = ed.intBox; box.textContent = "";
    var lim = ed.data.limits.interests;
    ed.data.presets.forEach(function (p) {
      var on = ed.interests.indexOf(p.id) !== -1;
      box.appendChild(mkBtn("pill" + (on ? " on" : ""), p.e + " " + p.t, function () { toggleInterest(p.id); }));
    });
    ed.interests.forEach(function (x) {
      if (x.indexOf("c:") !== 0) return;
      box.appendChild(mkBtn("pill on", "✨ " + x.slice(2) + " ✕", function () { toggleInterest(x); }));
    });
    box.appendChild(mkBtn("pill add", t("customInterest"), function () {
      if (ed.interests.length >= lim) return toast(t("maxInterests"));
      ed.addRow.hidden = !ed.addRow.hidden;
      if (!ed.addRow.hidden) { try { ed.custom.focus(); } catch (e) {} }
    }));
  }
  function toggleInterest(x) {
    var i = ed.interests.indexOf(x);
    if (i !== -1) ed.interests.splice(i, 1);
    else { if (ed.interests.length >= ed.data.limits.interests) return toast(t("maxInterests")); ed.interests.push(x); }
    renderInterests(); syncDirty();
  }
  function addCustom() {
    var v = ed.custom.value.replace(/\s+/g, " ").trim();
    if (v.length < 2 || v.length > 20 || /[<>@\/\\]|https?|t\.me/i.test(v)) return toast(t("e_bad_interests"));
    if (ed.interests.length >= ed.data.limits.interests) return toast(t("maxInterests"));
    var key = "c:" + v;
    if (!ed.interests.some(function (x) { return x.toLowerCase() === key.toLowerCase(); })) ed.interests.push(key);
    ed.custom.value = ""; ed.addRow.hidden = true;
    renderInterests(); syncDirty();
  }

  // ----- фото и видео -----
  function fmtDur(sec) { sec = Math.max(0, Math.round(sec || 0)); return Math.floor(sec / 60) + ":" + (sec % 60 < 10 ? "0" : "") + (sec % 60); }
  function renderMedia() {
    var lim = ed.data.limits, tiles = ed.tiles;
    tiles.textContent = "";
    ed.media.forEach(function (m, i) {
      var tile = el("div", "tile");
      if (m.t === "v") { var v = el("div", "vid", "🎬"); v.appendChild(el("small", "", fmtDur(m.d))); tile.appendChild(v); }
      else { var img = new Image(); img.alt = ""; img.decoding = "async"; img.src = m.url; tile.appendChild(img); }
      if (i === 0) tile.appendChild(el("div", "main", t("mainTag")));
      else tile.appendChild(mkBtn("star", "★", function () { makeMain(m.h); }));
      tile.appendChild(mkBtn("x", "✕", function () { delMedia(m.h); }));
      tiles.appendChild(tile);
    });
    var photos = ed.media.filter(function (m) { return m.t !== "v"; }).length;
    if (lim.upload && ed.media.length < lim.media && photos < lim.photos) {
      var add = el("button", "tile add", "＋"); add.type = "button"; add.appendChild(el("small", "", t("addPhoto")));
      add.onclick = function () { if (!ed.busy) ed.file.click(); };
      tiles.appendChild(add);
    }
    var hasVideo = ed.media.some(function (m) { return m.t === "v"; });
    if (ed.hint) { ed.hint.remove(); ed.hint = null; }
    if (lim.videos > 0 && !hasVideo) { ed.hint = el("div", "ed-hint", t("videoHint")); ed.photoSec.appendChild(ed.hint); }
  }
  function mediaCall(path, body, raw) {
    if (ed.busy) return Promise.reject({ code: "busy" });
    ed.busy = true; ed.tiles.classList.add("busy");
    return api(path, raw ? { method: "POST", raw: raw } : { method: "POST", body: body }).then(function (r) {
      ed.busy = false; if (ed) { ed.tiles.classList.remove("busy"); if (r.media) { ed.media = r.media; renderMedia(); } }
      return r;
    }, function (e) {
      ed.busy = false; if (ed) ed.tiles.classList.remove("busy");
      throw e;
    });
  }
  function delMedia(h) {
    if (ed.busy) return;
    var go = function () {
      mediaCall("/api/media/delete", { h: h }).then(function () { haptic("light"); }).catch(function (e) { if (e.code !== "busy") toast(errText(e)); });
    };
    if (tg && tg.showConfirm) tg.showConfirm(t("delPhotoQ"), function (ok) { if (ok) go(); }); else if (window.confirm(t("delPhotoQ"))) go();
  }
  function makeMain(h) {
    if (ed.busy) return;
    var order = [h].concat(ed.media.map(function (m) { return m.h; }).filter(function (x) { return x !== h; }));
    mediaCall("/api/media/order", { order: order }).then(function () { haptic("light"); }).catch(function (e) { if (e.code !== "busy") toast(errText(e)); });
  }
  // сжатие перед отправкой: до 1280 px по длинной стороне, JPEG
  function compress(file) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height, k = Math.min(1, 1280 / Math.max(w, h));
        var cv = document.createElement("canvas"); cv.width = Math.max(1, Math.round(w * k)); cv.height = Math.max(1, Math.round(h * k));
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        try { URL.revokeObjectURL(url); } catch (e) {}
        cv.toBlob(function (b) { if (b) res(b); else rej(new Error("compress")); }, "image/jpeg", 0.86);
      };
      img.onerror = function () { try { URL.revokeObjectURL(url); } catch (e) {} rej(new Error("image")); };
      img.src = url;
    });
  }
  function onFiles() {
    var files = Array.prototype.slice.call(ed.file.files || []);
    ed.file.value = "";
    var lim = ed.data.limits;
    var room = Math.min(lim.media - ed.media.length, lim.photos - ed.media.filter(function (m) { return m.t !== "v"; }).length);
    files = files.slice(0, Math.max(0, room));
    if (!files.length) return;
    toast(t("uploading"));
    var chain = Promise.resolve();
    files.forEach(function (f) {
      chain = chain.then(function () {
        if (!ed) return;
        return compress(f).then(function (blob) { return mediaCall("/api/media/photo", null, blob); });
      });
    });
    chain.then(function () { if (ed) haptic("light"); }).catch(function (e) { toast(e && e.code ? errText(e) : t("e_bad_image")); });
  }

  // ----- сохранение -----
  function save() {
    if (!ed || ed.busy) return;
    var f = current_();
    if (!Object.keys(f).length) return;
    ed.saveBtn.disabled = true;
    api("/api/profile", { method: "POST", body: f }).then(function (r) {
      if (!ed) return;
      var b = ed.base;
      if (r.name !== undefined) { b.name = r.name; ed.name.value = r.name; }
      if (r.age !== undefined) { b.age = r.age; ed.age.value = r.age; }
      if (f.gender !== undefined) b.gender = f.gender;
      if (f.looking !== undefined) b.looking = f.looking;
      if (r.city !== undefined) { b.city = r.city; ed.city.value = r.city; }
      if (r.about !== undefined) { b.about = r.about; ed.about.value = r.about; syncCount(); }
      if (r.interests !== undefined) { b.interests = r.interests.slice(); ed.interests = r.interests.slice(); if (ed.data.showInterests) renderInterests(); }
      syncDirty();
      toast(t("saved"));
      try { tg.HapticFeedback.notificationOccurred("success"); } catch (e) {}
    }).catch(function (e) { if (ed) syncDirty(); toast(errText(e)); });
  }

  if (meBtn) meBtn.onclick = openEditor;

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
