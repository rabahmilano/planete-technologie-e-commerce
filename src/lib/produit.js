import { NOMS_FAMILLES } from "src/lib/contenu";

// Helpers défensifs pour les champs bilingues et le stock.
// Les descriptions produits vivent dans la base (description /
// description_ar, écrites côté dashboard) et sont renvoyées par l'API
// publique. Les noms de familles bilingues vivent d'abord dans la base
// (nom_famille_ar, écrit côté dashboard) ; le dictionnaire boutique
// (src/lib/contenu.js, keyé par slug) n'est plus qu'un repli transitoire
// tant que les noms en base ne sont pas remplis.

// Description dans la langue active : arabe de la base, repli sur le
// français si l'arabe est absent.
export const descriptionProduit = (produit, locale) => {
  if (!produit) return "";
  if (locale === "ar") {
    return produit.description_ar || produit.description || "";
  }
  return produit.description || "";
};

// Nom affiché du produit : intitulé de publication écrit côté dashboard,
// repli sur la désignation interne si l'intitulé est absent.
export const nomProduit = (produit) => {
  if (!produit) return "";
  return produit.intitule_publication || produit.designation || "";
};

// Nom de famille bilingue : nom arabe de la base en priorité, puis
// dictionnaire boutique (repli transitoire), puis nom renvoyé par l'API.
export const nomFamille = (famille, locale) => {
  if (!famille) return "";
  const contenu = famille.slug ? NOMS_FAMILLES[famille.slug] : null;
  if (locale === "ar") {
    return famille.nom_famille_ar || contenu?.ar || contenu?.fr || famille.nom || "";
  }
  return contenu?.fr || famille.nom || "";
};

export const nomFamilleProduit = (produit, locale) => {
  if (!produit) return "";
  if (produit.famille) return nomFamille(produit.famille, locale);
  return "";
};

// D8 — poids facturé d'un produit : max(poids réel, L×l×h/5000) × quantité,
// défaut 200 g quand le poids manque (même défaut que le backend :
// config/utils.js POIDS_DEFAUT_GRAMMES). Renvoie des GRAMMES.
export const poidsFactureProduitGrammes = (produit, quantite = 1) => {
  const reelKg = (produit?.poids_grammes ?? 200) / 1000;
  const { longueur_cm, largeur_cm, hauteur_cm } = produit || {};
  const volumetriqueKg =
    longueur_cm && largeur_cm && hauteur_cm
      ? (longueur_cm * largeur_cm * hauteur_cm) / 5000
      : null;
  const factureKg = volumetriqueKg === null ? reelKg : Math.max(reelKg, volumetriqueKg);
  return factureKg * quantite * 1000;
};

// Poids facturé TOTAL du panier (grammes) : Σ max(poids, volumétrique) × qte.
// Les articles ajoutés avant ce changement n'ont pas de poids : défaut 200 g.
export const poidsFacturePanierGrammes = (articles) =>
  (articles || []).reduce(
    (total, article) =>
      total + poidsFactureProduitGrammes(article, article.quantite || 1),
    0,
  );

// Stock numérique réel, s'il est exposé par l'API (plusieurs noms possibles).
// L'API publique n'expose stock_restant que s'il est faible (≤ 3) : sinon
// retourne null — on n'invente jamais un nombre d'exemplaires.
export const stockNumerique = (produit) => {
  if (!produit) return null;
  const candidats = [
    produit.stock_restant,
    produit.qte_dispo,
    produit.quantite_disponible,
    produit.qte_stock,
    produit.stock,
  ];
  for (const valeur of candidats) {
    // null/undefined = « non exposé » : Number(null) vaut 0 et ferait
    // croire à un stock de 0 — on saute franchement.
    if (valeur === null || valeur === undefined) continue;
    const nombre = Number(valeur);
    if (Number.isFinite(nombre) && nombre >= 0) return nombre;
  }
  return null;
};

// Urgence réelle : stock numérique connu et faible (<= 3).
export const stockFaible = (produit, seuil = 3) => {
  const stock = stockNumerique(produit);
  return stock !== null && stock <= seuil && produit.en_stock !== false;
};

// Poids affiché : grammes -> "500 g" ou "1,2 kg".
export const formaterPoids = (grammes, locale) => {
  const nombre = Number(grammes);
  if (!Number.isFinite(nombre) || nombre <= 0) return null;
  if (nombre >= 1000) {
    const kg = (nombre / 1000).toLocaleString(
      locale === "ar" ? "ar-DZ-u-nu-latn" : "fr-DZ",
      { maximumFractionDigits: 1 },
    );
    return `${kg} kg`;
  }
  return `${nombre.toLocaleString(
    locale === "ar" ? "ar-DZ-u-nu-latn" : "fr-DZ",
  )} g`;
};
