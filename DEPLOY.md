# Déploiement du template VTC

Le code source peut vivre dans un dossier nommé comme vous voulez ; les instructions ci-dessous supposent que vous êtes à la racine du projet Next.js (là où se trouve `package.json`).

## Option A : Vercel

1. `vercel login`
2. `vercel` puis `vercel --prod`, ou `npm run deploy` si configuré dans votre `package.json`.

Définir dans **Project → Settings → Environment Variables** au minimum :

- `DISTANCE_MATRIX_API_KEY`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_TO`
- `NEXT_PUBLIC_SITE_URL` (URL finale du site, avec `https://`)

## Option B : Netlify

1. `npm install -g netlify-cli`
2. `netlify login`
3. `netlify init` puis `netlify deploy --prod`

Mêmes variables que sur Vercel (voir `README.md`).

## PayPal (facultatif)

Si vous activez le paiement en ligne : `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`.
