/*!
 * ЦРВУ — заявка (одна форма: имя, телефон, выставка и план площадки; параметры приходят из калькулятора),
 * форма для закупок и тендеров. Отправка — CRVU.sendLead (integrations.js) в /api/v1/leads.
 */
(function (w, d) {
  'use strict';

  var CRVU = w.CRVU, D = w.CRVU_DATA || { expos: [] };
  var $ = CRVU.$, $$ = CRVU.$$, nb = CRVU.nb;
  var PHONE = '+7 (495) 106-70-22';
  var MSG = {
    area: 'Введите площадь стенда в м².',
    phone: 'Введите телефон с кодом, например +7 (495) 106-70-22.',
    name: 'Укажите, как к вам обращаться.',
    email: 'Проверьте email: похоже, в адресе ошибка.',
    consent: 'Поставьте галочку согласия, чтобы отправить заявку.',
    fileType: 'Этот формат не подходит. Загрузите PDF, DWG, JPG или PNG.',
    fileSize: 'Файл больше 25 МБ. Сожмите его или пришлите ссылку менеджеру в мессенджер.'
  };
  var SOURCES = { direct: 'форма заявки', calculator: 'калькулятор', planner: 'календарь выставок', 'case': 'кейс «Обсудить похожий стенд»', lightbox: 'фотографии кейса', process: 'блок «Этапы»', engineering: 'блок «Инженерия»', portfolio: 'портфолио' };

  CRVU.maskPhone($('#qPhone'));
  CRVU.maskPhone($('#prPhone'));

  function failText(err) { return CRVU.leadMessage ? CRVU.leadMessage(err) : 'Не удалось отправить заявку. Позвоните ' + PHONE + '.'; }
  function moscowMinutes() {
    try {
      var parts = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      var h = 0, m = 0;
      parts.forEach(function (p) { if (p.type === 'hour') { h = +p.value; } if (p.type === 'minute') { m = +p.value; } });
      return h * 60 + m;
    } catch (e) {
      var t = new Date(Date.now() + 3 * 3600 * 1000);
      return t.getUTCHours() * 60 + t.getUTCMinutes();
    }
  }
  function venueFor(name) {
    var n = String(name || '');
    if (/Крокус/i.test(n)) { return 'Крокус Экспо'; }
    if (/Тимирязев/i.test(n)) { return 'Тимирязев Центр'; }
    if (/ВДНХ/i.test(n)) { return 'ВДНХ'; }
    if (/Экспоцентр/i.test(n)) { return 'Экспоцентр'; }
    if (/Экспофорум/i.test(n)) { return 'Экспофорум'; }
    return 'Другая площадка';
  }
  function fmtSize(b) {
    return b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' КБ' : (b / 1048576).toFixed(1).replace('.', ',') + ' МБ';
  }
  function field(form, name) { return form.querySelector('[name="' + name + '"]'); }
  function val(el) { return el ? el.value.trim() : ''; }

  /* ================================================================== заявка: одна форма */
  var form = $('#quizForm');
  if (form) {
    var submit = $('#qSubmit'), okBox = $('#quizOk');
    var expoSel = $('#qExpo'), dateWrap = $('#qDateWrap'), dateInp = $('#qDate'), hint = $('#qExpoHint');
    var fileInp = $('#qFile'), drop = $('#qDrop'), fileOk = $('#qFileOk'), fileName = $('#qFileName'), fileSize = $('#qFileSize'), fileRm = $('#qFileRm'), fileErr = $('#qFile-e');
    var nameI = $('#qName'), phoneI = $('#qPhone'), consent = $('#qConsent'), hp = $('#qHp'), err = $('#qErr');
    var sumBox = $('#qCalcSum'), ctxBox = $('#qCtx');
    var started = false, file = null, busy = false, source = 'direct', submitHtml = submit.innerHTML, calcRef = null;
    /* то, что пришло из других блоков страницы и не видно в форме полями */
    var pref = { area: null, type: '', venueLabel: '', comment: '', commentSrc: '' };
    function money(n) { return CRVU.fmtNum(n) + '\u00a0₽'; }
    function calcRange(c) { if (c.small || c.lo === null) { return 'индивидуальный расчёт'; } return c.hi === null ? 'от ' + money(c.lo) : CRVU.fmtNum(c.lo) + ' – ' + money(c.hi) + (c.openEnded ? ' и выше' : ''); }
    function renderCalc() {
      if (!sumBox) { return; }
      if (!calcRef) { sumBox.hidden = true; sumBox.innerHTML = ''; return; }
      var parts = [CRVU.fmtArea(calcRef.S) + ' м²', calcRef.typeLabel, calcRef.levelLabel].concat(calcRef.extras || []);
      sumBox.innerHTML = '<div class="calc-sum__row"><p>Ваш расчёт: <b>' + CRVU.esc(nb(calcRange(calcRef))) + '</b></p><a href="#calculator">Изменить</a></div><p>' + CRVU.esc(nb(parts.filter(Boolean).join(' · '))) + '</p>';
      sumBox.hidden = false;
    }
    function renderCtx() {
      if (!ctxBox) { return; }
      var show = !!pref.comment && (pref.commentSrc === 'case' || pref.commentSrc === 'lightbox');
      ctxBox.hidden = !show;
      ctxBox.textContent = show ? nb('К заявке добавим: ' + pref.comment) : '';
    }

    CRVU.autoClear(form);

    /* список выставок */
    D.expos.forEach(function (e) {
      var o = d.createElement('option');
      o.value = e.id;
      o.textContent = e.name + ' — ' + e.dates;
      expoSel.appendChild(o);
    });
    [['other', 'Другая выставка'], ['unknown', 'Пока не знаю']].forEach(function (p) {
      var o = d.createElement('option');
      o.value = p[0]; o.textContent = p[1];
      expoSel.appendChild(o);
    });
    function expoById(id) { var e = null; D.expos.forEach(function (x) { if (x.id === id) { e = x; } }); return e; }
    function onExpo() {
      var id = expoSel.value;
      dateWrap.hidden = id !== 'other';
      hint.hidden = true;
      hint.classList.remove('plan__status--hot');
      if (id && id !== 'other' && id !== 'unknown') {
        var h = CRVU.planner && CRVU.planner.hint(id);
        if (h && h.kind !== 'gone') {
          hint.textContent = nb(h.text);
          hint.classList.toggle('plan__status--hot', h.kind === 'hot' || h.kind === 'call');
          hint.hidden = false;
        }
      }
    }
    expoSel.addEventListener('change', onExpo);

    function validate() {
      var bad = null;
      function fail(el, msg) { CRVU.showErr(el, msg); if (!bad) { bad = el; } }
      if (!nameI.value.trim()) { fail(nameI, MSG.name); }
      if (!CRVU.isPhone(phoneI.value)) { fail(phoneI, MSG.phone); }
      if (!consent.checked) { fail(consent, MSG.consent); }
      if (bad) { bad.focus(); return false; }
      return true;
    }
    ['input', 'change', 'focusin'].forEach(function (ev) {
      form.addEventListener(ev, function () {
        if (!started) { started = true; CRVU.track('quiz_start'); }
      });
    });

    /* файл плана площадки */
    function fileProblem(msg) {
      fileErr.textContent = nb(msg);
      fileErr.hidden = false;
      drop.classList.add('has-error');
      fileInp.setAttribute('aria-invalid', 'true');
      fileInp.value = '';
    }
    function fileClear() {
      fileErr.hidden = true; fileErr.textContent = '';
      drop.classList.remove('has-error');
      fileInp.setAttribute('aria-invalid', 'false');
    }
    function setFile(f) {
      var ext = (f.name.split('.').pop() || '').toLowerCase();
      if (['pdf', 'dwg', 'jpg', 'jpeg', 'png'].indexOf(ext) < 0) { fileProblem(MSG.fileType); return; }
      if (f.size > 25 * 1024 * 1024) { fileProblem(MSG.fileSize); return; }
      fileClear();
      file = f;
      fileName.textContent = f.name;
      fileSize.textContent = fmtSize(f.size);
      fileOk.hidden = false;
      drop.hidden = true;
      CRVU.track('upload_plan', { ext: ext });
    }
    function removeFile() {
      file = null;
      fileInp.value = '';
      fileOk.hidden = true;
      drop.hidden = false;
      fileClear();
    }
    fileInp.addEventListener('change', function () { var f = fileInp.files && fileInp.files[0]; if (f) { setFile(f); } });
    fileRm.addEventListener('click', function () { removeFile(); try { fileInp.focus(); } catch (e) { /* ничего */ } });
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-over'); });
    });
    drop.addEventListener('drop', function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) { setFile(f); }
    });

    /* сбор данных */
    function collect() {
      var id = expoSel.value, e = expoById(id);
      var type = pref.type || (calcRef && calcRef.type) || '', level = (calcRef && calcRef.level) || '';
      var typeLabel = type && D.calculator && D.calculator.types[type] ? D.calculator.types[type].label : '';
      var levelLabel = level && D.calculator && D.calculator.levels[level] ? D.calculator.levels[level].label : '';
      var venue = e ? venueFor(e.venue) : (pref.venueLabel ? venueFor(pref.venueLabel) : '');
      return {
        form: 'quiz', source: source, ts: new Date().toISOString(), page: w.location.href, utm: CRVU.utm(),
        stand: { area: calcRef ? calcRef.S : pref.area, type: type, typeLabel: typeLabel, level: level, levelLabel: levelLabel, extras: calcRef ? calcRef.extras : [], ledCount: calcRef ? calcRef.ledCount : 0, floorArea: calcRef ? calcRef.floorArea : 0, estimate: calcRef ? { lo: calcRef.lo, hi: calcRef.hi } : null },
        expo: { id: id, name: e ? e.name : (id === 'other' ? (expoSel.dataset.customName || 'Другая выставка') : (id === 'unknown' ? 'Пока не знаю' : '')), dates: e ? e.dates : '', openDate: id === 'other' ? dateInp.value : (e ? e.open : ''), venue: venue },
        plan: file ? { name: file.name, size: file.size, type: file.type } : null,
        comment: pref.comment,
        contact: { name: nameI.value.trim(), phone: '+7' + CRVU.phoneDigits(phoneI.value) },
        consent: true
      };
    }

    function okText(hasPlan) {
      return hasPlan
        ? 'Менеджер свяжется с вами в рабочее время. План площадки отправьте удобным способом — так менеджер увидит его вместе с заявкой.'
        : 'Менеджер свяжется с вами в рабочее время, уточнит детали и запросит план площадки.';
    }
    /* текст заявки для менеджера: всё, что посетитель выбрал на странице */
    function leadText(data) {
      var p = [];
      if (data.expo.name) { p.push('Выставка: ' + data.expo.name + (data.expo.dates ? ' (' + data.expo.dates + ')' : (data.expo.openDate ? ' (открытие ' + data.expo.openDate + ')' : ''))); }
      if (data.expo.venue && data.expo.venue !== 'Другая площадка') { p.push('Площадка: ' + data.expo.venue); }
      if (data.stand.area) { p.push('Площадь: ' + CRVU.fmtArea(data.stand.area) + ' м²'); }
      if (data.stand.typeLabel) { p.push('Тип стенда: ' + data.stand.typeLabel); }
      if (data.stand.levelLabel) { p.push('Уровень: ' + data.stand.levelLabel); }
      if (data.stand.extras && data.stand.extras.length) { p.push('Опции: ' + data.stand.extras.join(', ')); }
      if (calcRef) { p.push('Ориентир калькулятора: ' + calcRange(calcRef)); }
      if (data.comment) { p.push('Комментарий: ' + data.comment); }
      if (data.plan) { p.push('План площадки: ' + data.plan.name + ' — клиент пришлёт файл в мессенджер или на почту'); }
      p.push('Откуда заявка: ' + (SOURCES[data.source] || data.source || 'форма заявки'));
      return p.join('; ').replace(/\u00a0/g, ' ');
    }
    function showOk(data) {
      $('#quizOkTitle').textContent = 'Заявка передана';
      $('#quizOkText').textContent = nb(okText(!!file));
      var send = $('#quizOkSend');
      if (send) { send.hidden = !file; }
      var rows = [];
      if (data.stand.area) { rows.push(['Площадь', CRVU.fmtArea(data.stand.area) + ' м²']); }
      if (data.stand.typeLabel) { rows.push(['Тип стенда', data.stand.typeLabel]); }
      if (data.stand.levelLabel) { rows.push(['Уровень', data.stand.levelLabel]); }
      if (data.stand.extras && data.stand.extras.length) { rows.push(['Опции', data.stand.extras.join(', ')]); }
      if (calcRef) { rows.push(['Ориентир', calcRange(calcRef)]); }
      if (data.expo.name) { rows.push(['Выставка', data.expo.name + (data.expo.dates ? ', ' + data.expo.dates : '')]); }
      if (file) { rows.push(['План площадки', file.name]); }
      if (data.comment && (pref.commentSrc === 'case' || pref.commentSrc === 'lightbox')) { rows.push(['Комментарий', data.comment]); }
      rows.push(['Контакт', data.contact.name + ', ' + phoneI.value]);
      $('#quizSum').innerHTML = rows.map(function (r) { return '<div><dt>' + CRVU.esc(r[0]) + '</dt><dd>' + CRVU.esc(nb(r[1])) + '</dd></div>'; }).join('');
      form.hidden = true;
      okBox.hidden = false;
      try { okBox.focus({ preventScroll: true }); } catch (e) { okBox.focus(); }
      var r = okBox.getBoundingClientRect();
      if (r.top < 90 || r.top > w.innerHeight * 0.5) { w.scrollTo({ top: r.top + (w.pageYOffset || 0) - 110, behavior: CRVU.reduced ? 'auto' : 'smooth' }); }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) { return; }
      if (CRVU.cbxCommit) { CRVU.cbxCommit(expoSel); }
      if (!validate()) { return; }
      err.hidden = true;
      var data = collect();
      busy = true;
      submit.disabled = true;
      submit.setAttribute('aria-busy', 'true');
      submit.textContent = 'Отправляем…';
      CRVU.sendLead('inline_estimate', {
        contact: { name: data.contact.name, phone: phoneI.value.trim() ? CRVU.formatPhone(CRVU.phoneDigits(phoneI.value)) : '' },
        details: { exhibition_or_area: leadText(data) },
        website: hp.value
      })
        .then(function () {
          CRVU.track('quiz_submit', { area: data.stand.area, level: data.stand.level || 'none' });
          showOk(data);
        })
        .catch(function (er) {
          err.textContent = nb(failText(er));
          err.hidden = false;
        })
        .then(function () {
          busy = false;
          submit.disabled = false;
          submit.removeAttribute('aria-busy');
          submit.innerHTML = submitHtml;
        });
    });

    function reset() {
      form.reset();
      removeFile();
      form.hidden = false;
      okBox.hidden = true;
      err.hidden = true;
      dateWrap.hidden = true;
      hint.hidden = true;
      delete expoSel.dataset.customName;
      $$('.has-error', form).forEach(function (f) { f.classList.remove('has-error'); });
      $$('.err', form).forEach(function (f) { f.hidden = true; });
      $$('[aria-invalid="true"]', form).forEach(function (f) { f.setAttribute('aria-invalid', 'false'); });
      started = false;
      if (CRVU.cbxSync) { CRVU.cbxSync(expoSel); }
      renderCalc();
      renderCtx();
    }
    $('#quizAgain').addEventListener('click', function () { reset(); nameI.focus(); });

    /* подстановка данных из калькулятора, календаря выставок, кейсов */
    CRVU.quiz = {
      reset: reset,
      prefill: function (o, src) {
        o = o || {};
        if (src) { source = src; }
        if (!okBox.hidden) { reset(); }
        if (o.area) { pref.area = o.area; }
        if (o.type) { pref.type = o.type; }
        if (o.venueLabel) { pref.venueLabel = o.venueLabel; }
        if (o.expo) {
          expoSel.value = o.expo;
          if (expoSel.value !== o.expo) { expoSel.value = 'other'; }
          if (expoSel.value === 'other' && o.expoName) { expoSel.dataset.customName = o.expoName; } else if (expoSel.value !== 'other') { delete expoSel.dataset.customName; }
          if (o.date) { dateInp.value = o.date; }
          onExpo();
        }
        if (CRVU.cbxSync) { CRVU.cbxSync(expoSel); }
        if (o.calc) { calcRef = o.calc; }
        if (o.comment) { pref.comment = o.comment; pref.commentSrc = src || ''; }
        renderCalc();
        renderCtx();
      }
    };
  }

  /* ================================================================== форма «для закупок и тендеров» */
  var pf = $('#procForm');
  if (pf) {
    var pErr = $('#prErr'), pOk = $('#prOk'), pBusy = false;
    var pBtn = pf.querySelector('button[type=submit]'), pBtnHtml = pBtn.innerHTML;
    CRVU.autoClear(pf);
    var pCompany = $('#prCompany'), pName = $('#prName'), pEmail = $('#prEmail'), pPhone = $('#prPhone'), pConsent = $('#prConsent');
    pf.addEventListener('submit', function (e) {
      e.preventDefault();
      if (pBusy) { return; }
      pErr.hidden = true; pOk.hidden = true;
      var bad = null;
      function fail(el, msg) { CRVU.showErr(el, msg); if (!bad) { bad = el; } }
      if (!pCompany.value.trim()) { fail(pCompany, 'Укажите название компании.'); }
      if (!pName.value.trim()) { fail(pName, MSG.name); }
      if (!CRVU.isEmail(pEmail.value)) { fail(pEmail, MSG.email); }
      if (pPhone.value.trim() && !CRVU.isPhone(pPhone.value)) { fail(pPhone, MSG.phone); }
      if (!pConsent.checked) { fail(pConsent, MSG.consent); }
      if (bad) { bad.focus(); return; }
      var hpEl = pf.querySelector('.hp input');
      var data = {
        form: 'procurement', ts: new Date().toISOString(), page: w.location.href, utm: CRVU.utm(),
        company: pCompany.value.trim(), name: pName.value.trim(), role: val($('#prRole')), email: pEmail.value.trim(),
        phone: pPhone.value.trim()?'+7'+CRVU.phoneDigits(pPhone.value):'', procedure: val($('#prProc')), consent: true
      };
      function done() {
        pOk.textContent = nb('Запрос передан. Пакет документов подготовим и отправим на ' + data.email + '.');
        pOk.hidden = false;
        pf.reset();
      }
      var text = ['Запрос комплекта документов для закупки', 'Компания: ' + data.company, 'Контактное лицо: ' + data.name + (data.role ? ' (' + data.role + ')' : '')];
      if (data.procedure) { text.push('Закупка: ' + data.procedure); }
      pBusy = true; pBtn.disabled = true; pBtn.textContent = 'Отправляем…';
      CRVU.sendLead('inline_estimate', {
        contact: { name: data.name + ', ' + data.company, phone: data.phone ? CRVU.formatPhone(CRVU.phoneDigits(pPhone.value)) : '', email: data.email },
        details: { exhibition_or_area: text.join('; ') },
        website: hpEl ? hpEl.value : ''
      })
        .then(function () { CRVU.track('doc_procurement'); done(); })
        .catch(function (er) { pErr.textContent = nb(failText(er)); pErr.hidden = false; })
        .then(function () { pBusy = false; pBtn.disabled = false; pBtn.innerHTML = pBtnHtml; });
    });
  }
})(window, document);
