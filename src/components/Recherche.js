import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  ClickAwayListener,
  Divider,
  IconButton,
  InputAdornment,
  ListItemButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import ImageProduit from "src/components/ImageProduit";
import { getProduits, urlImage } from "src/lib/api";
import { formaterPrix } from "src/lib/format";
import { nomProduit } from "src/lib/produit";
import { useTr } from "src/lib/i18n";
import { Z_INDEX } from "src/lib/theme";
import {
  effacerRecherchesRecentes,
  enregistrerRecherche,
  lireRecherchesRecentes,
  surligner,
} from "src/lib/recherche";

// Recherche compacte du header, avec suggestions en direct.
// Desktop : champ de largeur fixe (280 px), jamais flexGrow — le logo, le
// sélecteur de langue et le panier ne sont plus écrasés.
// Mobile : icône loupe dans la barre, qui déplie un champ pleine largeur
// en 2e ligne (la recherche existe sur téléphone, l'appareil principal
// des clients).
// Phase 5 : miniatures + prix dans les suggestions, surlignage du fragment
// correspondant, combobox ARIA (role=listbox + aria-activedescendant +
// annonces aria-live), requêtes récentes au focus sur champ vide. Les
// recherches populaires viendront de l'API (décision n°9 : configurables
// depuis le dashboard) — jamais codées en dur ici.
const Recherche = () => {
  const router = useRouter();
  const { t, locale } = useTr();
  const idCombobox = useId();
  const [valeur, setValeur] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [ouvert, setOuvert] = useState(false);
  const [selection, setSelection] = useState(-1);
  const [mobileOuvert, setMobileOuvert] = useState(false);
  const [recentes, setRecentes] = useState([]);
  const [annonce, setAnnonce] = useState("");
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
    enregistrerRecherche(recherche);
    setRecentes(lireRecherchesRecentes());
    fermer();
    setMobileOuvert(false);
    router.push({
      pathname: "/boutique",
      query: recherche ? { recherche } : {},
    });
  };

  // Suggestions en direct, debounce 200 ms ; les termes courts ne déclenchent
  // pas d'appel.
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
          setAnnonce(
            (donnees.produits || []).length > 0
              ? `${donnees.produits.length} ${t("commun.produits")}`
              : t("recherche.aucunResultat"),
          );
        })
        .catch(() => {
          setSuggestions([]);
          setOuvert(false);
        });
    }, 200);
    return () => {
      if (minuteur.current) clearTimeout(minuteur.current);
    };
  }, [valeur]); // eslint-disable-line react-hooks/exhaustive-deps

  // Requêtes récentes : rechargées à l'ouverture du champ (focus mobile
  // compris) et au montage.
  useEffect(() => {
    setRecentes(lireRecherchesRecentes());
  }, [mobileOuvert]);

  const surTouche = (e) => {
    const nbOptions = ouvert && suggestions.length > 0 ? suggestions.length : 0;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (nbOptions === 0) return;
      const pas = e.key === "ArrowDown" ? 1 : -1;
      setSelection((precedent) => {
        const suivant = precedent + pas;
        if (suivant < 0) return nbOptions - 1;
        if (suivant >= nbOptions) return 0;
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

  // Nom de produit avec le fragment cherché en gras (accents ignorés).
  const nomSurligne = (produit) => {
    const segments = surligner(nomProduit(produit), valeur.trim());
    return segments.map((segment, index) =>
      segment.fort ? (
        <Box component="strong" key={index} sx={{ fontWeight: 700 }}>
          {segment.texte}
        </Box>
      ) : (
        <Box component="span" key={index}>
          {segment.texte}
        </Box>
      ),
    );
  };

  const listeSuggestions = (
    <>
      {suggestions.length > 0 ? (
        <Box role="listbox" id={`${idCombobox}-liste`} sx={{ py: 0.5 }}>
          {suggestions.map((produit, index) => (
            <ListItemButton
              key={produit.slug}
              id={`${idCombobox}-option-${index}`}
              role="option"
              aria-selected={index === selection}
              selected={index === selection}
              onMouseDown={(e) => {
                e.preventDefault();
                allerProduit(produit.slug);
              }}
              onMouseEnter={() => setSelection(index)}
              sx={{
                cursor: "pointer",
                display: "flex",
                gap: 1.5,
                alignItems: "center",
                py: 1,
              }}
            >
              {/* Miniature réelle du produit : le plus grand apport des
                  suggestions visuelles (Baymard 2026). */}
              <ImageProduit
                src={produit.image_principale ? urlImage(produit.image_principale) : null}
                alt=""
                largeur={40}
                hauteur={40}
                sx={{ borderRadius: 1.5, flexShrink: 0 }}
                styleImage={{ objectFit: "cover" }}
              />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {nomSurligne(produit)}
                </Typography>
                <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>
                  {formaterPrix(produit.prix_effectif, locale)}
                </Typography>
              </Box>
            </ListItemButton>
          ))}
          <ListItemButton
            id={`${idCombobox}-option-tous`}
            role="option"
            aria-selected={selection === suggestions.length}
            selected={selection === suggestions.length}
            onMouseDown={(e) => {
              e.preventDefault();
              lancerRecherche();
            }}
            sx={{ cursor: "pointer", borderTop: "1px solid", borderColor: "divider" }}
          >
            <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
              {t("recherche.voirTous")}
            </Typography>
          </ListItemButton>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>
          {t("recherche.aucunResultat")}
        </Typography>
      )}
    </>
  );

  const panneauRecherchesRecentes = (
    <Box sx={{ py: 0.5 }} role="group" aria-label={t("recherche.recherchesRecentes")}>
      <Box sx={{ display: "flex", alignItems: "center", px: 2, pt: 1, pb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
          {t("recherche.recherchesRecentes")}
        </Typography>
        <Typography
          component="button"
          variant="caption"
          onClick={(e) => {
            e.preventDefault();
            effacerRecherchesRecentes();
            setRecentes([]);
          }}
          sx={{
            bgcolor: "transparent",
            border: "none",
            cursor: "pointer",
            color: "primary.main",
            p: 0,
          }}
        >
          {t("recherche.effacerHistorique")}
        </Typography>
      </Box>
      {recentes.map((terme) => (
        <ListItemButton
          key={terme}
          onMouseDown={(e) => {
            e.preventDefault();
            lancerRecherche(terme);
          }}
          sx={{ cursor: "pointer", gap: 1.5, py: 1 }}
        >
          <HistoryIcon fontSize="small" color="action" />
          <Typography variant="body2">{terme}</Typography>
        </ListItemButton>
      ))}
    </Box>
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
            setRecentes(lireRecherchesRecentes());
            // Champ vide : les recherches récentes s'affichent au focus
            // (surface utile — Baymard). Sinon réouvrir les suggestions.
            if (valeur.trim().length >= 2 || recentes.length > 0) setOuvert(true);
          }}
          // Combobox ARIA : état annoncé aux lecteurs d'écran, navigation
          // clavier existante désormais exposée. Les attributs passent par
          // inputProps : c'est le champ <input> qui porte le rôle.
          inputProps={{
            role: "combobox",
            "aria-expanded": ouvert,
            "aria-haspopup": "listbox",
            "aria-controls": `${idCombobox}-liste`,
            "aria-activedescendant":
              ouvert && selection >= 0
                ? `${idCombobox}-option-${selection === suggestions.length ? "tous" : selection}`
                : undefined,
            "aria-label": t("commun.rechercher"),
          }}
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
        {/* Annonce polie du nombre de suggestions (lecteurs d'écran). */}
        <Box role="status" aria-live="polite" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          {ouvert && annonce}
        </Box>
        {ouvert && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              top: "calc(100% + 4px)",
              insetInlineStart: 0,
              insetInlineEnd: 0,
              zIndex: Z_INDEX.dropdownRecherche,
              maxHeight: 340,
              overflow: "auto",
              color: "text.primary",
            }}
          >
            {suggestions.length === 0 && recentes.length > 0
              ? panneauRecherchesRecentes
              : listeSuggestions}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );

  return (
    <>
      {/* Desktop : champ extensible (il était figé à 280 px et paraissait
          étroit au milieu de la barre navy) */}
      <Box sx={{ display: { xs: "none", sm: "block" }, flexGrow: 1, maxWidth: 480, minWidth: 200 }}>
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
