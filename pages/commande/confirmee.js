import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [idSaisi, setIdSaisi] = useState("");
  const [telephoneSaisi, setTelephoneSaisi] = useState("");

  const charger = async (id, telephone) => {
    setChargement(true);
    setErreur("");
    try {
      const donnees = await getSuiviCommande(id, telephone);
      setCommande(donnees);
    } catch (e) {
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
        charger(id, telephone);
        return;
      }
    } catch (e) {
      setErreur("");
    }
    setChargement(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Box sx={{ textAlign: "center", py: 3 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mt: 1 }}>
          {t("confirmation.merci")}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t("confirmation.appel")}
        </Typography>
      </Box>

      {chargement ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : commande ? (
        <Box
          sx={{ border: "1px solid #eee", borderRadius: 2, p: 3 }}
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("confirmation.commande", { id: commande.id_cmd_web })}
            </Typography>
            <Chip
              label={libelleStatut(commande.statut_commande, locale)}
              color="primary"
            />
          </Box>
          <Typography>
            {t("confirmation.client")} : {commande.nom_client}
          </Typography>
          <Typography>
            {t("confirmation.telephone")} : {commande.telephone}
          </Typography>
          <Typography>
            {t("confirmation.livraison")} : {commande.wilaya} /{" "}
            {commande.commune} —{" "}
            {commande.type_livraison === "BUREAU"
              ? t("panier.bureau")
              : t("panier.domicile")}
          </Typography>
          {commande.code_tracking && (
            <Typography sx={{ fontWeight: 700, mt: 1 }}>
              {t("confirmation.suiviColis")} : {commande.code_tracking}
            </Typography>
          )}
          <Divider sx={{ my: 2 }} />
          {commande.lignes?.map((ligne, index) => (
            <Box
              key={index}
              sx={{ display: "flex", justifyContent: "space-between" }}
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
            <Typography variant="h6">{t("confirmation.total")}</Typography>
            <Typography variant="h6" color="primary">
              {formaterPrix(parseFloat(commande.montant_total_final), locale)}
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
      ) : (
        <Box
          sx={{
            border: "1px solid #eee",
            borderRadius: 2,
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t("confirmation.suivreTitre")}
          </Typography>
          {erreur && <Alert severity="warning">{erreur}</Alert>}
          <TextField
            label={t("confirmation.numeroCommande")}
            value={idSaisi}
            onChange={(e) => setIdSaisi(e.target.value)}
            inputProps={{ inputMode: "numeric", dir: "ltr" }}
          />
          <TextField
            label={t("confirmation.telephoneSuivi")}
            value={telephoneSaisi}
            onChange={(e) => setTelephoneSaisi(e.target.value)}
            placeholder="0550123456"
            inputProps={{ inputMode: "tel", dir: "ltr" }}
          />
          <Button
            variant="contained"
            onClick={() => charger(idSaisi, telephoneSaisi)}
          >
            {t("confirmation.voirCommande")}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Confirmation;
