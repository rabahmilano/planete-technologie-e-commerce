import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import VerifiedIcon from "@mui/icons-material/Verified";
import ProductCard from "src/components/ProductCard";
import { getFamilles, getProduits } from "src/lib/api";

const Accueil = () => {
  const [familles, setFamilles] = useState([]);
  const [misEnAvant, setMisEnAvant] = useState([]);
  const [promos, setPromos] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    Promise.all([
      getFamilles(),
      getProduits({ limit: 8 }),
      getProduits({ promo: true, limit: 8 }),
    ])
      .then(([famillesData, avantData, promosData]) => {
        setFamilles(famillesData);
        setMisEnAvant(
          avantData.produits.filter((p) => p.est_mis_en_avant).slice(0, 8),
        );
        setPromos(promosData.produits);
      })
      .catch(() => setErreur("Impossible de charger la boutique."))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {erreur && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {erreur}
        </Alert>
      )}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          borderRadius: 2,
          p: { xs: 3, sm: 5 },
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Planète Tech
        </Typography>
        <Typography variant="h6" sx={{ mt: 1, opacity: 0.9 }}>
          Cartes WiFi, répéteurs, SSD, accessoires — paiement à la livraison
          dans les 58 wilayas.
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          sx={{ mt: 3, color: "primary.main" }}
          href="/boutique"
        >
          Voir la boutique
        </Button>
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Catégories
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {familles.map((famille) => (
          <Grid item xs={6} sm={4} md={3} key={famille.id}>
            <Button
              fullWidth
              variant="outlined"
              href={`/boutique?famille=${famille.id}`}
              sx={{ py: 2, textTransform: "none" }}
            >
              {famille.nom} ({famille.nb_produits})
            </Button>
          </Grid>
        ))}
        {familles.length === 0 && (
          <Grid item xs={12}>
            <Typography color="text.secondary">
              Aucune catégorie pour le moment.
            </Typography>
          </Grid>
        )}
      </Grid>

      {misEnAvant.length > 0 && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Produits mis en avant
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {misEnAvant.map((produit) => (
              <Grid item xs={6} sm={4} md={3} key={produit.slug}>
                <ProductCard produit={produit} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {promos.length > 0 && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Promotions du moment
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {promos.map((produit) => (
              <Grid item xs={6} sm={4} md={3} key={produit.slug}>
                <ProductCard produit={produit} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Grid container spacing={2}>
        {[
          {
            icone: <PaymentIcon fontSize="large" color="primary" />,
            titre: "Paiement à la livraison",
            texte: "Payez en espèces quand vous recevez votre commande.",
          },
          {
            icone: <LocalShippingIcon fontSize="large" color="primary" />,
            titre: "Livraison 58 wilayas",
            texte: "À domicile ou au bureau, partout en Algérie.",
          },
          {
            icone: <VerifiedIcon fontSize="large" color="primary" />,
            titre: "Produits vérifiés",
            texte: "Chaque produit est testé avant l'envoi.",
          },
        ].map((atout) => (
          <Grid item xs={12} sm={4} key={atout.titre}>
            <Box sx={{ textAlign: "center", p: 2 }}>
              {atout.icone}
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
                {atout.titre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {atout.texte}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Accueil;
