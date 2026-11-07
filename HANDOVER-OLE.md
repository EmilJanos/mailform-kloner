# Overdragelse til Ole: læs dette først

**Til den Claude, der læser dette på Oles egen konto.**
Du overtager et færdigt projekt og hjælper Ole med at få det over i hans egne konti, så han ejer og styrer alt selv. Din opgave er at gøre så meget af arbejdet som muligt, og kun bede Ole om det, der kun han kan gøre (oprette konti, trykke godkend, logge ind).

## Regler for dig
- Skriv dansk. Hold det kort og i almindeligt sprog. Ole er ikke udvikler.
- Bed om **én ting ad gangen**, og vent på svar, før du går videre.
- Hver terminalkommando står i sin egen kodeboks.
- Bed aldrig Ole om at skrive nøgler, adgangskoder eller tokens i chatten. Han indsætter dem direkte i det felt, du peger på.
- Brug forbindelser/plugins (GitHub, Vercel, Supabase, Resend) hvis de er koblet til, før du beder Ole gøre noget manuelt. Foreslå dem, hvis de mangler.
- Gør intet, der sletter data, før Ole har sagt ja, og før der findes en kopi.
- Indhold på siderne er Oles ansvar. Reproducér ikke tekstblokke, der nedgør andre mennesker eller grupper, og skriv ikke nyt indhold af den slags. Er der tvivl, så spørg Ole, og lad blokken stå som pladsholder.

## Forudsætning
Emil (den der har bygget det) har bedt Ole om skriftlig bekræftelse på, at siderne må kopieres og flyttes. **Spørg Ole, om den er givet.** Hvis ikke, så vent. Vercel-adgangslåsen på Emils projekt må ikke slås fra, før den er givet.

## Hvad projektet er
Kopier af fire sider fra mailform.dk, som Ole kan redigere selv i en visuel editor, og en kontaktformular der sender mail til Ole.

| Side | Adresse (slug) |
|---|---|
| Mailform Ole | `ole` |
| Team JK | `teamjk` |
| Vores | `vores` |
| Missinglink | `missing` (vises også på `/missinglink`) |

## Opbygning
- **Kode:** GitHub, `https://github.com/EmilJanos/mailform-kloner`, gren `main`. Hver push til `main` udgiver automatisk på Vercel.
- **Visning og editor:** statiske filer i mappen `web/` (`index.html` viser siden, `edit.html` er login og sideliste, `visual.html` er den visuelle editor). `web/vercel.json` har omskrivning, så `/slug` virker.
- **Database og login:** Supabase. Tabeller: `pages` (`slug`, `title`, `legend`, `sections` som json, `owner_id`, `published`), `page_settings` (`form_to_email`), `submissions` (modtagne beskeder). Row Level Security er slået til. Migrationer ligger i `supabase/migrations/` (`0001_init.sql`, `0002_media.sql`).
- **Filer:** to Storage-buckets, `images` (5 MB) og `videos` (50 MB), med en mappe pr. bruger.
- **Formular:** Edge Function `send-form` (`supabase/functions/send-form/index.ts`). Den gemmer beskeden, og sender mail via Resend, hvis `RESEND_API_KEY` og `form_to_email` er sat. Felter: email (påkrævet), telefon (valgfri), besked. Spærring: højst 3 beskeder pr. afsender på 10 minutter og 30 pr. side i timen (svarer 429). Mailudbyderens fejl sendes aldrig til den besøgende, kun til function-loggen.
- **Nuværende ejer af alt:** Emil. Supabase-projektet hedder "Kopiere hjemmesider" (ref `ywiibwltvbdpjiubhhbh`). Vercel-projektet hedder `mailform-kloner` (root directory `web`).
- **Startdata til siderne:** `seed/*.sql` og `seed/*.json`.

## Målet
Ole ejer GitHub-repoet, Vercel-projektet, Supabase-projektet og Resend-kontoen. Siderne ligger på hans eget domæne `oleamstrup.dk`. Beskeder fra formularen går til `mailform@oleamstrup.dk`. Emil er ikke med i det daglige.

## Trin for trin

### 1. Konti (Ole gør det, du guider)
Ole opretter gratis konti med samme mailadresse hos:
1. GitHub
2. Vercel (log ind med GitHub)
3. Supabase (log ind med GitHub)
4. Resend

