# ⚽ MyTafelfussball

Ein digitales Quizspiel im Stil von „Tafelfussball" für den Unterricht — komplett clientseitig, kein Backend, keine Kosten. Läuft in jedem modernen Browser.

**Live:** https://manuel-benz.github.io/MyTafelfussball/

## Idee

Die Lehrperson stellt Fragen. Die richtig antwortende Mannschaft bewegt den Ball ein Feld Richtung gegnerisches Tor. Wer zuerst trifft, bekommt einen Punkt.

## Zwei Ansichten, ein Gerät

Öffne die App und wähle im Launcher eine Ansicht (jeweils in einem eigenen Fenster):

- **📺 Beamer-Ansicht** (`?view=beamer`) — für die Klasse auf dem Projektor. Zeigt Spielfeld, Ball, Punkte und Frage, darüber eine Tribüne mit den Fans beider Teams (in den Farben des Schemas). **Nie die Lösung.**
- **🎛️ Lehrer:innen-Ansicht** (`?view=lehrer`) — auf dem Laptop. Steuerung, Aufgabenverwaltung und die Lösung.

Beide Fenster synchronisieren sich live über `BroadcastChannel`, mit `localStorage` als Fallback und Persistenz.

Jede Ansicht hat einen Wechsel-Button zur anderen (Lehrer:innen: oben rechts in der Kopfleiste; Beamer: dezent unten rechts). Ist das Zielfenster schon offen, wird es nur in den Vordergrund geholt — sonst öffnet es sich neu.

## Bedienung

