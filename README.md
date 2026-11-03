# mailform-kloner

Sider i mailform-stil (ole, teamjk, nye klonsider). Indhold ligger i Supabase, så ejerne selv kan redigere.

## Mapper
- `ole/`, `teamjk/` – statiske kopier (referenceudgave, hotlinker billeder)
- `shared/style.css` – fælles stil (kopi ligger i `web/style.css`)
- `web/` – den rigtige side: `index.html?p=<adresse>` viser, `edit.html` redigerer
- `supabase/migrations/` – tabeller og sikkerhed
- `supabase/functions/send-form/` – modtager formularen
- `seed/` – siderne som SQL (lavet med `tools/import.js`)

## Opsætning (i et EGET Supabase-projekt, ikke Lamigo)
1. Kør `supabase/migrations/0001_init.sql` (SQL Editor eller via Claude).
2. Kør `seed/ole.sql` og `seed/teamjk.sql`.
3. Auth → URL Configuration: sæt Site URL til jeres adresse.
4. Udfyld `web/config.js` (URL + anon-nøgle).
5. Deploy `supabase/functions/send-form`.
6. For mails: opret konto hos Resend, læg `RESEND_API_KEY` (og evt. `MAIL_FROM`) som secret.
7. Log ind på `web/edit.html`, kør derefter `seed/claim.sql` så siderne bliver dine.
8. Læg `web/` på hosting (Vercel/Netlify/GitHub Pages).

## Nyt indhold fra andre kilder
`node tools/import.js <fil.html> <adresse> "<titel>"` laver `seed/<adresse>.sql`. Tjek filen igennem før den lægges i databasen.
- Hosting: Vercel-projekt `mailform-kloner` bygger `web/` ved hvert push til main.
