import { createTheme } from "@mui/material/styles";

// Palette de marque Planète Tech.
// Primaire #9155FD conservé (continuité avec le dashboard), bleu nuit profond
// pour le header/footer, ambre chaud pour les promos et CTA secondaires,
// vert de confiance, neutres propres. Aucune couleur ad hoc dans les pages :
// tout passe par ce thème.
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
  texteSecondaire: "#6B7280",
  bordure: "#E5E7EB",
};

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
      error: { main: "#DC2626" },
      warning: { main: COULEURS.ambre, dark: COULEURS.ambreFonce },
      background: { default: COULEURS.fond, paper: "#FFFFFF" },
      text: {
        primary: COULEURS.texte,
        secondary: COULEURS.texteSecondaire,
      },
      divider: COULEURS.bordure,
    },
    typography: {
      // Pile système : pas de police externe, donc pas de dépendance réseau.
      // "Segoe UI" / Tahoma rendent correctement l'arabe sous Windows.
      fontFamily: rtl
        ? '"Segoe UI", Tahoma, "Noto Kufi Arabic", Arial, sans-serif'
        : 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { fontWeight: 600, textTransform: "none" },
    },
    shape: { borderRadius: 12 },
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
            boxShadow: "0 1px 3px rgba(11,31,58,0.08)",
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