- **Ein Button führt durchs Spiel**: „▶ Spiel starten" → „👁 Antwort aufdecken" → „Nächste Frage ▶" → … Die aufgedeckte Antwort erscheint auch auf dem Beamer.
- **Jede Frage kommt genau einmal pro Runde** — auch im Zufallsmodus (Reihenfolge einstellbar in den Einstellungen). Sind alle durch, zeigt die App „🏁 Runde beendet"; „Fragen zurücksetzen" startet eine neue Runde.
- **⌘/Strg + →** — derselbe Schritt per Tastatur: Frage zeigen, Antwort aufdecken, nächste Frage, … So klickt man sich durchs ganze Spiel.
- **⌘/Strg + ←** — Frage zurück (Verlauf, funktioniert auch im Zufallsmodus).
- **Punkt Team 1 / Punkt Team 2** oder **Pfeiltasten ← / →** — bewegen den Ball Richtung gegnerisches Tor. Hinter der letzten Station fällt er ins Tor: Punkt, Jubel (Konfetti, die Fans des Teams springen auf), zurück zur Mitte. Am Ende der Runde gibt es ein Feuerwerk für das führende Team.
- **L** — Lösung auf-/verdecken (Abkürzung).
- **Zurücksetzen** (unten in der Box „Spiel"): „Punkte zurücksetzen", „Fragen zurücksetzen" (neue Runde, Aufgaben bleiben) und „Alles zurücksetzen" (Punkte, Ball und Fragerunde in einem Klick; die Aufgabenliste bleibt erhalten).

## Sprache

In den Einstellungen der Lehrer:innen-Ansicht lässt sich die Oberfläche zwischen **Deutsch und Englisch** umschalten (DE/EN) — Beamer-Ansicht und Startseite wechseln mit. Der Import versteht `F:` und `Q:` als Frage-Marker.

## Darstellung

Ebenfalls in den Einstellungen: **Auto / Hell / Dunkel**. „Auto" folgt der Systemeinstellung, Hell/Dunkel erzwingen den Modus. Dazu **Farbschema** (fünf Schemen des My-Designsystems) und **Akzentfarbe** (Standard: Moonrise Kingdom, Tanne). Die Teamfarben kommen aus dem Schema, der Rasen bleibt grün. Alles synchron in beiden Fenstern.

## Aufgaben aus PDF importieren

In der Box „Aufgaben" unter **„Aus Arbeitsblatt erstellen"**:

1. **„KI-Prompt kopieren"** und zusammen mit dem Aufgabenblatt (PDF) in ein KI-Tool (Claude/ChatGPT) einfügen. Der Prompt verlangt kurze, beamertaugliche Fragen, Teilaufgaben als eigene Aufgaben, nur Endergebnisse als Lösung und eine `.txt`-Datei, die nach dem Thema benannt ist (der Dateiname wird zum Set-Titel).
2. Die erhaltene `.txt`-Datei aufs Fenster **ziehen** oder auf die Ablage-Fläche **klicken** und sie auswählen. Sie wird ein **Set in der Sammlung** (Titel = Dateiname) und gleich geladen. Gibt es den Namen schon, wird nach dem Ersetzen gefragt. Ist ein Ordner auf dem Computer verbunden, genügt es auch, die Datei dort hineinzulegen.

Einzelne Aufgaben lassen sich unter der aktuellen Liste von Hand erfassen (Frage, Lösung, „+" bzw. Enter).

Format:

```
F: Was ist die Hauptstadt der Schweiz?
A: Bern
---
F: Wie viel ist 7 × 8?
A: 56
---
```

Umgekehrt lädt **⤓** an einem Set dieses als Datei in genau diesem Format herunter — als Backup, für den Gerätewechsel oder zum Weitergeben an Kolleg:innen.

## Sammlung

In der Box „Aufgaben" liegt die **Sammlung** (solange sie leer ist, steht „Aus Arbeitsblatt erstellen" zuoberst): beliebig viele benannte Sets; der Name des geladenen Sets steht auch in der Kopfzeile der Box, geordnet in Ordnern (Unterordner mit „/", z. B. `Mathe/Klasse 8`).

- **Speichern** legt die aktuelle Liste als Set ab (bzw. überschreibt das geladene Set), **Speichern unter …** als neues Set; 💾 an einem Ordner speichert direkt dort hinein.
- Klick auf ein Set **lädt** es (ersetzt die aktuelle Liste, startet eine neue Runde; die Punkte bleiben). Ist die aktuelle Liste nicht gespeichert, wird vorher nachgefragt.
- Sets per **Ziehen** in einen anderen Ordner verschieben; ⤓/✎/🗑 zum Herunterladen, Umbenennen und Löschen. Ordner lassen sich nur löschen, wenn sie leer sind.

**Ordner auf dem Computer** (Chrome/Edge am Computer, wie in MyVoci und MyMemory): Mit „Mit Ordner auf dem Computer verbinden" liegen die Sets als `.txt`-Dateien (F:/A:/---) in einem Ordner deiner Wahl, Unterordner = Ordner der Sammlung. Dateien, die im Finder hinzukommen, umbenannt oder gelöscht werden, erscheinen beim Zurückwechseln ins Fenster. Nach einem Neustart des Browsers braucht der Ordner einmal „Ordner freigeben". Ohne Ordner bleibt die Sammlung im Browser (`localStorage`).

## Formeln (KaTeX)

Fragen und Lösungen dürfen mathematische Formeln enthalten. Schreibe LaTeX zwischen `$…$` (inline) oder `$$…$$` (abgesetzt):

```
F: Löse die quadratische Gleichung $x^2 - 5x + 6 = 0$.
A: $x_1 = 2$, $x_2 = 3$
```

Gerendert wird mit [KaTeX](https://katex.org/) (per CDN geladen). Ist beim Laden kein Internet verfügbar, bleibt der Rohtext lesbar.

## Lokal ausführen

Einfach `index.html` im Browser öffnen. Für die zuverlässigste Fenster-Synchronisation über einen lokalen Server starten:

```bash
python3 -m http.server 8000
# dann http://localhost:8000/
```

## Technik

Eine einzige `index.html` — Vanilla HTML/CSS/JS, kein Build-Schritt. Einzige externe Abhängigkeit: KaTeX (per CDN, nur für die Formeldarstellung).
