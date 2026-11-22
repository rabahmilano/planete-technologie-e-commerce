import { Box, Button, Grid, Typography } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import VerifiedIcon from "@mui/icons-material/Verified";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { useTr } from "src/lib/i18n";
import { urlWhatsApp } from "src/lib/contact";

// Badges de confiance (aucune donnée inventée : paiement à la livraison,
// 58 wilayas, produits vérifiés avant envoi, contact WhatsApp en repli —
// carte masquée si aucun numéro WhatsApp n'est configuré, jamais de lien mort).
const Atouts = () => {
  const { t } = useTr();
  const lienWhatsApp = urlWhatsApp();
  const atouts = [
    {
      icone: <PaymentIcon fontSize="large" color="primary" />,
      titre: t("atouts.paiementTitre"),
      texte: t("atouts.paiementTexte"),
    },
    {
      icone: <LocalShippingIcon fontSize="large" color="primary" />,
      titre: t("atouts.livraisonTitre"),
      texte: t("atouts.livraisonTexte"),
    },
    {
      icone: <VerifiedIcon fontSize="large" color="primary" />,
      titre: t("atouts.verifieTitre"),
      texte: t("atouts.verifieTexte"),
    },
  ];
  if (lienWhatsApp) {
    atouts.push({
      icone: <WhatsAppIcon fontSize="large" color="success" />,
      titre: t("atouts.whatsappTitre"),
      texte: t("atouts.whatsappTexte"),
      action: (
        <Button
          variant="outlined"
          size="small"
          color="success"
          href={lienWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mt: 1 }}
        >
          {t("atouts.whatsappCta")}
        </Button>
      ),
    });
  }

  return (
    <Grid container spacing={2}>
      {atouts.map((atout) => (
        <Grid item xs={6} md={lienWhatsApp ? 3 : 4} key={atout.titre}>
          <Box
            sx={{
              textAlign: "center",
              p: 2,
              height: "100%",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {atout.icone}
            {/* Étiquette de badge, pas un titre : <p> pour garder l'ordre
                séquentiel des titres (h1 → h2 sans saut). */}
            <Typography variant="subtitle1" component="p" sx={{ fontWeight: 700, mt: 1 }}>
              {atout.titre}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {atout.texte}
            </Typography>
            {atout.action}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default Atouts;
