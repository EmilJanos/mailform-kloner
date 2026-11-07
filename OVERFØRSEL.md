# OVERFØRSEL: Oles fire sider til Netgiganten

*Denne fil er til Oles Claude. Ole kopierer hele teksten ind i en ny samtale med Claude på sin egen computer og skriver: "Guid mig igennem det her, ét trin ad gangen."*

---

## Regler for dig (Claude)

- Skriv på dansk, kort og i et almindeligt sprog. Ole er ikke programmør.
- Tag ét trin ad gangen. Vent på, at Ole skriver "færdig" eller viser et skærmbillede, før næste trin.
- Når Ole skal skrive en kommando, så giv én kommando pr. kodeboks.
- Bed aldrig Ole om at sende dig adgangskoder. Adgangskoden til mailkontoen skriver han selv ind i filen `indstillinger.php`, og du ser den ikke.
- **Slet eller luk aldrig noget hos DanDomain eller på mailform.dk, før Ole har testet, at alt virker på Netgiganten** (se "Sikkerhedsnettet").
- Gæt ikke på Netgigantens menuer. Brug hjælpen på netgiganten.dk, eller bed Ole om et skærmbillede.
- Hvis noget går galt, så gå til afsnittet "Hvis noget går galt". Mangler svaret dér, så skriv det ærligt og henvis til Emil.

## Hvad der skal ske

Ole har fire hjemmesider, som i dag ligger på mailform.dk og DanDomain. De skal flyttes til hans egne domæner hos Netgiganten.

Emil har lavet hver side som en **zip-fil**. Man pakker den ud og lægger mappen på et domæne, så er siden online. Der er ingen database og ingen editor. Teksten er fast.

| Zip-fil | Indhold | Kontaktformular |
|---|---|---|
| `ole.zip` | Oles egen side | Ja |
| `teamjk.zip` | Team JK | Ja |
| `vores.zip` | Vores-siden (mange billeder og videoer) | Nej |
| `missinglink.zip` | Missing Link (mange billeder og videoer) | Nej |

Ole har skriftligt givet lov til at kopiere indholdet og flytte siderne til sit eget domæne.

## Hvad der ligger i hver zip

- `index.html`: selve siden
- `css/`: udseende
- `LÆS MIG.txt`: kort version af denne guide
- Kun `ole` og `teamjk`: `send.php` (sender mail fra formularen) og `indstillinger.php` (mailkontoens oplysninger)

**Videoer hentes ikke.** De peger på Oles egne domæner (fx `debat.vorespolitikere.dk`), præcis som på de gamle sider. De skal bare blive liggende på samme adresser, også efter domænerne er flyttet til Netgiganten. Videoer fra YouTube er indlejret og virker bare.

**Billeder skal med i zip-filen.** De ligger i dag hos sidebyggeren (`files.builder.nu`), ikke hos Ole, og forsvinder, hvis kontoen lukkes. Derfor henter Emil dem ned i mappen `billeder/`, mens de gamle sider stadig er online, og pakker en ny zip. Mappen `billeder/` skal ligge ved siden af `index.html`. Er mappen tom i en zip, skal trin 2 køres først.

---

## Trin for trin

### Trin 0: Før du starter (Ole)

- [ ] Alle fire zip-filer er gemt på computeren. Lav en kopi af dem på et USB-stik eller i en sky-mappe. Det er det første sikkerhedsnet.
- [ ] Ole har login til Netgiganten og ved, hvilke adresser de fire sider skal have (se trin 6).
- [ ] De gamle sider og DanDomain er stadig online og **må ikke lukkes endnu**.
- [ ] Mappen `billeder/` er fyldt i alle fire zip-filer
- [ ] Videofilerne ligger på de samme adresser, som siderne peger på. Ole har bekræftet, at han selv har dem liggende og flytter dem med sine domæner.

### Trin 1: Pak zip-filerne ud (Ole)

Højreklik på hver zip og vælg *Udpak alle* til hver sin mappe, fx `C:\Sider\ole`. 

### Trin 2: Hent billederne (kun hvis `billeder/` er tom)

1. Klik i adresselinjen øverst i Stifinder (i sidens mappe), skriv `cmd` og tryk Enter.
2. Indsæt denne ene kommando og tryk Enter:

```
for /f "tokens=1,2" %a in (hent.txt) do curl.exe -L --fail --create-dirs -C - -o "%a" "%b"
```

3. Vent, til markøren står stille. Kør kommandoen igen, hvis nogle filer fejlede. Det hentede springes over.

Billederne fylder kun få MB pr. side. Brug ikke `.bat`-filer. Smart App Control kan blokere dem.

