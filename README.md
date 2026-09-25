# Intus QR kod (PWA)

The PWA version of `intus_qr_generator` (Android). It works the same way: the QR code is `šifra` + an indicator
(ULAZ 0, SLUŽBENI 1, PRIVATNI 2, LIJEČNIK 3, IZLAZ 4, VRATA 99). Tapping the selected button again clears it,
and the QR code then holds only `šifra`. When the app starts it picks a button from the time of day
(before 9 → ULAZ, before 12 → VRATA, otherwise IZLAZ). Settings (šifra, pozdrav) are kept in localStorage.

Everything is served locally: fonts, the QR library (`lib/qrcode.js`, qrcode-generator 1.4.4, MIT) and the icons.
The service worker (`sw.js`) caches every file on the first load. After that the app needs no network at all.

## Install

Open **https://fluffyspace.github.io/intus-qr-pwa/** on the phone and install it (Chrome: ⋮ → *Install app*;
Safari: Share → *Add to Home Screen*). Open it once from the home screen. After that it works fully offline.

When the site is opened in a browser (not as an installed app), it shows an **Instaliraj aplikaciju** banner.
The same link is in the settings screen. On Android/desktop Chrome and Edge, the banner opens the real install dialog.
iOS has no install API, so on iPhone/iPad it shows a short step-by-step guide to Share → *Dodaj na početni zaslon*.

No codes are published. The šifra starts empty and is stored only on the phone (localStorage).

## Updates

After you change any file, increase `VERSION` in `sw.js` and push. Installed apps pick up the update the next time they open with network access.

## Licenses

qrcode-generator © Kazuhiko Arase, MIT. IBM Plex Sans © IBM, SIL Open Font License 1.1.
