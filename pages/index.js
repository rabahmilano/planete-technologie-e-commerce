import Link from "next/link";
import Head from "next/head";
import {
  Alert,
  Box,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import WifiIcon from "@mui/icons-material/Wifi";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
import UsbIcon from "@mui/icons-material/Usb";
import PowerIcon from "@mui/icons-material/Power";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CategoryIcon from "@mui/icons-material/Category";
import ProductCard from "src/components/ProductCard";
import Atouts from "src/components/Atouts";
import ImageProduit from "src/components/ImageProduit";
import { getFamilles, getProduits, getProduit, urlImage } from "src/lib/api";
import { OMBRES } from "src/lib/theme";
import { useTr } from "src/lib/i18n";
import { nomFamille, nomProduit } from "src/lib/produit";

// Produit du héros : décision propriétaire n°6 — le chargeur Ugreen 30W
// (produit 257), photo réelle obligatoire. Si l'API ne le renvoie pas,
// repli sur le nom du produit en typographie géante, jamais d'emplacement
// photo vide.
const SLUG_HERO = "chargeur-ugreen-30w-cd319";

// Icône par famille, d'après le slug réel de l'API ; icône générique en
// repli. Les familles inconnues de cette table gardent leur nom API.
const ICONES_FAMILLES = {
  "cartes-wifi": WifiIcon,
  "cartes-pcie": DeveloperBoardIcon,
  "cles-wifi-usb": UsbIcon,
  "chargeurs-et-cables": PowerIcon,
};

// Déduplication héritée de l'accueil client : un produit en promo ne se
// répète pas dans « Mis en avant ». Les deux sections ne sont séparées que
// si chacune a au moins 3 produits distincts ; sinon une seule section
// fusionnée (les badges Promo restent visibles sur les cartes).
const separerSections = (avant, promos) => {
  const slugsPromos = new Set(promos.map((p) => p.slug));
  const avantUniques = avant
    .filter((p) => p.est_mis_en_avant)
    .filter((p) => !slugsPromos.has(p.slug))
    .slice(0, 8);
  if (avantUniques.length >= 3 && promos.length >= 3) {
    return { misEnAvant: avantUniques, promosSeules: promos };
  }
  const fusion = [
    ...promos,
    ...avant.filter((p) => !promos.some((q) => q.slug === p.slug)),
  ];
  return { misEnAvant: fusion, promosSeules: [] };
};

export const getServerSideProps = async () => {
  try {
    const [famillesData, avant, promos, hero] = await Promise.all([
      getFamilles(),
      getProduits({ limit: 8 }),
      getProduits({ promo: true, limit: 8 }),
      // Le héros ne bloque pas la page : échec isolé → repli typographique.
      getProduit(SLUG_HERO).catch(() => null),
    ]);
    // L'API renvoie les familles imbriquées (sous_familles) : on aplatit
    // pour que chaque catégorie réelle devienne une tuile, compte réel.
    const famillesPlates = [];
    for (const famille of famillesData) {
      famillesPlates.push(famille);
      for (const sousFamille of famille.sous_familles || []) {
        famillesPlates.push(sousFamille);
      }
    }
    const { misEnAvant, promosSeules } = separerSections(
      avant.produits,
      promos.produits,
    );
    return {
      props: {
        familles: famillesPlates,
        misEnAvant,
        promosSeules,
        produitHero: hero
          ? {
              slug: hero.slug,
              nom: nomProduit(hero),
              image: hero.image_principale,
            }
          : null,
        erreur: false,
      },
    };
  } catch (e) {
    return {
      props: {
        familles: [],
        misEnAvant: [],
        promosSeules: [],
        produitHero: null,
        erreur: true,
      },
    };
  }
};

// Tuile de catégorie : image réelle de la famille si elle existe, sinon
// icône MUI sur fond teinté violet ; nom + compte produit réel de l'API.
const TuileCategorie = ({ href, nom, nbProduits, image, Icone }) => {
  const { t } = useTr();
  return (
    <Link href={href} passHref legacyBehavior>
      <Box
        component="a"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 1.5,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          textDecoration: "none",
          color: "text.primary",
          transition: "box-shadow 150ms ease-out",
          "&:hover": { boxShadow: OMBRES.md },
        }}
      >
        {image ? (
          <ImageProduit
            src={urlImage(image)}
            alt=""
            ratio={1}
            sizes="220px"
            sx={{ borderRadius: 2 }}
            styleImage={{ objectFit: "cover" }}
          />
        ) : (
          <Box
            aria-hidden="true"
            sx={{
              aspectRatio: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              bgcolor: "rgba(145,85,253,0.12)",
              color: "primary.dark",
            }}
          >
            <Icone sx={{ fontSize: 44 }} />
          </Box>
        )}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {nom}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {nbProduits} {t("commun.produits")}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
};

