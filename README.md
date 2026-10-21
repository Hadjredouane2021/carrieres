# Forum des Métiers de l'Assurance 2026

Site et back-office du Forum organisé par la Fédération Marocaine de l'Assurance.

L'affiche officielle n'était pas dans le dossier du projet. L'accueil utilise une illustration originale (skyline, route, lever de soleil) dans la palette demandée. Pour la remplacer, déposez les fichiers officiels et branchez-les depuis le back-office (logos partenaires, galerie, photos d'intervenants).

Les intervenants et partenaires livrés par le seed sont des contenus de démonstration, à remplacer avant l'ouverture publique.

## Démarrage local

1. Copier `.env.example` vers `.env` et changer les mots de passe.
2. `docker compose up -d` (MySQL est publié sur le port 3307 par défaut ; `MYSQL_PORT` permet de le changer).
3. `npx prisma migrate dev` — l'utilisateur applicatif ne peut pas créer la base fantôme de Prisma. Si la commande échoue, lancez-la une fois avec `DATABASE_URL` pointant vers `root`, puis remettez l'utilisateur `forum`.
4. `npm run db:seed`
5. `npm run dev`

Pour réinitialiser uniquement les contenus publics sans modifier les comptes :

```powershell
$env:SEED_CONTENT_ONLY = "true"
npm run db:seed
```

Le site est sur http://localhost:8185 et le back-office sur http://localhost:8185/admin/login.

Sans SMTP, l'inscription est quand même confirmée : le billet s'affiche à l'écran et le PDF se télécharge. Renseignez `SMTP_HOST` pour l'envoi.

## Production sur Ubuntu 24.04

```bash
docker compose --profile prod up -d --build
```

Nginx écoute le port 80 et reverse-proxy vers l'application. Le bloc HTTPS est prêt dans `nginx/nginx.conf` : placez les certificats Let's Encrypt dans `nginx/certs`, décommentez le serveur 443, puis faites pointer `AUTH_URL` et `APP_URL` vers `https://`.

La première migration part au démarrage du conteneur. Le seed se lance une fois :

```bash
docker compose --profile prod exec app node --experimental-strip-types prisma/seed.ts
```

Volumes : base MySQL, images publiques, CV privés.

## Sauvegarde de la base de données

Pour créer une sauvegarde locale de la base MySQL :

```bash
npm run db:backup
```

Les fichiers sont enregistrés dans `backups/` au format `.sql`.
Pour restaurer une sauvegarde :

```bash
npm run db:restore -- backups/forum_assurance_20261020-120000.sql
```

Vous pouvez aussi lancer directement les scripts PowerShell :

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\db-backup.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\db-restore.ps1 .\backups\forum_assurance_20261020-120000.sql
```

## Rôles

- Administration : contenus, paramètres, comptes, inscriptions.
- Accueil : inscriptions, pointage QR, messages.
