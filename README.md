# Planète Tech — Boutique cliente

Boutique publique de Planète Tech : sans inscription, paiement à la
livraison. Next.js 13 (pages router) + MUI, mêmes technologies que le
dashboard. La boutique ne parle jamais directement à la base de données :
elle appelle uniquement les routes publiques du backend du dashboard
(`/api/public/...`).

## Démarrage

```bash
npm install
cp .env.example .env.local
npm run dev      # port 3002
npm run build    # build de production
npm start        # port 3002
```

## Variables d'environnement

| Variable | Exemple | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | Adresse du backend (routes `/public`) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3002` | Adresse publique de la boutique (sitemap) |

## Pages

- `/` — accueil : catégories, produits mis en avant, promotions.
- `/boutique` — catalogue : recherche, filtres (catégorie, prix, promo,
  stock), tri, pagination. Les filtres sont dans l'URL.
- `/produits/[slug]` — fiche produit par slug, galerie, paliers de prix,
  produits liés (rendu serveur).
- `/panier` — panier conservé en `localStorage`, code promo, estimation
  des frais de livraison.
- `/commande` — formulaire sans compte (nom, téléphone algérien, wilaya,
  commune, adresse, domicile / bureau), total recalculé par le serveur.
- `/commande/confirmee` — confirmation et suivi par numéro + téléphone.
- `/sitemap.xml` — plan du site des produits publiés.

## Livraison et notifications (côté backend)

- Yalidine : identifiants uniquement en variables d'environnement
  (`YALIDINE_API_ID`, `YALIDINE_API_TOKEN`, `YALIDINE_FROM_WILAYA`).
  Sans eux, la boutique fonctionne en mode dégradé : frais issus de la
  grille `tarif_livraison`, communes et bureaux saisis en texte libre.
  Le colis Yalidine n'est créé qu'après confirmation de la commande par
  l'admin dans le dashboard.
- WhatsApp : notification aux admins à chaque nouvelle commande via
  l'API WhatsApp Business Cloud (`WHATSAPP_TOKEN`,
  `WHATSAPP_PHONE_NUMBER_ID`, `ADMIN_WHATSAPP_NUMBERS`). Sans ces
  identifiants, la commande est quand même enregistrée.
