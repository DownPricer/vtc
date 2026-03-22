# YGvtc VTC76 - Site Next.js

Migration du site VTC76.fr de Wix vers Next.js. VTC et navettes aéroport en Seine-Maritime.

## Développement

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

Créer `.env.local` (voir `.env.example`) :

| Variable | Description |
|----------|-------------|
| `DISTANCE_MATRIX_API_KEY` | Clé API DistanceMatrix.ai (calcul des distances) |
| `N8N_WEBHOOK_URL` | URL webhook n8n (réservations, devis, contact) |
| `PAYPAL_CLIENT_ID` | PayPal (création/capture commandes, optionnel) |
| `PAYPAL_CLIENT_SECRET` | PayPal (optionnel) |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal SDK client (optionnel) |
| `NEXT_PUBLIC_SITE_URL` | URL du site (ex: https://vtc76.netlify.app) |

## Déploiement Netlify

1. Créer un site sur [Netlify](https://app.netlify.com)
2. Connecter le dépôt Git
3. Configurer les variables d'environnement dans Paramètres > Environment variables
4. Build : `npm run build` (déjà configuré via `netlify.toml`)

Le plugin `@netlify/plugin-nextjs` gère automatiquement Next.js.

## Compatibilité n8n

Les payloads envoyés au webhook restent **strictement identiques** à l'ancien site Wix :

- **Formulaire** (réservation) : `Etiquette: "Formulaire"`
- **Devis** : `Etiquette: "Devis"`
- **Contact** : `Etiquette: "CONTACT"`

Aucune modification du workflow n8n n'est requise.

## Structure

- `/calculateur` - Calculateur de prix + réservation
- `/devis` - Demande de devis
- `/contact` - Formulaire contact
- `/api/calculer-tarif` - Calcul du tarif (DistanceMatrix.ai)
- `/api/reservation` - Envoi réservation → n8n
- `/api/devis` - Envoi devis → n8n
- `/api/contact` - Envoi contact → n8n
