import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { usePanier } from "src/context/CartContext";
import { formaterPrix, TELEPHONE_DZ } from "src/lib/format";
import {
  creerCommande,
  getBureaux,
  getCommunes,
  getTarif,
  getWilayas,
  verifierCode,
} from "src/lib/api";

const Commande = () => {
  const router = useRouter();
  const { articles, sousTotal, vider, codePromo, setCodePromo } = usePanier();
  const [wilayas, setWilayas] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [communesDisponibles, setCommunesDisponibles] = useState(false);
  const [bureaux, setBureaux] = useState([]);
  const [bureauxDisponibles, setBureauxDisponibles] = useState(false);
  const [frais, setFrais] = useState(null);
  const [codeSaisi, setCodeSaisi] = useState("");
  const [messagePromo, setMessagePromo] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const [formulaire, setFormulaire] = useState({
    nom_client: "",
    telephone: "",
    code_wilaya: "",
    commune: "",
    communeId: "",
    adresse_exacte: "",
    type_livraison: "DOMICILE",
    bureau_livraison: "",
  });

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

  const wilayaNom = useMemo(() => {
    const wilaya = wilayas.find(
      (w) => w.code === parseInt(formulaire.code_wilaya, 10),
    );
    return wilaya ? wilaya.nom : "";
  }, [wilayas, formulaire.code_wilaya]);

  const changer = (champ) => (e) => {
    setFormulaire((precedent) => ({ ...precedent, [champ]: e.target.value }));
  };

  const changerWilaya = (e) => {
    setFormulaire((precedent) => ({
      ...precedent,
      code_wilaya: e.target.value,
      commune: "",
      communeId: "",
      bureau_livraison: "",
    }));
  };

  const changerCommune = (e) => {
    const valeur = e.target.value;
    if (communesDisponibles) {
      const commune = communes.find((c) => String(c.id) === String(valeur));
      setFormulaire((precedent) => ({
        ...precedent,
        communeId: valeur,
        commune: commune ? commune.nom : "",
        bureau_livraison: "",
      }));
    } else {
      setFormulaire((precedent) => ({ ...precedent, commune: valeur }));
    }
  };

  const appliquerCode = async () => {
    const code = codeSaisi.trim().toUpperCase();
    if (!code) return;
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
    }
  };

  const reduction = codePromo ? codePromo.montant_reduction : 0;
  const fraisLivraison = frais?.disponible ? frais.prix : 0;
  const total = Math.max(0, sousTotal - reduction + fraisLivraison);

  const valider = async (e) => {
    e.preventDefault();
    setErreur("");
    if (!TELEPHONE_DZ.test(formulaire.telephone.trim())) {
      setErreur("Le téléphone doit être un numéro algérien valide (05, 06 ou 07).");
      return;
    }
    if (!formulaire.code_wilaya || !formulaire.commune) {
      setErreur("La wilaya et la commune sont obligatoires.");
      return;
    }
    if (
      formulaire.type_livraison === "BUREAU" &&
      !formulaire.bureau_livraison
    ) {
      setErreur("Choisissez un bureau de livraison.");
      return;
    }
    setEnvoi(true);
    try {
      const commande = await creerCommande({
        nom_client: formulaire.nom_client.trim(),
        telephone: formulaire.telephone.trim(),
        wilaya: wilayaNom,
        code_wilaya: parseInt(formulaire.code_wilaya, 10),
        commune: formulaire.commune.trim(),
        adresse_exacte: formulaire.adresse_exacte.trim() || undefined,
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
      vider();
      router.push("/commande/confirmee");
    } catch (e) {
      const message =
        e.response?.data?.message ||
        e.response?.data?.errors?.[0]?.msg ||
        "Impossible d'enregistrer la commande. Réessayez.";
      setErreur(message);
    } finally {
      setEnvoi(false);
    }
  };

  if (articles.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Votre panier est vide : ajoutez des produits avant de commander.
        </Typography>
        <Button variant="contained" href="/boutique">
          Voir la boutique
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
        Finaliser ma commande
      </Typography>
      {erreur && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erreur}
        </Alert>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Box component="form" onSubmit={valider} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nom complet"
              required
              fullWidth
              value={formulaire.nom_client}
              onChange={changer("nom_client")}
            />
            <TextField
              label="Téléphone (05, 06 ou 07)"
              required
              fullWidth
              value={formulaire.telephone}
              onChange={changer("telephone")}
              placeholder="0550123456"
            />
            <FormControl fullWidth required>
              <InputLabel id="wilaya-label">Wilaya</InputLabel>
              <Select
                labelId="wilaya-label"
                id="wilaya"
                label="Wilaya"
                value={formulaire.code_wilaya}
                onChange={changerWilaya}
              >
                {wilayas.map((w) => (
                  <MenuItem key={w.code} value={w.code}>
                    {w.code} — {w.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {communesDisponibles ? (
              <FormControl fullWidth required>
                <InputLabel id="commune-label">Commune</InputLabel>
                <Select
                  labelId="commune-label"
                  id="commune"
                  label="Commune"
                  value={formulaire.communeId}
                  onChange={changerCommune}
                >
                  {communes.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                label="Commune"
                required
                fullWidth
                value={formulaire.commune}
                onChange={changerCommune}
                helperText="Saisissez le nom de votre commune."
              />
            )}
            <TextField
              label="Adresse exacte"
              fullWidth
              value={formulaire.adresse_exacte}
              onChange={changer("adresse_exacte")}
              placeholder="Rue, immeuble, point de repère…"
            />
            <FormControl>
              <RadioGroup
                row
                value={formulaire.type_livraison}
                onChange={changer("type_livraison")}
              >
                <FormControlLabel
                  value="DOMICILE"
                  control={<Radio />}
                  label="À domicile"
                />
                <FormControlLabel
                  value="BUREAU"
                  control={<Radio />}
                  label="Au bureau"
                />
              </RadioGroup>
            </FormControl>
            {formulaire.type_livraison === "BUREAU" &&
              (bureauxDisponibles ? (
                <FormControl fullWidth required>
                  <InputLabel id="bureau-label">Bureau de livraison</InputLabel>
                  <Select
                    labelId="bureau-label"
                    id="bureau"
                    label="Bureau de livraison"
                    value={formulaire.bureau_livraison}
                    onChange={changer("bureau_livraison")}
                  >
                    {bureaux.map((b) => (
                      <MenuItem key={b.id} value={String(b.id)}>
                        {b.nom} — {b.adresse || ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  label="Bureau de livraison"
                  required
                  fullWidth
                  value={formulaire.bureau_livraison}
                  onChange={changer("bureau_livraison")}
                  helperText="Nom du bureau Yalidine le plus proche."
                />
              ))}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={envoi}
            >
              {envoi ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Confirmer ma commande"
              )}
            </Button>
            <Typography variant="body2" color="text.secondary">
              Paiement à la livraison. Un administrateur vous appellera pour
              confirmer votre commande.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={5}>
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
              Votre commande
            </Typography>
            {articles.map((a) => (
              <Box
                key={a.slug}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Typography>
                  {a.designation} × {a.quantite}
                </Typography>
                <Typography>{formaterPrix(a.prix * a.quantite)}</Typography>
              </Box>
            ))}
            <Divider />
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Code promo"
                size="small"
                fullWidth
                value={codeSaisi}
                onChange={(e) => setCodeSaisi(e.target.value)}
              />
              <Button variant="outlined" onClick={appliquerCode}>
                Appliquer
              </Button>
            </Box>
            {messagePromo && (
              <Alert severity={codePromo ? "success" : "warning"}>
                {messagePromo}
              </Alert>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>Sous-total</Typography>
              <Typography>{formaterPrix(sousTotal)}</Typography>
            </Box>
            {reduction > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>Réduction</Typography>
                <Typography color="success.main">
                  −{formaterPrix(reduction)}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>Livraison</Typography>
              <Typography>
                {formulaire.code_wilaya
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
              <Typography variant="h6">Total estimé</Typography>
              <Typography variant="h6" color="primary">
                {formaterPrix(total)}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Le total final est recalculé par le serveur à la confirmation.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Commande;
