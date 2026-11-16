import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { usePanier } from "src/context/CartContext";
import { formaterPrix } from "src/lib/format";
import { getTarif, getWilayas, verifierCode } from "src/lib/api";

const Panier = () => {
  const {
    articles,
    changerQuantite,
    retirer,
    sousTotal,
    codePromo,
    setCodePromo,
  } = usePanier();
  const [wilayas, setWilayas] = useState([]);
  const [wilaya, setWilaya] = useState("");
  const [typeLivraison, setTypeLivraison] = useState("DOMICILE");
  const [frais, setFrais] = useState(null);
  const [codeSaisi, setCodeSaisi] = useState("");
  const [messagePromo, setMessagePromo] = useState("");
  const [chargementPromo, setChargementPromo] = useState(false);

  useEffect(() => {
    getWilayas()
      .then(setWilayas)
      .catch(() => setWilayas([]));
  }, []);

  useEffect(() => {
    if (!wilaya) {
      setFrais(null);
      return;
    }
    getTarif(wilaya, typeLivraison)
      .then(setFrais)
      .catch(() => setFrais(null));
  }, [wilaya, typeLivraison]);

  const appliquerCode = async () => {
    const code = codeSaisi.trim().toUpperCase();
    if (!code) return;
    setChargementPromo(true);
    setMessagePromo("");
    try {
      const resultat = await verifierCode(code, sousTotal);
      if (resultat.valide) {
        setCodePromo({ code, montant_reduction: resultat.montant_reduction });
        setMessagePromo(
          `Code appliqué : −${formaterPrix(resultat.montant_reduction)}.`,
        );
      } else {
        setCodePromo(null);
        setMessagePromo(resultat.message || "Code promo invalide.");
      }
    } catch (e) {
      setMessagePromo("Impossible de vérifier ce code pour le moment.");
    } finally {
      setChargementPromo(false);
    }
  };

  const reduction = codePromo ? codePromo.montant_reduction : 0;
  const fraisLivraison = frais?.disponible ? frais.prix : 0;
  const total = Math.max(0, sousTotal - reduction + fraisLivraison);

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
        Mon panier
      </Typography>
      {articles.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Votre panier est vide.
          </Typography>
          <Button variant="contained" href="/boutique">
            Voir la boutique
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {articles.map((article) => (
              <Box
                key={article.slug}
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  py: 2,
                  borderBottom: "1px solid #eee",
                }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: "grey.200",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {article.image ? (
                    <Box
                      component="img"
                      src={article.image}
                      alt=""
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    "📦"
                  )}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Link
                    href={`/produits/${article.slug}`}
                    passHref
                    legacyBehavior
                  >
                    <Typography
                      component="a"
                      sx={{
                        textDecoration: "none",
                        color: "text.primary",
                        fontWeight: 600,
                      }}
                    >
                      {article.designation}
                    </Typography>
                  </Link>
                  <Typography color="primary" sx={{ fontWeight: 700 }}>
                    {formaterPrix(article.prix)}
                  </Typography>
                </Box>
                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 80 }}
                  value={article.quantite}
                  onChange={(e) =>
                    changerQuantite(article.slug, e.target.value)
                  }
                  inputProps={{ min: 1, max: 99 }}
                />
                <Typography sx={{ minWidth: 100, textAlign: "right" }}>
                  {formaterPrix(article.prix * article.quantite)}
                </Typography>
                <IconButton
                  color="error"
                  onClick={() => retirer(article.slug)}
                  aria-label="Retirer"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                border: "1px solid #eee",
                borderRadius: 2,
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Récapitulatif
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  label="Code promo"
                  size="small"
                  fullWidth
                  value={codeSaisi}
                  onChange={(e) => setCodeSaisi(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") appliquerCode();
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={appliquerCode}
                  disabled={chargementPromo}
                >
                  Appliquer
                </Button>
              </Box>
              {messagePromo && (
                <Alert severity={codePromo ? "success" : "warning"}>
                  {messagePromo}
                </Alert>
              )}
              {codePromo && (
                <Button size="small" onClick={() => setCodePromo(null)}>
                  Retirer le code {codePromo.code}
                </Button>
              )}
              <FormControl size="small" fullWidth>
                <InputLabel id="wilaya-livraison-label">Wilaya de livraison</InputLabel>
                <Select
                  labelId="wilaya-livraison-label"
                  id="wilaya-livraison"
                  label="Wilaya de livraison"
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                >
                  <MenuItem value="">Choisir une wilaya</MenuItem>
                  {wilayas.map((w) => (
                    <MenuItem key={w.code} value={w.code}>
                      {w.code} — {w.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel id="type-livraison-label">Type de livraison</InputLabel>
                <Select
                  labelId="type-livraison-label"
                  id="type-livraison"
                  label="Type de livraison"
                  value={typeLivraison}
                  onChange={(e) => setTypeLivraison(e.target.value)}
                >
                  <MenuItem value="DOMICILE">À domicile</MenuItem>
                  <MenuItem value="BUREAU">Au bureau</MenuItem>
                </Select>
              </FormControl>
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>Sous-total</Typography>
                <Typography>{formaterPrix(sousTotal)}</Typography>
              </Box>
              {reduction > 0 && (
                <Box
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography>Réduction</Typography>
                  <Typography color="success.main">
                    −{formaterPrix(reduction)}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>Livraison</Typography>
                <Typography>
                  {wilaya
                    ? frais?.disponible
                      ? formaterPrix(frais.prix)
                      : "Confirmés par téléphone"
                    : "—"}
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
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">
                  {formaterPrix(total)}
                </Typography>
              </Box>
              <Button variant="contained" size="large" href="/commande">
                Commander
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Panier;
