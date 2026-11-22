import { useState } from "react";
import { Alert, Box, Button, TextField } from "@mui/material";
import { usePanier } from "src/context/CartContext";
import { formaterPrix } from "src/lib/format";
import { verifierCode } from "src/lib/api";
import { useTr } from "src/lib/i18n";

// Composant de code promo PARTAGÉ : panier et commande l'utilisent tous
// deux (fin des 3 copies quasi identiques). L'état du code appliqué vit
// dans le panier (CartContext) : appliquer au panier l'apporte à la commande.
const CodePromo = ({ sousTotal }) => {
  const { t, locale } = useTr();
  const { codePromo, setCodePromo } = usePanier();
  const [codeSaisi, setCodeSaisi] = useState("");
  const [message, setMessage] = useState("");
  const [chargement, setChargement] = useState(false);

  const appliquer = async () => {
    const code = codeSaisi.trim().toUpperCase();
    if (!code) return;
    setChargement(true);
    setMessage("");
    try {
      const resultat = await verifierCode(code, sousTotal);
      if (resultat.valide) {
        setCodePromo({ code, montant_reduction: resultat.montant_reduction });
        setMessage(
          t("panier.codeApplique", {
            montant: formaterPrix(resultat.montant_reduction, locale),
          }),
        );
      } else {
        setCodePromo(null);
        setMessage(resultat.message || t("panier.codeInvalide"));
      }
    } catch (e) {
      setMessage(t("panier.codeErreur"));
    } finally {
      setChargement(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          label={t("panier.codePromo")}
          size="small"
          fullWidth
          value={codeSaisi}
          onChange={(e) => setCodeSaisi(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") appliquer();
          }}
        />
        <Button variant="outlined" onClick={appliquer} disabled={chargement}>
          {t("panier.appliquer")}
        </Button>
      </Box>
      {message && <Alert severity={codePromo ? "success" : "warning"}>{message}</Alert>}
      {codePromo && (
        <Button size="small" onClick={() => setCodePromo(null)}>
          {t("panier.retirerCode", { code: codePromo.code })}
        </Button>
      )}
    </Box>
  );
};

export default CodePromo;
