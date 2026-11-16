import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { usePanier } from "src/context/CartContext";
import { formaterPrix } from "src/lib/format";
import { useTr } from "src/lib/i18n";

// Barre de panier fixe en bas, mobile uniquement. Masquée sur le panier et
// la commande (ces pages ont déjà leur CTA) et quand le panier est vide.
const BarrePanierMobile = ({ masquee }) => {
  const { nbArticles, sousTotal } = usePanier();
  const { t, locale } = useTr();

  if (masquee || nbArticles === 0) return null;

  return (
    <Box
      sx={{
        display: { xs: "flex", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        px: 2,
        py: 1.5,
        bgcolor: "navy.main",
        color: "#FFFFFF",
        boxShadow: "0 -2px 12px rgba(11,31,58,0.25)",
        // Zone de sécurité bas (iPhone & co).
        pb: "calc(12px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <Box>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          {t("commun.panier")} · {nbArticles}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {formaterPrix(sousTotal, locale)}
        </Typography>
      </Box>
      <Link href="/panier" passHref legacyBehavior>
        <Button
          component="a"
          variant="contained"
          color="secondary"
          startIcon={<ShoppingCartIcon />}
          sx={{ minHeight: 48, flexShrink: 0 }}
        >
          {t("panier.voirPanier")}
        </Button>
      </Link>
    </Box>
  );
};

export default BarrePanierMobile;
