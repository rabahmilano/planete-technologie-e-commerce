import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";

// Polices réellement chargées via next/font : téléchargées au build, sans
// requête client, display swap. Inter pour le texte latin, IBM Plex Sans
// Arabic pour l'arabe (plus lisible aux petites tailles qu'une police Kufi,
// orientée titrage). Les classes de variables sont posées sur <body> dans
// pages/_document.js ; theme.js référence les familles générées.
export const policeLatine = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-ptech-latin",
});

// preload: false pour l'arabe : les pages FR ne doivent pas télécharger
// ~200 Ko de polices inutilisées (le préchargement de toutes les variantes
// par next/font sature la bande passante mobile et retarde le LCP). Les
// pages AR les récupèrent à la demande ; le fallback métrique de next/font
// limite le décalage au swap.
export const policeArabe = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-ptech-arabe",
});
