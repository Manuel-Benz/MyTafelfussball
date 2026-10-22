# CLAUDE.md

Digitales Quizspiel „MyTafelfussball" für den Unterricht. Features und Bedienung: siehe README.md. Offene Vorhaben: siehe PLAN.md.

## Architektur-Grundsätze

- **Alles in einer `index.html`** — Vanilla HTML/CSS/JS, kein Build-Schritt, keine neuen Abhängigkeiten. Ausnahmen: KaTeX via CDN (nur Formeldarstellung, muss ohne Internet degradieren) und seit 2026-10-21 `design/js/my-ablage.js` (lokal, aus `~/MySuite`, s. „Sammlung und Ordner“).
- **Kein Backend, keine Accounts.** Persistenz ausschliesslich über `localStorage`; das soll so bleiben (Schulkontext, wartungsfrei).

## Drei Fenster, ein State

- Startseite (ohne `view`, `isLauncher`), Beamer-Ansicht (`?view=beamer`) und Lehrer:innen-Ansicht (`?view=lehrer`) synchronisieren über `BroadcastChannel`, mit `localStorage` als Fallback. Die Startseite zeigt kein Spiel: `render()` macht dort nur Look, Sprache und die Sammlung (`renderCollHook`), Tastenkürzel greifen nicht.
- Neue Features müssen in Beamer und Lehrer:innen konsistent funktionieren.
- Die Fenster benennen sich per `window.name` (`tafelfussball_start`/`_beamer`/`_lehrer`); `focusOrOpenView()` fokussiert ein offenes Fenster statt ein Duplikat zu öffnen — neue Öffnen-Wege sollen darüber laufen. Die Kopfleiste (Startseite und Lehrer:innen) hat alle drei (`data-goto`), die eigene ist `.aktiv`.
- Die Beamer-Ansicht zeigt **nie** die Lösung — ausser sie wurde explizit aufgedeckt.

## i18n

- Jeder sichtbare Text läuft über `data-i18n` (bzw. `data-i18n-html`, `data-i18n-ph`, `data-i18n-title`).
- Neue Strings immer in **beiden** Sprachblöcken (DE und EN) ergänzen — nie nur in einem.

## Sprache & Stil

- Commits, UI-Texte und README auf Deutsch, Schweizer Schreibweise (ss statt ß: „Fussball", „grösse").
- Anrede mit Doppelpunkt: „Lehrer:innen".

## Sammlung und Ordner

