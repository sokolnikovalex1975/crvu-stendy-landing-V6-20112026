/*!
 * ЦРВУ — окна и кнопки поверх страницы:
 * кнопки «3D визуализация бесплатно» и «Посмотрите наши проекты» при прокрутке (компьютер),
 * окно заявки на 3D-визуализацию, портфолио, окно с бонусами при попытке уйти со страницы.
 */
(function (w, d) {
  'use strict';

  var CRVU = w.CRVU;
  if (!CRVU) { return; }
  var $ = CRVU.$, $$ = CRVU.$$, nb = CRVU.nb, esc = CRVU.esc;
  var CFG = w.CRVU_CONFIG || {};
  var MSG = {
    phone: 'Введите телефон с кодом, например +7 (495) 106-70-22.',
    consent: 'Поставьте галочку согласия, чтобы отправить заявку.'
  };
  var root = d.documentElement;

  /* ------------------------------------------------------------------ общие функции окон */
  function anyOpen() { return !!d.querySelector('dialog[open]'); }
  function openDlg(dlg, opener) {
    if (!dlg || typeof dlg.showModal !== 'function' || dlg.open) { return false; }
    dlg._opener = opener || null;
    dlg.showModal();
    root.classList.add('dlg-open');
    return true;
  }
  function wire(dlg) {
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || (e.target.closest && e.target.closest('[data-close]') && e.target.closest('dialog') === dlg)) { dlg.close(); }
    });
    dlg.addEventListener('close', function () {
      if (!anyOpen()) { root.classList.remove('dlg-open'); }
      var o = dlg._opener;
      dlg._opener = null;
      if (o && d.contains(o) && o.focus) { try { o.focus({ preventScroll: true }); } catch (e) { o.focus(); } }
    });
  }
  function view(dlg, name) {
    $$('[data-view]', dlg).forEach(function (v) { v.hidden = v.getAttribute('data-view') !== name; });
    if (name === 'ok') {
      var ok = $('[data-view="ok"]', dlg);
      if (ok) { try { ok.focus({ preventScroll: true }); } catch (e) { ok.focus(); } }
    }
  }

  /* короткая форма в окне: телефон обязателен, имя — по желанию */
  function leadForm(o) {
    var f = o.form;
    if (!f) { return; }
    var btn = f.querySelector('button[type="submit"]'), html = btn.innerHTML, busy = false;
    var hp = f.querySelector('.hp input');
    CRVU.maskPhone(o.phone);
    CRVU.autoClear(f);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) { return; }
      o.err.hidden = true;
      var bad = null;
      function fail(el, m) { CRVU.showErr(el, m); if (!bad) { bad = el; } }
      if (!CRVU.isPhone(o.phone.value)) { fail(o.phone, MSG.phone); }
      if (!o.consent.checked) { fail(o.consent, MSG.consent); }
      if (bad) { bad.focus(); return; }
      busy = true;
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.textContent = 'Отправляем…';
      CRVU.sendLead(o.formId, {
        contact: { name: o.name ? o.name.value.trim() : '', phone: CRVU.formatPhone(CRVU.phoneDigits(o.phone.value)) },
        details: o.details(),
        website: hp ? hp.value : ''
      }).then(function () {
        f.reset();
        o.onOk();
      }).catch(function (er) {
        o.err.textContent = nb(CRVU.leadMessage(er));
        o.err.hidden = false;
      }).then(function () {
        busy = false;
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
        btn.innerHTML = html;
      });
    });
  }

  /* ------------------------------------------------------------------ окно «3D-визуализация бесплатно» */
  var d3 = $('#d3Dlg');
  if (d3) {
    wire(d3);
    leadForm({
      form: $('#d3Form'), formId: 'estimate_modal',
      phone: $('#d3Phone'), name: $('#d3Name'), consent: $('#d3Consent'), err: $('#d3Err'),
      details: function () { return { exhibition_or_area: 'Заявка на бесплатную 3D-визуализацию стенда', service_slug: '3d-visualization' }; },
      onOk: function () { view(d3, 'ok'); }
    });
    d.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-open-3d]') : null;
      if (!b) { return; }
      e.preventDefault();
      view(d3, 'form');
      if (openDlg(d3, b)) {
        CRVU.leadStart('estimate_modal');
        CRVU.track('visualization_open');
        setTimeout(function () { var n = $('#d3Name'); if (n) { try { n.focus({ preventScroll: true }); } catch (er) { n.focus(); } } }, 60);
      }
    });
  }

  /* ------------------------------------------------------------------ портфолио */
  var pf = $('#pfDlg'), grid = $('#pfGrid');
  if (pf && grid) {
    wire(pf);
    var built = false;
    var build = function () {
      if (built) { return; }
      built = true;
      var n = 0;
      $$('#casesGrid .case').forEach(function (c) {
        var media = c.querySelector('[data-lb]'), img = c.querySelector('.case__media img'), t = c.querySelector('.case__t'), m = c.querySelector('.case__meta');
        if (!img || !t) { return; }
        var set = img.getAttribute('srcset') || '', small = (set.split(',')[0] || '').trim().split(' ')[0] || img.getAttribute('src');
        var title = t.textContent.trim(), meta = m ? m.textContent.trim() : '';
        var key = media ? media.getAttribute('data-lb') : '';
        /* у кейса одно фото без галереи — добавляем его в галерею портфолио */
        if (!key) {
          var D = w.CRVU_DATA, src = img.getAttribute('src') || '';
          key = 'pf-' + (c.id || ('case' + n)).replace(/^case-/, '');
          if (!D || !D.cases || !/^assets\/real\/[^/]+\.webp$/.test(src)) { return; }
          if (!D.cases[key]) {
            D.cases[key] = { title: title, meta: meta.replace(/\s*·\s*/g, ' '), images: [{ f: src.replace(/^assets\/real\//, '').replace(/\.webp$/, ''), w: +img.getAttribute('width') || 640, h: +img.getAttribute('height') || 427, alt: img.getAttribute('alt') || title, single: true }] };
          }
        }
        var b = d.createElement('button');
        b.type = 'button';
        b.className = 'pf__item';
        b.setAttribute('data-lb', key);
        b.setAttribute('aria-haspopup', 'dialog');
        b.setAttribute('aria-label', 'Открыть фото: ' + title + (meta ? ', ' + meta : ''));
        b.innerHTML = '<span class="pf__img"><img alt="" decoding="async" loading="lazy" src="' + esc(small) + '" width="640" height="427"/></span>' +
          '<span class="pf__cap"><b>' + esc(title) + '</b><span>' + esc(meta) + '</span></span>';
        grid.appendChild(b);
        n++;
      });
      var sub = $('#pfSub');
      if (sub && n) { sub.textContent = nb(n + ' ' + CRVU.plural(n, ['проект', 'проекта', 'проектов']) + ' на выставках в Москве и регионах. Нажмите на проект, чтобы открыть фотографии.'); }
    };
    d.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-open-portfolio]') : null;
      if (!b) { return; }
      e.preventDefault();
      build();
      if (openDlg(pf, b)) { CRVU.track('portfolio_open'); pf.scrollTop = 0; var g = $('.pf__in', pf); if (g) { g.scrollTop = 0; } }
    });
    var pq = pf.querySelector('[data-pf-quiz]');
    if (pq) { pq.addEventListener('click', function () { pf.close(); CRVU.openQuiz({}, 'portfolio'); }); }
    /* фото проекта открываются поверх портфолио; после закрытия возвращаемся к списку */
    var lb = $('#lbDlg'), lq = $('#lbQuote');
    if (lb) { lb.addEventListener('close', function () { if (pf.open) { root.classList.add('dlg-open'); } }); }
    if (lq) { lq.addEventListener('click', function () { if (pf.open) { pf.close(); } }); }
  }

  /* ------------------------------------------------------------------ кнопки при прокрутке (компьютер) */
  var dsa = $('#dsa');
  if (dsa && w.matchMedia) {
    var mq = w.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    var upd = function () {
      var y = w.pageYOffset || root.scrollTop;
      var hide = !mq.matches || y < w.innerHeight;
      if (dsa.hidden !== hide) { dsa.hidden = hide; }
    };
    w.addEventListener('scroll', upd, { passive: true });
    w.addEventListener('resize', upd);
    w.addEventListener('pageshow', upd);
    if (mq.addEventListener) { mq.addEventListener('change', upd); } else if (mq.addListener) { mq.addListener(upd); }
    upd();
    /* прячем над формой заявки и над подвалом, чтобы не закрывать поля и ссылки */
    var ftr = d.querySelector('footer');
    if (ftr && 'IntersectionObserver' in w) {
      new IntersectionObserver(function (en) { d.body.classList.toggle('in-footer', en[0].isIntersecting); }, { threshold: 0 }).observe(ftr);
    }
  }

  /* ------------------------------------------------------------------ бонусы при попытке уйти со страницы */
  var ex = $('#exitDlg');
  if (ex && typeof ex.showModal === 'function') {
    wire(ex);
    var until = (function () {
      var today = CRVU.todayUTC(), u = CFG.exitBonus && CFG.exitBonus.until ? CRVU.parseISO(CFG.exitBonus.until) : null;
      if (!u || u.getTime() < today.getTime()) { u = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0)); }
      return u;
    })();
    var untilText = 'до ' + CRVU.fmtDateShort(until);
    $$('[data-exit-until]', ex).forEach(function (el) { el.textContent = nb(untilText); });
    leadForm({
      form: $('#exForm'), formId: 'exit_bonus',
      phone: $('#exPhone'), name: null, consent: $('#exConsent'), err: $('#exErr'),
      details: function () { return { exhibition_or_area: 'Бонусы при заключении договора ' + untilText + ': живые цветы в переговорной, фотосъёмка стенда во время выставки, кофемашина на все дни выставки, запас зернового кофе' }; },
      onOk: function () { view(ex, 'ok'); }
    });
    var KEY = 'exitPopupShown', shown = false, t0 = Date.now();
    try { shown = w.sessionStorage.getItem(KEY) === 'true'; } catch (e) { /* ничего */ }
    var maybe = function (trigger) {
      if (shown || CRVU.leadSent || anyOpen() || d.hidden || d.body.classList.contains('menu-open')) { return; }
      var a = d.activeElement;
      if (a && a.closest && a.closest('form')) { return; }
      if (trigger === 'leave' && Date.now() - t0 < 5000) { return; }
      shown = true;
      try { w.sessionStorage.setItem(KEY, 'true'); } catch (e) { /* ничего */ }
      view(ex, 'form');
      if (openDlg(ex, a && a !== d.body ? a : null)) {
        CRVU.leadStart('exit_bonus');
        CRVU.track('exit_bonus_show', { trigger: trigger });
      }
    };
    root.addEventListener('mouseleave', function (e) { if (e.clientY <= 0) { maybe('leave'); } });
    d.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 0) { maybe('leave'); } });
    setTimeout(function () { maybe('timer'); }, (CFG.exitBonus && CFG.exitBonus.delayMs) || 120000);
  }
})(window, document);

/* видеоотзывы: стрелки ленты */
(function (d) {
  'use strict';
  var list = d.querySelector('[data-rv-list]'); if (!list) { return; }
  function step(dir) { var li = list.querySelector('li'); var w = li ? li.getBoundingClientRect().width + 16 : 240; list.scrollBy({ left: dir * w * 2, behavior: 'smooth' }); }
  var p = d.querySelector('[data-rv-prev]'), n = d.querySelector('[data-rv-next]');
  if (p) { p.addEventListener('click', function () { step(-1); }); }
  if (n) { n.addEventListener('click', function () { step(1); }); }
})(document);
