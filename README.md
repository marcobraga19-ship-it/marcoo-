# Marco Braga — portfolio Astro

Portfolio statico orizzontale. L’ultima direzione richiesta prevale sul brief iniziale: Neue Haas Grotesk (Display Regular/Thin e Text Regular), maiuscole normali, tracking −0.025em; eliminati sfaldamento delle lettere, scanline, blur, luci e sfondi al passaggio. Restano inerzia di navigazione e apertura breve dei progetti. Nero #000, testo #f2f2f0, secondario #6e6e68, griglia #2c2c29.

## Avvio

Richiede Node.js 22 o successivo e pnpm 10.

```sh
pnpm install
pnpm dev
```

## Compilazione e anteprima

```sh
pnpm build
pnpm preview
```

La cartella `dist` contiene il sito statico. Nell’ambiente Windows ristretto di Codex, prima della compilazione impostare `ASTRO_TELEMETRY_DISABLED=1` e `LOCAL_BUILD_WITHOUT_SCAN=1`: evita una scansione delle directory antenate che l’ambiente impedisce. Il risultato è lo stesso sito statico. Per una verifica locale qui usare la compilazione e `preview`.

## Struttura

```text
src/content/projects/<progetto>/index.md   Testi, metadati e blocchi
src/content/projects/<progetto>/*          Immagini accanto al testo
src/content.config.ts                     Schema e validazione
src/components/Portfolio.jsx              Interfaccia React
src/styles/portfolio.css                  Sistema grafico e responsive
src/lib/projects.ts                       Ottimizzazione immagini e lettura contenuti
src/pages/index.astro                     Home
src/pages/projects/[slug].astro           Pagine statiche dei progetti
src/pages/preview-data.json.ts             Dati per l’anteprima JSX separata
public/                                   Favicon e futuri audio/video
src/assets/fonts/                        Font WOFF2 locali
licenses/Neue-Haas-READ-ME.txt             Provenienza e stato dei font
```

## Aggiungere un progetto

Creare una cartella in `src/content/projects`, copiarvi le immagini e aggiungere un `index.md`. Il frontmatter usa JSON, che è anche YAML valido. Un esempio non pubblicato si trova in `templates/project.md.example`. Non occorre modificare la navigazione né il componente. `order` decide l’ordinamento; `archive: true` colloca il lavoro nell’archivio.

Tipi: `architecture`, `interior`, `photography`, `visual`, `sound`.
Blocchi: `text`, `image`, `drawing`, `gallery`, `video`, `audio`.

Per architettura/interni ordinare i blocchi come testo → disegni → render → modelli. Per fotografia usare `gallery`; per arte, `image`, `gallery` o `video`; per suono, `text` e `audio`. Non esiste riproduzione automatica. I file audio/video locali vanno in `public/media/`, con `src: "media/nome-file.mp3"`. Le immagini usano percorsi relativi al markdown. Le immagini tecniche SVG restano vettoriali; quelle raster hanno versioni responsive WebP. I riquadri di presentazione hanno dimensioni uniformi e preservano le proporzioni dell’opera.

## Esportare l’anteprima JSX

```sh
pnpm build
pnpm export:jsx
```

L’esportazione aggiorna la cartella sorella `anteprima-jsx` con il componente, i dati e le immagini. La fonte da mantenere è questa struttura Astro; non riscrivere a mano il JSON dell’anteprima.

## GitHub

Il progetto è pronto per essere caricato in un repository. `node_modules`, `dist` e `.astro` sono esclusi. Conservare `pnpm-lock.yaml`. Gli originali ad alta risoluzione sono fuori dal progetto, nella cartella sorella `materiali-estratti`, per non appesantire il repository.

Repository del progetto: https://github.com/marcobraga19-ship-it/marcoo-. Il caricamento dei sorgenti non attiva automaticamente GitHub Pages e non modifica il dominio esistente. Per GitHub Pages impostare `SITE_URL` con l’origine e, se si usa una repository page, `BASE_PATH=/nome-repository/` prima della compilazione; per il dominio marcobraga.net il percorso base è `/`. Il caricamento del codice su GitHub e la pubblicazione del sito sono due passaggi distinti.

## Verifiche editoriali

Sede Milano e stage Fenaroli 2022 confermati da Marco. Date dei primi tre laboratori indicate come Year I/II/III: il materiale non fornisce un anno di progetto univoco. Le descrizioni brevi sono proposte da rileggere. Il dettaglio e l’elenco dei materiali mancanti sono nel documento di consegna.

## Revisione tipografica

Composizione Swiss con allineamenti a sinistra, griglia modulare fissa, titoli Regular, nome e parole-pagina Thin, testi Regular e numeri Thin. Tracking −0.025em. Spaziatura verticale gestita da righe e colonne; negli schermi bassi i testi lunghi proseguono in orizzontale. Miniature uniformi BW, con passaggio a colore in 220 ms su hover mouse e focus da tastiera; riquadri interni uniformi. Rimosse tutte le chiusure “Thank you, Marco”. Nessuna animazione autonoma.

I file forniti sono marcati Trial. I WOFF2 mantengono disegno e metadati originali e servono per la revisione locale: prima di pubblicare il sito o un repository pubblico, sostituirli con i webfont di produzione e verificare la relativa licenza. Si usano soltanto Regular (Roman 400) e Thin (285), senza grassetto sintetico.

## Scene Spline

`SplineScene.jsx` usa il runtime ufficiale 2.0.55 con caricamento dinamico. La home usa `7qFqfBQ8f2h65fhd`; i progetti di architettura/interni aperti usano `pZWQ3IsNG4BMm9Bh`; i progetti con `archive: true` usano `r0ejOtfenr4wyggd`. Le URL complete sono raccolte in `SCENES` nello stesso componente.

Si monta una sola scena per volta. Il canvas sta dietro ai contenuti e non intercetta click o trascinamento. Le interazioni Spline ricevono gli eventi globali del mouse. La scena si ferma dopo 650 ms senza gesti e quando la scheda è nascosta; al cambio pagina viene smontata e liberata. Movimento ridotto: scene non caricate. Eventuali contenuti HTML delle scene rimangono nella sandbox del runtime. Il sito resta navigabile se la scena non si carica o WebGL non è disponibile.

Le scene arrivano dai tre indirizzi Spline forniti e richiedono rete; il runtime viene incluso nella compilazione. Il nero, la griglia e la tipografia restano locali. Su schermi touch le miniature restano BW e il tocco apre direttamente il progetto: nessun hover bloccante.

## Apertura aggiornata

La frase iniziale occupa una sola schermata e scorre orizzontalmente con la pagina, accompagnata da una dissolvenza legata allo scroll. Nessuna deformazione dei caratteri, ripetizione di parole, scena bloccata o traslazione verticale. Nome e sezioni entrano dopo la frase; restano gli allineamenti comuni desktop/mobile.
