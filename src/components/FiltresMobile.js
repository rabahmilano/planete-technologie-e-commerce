import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTr } from "src/lib/i18n";
import { nomFamille } from "src/lib/produit";
import { Z_INDEX } from "src/lib/theme";

// Tiroir-filtres mobile (bas d'écran). Les modifications restent LOCALES au
// tiroir : les résultats ne se rafraîchissent pas sous vos yeux — le bouton
// « Voir les résultats » applique tout d'un coup (règle Baymard). La
// famille est à choix unique : l'API publique n'accepte qu'un identifiant.
const FiltresMobile = ({ ouvert, onFermer, familles, filtres, onAppliquer }) => {
  const { t, locale } = useTr();
  const [brouillon, setBrouillon] = useState({});

  // À l'ouverture : copie des filtres actuels comme point de départ.
  useEffect(() => {
    if (ouvert) {
      setBrouillon({
        recherche: filtres.recherche || "",
        famille: filtres.famille || "",
        prix_min: filtres.prix_min || "",
        prix_max: filtres.prix_max || "",
        promo: filtres.promo === "true",
        en_stock: filtres.en_stock === "true",
      });
    }
  }, [ouvert]); // eslint-disable-line react-hooks/exhaustive-deps

  const modifier = (cle, valeur) =>
    setBrouillon((precedent) => ({ ...precedent, [cle]: valeur }));

  const appliquer = () => {
    onAppliquer({
      recherche: brouillon.recherche || undefined,
      famille: brouillon.famille || undefined,
      prix_min: brouillon.prix_min || undefined,
      prix_max: brouillon.prix_max || undefined,
      promo: brouillon.promo ? "true" : undefined,
      en_stock: brouillon.en_stock ? "true" : undefined,
    });
    onFermer();
  };

  const effacer = () => {
    setBrouillon({
      recherche: "",
      famille: "",
      prix_min: "",
      prix_max: "",
      promo: false,
      en_stock: false,
    });
  };

  return (
    <Drawer
      anchor="bottom"
      open={ouvert}
      onClose={onFermer}
      sx={{ "& .MuiDrawer-paper": { zIndex: Z_INDEX.tiroirFiltres } }}
    >
      <Box
        role="dialog"
        aria-label={t("filtres.titre")}
        sx={{ p: 3, pb: 2, maxHeight: "80vh", overflowY: "auto" }}
      >
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          {t("filtres.titre")}
        </Typography>

        <TextField
          label={t("commun.rechercher")}
          size="small"
          fullWidth
          value={brouillon.recherche}
          onChange={(e) => modifier("recherche", e.target.value)}
          sx={{ mb: 2 }}
        />

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          {t("filtres.categorie")}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
          <FormControlLabel
            key="toutes"
            control={
              <Checkbox
                checked={!brouillon.famille}
                onChange={() => modifier("famille", "")}
                name="toutes-categories"
              />
            }
            label={t("filtres.toutesCategories")}
          />
          {familles.map((famille) => (
            <Box key={famille.id}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={String(brouillon.famille) === String(famille.id)}
                    onChange={() =>
                      modifier(
                        "famille",
                        String(brouillon.famille) === String(famille.id)
                          ? ""
                          : String(famille.id),
                      )
                    }
                    name={`famille-${famille.id}`}
                  />
                }
                label={`${nomFamille(famille, locale)} (${famille.nb_produits})`}
              />
              {(famille.sous_familles || []).map((sousFamille) => (
                <FormControlLabel
                  key={sousFamille.id}
                  sx={{ ml: 3 }}
                  control={
                    <Checkbox
                      checked={
                        String(brouillon.famille) === String(sousFamille.id)
                      }
                      onChange={() =>
                        modifier(
                          "famille",
                          String(brouillon.famille) === String(sousFamille.id)
                            ? ""
                            : String(sousFamille.id),
                        )
                      }
                      name={`famille-${sousFamille.id}`}
                    />
                  }
                  label={`${nomFamille(sousFamille, locale)} (${sousFamille.nb_produits})`}
                />
              ))}
            </Box>
          ))}
        </Box>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          {t("filtres.prix")}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            label={t("filtres.prixMin")}
            size="small"
            type="number"
            fullWidth
            value={brouillon.prix_min}
            onChange={(e) => modifier("prix_min", e.target.value)}
          />
          <TextField
            label={t("filtres.prixMax")}
            size="small"
            type="number"
            fullWidth
            value={brouillon.prix_max}
            onChange={(e) => modifier("prix_max", e.target.value)}
          />
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={brouillon.promo}
              onChange={(e) => modifier("promo", e.target.checked)}
              name="promo"
            />
          }
          label={t("filtres.enPromo")}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={brouillon.en_stock}
              onChange={(e) => modifier("en_stock", e.target.checked)}
              name="en-stock"
            />
          }
          label={t("filtres.enStockUniquement")}
        />

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", gap: 1, pb: "env(safe-area-inset-bottom, 0px)" }}>
          <Button variant="text" onClick={effacer}>
            {t("filtres.effacer")}
          </Button>
          <Button variant="contained" color="secondary" fullWidth onClick={appliquer}>
            {t("filtres.appliquer")}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default FiltresMobile;
