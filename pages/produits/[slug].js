import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Alert,
  Box,
  Breadcrumbs,
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
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ProductCard from "src/components/ProductCard";
import ImageSecurisee from "src/components/ImageSecurisee";
import { getProduit, urlImage } from "src/lib/api";
import { formaterDate, formaterPrix } from "src/lib/format";
import { usePanier } from "src/context/CartContext";
import { useTr } from "src/lib/i18n";
import {
  descriptionProduit,
  formaterPoids,
  nomFamilleProduit,
  stockFaible,
  stockNumerique,
} from "src/lib/produit";

export const getServerSideProps = async ({ params }) => {
  try {
    const produit = await getProduit(params.slug);
    return { props: { produit } };
  } catch (e) {
    return { notFound: true };
  }
};

// Galerie produit : état local (image choisie, image en échec, vignettes
// en échec). Le parent la remonte avec key={produit.slug} : le changement
// de produit réinitialise tout, sans useEffect de reset (voir
// ImageSecurisee : un reset parent écraserait la détection d'échec).
const GalerieProduit = ({ produit, images }) => {
  const [imageChoisie, setImageChoisie] = useState(0);
  const [imageKO, setImageKO] = useState(false);
  const [vignettesKO, setVignettesKO] = useState([]);

  if (images.length === 0 || imageKO) {
    return (
      <Box
        sx={{
          height: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.200",
          borderRadius: 3,
          fontSize: 72,
        }}
      >
        📦
      </Box>
    );
  }

  return (
    <>
      <ImageSecurisee
        src={images[imageChoisie]?.url}
        alt={produit.designation}
        sx={{
          width: "100%",
          maxHeight: 480,
          objectFit: "contain",
          bgcolor: "grey.100",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
        onErreur={() => setImageKO(true)}
      />
      <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
        {images.map((image, index) =>
          vignettesKO.includes(index) ? null : (
            <ImageSecurisee
              key={index}
              src={image.url}
              alt=""
              onClick={() => setImageChoisie(index)}
              sx={{
                width: 72,
                height: 72,
                objectFit: "cover",
                borderRadius: 2,
                cursor: "pointer",
                border:
                  index === imageChoisie
                    ? "2px solid"
                    : "1px solid #E5E7EB",
                borderColor:
                  index === imageChoisie ? "primary.main" : undefined,
              }}
              onErreur={() =>
                setVignettesKO((precedents) =>
                  precedents.includes(index)
                    ? precedents
                    : [...precedents, index],
                )
              }
            />
          ),
        )}
      </Box>
    </>
  );
};

const PageProduit = ({ produit }) => {
  const { ajouter } = usePanier();
  const { t, locale } = useTr();
  const [quantite, setQuantite] = useState(1);
  const images = produit.images?.length
    ? produit.images.map((image) => ({
        ...image,
        url: urlImage(image.url),
      }))
    : produit.image_principale
      ? [{ url: urlImage(produit.image_principale), est_principale: true }]
      : [];

  const description = descriptionProduit(produit, locale);
  const nomFamille = nomFamilleProduit(produit, locale);
  const stock = stockNumerique(produit);
  const poids = formaterPoids(produit.poids_grammes, locale);
  const urlSite = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002").replace(
    /\/$/,
    "",
  );
  const urlCanonique = `${urlSite}/produits/${produit.slug}`;
  const metaDescription =
    description || `${produit.designation} — ${formaterPrix(produit.prix_effectif, locale)}`;

  // JSON-LD produit (SEO) : uniquement des données réelles de l'API.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: produit.designation,
    description: metaDescription,
    image: images.map((image) => image.url).filter(Boolean),
    brand: { "@type": "Brand", name: "Planète Tech" },
    offers: {
      "@type": "Offer",
      url: urlCanonique,
      priceCurrency: "DZD",
      price: produit.prix_effectif,
      availability: produit.en_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  const caracteristiques = [
    { label: t("produit.famille"), valeur: nomFamille || "—" },
    {
      label: t("produit.disponibilite"),
      valeur: produit.en_stock ? t("commun.enStock") : t("commun.ruptureStock"),
    },
    ...(poids ? [{ label: t("produit.poids"), valeur: poids }] : []),
    { label: t("produit.garantie"), valeur: t("produit.garantieValeur") },
    { label: t("produit.paiement"), valeur: t("produit.paiementValeur") },
  ];

  return (
    <Box>
      <Head>
        <title>{`${produit.designation} — Planète Tech`}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={urlCanonique} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${produit.designation} — Planète Tech`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={urlCanonique} />
        {images[0]?.url && (
          <meta property="og:image" content={images[0].url} />
        )}
        <meta property="product:price:amount" content={String(produit.prix_effectif)} />
        <meta property="product:price:currency" content="DZD" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
        aria-label="breadcrumb"
      >
        <Link href="/" passHref legacyBehavior>
          <Typography
            component="a"
            color="text.secondary"
            sx={{ textDecoration: "none" }}
          >
            {t("commun.accueil")}
          </Typography>
        </Link>
        <Link href="/boutique" passHref legacyBehavior>
          <Typography
            component="a"
            color="text.secondary"
            sx={{ textDecoration: "none" }}
          >
            {t("commun.boutique")}
          </Typography>
        </Link>
        {produit.famille && (
          <Link
            href={`/boutique?famille=${produit.famille.id}`}
            passHref
            legacyBehavior
          >
            <Typography
              component="a"
              color="text.secondary"
              sx={{ textDecoration: "none" }}
            >
              {nomFamille}
            </Typography>
          </Link>
        )}
        <Typography color="text.primary">{produit.designation}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <GalerieProduit
            key={produit.slug}
            produit={produit}
            images={images}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {produit.designation}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5, my: 1, flexWrap: "wrap" }}>
            {produit.promo_active && (
              <Chip label={t("commun.promo")} color="secondary" />
            )}
            {produit.en_stock ? (
              <Chip label={t("commun.enStock")} color="success" />
            ) : (
              <Chip label={t("commun.ruptureStock")} color="default" />
            )}
            {produit.famille && <Chip label={nomFamille} />}
            {stockFaible(produit) && (
              <Chip
                label={t("produit.plusQue", { n: stock })}
                color="error"
              />
            )}
          </Box>
          <Typography variant="h4" color="primary" sx={{ fontWeight: 700, mt: 2 }}>
            {formaterPrix(produit.prix_effectif, locale)}
          </Typography>
          {produit.prix_barre && (
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ textDecoration: "line-through" }}
            >
              {formaterPrix(produit.prix_barre, locale)}
            </Typography>
          )}
          {produit.promo_active && produit.fin_promo && (
            <Typography variant="body2" color="error">
              {t("produit.promoJusqua", {
                date: formaterDate(produit.fin_promo, locale),
              })}
            </Typography>
          )}
          <Typography variant="body1" sx={{ mt: 2, whiteSpace: "pre-line" }}>
            {description || t("produit.aucuneDescription")}
          </Typography>
          {produit.paliers?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {t("produit.prixDegressifs")}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("produit.aPartirDe")}</TableCell>
                    <TableCell>{t("produit.prixUnitaire")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {produit.paliers.map((palier) => (
                    <TableRow key={palier.quantite_min}>
                      <TableCell>
                        {palier.quantite_min} {t("produit.pieces")}
                      </TableCell>
                      <TableCell>
                        {formaterPrix(palier.prix_unitaire, locale)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
          <Box sx={{ display: "flex", gap: 2, mt: 3, alignItems: "center" }}>
            <TextField
              label={t("produit.quantite")}
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
              {t("commun.ajouterPanier")}
            </Button>
          </Box>
          {!produit.en_stock && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {t("produit.ruptureAlerte")}
            </Alert>
          )}
        </Grid>
      </Grid>

      {/* Tableau de caractéristiques */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {t("produit.caracteristiques")}
        </Typography>
        <Table size="small" sx={{ maxWidth: 640 }}>
          <TableBody>
            {caracteristiques.map((ligne) => (
              <TableRow key={ligne.label}>
                <TableCell
                  sx={{ fontWeight: 700, width: "40%", verticalAlign: "top" }}
                >
                  {ligne.label}
                </TableCell>
                <TableCell>{ligne.valeur}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {produit.produits_lies?.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            {t("produit.produitsLies")}
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