const Accueil = ({ familles, misEnAvant, promosSeules, produitHero, erreur }) => {
  const { t, locale } = useTr();

  // État d'erreur : jamais une page blanche — cause + issue de secours.
  if (erreur) {
    return (
      <Alert
        severity="error"
        sx={{ alignItems: "center" }}
        action={
          <Button color="inherit" size="small" onClick={() => window.location.reload()}>
            {t("commun.reessayer")}
          </Button>
        }
      >
        {t("commun.erreurChargement")}
      </Alert>
    );
  }

  const nbPromos = promosSeules.length;

  return (
    <Box>
      <HeadSEO locale={locale} />

      {/* Héros : un message, un CTA, une vraie photo produit. Panneau bleu
          nuit uni (le dégradé est retiré), photo à droite en LTR — le
          flexbox inversé se fait tout seul en RTL. Pas de carrousel. */}
      <Box
        sx={{
          bgcolor: "navy.main",
          color: "#FFFFFF",
          borderRadius: 3,
          overflow: "hidden",
          mb: 4,
        }}
      >
        <Grid container>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              p: { xs: 3, sm: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="display" component="h1">
              {t("hero.titre")}
            </Typography>
            <Typography variant="body1" component="p" sx={{ mt: 1.5, opacity: 0.9 }}>
              {t("hero.sousTitre")}
            </Typography>
            <Box sx={{ mt: 3, maxWidth: 360 }}>
              <Link href="/boutique" passHref legacyBehavior>
                <Button
                  component="a"
                  variant="contained"
                  color="secondary"
                  size="large"
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  {t("hero.cta")}
                </Button>
              </Link>
            </Box>
            <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
              {t("hero.confiance")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              bgcolor: "background.default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 2, md: 4 },
            }}
          >
            {produitHero?.image ? (
              <Link
                href={`/produits/${produitHero.slug}`}
                passHref
                legacyBehavior
              >
                <Box
                  component="a"
                  aria-label={produitHero.nom}
                  sx={{ width: "100%", maxWidth: 560, display: "block" }}
                >
                  <ImageProduit
                    src={urlImage(produitHero.image)}
                    alt={produitHero.nom}
                    ratio={1}
                    prioritaire
                    sizes="(max-width: 900px) 92vw, 44vw"
                    sx={{ borderRadius: 3 }}
                  />
                </Box>
              </Link>
            ) : (
              // Repli : nom du produit en typographie géante (jamais de
              // bloc photo vide).
              <Typography
                variant="display"
                component="p"
                sx={{
                  fontSize: { xs: 40, md: 64 },
                  color: "text.primary",
                  textAlign: "center",
                }}
              >
                {produitHero?.nom || "Planète Tech"}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Confiance au point d'action : juste sous le héros (plus une seule
          bande au bas de page). */}
      <Box sx={{ mb: 5 }}>
        <Atouts />
      </Box>

      {/* Tuiles catégories : visibles sans ouvrir de menu, rangée
          défilable en mobile, grille en desktop ; comptes réels. */}
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        {t("sections.categories")}
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          overflowX: "auto",
          scrollSnapType: "x proximity",
          pb: 1,
          mb: 5,
          "& > a": {
            flexShrink: 0,
            width: { xs: "44%", sm: "30%", md: "calc(20% - 9.6px)" },
            scrollSnapAlign: "start",
          },
          md: { flexWrap: "wrap", overflowX: "visible" },
        }}
      >
        {familles.map((famille) => (
          <TuileCategorie
            key={famille.slug}
            href={`/boutique?famille=${famille.id}`}
            nom={nomFamille(famille, locale)}
            nbProduits={famille.nb_produits}
            image={famille.image}
            Icone={ICONES_FAMILLES[famille.slug] || CategoryIcon}
          />
        ))}
        <TuileCategorie
          href="/boutique?promo=true"
          nom={t("sections.promos")}
          nbProduits={nbPromos}
          Icone={LocalOfferIcon}
        />
      </Box>

      {/* Produits mis en avant : prix visibles sans cliquer, vraies
          données est_mis_en_avant. */}
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        {t("sections.misEnAvant")}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {misEnAvant.map((produit) => (
          <Grid item xs={6} sm={4} md={3} key={produit.slug}>
            <ProductCard produit={produit} />
          </Grid>
        ))}
      </Grid>

      {promosSeules.length > 0 && (
        <>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            {t("sections.promos")}
          </Typography>
          <Grid container spacing={2}>
            {promosSeules.map((produit) => (
              <Grid item xs={6} sm={4} md={3} key={produit.slug}>
                <ProductCard produit={produit} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

// SEO accueil : titre et description uniques, en français ET en arabe.
const HeadSEO = ({ locale }) => {
  const { t } = useTr();
  const titre =
    locale === "ar"
      ? "بلانيت تك — التقنية التي تحتاجها، تصلك إلى باب منزلك"
      : "Planète Tech — La tech qu'il vous faut, livrée chez vous";
  const description =
    locale === "ar"
      ? "بطاقات واي فاي، مقويات إشارة، أقراص SSD وإكسسوارات، مفحوصة قبل الإرسال. الدفع عند الاستلام في 58 ولاية."
      : "Cartes WiFi, répéteurs, SSD et accessoires testés avant envoi. Paiement à la livraison dans les 58 wilayas.";
  return (
    <Head>
      <title>{titre}</title>
      <meta name="description" content={description} />
    </Head>
  );
};

export default Accueil;