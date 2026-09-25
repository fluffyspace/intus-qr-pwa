(function () {
  "use strict";

  // Indicator values appended to the code, same as the Android app.
  var ULAZ = 0, VRATA = 99, IZLAZ = 4;
  // Re-run the time-based preselection when the app comes back after this long.
  var REPREDICT_AFTER_MS = 15 * 60 * 1000;

  var store = {
    get: function (k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  var sifra = store.get("sifra");
  var pozdrav = store.get("pozdrav");
  var indikator = -1;
  var hiddenAt = 0;

  var $ = function (id) { return document.getElementById(id); };
  var main = $("main"), settings = $("settings");
  var qrBox = $("qr"), qrEmpty = $("qrEmpty"), greeting = $("greeting");
  var buttons = Array.prototype.slice.call(document.querySelectorAll(".buttons .kind"));

  function qrSvg(text) {
    var qr = qrcode(0, "L");
    qr.addData(unescape(encodeURIComponent(text)), "Byte");
    qr.make();
    var n = qr.getModuleCount(), m = 4, size = n + m * 2, d = "";
    for (var r = 0; r < n; r++)
      for (var c = 0; c < n; c++)
        if (qr.isDark(r, c)) d += "M" + (c + m) + " " + (r + m) + "h1v1h-1z";
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + " " + size +
      '" shape-rendering="crispEdges" role="img" aria-label="QR kod: ' + text.replace(/[<>&"]/g, "") +
      '"><path fill="#000" d="' + d + '"/></svg>';
  }

  function render() {
    buttons.forEach(function (b) { b.classList.toggle("on", +b.dataset.ind === indikator); });
    greeting.textContent = pozdrav;
    var text = indikator === -1 ? sifra : sifra + indikator;
    if (!sifra) {
      qrBox.innerHTML = "";
      qrEmpty.hidden = false;
      return;
    }
    qrEmpty.hidden = true;
    qrBox.innerHTML = qrSvg(text);
  }

  function predict() {
    var h = new Date().getHours();
    indikator = h < 9 ? ULAZ : h < 12 ? VRATA : IZLAZ;
  }

  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      var ind = +b.dataset.ind;
      indikator = indikator === ind ? -1 : ind;
      render();
    });
  });

  function showSettings() {
    $("sifra").value = sifra;
    $("pozdrav").value = pozdrav;
    main.hidden = true;
    settings.hidden = false;
    $("sifra").focus();
  }
  function hideSettings() {
    settings.hidden = true;
    main.hidden = false;
  }

  $("openSettings").addEventListener("click", showSettings);
  $("cancelSettings").addEventListener("click", hideSettings);
  $("settingsForm").addEventListener("submit", function (e) {
    e.preventDefault();
    sifra = $("sifra").value.trim();
    pozdrav = $("pozdrav").value;
    store.set("sifra", sifra);
    store.set("pozdrav", pozdrav);
    hideSettings();
    render();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    if (hiddenAt && Date.now() - hiddenAt > REPREDICT_AFTER_MS && settings.hidden) {
      predict();
      render();
    }
  });

  // --- Install prompt ---------------------------------------------------
  // Chromium (Android, desktop) fires beforeinstallprompt and lets us open the real
  // install dialog. iOS has no such API, so there we show step-by-step instructions.
  var installEls = Array.prototype.slice.call(document.querySelectorAll("[data-install]"));
  var banner = $("installBanner"), iosSheet = $("iosInstall");
  var deferredPrompt = null;
  var isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var bannerDismissed = false;
  try { bannerDismissed = sessionStorage.getItem("installDismissed") === "1"; } catch (e) {}

  function showInstall(on) {
    $("installLink").hidden = !on;
    banner.hidden = !on || bannerDismissed;
  }

  if (!isStandalone) {
    if (isIOS) showInstall(true);
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      deferredPrompt = e;
      showInstall(true);
    });
  }
  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    showInstall(false);
  });

  installEls.forEach(function (el) {
    el.addEventListener("click", function () {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        // A prompt can be used only once; Chrome fires beforeinstallprompt again later.
        deferredPrompt.userChoice.then(function () {
          deferredPrompt = null;
          showInstall(false);
        });
      } else if (iosSheet.showModal) {
        iosSheet.showModal();
      }
    });
  });

  $("dismissInstall").addEventListener("click", function () {
    bannerDismissed = true;
    banner.hidden = true;
    try { sessionStorage.setItem("installDismissed", "1"); } catch (e) {}
  });

  predict();
  render();
  if (!sifra) showSettings();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function (err) {
        console.warn("Service worker registration failed:", err);
      });
    });
  }
})();
