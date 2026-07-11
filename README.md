# ⚽ MyTafelfussball

Ein digitales Quizspiel im Stil von „Tafelfussball" für den Unterricht — komplett clientseitig, kein Backend, keine Kosten. Läuft in jedem modernen Browser.

**Live:** https://manuel-benz.github.io/MyTafelfussball/

## Idee

Die Lehrperson stellt Fragen. Die richtig antwortende Mannschaft bewegt den Ball ein Feld Richtung gegnerisches Tor. Wer zuerst trifft, bekommt einen Punkt.

## Zwei Ansichten, ein Gerät

Öffne die App und wähle im Launcher eine Ansicht (jeweils in einem eigenen Fenster):

- **📺 Beamer-Ansicht** (`?view=beamer`) — für die Klasse auf dem Projektor. Zeigt Spielfeld, Ball, Punkte und Frage. **Nie die Lösung.**
- **🎛️ Lehrer:innen-Ansicht** (`?view=lehrer`) — auf dem Laptop. Steuerung, Aufgabenverwaltung und die Lösung.

Beide Fenster synchronisieren sich live über `BroadcastChannel`, mit `localStorage` als Fallback und Persistenz.

## Bedienung

- **Ein Button führt durchs Spiel**: „▶ Spiel starten" → „👁 Antwort aufdecken" → „Nächste Frage ▶" → … Die aufgedeckte Antwort erscheint auch auf dem Beamer.
- **Jede Frage kommt genau einmal pro Runde** — auch im Zufallsmodus (Reihenfolge einstellbar in den Einstellungen). Sind alle durch, zeigt die App „🏁 Runde beendet"; „Fragen zurücksetzen" startet eine neue Runde.
- **⌘/Strg + →** — derselbe Schritt per Tastatur: Frage zeigen, Antwort aufdecken, nächste Frage, … So klickt man sich durchs ganze Spiel.
- **⌘/Strg + ←** — Frage zurück (Verlauf, funktioniert auch im Zufallsmodus).
- **Punkt Team 1 / Punkt Team 2** oder **Pfeiltasten ← / →** — bewegen den Ball Richtung gegnerisches Tor. Hinter der letzten Station fällt er ins Tor: Punkt, Jubel, zurück zur Mitte.
- **L** — Lösung auf-/verdecken (Abkürzung).
- **Zurücksetzen** (unten in der Box „Spiel"): „Punkte zurücksetzen", „Fragen zurücksetzen" (neue Runde, Aufgaben bleiben) und „Alles zurücksetzen" (Punkte, Ball und Fragerunde in einem Klick; die Aufgabenliste bleibt erhalten).

## Sprache

In den Einstellungen der Lehrer:innen-Ansicht lässt sich die Oberfläche zwischen **Deutsch und Englisch** umschalten (DE/EN) — Beamer-Ansicht und Startseite wechseln mit. Der Import versteht `F:` und `Q:` als Frage-Marker.

## Darstellung

Ebenfalls in den Einstellungen: **Auto / Hell / Dunkel**. „Auto" folgt der Systemeinstellung (dunkles Blau bzw. warmes Sandweiss), Hell/Dunkel erzwingen das jeweilige Schema — synchron in beiden Fenstern.

## Aufgaben aus PDF importieren

1. Diesen Prompt (in der App: Button „KI-Prompt kopieren") zusammen mit dem Aufgabenblatt (PDF) in ein KI-Tool (Claude/ChatGPT) einfügen:

   > Extrahiere alle Übungsaufgaben und deren Lösungen aus diesem PDF. Formatiere sie exakt so: Für jede Aufgabe eine Zeile 'F: &lt;Frage&gt;', eine Zeile 'A: &lt;Antwort&gt;', dann eine Zeile mit nur '---' als Trennzeichen. Mathematische Formeln als LaTeX in Dollarzeichen schreiben ($...$ für inline, $$...$$ für abgesetzt). Keine zusätzlichen Erklärungen oder Nummerierungen. Erstelle daraus direkt eine .txt-Datei zum Herunterladen; falls du Dateien direkt speichern kannst, lege sie in meinen Downloads oder auf dem Desktop ab.

2. Die erhaltene `.txt`-Datei in der Lehrer:innen-Ansicht einbringen (Box „Aufgaben" → Import):
   - die Datei aufs Fenster **ziehen** (Drag & Drop), oder
   - auf die Ablage-Fläche **klicken** und die Datei auswählen.

   Die Aufgaben werden automatisch geparst und angehängt. Einzelne Aufgaben lassen sich auch von Hand unter „Aufgabe hinzufügen" erfassen.

Format:

```
F: Was ist die Hauptstadt der Schweiz?
A: Bern
---
F: Wie viel ist 7 × 8?
A: 56
---
```

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
