import { Box, Button, Typography } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ImageProduit from "src/components/ImageProduit";
import { urlImage } from "src/lib/api";
import { formaterPrix } from "src/lib/format";
import { useTr } from "src/lib/i18n";
import { nomProduit } from "src/lib/produit";
import { Z_INDEX } from "src/lib/theme";

// Barre d'achat mobile collante : apparaît quand le CTA principal sort de
// l'écran (375 px). Miniature + prix courant × quantité + CTA ambre. Elle
// se pose au-dessus de la barre d'onglets uniquement : la barre panier est
// masquée sur la fiche produit (Layout), il n'y a donc plus que 2 barres
// fixes en mobile au lieu de 3.
const BarreAchatMobile = ({ produit, quantite, prixUnitaire, visible, onAjouter }) => {
  const { t, locale } = useTr();

  if (!visible) return null;

  const bas = "calc(56px + env(safe-area-inset-bottom, 0px))";

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: bas,
        insetInlineStart: 0,
        insetInlineEnd: 0,
        zIndex: Z_INDEX.barrePanierMobile,
        display: { xs: "flex", md: "none" },
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.25,
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        boxShadow: "0 -6px 20px rgba(11,31,58,0.14)",
      }}
    >
      <ImageProduit
        src={produit.image_principale ? urlImage(produit.image_principale) : null}
        alt=""
        largeur={48}
        hauteur={48}
        sx={{ borderRadius: 1.5, flexShrink: 0 }}
        styleImage={{ objectFit: "contain" }}
      />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
        >
          {nomProduit(produit)}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, color: "navy.main" }}>
          {formaterPrix(prixUnitaire * quantite, locale)}
          {quantite > 1 && (
            <Box component="span" sx={{ color: "text.secondary", fontWeight: 400 }}>
              {" "}
              ({quantite} × {formaterPrix(prixUnitaire, locale)})
            </Box>
          )}
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="secondary"
        size="small"
        disabled={!produit.en_stock}
        startIcon={<ShoppingCartIcon fontSize="small" />}
        onClick={onAjouter}
        sx={{ flexShrink: 0, minHeight: 44 }}
      >
        {produit.en_stock ? t("commun.ajouterPanier") : t("commun.ruptureStock")}
      </Button>
    </Box>
  );
};

export default BarreAchatMobile;
