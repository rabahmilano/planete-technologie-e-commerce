import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import ImageProduit from "src/components/ImageProduit";
import { formaterPrix } from "src/lib/format";
import { urlImage } from "src/lib/api";
import { usePanier } from "src/context/CartContext";
import { useTr } from "src/lib/i18n";
import { nomProduit, stockFaible, stockNumerique } from "src/lib/produit";
import { JETONS } from "src/lib/theme";

// Anatomie fixe d'une carte produit (§3.3 du cahier des charges) :
// photo 1:1 avec AU PLUS UN badge (remise calculée, sinon « Promo ») ;
// rupture = photo estompée + texte, jamais une pile de chips ; nom 2 lignes ;
// prix + prix barré + remise ; indice de paliers réels ; CTA ambre pleine
// largeur mobile. Pas d'étoiles, pas de frais inventés : seules les données
// réelles de l'API s'affichent.
const ProductCard = ({ produit }) => {
  const { ajouter } = usePanier();
  const { t, locale } = useTr();

  const remise =
    produit.prix_barre && produit.prix_effectif < produit.prix_barre
      ? Math.round(
          ((produit.prix_barre - produit.prix_effectif) / produit.prix_barre) *
            100,
        )
      : null;

  // Paliers de quantité réels : on signale le premier palier au-delà de 1.
  const palierSuivant = (produit.paliers || []).find(
    (palier) => palier.quantite_min > 1,
  );
  const horsStock = !produit.en_stock;
  const presqueEpuise = produit.en_stock && stockFaible(produit);

  // Nom accessible du lien photo : les textes VISIBLEMENT présents dans le
  // lien (badge remise, overlay rupture) doivent s'y retrouver (WCAG 2.5.3).
  const extrasLien = [
    horsStock ? t("commun.ruptureStock") : null,
    remise !== null ? `−${remise} %` : produit.promo_active && !horsStock ? t("commun.promo") : null,
  ].filter(Boolean);
  const nomLien = extrasLien.length
    ? `${nomProduit(produit)} — ${extrasLien.join(" — ")}`
    : nomProduit(produit);

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 150ms ease-out",
        "&:hover": { boxShadow: "0 6px 20px rgba(11,31,58,0.14)" },
      }}
    >
      <Link href={`/produits/${produit.slug}`} passHref legacyBehavior>
        <Box
          component="a"
          aria-label={nomLien}
          sx={{ textDecoration: "none", display: "block" }}
        >
          <Box sx={{ position: "relative" }}>
            <ImageProduit
              src={produit.image_principale ? urlImage(produit.image_principale) : null}
              alt=""
              ratio={1}
              sizes="(max-width: 600px) 46vw, (max-width: 900px) 31vw, 280px"
              sx={{
                bgcolor: "background.paper",
                borderBottom: "1px solid",
                borderColor: "divider",
                filter: horsStock ? "grayscale(1)" : undefined,
                opacity: horsStock ? 0.55 : 1,
                transition: "opacity 200ms ease-out",
              }}
              styleImage={{ objectFit: "contain" }}
            />
            {/* Un seul badge sur la photo : la remise réelle, sinon « Promo ». */}
            {remise !== null && !horsStock && (
              <Chip
                label={`−${remise} %`}
                size="small"
                sx={{
                  position: "absolute",
                  top: 8,
                  insetInlineStart: 8,
                  bgcolor: JETONS.promo.fond,
                  color: JETONS.promo.texte,
                  fontWeight: 700,
                }}
              />
            )}
            {remise === null && produit.promo_active && !horsStock && (
              <Chip
                label={t("commun.promo")}
                size="small"
                sx={{
                  position: "absolute",
                  top: 8,
                  insetInlineStart: 8,
                  bgcolor: JETONS.promo.fond,
                  color: JETONS.promo.texte,
                  fontWeight: 700,
                }}
              />
            )}
            {horsStock && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    bgcolor: "background.paper",
                    color: "text.primary",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {t("commun.ruptureStock")}
                </Typography>
              </Box>
            )}
          </Box>
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
            {nomProduit(produit)}
          </Typography>
        </Link>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
          {/* Prix : la plus grande valeur numérique de la carte ; chiffres
              tabulaires (variante `price` du thème). */}
          <Typography variant="price" component="p" color="primary">
            {formaterPrix(produit.prix_effectif, locale)}
          </Typography>
          {produit.prix_barre && produit.prix_effectif < produit.prix_barre && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: "line-through" }}
            >
              {formaterPrix(produit.prix_barre, locale)}
            </Typography>
          )}
        </Box>
        {/* Paliers de quantité réels uniquement ; indicateur discret. */}
        {palierSuivant && (
          <Typography variant="caption" color="text.secondary">
            {t("produit.aPartirDe")} {palierSuivant.quantite_min}{" "}
            {t("produit.pieces")} · {formaterPrix(palierSuivant.prix_unitaire, locale)}
          </Typography>
        )}
        {presqueEpuise && (
          <Typography variant="caption" color="error">
            {t("produit.plusQue", { n: stockNumerique(produit) })}
          </Typography>
        )}
        <Box sx={{ mt: "auto", pt: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            disabled={horsStock}
            onClick={() => ajouter(produit, 1)}
          >
            {horsStock ? t("commun.ruptureStock") : t("commun.ajouterPanier")}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