### Trin 3: Opret mailkonto til formularen (kun `ole` og `teamjk`)

1. I Netgigantens kontrolpanel: opret mailkontoen `mailform@oleamstrup.dk`, hvis den ikke findes. Modtager af alle beskeder er den samme adresse.
2. Find kontoens **SMTP-oplysninger** (server, port, sikkerhed). De står i kontrolpanelet eller i Netgigantens hjælp under mailopsætning.
3. Åbn `indstillinger.php` i mappen med Notesblok. Ret kun disse linjer:
   - `smtp_server`: erstat `UDFYLD` med serverens navn
   - `smtp_adgangskode`: erstat `UDFYLD` med mailkontoens adgangskode. **Skriv den selv. Send den ikke til Claude.**
   - `smtp_port` og `smtp_sikkerhed`: `587` og `'tls'`, eller `465` og `'ssl'`. Følg det, Netgiganten oplyser.
4. Gem filen. Gør det i begge mapper (`ole` og `teamjk`).

Siden og formularen får ikke andre rettelser. Står der stadig `UDFYLD`, sender formularen ikke noget og viser en fejl. Det er med vilje.

### Trin 4: Læg siden på nettet (Ole)

1. Opret et domæne eller en underadresse til siden hos Netgiganten (eller brug det, som allerede er oprettet).
2. Upload **indholdet af mappen** (ikke selve mappen) til domænets rodmappe, normalt `public_html` eller `www`. Brug filhåndteringen i kontrolpanelet eller et FTP-program som FileZilla.
3. Kontrollér at `index.html` ligger direkte i roden.
4. Sørg for, at **PHP er slået til** på domænet (kun nødvendigt for `ole` og `teamjk`).

For `vores` og `missinglink` kan upload tage lang tid. Upload dem i bidder, hvis forbindelsen falder ud, og start med `index.html` og `css/`.

**Zip-fil direkte til serveren:** Hvis zip-filen er pakket med billeder og video, kan Ole uploade zip-filen og bruge "Udpak" i Netgigantens filhåndtering. Spørg Netgiganten om grænsen for filstørrelse ved upload, og om udpakning findes. Er zip-filen for stor (især `vores`), så pak den ud på computeren og upload mapperne med FTP-programmet FileZilla. Videoer fylder det samme med og uden zip, fordi de allerede er pakket. Efter udpakning skal `index.html` ligge direkte i domænets rodmappe og ikke i en undermappe.

**Mailoplysninger skrives på serveren:** På `ole` og `teamjk` åbner Ole `indstillinger.php` i filhåndteringen efter udpakning og retter `UDFYLD` (trin 3). Adgangskoden går dermed ikke gennem andre.

### Trin 5: Test (Ole)

For hver side:
- [ ] Siden åbner på det rigtige domæne
- [ ] Billederne vises
- [ ] Et par videoer afspilles
- [ ] Sidens menu og links virker
- [ ] (`ole` og `teamjk`) Send en testbesked med telefonnummer og en uden. Begge skal komme frem i `mailform@oleamstrup.dk` inden for få minutter. Tjek også spam-mappen.

Der er indbygget spærring mod misbrug: højst 3 beskeder pr. afsender på 10 minutter og 20 pr. IP-adresse i timen. Giver testen "for mange forsøg", så vent 10 minutter.

### Trin 6: Ret links, når domænerne er flyttet

Ole ejer selv domænet `mailform.dk`. Links mellem siderne peger på adresser som `https://mailform.dk/vores`, og de virker kun, hvis siden ligger netop dér, når domænet er flyttet til Netgiganten.

- **Siderne får de samme adresser som i dag** (fx `mailform.dk/vores`). Så er links fine, og intet skal rettes. Men en zip pakkes ud i roden af ét domæne. Skal en side ligge på `/vores`, skal filerne placeres i en undermappe af domænet, der hedder `vores`.
- **Hver side får sit eget domæne eller underdomæne.** Så skal links mellem siderne rettes til de nye adresser. Bed Claude om at finde alle forekomster af `mailform.dk` i `index.html` og foreslå rettelserne. Ole godkender, før noget ændres. Upload filen igen bagefter.

Beslut først, hvilken side der skal på hvilken adresse, og gør derefter trin 4. **Spørg Ole:** hvilke adresser skal de fire sider have?

### Trin 7: Skift domænerne fra DanDomain til Netgiganten

Dette er sidste trin, og først når trin 5 er bestået.

