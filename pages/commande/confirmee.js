import { useEffect, useState } from "react";
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

const Confirmation = () => {
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
      setErreur("Commande introuvable. Vérifiez le numéro et le téléphone.");
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
  }, []);

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Box sx={{ textAlign: "center", py: 3 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mt: 1 }}>
          Merci pour votre commande !
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Un administrateur va vous appeler pour confirmer votre commande.
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
              Commande #{commande.id_cmd_web}
            </Typography>
            <Chip label={commande.statut_commande} color="primary" />
          </Box>
          <Typography>Client : {commande.nom_client}</Typography>
          <Typography>Téléphone : {commande.telephone}</Typography>
          <Typography>
            Livraison : {commande.wilaya} / {commande.commune} —{" "}
            {commande.type_livraison === "BUREAU" ? "Au bureau" : "À domicile"}
          </Typography>
          {commande.code_tracking && (
            <Typography sx={{ fontWeight: 700, mt: 1 }}>
              Suivi du colis : {commande.code_tracking}
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
                )}
              </Typography>
            </Box>
          ))}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>Produits</Typography>
            <Typography>
              {formaterPrix(parseFloat(commande.montant_produits))}
            </Typography>
          </Box>
          {parseFloat(commande.montant_reduction) > 0 && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>Réduction</Typography>
              <Typography color="success.main">
                −{formaterPrix(parseFloat(commande.montant_reduction))}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>Livraison</Typography>
            <Typography>
              {formaterPrix(parseFloat(commande.frais_livraison))}
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
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6" color="primary">
              {formaterPrix(parseFloat(commande.montant_total_final))}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Paiement à la livraison.
          </Typography>
          <Button variant="contained" href="/boutique" sx={{ mt: 3 }}>
            Continuer mes achats
          </Button>
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
            Suivre ma commande
          </Typography>
          {erreur && <Alert severity="warning">{erreur}</Alert>}
          <TextField
            label="Numéro de commande"
            value={idSaisi}
            onChange={(e) => setIdSaisi(e.target.value)}
          />
          <TextField
            label="Téléphone"
            value={telephoneSaisi}
            onChange={(e) => setTelephoneSaisi(e.target.value)}
            placeholder="0550123456"
          />
          <Button
            variant="contained"
            onClick={() => charger(idSaisi, telephoneSaisi)}
          >
            Voir ma commande
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Confirmation;
