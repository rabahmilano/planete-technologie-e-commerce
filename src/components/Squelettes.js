import { Grid, Skeleton } from "@mui/material";

// Squelette de chargement : grille de cartes produit (accueil, catalogue).
export const SqueletteProduits = ({ nombre = 8 }) => (
  <Grid container spacing={2}>
    {Array.from({ length: nombre }).map((_, i) => (
      <Grid item xs={6} sm={4} md={3} key={i}>
        <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
        <Skeleton variant="text" sx={{ mt: 1 }} />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="rectangular" height={40} sx={{ mt: 1, borderRadius: 2 }} />
      </Grid>
    ))}
  </Grid>
);
