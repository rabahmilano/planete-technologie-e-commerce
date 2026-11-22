import { createTheme } from "@mui/material/styles";
import { policeArabe, policeLatine } from "src/lib/fonts";

// Palette de marque Planète Tech.
// Primaire #9155FD conservé (continuité avec le dashboard), bleu nuit profond
// pour le header/footer, ambre chaud réservé aux CTA et au badge promo,
// vert de confiance, neutres propres. Aucune couleur ad hoc dans les pages :
// tout passe par ce thème ou par les jetons sémantiques ci-dessous.
export const COULEURS = {
  primaire: "#9155FD",
  primaireFonce: "#6D28D9",
  primaireClair: "#B794FF",
  bleuNuit: "#0B1F3A",
  bleuNuitFonce: "#071527",
  bleuNuitClair: "#16324F",
  ambre: "#F59E0B",
  ambreFonce: "#B45309",
  ambreClair: "#FDE68A",
  vertConfiance: "#16A34A",
  vertFonce: "#15803D",
  fond: "#F7F8FA",
  texte: "#1F2937",
  // #475569 : plancher AA confortable sur fond #F7F8FA (l'ancien #6B7280
  // frôlait 4.5:1 et dépendait du fond pour passer).
  texteSecondaire: "#475569",
  bordure: "#E5E7EB",
};

// Ombres : échelle unique. Le survol ne change que couleur/opacité/ombre,
// jamais de transformation qui décale la mise en page.
export const OMBRES = {
  xs: "0 1px 2px rgba(11,31,58,0.06)",
  sm: "0 1px 3px rgba(11,31,58,0.08)",
  md: "0 6px 20px rgba(11,31,58,0.14)",
  lg: "0 12px 32px rgba(11,31,58,0.18)",
};

// Z-index : échelle unique, aucun zIndex improvisé dans les composants.
// Entête et barre panier mobile partagent 1100 ; dropdown recherche et
// tiroir de filtres 1200 ; dialogues et lien d'évitement 1300 ; toasts 1400.
export const Z_INDEX = {
  entete: 1100,
  barrePanierMobile: 1100,
  dropdownRecherche: 1200,
  tiroirFiltres: 1200,
  dialogue: 1300,
  lienEvitement: 1300,
  toast: 1400,
};

// Espacement : grille 8 pt. Via sx, les multiples MUI correspondent :
// fin = 0.5, petit = 1, reduit = 1.5, base = 2, moyen = 3, grand = 4,
// large = 6. Éléments liés 8–16, cartes 16, sections 32 (mobile) / 48.
export const ESPACEMENT = {
  fin: 4,
  petit: 8,
  reduit: 12,
  base: 16,
  moyen: 24,
  grand: 32,
  large: 48,
};

// Jetons sémantiques : intention d'usage, jamais une valeur hex directe
// dans les pages. L'ambre n'apparaît que sur le CTA principal et le badge
// promo ; les chips promo passent par le duo fond clair / texte bleu nuit
// (#FDE68A + #0B1F3A : ≈10:1 — l'ambre foncé frôlait 4.5:1).
export const JETONS = {
  texte: { principal: COULEURS.texte, secondaire: COULEURS.texteSecondaire },
  fond: { principal: COULEURS.fond, carte: "#FFFFFF" },
  cta: { fond: COULEURS.ambre, texte: COULEURS.texte, survol: COULEURS.ambreFonce },
  promo: { fond: COULEURS.ambreClair, texte: COULEURS.bleuNuit },
  retours: {
    succes: COULEURS.vertConfiance,
    succesFonce: COULEURS.vertFonce,
    erreur: "#DC2626",
    attention: COULEURS.ambreFonce,
  },
};

// Breakpoints MUI par défaut (xs 0 / sm 600 / md 900 / lg 1200 / xl 1536) ;
// clés @media pour l'échelle typographique responsive ci-dessous.
const SM = "@media (min-width: 600px)";
const MD = "@media (min-width: 900px)";

