# Template white-label VTC (Next.js)

Site vitrine VTC réutilisable : calculateur / devis / réservation, tarification serveur, e-mails SMTP (Nodemailer), configuration centralisée par client.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Configuration métier (fichiers)

| Fichier | Rôle |
|---------|------|
| `src/config/site.config.ts` | Nom, contacts, zones, hero, témoignages, feature flags |
| `src/config/business.config.ts` | Mentions légales, siège, SIREN, hébergeur |
| `src/config/pricing.config.ts` | Adresse de base, aéroports, tarifs, jours fériés, MAD |
| `src/config/seo.config.ts` | Titres / descriptions par défaut, mots-clés |

Ne pas committer de secrets : tout passe par l’environnement ou les fichiers de config que vous dupliquez par déploiement.

## Variables d’environnement

Créer `.env.local` à partir de `.env.example`.

### API centrale (calculateur, devis, réservation, contact)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL de base de l’API Express, **sans** slash final (ex. `http://localhost:4000` ou `https://api.example.com`) |
| `NEXT_PUBLIC_TENANT_ID` | Identifiant locataire envoyé dans l’en-tête `X-Tenant-ID` |

Le frontend appelle `POST {NEXT_PUBLIC_API_URL}/api/calculer-tarif`, `/api/devis`, `/api/reservation`, `/api/contact`. La clé Distance Matrix, le SMTP et la configuration multi-tenant des e-mails sont gérés **côté serveur API**, pas dans ce dépôt Next.js.

### Variables héritées (routes Next `/api/*` locales non utilisées par les formulaires)

Les handlers dans `src/app/api/` (calculer-tarif, devis, réservation, contact) ne sont plus invoqués par l’UI ; vous pouvez vous appuyer uniquement sur l’API centrale. Les variables ci-dessous ne servent que si vous réutilisez encore ces routes côté serveur.

| Variable | Description |
|----------|-------------|
| `DISTANCE_MATRIX_API_KEY` | Clé [DistanceMatrix.ai](https://distancematrix.ai/) pour les distances |
| `SMTP_HOST` | Serveur SMTP (ex. OVH / Zimbra) |
| `SMTP_PORT` | Port (souvent 465 ou 587) |
| `SMTP_SECURE` | `1` / `true` pour TLS direct (souvent avec le port 465) |
| `SMTP_USER` | Identifiant SMTP (souvent l’adresse e-mail complète) |
| `SMTP_PASS` | Mot de passe ou application password |
| `MAIL_FROM` | Adresse expéditrice (From) |
| `MAIL_TO` | Destinataire des demandes (équipe / dispatch) |

### Optionnelles (e-mail)

| Variable | Description |
|----------|-------------|
| `MAIL_REPLY_TO` | Reply-To par défaut pour les messages opérateur |
| `MAIL_TO_COPY` | Copie cachée (BCC) sur les e-mails opérateur |
| `MAIL_SEND_CUSTOMER_CONFIRMATION` | `1` / `0` — envoi d’une confirmation au client (devis / réservation). Peut aussi être piloté dans `site.config` (`features.sendCustomerConfirmationEmail`) |

### Site public

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | URL canonique du site déployé (SEO, liens absolus) |

### PayPal (optionnel)

| Variable | Description |
|----------|-------------|
| `PAYPAL_CLIENT_ID` | Serveur |
| `PAYPAL_CLIENT_SECRET` | Serveur |
| `PAYPAL_MODE` | `sandbox` ou `live` |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | SDK côté client |

### Mini-jeu (classement)

| Variable | Description |
|----------|-------------|
| `LEADERBOARD_KV_KEY` | Clé du store KV (Vercel KV, etc.) ; défaut : `vtc-site-leaderboard` |

## Flux e-mail (sans n8n)

Les envois liés au calculateur / devis / réservation / contact sont traités par **l’API centrale** (validation, tarification, Nodemailer côté API). Le frontend ne fait qu’envoyer le corps JSON habituel vers cette API.

Aucune URL de webhook n’est utilisée.

## Déploiement

Voir `DEPLOY.md` (Vercel / Netlify). Après déploiement, renseigner `NEXT_PUBLIC_SITE_URL` et les variables SMTP sur la plateforme hébergeur.

## Scripts utiles

- `npm run build` — build production
- `npm run lint` — ESLint
