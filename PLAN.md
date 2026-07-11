# PLAN

## Aufgaben-Sammlungen (ohne Accounts)

**Ziel:** Aufgabensets müssen nicht mehr als separate .txt-Dateien verwaltet werden — eine geordnete Sammlung lebt direkt in der App.

**Kein Backend, keine Accounts nötig:** Die App persistiert den Zustand bereits im `localStorage`; Sammlungen sind eine Erweiterung dieses Schemas.

### 1. Lokale Sammlungen im Browser (Hauptweg)
- Mehrere benannte Aufgabensets im `localStorage`, mit Ordnung (z.B. Fach/Thema).
- Panel „Meine Sammlungen" in der Lehrer:innen-Ansicht: speichern, laden, umbenennen, löschen.

### 2. Export/Backup als Datei (Sicherheitsnetz)
- Ganze Sammlung als eine JSON-Datei exportieren und wieder importieren.
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
- ✅ Einstieg vereinfacht: Box „Aufgaben" öffnet sich beim Start automatisch, solange keine Aufgaben erfasst sind; der Fragen-Zähler verweist auf die Erfassungswege.
- Die geplante Sammlung (siehe oben) bekommt ihren Platz in der Box „Aufgaben".
