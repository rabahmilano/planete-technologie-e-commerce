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
    if (!f.point_repere.trim()) erreurs.point_repere = t("commande.erreurPointRepere");
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
    const premier = ["nom_client", "telephone", "code_wilaya", "commune", "adresse_exacte", "point_repere", "bureau_livraison"].find(
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

  return (
    <Box>
      <Typography variant="h1" component="h1" sx={{ mb: 3 }}>
        {t("commande.titre")}
      </Typography>
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
                {/* Raison du numéro : rassure, réduit les abandons. */}
                {erreurs.telephone && (
                  <Typography variant="caption" role="alert" color="error" component="p">
                    {erreurs.telephone}
                  </Typography>
                )}
                {!erreurs.telephone && (
                  <Typography variant="caption" color="text.secondary" component="p">
                    {t("commande.raisonTelephone")}
                  </Typography>
                )}
              </Box>
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
                label={`${t("commande.pointRepere")} *`}
                required
                fullWidth
                value={formulaire.point_repere}
                onChange={changer("point_repere")}
                onBlur={auBlur("point_repere")}
                error={Boolean(erreurs.point_repere)}
                helperText={erreurs.point_repere}
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
                    label={t("panier.domicile")}
                  />
                  <FormControlLabel
                    value="BUREAU"
                    control={<Radio />}
                    label={t("panier.bureau")}
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
              border: "1px solid #eee",
              borderRadius: 2,
              p: 2,
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
              <Typography variant="h6" component="p" color="primary">
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
