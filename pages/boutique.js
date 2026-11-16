import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import ProductCard from "src/components/ProductCard";
import { SqueletteProduits } from "src/components/Squelettes";
import { getFamilles, getProduits } from "src/lib/api";
import { useTr } from "src/lib/i18n";
import { nomFamille } from "src/lib/produit";

const Boutique = () => {
  const router = useRouter();
  const { t, locale } = useTr();
  const [familles, setFamilles] = useState([]);
  const [produits, setProduits] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  const filtres = router.query;
  const page = parseInt(filtres.page, 10) || 1;

  useEffect(() => {
    getFamilles()
      .then(setFamilles)
      .catch(() => setFamilles([]));
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setChargement(true);
    getProduits({
      recherche: filtres.recherche || undefined,
      famille: filtres.famille || undefined,
      prix_min: filtres.prix_min || undefined,
      prix_max: filtres.prix_max || undefined,
      promo: filtres.promo || undefined,
      en_stock: filtres.en_stock || undefined,
      tri: filtres.tri || undefined,
      page,
      limit: 24,
    })
      .then((donnees) => {
        setProduits(donnees.produits);
        setTotalPages(donnees.totalPages || 1);
        setTotal(donnees.total);
        setErreur("");
      })
      .catch(() => setErreur(t("commun.erreurProduits")))
      .finally(() => setChargement(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, JSON.stringify(filtres)]);

  const appliquerFiltres = (nouveaux) => {
    const requete = { ...filtres, ...nouveaux, page: 1 };
    Object.keys(requete).forEach((cle) => {
      if (
        requete[cle] === undefined ||
        requete[cle] === "" ||
        requete[cle] === false
      ) {
        delete requete[cle];
      }
    });
    // router.push conserve la locale courante.
    router.push({ pathname: "/boutique", query: requete });
  };

  const changerPage = (e, nouvellePage) => {
    router.push({
      pathname: "/boutique",
      query: { ...filtres, page: nouvellePage },
    });
    window.scrollTo(0, 0);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
        {t("commun.boutique")}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label={t("commun.rechercher")}
              size="small"
              defaultValue={filtres.recherche || ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  appliquerFiltres({ recherche: e.target.value });
                }
              }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel id="categorie-label">
                {t("filtres.categorie")}
              </InputLabel>
              <Select
                labelId="categorie-label"
                id="categorie"
                label={t("filtres.categorie")}
                value={filtres.famille || ""}
                onChange={(e) =>
                  appliquerFiltres({ famille: e.target.value })
                }
              >
                <MenuItem value="">{t("filtres.toutesCategories")}</MenuItem>
                {familles.map((famille) => (
                  <MenuItem key={famille.id} value={famille.id}>
                    {nomFamille(famille, locale)} ({famille.nb_produits})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label={t("filtres.prixMin")}
                size="small"
                type="number"
                defaultValue={filtres.prix_min || ""}
                onBlur={(e) =>
                  appliquerFiltres({ prix_min: e.target.value })
                }
              />
              <TextField
                label={t("filtres.prixMax")}
                size="small"
                type="number"
                defaultValue={filtres.prix_max || ""}
                onBlur={(e) =>
                  appliquerFiltres({ prix_max: e.target.value })
                }
              />
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filtres.promo === "true"}
                  onChange={(e) =>
                    appliquerFiltres({ promo: e.target.checked })
                  }
                />
              }
              label={t("filtres.enPromo")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filtres.en_stock === "true"}
                  onChange={(e) =>
                    appliquerFiltres({ en_stock: e.target.checked })
                  }
                />
              }
              label={t("filtres.enStockUniquement")}
            />
            <Button
              variant="outlined"
              onClick={() => router.push("/boutique")}
            >
              {t("filtres.effacer")}
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={9}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography color="text.secondary">
              {t("filtres.resultats", { n: total })}
            </Typography>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="tri-label">{t("filtres.trierPar")}</InputLabel>
              <Select
                labelId="tri-label"
                id="tri"
                label={t("filtres.trierPar")}
                value={filtres.tri || "pertinence"}
                onChange={(e) => appliquerFiltres({ tri: e.target.value })}
              >
                <MenuItem value="pertinence">
                  {t("filtres.pertinence")}
                </MenuItem>
                <MenuItem value="prix_asc">{t("filtres.prixAsc")}</MenuItem>
                <MenuItem value="prix_desc">{t("filtres.prixDesc")}</MenuItem>
                <MenuItem value="nouveautes">
                  {t("filtres.nouveautes")}
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
          {erreur && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erreur}
            </Alert>
          )}
          {chargement ? (
            <SqueletteProduits nombre={12} />
          ) : produits.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 6, textAlign: "center" }}>
              {t("commun.aucunProduit")}
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {produits.map((produit) => (
                <Grid item xs={6} sm={4} lg={3} key={produit.slug}>
                  <ProductCard produit={produit} />
                </Grid>
              ))}
            </Grid>
          )}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={changerPage}
                color="primary"
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Boutique;
