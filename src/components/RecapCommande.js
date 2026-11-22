import { Box, Button, Divider, Typography } from "@mui/material";
import { formaterPrix } from "src/lib/format";
import { useTr } from "src/lib/i18n";

// Étape « Vérifiez votre commande » (§3.6) : récapitulatif par blocs avec
// lien Modifier qui ramène au formulaire, puis confirmation finale ambre.
// Le total affiché est le même que celui du panier et du résumé collant.
const RecapCommande = ({
  formulaire,
  wilayaNom,
  articles,
  reduction,
  fraisLivraison,
  total,
  surModifier,
  surConfirmer,
  envoi,
}) => {
  const { t, locale } = useTr();

  const bloc = ({ id, titre, enfants }) => (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700 }}>
          {titre}
        </Typography>
        <Button size="small" onClick={() => surModifier(id)}>
          {t("commande.modifier")}
        </Button>
      </Box>
      {enfants}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
        {t("commande.verifiez")}
      </Typography>

      {bloc({
        id: "coordonnees",
        titre: t("commande.recapCoordonnees"),
        enfants: (
          <Typography variant="body1">
            {formulaire.nom_client} —{" "}
            <Box component="bdi" dir="ltr">
              {formulaire.telephone}
            </Box>
          </Typography>
        ),
      })}

      {bloc({
        id: "livraison",
        titre: t("commande.recapLivraisonBlock"),
        enfants: (
          <Typography variant="body1">
            {wilayaNom
              ? `${wilayaNom}, ${formulaire.commune}`
              : formulaire.commune}
            {formulaire.adresse_exacte ? ` — ${formulaire.adresse_exacte}` : ""}
            {formulaire.point_repere ? ` (${t("commande.pointRepere")} : ${formulaire.point_repere})` : ""}
            {" — "}
            {formulaire.type_livraison === "BUREAU"
              ? `${t("panier.bureau")} : ${formulaire.bureau_livraison}`
              : t("panier.domicile")}
          </Typography>
        ),
      })}

      {bloc({
        id: "articles",
        titre: t("commande.votreCommande"),
        enfants: (
          <>
            {articles.map((a) => (
              <Box key={a.slug} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Typography variant="body2">
                  {a.designation} × {a.quantite}
                </Typography>
                <Typography variant="body2">
                  {formaterPrix(a.prix * a.quantite, locale)}
                </Typography>
              </Box>
            ))}
            {reduction > 0 && (
              <Typography variant="body2" color="success.main">
                {t("panier.reduction")} : −{formaterPrix(reduction, locale)}
              </Typography>
            )}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {t("produit.totalALivraison")}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }} color="primary">
                {formaterPrix(total, locale)}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {t("atouts.paiementTitre")} — {t("atouts.paiementTexte")}
            </Typography>
          </>
        ),
      })}

      <Button
        variant="contained"
        color="secondary"
        size="large"
        fullWidth
        disabled={envoi}
        onClick={surConfirmer}
      >
        {envoi ? "…" : t("commande.confirmer")}
      </Button>
    </Box>
  );
};

export default RecapCommande;
