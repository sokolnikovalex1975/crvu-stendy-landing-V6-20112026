/*!
 * ЦРВУ — интеграции рабочего сайта.
 * 1. Цели Яндекс Метрики 103630235 с теми же именами, что на прежней странице:
 *    phone_click {placement}, email_click {placement}, messenger_click {placement, provider},
 *    lead_submit_success {form_id}, file_download {asset_id}.
 * 2. Меню выбора почты для ссылок mailto: (скопировать, Яндекс Почта, Mail.ru, почтовая программа).
 * 3. Отправка заявок: POST /api/v1/leads (тот же домен, JSON, тот же формат, что у прежней страницы).
 * Счётчики и приём заявок работают только на https://stendy.crvu.ru и на закрытом тесте https://test.crvu.ru.
 */
(function (w, d) {
  'use strict';

  var CRVU = (w.CRVU = w.CRVU || {});
  var CFG = w.CRVU_CONFIG || {};
  var ORIGIN = w.location.origin;
  var MODE = ORIGIN === CFG.productionOrigin ? 'production' : (ORIGIN === CFG.testOrigin ? 'test' : 'off');
  var ID = CFG.metrikaId;
  var PHONE = '+7 (495) 106-70-22';
  CRVU.env = { mode: MODE, live: MODE !== 'off' };

  /* ------------------------------------------------------------------ цели Метрики */
  CRVU.goal = function (name, params) {
    if (!CRVU.env.live || typeof w.ym !== 'function') { return; }
    try {
      var p = null;
      if (params) {
        p = {};
        Object.keys(params).forEach(function (k) {
          var v = params[k];
          if (v !== undefined && v !== null && v !== '') { p[k] = v; }
        });
      }
      if (p && Object.keys(p).length) { w.ym(ID, 'reachGoal', name, p); } else { w.ym(ID, 'reachGoal', name); }
    } catch (e) { /* аналитика не должна ломать страницу */ }
  };

  /* где на странице находится ссылка: header, mobile_menu, mobile_bar, footer, exit_popup, modal_3d, content */
  function placementOf(el) {
    var own = el.getAttribute('data-contact-placement');
    if (own) { return own; }
    if (el.closest('#hdr')) { return 'header'; }
    if (el.closest('#mmenu')) { return 'mobile_menu'; }
    if (el.closest('#mbar')) { return 'mobile_bar'; }
    if (el.closest('footer')) { return 'footer'; }
    var dlg = el.closest('dialog');
    if (dlg && dlg.getAttribute('data-placement')) { return dlg.getAttribute('data-placement'); }
    return 'content';
  }
  CRVU.placementOf = placementOf;

  d.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) { return; }
    var href = a.getAttribute('href') || '';
    if (/^tel:/i.test(href)) { CRVU.goal('phone_click', { placement: placementOf(a) }); return; }
    var provider = /^https:\/\/t\.me\//i.test(href) ? 'telegram' : (/^https:\/\/max\.ru\//i.test(href) ? 'max' : '');
    if (provider) { CRVU.goal('messenger_click', { placement: placementOf(a), provider: provider }); return; }
    var file = a.getAttribute('data-file');
    if (file) { CRVU.goal('file_download', { asset_id: file }); }
  }, true);

  /* ------------------------------------------------------------------ меню выбора почты */
  (function emailMenu() {
    var SUBJECT = 'Вопрос по застройке стенда';
    var menu = null, ok = null, current = null, addr = '';

    function links(address) {
      var subj = encodeURIComponent(SUBJECT);
      return {
        yandex: 'https://mail.yandex.ru/compose?mailto=' + encodeURIComponent('mailto:' + address + '?subject=' + subj),
        mailru: 'https://e.mail.ru/compose/?to=' + encodeURIComponent(address) + '&subject=' + subj,
        app: 'mailto:' + address + '?subject=' + subj
      };
    }
    function build() {
      menu = d.createElement('div');
      menu.className = 'emenu';
      menu.id = 'emenu';
      menu.setAttribute('role', 'menu');
      menu.setAttribute('aria-label', 'Выберите почтовый сервис');
      menu.hidden = true;
      menu.innerHTML =
        '<button type="button" role="menuitem" data-em="copy"><svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"></rect><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"></path></svg>Скопировать адрес</button>' +
        '<span class="emenu__sep" aria-hidden="true"></span>' +
        '<a role="menuitem" data-em="yandex" target="_blank" rel="noopener noreferrer" href="#">Яндекс Почта<svg class="ico" aria-hidden="true"><use href="#i-ext"></use></svg></a>' +
        '<a role="menuitem" data-em="mailru" target="_blank" rel="noopener noreferrer" href="#">Mail.ru<svg class="ico" aria-hidden="true"><use href="#i-ext"></use></svg></a>' +
        '<a role="menuitem" data-em="app" href="#">Почтовая программа</a>' +
        '<p class="emenu__ok" role="status" hidden>Адрес скопирован</p>';
      d.body.appendChild(menu);
      ok = menu.querySelector('.emenu__ok');
      menu.addEventListener('click', function (e) {
        var it = e.target.closest('[data-em]');
        if (!it) { return; }
        if (it.getAttribute('data-em') === 'copy') {
          e.preventDefault();
          copy(addr).then(function () {
            ok.hidden = false;
            setTimeout(close, 1200);
          }, function () { close(); });
          return;
        }
        setTimeout(close, 0);
      });
      menu.addEventListener('keydown', function (e) {
        var items = Array.prototype.slice.call(menu.querySelectorAll('[data-em]'));
        var i = items.indexOf(d.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
        if (e.key === 'Tab') { close(); }
      });
    }
    function copy(text) {
      if (w.navigator.clipboard && w.navigator.clipboard.writeText) { return w.navigator.clipboard.writeText(text); }
      return new Promise(function (resolve, reject) {
        var t = d.createElement('textarea');
        t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
        d.body.appendChild(t); t.select();
        try { d.execCommand('copy'); resolve(); } catch (er) { reject(er); }
        d.body.removeChild(t);
      });
    }
    function place(a) {
      var r = a.getBoundingClientRect(), mw = menu.offsetWidth, mh = menu.offsetHeight, vw = d.documentElement.clientWidth, vh = w.innerHeight;
      var left = Math.min(Math.max(8, r.left), vw - mw - 8);
      var top = r.bottom + 8;
      if (top + mh > vh - 8 && r.top - mh - 8 > 8) { top = r.top - mh - 8; }
      menu.style.left = Math.round(left) + 'px';
      menu.style.top = Math.round(top) + 'px';
    }
    function open(a) {
      if (!menu) { build(); }
      var host = a.closest('dialog[open]') || d.body;
      if (menu.parentNode !== host) { host.appendChild(menu); }
      addr = (a.getAttribute('href') || '').replace(/^mailto:/i, '').split('?')[0];
      var l = links(addr);
      menu.querySelector('[data-em="yandex"]').href = l.yandex;
      menu.querySelector('[data-em="mailru"]').href = l.mailru;
      menu.querySelector('[data-em="app"]').href = l.app;
      ok.hidden = true;
      if (current && current !== a) { current.setAttribute('aria-expanded', 'false'); }
      current = a;
      a.setAttribute('aria-expanded', 'true');
      menu.hidden = false;
      place(a);
      var first = menu.querySelector('[data-em]');
      try { first.focus({ preventScroll: true }); } catch (er) { first.focus(); }
    }
    function close(returnFocus) {
      if (!menu || menu.hidden) { return; }
      menu.hidden = true;
      if (current) {
        current.setAttribute('aria-expanded', 'false');
        if (returnFocus) { try { current.focus({ preventScroll: true }); } catch (er) { current.focus(); } }
      }
      current = null;
    }
    function prep() {
      Array.prototype.forEach.call(d.querySelectorAll('a[href^="mailto:"]'), function (a) {
        a.setAttribute('aria-haspopup', 'menu');
        a.setAttribute('aria-expanded', 'false');
      });
    }
    prep();
    d.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="mailto:"]') : null;
      if (a && (!menu || !menu.contains(a))) {
        e.preventDefault();
        if (current === a && menu && !menu.hidden) { close(); return; }
        open(a);
        CRVU.goal('email_click', { placement: placementOf(a) });
        return;
      }
      if (menu && !menu.hidden && !menu.contains(e.target)) { close(); }
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu && !menu.hidden) { e.stopPropagation(); close(true); } }, true);
    w.addEventListener('scroll', function () { close(); }, { passive: true });
    w.addEventListener('resize', function () { close(); });
  })();

  /* ------------------------------------------------------------------ отправка заявок */
  var FORM_IDS = ['estimate_modal', 'inline_estimate', 'project_scale_estimate', 'venue_estimate', 'exhibition_estimate', 'materials_estimate', 'additional_services_estimate', 'exit_bonus', 'comparison_table_download'];
  var UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid', 'gclid'];
  var MSG = {
    not_configured: 'Онлайн-форма работает на сайте stendy.crvu.ru. Здесь заявку не отправить — позвоните ' + PHONE + ' или напишите в Telegram или MAX.',
    invalid_draft: 'Проверьте контактные данные и подтвердите согласие.',
    network_error: 'Не удалось связаться с сервером. Попробуйте ещё раз или позвоните ' + PHONE + '.',
    request_timeout: 'Сервер отвечает слишком долго. Не закрывайте форму и попробуйте ещё раз или позвоните ' + PHONE + '.',
    rejected: 'Сервер не принял заявку. Проверьте данные или позвоните ' + PHONE + '.',
    invalid_response: 'Получен некорректный ответ. Мы не считаем заявку отправленной — попробуйте ещё раз.',
    offline: 'Нет соединения с интернетом. Проверьте подключение и отправьте ещё раз — введённые данные сохранены.'
  };
  var pageStart = new Date().toISOString();
  var started = {}, last = {};

  function clip(v, max) {
    var s = v === undefined || v === null ? '' : String(v).trim();
    if (!s) { return null; }
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
  }
  function slug(v) {
    var s = clip(v, 100);
    return s && /^[a-z0-9][a-z0-9_-]{0,99}$/.test(s) ? s : null;
  }
  function uuid() {
    if (w.crypto && typeof w.crypto.randomUUID === 'function') { return w.crypto.randomUUID(); }
    var b = new Uint8Array(16);
    w.crypto.getRandomValues(b);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }
  function clientId() {
    return new Promise(function (resolve) {
      if (!CRVU.env.live || typeof w.ym !== 'function') { resolve(null); return; }
      var done = false, t = setTimeout(function () { finish(null); }, 800);
      function finish(v) {
        if (done) { return; }
        done = true; clearTimeout(t);
        resolve(typeof v === 'string' && /^[0-9.]{1,100}$/.test(v) ? v : null);
      }
      try { w.ym(ID, 'getClientID', finish); } catch (e) { finish(null); }
    });
  }
  function attribution(cid) {
    var u = new URL(w.location.href);
    var out = { landing_url: u.href.slice(0, 2048), referrer: clip(d.referrer, 2048) };
    UTM.forEach(function (k) { out[k] = clip(u.searchParams.get(k), 500); });
    out.ym_client_id = clip(cid, 500);
    return out;
  }
  function fingerprint(p) {
    return JSON.stringify({ form: p.form_id, contact: p.contact, details: p.details, consent: p.consent, website: p.anti_abuse.website });
  }
  function err(code, status) { var e = new Error(code); e.code = code; e.status = status; return e; }

  /* время, когда посетитель увидел форму (для защиты от ботов) */
  CRVU.leadStart = function (formId) { started[formId] = new Date().toISOString(); };
  CRVU.leadMessage = function (e) { return MSG[(e && e.code) || 'network_error'] || MSG.network_error; };
  CRVU.leadSent = false;

  /* data: { contact: {name, phone, email}, details: {exhibition_or_area, service_slug, ...}, website } */
  CRVU.sendLead = function (formId, data) {
    data = data || {};
    if (FORM_IDS.indexOf(formId) < 0) { return Promise.reject(err('invalid_draft')); }
    if (!CRVU.env.live) { return Promise.reject(err('not_configured')); }
    if (w.navigator && w.navigator.onLine === false) { return Promise.reject(err('offline')); }
    var c = data.contact || {}, det = data.details || {};
    var name = clip(c.name, 320);
    if (MODE === 'test') { name = 'ТЕСТ — НЕ ЗАЯВКА' + (name ? ': ' + name : ''); }
    var contact = { name: name, phone: clip(c.phone, 320), email: clip(c.email, 320) };
    if (!contact.phone && !contact.email) { return Promise.reject(err('invalid_draft')); }
    return clientId().then(function (cid) {
      var payload = {
        form_id: formId,
        request_id: uuid(),
        submitted_at: new Date().toISOString(),
        contact: contact,
        details: {
          exhibition_or_area: clip(det.exhibition_or_area, 1000),
          exhibition_slug: slug(det.exhibition_slug),
          venue_slug: slug(det.venue_slug),
          service_slug: slug(det.service_slug),
          material_slugs: []
        },
        attribution: attribution(cid),
        consent: { accepted: true, policy_version: MODE === 'test' ? CFG.testPolicyVersion : CFG.policyVersion },
        anti_abuse: { website: clip(data.website, 200) || '', started_at: started[formId] || pageStart }
      };
      /* повторная отправка тех же данных после сбоя — с тем же request_id, чтобы не задвоить заявку */
      var prev = last[formId];
      if (prev && fingerprint(prev) === fingerprint(payload)) {
        payload.request_id = prev.request_id;
        payload.submitted_at = prev.submitted_at;
      }
      last[formId] = payload;
      var ac = typeof AbortController === 'function' ? new AbortController() : null;
      var timedOut = false;
      var timer = setTimeout(function () { timedOut = true; if (ac) { ac.abort(); } }, CFG.leadTimeoutMs || 45000);
      return fetch(CFG.leadEndpoint || '/api/v1/leads', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ac ? ac.signal : undefined
      }).then(function (r) {
        if (!r.ok) { throw err('rejected', r.status); }
        return r.json().catch(function () { throw err('invalid_response'); });
      }).then(function (j) {
        if (!j || j.status !== 'accepted' || j.request_id !== payload.request_id || !isFinite(Date.parse(j.accepted_at))) { throw err('invalid_response'); }
        clearTimeout(timer);
        delete last[formId];
        delete started[formId];
        CRVU.leadSent = true;
        try { w.sessionStorage.setItem('crvuLeadSent', '1'); } catch (e) { /* ничего */ }
        CRVU.goal('lead_submit_success', { form_id: formId });
        return j;
      }).catch(function (e) {
        clearTimeout(timer);
        var code = e && e.code ? e.code : (timedOut || (e && e.name === 'AbortError') ? 'request_timeout' : 'network_error');
        if (code === 'rejected' && [400, 403, 413, 415, 422, 429].indexOf(e.status) >= 0) { delete last[formId]; }
        throw err(code, e && e.status);
      });
    });
  };
  try { CRVU.leadSent = w.sessionStorage.getItem('crvuLeadSent') === '1'; } catch (e) { /* ничего */ }
})(window, document);
