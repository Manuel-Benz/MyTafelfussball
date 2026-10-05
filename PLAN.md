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
- Offen für später: ganze Sammlung (mehrere Sets) als eine JSON-Datei exportieren und wieder importieren.
- Wichtig, weil `localStorage` an Browser + Gerät gebunden ist (weg beim Löschen der Website-Daten); deckt auch den Gerätewechsel ab.

### 3. Teilen per Link (optional, später)
- Ein Set komprimiert ins URL-Fragment (`#…`) kodieren — Kolleg:innen erhalten einen Link statt einer Datei.
- Grenze: URL-Länge bei sehr grossen Sets.

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
