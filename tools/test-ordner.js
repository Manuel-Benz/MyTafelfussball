// Headless-Prüfung des Ordner-Wegs (design/js/my-ablage.js + Format von MyTafelfussball):
// die OPFS-Wurzel gilt als verbundener Ordner (Handle in IndexedDB mytafelfussball → kv →
// dir), dann Spiegeln, Nachlesen, Löschen im «Finder», alte Datei ohne «# Titel»,
// Ordner umbenennen ohne Änderung, Einfügen mit Vorschau, Ordner ziehen, ZIP, Sicherung,
// Teilen und Link öffnen — alles auf der Startseite; dazu die Kacheln Beamer/Lehrer:in,
// «von Hand» und Speichern im Lehrer:innen-Fenster. Nach jedem ./sync.sh tafel laufen lassen:
//   node tools/test-ordner.js
// Braucht Playwright samt Chromium (PLAYWRIGHT=<Pfad zum Paket>, falls nicht
// installiert) und Internet (KaTeX vom CDN).
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const A = require('../design/js/my-ablage.js');
const PORT = 8773;
const base = `http://127.0.0.1:${PORT}/index.html`; // Startseite: Erstellen und Sammlung
const KEY = 'tafelfussball_sammlung';
const results = [];
const check = (ok, msg) => { results.push(ok); console.log(`${ok ? '✅' : '❌'} ${msg}`); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const ok = (p) => p.then(() => true, () => false); // eingetreten bis zum Zeitlimit?

(async () => {
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'],
    { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
  process.on('exit', () => server.kill());
  for (let i = 0; i < 100; i++) { try { await fetch(base); break; } catch { await wait(50); } }
  const browser = await chromium.launch();
  const page = await browser.newPage({ acceptDownloads: true, viewport: { width: 1280, height: 1600 } }); // hoch genug: Ziehen ohne Scrollen
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  // prompt/confirm: Vorgabe bestätigen (ohne Argument käme bei prompt ein leerer Text zurück)
  let prompts = 0, answer = null; // answer: nächste Antwort auf ein prompt, sonst die Vorgabe
  page.on('dialog', (d) => {
    if (d.type() === 'prompt') prompts++;
    d.accept(d.type() === 'prompt' && answer !== null ? answer : d.defaultValue());
    answer = null;
  });
  await page.goto(base);
  // Ausgangslage: drei Sets nur im Browser, OPFS leer und als Ordner verbunden
  await page.evaluate(async (KEY) => {
    const root = await navigator.storage.getDirectory();
    for await (const name of root.keys()) await root.removeEntry(name, { recursive: true });
    localStorage.setItem(KEY, JSON.stringify({
      sets: [
        { id: 's1', title: 'Unité 3 – La maison', dir: 'Französisch/Klasse 2', tasks: [{ q: 'das Haus', a: 'la maison' }] },
        { id: 's2', title: 'Lektion 12', dir: '', tasks: [{ q: 'lieben', a: 'amare' }] },
        { id: 's3', title: 'Lektion 2', dir: '', tasks: [{ q: 'sein', a: 'esse' }] },
      ],
      folders: [],
    }));
    await MyAblage.handleStore('mytafelfussball').save(root); // derselbe Weg wie die App
  }, KEY);
  const files = () => page.evaluate(async () => {
    const out = [];
    const walk = async (h, p) => { for await (const [n, e] of h.entries()) { if (e.kind === 'directory') { out.push(p + n + '/'); await walk(e, p + n + '/'); } else out.push(p + n); } };
    await walk(await navigator.storage.getDirectory(), '');
    return out.sort();
  });
  const store = () => page.evaluate((KEY) => JSON.parse(localStorage.getItem(KEY)), KEY);
  // Warten auf den Zustand: `fn` läuft im Browser, bis es wahr liefert (selbst abgefragt,
  // weil page.waitForFunction eine async-Funktion sofort als erfüllt nimmt)
  const until = async (fn, arg, ms = 15000) => {
    for (const end = Date.now() + ms; Date.now() < end; await wait(100)) if (await page.evaluate(fn, arg)) return true;
    throw new Error('Zeitlimit');
  };
  // fertig geschrieben = vorhanden und nicht leer
  const hasFiles = (...paths) => until(async (paths) => {
    const root = await navigator.storage.getDirectory();
    for (const p of paths) {
      let h = root;
      const parts = p.split('/');
      try {
        for (const d of parts.slice(0, -1)) h = await h.getDirectoryHandle(d);
        if (!(await (await h.getFileHandle(parts.at(-1))).getFile()).size) return false;
      } catch { return false; }
    }
    return true;
  }, paths);
  const storeHas = (title, want = true) => until(([KEY, t, w]) => (JSON.parse(localStorage.getItem(KEY)).sets.some((s) => s.title === t)) === w, [KEY, title, want]);
  const dirIs = (id, dir) => until(([KEY, id, dir]) => JSON.parse(localStorage.getItem(KEY)).sets.find((x) => x.id === id).dir === dir, [KEY, id, dir]);
  const refocus = () => page.evaluate(() => window.dispatchEvent(new Event('focus')));
  const readText = (p) => page.evaluate(async (p) => (await (await (await navigator.storage.getDirectory()).getFileHandle(p)).getFile()).text(), p);

  await page.reload();
  const written = await ok(hasFiles('Französisch/Klasse 2/Unite 3 - La maison.txt', 'Lektion 12.txt', 'Lektion 2.txt'));
  check(written, `Sets aus dem Browser landen im Ordner, Namen ohne Umlaute (${(await files()).join(', ')})`);
  const text = await readText('Lektion 12.txt').catch(() => '');
  check(text.startsWith('# Lektion 12\n') && text.includes('F: lieben\nA: amare'), 'Datei trägt «# Titel» und die Aufgaben');

  // Alte Datei ohne «# Titel», Umlaut im Namen: Titel aus dem Dateinamen, Datei bleibt, wie sie heisst
  await page.evaluate(async () => {
    const w = await (await (await navigator.storage.getDirectory()).getFileHandle('Hauptstädte.txt', { create: true })).createWritable();
    await w.write('F: Schweiz\nA: Bern\n---\n');
    await w.close();
  });
  await refocus();
  await storeHas('Hauptstädte');
  await wait(300);
  const st = await store();
  const old = st.sets.find((s) => s.title === 'Hauptstädte');
  const f = await files();
  check(!!old && !f.includes('Hauptstaedte.txt') && (await readText('Hauptstädte.txt')) === 'F: Schweiz\nA: Bern\n---\n',
    'alte Datei: Titel aus dem Namen, weder umbenannt noch umgeschrieben');

  // Im Finder gelöscht → beim Fokus weg
  await page.evaluate(async () => (await navigator.storage.getDirectory()).removeEntry('Lektion 12.txt'));
  await refocus();
  check(await ok(storeHas('Lektion 12', false)), 'im Ordner gelöschtes Set verschwindet');

  // Ordner umbenennen, Vorgabe unverändert bestätigen: nichts darf umziehen
  await page.locator('.coll-row.folder[data-dir="Französisch"] [data-act="renameDir"]').click({ force: true });
  await wait(300);
  const fr = (await store()).sets.find((s) => s.id === 's1');
  check(prompts === 1 && fr && fr.dir === 'Französisch/Klasse 2' && !(await files()).some((p) => p.startsWith('Franzoesisch')),
    `Umbenennen ohne Änderung lässt den Ordner stehen (${fr && fr.dir})`);

  // Unterordner unter einem Umlaut-Ordner umbenennen: der Elternordner bleibt, wie er heisst
  answer = 'Französisch/Klasse 3';
  await page.locator('.coll-row.folder[data-dir="Französisch/Klasse 2"] [data-act="renameDir"]').click({ force: true });
  const sub = await ok(dirIs('s1', 'Französisch/Klasse 3'));
  const afterSub = await store();
  check(sub && !afterSub.folders.concat(afterSub.sets.map((x) => x.dir)).some((d) => d.startsWith('Franzoesisch')),
    'Unterordner umbenannt, Elternordner «Französisch» bleibt');

  // Neuer Ordner mit Pfad: bestehender Teil bleibt, neuer ohne Umlaut
  answer = 'französisch/Übungen';
  await page.click('#newFolder');
  const nf = (await store()).folders;
  check(nf.includes('Französisch/Uebungen') && !nf.some((d) => d.startsWith('Franzoesisch') || d.startsWith('französisch')),
    `Neuer Ordner im bestehenden Ordner (${nf.join(', ')})`);

  // Set erstellen: Text einfügen → Vorschau → in die Sammlung
  check(!(await page.evaluate(() => document.getElementById('createSec').open)) && (await page.textContent('#createSec > summary')) === 'Tafelfussball erstellen',
    'Kasten «Tafelfussball erstellen» steht zu');
  await page.click('#createSec > summary');
  check(await page.isVisible('#copyPrompt') && await page.isVisible('#byHand') && !(await page.$('#createSec input[type=file]')),
    'offen: KI-Prompt, ein Feld, «von Hand», kein «Datei wählen»');
  await page.fill('#pasteBox', '```\n# Paste: Test\n\nF: 2 + 2\nA: 4\nmit Folgezeile\n---\nQuatsch\nF: 3 + 3\nA: 6\n---\n```');
  await page.locator('#preview').waitFor(); // entprellt: erscheint kurz nach dem Tippen
  const prevOk = await page.locator('#preview').isVisible() && (await page.inputValue('#previewTitle')) === 'Paste: Test'
    && (await page.locator('#previewList li').count()) === 2;
  const stray = await page.locator('#previewStray').innerText();
  check(stray.includes('8: «Quatsch»') && !stray.includes('Folgezeile'), `Vorschau meldet nur die unverstandene Zeile (${stray})`);
  await page.click('#previewSave');
  const pasted = await ok(storeHas('Paste: Test'));
  check(prevOk && pasted && (await page.locator('#preview').isHidden()), 'Eingefügter Text: Vorschau mit Titel und 2 Fragen, dann in der Sammlung');
  check(await ok(hasFiles('Paste- Test.txt')) && (await readText('Paste- Test.txt')).startsWith('# Paste: Test\n')
    && !(await readText('Paste- Test.txt')).includes('```'),
    'Eingefügtes Set im Ordner: Titel mit «:» bleibt, Datei ohne Sonderzeichen und ohne Code-Block-Zäune');

  // Ordner ziehen: «Französisch/Klasse 3» auf die Hauptebene (ein Set dort meint dessen Ordner)
  await page.locator('.coll-row.folder[data-dir="Französisch/Klasse 3"]').dragTo(page.locator('.coll-row.set', { hasText: 'Lektion 2' }));
  const moved = await ok(dirIs('s1', 'Klasse 3'));
  check(moved && await ok(hasFiles('Klasse 3/Unite 3 - La maison.txt')), 'Ordner samt Inhalt auf die Hauptebene gezogen, Datei zieht mit');

  // ZIP und Sicherung
  const zipDl = page.waitForEvent('download', { timeout: 20000 });
  await page.click('#zipAll');
  check((await zipDl.then((d) => d.suggestedFilename(), () => '')) === 'MyTafelfussball.zip', 'ZIP aller Sets');
  const bakDl = page.waitForEvent('download');
  await page.click('#backupSave');
  const bak = JSON.parse(require('fs').readFileSync(await (await bakDl).path(), 'utf8'));
  check(bak.app === 'mytafelfussball' && bak.sets.length === (await store()).sets.length && bak.sets.every((x) => !('disk' in x) && !('file' in x)),
    `Sicherung mit allen Sets, ohne Ordner-Buchführung (${bak.sets.length})`);
  // Sicherung einlesen: ein gelöschtes Set kommt zurück, die anderen werden nicht verdoppelt
  await page.locator('.coll-row.set', { hasText: 'Lektion 2' }).locator('[data-act="del"]').click({ force: true });
  await storeHas('Lektion 2', false);
  await page.setInputFiles('#backupInput', await (await bakDl).path());
  const back = await ok(storeHas('Lektion 2'));
  check(back && (await store()).sets.length === bak.sets.length, 'Sicherung einlesen ergänzt das gelöschte Set, ohne Doppel');

  // Teilen: Dialog mit Link und QR-Code
  await page.locator('.coll-row.set', { hasText: 'Paste: Test' }).locator('[data-act="share"]').click({ force: true });
  await until(() => !!document.querySelector('#shareQr svg, #shareQr p'));
  const shareUrl = await page.inputValue('#shareUrl');
  check(shareUrl.includes('index.html#t=1.') && (await page.locator('#shareQr svg').count()) === 1, 'Teilen zeigt Link (auf die Startseite) und QR-Code');
  await page.click('#shareClose');

  // Link öffnen: das Set kommt in die Sammlung, der Hash verschwindet
  const data = await A.packLink(['Aus dem Link', [['Hauptstadt der Schweiz', 'Bern']]]);
  await page.goto('about:blank'); // sonst nur ein Hash-Wechsel ohne Neuladen
  await page.goto(`${base}#t=${data}`);
  const linked = await ok(storeHas('Aus dem Link'));
  check(linked && !(await page.evaluate(() => location.hash)), 'Link öffnen: Set in der Sammlung, Adresse wieder ohne #t=');
  // Ein alter Link aufs Lehrer:innen-Fenster geht weiter und lädt das Set dort
  const oldData = await A.packLink(['Alter Link', [['Hauptstadt von Italien', 'Rom']]]);
  await page.goto('about:blank');
  await page.goto(`${base}?view=lehrer#t=${oldData}`);
  check(await ok(storeHas('Alter Link')) && await ok(until(() => JSON.parse(localStorage.getItem('tafelfussball_state_v1')).tasks.some((t) => t.a === 'Rom'))),
    'alter Link (?view=lehrer) legt ab und lädt');
  await page.goto(base);

  // Kacheln: Beamer bzw. Lehrer:in laden das Set und öffnen ihr Fenster
  const row = page.locator('.coll-row.set', { hasText: 'Lektion 2' });
  check(await row.locator('[data-act="beamer"]').isVisible() && await row.locator('[data-act="lehrer"]').isVisible(), 'Set-Zeile mit den Kacheln Beamer und Lehrer:in');
  const [beamer] = await Promise.all([page.context().waitForEvent('page'), row.locator('[data-act="beamer"]').click()]);
  await beamer.waitForLoadState();
  const st1 = await page.evaluate(() => JSON.parse(localStorage.getItem('tafelfussball_state_v1')));
  check(/view=beamer/.test(beamer.url()) && st1.tasks.map((t) => t.q).join() === 'sein', `Beamer: Set geladen, Beamer-Fenster offen (${beamer.url()})`);
  await page.bringToFront();
  const [lehrer] = await Promise.all([page.context().waitForEvent('page'), row.locator('[data-act="lehrer"]').click()]);
  await lehrer.waitForLoadState();
  lehrer.on('pageerror', (e) => errors.push(e.message));
  lehrer.on('dialog', (d) => d.accept(d.type() === 'prompt' ? 'Von Hand 1' : undefined));
  check(/view=lehrer/.test(lehrer.url()) && await lehrer.locator('.task-item').count() === 1 && await lehrer.isHidden('#collTree'),
    'Lehrer:in: Fenster mit dem Set, ohne Sammlung');
  check(await page.locator('.coll-row.set.loaded', { hasText: 'Lektion 2' }).count() === 1, 'Startseite markiert das geladene Set');

  // ＋ am Ordner: Kasten mit diesem Ordner; von Hand: leere Liste im Lehrer:innen-Fenster,
  // «Speichern» legt sie in diesem Ordner ab — die Startseite zeigt sie gleich
  await page.bringToFront();
  await page.evaluate(() => { document.getElementById('createSec').open = false; });
  await page.locator('.coll-row.folder[data-dir="Klasse 3"] [data-act="createHere"]').click({ force: true });
  check(await page.evaluate(() => document.getElementById('createSec').open) && await page.inputValue('#createDir') === 'Klasse 3', '＋ am Ordner öffnet den Kasten mit diesem Ordner');
  await page.click('#byHand');
  await lehrer.waitForFunction(() => !document.querySelector('.task-item'));
  await lehrer.fill('#newQ', '5 + 5'); await lehrer.fill('#newA', '10'); await lehrer.click('#addTask');
  await lehrer.click('#saveSet');
  check(await ok(until(() => JSON.parse(localStorage.getItem('tafelfussball_sammlung')).sets.some((x) => x.title === 'Von Hand 1' && x.dir === 'Klasse 3'))),
    'von Hand: im Lehrer:innen-Fenster getippt und gespeichert, liegt im gewählten Ordner');
  check(await ok(page.locator('.coll-row.set', { hasText: 'Von Hand 1' }).waitFor({ timeout: 5000 })), 'Startseite zeigt das neue Set sofort');
  check(await ok(hasFiles('Klasse 3/Von Hand 1.txt')), 'und es liegt im Ordner');

  // Eine Datei ins Feld gezogen: Text sichtbar im Feld, Vorschau mit Dateiname als Titel
  await page.evaluate(() => {
    const dt = new DataTransfer();
    dt.items.add(new File(['F: Ohne Titel?\nA: ja\n'], 'Gezogen.txt', { type: 'text/plain' }));
    document.getElementById('pasteBox').dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
  });
  await page.locator('#preview').waitFor();
  check((await page.inputValue('#pasteBox')).includes('Ohne Titel?') && await page.inputValue('#previewTitle') === 'Gezogen', 'Datei ins Feld: Text im Feld, Titel aus dem Dateinamen');

  check(errors.length === 0, `keine Fehler in der Konsole${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await browser.close();
  const allOk = results.every(Boolean);
  console.log(allOk ? 'ALLES OK' : 'FEHLGESCHLAGEN');
  process.exit(allOk ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
