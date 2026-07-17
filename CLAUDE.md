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
