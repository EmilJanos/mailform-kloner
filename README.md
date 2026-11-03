# mailform-kloner

Redigerbare sider i mailform-stil (`ole`, `teamjk`, `vores`, `missing`) med en visuel editor og en kontaktformular. Indhold ligger i Supabase, så ejerne selv kan redigere.

**Skal projektet overdrages til Ole?** Læs `HANDOVER-OLE.md`.

## Mapper
- `web/` – selve løsningen, udgives på Vercel (root directory `web`)
  - `index.html` viser en side (`/<adresse>`), inkl. formular med valgfrit telefonnummer
  - `edit.html` er login og sideliste, `visual.html` er den visuelle editor
  - `common.js`, `config.js`, `mf-text.css`, `vercel.json`
  - `assets/`, `asset-sources.json`, `build-assets.mjs` – stilark til siderne
- `supabase/migrations/` – tabeller, adgangsregler og Storage (`0001_init.sql`, `0002_media.sql`)
- `supabase/functions/send-form/` – modtager formularen, gemmer beskeden, sender mail via Resend, og spærrer mod misbrug
- `seed/` – siderne som SQL og JSON (`tools/import.js` kan lave nye)
- `ole/`, `teamjk/`, `shared/` – ældre statiske referencekopier
- `content-audit.json` – optælling af indhold pr. side

## Opsætning (i et EGET Supabase-projekt)
1. Kør `supabase/migrations/0001_init.sql` og `0002_media.sql` (SQL Editor).
2. Kør `seed/<side>.sql` for hver side.
3. Auth, URL Configuration: sæt Site URL til jeres adresse.
4. Udfyld `web/config.js` (projekt-URL og publishable key).
5. Deploy `supabase/functions/send-form` (slå "Verify JWT" fra).
6. Mail: opret konto hos Resend, verificér et domæne, og læg `RESEND_API_KEY` og `MAIL_FROM` som secrets.
7. Sæt modtager og ejer, se `HANDOVER-OLE.md`.
8. Log ind på `/edit.html` og redigér.
9. Hosting: Vercel-projekt med root directory `web`. Hvert push til `main` udgiver.

## Sikkerhed
- Gem aldrig nøgler i repoet. Kun den offentlige publishable key står i `web/config.js`.
- Alt HTML renderes og gemmes gennem DOMPurify.
- Formularen har en skjult fælde og en grænse på 3 beskeder pr. afsender på 10 minutter og 30 pr. side i timen.

## Nyt indhold fra andre kilder
`node tools/import.js <fil.html> <adresse> "<titel>"` laver `seed/<adresse>.sql`. Læs filen igennem, før den lægges i databasen.
