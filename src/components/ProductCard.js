import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
} from "@mui/material";
import { formaterPrix } from "src/lib/format";
import { usePanier } from "src/context/CartContext";

const ProductCard = ({ produit }) => {
  const { ajouter } = usePanier();

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Link href={`/produits/${produit.slug}`} passHref legacyBehavior>
        <Box component="a" sx={{ textDecoration: "none" }}>
          {produit.image_principale ? (
            <CardMedia
              component="img"
              height="180"
              image={produit.image_principale}
              alt={produit.designation}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <Box
              sx={{
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.200",
                color: "grey.600",
                fontSize: 48,
              }}
            >
              📦
            </Box>
          )}
        </Box>
      </Link>
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Link href={`/produits/${produit.slug}`} passHref legacyBehavior>
          <Typography
            component="a"
            variant="subtitle1"
            sx={{
              textDecoration: "none",
              color: "text.primary",
              fontWeight: 600,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 48,
            }}
          >
            {produit.designation}
          </Typography>
        </Link>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", my: 1 }}>
          {produit.promo_active && <Chip label="Promo" color="error" size="small" />}
          {!produit.en_stock && <Chip label="Rupture de stock" size="small" />}
          {produit.est_mis_en_avant && (
            <Chip label="Mis en avant" color="primary" size="small" />
          )}
        </Box>
        <Box sx={{ mt: "auto" }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            {formaterPrix(produit.prix_effectif)}
          </Typography>
          {produit.prix_barre && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: "line-through" }}
            >
              {formaterPrix(produit.prix_barre)}
            </Typography>
          )}
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 1 }}
            disabled={!produit.en_stock}
            onClick={() => ajouter(produit, 1)}
          >
            {produit.en_stock ? "Ajouter au panier" : "Rupture de stock"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
