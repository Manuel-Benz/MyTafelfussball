# ⚽ Tafelfussball

Ein digitales Quizspiel im Stil von „Tafelfussball" für den Unterricht — komplett clientseitig, kein Backend, keine Kosten. Läuft in jedem modernen Browser.

**Live:** https://manuel-benz.github.io/tafelfussball/

## Idee

Die Lehrperson stellt Fragen. Die richtig antwortende Mannschaft bewegt den Ball ein Feld Richtung gegnerisches Tor. Wer zuerst trifft, bekommt einen Punkt.

## Zwei Ansichten, ein Gerät

Öffne die App und wähle im Launcher eine Ansicht (jeweils in einem eigenen Fenster):

- **📺 Beamer-Ansicht** (`?view=beamer`) — für die Klasse auf dem Projektor. Zeigt Spielfeld, Ball, Punkte und Frage. **Nie die Lösung.**
- **🎛️ Lehrer-Ansicht** (`?view=lehrer`) — auf dem Laptop. Steuerung, Aufgabenverwaltung und die Lösung.

Beide Fenster synchronisieren sich live über `BroadcastChannel`, mit `localStorage` als Fallback und Persistenz.

## Aufgaben aus PDF importieren

1. Aufgabenblatt (PDF) in einem KI-Tool (Claude/ChatGPT) öffnen.
2. Diesen Prompt zusammen mit dem PDF einfügen:

   > Extrahiere alle Übungsaufgaben und deren Lösungen aus diesem PDF. Formatiere die Ausgabe exakt so: Für jede Aufgabe eine Zeile 'F: &lt;Frage&gt;', eine Zeile 'A: &lt;Antwort&gt;', dann eine Zeile mit nur '---' als Trennzeichen. Mathematische Formeln als LaTeX in Dollarzeichen schreiben ($...$ für inline, $$...$$ für abgesetzt). Keine zusätzlichen Erklärungen oder Nummerierungen. Gib das Ergebnis als reinen Text aus, den ich als .txt-Datei speichern kann.

3. Die Ausgabe in der Lehrer-Ansicht unter „Import" einbringen — auf drei Wegen:
   - Text **direkt einfügen** ins Feld, oder
   - eine **`.txt`-Datei** aufs Fenster **ziehen** (Drag & Drop), oder
   - im Import-Panel auf die Ablage-Fläche **klicken** und die Datei auswählen.

   Die Aufgaben werden jeweils automatisch geparst und angehängt.

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
