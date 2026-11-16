import { DESCRIPTIONS_PRODUITS, NOMS_FAMILLES } from "src/lib/contenu";

// Helpers défensifs pour les champs bilingues et le stock.
// Les descriptions et les noms de familles bilingues vivent dans le repo
// boutique (src/lib/contenu.js) : l'API publique ne les renvoie pas.
// La description de l'API, si elle existe un jour, sert de repli.

// Description dans la langue active : contenu boutique d'abord, repli sur
// le français si l'arabe est absent, puis sur la description de l'API.
export const descriptionProduit = (produit, locale) => {
  if (!produit) return "";
  const contenu = DESCRIPTIONS_PRODUITS[produit.slug];
  if (locale === "ar") {
    return contenu?.ar || contenu?.fr || produit.description || "";
  }
  return contenu?.fr || produit.description || "";
};

// Nom de famille bilingue : contenu boutique keyé par slug, repli sur le
// nom renvoyé par l'API.
export const nomFamille = (famille, locale) => {
  if (!famille) return "";
  const contenu = famille.slug ? NOMS_FAMILLES[famille.slug] : null;
  if (locale === "ar") {
    return contenu?.ar || contenu?.fr || famille.nom || "";
  }
  return contenu?.fr || famille.nom || "";
};

export const nomFamilleProduit = (produit, locale) => {
  if (!produit) return "";
  if (produit.famille) return nomFamille(produit.famille, locale);
  return "";
};

// Stock numérique réel, s'il est exposé par l'API (plusieurs noms possibles).
// Retourne null quand l'API ne donne que le booléen en_stock : on n'invente
// jamais un nombre d'exemplaires.
export const stockNumerique = (produit) => {
  if (!produit) return null;
  const candidats = [
    produit.qte_dispo,
    produit.quantite_disponible,
    produit.qte_stock,
    produit.stock,
  ];
  for (const valeur of candidats) {
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
