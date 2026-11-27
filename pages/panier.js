import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ImageProduit from "src/components/ImageProduit";
import StepperQuantite from "src/components/StepperQuantite";
import CodePromo from "src/components/CodePromo";
import ProductCard from "src/components/ProductCard";
import { usePanier } from "src/context/CartContext";
import { formaterPrix } from "src/lib/format";
import { getProduit, getTarif, getWilayas } from "src/lib/api";
import { poidsFacturePanierGrammes } from "src/lib/produit";
import { useTr } from "src/lib/i18n";

const Panier = () => {
  const { t, locale } = useTr();
  const {
    articles,
    changerQuantite,
    retirer,
    sousTotal,
    codePromo,
  } = usePanier();
  const [wilayas, setWilayas] = useState([]);
  const [wilaya, setWilaya] = useState("");
  const [typeLivraison, setTypeLivraison] = useState("DOMICILE");
  const [frais, setFrais] = useState(null);
  const [lies, setLies] = useState([]);

  useEffect(() => {
    getWilayas()
      .then(setWilayas)
      .catch(() => setWilayas([]));
  }, []);

  useEffect(() => {
    if (!wilaya) {
      setFrais(null);
      return;
    }
    // D8 : le devis du panier porte le poids facturé total.
    getTarif(wilaya, typeLivraison, {
      poids_grammes: Math.round(poidsFacturePanierGrammes(articles)) || undefined,
    })
      .then(setFrais)
      .catch(() => setFrais(null));
  }, [wilaya, typeLivraison, articles]);

  // Cross-sell : produits liés RÉELS du premier article du panier, sous le
  // CTA de commande seulement (jamais de suggestion inventée).
  useEffect(() => {
    const premier = articles[0]?.slug;
    if (!premier) {
      setLies([]);
      return;
    }
    getProduit(premier)
      .then((p) => setLies((p.produits_lies || []).slice(0, 4)))
      .catch(() => setLies([]));
  }, [articles[0]?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Retrait : focus renvoyé sur la ligne suivante (ou le titre du panier),
  // jamais perdu sur <body>. Le délai laisse React committer le nouveau
  // rendu avant de chercher la rangée.
  const retenirFocus = (index) => {
    setTimeout(() => {
      const rangees = document.querySelectorAll("[data-rangee-panier]");
      const suivante = rangees[Math.min(index, rangees.length - 1)];
      if (suivante) {
        const bouton = suivante.querySelector("button");
        bouton?.focus();
      } else {
        document.getElementById("titre-panier")?.focus();
      }
    }, 60);
  };

  const reduction = codePromo ? codePromo.montant_reduction : 0;
  const fraisLivraison = frais?.disponible ? frais.prix : null;
  const totalAvecLivraison = Math.max(0, sousTotal - reduction + (fraisLivraison || 0));
  const totalHorsLivraison = Math.max(0, sousTotal - reduction);

  return (
    <Box>
      <Typography
        id="titre-panier"
        tabIndex={-1}
        variant="h1"
        component="h1"
        sx={{ mb: 3, "&:focus": { outline: "none" } }}
      >
        {t("panier.titre")}
      </Typography>
      {articles.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <ShoppingCartIcon sx={{ fontSize: 64, color: "text.secondary", opacity: 0.5 }} />
          <Typography color="text.secondary" sx={{ mb: 2, mt: 1 }}>
            {t("panier.vide")}
          </Typography>
          <Link href="/boutique" passHref legacyBehavior>
            <Button component="a" variant="contained" color="secondary">
              {t("commun.voirBoutique")}
            </Button>
          </Link>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {articles.map((article, index) => (
              <Box
                key={article.slug}
                data-rangee-panier
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  p: 2,
                  mb: 2,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
              >
                {/* Vignette 80 px : échec d'image = placeholder de marque,
                    jamais un carré gris vide. */}
                <ImageProduit
                  src={article.image || null}
                  alt=""
                  largeur={80}
                  hauteur={80}
                  sx={{ borderRadius: 1.5, flexShrink: 0 }}
                  styleImage={{ objectFit: "cover" }}
                />
                <Box sx={{ flexGrow: 1, minWidth: 140 }}>
                  <Link
                    href={`/produits/${article.slug}`}
                    passHref
                    legacyBehavior
                  >
                    <Typography
                      component="a"
                      sx={{
                        textDecoration: "none",
                        color: "text.primary",
                        fontWeight: 600,
                      }}
                    >
                      {article.designation}
                    </Typography>
                  </Link>
                  <Typography sx={{ fontWeight: 700, color: "navy.main" }}>
                    {formaterPrix(article.prix, locale)}
                  </Typography>
                </Box>
                <StepperQuantite
                  valeur={article.quantite}
                  onChange={(n) => changerQuantite(article.slug, n)}
                  libelle={`${t("produit.quantite")} — ${article.designation}`}
                />
                <Typography sx={{ minWidth: 100, textAlign: "end", fontWeight: 700, color: "navy.main" }}>
                  {formaterPrix(article.prix * article.quantite, locale)}
                </Typography>
                <IconButton
                  color="error"
                  onClick={() => {
                    retirer(article.slug);
                    retenirFocus(index);
                  }}
                  aria-label={`${t("panier.retirer")} ${article.designation}`}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            {/* Récapitulatif « caisse » : toujours visible, jamais replié.
                Totaux honnêtes : sans wilaya, la livraison est « à calculer »
                et le total porte son vrai nom (hors livraison). */}
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "background.paper",
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                position: { md: "sticky" },
                top: { md: 88 },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t("panier.recap")}
              </Typography>
              <CodePromo sousTotal={sousTotal} />
              <FormControl size="small" fullWidth>
                <InputLabel id="wilaya-livraison-label">
                  {t("panier.wilayaLivraison")}
                </InputLabel>
                <Select
                  labelId="wilaya-livraison-label"
                  id="wilaya-livraison"
                  label={t("panier.wilayaLivraison")}
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                >
                  <MenuItem value="">{t("panier.choisirWilaya")}</MenuItem>
                  {wilayas.map((w) => (
                    <MenuItem key={w.code} value={w.code}>
                      {w.code} — {w.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel id="type-livraison-label">
                  {t("panier.typeLivraison")}
                </InputLabel>
                <Select
                  labelId="type-livraison-label"
                  id="type-livraison"
                  label={t("panier.typeLivraison")}
                  value={typeLivraison}
                  onChange={(e) => setTypeLivraison(e.target.value)}
                >
                  <MenuItem value="DOMICILE">{t("panier.domicile")}</MenuItem>
                  <MenuItem value="BUREAU">{t("panier.bureau")}</MenuItem>
                </Select>
              </FormControl>
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>{t("panier.sousTotal")}</Typography>
                <Typography>{formaterPrix(sousTotal, locale)}</Typography>
              </Box>
              {reduction > 0 && (
                <Box
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography>{t("panier.reduction")}</Typography>
                  <Typography color="success.main">
                    −{formaterPrix(reduction, locale)}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>{t("panier.livraison")}</Typography>
                <Typography>
                  {!wilaya
                    ? t("panier.livraisonACalculer")
                    : frais?.disponible
                      ? formaterPrix(frais.prix, locale)
                      : t("panier.livraisonTel")}
                </Typography>
              </Box>
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                }}
              >
                <Typography variant="h6" component="p">
                  {!wilaya
                    ? t("panier.totalHorsLivraison")
                    : t("produit.totalALivraison")}
                </Typography>
                <Typography variant="h6" component="p" sx={{ color: "navy.main" }}>
                  {formaterPrix(
                    wilaya && frais?.disponible ? totalAvecLivraison : totalHorsLivraison,
                    locale,
                  )}
                </Typography>
              </Box>
              <Link href="/commande" passHref legacyBehavior>
                <Button component="a" variant="contained" color="secondary" size="large" fullWidth>
                  {t("panier.commander")} — {t("atouts.paiementTitre")}
                </Button>
              </Link>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                {t("commande.notePaiement")}
              </Typography>
            </Box>
          </Grid>
          {/* Cross-sell : sous la ligne de flottaison uniquement, produits
              liés réels du premier article. */}
          {lies.length > 0 && (
            <Grid item xs={12} sx={{ mt: 4 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
                {t("produit.produitsLies")}
              </Typography>
              <Grid container spacing={2}>
                {lies.map((lie) => (
                  <Grid item xs={6} sm={4} md={3} key={lie.slug}>
                    <ProductCard produit={lie} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default Panier;