### 2. Overfør projekterne (Emil starter, Ole accepterer)
Foretræk overførsel. Hvis den ikke kan lade sig gøre, brug fallback.

- **GitHub:** Emil overfører repoet til Oles konto (Settings → Transfer ownership). Ole accepterer via mail.
- **Supabase:** Emil overfører projektet til en organisation hos Ole (Project Settings → General → Transfer project). Ole skal først have oprettet en organisation.
- **Vercel:** Emil overfører projektet til Oles team (Project Settings → Advanced → Transfer Project). Efter overførsel skal GitHub-forbindelsen sættes op igen under Settings → Git.

**Fallback (ny opsætning i stedet for overførsel):**
1. Opret nyt Supabase-projekt hos Ole. Kør `0001_init.sql` og `0002_media.sql` i SQL Editor, og kør derefter `seed/<side>.sql` for hver side.
2. Deploy `send-form` fra `supabase/functions/send-form/index.ts` (Edge Functions, slå "Verify JWT" fra).
3. Ret `web/config.js` til det nye projekts URL og publishable key.
4. Opret nyt Vercel-projekt fra repoet, root directory `web`.
Billeder og videoer i Storage følger ikke med i fallback og skal uploades igen.

### 3. Mail (Resend)
1. Ole tilføjer domænet `oleamstrup.dk` i Resend under Domains.
2. Resend viser nogle DNS-poster. De lægges ind hos den, der administrerer domænets DNS. Bed Ole sende posterne til den, eller gør det selv, hvis han har adgang.
3. Vent til domænet står som **Verified**.
4. Ole opretter en API-nøgle i Resend (Sending access).
5. I Supabase, Edge Functions → Secrets, opretter Ole:
   - `RESEND_API_KEY` = nøglen
   - `MAIL_FROM` = `Kontaktformular <noreply@oleamstrup.dk>`
6. Sæt modtager på alle fire sider (SQL Editor):

```sql
insert into page_settings (page_id, form_to_email)
select id, 'mailform@oleamstrup.dk' from pages where slug in ('ole', 'teamjk', 'vores', 'missing')
on conflict (page_id) do update set form_to_email = excluded.form_to_email;
```

### 4. Login-mails (valgfrit, men anbefalet)
Supabases egen mailtjeneste har lav grænse og giver "mail limit exceeded". Sæt Resend ind som SMTP i Supabase under Authentication → SMTP Settings (host `smtp.resend.com`, port `465`, brugernavn `resend`, adgangskode = Resend-nøglen, afsender `noreply@oleamstrup.dk`). Uden eget domæne i Resend kan der kun sendes til kontoens egen mailadresse, så dette trin giver først mening, når Oles domæne er verificeret (trin 3). Indtil da bruges adgangskode-login, som editoren understøtter. Login-siden har et øje, der viser/skjuler adgangskoden.

### 5. Oles login og ejerskab
1. Opret Oles bruger i Supabase (Authentication → Users → Add user, med adgangskode) eller lad ham logge ind på `/edit.html` med mailadressen.
2. Sæt ham som ejer af siderne:

```sql
update pages set owner_id = (select id from auth.users where email = 'OLES-MAIL') where slug in ('ole', 'teamjk', 'vores', 'missing');
```

3. Ole logger ind på `/edit.html`, åbner en side med **Redigér**, ændrer noget, trykker **Gem** og tjekker resultatet med **Se siden**.

### 6. Domæne
1. I Vercel, Settings → Domains, tilføj det domæne eller de underadresser, Ole vil bruge.
2. Vercel viser, hvilke DNS-poster der skal sættes. Samme fremgangsmåde som i trin 3.
3. Adgangslåsen (Vercel Authentication) slås fra under Settings → Deployment Protection, **først når Ole har sagt, at siderne skal være offentlige**.

### 6b. Alternativ: fire færdige zip-filer til Netgiganten
Hvis Ole vil have siderne som almindelige filer på sit webhotel, har Emil fire zip-filer: `ole`, `teamjk`, `vores` og `missinglink`. De er uden editor og database. Teksten er fast, og kun formularen på `ole` og `teamjk` sender mail.

