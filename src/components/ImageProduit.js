import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Box } from "@mui/material";

// Placeholder de marque : panneau bleu nuit + logo dans sa pastille blanche.
// Remplace le repli emoji et les carrés gris : jamais d'espace mort, jamais
// d'emoji dans l'interface. Purement décoratif (aria-hidden).
export const PlaceholderMarque = ({ sx }) => (
  <Box
    aria-hidden="true"
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "navy.main",
      ...sx,
    }}
  >
    <Box className="logo-chip">
      {/* Logo optimisé (l'original /mini-logo.svg embarque un raster de
          128 Ko ; cette version WebP 3 Ko est affichée à 44 px). */}
      <Box component="img" src="/mini-logo-min.webp" alt="" sx={{ height: 44 }} />
    </Box>
  </Box>
);

// Image produit : next/image (srcset, lazy loading, formats modernes via le
// pipeline d'optimisation) avec repli sur le placeholder de marque en cas
// d'échec — y compris un échec survenu AVANT l'hydratation (l'évènement
// onError est alors déjà passé quand React attache son gestionnaire ; on le
// détecte via complete + naturalWidth, comme ImageSecurisee).
//
// Deux modes :
//  - bloc à ratio fixe (défaut) : conteneur `aspect-ratio` + Image fill —
//    l'espace est réservé avant le chargement, aucune variation de mise en
//    page (CLS) ;
//  - taille fixe : passer largeur/hauteur (vignettes 72 px, panier).
const ImageProduit = ({
  src,
  alt,
  ratio = 1,
  largeur,
  hauteur,
  prioritaire = false,
  sizes,
  sx,
  styleImage,
}) => {
  const conteneurRef = useRef(null);
  const [echec, setEchec] = useState(false);
  const [chargee, setChargee] = useState(false);

  // Écoute native (et non les props onError/onLoad de next/image) : les
  // évènements load/error ne se délèguent pas de façon fiable à travers le
  // pipeline React. Le contrôle complete/naturalWidth couvre les échecs
  // survenus AVANT l'hydratation, l'écouteur ceux qui surviennent après.
  useEffect(() => {
    const img = conteneurRef.current?.querySelector("img");
    if (!img) return;
    const surEchec = () => setEchec(true);
    const surCharge = () => setChargee(true);
    if (img.complete && img.naturalWidth === 0) setEchec(true);
    if (img.complete && img.naturalWidth > 0) setChargee(true);
    img.addEventListener("error", surEchec);
    img.addEventListener("load", surCharge);
    return () => {
      img.removeEventListener("error", surEchec);
      img.removeEventListener("load", surCharge);
    };
  }, [src]);

  const modeFill = largeur === undefined;

  return (
    <Box
      ref={conteneurRef}
      sx={{
        position: "relative",
        overflow: "hidden",
        ...(modeFill
          ? { aspectRatio: String(ratio) }
          : { width: largeur, height: hauteur }),
        ...sx,
      }}
    >
      {echec || !src ? (
        <PlaceholderMarque sx={{ position: "absolute", inset: 0 }} />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill={modeFill}
          width={modeFill ? undefined : largeur}
          height={modeFill ? undefined : hauteur}
          priority={prioritaire}
          sizes={sizes}
          onError={() => setEchec(true)}
          onLoad={() => setChargee(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: chargee ? 1 : 0,
            transition: "opacity 200ms ease-out",
            ...styleImage,
          }}
        />
      )}
    </Box>
  );
};

export default ImageProduit;