export const creerThemeBoutique = (rtl = false) =>
  createTheme({
    direction: rtl ? "rtl" : "ltr",
    palette: {
      mode: "light",
      primary: {
        main: COULEURS.primaire,
        dark: COULEURS.primaireFonce,
        light: COULEURS.primaireClair,
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: COULEURS.ambre,
        dark: COULEURS.ambreFonce,
        light: COULEURS.ambreClair,
        contrastText: "#1F2937",
      },
      navy: {
        main: COULEURS.bleuNuit,
        dark: COULEURS.bleuNuitFonce,
        light: COULEURS.bleuNuitClair,
        contrastText: "#FFFFFF",
      },
      success: { main: COULEURS.vertConfiance, dark: COULEURS.vertFonce },
      error: { main: JETONS.retours.erreur },
      warning: { main: COULEURS.ambre, dark: COULEURS.ambreFonce },
      background: { default: COULEURS.fond, paper: JETONS.fond.carte },
      text: {
        primary: COULEURS.texte,
        secondary: COULEURS.texteSecondaire,
      },
      divider: COULEURS.bordure,
    },
    typography: {
      // Polices réellement chargées via next/font (src/lib/fonts.js) :
      // Inter pour le français, IBM Plex Sans Arabic pour l'arabe. Fini les
      // noms déclarés mais jamais téléchargés.
      fontFamily: rtl
        ? `${policeArabe.style.fontFamily}, "Segoe UI", Tahoma, Arial, sans-serif`
        : `${policeLatine.style.fontFamily}, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
      // Échelle typographique (ratio ~1.25, corps jamais < 16 px).
      // display : titre héros uniquement ; h1/h2/h3 : pages et sections.
      display: {
        fontSize: "1.75rem",
        fontWeight: 800,
        lineHeight: 1.2,
        [MD]: { fontSize: "2.5rem" },
      },
      h1: {
        fontSize: "1.5rem",
        fontWeight: 700,
        lineHeight: 1.25,
        [MD]: { fontSize: "2rem" },
      },
      h2: {
        fontSize: "1.25rem",
        fontWeight: 700,
        lineHeight: 1.3,
        [MD]: { fontSize: "1.75rem" },
      },
      h3: {
        fontSize: "1.125rem",
        fontWeight: 600,
        lineHeight: 1.35,
        [MD]: { fontSize: "1.25rem" },
      },
      // Titre produit (fiche produit, 2 lignes max à l'affichage).
      productTitle: {
        fontSize: "1.25rem",
        fontWeight: 700,
        lineHeight: 1.3,
        [MD]: { fontSize: "1.5rem" },
      },
      // Prix : le plus grand chiffre d'une carte après la photo ; chiffres
      // tabulaires pour aligner les colonnes de prix en DZD.
      price: {
        fontSize: "1.25rem",
        fontWeight: 700,
        lineHeight: 1.2,
        fontVariantNumeric: "tabular-nums",
        [MD]: { fontSize: "1.375rem" },
      },
      // Corps : 16 px minimum côté latin (iOS zoome les champs < 16 px).
      // Arabe : plus grand (17 px) et plus aéré (1.75) — l'arabe se lit
      // ~1-2 pt plus petit à taille égale.
      body1: rtl
        ? { fontSize: "1.0625rem", lineHeight: 1.75 }
        : { lineHeight: 1.6 },
      body2: rtl
        ? { fontSize: "0.875rem", lineHeight: 1.6 }
        : { fontSize: "0.875rem", lineHeight: 1.5 },
      caption: {
        fontSize: "0.75rem",
        lineHeight: 1.4,
        [SM]: { fontSize: "0.8125rem" },
      },
      // h4/h5/h6 conservent les tailles MUI actuelles : les pages existantes
      // s'y appuient ; elles migreront vers l'échelle phase par phase.
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { fontWeight: 600, textTransform: "none" },
    },
    shape: { borderRadius: 12 },
    zIndex: {
      appBar: Z_INDEX.entete,
      drawer: Z_INDEX.tiroirFiltres,
      modal: Z_INDEX.dialogue,
      snackbar: Z_INDEX.toast,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10, minHeight: 44, paddingInline: 20 },
          containedSecondary: { color: "#1F2937" },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${COULEURS.bordure}`,
            boxShadow: OMBRES.sm,
          },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiTextField: {
        defaultProps: { size: "small" },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundColor: COULEURS.bleuNuit, color: "#FFFFFF" },
        },
      },
    },
  });
