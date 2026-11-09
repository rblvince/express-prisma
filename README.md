# Express Prisma

Esercizi Boolean 31, 32 e 33: server Express 5 con Prisma 7 e MySQL. Modelli `Book` e `Category` (1-N), rotte `/books`.

## Setup

```sh
pnpm install
cp .env.example .env     # poi imposta DATABASE_URL (utente e password MySQL)
pnpm exec prisma migrate dev
pnpm exec prisma db seed # categorie di prova, rilanciabile senza duplicati
pnpm dev
```

Il database `express_prisma` lo crea la migrazione. Il server parte sulla porta di `PORT` (ripiego 3000).

## Rotte

| Metodo | URL | Risposta |
| --- | --- | --- |
| GET | `/` | Testo di benvenuto |
| GET | `/books` | Lista JSON dei libri con categoria (`200`) |
| GET | `/books/:id` | Libro JSON (`200`); `400` se l'id non è un intero positivo, `404` se assente |
| POST | `/books` | Crea un libro (`201`); `400` se mancano `title`, `author`, `price` o i valori non sono validi |
| PUT / PATCH / DELETE | `/books/:id` | Segnaposto JSON, da sviluppare; `400` se l'id non è valido |
| qualunque altra | | `404` JSON |
| errore server | | `500` JSON generico |

Body di POST: `{ "title": "...", "author": "...", "price": 12.5, "description": "...", "categoryId": 1 }` (`description` e `categoryId` opzionali).

Limiti: `title` e `author` al massimo 191 caratteri, `price` tra 0 e 999999.99. `description` al massimo 65535 byte. Il server ascolta solo su `127.0.0.1`. Nelle risposte `price` arriva come stringa (`"12.5"`): Prisma restituisce i `Decimal` così per non perdere precisione.
