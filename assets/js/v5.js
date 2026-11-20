/*!
 * V5-20112026: видео «Что проверяем до сдачи» запускается само при прокрутке до блока.
 * В карточке — без звука, по кругу, без элементов управления (режим background Vimeo).
 * Клик по карточке, как и раньше, открывает видео со звуком в окне (widgets.js).
 * Вне экрана видео ставится на паузу. При «уменьшении движения» в системе автозапуск отключён.
 */
(function (w, d) {
  'use strict';

  var posters = d.querySelectorAll('.vposter[data-autoplay][data-video]');
  if (!posters.length || !('IntersectionObserver' in w)) { return; }
  if (w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }

  var ORIGIN = 'https://player.vimeo.com';

  function send(frame, method) {
    try { frame.contentWindow.postMessage(JSON.stringify({ method: method }), ORIGIN); } catch (e) { /* плеер ещё не готов */ }
  }

  Array.prototype.forEach.call(posters, function (btn) {
    var id = btn.getAttribute('data-video');
    var frame = null, visible = false, live = false;

    function setLive() {
      if (live) { return; }
      live = true;
      btn.classList.add('is-live');
    }

    function create() {
      frame = d.createElement('iframe');
      frame.className = 'vposter__frame';
      frame.title = btn.getAttribute('data-video-title') || 'Видео';
      frame.setAttribute('tabindex', '-1');
      frame.setAttribute('aria-hidden', 'true');
      frame.allow = 'autoplay; fullscreen; picture-in-picture';
      frame.src = ORIGIN + '/video/' + id + '?background=1&autoplay=1&muted=1&loop=1&autopause=0&dnt=1&playsinline=1';
      frame.addEventListener('load', function () {
        /* плеер Vimeo готов не сразу: повторяем подписку на события, пока видео не заиграет (до 20 с) */
        var tries = 0;
        var t = setInterval(function () {
          if (live || ++tries > 40) { clearInterval(t); return; }
          listen();
          send(frame, visible ? 'play' : 'pause');
        }, 500);
      });
      btn.insertBefore(frame, btn.firstChild.nextSibling);
    }

    /* карточка переключается на видео только после реального старта воспроизведения;
       если Vimeo недоступен, остаётся постер с кнопкой */
    function listen() {
      ['play', 'playProgress', 'timeupdate'].forEach(function (ev) {
        try { frame.contentWindow.postMessage(JSON.stringify({ method: 'addEventListener', value: ev }), ORIGIN); } catch (e) {}
      });
    }
    w.addEventListener('message', function (e) {
      if (!frame || e.source !== frame.contentWindow || e.origin !== ORIGIN) { return; }
      var data = e.data;
      if (typeof data === 'string') { try { data = JSON.parse(data); } catch (err) { return; } }
      if (!data) { return; }
      if (data.event === 'ready') { listen(); if (visible) { send(frame, 'play'); } }
      if ((data.event === 'play' || data.event === 'playProgress' || data.event === 'timeupdate') && visible) { setLive(); }
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        visible = en.isIntersecting && en.intersectionRatio >= 0.4;
        if (visible) {
          if (!frame) { create(); } else { send(frame, 'play'); }
        } else if (frame) {
          send(frame, 'pause');
        }
      });
    }, { threshold: [0, 0.4, 0.75] });
    io.observe(btn);

    d.addEventListener('visibilitychange', function () {
      if (!frame) { return; }
      send(frame, d.hidden || !visible ? 'pause' : 'play');
    });
  });
})(window, document);
