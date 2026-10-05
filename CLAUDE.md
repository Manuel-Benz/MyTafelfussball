# CLAUDE.md

Digitales Quizspiel „MyTafelfussball" für den Unterricht. Features und Bedienung: siehe README.md. Offene Vorhaben: siehe PLAN.md.

## Architektur-Grundsätze

- **Alles in einer `index.html`** — Vanilla HTML/CSS/JS, kein Build-Schritt, keine neuen Abhängigkeiten. Einzige Ausnahme: KaTeX via CDN (nur Formeldarstellung, muss ohne Internet degradieren).
- **Kein Backend, keine Accounts.** Persistenz ausschliesslich über `localStorage`; das soll so bleiben (Schulkontext, wartungsfrei).

## Zwei Ansichten, ein State

- Beamer-Ansicht (`?view=beamer`) und Lehrer:innen-Ansicht (`?view=lehrer`) synchronisieren über `BroadcastChannel`, mit `localStorage` als Fallback.
- Neue Features müssen in beiden Fenstern konsistent funktionieren.
- Die Fenster benennen sich per `window.name` (`tafelfussball_beamer`/`tafelfussball_lehrer`); `focusOrOpenView()` fokussiert ein offenes Fenster statt ein Duplikat zu öffnen — neue Öffnen-Wege sollen darüber laufen.
- Die Beamer-Ansicht zeigt **nie** die Lösung — ausser sie wurde explizit aufgedeckt.

## i18n

- Jeder sichtbare Text läuft über `data-i18n` (bzw. `data-i18n-html`, `data-i18n-ph`, `data-i18n-title`).
- Neue Strings immer in **beiden** Sprachblöcken (DE und EN) ergänzen — nie nur in einem.

## Sprache & Stil

- Commits, UI-Texte und README auf Deutsch, Schweizer Schreibweise (ss statt ß: „Fussball", „grösse").
- Anrede mit Doppelpunkt: „Lehrer:innen".

## Design (My-Designsystem)

- Quelle ist **`~/MySuite`**; `design/` ist eine Kopie (`design/HERKUNFT.txt`) und wird **nie** hier geändert — dort ändern, dann `~/MySuite/sync.sh tafel`.
- Standard: Schema **Moonrise Kingdom**, Akzent **Ton 4 Tanne** (#17603F / #2D9C69), Listenform **Kartenzeilen**, Icon Zebra (`design/icons/tafel.svg` als Favicon, Creme-Variante auf der Startseite).
- Farben nur über Tokens (`--akzent`, `--karte`, `--linie`, `--rot` …). Eigene Variablen heissen **nie** wie Tokens. Einzige feste Farben: Rasen (`--field`), Ball, Dateiablage-Overlay.
- Schema/Ton/Modus liegen im State (`schema`, `ton`, `theme`) und werden als `data-schema`/`data-ton`/`data-modus` am `<html>` gesetzt: ein Kopfskript vor dem ersten Zeichnen, danach `applyLook()`. Ton 0 = Akzent des Schemas (kein `data-ton`).
- Knöpfe: Standard = sekundär (`--akzent-weich`), `.primary` = Akzent, `.ghost` = neutral.

### Abweichungen
- **Kopfleiste** nur auf Startseite und Lehrer:innen-Ansicht; der Beamer bleibt ohne. In der Leiste der Wechsel zur Beamer-Ansicht (`#gotoBeamer`).
- **Teamfarben** aus den Spielfarben: Team 1 = `--spiel-4`, Team 2 = `--spiel-1`; Fox/Zissou Team 1 = `--spiel-2`, Isle Team 1 = `--rad-8` (Spielfarben dort zu ähnlich).
- **Rasen** bleibt grün, unabhängig vom Schema.
- Gewählter Ton: `--akzent-ink` wird per OKLCH aus der Helligkeit des Tons abgeleitet (die Schemen kennen die Schrift nur für ihren eigenen Akzent).
- Bekannte Grenze aus my-schemen.css: bei erzwungenem Hell/Dunkel folgt der Schema-Akzent weiter dem OS-Modus.
- Sichtprüfung headless: `prefers-color-scheme` per CDP ausdrücklich setzen.
