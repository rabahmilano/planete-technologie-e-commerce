import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import { usePanier } from "src/context/CartContext";
import { useTr } from "src/lib/i18n";
import { urlWhatsApp } from "src/lib/contact";
import SelecteurLangue from "src/components/SelecteurLangue";
import BarrePanierMobile from "src/components/BarrePanierMobile";

// Le logo est bleu nuit + rouge : sur le header bleu nuit, il est affiché
// dans une pastille blanche (.logo-chip) pour rester lisible.
// Logo complet sur desktop, mini-logo sur mobile.
const LogoBoutique = () => (
  <Link href="/" passHref legacyBehavior>
    <Box
      component="a"
      className="logo-chip"
      aria-label="Planète Tech — Accueil"
      sx={{ textDecoration: "none" }}
    >
      <Box
        component="img"
        src="/logo.svg"
        alt="Planète Tech"
        sx={{ height: 40, display: { xs: "none", sm: "block" } }}
      />
      <Box
        component="img"
        src="/mini-logo.svg"
        alt="Planète Tech"
        sx={{ height: 36, display: { xs: "block", sm: "none" } }}
      />
    </Box>
  </Link>
);

const Layout = ({ children }) => {
  const { nbArticles } = usePanier();
  const router = useRouter();
  const { t } = useTr();
  const [recherche, setRecherche] = useState("");

  // router.push conserve la locale courante : la recherche reste en FR/AR.
  const lancerRecherche = (e) => {
    e.preventDefault();
    router.push({
      pathname: "/boutique",
      query: recherche.trim() ? { recherche: recherche.trim() } : {},
    });
  };

  const champRecherche = (
    <TextField
      size="small"
      fullWidth
      placeholder={t("commun.rechercherProduit")}
      value={recherche}
      onChange={(e) => setRecherche(e.target.value)}
      aria-label={t("commun.rechercher")}
      sx={{
        bgcolor: "#FFFFFF",
        borderRadius: 2,
        "& .MuiOutlinedInput-root": { borderRadius: 2 },
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );

  // Barre panier mobile masquée sur le panier et la commande.
  const sansBarrePanier =
    router.pathname === "/panier" || router.pathname === "/commande";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "navy.main" }}>
        <Toolbar sx={{ gap: { xs: 1, sm: 2 }, minHeight: { xs: 60, sm: 64 } }}>
          <LogoBoutique />
          <Box
            component="form"
            onSubmit={lancerRecherche}
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            {champRecherche}
          </Box>
          <Box sx={{ flexGrow: 1, display: { sm: "none" } }} />
          <Link href="/boutique" passHref legacyBehavior>
            <Button
              component="a"
              sx={{ color: "#FFFFFF", display: { xs: "none", md: "inline-flex" } }}
            >
              {t("commun.boutique")}
            </Button>
          </Link>
          <SelecteurLangue />
          <Link href="/panier" passHref legacyBehavior>
            <IconButton
              component="a"
              sx={{ color: "#FFFFFF" }}
              aria-label={t("commun.panier")}
            >
              <Badge badgeContent={nbArticles} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Link>
        </Toolbar>
        {/* Recherche sur une 2e ligne en mobile */}
        <Box
          component="form"
          onSubmit={lancerRecherche}
          sx={{
            display: { xs: "block", sm: "none" },
            px: 2,
            pb: 1.5,
          }}
        >
          {champRecherche}
        </Box>
      </AppBar>

      <Container
        maxWidth="lg"
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
          px: { xs: 2, sm: 3 },
          // Espace pour la barre panier fixe en mobile.
          pb: { xs: sansBarrePanier ? 3 : 12, md: 3 },
        }}
      >
        {children}
      </Container>

      <Box
        component="footer"
        sx={{ bgcolor: "navy.main", color: "#FFFFFF", py: 5, mt: 4 }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Box className="logo-chip" sx={{ mb: 2 }}>
                <Box
                  component="img"
                  src="/logo.svg"
                  alt="Planète Tech"
                  sx={{ height: 44 }}
                />
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.85, maxWidth: 420 }}>
                {t("footer.apropos")}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 1 }}>
                {t("footer.baseline")}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                {t("footer.navigation")}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Link href="/" passHref legacyBehavior>
                  <Typography
                    component="a"
                    variant="body2"
                    sx={{ color: "#FFFFFF", opacity: 0.85, textDecoration: "none" }}
                  >
                    {t("commun.accueil")}
                  </Typography>
                </Link>
                <Link href="/boutique" passHref legacyBehavior>
                  <Typography
                    component="a"
                    variant="body2"
                    sx={{ color: "#FFFFFF", opacity: 0.85, textDecoration: "none" }}
                  >
                    {t("commun.boutique")}
                  </Typography>
                </Link>
                <Link href="/panier" passHref legacyBehavior>
                  <Typography
                    component="a"
                    variant="body2"
                    sx={{ color: "#FFFFFF", opacity: 0.85, textDecoration: "none" }}
                  >
                    {t("commun.panier")}
                  </Typography>
                </Link>
                <Link href="/commande/confirmee" passHref legacyBehavior>
                  <Typography
                    component="a"
                    variant="body2"
                    sx={{ color: "#FFFFFF", opacity: 0.85, textDecoration: "none" }}
                  >
                    {t("header.suivreCommande")}
                  </Typography>
                </Link>
              </Box>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                {t("footer.aide")}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {t("atouts.whatsappTexte")}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                href={urlWhatsApp()}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 1.5 }}
              >
                {t("atouts.whatsappCta")} WhatsApp
              </Button>
            </Grid>
          </Grid>
          <Typography
            variant="body2"
            sx={{ opacity: 0.7, mt: 4, textAlign: "center" }}
          >
            {t("footer.droits")}
          </Typography>
        </Container>
      </Box>

      <BarrePanierMobile masquee={sansBarrePanier} />
    </Box>
  );
};

export default Layout;
