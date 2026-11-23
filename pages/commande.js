import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import { usePanier } from "src/context/CartContext";
import { formaterPrix, TELEPHONE_DZ } from "src/lib/format";
import {
  creerCommande,
  getBureaux,
  getCommunes,
  getTarif,
  getWilayas,
} from "src/lib/api";
import CodePromo from "src/components/CodePromo";
import RecapCommande from "src/components/RecapCommande";
import { useTr } from "src/lib/i18n";

const CLE_FORMULAIRE = "ptech-formulaire-commande";
const FORMULAIRE_VIDE = {
  nom_client: "",
  telephone: "",
  code_wilaya: "",
  commune: "",
  communeId: "",
  adresse_exacte: "",
  point_repere: "",
  type_livraison: "DOMICILE",
  bureau_livraison: "",
};

const Commande = () => {
  const router = useRouter();
  const { t, locale } = useTr();
  const { articles, sousTotal, vider, codePromo } = usePanier();
  const [wilayas, setWilayas] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [communesDisponibles, setCommunesDisponibles] = useState(false);
  const [bureaux, setBureaux] = useState([]);
  const [bureauxDisponibles, setBureauxDisponibles] = useState(false);
  const [frais, setFrais] = useState(null);
  // Prix des DEUX modes de livraison pour la wilaya choisie (affichés dans
  // les libellés radio : le client voit le total avant de confirmer).
  const [tarifsModes, setTarifsModes] = useState({ domicile: null, bureau: null });
  const [erreurServeur, setErreurServeur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [etape, setEtape] = useState("formulaire");
  const [erreurs, setErreurs] = useState({});
  const [touches, setTouches] = useState({});
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const restaure = useRef(false);
  const refsChamps = useRef({});

  // Persistance du formulaire (sessionStorage) : un rafraîchissement ne
  // perd jamais la saisie. Restauration une seule fois au montage.
  useEffect(() => {
    if (restaure.current) return;
    restaure.current = true;
    try {
      const brut = window.sessionStorage.getItem(CLE_FORMULAIRE);
      if (brut) setFormulaire({ ...FORMULAIRE_VIDE, ...JSON.parse(brut) });
    } catch (e) {
      /* pas de restauration */
    }
  }, []);

  useEffect(() => {
    if (!restaure.current) return;
    try {
      window.sessionStorage.setItem(CLE_FORMULAIRE, JSON.stringify(formulaire));
    } catch (e) {
      /* stockage indisponible */
    }
  }, [formulaire]);

  useEffect(() => {
    getWilayas()
      .then(setWilayas)
      .catch(() => setWilayas([]));
  }, []);

  useEffect(() => {
    if (!formulaire.code_wilaya) {
      setCommunes([]);
      setCommunesDisponibles(false);
      setFrais(null);
      setTarifsModes({ domicile: null, bureau: null });
      return;
    }
    getCommunes(formulaire.code_wilaya)
      .then((donnees) => {
        setCommunes(donnees.communes || []);
        setCommunesDisponibles(Boolean(donnees.disponible));
      })
      .catch(() => {
        setCommunes([]);
        setCommunesDisponibles(false);
      });
    getTarif(formulaire.code_wilaya, formulaire.type_livraison)
      .then(setFrais)
      .catch(() => setFrais(null));
    Promise.all([
      getTarif(formulaire.code_wilaya, "DOMICILE"),
      getTarif(formulaire.code_wilaya, "BUREAU"),
    ])
      .then(([domicile, bureau]) => setTarifsModes({ domicile, bureau }))
      .catch(() => setTarifsModes({ domicile: null, bureau: null }));
  }, [formulaire.code_wilaya, formulaire.type_livraison]);

  useEffect(() => {
    if (
      formulaire.type_livraison !== "BUREAU" ||
      !formulaire.code_wilaya
    ) {
      setBureaux([]);
      setBureauxDisponibles(false);
      return;
    }
    getBureaux(formulaire.code_wilaya, formulaire.communeId || undefined)
      .then((donnees) => {
        setBureaux(donnees.bureaux || []);
        setBureauxDisponibles(Boolean(donnees.disponible));
      })
      .catch(() => {
        setBureaux([]);
        setBureauxDisponibles(false);
      });
  }, [
    formulaire.type_livraison,
    formulaire.code_wilaya,
    formulaire.communeId,
  ]);

  const wilayaNom = useFormulWilaya(wilayas, formulaire.code_wilaya);
  const wilayaObj =
    wilayas.find((w) => String(w.code) === String(formulaire.code_wilaya)) ||
    null;
  const communeObj =
    communes.find((c) => String(c.id) === String(formulaire.communeId)) || null;

  const reduction = codePromo ? codePromo.montant_reduction : 0;
  const fraisLivraison = frais?.disponible ? frais.prix : 0;
  const total = Math.max(0, sousTotal - reduction + fraisLivraison);
  const totalHorsLivraison = Math.max(0, sousTotal - reduction);

  // Erreurs de validation par champ (langue de l'utilisateur, jamais le
  // texte du serveur).
  const validerChamps = (f) => {
    const erreurs = {};
    if (!f.nom_client.trim()) erreurs.nom_client = t("commande.erreurNom");
    if (!TELEPHONE_DZ.test(f.telephone.trim()))
      erreurs.telephone = t("commande.erreurTelephone");
    if (!f.code_wilaya) erreurs.code_wilaya = t("commande.erreurWilayaCommune");
    if (!f.commune.trim()) erreurs.commune = t("commande.erreurWilayaCommune");
    if (!f.adresse_exacte.trim()) erreurs.adresse_exacte = t("commande.erreurAdresse");
    // Point de repère OPTIONNEL : beaucoup de clients n'en ont pas, c'était
    // un point de friction et d'abandon (le backend ne l'exige pas).
    if (f.type_livraison === "BUREAU" && !f.bureau_livraison)
      erreurs.bureau_livraison = t("commande.erreurBureau");
    return erreurs;
  };

  const changer = (champ) => (e) => {
    setFormulaire((precedent) => ({ ...precedent, [champ]: e.target.value }));
  };
  const auBlur = (champ) => () => setTouches((p) => ({ ...p, [champ]: true }));

  const modifier = (champ) => {
    setEtape("formulaire");
    setTimeout(() => refsChamps.current[champ]?.focus(), 80);
  };

  const envoyerCommande = async () => {
    setErreurServeur("");
    setEnvoi(true);
    try {
      const commande = await creerCommande({
        nom_client: formulaire.nom_client.trim(),
        telephone: formulaire.telephone.trim(),
        wilaya: wilayaNom,
        code_wilaya: parseInt(formulaire.code_wilaya, 10),
        commune: formulaire.commune.trim(),
        adresse_exacte: formulaire.adresse_exacte.trim() || undefined,
        point_repere: formulaire.point_repere.trim() || undefined,
        type_livraison: formulaire.type_livraison,
        bureau_livraison:
          formulaire.type_livraison === "BUREAU"
            ? formulaire.bureau_livraison
            : undefined,
        lignes: articles.map((a) => ({
          slug: a.slug,
          quantite: a.quantite,
        })),
        code_promo: codePromo ? codePromo.code : undefined,
      });
      window.sessionStorage.setItem(
        "ptech-derniere-commande",
        JSON.stringify({
          id: commande.id_cmd_web,
          telephone: formulaire.telephone.trim(),
        }),
      );
      window.sessionStorage.removeItem(CLE_FORMULAIRE);
      vider();
      router.push("/commande/confirmee");
    } catch (e) {
      // Jamais le texte brut du serveur : message simple + Réessayer.
      setErreurServeur(t("commande.erreurEnvoi"));
    } finally {
      setEnvoi(false);
    }
  };

  const soumettreFormulaire = (e) => {
    e.preventDefault();
    const validees = validerChamps(formulaire);
    setErreurs(validees);
    const premier = ["nom_client", "telephone", "code_wilaya", "commune", "adresse_exacte", "bureau_livraison"].find(
      (champ) => validees[champ],
    );
    if (premier) {
      refsChamps.current[premier]?.focus();
      return;
    }
    setEtape("recap");
  };

  if (articles.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t("commande.vide")}
        </Typography>
        <Link href="/boutique" passHref legacyBehavior>
          <Button component="a" variant="contained">
            {t("commun.voirBoutique")}
          </Button>
        </Link>
      </Box>
    );
  }

  // Libellés des modes de livraison avec le prix réel de la wilaya
  // choisie (rien tant qu'aucune wilaya n'est sélectionnée).
  const libelleDomicile =
    tarifsModes.domicile?.disponible
      ? `${t("panier.domicile")} — ${formaterPrix(tarifsModes.domicile.prix, locale)}`
      : t("panier.domicile");
  const libelleBureau =
    tarifsModes.bureau?.disponible
      ? `${t("panier.bureau")} — ${formaterPrix(tarifsModes.bureau.prix, locale)}`
      : t("panier.bureau");

  return (
    <Box>
      <Typography variant="h1" component="h1" sx={{ mb: 3 }}>
        {t("commande.titre")}
      </Typography>
      {/* Indicateur d'étapes : coordonnées → vérification → confirmation.
          Le client sait où il en est dans le checkout COD. */}
      <Stepper
        activeStep={etape === "formulaire" ? 0 : 1}
        alternativeLabel
        sx={{ mb: 3, maxWidth: 640 }}
      >
        {[
          t("commande.recapCoordonnees"),
          t("commande.verifiez"),
          t("commande.etapeConfirmation"),
        ].map((libelle) => (
          <Step key={libelle}>
            <StepLabel>{libelle}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {erreurServeur && (
        <Alert
          severity="error"
          role="alert"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={envoyerCommande} disabled={envoi}>
              {t("commun.reessayer")}
            </Button>
          }
        >
          {erreurServeur}
        </Alert>
      )}
      <Grid container spacing={3}>
        {/* Une seule colonne de champs (max 520 px), mobile et desktop. */}
        <Grid item xs={12} md={7}>
          {etape === "formulaire" ? (
            <Box
              component="form"
              onSubmit={soumettreFormulaire}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 2.5, maxWidth: 520 }}
            >
              {/* Section 1 — vos coordonnées. */}
              <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700, mb: -1 }}>
                {t("commande.recapCoordonnees")}
              </Typography>
              <TextField
                id="champ-nom"
                label={t("commande.nomComplet")}
                required
                fullWidth
                value={formulaire.nom_client}
                onChange={changer("nom_client")}
                onBlur={auBlur("nom_client")}
                error={Boolean(erreurs.nom_client)}
                helperText={erreurs.nom_client}
                inputRef={(el) => (refsChamps.current.nom_client = el)}
                inputProps={{ autoComplete: "name" }}
              />
              <Box>
                <TextField
                  id="champ-telephone"
                  label={t("commande.telephone")}
                  required
                  fullWidth
                  value={formulaire.telephone}
                  onChange={changer("telephone")}
                  onBlur={auBlur("telephone")}
                  error={Boolean(erreurs.telephone)}
                  helperText={
                    erreurs.telephone ||
                    (touches.telephone && !erreurs.telephone
                      ? t("commande.raisonTelephone")
                      : " ")
                  }
                  placeholder="0550123456"
                  inputRef={(el) => (refsChamps.current.telephone = el)}
                  inputProps={{ inputMode: "tel", dir: "ltr", autoComplete: "tel" }}
                />
                {/* L'aide du champ (erreur ou raison du numéro) suffit :
                    elle s'affiche déjà via helperText ci-dessus. */}
              </Box>
              {/* Section 2 — adresse de livraison. */}
              <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700, mb: -1, mt: 1 }}>
                {t("commande.recapLivraisonBlock")}
              </Typography>
              <Autocomplete
                id="champ-wilaya"
                options={wilayas}
                value={wilayaObj}
                getOptionLabel={(w) =>
                  `${String(w.code).padStart(2, "0")} — ${w.nom}`
                }
                isOptionEqualToValue={(o, v) => String(o.code) === String(v.code)}
                onChange={(e, choix) => {
                  setFormulaire((precedent) => ({
                    ...precedent,
                    code_wilaya: choix ? String(choix.code) : "",
                    commune: "",
                    communeId: "",
                    bureau_livraison: "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("commande.wilaya")}
                    required
                    error={Boolean(erreurs.code_wilaya)}
                    helperText={erreurs.code_wilaya}
                    inputRef={(el) => (refsChamps.current.code_wilaya = el)}
                  />
                )}
                disablePortal
              />
              {communesDisponibles ? (
                <Autocomplete
                  id="champ-commune"
                  options={communes}
                  value={communeObj}
                  getOptionLabel={(c) => c.nom || ""}
                  isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
                  onChange={(e, choix) => {
                    setFormulaire((precedent) => ({
                      ...precedent,
                      communeId: choix ? String(choix.id) : "",
                      commune: choix ? choix.nom : "",
                      bureau_livraison: "",
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("commande.commune")}
                      required
                      error={Boolean(erreurs.commune)}
                      helperText={erreurs.commune}
                      inputRef={(el) => (refsChamps.current.commune = el)}
                    />
                  )}
                  disablePortal
                />
              ) : (
                <TextField
                  id="champ-commune"
                  label={t("commande.commune")}
                  required
                  fullWidth
                  value={formulaire.commune}
                  onChange={changer("commune")}
                  onBlur={auBlur("commune")}
                  error={Boolean(erreurs.commune)}
                  helperText={erreurs.commune || t("commande.communeAide")}
                  inputRef={(el) => (refsChamps.current.commune = el)}
                />
              )}
              <TextField
                id="champ-adresse"
                label={t("commande.adresse")}
                required
                fullWidth
                value={formulaire.adresse_exacte}
                onChange={changer("adresse_exacte")}
                onBlur={auBlur("adresse_exacte")}
                error={Boolean(erreurs.adresse_exacte)}
                helperText={erreurs.adresse_exacte}
                placeholder={t("commande.adressePlaceholder")}
                inputRef={(el) => (refsChamps.current.adresse_exacte = el)}
                inputProps={{ autoComplete: "street-address" }}
              />
              <TextField
                id="champ-repere"
                label={t("commande.pointRepereOptionnel")}
                fullWidth
                value={formulaire.point_repere}
                onChange={changer("point_repere")}
                onBlur={auBlur("point_repere")}
                helperText={t("commande.pointRepereAide")}
                placeholder={t("commande.pointReperePlaceholder")}
                inputRef={(el) => (refsChamps.current.point_repere = el)}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {t("panier.typeLivraison")}
                </Typography>
                <RadioGroup
                  row
                  value={formulaire.type_livraison}
                  onChange={changer("type_livraison")}
                >
                  <FormControlLabel
                    value="DOMICILE"
                    control={<Radio />}
                    label={libelleDomicile}
                  />
                  <FormControlLabel
                    value="BUREAU"
                    control={<Radio />}
                    label={libelleBureau}
                  />
                </RadioGroup>
              </Box>
              {formulaire.type_livraison === "BUREAU" &&
                (bureauxDisponibles ? (
                  <Autocomplete
                    id="champ-bureau"
                    options={bureaux}
                    value={
                      bureaux.find(
                        (b) => String(b.id) === String(formulaire.bureau_livraison),
                      ) || null
                    }
                    getOptionLabel={(b) => `${b.nom}${b.adresse ? ` — ${b.adresse}` : ""}`}
                    isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
                    onChange={(e, choix) =>
                      setFormulaire((precedent) => ({
                        ...precedent,
                        bureau_livraison: choix ? String(choix.id) : "",
                      }))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("commande.bureauLivraison")}
                        required
                        error={Boolean(erreurs.bureau_livraison)}
                        helperText={erreurs.bureau_livraison}
                        inputRef={(el) => (refsChamps.current.bureau_livraison = el)}
                      />
                    )}
                    disablePortal
                  />
                ) : (
                  <TextField
                    id="champ-bureau"
                    label={t("commande.bureauLivraison")}
                    required
                    fullWidth
                    value={formulaire.bureau_livraison}
                    onChange={changer("bureau_livraison")}
                    onBlur={auBlur("bureau_livraison")}
                    error={Boolean(erreurs.bureau_livraison)}
                    helperText={erreurs.bureau_livraison || t("commande.bureauAide")}
                    inputRef={(el) => (refsChamps.current.bureau_livraison = el)}
                  />
                ))}

              {/* Paiement : COD pré-sélectionné, explicite, avec le total à
                  payer à côté (§3.6 champ 6). */}
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  gap: 1.5,
                  alignItems: "center",
                  bgcolor: "background.paper",
                }}
              >
                <PaymentIcon color="primary" />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {t("atouts.paiementTitre")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("atouts.paiementTexte")} —{" "}
                    {formulaire.code_wilaya && frais?.disponible
                      ? formaterPrix(total, locale)
                      : formaterPrix(totalHorsLivraison, locale)}
                  </Typography>
                </Box>
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                disabled={envoi}
              >
                {t("commande.verifiez")}
              </Button>
              <Typography variant="body2" color="text.secondary">
                {t("commande.notePaiement")}
              </Typography>
            </Box>
          ) : (
            <RecapCommande
              formulaire={formulaire}
              wilayaNom={wilayaNom}
              articles={articles}
              reduction={reduction}
              fraisLivraison={fraisLivraison}
              total={total}
              envoi={envoi}
              surModifier={modifier}
              surConfirmer={envoyerCommande}
            />
          )}
        </Grid>
        <Grid item xs={12} md={5}>
          {/* Résumé collant : même total que le panier et le recap. */}
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
              {t("commande.votreCommande")}
            </Typography>
            {articles.map((a) => (
              <Box
                key={a.slug}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Typography>
                  {a.designation} × {a.quantite}
                </Typography>
                <Typography>{formaterPrix(a.prix * a.quantite, locale)}</Typography>
              </Box>
            ))}
            <Divider />
            <CodePromo sousTotal={sousTotal} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>{t("panier.sousTotal")}</Typography>
              <Typography>{formaterPrix(sousTotal, locale)}</Typography>
            </Box>
            {reduction > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>{t("panier.reduction")}</Typography>
                <Typography color="success.main">
                  −{formaterPrix(reduction, locale)}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>{t("panier.livraison")}</Typography>
              <Typography>
                {!formulaire.code_wilaya
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
                {formulaire.code_wilaya && frais?.disponible
                  ? t("produit.totalALivraison")
                  : t("panier.totalHorsLivraison")}
              </Typography>
              <Typography variant="h6" component="p" sx={{ color: "navy.main" }}>
                {formaterPrix(
                  formulaire.code_wilaya && frais?.disponible
                    ? total
                    : totalHorsLivraison,
                  locale,
                )}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t("commande.totalRecalcule")}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

// Nom de wilaya dérivé du code (formulaire persisté).
function useFormulWilaya(wilayas, code) {
  const wilaya = wilayas.find((w) => String(w.code) === String(code));
  return wilaya ? wilaya.nom : "";
}

export default Commande;
