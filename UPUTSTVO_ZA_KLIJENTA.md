# Uputstvo za pokretanje projekta

> Automatizovano podizanje Node.js + PostgreSQL aplikacije korišćenjem Docker-a i Ansible-a.

Ovaj dokument je tehničko uputstvo „korak po korak" koje opisuje kako se priprema okruženje, kako se projekat pokreće i kako se proverava da li radi. Dokument prati strukturu koju je mentor zahtevao: preduslovi, struktura projekta, konfiguracija, pokretanje, verifikacija.

---

## Sadržaj

- [Faza 0 — Priprema host okruženja (preduslovi)](#faza-0--priprema-host-okruženja-preduslovi)
- [Faza 1 — Aplikacija i Docker Compose (ručno pokretanje)](#faza-1--aplikacija-i-docker-compose-ručno-pokretanje)
- (Faze 2–6 se dodaju kako projekat napreduje)

---

## Faza 0 — Priprema host okruženja (preduslovi)

Pre nego što se projekat pokrene, host mašina (računar na kojem radiš) mora da ima sledeće instalirano:

| Komponenta | Verzija | Uloga |
|---|---|---|
| Windows 10/11 | 64-bit, build 19041+ | Operativni sistem |
| WSL2 | latest | Linux podsistem unutar Windows-a — ovde žive Ansible i komande |
| Ubuntu 22.04 LTS | LTS | Linux distribucija koja se koristi i kao razvojno i kao ciljno okruženje |
| Docker Desktop | latest | Kontejner runtime, integriše se sa WSL2 |
| Git | latest | Kontrola verzija |

### Zašto baš ovo?
Odakle alpine?
Problem: Primetićeš da je obična node:20 slika teška oko 1 GB. To je preveliko za server.
Rešenje: Guglaš "how to make docker image smaller nodejs". Saznaćeš da postoji lagana verzija Linuxa zvana Alpine. Zato menjaš prvu liniju u FROM node:20-alpine. Slika sada ima samo 150 MB.
Odakle --omit=dev i --no-audit?
Problem: Instalacija traje dugo i instalira alate za testiranje koji ti ne trebaju na serveru.
Rešenje: Pogledaš dokumentaciju za npm install i vidiš da zastavica --omit=dev preskače razvojne alate, a --no-audit preskače sigurnosne provere koje samo troše vreme tokom build-a.
Odakle "Multi-stage build" (Stage 1 i Stage 2)?
Problem: Želiš da tvoja konačna slika bude što čistija, bez ikakvih privremenih fajlova koji nastaju tokom instalacije.
Rešenje: Ovo je standardni industrijski šablon (pattern). Kopiraš ga sa zvaničnog Node.js Docker vodiča. Ideja je da u prvoj fazi instaliraš sve, a u drugoj samo preuzmeš gotov folder node_modules.
Odakle USER node?
Problem: Čitaš o bezbednosti u Docker-u i saznaš da ako neko hakuje tvoju aplikaciju dok radi kao root (što je podrazumevano), taj neko dobija kontrolu nad celim kontejnerom.
Rešenje: Zvanična Node slika već ima ugrađenog običnog korisnika koji se zove node. Jednostavno dodaš USER node pre pokretanja aplikacije.

- **Ansible** je dizajniran za UNIX/Linux i ne podržava se zvanično kao kontrolni čvor na Windows-u. Zato koristimo WSL2 sa Ubuntu-om.
- **Docker Desktop** se integriše direktno sa WSL2, tako da `docker` komanda iz Ubuntu terminala koristi isti Docker engine kao i Windows strana — bez duplog instaliranja.
- **Ubuntu 22.04 LTS** je najčešće korišćena distribucija u produkciji, mentor je preporučio sličan setup, a sve `apt` komande u `docker` Ansible roli ciljaju ovu distribuciju.

### Korak 0.1 — Provera da li već postoji WSL2

Otvori **PowerShell kao Administrator** (desni klik na Start → *Windows PowerShell (Administrator)* ili *Terminal (Administrator)*) i pokreni:

```powershell
wsl --status
```

**Mogući ishodi:**

- ✅ Komanda vraća informaciju i kaže "Default Distribution: Ubuntu-22.04" → WSL i Ubuntu već postoje, **preskoči na korak 0.3**.
- ⚠ Komanda vraća informaciju ali NE pominje Ubuntu → WSL postoji, ali Ubuntu nije instaliran, **idi na korak 0.2**.
- ❌ Komanda baca grešku ("not recognized") → WSL nije uopšte instaliran, **idi na korak 0.2**.

### Korak 0.2 — Instalacija WSL2 + Ubuntu 22.04

U PowerShell-u (i dalje kao Administrator):

```powershell
wsl --install -d Ubuntu-22.04
```

Šta se dešava:
1. Windows uključuje WSL feature i Virtual Machine Platform feature.
2. Preuzima se i instalira Ubuntu 22.04.
3. Verovatno će tražiti **restart računara** — uradi to.

Posle restarta, otvoriće se Ubuntu prozor i tražiti:
- **UNIX username** (npr. `dimitrije` — sve malim slovima),
- **UNIX password** (zapamti ga, kucaćeš ga svaki put kad budeš pokretao `sudo` komandu).

Kad završi inicijalizaciju, dobićeš `$` prompt — to je Linux terminal koji se vrti unutar Windows-a.

**Provera:** U Ubuntu terminalu pokreni:

```bash
lsb_release -a
```

Treba da pokaže `Ubuntu 22.04`.

### Korak 0.3 — Uključivanje Docker Desktop integracije sa WSL2

1. Otvori **Docker Desktop**.
2. Idi na **Settings** (zupčanik gore desno).
3. **Resources** → **WSL Integration**.
4. Glavni switch **Enable integration with my default WSL distro** treba da bude uključen.
5. U listi ispod, uključi switch za **Ubuntu-22.04**.
6. Klikni **Apply & Restart**.

> **Napomena:** Ako Ubuntu-22.04 nije na listi, znači da WSL distribucija još nije instalirana ili nije pokrenuta. Otvori Ubuntu jednom iz Start menija pa se vrati ovde.

### Korak 0.4 — Verifikacija da Docker radi iz WSL-a

Otvori **Ubuntu** iz Start menija i pokreni:

```bash
docker --version
docker compose version
docker run --rm hello-world
```

**Šta očekuješ:**
- Prve dve komande vraćaju verziju (npr. `Docker version 24.x.x`).
- Treća komanda preuzima `hello-world` image i ispisuje "Hello from Docker!" — to znači da kontejneri rade.

### Korak 0.5 — Pristup projektnom folderu iz WSL-a

Projekat fizički živi na Windows strani (npr. `C:\xampp\htdocs\Projekti za PARE\Cloud`). WSL automatski mountuje Windows diskove kao `/mnt/c`, `/mnt/d`, itd. Iz Ubuntu terminala:

```bash
cd "/mnt/c/xampp/htdocs/Projekti za PARE/Cloud"
ls -la
```

**Šta očekuješ:** Listing pokazuje `Uputstvo.txt` i `UPUTSTVO_ZA_KLIJENTA.md` (ovaj fajl).

---

### ✅ Faza 0 je završena ako:

- [ ] `wsl --status` pokazuje Ubuntu-22.04 kao distribuciju verzije 2,
- [ ] `docker run --rm hello-world` u Ubuntu terminalu ispisuje "Hello from Docker!",
- [ ] možeš da pristupiš projektnom folderu kroz `/mnt/c/...` iz Ubuntu-a.

Sve dalje komande u uputstvu se izvršavaju iz **Ubuntu terminala (WSL)**, ne iz PowerShell-a, osim ako nije eksplicitno naglašeno drugačije.

## Faza 1 — Aplikacija i Docker Compose (ručno pokretanje)

### Šta je u ovoj fazi

U ovoj fazi celokupan stack se podiže ručno, bez Ansible-a, čisto sa Docker Compose-om. Cilj je da pokažemo da kontejnerizovana aplikacija sama po sebi radi, pre nego što uvedemo automatizaciju.

Stack:

- **`app`** — Node.js (Express) API koji izlaže nekoliko HTTP endpoint-a i razgovara sa bazom preko `pg` drajvera.
- **`db`** — PostgreSQL 16 (Alpine varijanta zbog manje veličine), inicijalizuje se SQL skriptom iz `db/init.sql` prvi put kad se kreira.
- **`backend`** — interna Docker mreža koja povezuje `app` i `db`. Baza nije objavljena na host (sigurnosna mera).
- **`pgdata`** — imenovani Docker volume koji čuva podatke baze između podizanja kontejnera.

### Struktura foldera

```
Cloud/
├── UPUTSTVO_ZA_KLIJENTA.md
├── docker-compose.yml
├── .env.example          ← šablon sa varijablama
├── .env                  ← stvarni vrednosti, NE komituje se u Git
├── .gitignore
├── app/
│   ├── Dockerfile        ← multi-stage build, minimalni runtime image
│   ├── .dockerignore
│   ├── package.json
│   └── server.js         ← Express API
└── db/
    └── init.sql          ← kreira tabelu `messages` + ubacuje test podatke
```

### Konfiguracija — kreiranje `.env` fajla

Iz Ubuntu (WSL) terminala, dok si u korenu projekta:

```bash
cp .env.example .env
```

Ovim si dobio `.env` sa default vrednostima. Ako želiš, otvori ga (`nano .env`) i promeni lozinku baze. Za demo nije neophodno.

> **Zašto baš `.env` a ne hardkodovano u `docker-compose.yml`?**
> Tako jasno odvajamo konfiguraciju od koda. U Fazi 5 ovaj fajl biće generisan iz Ansible templejta, a osetljive vrednosti biće šifrovane preko Ansible Vault-a.

### Pokretanje

Iz korena projekta u Ubuntu (WSL) terminalu:

```bash
docker compose up --build -d
```

Šta ova komanda radi:

1. `--build` — gradi `app` image iz `app/Dockerfile`.
2. Pravi internu mrežu `cloud_backend`.
3. Pravi volume `cloud_pgdata` (prvi put).
4. Diže `db` kontejner i čeka da prođe `pg_isready` healthcheck.
5. Tek tada diže `app` kontejner (zbog `depends_on: condition: service_healthy`).
6. `-d` — sve ide u pozadinu (detached mode).

Praćenje logova:

```bash
docker compose logs -f app
```

Stop iz logova: `Ctrl+C` (ne gasi kontejnere, samo prestaje da prati logove).

### Verifikacija — kako proveriti da radi

**1) Status kontejnera**

```bash
docker compose ps
```

Treba da vidiš oba servisa kao `running` (i `db` kao `healthy`).

**2) Osnovni endpoint**

