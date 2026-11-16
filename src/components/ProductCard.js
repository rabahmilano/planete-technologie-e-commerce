import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import ImageSecurisee from "src/components/ImageSecurisee";
import { formaterPrix } from "src/lib/format";
import { urlImage } from "src/lib/api";
import { usePanier } from "src/context/CartContext";
import { useTr } from "src/lib/i18n";
import { stockFaible, stockNumerique } from "src/lib/produit";

const ProductCard = ({ produit }) => {
  const { ajouter } = usePanier();
  const { t, locale } = useTr();
  // Image indisponible (ex. fichier absent côté backend) : pastille 📦
  // au lieu d'un cadre vide.
  const [imageKO, setImageKO] = useState(false);

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 20px rgba(11,31,58,0.14)",
        },
      }}
    >
      <Link href={`/produits/${produit.slug}`} passHref legacyBehavior>
        <Box component="a" sx={{ textDecoration: "none" }}>
          {produit.image_principale && !imageKO ? (
            <ImageSecurisee
              src={urlImage(produit.image_principale)}
              alt={produit.designation}
              sx={{ height: 180, width: "100%", objectFit: "cover", display: "block" }}
              onErreur={() => setImageKO(true)}
            />
          ) : (
            <Box
              sx={{
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.200",
                color: "grey.600",
                fontSize: 48,
              }}
            >
              📦
            </Box>
          )}
        </Box>
      </Link>
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Link href={`/produits/${produit.slug}`} passHref legacyBehavior>
          <Typography
            component="a"
            variant="subtitle1"
            sx={{
              textDecoration: "none",
              color: "text.primary",
              fontWeight: 600,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 48,
            }}
          >
            {produit.designation}
          </Typography>
        </Link>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", my: 1 }}>
          {produit.promo_active && (
            <Chip label={t("commun.promo")} color="secondary" size="small" />
          )}
          {!produit.en_stock && (
            <Chip label={t("commun.ruptureStock")} size="small" />
          )}
          {produit.est_mis_en_avant && (
            <Chip label={t("commun.misEnAvant")} color="primary" size="small" />
          )}
          {stockFaible(produit) && (
            <Chip
              label={t("produit.plusQue", { n: stockNumerique(produit) })}
              color="error"
              size="small"
            />
          )}
        </Box>
        <Box sx={{ mt: "auto" }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            {formaterPrix(produit.prix_effectif, locale)}
          </Typography>
          {produit.prix_barre && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: "line-through" }}
            >
              {formaterPrix(produit.prix_barre, locale)}
            </Typography>
          )}
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 1 }}
            disabled={!produit.en_stock}
            onClick={() => ajouter(produit, 1)}
          >
            {produit.en_stock
              ? t("commun.ajouterPanier")
              : t("commun.ruptureStock")}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
