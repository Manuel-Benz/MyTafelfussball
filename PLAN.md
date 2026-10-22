# PLAN

## Aufgaben-Sammlungen (ohne Accounts)

**Ziel:** Aufgabensets müssen nicht mehr als separate .txt-Dateien verwaltet werden — eine geordnete Sammlung lebt direkt in der App.

**Kein Backend, keine Accounts nötig:** Die App persistiert den Zustand bereits im `localStorage`; Sammlungen sind eine Erweiterung dieses Schemas.

### 1. Lokale Sammlungen im Browser (Hauptweg)
- ✅ Umgesetzt: „Sammlung" oben in der Box „Aufgaben" — Sets in Ordnern (kompakte Liste), speichern, laden, umbenennen, löschen, per Ziehen verschieben.
- ✅ Dazu wie MyVoci/MyMemory: optional als .txt-Dateien in einem Ordner auf dem Computer (Chrome/Edge).

- ✅ Box «Aufgaben» vereinfacht: Import erzeugt direkt ein Set, Hinzufügen inline, Import in zwei Schritten, Export pro Set, Set-Name in der Kopfzeile, Leerzustand mit Import zuoberst.
- Offen (Idee): geladene Sets automatisch speichern (statt «Speichern»/«ungespeicherte Änderungen») — bewusst noch nicht, weil dann ohne Rückfrage überschrieben wird.

- Offen (bekannte Grenzen des Ordners):
  - Nach «Ordner freigeben» (oder «Neu laden») gilt der Ordner: Änderungen an Sets, die im Browser gespeichert wurden, solange der Ordner noch nicht freigegeben war, gehen verloren. Lösung bräuchte einen Merker «noch nicht gespiegelt» pro Set.
  - Das .txt-Format kennt kein Escaping: Zeilen in Frage/Antwort, die mit `A:`/`F:`/`Q:` beginnen oder `---` lauten (z. B. Multiple-Choice «A: …»), werden beim Zurücklesen falsch gedeutet.

### 2. Export/Backup als Datei (Sicherheitsnetz)
- ✅ Pro Set umgesetzt: ⤓ an der Set-Zeile lädt das Set als .txt im Import-Format (`F:`/`A:`/`---`) herunter — direkt wieder importierbar.
- ✅ Ganze Sammlung (21.10.2026): «⤓ Alle als ZIP» (alle Sets samt Ordnern) und «Sicherung speichern/einlesen» (eine JSON-Datei; Einlesen ergänzt, was fehlt, und ersetzt nichts).
- Wichtig, weil `localStorage` an Browser + Gerät gebunden ist (weg beim Löschen der Website-Daten); deckt auch den Gerätewechsel ab.

### 3. Teilen per Link
- ✅ Umgesetzt (21.10.2026): 🔗 an der Set-Zeile zeigt Link und QR-Code (seit 22.10.2026 auf die Startseite `#t=…`, alte `?view=lehrer#t=` gelten weiter; komprimiert). Wer ihn öffnet, bekommt das Set in die eigene Sammlung.
- Grenze: Bei sehr grossen Sets passt der Link nicht mehr in einen QR-Code; der Link selbst geht trotzdem.

### 4. Gemeinsame Ablage mit den anderen My-Apps (21.10.2026)
- ✅ Regeln aus MySuite `ABLAGE.md`, Code aus `design/js/my-ablage.js`: Datei mit `# Titel`, Dateinamen ohne Umlaute/Sonderzeichen (alte Dateien behalten ihren Namen), Ordner ziehen, Ordner-Pfade behalten bestehende Teile, «Set erstellen» mit Einfügefeld und Vorschau, KI-Prompt im gemeinsamen Aufbau. Headless-Test `tools/test-ordner.js`.
- ✅ Angleichung (22.10.2026): Startseite wie MyVoci/MyKahoot — Kasten «Tafelfussball erstellen» (ein Feld für Text oder Datei, «von Hand») und die Sammlung «Meine Tafelfussbälle»; jede Set-Zeile mit den Kacheln Beamer und Lehrer:in. Das Lehrer:innen-Fenster behält nur die aktuelle Liste.
- ✅ Wie die anderen My-Apps (22.10.2026, DESIGN.md): Einstellungen auf der Startseite (Darstellung, Sprache, Ordner, Sicherung), eigene Dialoge statt confirm/prompt/alert, Strich-Symbole statt Emoji, ⤓ ZIP im Listenkopf, Unterordner am Ordner, «…» statt „…“.
- Offen: am iPad und mit einem echten Ordner am Mac von Hand ausprobieren (auch: Startseite und Lehrer:innen-Fenster gleichzeitig offen, Speichern in beiden).
- Offen (Idee): «Speichern unter …» im Lehrer:innen-Fenster mit Ordnerwahl (heute: Ordner des geladenen Sets, verschieben per Ziehen auf der Startseite).

### Bewusst nicht geplant
- Backend/Accounts (Supabase o.ä.): würde Synchronisation zwischen Geräten bringen, macht aber aus der wartungsfreien statischen Seite ein System mit Datenbank, Datenschutzfragen (Schulkontext) und Betriebsverantwortung.

---

## Panels der Lehrer:innen-Ansicht überdenken
- ✅ Erster Umbau: Einstellungen zuoberst (einklappbar); Hinzufügen/Aufgaben/Import zu einer einklappbaren Box „Aufgaben" gebündelt; Help-Box und Einfüge-Textfeld entfernt.
- ✅ Zweiter Umbau: Spielzug + Aktuelle Frage zu einer Box „Spiel" vereint (Spiel starten zuoberst, Buttons „Punkt Team 1/2", drei Reset-Buttons einheitlich zuunterst); „Ball in die Mitte" entfernt; Reihenfolge-Schalter in die Einstellungen.
- Die Seitenleiste besteht damit aus drei Boxen: Einstellungen, Aufgaben (beide einklappbar), Spiel. Eine Tab-Aufteilung ist damit wohl nicht mehr nötig.
- ✅ Einstieg vereinfacht: Box „Aufgaben" öffnet sich beim Start automatisch, solange keine Aufgaben erfasst sind; Hover/Klick auf „Spiel starten" zeigt dann eine Sprechblase mit den Erfassungswegen.
- ✅ Die Sammlung (siehe oben) sitzt in der Box „Aufgaben".

---

## Beamer-Ansicht (angelehnt an MyKahoot/MyMemory)
- ✅ Rückmeldungen: Funken beim Ballschritt (nur gespielte Schritte, Zähler `kicks`), Tor mit Konfetti aus dem Tor, Farbblitz und springender Punktzahl, Lösung blendet ein, Feuerwerk am Rundenende.
- ✅ Tribüne oben: zwei Fanblöcke in Team- und Schemafarben, Dach mit Flutlicht, Bande mit Zaunfahnen (Teamnamen); beim Tor hüpft der Block und reisst die Arme hoch.
- ✅ Feld flacher (Beamer 28vh, Lehrer:innen 170px), damit Fragen mehr Platz haben; Tribünendach mit Stützen statt Zickzack-Fachwerk; Vollbild-Knopf unten rechts.
- Offen (Ideen): Frage als grosse Karte, die beim Aufdecken kippt; Teamfarbe als Ring/Balken beim Team am Zug; Schlussbildschirm mit Podium.
