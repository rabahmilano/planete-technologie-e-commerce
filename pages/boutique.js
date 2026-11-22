import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Alert,
  Badge,
  Box,
  Breadcrumbs,
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
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import TuneIcon from "@mui/icons-material/Tune";
import ProductCard from "src/components/ProductCard";
import ChipsFiltres from "src/components/ChipsFiltres";
import FiltresMobile from "src/components/FiltresMobile";
import { SqueletteProduits } from "src/components/Squelettes";
import { getFamilles, getProduits } from "src/lib/api";
import { useTr } from "src/lib/i18n";
import { nomFamille } from "src/lib/produit";
import { variantesRecherche } from "src/lib/recherche";

// Les familles de l'API sont imbriquées : aplaties pour les listes de
// filtres (rail desktop et tiroir mobile), comptes réels.
const aplatirFamilles = (familles) => {
  const plates = [];
  for (const famille of familles) {
    plates.push(famille);
    for (const sousFamille of famille.sous_familles || []) {
      plates.push(sousFamille);
    }
  }
  return plates;
};

const CLE_SCROLL = "ptech-scroll-boutique";
const CLE_CORRECTION = "ptech-correction-recherche";

const Boutique = () => {
  const router = useRouter();
  const { t, locale, rtl } = useTr();
  const [familles, setFamilles] = useState([]);
  const [produits, setProduits] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [tiroirOuvert, setTiroirOuvert] = useState(false);
  const [alternatives, setAlternatives] = useState([]);
  const [correction, setCorrection] = useState(null);
  const derniereSauvegarde = useRef(0);

  const filtres = router.query;
  const page = parseInt(filtres.page, 10) || 1;
  const famillesPlates = aplatirFamilles(familles);

  // Nombre de filtres actifs (chips + badge du bouton mobile).
  const nbFiltresActifs = [
    filtres.recherche,
    filtres.famille,
    filtres.prix_min,
    filtres.prix_max,
    filtres.promo === "true" ? "true" : undefined,
    filtres.en_stock === "true" ? "true" : undefined,
  ].filter(Boolean).length;

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

  // Restauration du scroll au retour d'une fiche produit (l'URL doit être
  // identique à celle mémorisée ; sinon changement de filtres → pas de
  // restauration). Deux requestAnimationFrame : le contenu est peint et la
  // remise-en-haut de Next/browser est déjà passée — notre restauration
  // s'applique en dernier, instantanément (le scroll-behavior: smooth
  // global serait trop lent et annulable).
  useEffect(() => {
    if (chargement || !router.isReady) return;
    try {
      const sauvegarde = JSON.parse(
        window.sessionStorage.getItem(CLE_SCROLL) || "null",
      );
      if (sauvegarde && sauvegarde.url === router.asPath) {
        // Trois tentatives espacées : la remise-en-haut concurrente (Next
        // sur POP, navigateur à la restauration d'historique) peut arriver
        // après la première ; la dernière écriture est la nôtre.
        [0, 150, 400].forEach((delai) =>
          setTimeout(() => {
            window.scrollTo({ top: sauvegarde.y, behavior: "instant" });
          }, delai),
        );
      }
    } catch (e) {
      /* stockage indisponible : pas de restauration */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chargement, router.isReady]);

  // Mémorisation continue (limitée) de la position de scroll.
  useEffect(() => {
    const onScroll = () => {
      const maintenant = Date.now();
      if (maintenant - derniereSauvegarde.current < 300) return;
      derniereSauvegarde.current = maintenant;
      try {
        window.sessionStorage.setItem(
          CLE_SCROLL,
          JSON.stringify({ url: router.asPath, y: window.scrollY }),
        );
      } catch (e) {
        /* stockage indisponible */
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [router.asPath]);

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
    // La page 1 est implicite : l'URL partageable reste propre.
    if (requete.page === 1) delete requete.page;
    // router.push conserve la locale courante.
    router.push({ pathname: "/boutique", query: requete });
  };

  const retirerFiltre = (cle) => {
    const requete = { ...filtres };
    delete requete[cle];
    router.push({ pathname: "/boutique", query: requete });
  };

  const changerPage = (e, nouvellePage) => {
    router.push({
      pathname: "/boutique",
      query: { ...filtres, page: nouvellePage },
    });
    window.scrollTo(0, 0);
  };

  const nomFamilleActive = (() => {
    const active = famillesPlates.find(
      (f) => String(f.id) === String(filtres.famille),
    );
    return active ? nomFamille(active, locale) : null;
  })();

  // État « aucun résultat » : jamais un cul-de-sac — on propose la sortie la
  // plus probable (effacer les filtres), puis catégories et promos.
  const sansResultats = !chargement && !erreur && produits.length === 0;

  // Correction automatique : requête sans résultat → variantes normalisées
  // (accents, pluriels, FR/AR). Une seule variante qui marche = redirigée
  // avec une notice ; plusieurs = proposées en boutons.
  useEffect(() => {
    if (!sansResultats || !filtres.recherche || !router.isReady) return;
    let annule = false;
    (async () => {
      // Variantes normalisées (accents, pluriels, FR/AR) puis préfixes
      // décroissants : tolérance aux fautes de frappe (« chageur » → « cha »).
      const variantes = variantesRecherche(filtres.recherche).slice(0, 4);
      const prefixes = [];
      for (let longueur = filtres.recherche.length - 1; longueur >= 3; longueur--) {
        prefixes.push(filtres.recherche.slice(0, longueur));
      }
      const candidats = [...variantes, ...prefixes].slice(0, 8);
      const quiMarchent = [];
      for (const candidat of candidats) {
        try {
          const donnees = await getProduits({ recherche: candidat, limit: 1 });
          if (donnees.produits?.length > 0) quiMarchent.push(candidat);
        } catch (e) {
          /* candidat ignoré */
        }
        if (annule) return;
      }
      if (annule) return;
      if (quiMarchent.length === 1) {
        try {
          window.sessionStorage.setItem(
            CLE_CORRECTION,
            JSON.stringify({ original: filtres.recherche, correction: quiMarchent[0] }),
          );
        } catch (e) {
          /* notice ignorée */
        }
        router.replace({
          pathname: "/boutique",
          query: { recherche: quiMarchent[0] },
        });
      } else if (quiMarchent.length > 1) {
        setAlternatives(quiMarchent);
      }
    })();
    return () => {
      annule = true;
    };
  }, [sansResultats, filtres.recherche]); // eslint-disable-line react-hooks/exhaustive-deps

  // Notice de correction automatique : affichée une seule fois après la
  // redirection.
  useEffect(() => {
    if (!filtres.recherche) return;
    try {
      const brut = window.sessionStorage.getItem(CLE_CORRECTION);
      if (brut) {
        window.sessionStorage.removeItem(CLE_CORRECTION);
        const donnees = JSON.parse(brut);
        if (donnees.correction === filtres.recherche) setCorrection(donnees);
      }
    } catch (e) {
      /* notice ignorée */
    }
  }, [filtres.recherche]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box>
      <Breadcrumbs
        separator={rtl ? <NavigateBeforeIcon fontSize="small" /> : <NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
        aria-label="breadcrumb"
      >
        <Link href="/" passHref legacyBehavior>
          <Typography
            component="a"
            color="text.secondary"
            sx={{ textDecoration: "none" }}
          >
            {t("commun.accueil")}
          </Typography>
        </Link>
        <Typography color="text.primary">{t("commun.boutique")}</Typography>
        {nomFamilleActive && (
          <Typography color="text.primary">{nomFamilleActive}</Typography>
        )}
      </Breadcrumbs>

      <Typography variant="h1" component="h1" sx={{ mb: 1 }}>
        {t("commun.boutique")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {t("filtres.resultats", { n: total })}
      </Typography>

      <ChipsFiltres
        filtres={filtres}
        familles={familles}
        onRetirer={retirerFiltre}
      />

      {/* Notice de correction automatique de la requête. */}
      {correction && filtres.recherche && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setCorrection(null)}>
          {t("recherche.correctionAuto", {
            q: correction.original,
            c: correction.correction,
          })}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Rail de filtres desktop (md+) : la colonne ne s'empile plus au-
            dessus des résultats en mobile — le tiroir la remplace. */}
        <Grid
          item
          md={3}
          sx={{ display: { xs: "none", md: "block" } }}
        >
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
                {famillesPlates.map((famille) => (
                  <MenuItem key={famille.id} value={String(famille.id)}>
                    {nomFamille(famille, locale)} ({famille.nb_produits})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {t("filtres.prix")}
            </Typography>
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
          {/* Tri séparé des filtres + bouton tiroir mobile avec compteur. */}
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
            <Button
              variant="outlined"
              startIcon={
                /* Badge rendu seulement si des filtres sont actifs : un
                    « 0 » invisible dans le DOM contredit le nom accessible. */
                <Badge
                  badgeContent={nbFiltresActifs > 0 ? nbFiltresActifs : undefined}
                  color="secondary"
                >
                  <TuneIcon />
                </Badge>
              }
              onClick={() => setTiroirOuvert(true)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              {t("filtres.titre")}
              {nbFiltresActifs > 0 ? ` (${nbFiltresActifs})` : ""}
            </Button>
            <Box sx={{ ml: "auto" }}>
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
          </Box>

          {erreur && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erreur}
            </Alert>
          )}
          {chargement ? (
            <SqueletteProduits nombre={12} />
          ) : sansResultats ? (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography variant="h6" component="p">
                {filtres.recherche
                  ? t("filtres.aucunAvecRecherche", { q: filtres.recherche })
                  : t("commun.aucunProduit")}
              </Typography>
              {nbFiltresActifs > 0 && (
                <Button variant="contained" color="secondary" onClick={() => router.push("/boutique")}>
                  {t("filtres.effacer")}
                </Button>
              )}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
                {famillesPlates.slice(0, 4).map((famille) => (
                  <Button
                    key={famille.id}
                    variant="text"
                    size="small"
                    onClick={() => appliquerFiltres({ famille: String(famille.id) })}
                  >
                    {nomFamille(famille, locale)} ({famille.nb_produits})
                  </Button>
                ))}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => appliquerFiltres({ promo: "true" })}
                >
                  {t("sections.promos")}
                </Button>
              </Box>
              {/* Variantes de la requête qui donnent des résultats (accents,
                  pluriels, FR/AR) : sortie de secours complémentaire. */}
              {alternatives.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
                  {alternatives.map((variante) => (
                    <Button
                      key={variante}
                      variant="outlined"
                      size="small"
                      onClick={() => appliquerFiltres({ recherche: variante })}
                    >
                      « {variante} »
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
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

      <FiltresMobile
        ouvert={tiroirOuvert}
        onFermer={() => setTiroirOuvert(false)}
        familles={familles}
        filtres={filtres}
        onAppliquer={appliquerFiltres}
      />
    </Box>
  );
};

export default Boutique;
