import { useState } from "react";
import Head from "next/head";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ProductCard from "src/components/ProductCard";
import { getProduit, urlImage } from "src/lib/api";
import { formaterPrix } from "src/lib/format";
import { usePanier } from "src/context/CartContext";

export const getServerSideProps = async ({ params }) => {
  try {
    const produit = await getProduit(params.slug);
    return { props: { produit } };
  } catch (e) {
    return { notFound: true };
  }
};

const PageProduit = ({ produit }) => {
  const { ajouter } = usePanier();
  const [quantite, setQuantite] = useState(1);
  const [imageChoisie, setImageChoisie] = useState(0);
  const images = produit.images?.length
    ? produit.images.map((image) => ({
        ...image,
        url: urlImage(image.url),
      }))
    : produit.image_principale
      ? [{ url: urlImage(produit.image_principale), est_principale: true }]
      : [];

  return (
    <Box>
      <Head>
        <title>{`${produit.designation} — Planète Tech`}</title>
        <meta
          name="description"
          content={
            produit.description ||
            `${produit.designation} — ${formaterPrix(produit.prix_effectif)}`
          }
        />
      </Head>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          {images.length > 0 ? (
            <>
              <Box
                component="img"
                src={images[imageChoisie]?.url}
                alt={produit.designation}
                sx={{
                  width: "100%",
                  maxHeight: 480,
                  objectFit: "contain",
                  bgcolor: "grey.100",
                  borderRadius: 2,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                {images.map((image, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={image.url}
                    alt=""
                    onClick={() => setImageChoisie(index)}
                    sx={{
                      width: 72,
                      height: 72,
                      objectFit: "cover",
                      borderRadius: 1,
                      cursor: "pointer",
                      border:
                        index === imageChoisie
                          ? "2px solid #9155FD"
                          : "1px solid #ddd",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ))}
              </Box>
            </>
          ) : (
            <Box
              sx={{
                height: 320,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.200",
                borderRadius: 2,
                fontSize: 72,
              }}
            >
              📦
            </Box>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {produit.designation}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5, my: 1, flexWrap: "wrap" }}>
            {produit.promo_active && <Chip label="Promo" color="error" />}
            {produit.en_stock ? (
              <Chip label="En stock" color="success" />
            ) : (
              <Chip label="Rupture de stock" color="default" />
            )}
            {produit.famille && <Chip label={produit.famille.nom} />}
          </Box>
          <Typography variant="h4" color="primary" sx={{ fontWeight: 700, mt: 2 }}>
            {formaterPrix(produit.prix_effectif)}
          </Typography>
          {produit.prix_barre && (
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ textDecoration: "line-through" }}
            >
              {formaterPrix(produit.prix_barre)}
            </Typography>
          )}
          {produit.promo_active && produit.fin_promo && (
            <Typography variant="body2" color="error">
              Promotion valable jusqu'au{" "}
              {new Date(produit.fin_promo).toLocaleDateString("fr-FR")}
            </Typography>
          )}
          <Typography variant="body1" sx={{ mt: 2, whiteSpace: "pre-line" }}>
            {produit.description || "Aucune description pour ce produit."}
          </Typography>
          {produit.paliers?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Prix dégressifs
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>À partir de</TableCell>
                    <TableCell>Prix unitaire</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {produit.paliers.map((palier) => (
                    <TableRow key={palier.quantite_min}>
                      <TableCell>{palier.quantite_min} pièce(s)</TableCell>
                      <TableCell>
                        {formaterPrix(palier.prix_unitaire)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
          <Box sx={{ display: "flex", gap: 2, mt: 3, alignItems: "center" }}>
            <TextField
              label="Quantité"
              type="number"
              size="small"
              sx={{ width: 110 }}
              value={quantite}
              onChange={(e) =>
                setQuantite(
                  Math.max(1, Math.min(parseInt(e.target.value, 10) || 1, 99)),
                )
              }
              inputProps={{ min: 1, max: 99 }}
            />
            <Button
              variant="contained"
              size="large"
              disabled={!produit.en_stock}
              onClick={() => ajouter(produit, quantite)}
            >
              Ajouter au panier
            </Button>
          </Box>
          {!produit.en_stock && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Ce produit est en rupture de stock pour le moment.
            </Alert>
          )}
        </Grid>
      </Grid>

      {produit.produits_lies?.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Produits liés
          </Typography>
          <Grid container spacing={2}>
            {produit.produits_lies.map((lie) => (
              <Grid item xs={6} sm={4} md={3} key={lie.slug}>
                <ProductCard produit={lie} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default PageProduit;
