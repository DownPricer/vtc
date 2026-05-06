# Checklist tests Stripe Connect VTC (E2E)

Document de validation manuelle du flux paiement (dashboard pro → lien Checkout → webhook → confirmation).

Ne pas committer de vraies clés ou secrets dans ce dépôt.

---

## 1. Variables d’environnement API (`vtc-core-api`)

À renseigner sur le serveur (valeurs fictives ci-dessous) :

| Variable | Rôle |
|----------|------|
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (mode test ou live selon environnement). |
| `STRIPE_WEBHOOK_SECRET` | Secret de signature du endpoint webhook. |
| `STRIPE_CONNECT_RETURN_URL` | URL de retour après onboarding Connect Express. |
| `STRIPE_CONNECT_REFRESH_URL` | URL si lien onboarding expiré. |
| `STRIPE_PAYMENT_SUCCESS_URL` | URL après paiement Checkout réussi. |
| `STRIPE_PAYMENT_CANCEL_URL` | URL si annulation Checkout. |

Variables SMTP / mail (selon votre infra) pour PR6A / PR6B :

| Variable | Rôle |
|----------|------|
| `SMTP_HOST`, `SMTP_PORT`, … | Connexion SMTP. |
| `MAIL_FROM` | Expéditeur (ou équivalent configuré par tenant). |

---

## 2. Base de données

- Déployer les migrations Prisma (`migrate deploy` ou flux projet habituel).
- Vérifier la présence des tables/champs Stripe / paiement / idempotence webhook selon les PR livrées.

---

## 3. Dashboard `/pro/paiements`

1. Ouvrir la page **Paiements** connecté en tant qu’opérateur.
2. Si Stripe plateforme non configuré : message d’erreur explicite (pas de blocage silencieux).
3. **Connecter Stripe** (compte test Connect Express).
4. **Reprendre l’onboarding** si incomplet ; compléter les étapes Stripe test.
5. **Actualiser le statut** jusqu’à état prêt à encaisser (badge / titre cohérents).
6. Activer **paiement en ligne** ; tester **mode FULL** puis **mode DEPOSIT** (avec règle d’acompte valide).
7. Enregistrer les réglages.

---

## 4. Demande avec montant

1. Créer ou utiliser une demande (devis / réservation) dont le tarif est calculé et présent (montant connu côté API).

---

## 5. Fiche `/pro/demandes/[id]`

1. Ouvrir la demande acceptée (ou état payable selon règles API).
2. **Créer un lien** avec la case **envoi e-mail** décochée : vérifier lien + absence de message « e-mail envoyé ».
3. **Créer un lien** avec envoi e-mail coché (client avec e-mail valide) : vérifier message de succès ou avertissement SMTP si mal configuré.
4. **Copier le lien** / **Ouvrir le lien** : redirection Checkout Stripe test.

---

## 6. Paiement test Stripe

1. Carte réussite : `4242 4242 4242 4242`, date future, CVC quelconque.
2. Soumettre le paiement.

---

## 7. Vérifications après paiement

1. **Webhook** : événement reçu et traité (logs API si besoin).
2. **Payment** en statut **PAID** ; **LeadRequest.paymentStatus** **PAID**.
3. **E-mails** (si SMTP OK) : confirmation client et opérateur après PR6B.

---

## 8. Optionnel

- Carte refusée ou `decline` Stripe pour tester **FAILED** côté demande.
- Session Checkout expirée pour tester **EXPIRED** (si reproductible).
- **Idempotence webhook** : rejouer le même `evt_...` (outil Stripe ou replay) → pas de double mise à jour métier ni double e-mail de confirmation.

---

## 9. Front

Après modification du dashboard :

```bash
cd vtc-template-front/vtc76/vtc76
npm run build
```

---

## Limites hors périmètre

- Pas de test automatisé Playwright/Cypress décrit ici (manuel uniquement).
- Pas de détail sur les montants / commissions dans l’UI pro (volontaire).