```bash
curl http://localhost:3000/
```

Očekivani odgovor:
```json
{"status":"ok","service":"cloud-app","message":"API radi. Probaj GET /messages ili POST /messages sa JSON telom { \"body\": \"tekst\" }."}
```

**3) Provera konekcije sa bazom**

```bash
curl http://localhost:3000/health
```

Očekivani odgovor:
```json
{"status":"ok","db":"up"}
```

**4) Čitanje inicijalnih podataka iz baze**

```bash
curl http://localhost:3000/messages
```

Treba da vidiš dva reda koja je `db/init.sql` ubacio prvi put kad je baza kreirana.

**5) Upis novog reda kroz API**

```bash
curl -X POST http://localhost:3000/messages \
     -H "Content-Type: application/json" \
     -d '{"body":"Prvi unos kroz API"}'
```

Pa ponovi `curl http://localhost:3000/messages` — novi red treba da bude tu.

**6) Test perzistencije (opciono ali bitno za odbranu)**

```bash
docker compose down
docker compose up -d
curl http://localhost:3000/messages
```

Podaci uneti pre `down` MORAJU biti i dalje tu — to dokazuje da `pgdata` volume radi.

### Gašenje (privremeno)

```bash
docker compose down
```

Ovo gasi i briše kontejnere i mrežu, ali **čuva** `pgdata` volume — podaci ostaju.

### Potpuno čišćenje (briše i podatke)

```bash
docker compose down -v
```

Zastava `-v` briše imenovane volume-e, uključujući bazu. Koristi se samo kad hoćeš sasvim čist start.

> **Napomena za odbranu:** Ova manuelna procedura je „pre-Ansible" stanje. Cilj projekta je da **sve gore navedeno** (od pripreme Docker-a na host-u do `docker compose up`) bude pokrenuto jednom Ansible komandom — to je posao Faza 2–5.
