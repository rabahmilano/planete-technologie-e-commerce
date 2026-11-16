import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  ClickAwayListener,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { getProduits } from "src/lib/api";
import { formaterPrix } from "src/lib/format";
import { useTr } from "src/lib/i18n";

// Recherche compacte du header, avec suggestions en direct.
// Desktop : champ de largeur fixe (280 px), jamais flexGrow — le logo, le
// sélecteur de langue et le panier ne sont plus écrasés.
// Mobile : icône loupe dans la barre, qui déplie un champ pleine largeur
// en 2e ligne (la recherche existe sur téléphone, l'appareil principal
// des clients).
// L'icône est en startAdornment : en RTL elle passe à droite, du bon côté.
const Recherche = () => {
  const router = useRouter();
  const { t, locale } = useTr();
  const [valeur, setValeur] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [ouvert, setOuvert] = useState(false);
  const [selection, setSelection] = useState(-1);
  const [mobileOuvert, setMobileOuvert] = useState(false);
  const minuteur = useRef(null);

  const fermer = () => {
    setOuvert(false);
    setSelection(-1);
  };

  const allerProduit = (slug) => {
    fermer();
    setMobileOuvert(false);
    router.push(`/produits/${slug}`);
  };

  const lancerRecherche = (terme) => {
    const recherche = (terme ?? valeur).trim();
    fermer();
    setMobileOuvert(false);
    router.push({
      pathname: "/boutique",
      query: recherche ? { recherche } : {},
    });
  };

  // Suggestions en direct, avec debounce : on ne tape pas à l'aveugle.
  useEffect(() => {
    if (minuteur.current) clearTimeout(minuteur.current);
    const terme = valeur.trim();
    if (terme.length < 2) {
      setSuggestions([]);
      setOuvert(false);
      return undefined;
    }
    minuteur.current = setTimeout(() => {
      getProduits({ recherche: terme, limit: 5 })
        .then((donnees) => {
          setSuggestions(donnees.produits || []);
          setSelection(-1);
          setOuvert(true);
        })
        .catch(() => {
          setSuggestions([]);
          setOuvert(false);
        });
    }, 300);
    return () => {
      if (minuteur.current) clearTimeout(minuteur.current);
    };
  }, [valeur]);

  const surTouche = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!ouvert || suggestions.length === 0) return;
      const pas = e.key === "ArrowDown" ? 1 : -1;
      setSelection((precedent) => {
        const suivant = precedent + pas;
        if (suivant < -1) return suggestions.length - 1;
        if (suivant >= suggestions.length) return -1;
        return suivant;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (ouvert && selection >= 0 && suggestions[selection]) {
        allerProduit(suggestions[selection].slug);
      } else {
        lancerRecherche();
      }
    } else if (e.key === "Escape") {
      fermer();
    }
  };

  const listeSuggestions = (
    <>
      {suggestions.length > 0 ? (
        <List dense sx={{ py: 0.5 }}>
          {suggestions.map((produit, index) => (
            <ListItemButton
              key={produit.slug}
              selected={index === selection}
              onMouseDown={(e) => {
                e.preventDefault();
                allerProduit(produit.slug);
              }}
              onMouseEnter={() => setSelection(index)}
              sx={{ cursor: "pointer" }}
            >
              <ListItemText
                primary={produit.designation}
                secondary={formaterPrix(produit.prix_effectif, locale)}
              />
            </ListItemButton>
          ))}
          <ListItemButton
            onMouseDown={(e) => {
              e.preventDefault();
              lancerRecherche();
            }}
            sx={{ cursor: "pointer", borderTop: "1px solid #E5E7EB" }}
          >
            <ListItemText
              primary={
                <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                  {t("recherche.voirTous")}
                </Typography>
              }
            />
          </ListItemButton>
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>
          {t("recherche.aucunResultat")}
        </Typography>
      )}
    </>
  );

  const champ = (autoFocus = false) => (
    <ClickAwayListener onClickAway={fermer}>
      <Box sx={{ position: "relative", width: "100%" }}>
        <TextField
          size="small"
          fullWidth
          autoFocus={autoFocus}
          placeholder={t("commun.rechercherProduit")}
          value={valeur}
          onChange={(e) => setValeur(e.target.value)}
          onKeyDown={surTouche}
          onFocus={() => {
            if (valeur.trim().length >= 2) setOuvert(true);
          }}
          aria-label={t("commun.rechercher")}
          sx={{
            bgcolor: "#FFFFFF",
            borderRadius: 2,
            "& .MuiOutlinedInput-root": { borderRadius: 2 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: valeur ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label={t("commun.fermer")}
                  onClick={() => {
                    setValeur("");
                    setSuggestions([]);
                    setOuvert(false);
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
        {ouvert && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              zIndex: 1300,
              maxHeight: 320,
              overflow: "auto",
              color: "text.primary",
            }}
          >
            {listeSuggestions}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );

  return (
    <>
      {/* Desktop : champ compact, largeur fixe */}
      <Box sx={{ display: { xs: "none", sm: "block" }, width: 280, flexShrink: 0 }}>
        {champ()}
      </Box>
      {/* Mobile : icône loupe dans la barre */}
      <IconButton
        sx={{ color: "#FFFFFF", display: { xs: "inline-flex", sm: "none" } }}
        aria-label={t("commun.rechercher")}
        onClick={() => setMobileOuvert((precedent) => !precedent)}
      >
        <SearchIcon />
      </IconButton>
      {/* Mobile : champ déplié en 2e ligne (la Toolbar a flexWrap) */}
      {mobileOuvert && (
        <Box
          sx={{
            display: { xs: "block", sm: "none" },
            flexBasis: "100%",
            pb: 1,
          }}
        >
          {champ(true)}
        </Box>
      )}
    </>
  );
};

export default Recherche;