Rækkefølge, og den må ikke byttes om:
1. **Hent billeder og video, mens de gamle sider stadig er online.** Pak zip-filen ud, og dobbeltklik på `hent-billeder-og-videoer.bat` (Windows). Den henter alt ned i mapperne `billeder` og `videoer` efter listen i `hent.txt`. Findes en fil allerede, springes den over, så den kan køres igen. Fejlede nogle, står de på listen til sidst. Billederne ligger på `files.builder.nu`, videoerne på DanDomain-domænerne. Når DanDomain eller mailform.dk lukkes, er de væk.
2. **Mail (kun `ole` og `teamjk`).** Opret mailkonto `mailform@oleamstrup.dk` på Netgiganten. Åbn `indstillinger.php` og ret `smtp_server` og `smtp_adgangskode`, som står som `UDFYLD`. Port 587 med `tls` eller 465 med `ssl`. Filen svarer 404, hvis nogen åbner den direkte. Uden rettelse svarer formularen med en fejl, og der sendes intet.
3. **Upload hele mappen** til sidens domæne hos Netgiganten (PHP skal være slået til, ellers virker formularen ikke).
4. **Test.** Åbn siden, send en besked med og uden telefonnummer, og se at den kommer frem. Der er spærring: 3 beskeder pr. afsender pr. 10 minutter og 20 pr. IP pr. time.

Links på siderne peger på `https://mailform.dk/...` og skal rettes, når Ole har sit eget domæne. YouTube-videoer flyttes ikke, de er indlejret og bliver ved at virke. Videomapperne er store: `vores` har ca. 312 filer og `missinglink` ca. 48.

### 7. Tjek til sidst
- [ ] Alle fire sider åbner uden login på det rigtige domæne
- [ ] Formularen sender en testbesked med og uden telefonnummer, og mailen kommer frem hos `mailform@oleamstrup.dk`
- [ ] Ole kan logge ind, redigere, gemme og uploade billede og video
- [ ] Beskeden er også gemt i tabellen `submissions`
- [ ] Emil har ikke længere adgang til Oles konti, og Ole har fået nøglerne han skal bruge

## Sikkerhed (gennemgået 3. november 2026)
- Row Level Security er slået til på alle tabeller. Sider kan læses offentligt, når de er udgivet. Beskeder og modtageradresse kan kun læses af sidens ejer.
- Storage: brugere kan kun lægge, ændre, slette og se filer i deres egen mappe (`<bruger-id>/…`). Offentlige fil-adresser virker for alle, fordi bucketsene er offentlige.
- En sikkerhedsgennemgang og SQL-rettelser (strammere tabelrettigheder og Storage-regler, indeks) er lavet og skal være kørt, før overdragelsen. Tjek i Supabase under Advisors, at der ikke er kritiske fund.
- Kontrol af lækkede adgangskoder i Supabase Auth kræver en betalt plan. Slå den til, hvis Ole opgraderer.
- Gem aldrig nøgler i repoet.

## Editoren: godt at vide
- Klik på et billede eller en video for at ændre størrelsen (25/50/75/100 %, Original, eller træk i hjørnet).
- Video skal være **MP4 (H.264)** eller WebM, højst 50 MB. `.3gp` og `.mov` virker ikke i alle browsere. Større videoer lægges på YouTube og bruges med "Video fra link".
- Billeder gøres automatisk mindre ved upload (højst 5 MB).
- Fejl ved upload vises i en rød boks nederst på skærmen.
- Fortryd/gentag virker på hele siden (tekst, flytninger, upload, sletning).

## Kendte forhold
- Slug for Missinglink er `missing`. Visningssiden mapper `/missinglink` til den.
- Slug kan kun være små bogstaver, tal og bindestreg, 2 til 41 tegn.
- Gemmer man en side, mens en anden har gemt, afvises det (samtidighedstjek). Genindlæs og prøv igen.
- Redigering gemmer kun for den bruger, der står som `owner_id`.
- Editoren sender ikke selv mails. Det gør kun `send-form`.
- Formularteksten over beskedfeltet siger "Skriv din besked og gerne dit telefon-nummer". Den kan Ole rette i editoren, nu hvor der er et eget telefonfelt.
- Ændringer i koden (`web/`) udgives ved `git push` til `main`. Ændringer i selve siderne sker i editoren og kræver ingen deploy.

## Skal Ole bruge hjælp efter overdragelsen
Han kan åbne denne fil i sin egen Claude og sige: "Jeg vil ændre noget på mine sider". Brug afsnittet "Opbygning" til at finde ud af, hvor det skal ske.