1. Bestil flytning (transfer) af domænerne til Netgiganten, eller peg DNS over (nameservers) til Netgiganten. Netgigantens hjælp beskriver begge dele.
2. Lav ikke begge dele samtidig for samme domæne.
3. Der er typisk et døgn eller to, hvor siden kan være utilgængelig for nogle. Gør det på et roligt tidspunkt.
4. **Hold DanDomain-abonnementet kørende, til flytningen er bekræftet og siderne virker på Netgiganten.**

---

## Sikkerhedsnettet

Ole risikerer ikke at miste noget, hvis han følger disse regler:

1. **Zip-filerne er originalerne.** Behold dem et sted, der ikke er computeren (USB, sky). Alt kan bygges op igen fra dem.
2. **Billederne ligger lokalt i zip-filerne** (`billeder/`). Videoerne ligger hos Ole selv. Tag en kopi af zip-filerne og af Oles videomapper, før domænerne flyttes.
3. **Gamle sider og DanDomain lukkes sidst.** Hold dem kørende, til alt er testet på Netgiganten.
4. **Før du ændrer en fil på nettet, så tag en kopi af den først.** Hent den ned til computeren, eller omdøb den til `index.html.gammel`.
5. **Hvis en ny side går i stykker:** Upload den oprindelige `index.html` fra zip-filen igen. Det retter de fleste fejl.
6. **Mailformularen kan altid undværes midlertidigt.** Skriv adressen `mailform@oleamstrup.dk` på siden, eller bed Claude om en enkel løsning, indtil formularen virker. Siden går ikke ned, fordi mailen driller.

## Hvis noget går galt

| Problem | Hvad Ole gør |
|---|---|
| Billeder vises ikke | Mappen `billeder/` mangler eller er tom, eller ligger ikke ved siden af `index.html`. Kør trin 2, eller kontakt Emil. |
| Siden er helt hvid eller viser kun tekst | `css/`-mappen mangler eller ligger forkert. `index.html` skal ligge i roden med `css/` ved siden af. |
| Videoer afspilles ikke | Videoerne peger på Oles egne domæner. Tjek at filen ligger på samme adresse som på den gamle side (fx `debat.vorespolitikere.dk/filnavn.mp4`) og at domænet er flyttet og virker. Er filen fra en mobil (`.3gp` eller `.mov`), kan nogle browsere ikke afspille den. |
| Formularen siger "Beskeden kunne ikke sendes" | SMTP-oplysningerne er forkerte. Tjek server, port og sikkerhed, og at adgangskoden er skrevet rigtigt uden mellemrum. Prøv `465` og `'ssl'`, hvis `587` og `'tls'` ikke virker. |
| Formularen siger fejl med det samme, uden forsøg | `indstillinger.php` er ikke udfyldt (`UDFYLD`), eller PHP er ikke slået til på domænet. |
| Mailen når ikke frem, men formularen siger "sendt" | Tjek spam-mappen. Tjek at `mailform@oleamstrup.dk` findes og kan modtage. Hold øje med Netgigantens mail-log. |
| Formularen virker ikke, fordi serveren afviser SMTP | I `indstillinger.php`: sæt `smtp_server` til `''` (to enkelte citationstegn). Så bruger siden i stedet webhotellets egen mailfunktion. Det kan kræve, at Netgiganten har den slået til. |
| `indstillinger.php` viser "404" i browseren | Det er rigtigt og med vilje. Filen kan ikke læses udefra. |
| Siden virker, men spærring blokerer testen | Vent 10 minutter og prøv igen. |
| Alt andet | Stop. Skriv ned, hvad der står på skærmen (skærmbillede), og kontakt Emil. Ændr intet på DanDomain, før det er løst. |

## Hvis zip-løsningen ikke dur

Der findes en anden, større løsning med editor og database (Vercel og Supabase), som er beskrevet i `HANDOVER-OLE.md` i GitHub-projektet `mailform-kloner` (Emil har linket). Den giver Ole mulighed for selv at redigere siderne, men kræver flere konti. Brug den kun, hvis Ole vil kunne ændre teksterne selv. Zip-løsningen er den enkleste.

## Sluttjek

- [ ] Alle fire sider åbner på Oles egne domæner hos Netgiganten
- [ ] Billeder og videoer vises på alle fire
- [ ] Formularen på `ole` og `teamjk` leverer til `mailform@oleamstrup.dk`
- [ ] Links mellem siderne er rettet fra mailform.dk til de nye adresser
- [ ] Zip-filerne (med billeder) ligger som kopi på USB eller i sky
- [ ] Domænerne er flyttet fra DanDomain, og først derefter er DanDomain-abonnementet opsagt, hvis Ole vil det

Når alt er afkrydset, er overførslen færdig.
