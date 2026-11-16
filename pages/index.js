import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Box, Button, Grid, Typography } from "@mui/material";
import ProductCard from "src/components/ProductCard";
import Atouts from "src/components/Atouts";
import { SqueletteProduits } from "src/components/Squelettes";
import { getFamilles, getProduits } from "src/lib/api";
import { useTr } from "src/lib/i18n";
import { nomFamille } from "src/lib/produit";

const Accueil = () => {
  const { t, locale } = useTr();
  const [familles, setFamilles] = useState([]);
  const [misEnAvant, setMisEnAvant] = useState([]);
  const [promos, setPromos] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    Promise.all([
      getFamilles(),
      getProduits({ limit: 8 }),
      getProduits({ promo: true, limit: 8 }),
    ])
      .then(([famillesData, avantData, promosData]) => {
        setFamilles(famillesData);
        // Déduplication : un produit en promo ne se répète pas dans
        // « Mis en avant ». Les deux sections ne sont séparées que si
        // chacune a au moins 3 produits distincts ; sinon une seule
        // section fusionnée (les badges Promo restent visibles sur les
        // cartes).
        const promosUniques = promosData.produits;
        const slugsPromos = new Set(promosUniques.map((p) => p.slug));
        const avantUniques = avantData.produits
          .filter((p) => p.est_mis_en_avant)
          .filter((p) => !slugsPromos.has(p.slug))
          .slice(0, 8);
        if (avantUniques.length >= 3 && promosUniques.length >= 3) {
          setMisEnAvant(avantUniques);
          setPromos(promosUniques);
        } else {
          const fusion = [
            ...promosUniques,
            ...avantUniques.filter(
              (p) => !promosUniques.some((q) => q.slug === p.slug),
            ),
          ];
          setMisEnAvant(fusion);
          setPromos([]);
        }
      })
      .catch(() => setErreur(t("commun.erreurChargement")))
      .finally(() => setChargement(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const TitreSection = ({ children }) => (
    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
      {children}
    </Typography>
  );

  return (
    <Box>
      {erreur && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {erreur}
        </Alert>
      )}

      {/* Hero : bleu nuit -> primaire, proposition de valeur + CTA */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #0B1F3A 0%, #16324F 55%, #9155FD 130%)",
          color: "white",
          borderRadius: 3,
          p: { xs: 3, sm: 5 },
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
          {t("hero.titre")}
        </Typography>
        <Typography variant="h6" sx={{ mt: 1, opacity: 0.9, fontWeight: 400 }}>
          {t("hero.sousTitre")}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 3 }}>
          <Link href="/boutique" passHref legacyBehavior>
            <Button
              component="a"
              variant="contained"
              color="secondary"
              size="large"
            >
              {t("hero.cta")}
            </Button>
          </Link>
        </Box>
        <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
          {t("hero.confiance")}
        </Typography>
      </Box>

      {chargement ? (
        <SqueletteProduits nombre={8} />
      ) : (
        <>
          <TitreSection>{t("sections.categories")}</TitreSection>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {familles.map((famille) => (
              <Grid item xs={6} sm={4} md={3} key={famille.id}>
                <Link
                  href={`/boutique?famille=${famille.id}`}
                  passHref
                  legacyBehavior
                >
                  <Button
                    component="a"
                    fullWidth
                    variant="outlined"
                    sx={{ py: 2, textTransform: "none", fontWeight: 600 }}
                  >
                    {nomFamille(famille, locale)} ({famille.nb_produits})
                  </Button>
                </Link>
              </Grid>
            ))}
            {familles.length === 0 && (
              <Grid item xs={12}>
                <Typography color="text.secondary">
                  {t("commun.aucuneCategorie")}
                </Typography>
              </Grid>
            )}
          </Grid>

          {misEnAvant.length > 0 && (
            <>
              <TitreSection>{t("sections.misEnAvant")}</TitreSection>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {misEnAvant.map((produit) => (
                  <Grid item xs={6} sm={4} md={3} key={produit.slug}>
                    <ProductCard produit={produit} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {promos.length > 0 && (
            <>
              <TitreSection>{t("sections.promos")}</TitreSection>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {promos.map((produit) => (
                  <Grid item xs={6} sm={4} md={3} key={produit.slug}>
                    <ProductCard produit={produit} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}

      <TitreSection>{t("sections.atouts")}</TitreSection>
      <Atouts />
    </Box>
  );
};

export default Accueil;
