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
  Toolbar,
  Typography,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { usePanier } from "src/context/CartContext";
import { useTr } from "src/lib/i18n";
import { urlWhatsApp } from "src/lib/contact";
import { Z_INDEX } from "src/lib/theme";
import SelecteurLangue from "src/components/SelecteurLangue";
import BarrePanierMobile from "src/components/BarrePanierMobile";
import BarreNavigationMobile from "src/components/BarreNavigationMobile";
import TiroirAjout from "src/components/TiroirAjout";
import Recherche from "src/components/Recherche";

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
        src="/logo-min.webp"
        alt="Planète Tech"
        sx={{ height: 40, display: { xs: "none", sm: "block" } }}
      />
      <Box
        component="img"
        src="/mini-logo-min.webp"
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

  // Barre panier mobile masquée sur le panier et la commande ; barre
  // d'onglets masquée sur la commande. Padding bas du contenu ajusté en
  // conséquence (barre panier + onglets en mobile).
  const sansBarrePanier =
    router.pathname === "/panier" || router.pathname === "/commande";
  const surCommande = router.pathname === "/commande";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Barre de bénéfices : une ligne, faits réels, pas de promesse de
          retour (décision propriétaire). Au-dessus de l'entête, défile avec
          la page : rien de ce qui est essentiel n'y vit. */}
      <Box
        component="p"
        sx={{
          bgcolor: "navy.light",
          color: "#FFFFFF",
          textAlign: "center",
          m: 0,
          px: 2,
          py: 0.75,
          fontSize: "0.8125rem",
        }}
      >
        {t("commun.barreBenefices")}
      </Box>
      {/* Lien d'évitement : premier élément focalisable du DOM, masqué
          jusqu'à la prise de focus (navigation au clavier). Le clic déplace
          explicitement le focus sur <main> : Next.js intercepte l'ancre et
          ne gère que le défilement, pas le focus. Box component="a" : le
          sx MUI ne passe pas par next/link en legacyBehavior. */}
      <Box
        component="a"
        href="#contenu-principal"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("contenu-principal")?.focus();
        }}
        sx={{
          position: "absolute",
          insetInlineStart: 2,
          top: -56,
          zIndex: Z_INDEX.lienEvitement,
          px: 2,
          py: 1,
          borderRadius: 1,
          bgcolor: "navy.main",
          color: "#FFFFFF",
          fontWeight: 600,
          textDecoration: "none",
          transition: "top 150ms ease-out",
          "&:focus": { top: 2 },
        }}
      >
        {t("commun.allerContenu")}
      </Box>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "navy.main" }}>
        <Toolbar
          sx={{
            gap: { xs: 1, sm: 2 },
            minHeight: { xs: 60, sm: 64 },
            flexWrap: "wrap",
          }}
        >
          <LogoBoutique />
          <Recherche />
          <Box sx={{ flexGrow: 1 }} />
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
              aria-label={
                nbArticles > 0
                  ? `${t("commun.panier")} (${nbArticles})`
                  : t("commun.panier")
              }
            >
              {/* Badge rendu seulement si > 0 : un « 0 » invisible mais
                  présent dans le DOM contredit le nom accessible. */}
              <Badge badgeContent={nbArticles > 0 ? nbArticles : undefined} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Link>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="lg"
        component="main"
        id="contenu-principal"
        tabIndex={-1}
        sx={{
          flexGrow: 1,
          py: 3,
          px: { xs: 2, sm: 3 },
          "&:focus": { outline: "none" },
          // Espace pour la barre panier fixe et la barre d'onglets en mobile.
          pb: { xs: surCommande ? 3 : sansBarrePanier ? 10 : 17, md: 3 },
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
                  src="/logo-min.webp"
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
              <Typography variant="subtitle1" component="p" sx={{ fontWeight: 700, mb: 1 }}>
                {t("footer.navigation")}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, alignItems: "flex-start" }}>
                <Link href="/" passHref legacyBehavior>
                  <Typography
                    component="a"
                    variant="body2"
                    sx={{
                      color: "#FFFFFF",
                      opacity: 0.85,
                      textDecoration: "none",
                      py: 1.25,
                      display: "inline-block",
                    }}
                  >
                    {t("commun.accueil")}
                  </Typography>
                </Link>
                <Link href="/boutique" passHref legacyBehavior>
                  <Typography
                    component="a"
                    variant="body2"
                    sx={{
                      color: "#FFFFFF",
                      opacity: 0.85,
                      textDecoration: "none",
                      py: 1.25,
                      display: "inline-block",
                    }}
                  >
                    {t("commun.boutique")}
                  </Typography>
                </Link>
                <Link href="/panier" passHref legacyBehavior>
                  <Typography
                    component="a"
                    variant="body2"
                    sx={{
                      color: "#FFFFFF",
                      opacity: 0.85,
                      textDecoration: "none",
                      py: 1.25,
                      display: "inline-block",
                    }}
                  >
                    {t("commun.panier")}
                  </Typography>
                </Link>
                <Link href="/commande/confirmee" passHref legacyBehavior>
                  <Typography
                    component="a"
                    variant="body2"
                    sx={{
                      color: "#FFFFFF",
                      opacity: 0.85,
                      textDecoration: "none",
                      py: 1.25,
                      display: "inline-block",
                    }}
                  >
                    {t("header.suivreCommande")}
                  </Typography>
                </Link>
              </Box>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography variant="subtitle1" component="p" sx={{ fontWeight: 700, mb: 1 }}>
                {t("footer.aide")}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {t("atouts.whatsappTexte")}
              </Typography>
              {/* Bouton masqué si aucun numéro WhatsApp n'est configuré :
                  jamais de lien mort vers https://wa.me/. */}
              {urlWhatsApp() && (
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
              )}
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
      <BarreNavigationMobile />
      {/* Tiroir « ajout au panier » desktop (décision n°7) : écoute les
          ajouts du CartContext ; mobile = toast simple. */}
      <TiroirAjout />
    </Box>
  );
};

export default Layout;
