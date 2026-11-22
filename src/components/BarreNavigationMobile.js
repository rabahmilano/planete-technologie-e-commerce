import Link from "next/link";
import { useRouter } from "next/router";
import { Box, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Z_INDEX } from "src/lib/theme";
import { useTr } from "src/lib/i18n";

// Barre d'onglets mobile (Accueil / Recherche / Panier) : actions majeures
// dans la zone du pouce, panier à une touche. Masquée sur la commande :
// le formulaire de commande garde toute l'attention.
const BarreNavigationMobile = () => {
  const router = useRouter();
  const { t } = useTr();

  if (router.pathname === "/commande") return null;

  const onglets = [
    { href: "/", libelle: t("commun.accueil"), Icone: HomeIcon },
    { href: "/boutique", libelle: t("commun.rechercher"), Icone: SearchIcon },
    { href: "/panier", libelle: t("commun.panier"), Icone: ShoppingCartIcon },
  ];

  return (
    <Box
      component="nav"
      aria-label={t("footer.navigation")}
      sx={{
        display: { xs: "flex", md: "none" },
        position: "fixed",
        bottom: 0,
        insetInlineStart: 0,
        insetInlineEnd: 0,
        zIndex: Z_INDEX.barrePanierMobile,
        bgcolor: "navy.main",
        color: "#FFFFFF",
        boxShadow: "0 -2px 12px rgba(11,31,58,0.25)",
        pb: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {onglets.map(({ href, libelle, Icone }) => {
        const active =
          href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);
        return (
          <Link key={href} href={href} passHref legacyBehavior>
            <Box
              component="a"
              aria-current={active ? "page" : undefined}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                py: 1,
                minHeight: 48,
                textDecoration: "none",
                color: "#FFFFFF",
                opacity: active ? 1 : 0.72,
                fontWeight: active ? 700 : 400,
              }}
            >
              <Icone fontSize="small" />
              <Typography variant="caption" component="span">
                {libelle}
              </Typography>
            </Box>
          </Link>
        );
      })}
    </Box>
  );
};

export default BarreNavigationMobile;
