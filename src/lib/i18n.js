import { useRouter } from "next/router";
import fr from "locales/fr.json";
import ar from "locales/ar.json";

// Dictionnaires maison, sans dépendance lourde.
// Clés en pointillé : t('panier.titre'). Repli : ar -> fr -> clé elle-même.
const DICTIONNAIRES = { fr, ar };

export const LOCALES = ["fr", "ar"];
export const LOCALE_DEFAUT = "fr";
export const CLE_LOCALE = "ptech-locale";

const chercher = (dictionnaire, cle) =>
  cle.split(".").reduce((acc, partie) => {
    if (acc && typeof acc === "object") return acc[partie];
    return undefined;
  }, dictionnaire);

export const traduire = (locale, cle, variables) => {
  const loc = LOCALES.includes(locale) ? locale : LOCALE_DEFAUT;
  let texte = chercher(DICTIONNAIRES[loc], cle);
  if (texte === undefined && loc !== LOCALE_DEFAUT) {
    texte = chercher(DICTIONNAIRES[LOCALE_DEFAUT], cle);
  }
  if (texte === undefined) return cle;
  if (variables) {
    Object.keys(variables).forEach((nom) => {
      texte = String(texte).replaceAll(`{${nom}}`, String(variables[nom]));
    });
  }
  return texte;
};

export const estRTL = (locale) => locale === "ar";

// Hook de traduction : t('panier.titre') + locale courante + sens de lecture.
export const useTr = () => {
  const { locale } = useRouter();
  const loc = LOCALES.includes(locale) ? locale : LOCALE_DEFAUT;
  return {
    t: (cle, variables) => traduire(loc, cle, variables),
    locale: loc,
    rtl: estRTL(loc),
  };
};

// Persistance du choix de langue (localStorage). Le routage de locale Next
// reste la source de vérité pour l'URL ; ce choix ne fait que restaurer
// la dernière langue au retour de l'utilisateur.
export const lireLocaleStockee = () => {
  try {
    const valeur = window.localStorage.getItem(CLE_LOCALE);
    return LOCALES.includes(valeur) ? valeur : null;
  } catch (e) {
    return null;
  }
};

export const stockerLocale = (locale) => {
  try {
    if (LOCALES.includes(locale)) {
      window.localStorage.setItem(CLE_LOCALE, locale);
    }
  } catch (e) {
    // Stockage indisponible : la navigation par locale suffit.
  }
};
