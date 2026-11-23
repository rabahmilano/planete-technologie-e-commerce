import Link from "next/link";
import Head from "next/head";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import ProductCard from "src/components/ProductCard";
import Atouts from "src/components/Atouts";
import ImageProduit from "src/components/ImageProduit";
import { getFamilles, getProduits, getProduit, urlImage } from "src/lib/api";
import { formaterPrix } from "src/lib/format";
import { JETONS, OMBRES } from "src/lib/theme";
import { useTr } from "src/lib/i18n";
import { nomFamille, nomProduit } from "src/lib/produit";

// Produit du héros : décision propriétaire n°6 — le chargeur Ugreen 30W
// (produit 257), photo réelle obligatoire. Si l'API ne le renvoie pas,
// repli sur le nom du produit en typographie géante, jamais d'emplacement
// photo vide.
const SLUG_HERO = "chargeur-ugreen-30w-cd319";

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
              prix_effectif: hero.prix_effectif,
              prix_barre: hero.prix_barre,
              promo_active: hero.promo_active,
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
// monogramme typographique (première lettre du nom sur dégradé bleu nuit) —
// jamais d'icône générique, qui ne montre pas ce qu'on vend. Nom + compte
// produit réel de l'API.
const TuileCategorie = ({ href, nom, nbProduits, image }) => {
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
              background:
                "linear-gradient(135deg, #0B1F3A 0%, #16324F 100%)",
              color: "#FFFFFF",
            }}
          >
            <Typography
              component="span"
              aria-hidden="true"
              sx={{ fontSize: 56, fontWeight: 800, lineHeight: 1 }}
            >
              {nom.charAt(0).toUpperCase()}
            </Typography>
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

      {/* Héros : le produit phare avec son nom, son prix et un CTA
          « Commander » — pas un slogan générique. Photo réelle encadrée
          (carte blanche sur panneau bleu nuit clair). Pas de carrousel. */}
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
            <Chip
              label={t("hero.produitPhare")}
              size="small"
              sx={{
                alignSelf: "flex-start",
                bgcolor: JETONS.promo.fond,
                color: JETONS.promo.texte,
                fontWeight: 700,
                mb: 2,
              }}
            />
            <Typography variant="display" component="h1">
              {produitHero?.nom || t("hero.titre")}
            </Typography>
            <Typography variant="body1" component="p" sx={{ mt: 1.5, opacity: 0.9 }}>
              {t("hero.sousTitre")}
            </Typography>
            {produitHero?.prix_effectif != null && (
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mt: 2, flexWrap: "wrap" }}>
                <Typography variant="h3" component="p" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
                  {formaterPrix(produitHero.prix_effectif, locale)}
                </Typography>
                {produitHero.prix_barre && produitHero.prix_barre > produitHero.prix_effectif && (
                  <>
                    <Typography
                      variant="body1"
                      component="span"
                      sx={{ textDecoration: "line-through", opacity: 0.7 }}
                    >
                      {formaterPrix(produitHero.prix_barre, locale)}
                    </Typography>
                    <Chip
                      label={`−${Math.round(
                        ((produitHero.prix_barre - produitHero.prix_effectif) /
                          produitHero.prix_barre) *
                          100,
                      )} %`}
                      size="small"
                      sx={{ bgcolor: JETONS.promo.fond, color: JETONS.promo.texte, fontWeight: 700 }}
                    />
                  </>
                )}
              </Box>
            )}
            <Box sx={{ mt: 3, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Link
                href={produitHero ? `/produits/${produitHero.slug}` : "/boutique"}
                passHref
                legacyBehavior
              >
                <Button
                  component="a"
                  variant="contained"
                  color="secondary"
                  size="large"
                >
                  {t("panier.commander")}
                </Button>
              </Link>
              <Link href="/boutique" passHref legacyBehavior>
                <Button
                  component="a"
                  variant="outlined"
                  size="large"
                  sx={{ color: "#FFFFFF", borderColor: "rgba(255,255,255,0.5)" }}
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
              bgcolor: "navy.light",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 3, md: 4 },
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
                  sx={{
                    width: "100%",
                    maxWidth: 480,
                    display: "block",
                    bgcolor: "#FFFFFF",
                    borderRadius: 3,
                    p: 2,
                    boxShadow: OMBRES.lg,
                  }}
                >
                  <ImageProduit
                    src={urlImage(produitHero.image)}
                    alt={produitHero.nom}
                    ratio={1}
                    prioritaire
                    sizes="(max-width: 900px) 92vw, 44vw"
                    sx={{ borderRadius: 2 }}
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
                  color: "#FFFFFF",
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
          bande au bas de page). Titre de section affiché (il existe dans
          les locales mais n'était jamais rendu). */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          {t("sections.atouts")}
        </Typography>
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
          />
        ))}
        <TuileCategorie
          href="/boutique?promo=true"
          nom={t("sections.promos")}
          nbProduits={nbPromos}
        />
      </Box>

      {/* Produits mis en avant : prix visibles sans cliquer, vraies
          données est_mis_en_avant. */}
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" component="h2">
          {t("sections.misEnAvant")}
        </Typography>
        <Link href="/boutique" passHref legacyBehavior>
          <Typography component="a" variant="body2" sx={{ color: "primary.main", textDecoration: "none", fontWeight: 600, whiteSpace: "nowrap" }}>
            {t("commun.voirTout")}
          </Typography>
        </Link>
      </Box>
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {misEnAvant.map((produit) => (
          <Grid item xs={6} sm={4} md={3} key={produit.slug}>
            <ProductCard produit={produit} />
          </Grid>
        ))}
      </Grid>

      {promosSeules.length > 0 && (
        <>
          <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h5" component="h2">
              {t("sections.promos")}
            </Typography>
            <Link href="/boutique?promo=true" passHref legacyBehavior>
              <Typography component="a" variant="body2" sx={{ color: "primary.main", textDecoration: "none", fontWeight: 600, whiteSpace: "nowrap" }}>
                {t("commun.voirTout")}
              </Typography>
            </Link>
          </Box>
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