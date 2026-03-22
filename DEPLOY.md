# Déploiement VTC76

## Option A : Vercel (recommandé, sans GitHub)

1. **Ouvrez un terminal** dans le dossier `vtc76`

2. **Connectez-vous à Vercel** (ouvre le navigateur) :
   ```
   vercel login
   ```

3. **Déployez** :
   ```
   npm run deploy
   ```
   Ou directement : `vercel --prod`

4. Vercel génère une URL (ex: `vtc76-xxx.vercel.app`)

---

## Option B : Netlify (avec CLI, sans GitHub)

1. **Installez** : `npm install -g netlify-cli`

2. **Connectez-vous** : `netlify login`

3. **Dans le dossier vtc76** :
   ```
   netlify init
   ```
   Choisissez "Create & configure a new site"

4. **Déployez** : `netlify deploy --prod`

---

## Variables d'environnement

Sur Vercel : Project Settings → Environment Variables

Sur Netlify : Site settings → Environment variables

À configurer :
- `DISTANCE_MATRIX_API_KEY`
- `N8N_WEBHOOK_URL`
- `NEXT_PUBLIC_SITE_URL` (URL de votre site déployé)

Optionnel (PayPal) :
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
