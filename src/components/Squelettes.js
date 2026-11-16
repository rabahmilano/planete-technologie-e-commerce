import { Box, Grid, Skeleton } from "@mui/material";

// Squelettes de chargement : cartes produit (grille) et page produit.
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

export const SqueletteProduit = () => (
  <Grid container spacing={4}>
    <Grid item xs={12} md={6}>
      <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 3 }} />
    </Grid>
    <Grid item xs={12} md={6}>
      <Skeleton variant="text" height={48} />
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="text" height={40} width="40%" />
      <Skeleton variant="rectangular" height={120} sx={{ mt: 2, borderRadius: 2 }} />
      <Skeleton variant="rectangular" height={48} width={220} sx={{ mt: 3, borderRadius: 2 }} />
    </Grid>
  </Grid>
);

export const SquelettePage = () => (
  <Box sx={{ py: 4 }}>
    <Skeleton variant="text" height={48} width="50%" />
    <Skeleton variant="rectangular" height={180} sx={{ mt: 2, borderRadius: 3 }} />
    <SqueletteProduits nombre={4} />
  </Box>
);
