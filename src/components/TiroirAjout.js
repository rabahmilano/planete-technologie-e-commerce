import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageProduit from "src/components/ImageProduit";
import StepperQuantite from "src/components/StepperQuantite";
import ProductCard from "src/components/ProductCard";
import { getProduit, urlImage } from "src/lib/api";
import { formaterPrix } from "src/lib/format";
import { usePanier } from "src/context/CartContext";
import { useTr } from "src/lib/i18n";
import { nomProduit } from "src/lib/produit";
import { Z_INDEX } from "src/lib/theme";

// Tiroir « ajout au panier » desktop (décision n°7, pattern Foxtrot) :
// produit ajouté, quantité ajustable, CTA commander pleine largeur, et
// produits liés RÉELS dessous. Mobile : simple toast (écran trop petit).
// Le CartContext déclenche l'évènement « pt-ajout-panier » côté desktop.
const TiroirAjout = () => {
  const router = useRouter();
  const { t, locale, rtl } = useTr();
  const { articles, changerQuantite, sousTotal } = usePanier();
  const [ouvert, setOuvert] = useState(false);
  const [slug, setSlug] = useState(null);
  const [lies, setLies] = useState([]);

  useEffect(() => {
    const surAjout = (e) => {
      setSlug(e.detail?.slug || null);
      setOuvert(true);
    };
    window.addEventListener("ptech-ajout-panier", surAjout);
    return () => window.removeEventListener("ptech-ajout-panier", surAjout);
  }, []);

  // Produits liés réels du produit ajouté : chargés à l'ouverture du tiroir.
  useEffect(() => {
    if (!ouvert || !slug) return;
    getProduit(slug)
      .then((p) => setLies((p.produits_lies || []).slice(0, 4)))
      .catch(() => setLies([]));
  }, [ouvert, slug]);

  const article = articles.find((a) => a.slug === slug);
  const fermer = () => setOuvert(false);
  const commander = () => {
    setOuvert(false);
    router.push("/commande");
  };

  return (
    <Drawer
      anchor={rtl ? "left" : "right"}
      open={ouvert}
      onClose={fermer}
      sx={{ "& .MuiDrawer-paper": { zIndex: Z_INDEX.dialogue, width: 400, p: 3 } }}
    >
      <Box
        role="dialog"
        aria-label={t("commun.ajoutePanier")}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700, flexGrow: 1 }}>
            {t("commun.ajoutePanier")}
          </Typography>
          <IconButton aria-label={t("commun.fermer")} onClick={fermer}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {article && (
          <>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <ImageProduit
                src={article.image || null}
                alt=""
                largeur={64}
                hauteur={64}
                sx={{ borderRadius: 2, flexShrink: 0 }}
                styleImage={{ objectFit: "cover" }}
              />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {article.designation}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>
                  {formaterPrix(article.prix, locale)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <StepperQuantite
                valeur={article.quantite}
                onChange={(n) => changerQuantite(article.slug, n)}
                libelle={t("produit.quantite")}
              />
              <Typography variant="body2" color="text.secondary">
                {formaterPrix(article.prix * article.quantite, locale)}
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body1">{t("panier.sousTotal")}</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {formaterPrix(sousTotal, locale)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              fullWidth
              onClick={commander}
            >
              {t("panier.commander")}
            </Button>
          </>
        )}

        {lies.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {t("produit.produitsLies")}
            </Typography>
            <Grid container spacing={1.5}>
              {lies.map((lie) => (
                <Grid item xs={6} key={lie.slug}>
                  <ProductCard produit={lie} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default TiroirAjout;
