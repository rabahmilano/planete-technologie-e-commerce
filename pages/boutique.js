import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
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
import { getFamilles, getProduits } from "src/lib/api";

const Boutique = () => {
  const router = useRouter();
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
      .catch(() => setErreur("Impossible de charger les produits."))
      .finally(() => setChargement(false));
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
        Boutique
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Rechercher"
              size="small"
              defaultValue={filtres.recherche || ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  appliquerFiltres({ recherche: e.target.value });
                }
              }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select
                label="Catégorie"
                value={filtres.famille || ""}
                onChange={(e) =>
                  appliquerFiltres({ famille: e.target.value })
                }
              >
                <MenuItem value="">Toutes les catégories</MenuItem>
                {familles.map((famille) => (
                  <MenuItem key={famille.id} value={famille.id}>
                    {famille.nom} ({famille.nb_produits})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Prix min"
                size="small"
                type="number"
                defaultValue={filtres.prix_min || ""}
                onBlur={(e) =>
                  appliquerFiltres({ prix_min: e.target.value })
                }
              />
              <TextField
                label="Prix max"
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
              label="En promotion"
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
              label="En stock uniquement"
            />
            <Button
              variant="outlined"
              onClick={() => router.push("/boutique")}
            >
              Effacer les filtres
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
            }}
          >
            <Typography color="text.secondary">
              {total} produit(s)
            </Typography>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Trier par</InputLabel>
              <Select
                label="Trier par"
                value={filtres.tri || "pertinence"}
                onChange={(e) => appliquerFiltres({ tri: e.target.value })}
              >
                <MenuItem value="pertinence">Pertinence</MenuItem>
                <MenuItem value="prix_asc">Prix croissant</MenuItem>
                <MenuItem value="prix_desc">Prix décroissant</MenuItem>
                <MenuItem value="nouveautes">Nouveautés</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {erreur && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erreur}
            </Alert>
          )}
          {chargement ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : produits.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 6, textAlign: "center" }}>
              Aucun produit ne correspond à ces critères.
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
