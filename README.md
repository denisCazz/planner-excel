# Tabella Semplice

Editor tabellare semplificato, intuitivo e ottimizzato per mobile. Alternativa leggera a Excel per creare tabelle con righe, colonne, allineamento e stili grafici.

## Funzionalità

- **Editor tabellare** — Crea tabelle con righe e colonne, modifica le celle con un doppio tap
- **Stili** — Grassetto, corsivo, allineamento (sinistra/centro/destra), colore testo e sfondo
- **Import Excel** — Carica file `.xlsx` e `.xls` per precompilare la tabella
- **Export Excel** — Scarica la tabella in formato Excel
- **Salvataggio JSON** — I dati vengono salvati automaticamente nel browser (localStorage) e possono essere scaricati/caricati come file JSON
- **Mobile-first** — Pulsanti grandi, interfaccia chiara, utilizzabile anche da telefono

## Avvio

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## Build produzione

```bash
npm run build
npm start
```

## Tecnologie

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- SheetJS (xlsx) per import/export Excel

## Struttura dati JSON

```json
{
  "name": "La mia tabella",
  "rows": 5,
  "cols": 4,
  "cells": [
    [
      {
        "value": "Testo",
        "style": {
          "bold": false,
          "italic": false,
          "align": "left",
          "textColor": "#1a1a1a",
          "backgroundColor": "#ffffff"
        }
      }
    ]
  ],
  "updatedAt": "2026-07-12T00:00:00.000Z"
}
```
