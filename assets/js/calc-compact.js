/*
 * Калькулятор на одном экране.
 * На телефоне внизу закреплена панель с ценой и кнопкой «Получить точную смету»,
 * а строки расчёта, пометки, кнопка PDF и «Что не входит в расчёт» переносятся под калькулятор.
 * На широком экране всё возвращается в карточку результата.
 */
(function () {
  'use strict';
  var d = document, w = window;
  var sec = d.getElementById('calculator');
  var res = d.getElementById('calcRes');
  var out = d.getElementById('calcOut');
  if (!sec || !res || !out) { return; }
  var act = res.querySelector('.res3__act');
  var pdf = d.getElementById('calcPdfBtn');
  var excl = res.querySelector('details.excl');
  var outParts = ['calcSub', 'calcRows', 'calcNotes', 'calcSvc'].map(function (id) { return d.getElementById(id); });
  outParts.push(out.querySelector('.res3__note'));
  outParts = outParts.filter(Boolean);

  var more = d.createElement('div');
  more.className = 'calc3__more';
  more.id = 'calcMore';
  more.setAttribute('aria-label', 'Подробности расчёта');
  var moreOut = d.createElement('div');
  moreOut.className = 'calc3__more-out';
  moreOut.style.display = 'grid';
  moreOut.style.gap = '0.75rem';
  more.appendChild(moreOut);
  var grid = sec.querySelector('.calc3');
  grid.parentNode.insertBefore(more, grid.nextSibling);

  /* запоминаем исходные места, чтобы вернуть элементы на широком экране */
  var homes = [];
  function remember(el) { homes.push({ el: el, parent: el.parentNode, next: el.nextSibling }); }
  outParts.forEach(remember);
  if (pdf) { remember(pdf); }
  if (excl) { remember(excl); }

  var mq = w.matchMedia('(max-width: 639px)');
  var moved = false;
  function syncOut() {
    moreOut.hidden = out.hidden;
    moreOut.style.display = out.hidden ? 'none' : 'grid';
  }
  function apply() {
    if (mq.matches && !moved) {
      outParts.forEach(function (el) { moreOut.appendChild(el); });
      if (pdf) { more.appendChild(pdf); }
      if (excl) { more.appendChild(excl); }
      moved = true;
    } else if (!mq.matches && moved) {
      for (var i = homes.length - 1; i >= 0; i--) {
        var h = homes[i];
        if (h.next && h.next.parentNode === h.parent) { h.parent.insertBefore(h.el, h.next); }
        else { h.parent.appendChild(h.el); }
      }
      moved = false;
    }
    syncOut();
  }
  if (mq.addEventListener) { mq.addEventListener('change', apply); } else if (mq.addListener) { mq.addListener(apply); }
  new MutationObserver(syncOut).observe(out, { attributes: true, attributeFilter: ['hidden'] });
  apply();

  /* общая нижняя панель прячется, пока на экране калькулятор со своей панелью */
  if ('IntersectionObserver' in w) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { d.body.classList.toggle('in-calc', e.isIntersecting); });
    }, { rootMargin: '0px 0px -40% 0px' }).observe(grid);
  }
})();
