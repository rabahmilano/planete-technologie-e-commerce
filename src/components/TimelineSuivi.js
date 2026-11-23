import { Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTr } from "src/lib/i18n";

// Barre de progression en 5 étapes (§3.7) : Commande reçue → Préparée →
// Expédiée → En livraison → Livrée. Les 6 statuts de l'API se mappent sur
// ces étapes (voir INDEX_PAR_STATUT) ; l'étape courante est surlignée.
// Sens de lecture respecté : en RTL la barre part de la droite.
const ETAPES_STATUTS = {
  EN_ATTENTE: 0,
  CONFIRMEE: 0,
  EN_PREPARATION: 1,
  EXPEDIEE: 2,
  LIVREE: 4,
};

const TimelineSuivi = ({ statut }) => {
  const { t, rtl } = useTr();
  const annulee = statut === "ANNULEE";
  const indexCourant = ETAPES_STATUTS[statut] ?? 0;

  const etapes = [
    t("suivi.etapeRecue"),
    t("suivi.etapePreparee"),
    t("suivi.etapeExpediee"),
    t("suivi.etapeLivraison"),
    t("suivi.etapeLivree"),
  ];

  return (
    <Box
      role="list"
      aria-label={t("confirmation.suiviColis")}
      sx={{
        display: "flex",
        flexDirection: rtl ? "row-reverse" : "row",
        alignItems: "flex-start",
        my: 2,
      }}
    >
      {etapes.map((label, index) => {
        const franchie = !annulee && index <= indexCourant;
        const courante = !annulee && index === indexCourant;
        return (
          <Box
            key={label}
            role="listitem"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
            }}
          >
            {/* Trait de liaison vers l'étape suivante (derrière les cercles). */}
            {index < etapes.length - 1 && (
              <Box
                aria-hidden="true"
                sx={{
                  position: "absolute",
                  top: 18,
                  insetInlineStart: "50%",
                  width: "100%",
                  height: 2,
                  bgcolor:
                    !annulee && index < indexCourant ? "success.main" : "divider",
                }}
              />
            )}
            <Box
              aria-hidden="true"
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
                bgcolor: annulee
                  ? "grey.300"
                  : franchie
                    ? "success.main"
                    : "background.paper",
                border: "2px solid",
                borderColor: annulee
                  ? "grey.400"
                  : courante
                    ? "primary.dark"
                    : franchie
                      ? "success.main"
                      : "divider",
                color: franchie && !annulee ? "#FFFFFF" : "text.secondary",
              }}
            >
              {annulee ? (
                <CancelIcon sx={{ fontSize: 20 }} />
              ) : franchie ? (
                <CheckCircleIcon sx={{ fontSize: 20 }} />
              ) : (
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{index + 1}</Typography>
              )}
            </Box>
            <Typography
              variant="body2"
              align="center"
              sx={{
                mt: 0.75,
                fontWeight: courante ? 700 : 400,
                color: annulee
                  ? "text.disabled"
                  : courante
                    ? "primary.dark"
                    : "text.secondary",
                px: 0.5,
              }}
            >
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default TimelineSuivi;
