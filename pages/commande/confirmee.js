import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TimelineSuivi from "src/components/TimelineSuivi";
import { formaterPrix } from "src/lib/format";
import { getSuiviCommande } from "src/lib/api";
import { traduire, useTr } from "src/lib/i18n";

// Statuts backend -> libellés localisés (repli : valeur brute du backend).
const libelleStatut = (statut, locale) => {
  const cle = `statuts.${statut}`;
  const libelle = traduire(locale, cle);
  return libelle === cle ? statut : libelle;
};

const Confirmation = () => {
  const { t, locale } = useTr();
  const [commande, setCommande] = useState(null);
  const [viaConfirmation, setViaConfirmation] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [idSaisi, setIdSaisi] = useState("");
  const [telephoneSaisi, setTelephoneSaisi] = useState("");
  const [erreurChamps, setErreurChamps] = useState("");

  const charger = async (id, telephone) => {
    setChargement(true);
    setErreur("");
    try {
      const donnees = await getSuiviCommande(id, telephone);
      setCommande(donnees);
    } catch (e) {
      // Réponse IDENTIQUE que la combinaison existe ou non : pas de
      // sondage possible des numéros de commande.
      setErreur(t("confirmation.introuvable"));
      setCommande(null);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    try {
      const brut = window.sessionStorage.getItem("ptech-derniere-commande");
      if (brut) {
        const { id, telephone } = JSON.parse(brut);
        setIdSaisi(String(id));
        setTelephoneSaisi(telephone);
        setViaConfirmation(true);
        charger(id, telephone);
        return;
      }
    } catch (e) {
      /* pas de commande récente */
    }
    setChargement(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Suivi : numéro + téléphone tous deux obligatoires ; « #1024 » accepté.
  const suivre = () => {
    const numero = idSaisi.trim().replace(/^#/, "");
    const telephone = telephoneSaisi.trim();
    if (!numero || !telephone) {
      setErreurChamps(t("confirmation.champsRequis"));
      return;
    }
    setErreurChamps("");
    charger(numero, telephone);
  };

  const montantCOD = commande
    ? Math.max(0, parseFloat(commande.montant_total_final) || 0)
    : 0;

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      {/* Page personnelle (numéro de commande + téléphone) : jamais indexée. */}
      <Head>
        <meta name="robots" content="noindex" />
      </Head>

      {/* État 1 — confirmation juste après la commande : aucun colis n'existe
          encore (décision n°12 : le colis naît après l'appel de confirmation),
          donc PAS de code de suivi ici. Message rassurant 24 h. */}
      {chargement ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : commande && viaConfirmation ? (
        <Box>
          <Box sx={{ textAlign: "center", py: 3 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />
            <Typography variant="h1" component="h1" sx={{ mt: 1 }}>
              {t("confirmation.merci")}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.5 }}>
              {t("confirmation.appel")}
            </Typography>
            <Typography color="text.secondary">
              {t("confirmation.telephone")} :{" "}
              <Box component="bdi" dir="ltr" sx={{ fontWeight: 700 }}>
                {commande.telephone}
              </Box>
            </Typography>
          </Box>
          <Box sx={{ border: "1px solid #eee", borderRadius: 2, p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("confirmation.commande", { id: commande.id_cmd_web })}
            </Typography>
            <Divider sx={{ my: 2 }} />
            {commande.lignes?.map((ligne, index) => (
              <Box
                key={index}
                sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
              >
                <Typography>
                  {ligne.designation_facturee} × {ligne.quantite}
                </Typography>
                <Typography>
                  {formaterPrix(
                    parseFloat(ligne.prix_unitaire_facture) * ligne.quantite,
                    locale,
                  )}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>{t("confirmation.produits")}</Typography>
              <Typography>
                {formaterPrix(parseFloat(commande.montant_produits), locale)}
              </Typography>
            </Box>
            {parseFloat(commande.montant_reduction) > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>{t("confirmation.reduction")}</Typography>
                <Typography color="success.main">
                  −{formaterPrix(parseFloat(commande.montant_reduction), locale)}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>{t("confirmation.livraisonLigne")}</Typography>
              <Typography>
                {formaterPrix(parseFloat(commande.frais_livraison), locale)}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
              }}
            >
              <Typography variant="h6" component="p">
                {t("produit.totalALivraison")}
              </Typography>
              <Typography variant="h6" component="p" color="primary">
                {formaterPrix(montantCOD, locale)}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t("confirmation.paiementLivraison")}
            </Typography>
            <Link href="/boutique" passHref legacyBehavior>
              <Button component="a" variant="contained" sx={{ mt: 3 }}>
                {t("commun.continuerAchats")}
              </Button>
            </Link>
          </Box>
        </Box>
      ) : (
        /* État 2 — suivi autonome : deux champs requis, timeline visuelle,
           détails masqués, exceptions avec une action. */
        <Box>
          <Typography variant="h1" component="h1" sx={{ mb: 1 }}>
            {t("confirmation.suivreTitre")}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {t("confirmation.champsRequis")}
          </Typography>
          {commande === null && erreur && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {erreur}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              suivre();
            }}
            sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}
          >
            <TextField
              id="champ-numero"
              label={t("confirmation.numeroCommande")}
              required
              value={idSaisi}
              onChange={(e) => setIdSaisi(e.target.value)}
              error={Boolean(erreurChamps)}
              helperText={erreurChamps || " "}
              inputProps={{ inputMode: "numeric", dir: "ltr" }}
            />
            <TextField
              id="champ-telephone-suivi"
              label={t("confirmation.telephoneSuivi")}
              required
              value={telephoneSaisi}
              onChange={(e) => setTelephoneSaisi(e.target.value)}
              placeholder="0550123456"
              inputProps={{ inputMode: "tel", dir: "ltr" }}
            />
            <Button variant="contained" color="secondary" type="submit">
              {t("confirmation.voirCommande")}
            </Button>
          </Box>

          {/* Résultat d'une recherche autonome : carte de suivi (jamais le
              héros de confirmation). */}
          {commande && !viaConfirmation && (
            <Box sx={{ border: "1px solid #eee", borderRadius: 2, p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  mb: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="h6" component="p" sx={{ fontWeight: 700 }}>
                  {t("confirmation.commande", { id: commande.id_cmd_web })}
                </Typography>
                <Box
                  sx={{
                    bgcolor: commande.statut_commande === "ANNULEE" ? "grey.400" : "primary.main",
                    color: "#FFFFFF",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                  }}
                >
                  {libelleStatut(commande.statut_commande, locale)}
                </Box>
              </Box>
              <TimelineSuivi statut={commande.statut_commande} />

              {commande.statut_commande === "ANNULEE" && (
                <Alert severity="warning" sx={{ my: 2 }}>
                  {t("suivi.annuleeTexte")}
                </Alert>
              )}

              {/* Destination masquée : wilaya seulement (§3.7). */}
              <Typography variant="body2" color="text.secondary">
                {t("confirmation.livraison")} : {commande.wilaya}, ****
              </Typography>
              {commande.code_tracking && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {t("confirmation.suiviColis")} :{" "}
                  <Box component="bdi" dir="ltr" sx={{ fontWeight: 700 }}>
                    {commande.code_tracking}
                  </Box>
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t("suivi.modifiee")} : {libelleStatut(commande.statut_commande, locale)}
              </Typography>
              <Divider sx={{ my: 2 }} />
              {commande.lignes?.map((ligne, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
                >
                  <Typography>
                    {ligne.designation_facturee} × {ligne.quantite}
                  </Typography>
                  <Typography>
                    {formaterPrix(
                      parseFloat(ligne.prix_unitaire_facture) * ligne.quantite,
                      locale,
                    )}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                }}
              >
                <Typography variant="h6" component="p">
                  {t("produit.totalALivraison")}
                </Typography>
                <Typography variant="h6" component="p" color="primary">
                  {formaterPrix(montantCOD, locale)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t("confirmation.paiementLivraison")}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Confirmation;