- Sammlung unter `tafelfussball_sammlung` (`{ sets, folders }`), **nicht** im Spiel-State — läuft auf der Startseite (Baum, Erstellen) und im Lehrer:innen-Fenster («Speichern» der aktuellen Liste, alte Links), der Beamer braucht sie nie (Block `if (isLauncher || isTeacher)`). Ändert ein Fenster sie, übernimmt das andere per `storage`-Event und spiegelt ebenfalls (doppelt schadet nicht). Im State stehen nur `setId` (geladenes Set, für „Speichern"/„geändert") und `newDir` (Ordner einer von Hand begonnenen Liste; `loadSet` und «Alle löschen» leeren ihn). Braucht der Ordner Freigabe oder ist er weg, zeigt das Lehrer:innen-Fenster die Ordner-Zeile unter der Liste (`#dirLineLehrer`).
- **Gemeinsamer Code** (seit 2026-10-21): Namen, Ort, `readDir`/`mirrorDir`/`fromDisk`, Ordner-Wächter und Download kommen aus `design/js/my-ablage.js`, Regeln in `design/ABLAGE.md` (beides aus `~/MySuite`, `sync.sh tafel`, nie hier ändern). Hier stehen nur das Format (`ablage = MyAblage.sammlung({ items: "tasks", … })`), `takeDisk`/`mirrorSoon` und die Oberfläche.
- Datei: `# Titel`, Leerzeile, dann `F:`/`A:`/`---` (`toFile(set)`; `parseTasks` überliest die Titelzeile). Titel aus `# Titel`, sonst aus dem Dateinamen (alte Dateien). Dateiname nach der Namensregel (`plainName`: ohne Umlaute/Sonderzeichen); alte Dateien behalten ihren Namen über `file`, bis man das Set umbenennt (`dropAutoFile`). «Dasselbe Set» = Ordner + Titel ohne Gross/Klein oder dieselbe Datei (`sameSlot`/`slotTaken`).
- Ordner auf der Platte: Handle in IndexedDB `mytafelfussball`→`kv`→`dir`, `mirrored` = Stand, den der Ordner zuletzt sah, Promise-Kette `enqueue` (`MyAblage.queue`), Nachlesen beim Fenster-Fokus. Was `mirrorDir` geschrieben hat, merkt sich das Modul (`ablage.forget` beim Trennen). Ordner-Eingaben sind ganze Pfade («Mathe/Klasse 8»): `ablage.resolveFolderPath` (neuer Ordner) bzw. `ablage.renamePathTarget` (umbenennen, auch nur Gross/Klein) behalten bestehende Teile, wie sie heissen (auch ohne Umlaut getippt), nur neue gehen ohne Sonderzeichen; umbenennen und ziehen laufen über `relocateDir` (sonst entstünde neben «Französisch» ein «Franzoesisch»). Ordner umbenennen mit unveränderter Vorgabe tut nichts. Titel gehen nur durch `cleanTitle` (Steuerzeichen, Leerzeichen) und bleiben sonst, wie sie sind.
- Test: `node tools/test-ordner.js` (Ordner-Weg headless, OPFS als Ordner; nach jedem `sync.sh tafel`; braucht Playwright, `PLAYWRIGHT=<Pfad>`).
- Stolpersteine: Ein Set ohne Frage gibt es nicht (`readDir` lässt solche Dateien aus) — darum speichert `saveAs` nie eine leere Liste. Versteckte Dateien (`.DS_Store`) zählen weder beim Lesen noch in `removeEmptyDir`; sonst bliebe ein gelöschter/umbenannter Ordner stehen und käme als Geisterordner zurück.
- Startseite (wie MyVoci/MyKahoot, ABLAGE.md «Erstellen»): Kasten «Tafelfussball erstellen» (`#createSec`, `<details>`): «Speichern in» (`#createDir`, gefüllt in `fillCreateDirs`), Schritte, «KI-Prompt kopieren», **ein Feld** `#pasteBox` für Text oder Datei, Vorschau, «oder von Hand». Darunter die Karte «Meine Tafelfussbälle» (Kopf mit ＋/📁, Baum, ZIP · Sicherung, Ordner-Zeile). Eingefügter Text und **eine** Datei (aufs Fenster oder ins Feld gezogen; sie steht dann sichtbar im Feld, `pastedFile` = Ersatztitel) gehen in die **Vorschau** (`showPreview`: Titel aus `# Titel` sonst Dateiname, erkannte Fragen, bis zu drei nicht verstandene Zeilen aus `strayTaskLines` — Folgezeilen nach `F:`/`A:` zählen als verstanden); erst «In die Sammlung» ruft `putSet` (lädt nicht) und klappt den Ordner auf (`openTo`). Mehrere Dateien: direkt je ein Set im gewählten Ordner. ＋ am Ordner bzw. im Kopf: `openCreate(dir)`. «Von Hand»: leere aktuelle Liste mit `newDir`, dann Lehrer:innen-Fenster. Dateien im Lehrer:innen-Fenster: nur ein Hinweis (`dropAtStart`). Liste, Vorschau, Import, Link und Sicherung legen Sets über `putSet(title, dir, tasks, keepId)` ab (Platzprüfung über `slotTaken`, Rückfrage beim Ersetzen).
- Set-Zeile: Name, Anzahl, dann die zweigeteilte Kachel **Beamer** | **Lehrer:in** (`startSet(id, target)`: `loadSet`, ausser das Set ist schon geladen — dann bleibt die Liste samt Änderungen —, dann `focusOrOpenView`). `loadSet` gibt zurück, ob die Liste danach dieses Set ist. Lehrer:innen-Fenster: Box «Aufgaben» = nur noch «Aktuelle Liste» (Speichern, Speichern unter …, Alle löschen); sie geht auf, wenn die Liste leer wird (`lastTaskCount`).
- Teilen (🔗 an der Set-Zeile, `shareSet`): Link auf die Startseite `#t=<MyAblage.packLink([titel, [[q, a], …]])>` und QR-Code (qrcode-generator, erst bei Bedarf über `MyAblage.loadScript`). Neue Felder im Array nur hinten anhängen. Beim Öffnen (`#t=` am Ende des Sammlungs-Blocks) kommt das Set per `putSet` in den Hauptordner; alte Links auf `?view=lehrer#t=` laden es dort zusätzlich. Der Hash wird sofort entfernt, sonst importierte jedes Neuladen nochmals.
- Ziehen: Sets (`SET_MIME`) und Ordner (`DIR_MIME`, `moveDir` mit `ablage.moveFolderTarget`); Ziel ist der Ordner unter dem Zeiger, ein Set meint dessen Ordner.
- Sicherung: JSON `{ app: "mytafelfussball", version, sets, folders }` ohne `disk`/`file` (`ablage.backupSets`); Einlesen vergibt neue ids und ergänzt bei gleichem Platz nur fehlende Fragen.
- Der KI-Prompt (`kiPrompt`, DE/EN) hat den Aufbau aus ABLAGE.md (Ausfüllblock, Ausgabe als .txt + Code-Block, FORMAT mit `# Titel`, TITEL, REGELN, ZUM SCHLUSS). Code-Block-Zäune (```) im eingefügten Text schaden nicht: `parseTasks` überliest Zeilen vor dem ersten `F:` und nach dem letzten `---`. Bei Änderungen an Format oder Sammlung mitziehen.
- Sichtprüfung headless: das OPFS-Wurzelverzeichnis (`navigator.storage.getDirectory()`) als Handle in IndexedDB legen — dann läuft der ganze Ordner-Weg ohne Dateiauswahl.

## Design (My-Designsystem)

- Quelle ist **`~/MySuite`**; `design/` ist eine Kopie (`design/HERKUNFT.txt`) und wird **nie** hier geändert — dort ändern, dann `~/MySuite/sync.sh tafel`.
- Standard: Schema **Moonrise Kingdom**, Akzent **Ton 4 Tanne** (#17603F / #2D9C69), Listenform **Kartenzeilen** (Aufgaben), **kompakt** (Sammlung), Icon Zebra (`design/icons/tafel.svg` als Favicon und in der Kopfleiste). Auf der Startseite steht das Zebra ohne Kachel rechts vom Titel (wie MyKahoot/MyMemory): `.logo` ist eine Maske in `currentColor` (weiss im Dunkel-Modus, dunkel auf hellem Grund), als Data-URI im Block `<style id="logo-zebra">`, erzeugt von `tools/make-logo.py` (nach jedem `sync.sh tafel` mit neuem Icon neu laufen lassen). Data-URI statt Datei, weil Chrome Masken aus Dateien unter `file://` nicht lädt.
- Farben nur über Tokens (`--akzent`, `--karte`, `--linie`, `--rot` …). Eigene Variablen heissen **nie** wie Tokens. Einzige feste Farben: Rasen (`--field`), Ball, Dateiablage-Overlay.
- Schema/Ton/Modus liegen im State (`schema`, `ton`, `theme`) und werden als `data-schema`/`data-ton`/`data-modus` am `<html>` gesetzt: ein Kopfskript vor dem ersten Zeichnen, danach `applyLook()`. Ton 0 = Akzent des Schemas (kein `data-ton`).
- Knöpfe: Standard = sekundär (`--akzent-weich`), `.primary` = Akzent, `.ghost` = neutral.
- Symbole: `ICON` (Strich-SVGs in den Formen von MyVoci, DESIGN.md «Sammlung auf der Startseite»), keine Emoji; Knöpfe mit `data-icon` füllt das Skript beim Start. Zeilen-Werkzeuge: Ordner ＋ · Unterordner (`newSub` → `newFolder(dir)`) · ✎ · 🗑, Set ⤓ · 🔗 · ✎ · 🗑.
- Rückfragen nur über `ask()` (`confirmBox`/`promptBox`/`tell`, Promise, eigener `<dialog class="ask-dialog">`), nie `confirm`/`prompt`/`alert` — der Test meldet jeden Browser-Dialog als Fehler. Wer nach der Rückfrage weiterarbeitet, liest den Zustand neu (`setById`, Ordner leer?): Startseite und Lehrer:innen-Fenster können ihn inzwischen geändert haben.
- Einstellungen der Startseite: Knopf `#settingsBtn` in der Leiste, Kästchen `#settingsPop` am rechten Rand (über der Spalte, wenn sie nicht daneben passt; zu per Knopf, Klick daneben, Esc). Darin die Schalter `#lookControls` (ziehen beim Start aus den Lehrer:innen-Einstellungen hierher, verdrahtet in `if (!isBeamer)`, Zustand in `renderLookControls`), «Ordner auf dem Computer» (`#dirLine`) und «Sicherung». Freigabe nötig/Ordner weg zusätzlich als Streifen `#dirStrip` über der Liste. ⤓ im Listenkopf = ZIP.

### Abweichungen
- **Kopfleiste** nur auf Startseite und Lehrer:innen-Ansicht; der Beamer bleibt ohne. In der Leiste die drei Fenster (`data-goto`). Im Beamer stattdessen dezent unten rechts (`.view-switch`): Wechsel zur Lehrer:innen-Ansicht und Vollbild-Knopf (Symbol wechselt per `:fullscreen`, ohne Fullscreen-API ausgeblendet).
- **Teamfarben** aus den Spielfarben: Team 1 = `--spiel-4`, Team 2 = `--spiel-1`; Fox/Zissou Team 1 = `--spiel-2`, Isle Team 1 = `--rad-8` (Spielfarben dort zu ähnlich).
- **Rasen** bleibt grün, unabhängig vom Schema.
- **Tribüne** (nur Beamer, `buildStands()`): zwei Fanblöcke über dem Spielstand, links Team 1, rechts Team 2; ein SVG mit festem Zufalls-Startwert. Trikots aus Teamfarbe und weiteren Schemafarben (`--rad-N`, `--spiel-2/3`), ohne die, die einer Teamfarbe zu ähnlich sind — darum Neuzeichnen beim Schemawechsel. Haut- und Haarfarben sind fest (weitere Ausnahme von «nur Tokens»). Beim Tor hüpft der Block und reisst die Arme hoch (`cheerStands`). Nachtdetails (Flutlicht, Handylichter) nur im Dunkelmodus (`.nacht`). Dach schlicht mit Stahlstützen nur in den Gängen (`aisles`), damit sie keine Fans verdecken.
- **Effekte** (wie MyKahoot, ein Canvas `#confetti`, `burst()`): laufen in jedem Fenster, das den neuen Zustand rendert, ausgelöst über Zustandswechsel in `render()` (Punkte, `kicks`, Rundenende). Funken nur bei gespielten Ballschritten — darum zählt `moveBall` `kicks` hoch; Reset/Rundenstart/Tor setzen den Ball ohne. `prefers-reduced-motion` schaltet alles ab (`burst()`/`flashScreen()` prüfen es selbst, CSS nimmt nur die Animationen).
- Stolpersteine Effekte: `ctx.globalAlpha` ignoriert Werte ausserhalb 0–1 (darum klemmen, sonst blitzt der Partikel mit dem Alpha des Vorgängers auf). `cheerStands` hält einen gemeinsamen Timer — ein zweites Tor verlängert den Jubel. Die Tribüne wird nur bei Schemawechsel neu gezeichnet (`lastStandsSchema`); Ton und Hell/Dunkel laufen live über Tokens.
- Gewählter Ton: `--akzent-ink` wird per OKLCH aus der Helligkeit des Tons abgeleitet (die Schemen kennen die Schrift nur für ihren eigenen Akzent).
- Bekannte Grenze aus my-schemen.css: bei erzwungenem Hell/Dunkel folgt der Schema-Akzent weiter dem OS-Modus.
- Sichtprüfung headless: `prefers-color-scheme` per CDP ausdrücklich setzen.
