import { useEffect, useRef } from "react";
import { Box } from "@mui/material";

// <img> avec détection d'échec robuste en SSR : si l'image a échoué avant
// l'hydratation, l'évènement onError est déjà passé quand React attache
// son gestionnaire ; on détecte alors l'échec via complete + naturalWidth.
// Attention : ne pas remettre l'état d'erreur à false dans un useEffect du
// parent — les effets enfants tournent AVANT ceux du parent, un reset
// parent écraserait la détection. Pour réinitialiser par produit, remonter
// le composant avec key={slug}.
const ImageSecurisee = ({ src, alt, sx, onErreur, ...props }) => {
  const ref = useRef(null);
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) onErreur?.();
  }, [src]);
  return (
    <Box
      component="img"
      ref={ref}
      src={src}
      alt={alt}
      sx={sx}
      onError={() => onErreur?.()}
      {...props}
    />
  );
};

export default ImageSecurisee;
