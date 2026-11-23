(function (w, d) {
  'use strict';
  var CRVU = w.CRVU;
  if (!CRVU) { return; }
  var $ = CRVU.$;

  /* Нижняя панель на мобильном появляется после первого экрана и не дублирует кнопки hero */
  var hero = $('#top');
  if ('IntersectionObserver' in w && hero) {
    new IntersectionObserver(function (e) { d.body.classList.toggle('past-hero', !e[0].isIntersecting); }, { threshold: 0.12 }).observe(hero);
  } else { d.body.classList.add('past-hero'); }

  /* Квиз: «площадь не знаю», LED и второй этаж */
  var unknown = $('#qAreaUnknown'), area = $('#qArea');
  if (unknown && area) {
    unknown.addEventListener('change', function () { area.disabled = unknown.checked; if (unknown.checked) { area.value = ''; CRVU.clearErr(area); } });
  }
  function syncExtras() {
    var led = d.querySelector('input[name=qx][value="LED-экран"]'), fl = d.querySelector('input[name=qx][value="Второй этаж"]');
    if ($('#qLedWrap') && led) { $('#qLedWrap').hidden = !led.checked; }
    if ($('#qFloorWrap') && fl) { $('#qFloorWrap').hidden = !fl.checked; }
  }
  CRVU.syncQuizExtras = syncExtras;
  d.addEventListener('change', function (e) { if (e.target && e.target.name === 'qx') { syncExtras(); } });
  syncExtras();

})(window, document);

/* Реквизиты — открыть блок по ссылке и скопировать в буфер */
(function (d) {
  'use strict';
  var box = d.getElementById('requisites');
  if (!box) { return; }
  d.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-open-req]') : null;
    if (!a) { return; }
    if (a.classList.contains('ftr__all')) { e.preventDefault(); box.open = !box.open; a.setAttribute('aria-expanded', box.open ? 'true' : 'false'); if (box.open) { box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } return; }
    box.open = true;
  });
  if (location.hash === '#requisites') { box.open = true; }
  var btn = box.querySelector('[data-copy-req]'), ok = box.querySelector('.req__ok');
  if (!btn) { return; }
  btn.addEventListener('click', function () {
    var rows = Array.prototype.map.call(box.querySelectorAll('.req__list > div'), function (r) {
      return r.querySelector('dt').textContent.trim() + ': ' + r.querySelector('dd').textContent.replace(/\s+/g, ' ').trim();
    });
    var txt = rows.join('\n');
    function done() { if (ok) { ok.hidden = false; setTimeout(function () { ok.hidden = true; }, 2500); } }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var t = d.createElement('textarea'); t.value = txt; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      d.body.appendChild(t); t.select(); try { d.execCommand('copy'); done(); } catch (err) {} d.body.removeChild(t);
    }
  });
})(document);

