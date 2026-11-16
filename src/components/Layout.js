import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import StoreIcon from "@mui/icons-material/Store";
import { usePanier } from "src/context/CartContext";

const Layout = ({ children }) => {
  const { nbArticles } = usePanier();
  const router = useRouter();
  const [recherche, setRecherche] = useState("");

  const lancerRecherche = (e) => {
    e.preventDefault();
    router.push({
      pathname: "/boutique",
      query: recherche ? { recherche } : {},
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar sx={{ gap: 2 }}>
          <Link href="/" passHref legacyBehavior>
            <Button
              component="a"
              startIcon={<StoreIcon />}
              sx={{ color: "primary.main", fontWeight: 700, fontSize: 18 }}
            >
              Planète Tech
            </Button>
          </Link>
          <Box
            component="form"
            onSubmit={lancerRecherche}
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Rechercher un produit…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Button component="a" href="/boutique" color="inherit">
            Boutique
          </Button>
          <Link href="/panier" passHref legacyBehavior>
            <IconButton component="a" color="primary" aria-label="Panier">
              <Badge badgeContent={nbArticles} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Link>
        </Toolbar>
      </AppBar>
      <Container
        maxWidth="lg"
        component="main"
        sx={{ flexGrow: 1, py: 3, px: { xs: 2, sm: 3 } }}
      >
        {children}
      </Container>
      <Box
        component="footer"
        sx={{ bgcolor: "grey.100", py: 4, mt: 4, textAlign: "center" }}
      >
        <Typography variant="body2" color="text.secondary">
          Paiement à la livraison — Livraison dans les 58 wilayas
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          © 2026 Planète Technologie
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
