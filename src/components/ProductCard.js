import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ImageProduit from "src/components/ImageProduit";
import { formaterPrix } from "src/lib/format";
import { urlImage } from "src/lib/api";
import { usePanier } from "src/context/CartContext";
import { useTr } from "src/lib/i18n";
import { nomProduit, stockFaible, stockNumerique } from "src/lib/produit";
import { JETONS } from "src/lib/theme";

// Anatomie d'une carte produit (rénovation 23 nov. 2026, patterns
// Shopify/COD) : photo 1:1 en COVER plein cadre (jamais de bandes vides) ;
// AU PLUS UN badge sur la photo (remise réelle, sinon « Promo ») ; rupture
// = photo estompée + texte, jamais une pile de chips ; nom 2 lignes ; prix
// en bleu nuit (couleur dominante du site, variante `price` du thème) +
// prix barré ; indice de paliers réels ; ajout rapide en survol de la
// photo sur desktop, toujours visible sur tactile (pas de gros CTA répété
// sous chaque carte). Pas d'étoiles, pas de frais inventés : seules les
// données réelles de l'API s'affichent.
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
        "&:hover": {
          boxShadow: "0 6px 20px rgba(11,31,58,0.14)",
          "& .ajout-rapide": { opacity: 1 },
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Link href={`/produits/${produit.slug}`} passHref legacyBehavior>
          <Box
            component="a"
            aria-label={nomLien}
            sx={{ textDecoration: "none", display: "block" }}
          >
            <ImageProduit
              src={produit.image_principale ? urlImage(produit.image_principale) : null}
              alt=""
              ratio={1}
              sizes="(max-width: 600px) 46vw, (max-width: 900px) 31vw, 280px"
              sx={{
                bgcolor: "background.default",
                borderBottom: "1px solid",
                borderColor: "divider",
                filter: horsStock ? "grayscale(1)" : undefined,
                opacity: horsStock ? 0.55 : 1,
                transition: "opacity 200ms ease-out",
              }}
              styleImage={{ objectFit: "cover" }}
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
        </Link>
        {/* Ajout rapide : révélé au survol de la carte sur desktop,
            toujours visible sur tactile. Hors du lien photo (un bouton
            dans une ancre est invalide). */}
        {!horsStock && (
          <Box
            className="ajout-rapide"
            sx={{
              position: "absolute",
              insetInline: 0,
              bottom: 0,
              p: 1,
              opacity: 0,
              transition: "opacity 150ms ease-out",
              "@media (hover: none)": { opacity: 1 },
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              size="small"
              startIcon={<AddShoppingCartIcon fontSize="small" />}
              onClick={() => ajouter(produit, 1)}
              aria-label={`${t("commun.ajouterPanier")} — ${nomProduit(produit)}`}
              sx={{ minHeight: 40, boxShadow: "0 4px 16px rgba(11,31,58,0.25)" }}
            >
              {t("commun.ajouterPanier")}
            </Button>
          </Box>
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", pb: 2 }}>
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
              tabulaires (variante `price` du thème, bleu nuit). */}
          <Typography variant="price" component="p">
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
      </CardContent>
    </Card>
  );
};

export default ProductCard;
