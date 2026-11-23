import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Dialog,
  DialogContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedIcon from "@mui/icons-material/Verified";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import ProductCard from "src/components/ProductCard";
import ImageProduit from "src/components/ImageProduit";
import StepperQuantite from "src/components/StepperQuantite";
import OngletsProduit from "src/components/OngletsProduit";
import BarreAchatMobile from "src/components/BarreAchatMobile";
import { getProduit, getTarif, getWilayas, urlImage } from "src/lib/api";
import { formaterDate, formaterPrix } from "src/lib/format";
import { usePanier } from "src/context/CartContext";
import { useRouter } from "next/router";
import { useTr } from "src/lib/i18n";
import { JETONS } from "src/lib/theme";
import {
  descriptionProduit,
  nomFamilleProduit,
  nomProduit,
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

// Lightbox plein écran : zoom par double-clic / double-tap et pincement
// (mobile), navigation image par image, Échap pour fermer. Le Dialog MUI
// piège le focus et le restitue à l'élément déclencheur à la fermeture.
const LightboxGalerie = ({ ouvert, onFermer, images, imageChoisie, choisir, alt, rtl }) => {
  const { t } = useTr();
  const [zoom, setZoom] = useState(1);
  const [origine, setOrigine] = useState("50% 50%");
  const pinceRef = useRef(null);

  // Nouvelle image : remise à zéro du zoom.
  useEffect(() => {
    setZoom(1);
    setOrigine("50% 50%");
  }, [imageChoisie]);

  // Bascule du zoom : le point de double-clic devient l'origine du
  // grossissement. Détection par clic à detail >= 2 (double-clic natif et
  // double-tap) — un simple clic ne zoome pas. Le bouton Zoom appelle la
  // même bascule sans évènement.
  const basculerZoom = (e) => {
    if (e && e.detail != null && e.detail < 2) return;
    if (zoom > 1) {
      setZoom(1);
      return;
    }
    if (e?.clientX != null) {
      const zone = e.currentTarget?.closest?.("[data-zone-zoom]");
      if (zone) {
        const rect = zone.getBoundingClientRect();
        setOrigine(
          `${(((e.clientX - rect.left) / rect.width) * 100).toFixed(1)}% ${(
            ((e.clientY - rect.top) / rect.height) * 100
          ).toFixed(1)}%`,
        );
      }
    }
    setZoom(2.5);
  };

  // Pincement : deux doigts, échelle 1 à 4, ancrée au milieu des doigts.
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      const [a, b] = e.touches;
      pinceRef.current = {
        dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
        zoom,
      };
    }
  };
  const onTouchMove = (e) => {
    if (e.touches.length === 2 && pinceRef.current) {
      const [a, b] = e.touches;
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (pinceRef.current.dist > 0) {
        setZoom(
          Math.min(4, Math.max(1, (pinceRef.current.zoom * dist) / pinceRef.current.dist)),
        );
      }
    }
  };
  const onTouchEnd = () => {
    pinceRef.current = null;
    setZoom((precedent) => (precedent < 1.15 ? 1 : precedent));
  };

  // Flèches du clavier : sens de lecture conservé (RTL inversé).
  const onKeyDown = (e) => {
    if (images.length < 2) return;
    const avance = rtl ? "ArrowLeft" : "ArrowRight";
    const recule = rtl ? "ArrowRight" : "ArrowLeft";
    if (e.key === avance) choisir((imageChoisie + 1) % images.length);
    if (e.key === recule) choisir((imageChoisie - 1 + images.length) % images.length);
  };

  return (
    <Dialog
      fullScreen
      open={ouvert}
      onClose={onFermer}
      aria-label={alt}
      PaperProps={{ sx: { bgcolor: "rgba(7,21,39,0.97)", color: "#FFFFFF" } }}
    >
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
          <IconButton
            aria-label={t("commun.fermer")}
            onClick={onFermer}
            sx={{ color: "#FFFFFF" }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="body2" sx={{ color: "#FFFFFF", ml: "auto" }}>
            {images.length > 1 && `${imageChoisie + 1} / ${images.length}`}
          </Typography>
          <IconButton
            aria-label={t("produit.zoom")}
            aria-pressed={zoom > 1}
            onClick={() => basculerZoom(null)}
            sx={{ color: "#FFFFFF" }}
          >
            {zoom > 1 ? <ZoomOutIcon /> : <ZoomInIcon />}
          </IconButton>
        </Box>
        <Box
          data-zone-zoom
          sx={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            touchAction: "none",
            bgcolor: "rgba(11,31,58,0.55)",
            cursor: zoom > 1 ? "zoom-out" : "zoom-in",
          }}
          onClick={basculerZoom}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onKeyDown={onKeyDown}
          tabIndex={0}
          aria-label={alt}
          role="img"
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              transform: `scale(${zoom})`,
              transformOrigin: origine,
              transition: "transform 200ms ease-out",
            }}
          >
            {images[imageChoisie] && (
              <Image
                src={images[imageChoisie].url}
                alt={alt}
                fill
                sizes="100vw"
                style={{ objectFit: "contain" }}
                priority={ouvert}
              />
            )}
          </Box>
          {images.length > 1 && (
            <>
              <IconButton
                aria-label={t("produit.imagePrecedente")}
                onClick={() =>
                  choisir((imageChoisie - 1 + images.length) % images.length)
                }
                sx={{
                  position: "absolute",
                  top: "50%",
                  [rtl ? "right" : "left"]: 8,
                  transform: "translateY(-50%)",
                  color: "#FFFFFF",
                  bgcolor: "rgba(7,21,39,0.6)",
                  "&:hover": { bgcolor: "rgba(7,21,39,0.8)" },
                }}
              >
                {rtl ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
              <IconButton
                aria-label={t("produit.imageSuivante")}
                onClick={() => choisir((imageChoisie + 1) % images.length)}
                sx={{
                  position: "absolute",
                  top: "50%",
                  [rtl ? "left" : "right"]: 8,
                  transform: "translateY(-50%)",
                  color: "#FFFFFF",
                  bgcolor: "rgba(7,21,39,0.6)",
                  "&:hover": { bgcolor: "rgba(7,21,39,0.8)" },
                }}
              >
                {rtl ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </IconButton>
            </>
          )}
        </Box>
        {images.length > 1 && (
          <Box sx={{ display: "flex", gap: 1, justifyContent: "center", p: 2 }}>
            {images.map((image, index) => (
              <Box
                key={index}
                component="button"
                type="button"
                aria-label={t("produit.image", { n: index + 1 })}
                aria-pressed={index === imageChoisie}
                onClick={() => choisir(index)}
                sx={{
                  p: 0,
                  border: index === imageChoisie ? "2px solid #FFFFFF" : "2px solid transparent",
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                  bgcolor: "transparent",
                }}
              >
                <ImageProduit
                  src={image.url}
                  alt=""
                  largeur={64}
                  hauteur={64}
                  styleImage={{ objectFit: "cover" }}
                />
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Galerie produit : image principale 1:1 (priority : c'est le LCP), vignettes
// 72 px toujours visibles avec état actif, ouverture de la lightbox au clic
// ou au clavier. Une seule image = pas de rangée de vignettes. Échec d'image
// = placeholder de marque, jamais un emoji ni un bloc vide. Le parent la
// remonte avec key={produit.slug} : le changement de produit réinitialise
// tout, sans useEffect de reset.
const GalerieProduit = ({ produit, images }) => {
  const { t, rtl } = useTr();
  const [imageChoisie, setImageChoisie] = useState(0);
  const [lightboxOuverte, setLightboxOuverte] = useState(false);

  return (
    <>
      {images.length === 0 ? (
        <ImageProduit
          src={null}
          alt=""
          ratio={1}
          sx={{ borderRadius: 3, bgcolor: "background.default" }}
        />
      ) : (
        <>
          <Box
            component="button"
            type="button"
            onClick={() => setLightboxOuverte(true)}
            aria-label={t("produit.agrandir")}
            sx={{
              display: "block",
              width: "100%",
              p: 0,
              border: "none",
              bgcolor: "transparent",
              cursor: "zoom-in",
              textAlign: "initial",
            }}
          >
            <ImageProduit
              src={images[imageChoisie]?.url || images[0]?.url}
              alt={nomProduit(produit)}
              ratio={1}
              prioritaire
              sizes="(max-width: 900px) 100vw, 600px"
              sx={{
                borderRadius: 3,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
              }}
            />
          </Box>
          {images.length > 1 && (
            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
              {images.map((image, index) => (
                <Box
                  key={index}
                  component="button"
                  type="button"
                  aria-label={t("produit.image", { n: index + 1 })}
                  aria-pressed={index === imageChoisie}
                  onClick={() => setImageChoisie(index)}
                  sx={{
                    p: 0,
                    border:
                      index === imageChoisie
                        ? "2px solid"
                        : "1px solid",
                    borderColor:
                      index === imageChoisie ? "primary.main" : "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: "pointer",
                    bgcolor: "transparent",
                  }}
                >
                  <ImageProduit
                    src={image.url}
                    alt=""
                    largeur={72}
                    hauteur={72}
                    styleImage={{ objectFit: "cover" }}
                  />
                </Box>
              ))}
            </Box>
          )}
          <LightboxGalerie
            ouvert={lightboxOuverte}
            onFermer={() => setLightboxOuverte(false)}
            images={images}
            imageChoisie={imageChoisie}
            choisir={setImageChoisie}
            alt={nomProduit(produit)}
            rtl={rtl}
          />
        </>
      )}
    </>
  );
};

// Prix unitaire réel selon la quantité : le palier applicable est le plus
// grand dont la quantité minimale est atteinte ; sinon prix_effectif.
const prixUnitairePour = (produit, quantite) => {
  const paliers = (produit.paliers || []).filter(
    (palier) => palier.quantite_min <= quantite,
  );
  if (paliers.length === 0) return produit.prix_effectif;
  const dernier = paliers[paliers.length - 1];
  return dernier.prix_unitaire;
};

const PageProduit = ({ produit }) => {
  const { ajouter } = usePanier();
  const router = useRouter();
  const { t, locale, rtl } = useTr();
  const [quantite, setQuantite] = useState(1);
  const [wilaya, setWilaya] = useState("");
  const [wilayas, setWilayas] = useState([]);
  const [tarif, setTarif] = useState(null);
  const [tarifEnCours, setTarifEnCours] = useState(false);
  const [barreVisible, setBarreVisible] = useState(false);
  const atcRef = useRef(null);

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
  const urlSite = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002").replace(
    /\/$/,
    "",
  );
  const urlCanonique = `${urlSite}/produits/${produit.slug}`;
  const metaDescription =
    description || `${nomProduit(produit)} — ${formaterPrix(produit.prix_effectif, locale)}`;

  // Prix unitaire synchronisé avec la quantité (paliers réels).
  const prixUnitaire = prixUnitairePour(produit, quantite);
  const totalLigne = prixUnitaire * quantite;
  const remise =
    produit.prix_barre && produit.prix_effectif < produit.prix_barre
      ? Math.round(
          ((produit.prix_barre - produit.prix_effectif) / produit.prix_barre) * 100,
        )
      : null;
  const palierActif = (produit.paliers || []).reduce(
    (actif, palier) => (palier.quantite_min <= quantite ? palier : actif),
    null,
  );

  useEffect(() => {
    getWilayas()
      .then(setWilayas)
      .catch(() => setWilayas([]));
  }, []);

  // Frais réels pour la wilaya choisie (domicile) : jamais de montant
  // inventé. Pas de date estimée : les délais ne sont pas confirmés.
  useEffect(() => {
    if (!wilaya) {
      setTarif(null);
      return;
    }
    setTarifEnCours(true);
    getTarif(wilaya, "DOMICILE")
      .then(setTarif)
      .catch(() => setTarif(null))
      .finally(() => setTarifEnCours(false));
  }, [wilaya]);

  const nomWilayaChoisie = wilayas.find((w) => w.code === wilaya)?.nom || "";

  // Barre d'achat mobile : visible quand le CTA principal sort de l'écran.
  useEffect(() => {
    const cible = atcRef.current;
    if (!cible || typeof IntersectionObserver === "undefined") return;
    const observateur = new IntersectionObserver(
      ([entree]) => setBarreVisible(!entree.isIntersecting),
      { threshold: 0 },
    );
    observateur.observe(cible);
    return () => observateur.disconnect();
  }, []);

  // JSON-LD produit (SEO) : uniquement des données réelles de l'API, nom
  // d'affichage (intitule_publication) en priorité.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: nomProduit(produit),
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

  // Caractéristiques : uniquement des champs réels. Poids retiré (décision
  // propriétaire n°8) ; garantie = garantie de marche (décision n°1).
  const caracteristiques = [
    { label: t("produit.famille"), valeur: nomFamille || "—" },
    {
      label: t("produit.disponibilite"),
      valeur: produit.en_stock ? t("commun.enStock") : t("commun.ruptureStock"),
    },
    { label: t("produit.garantie"), valeur: t("produit.garantieValeur") },
    { label: t("produit.paiement"), valeur: t("produit.paiementValeur") },
  ];

  const surAjouter = () => ajouter(produit, quantite);
  const surAcheter = () => {
    ajouter(produit, quantite);
    router.push("/commande");
  };

  return (
    <Box>
      <Head>
        <title>{`${nomProduit(produit)} — Planète Tech`}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={urlCanonique} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${nomProduit(produit)} — Planète Tech`} />
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
        separator={rtl ? <NavigateBeforeIcon fontSize="small" /> : <NavigateNextIcon fontSize="small" />}
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
        <Typography color="text.primary">{nomProduit(produit)}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <GalerieProduit
            key={produit.slug}
            produit={produit}
            images={images}
          />
        </Grid>
        {/* Decision kit : tout ce qu'il faut pour décider, sans défiler. */}
        <Grid item xs={12} md={6}>
          <Typography variant="productTitle" component="h1">
            {nomProduit(produit)}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5, my: 1, flexWrap: "wrap" }}>
            {produit.promo_active && (
              <Chip
                label={t("commun.promo")}
                size="small"
                sx={{ bgcolor: JETONS.promo.fond, color: JETONS.promo.texte }}
              />
            )}
            {/* Stock : couleur + texte + icône, jamais la couleur seule.
                Vert foncé : le blanc sur #16A34A échoue au contraste AA. */}
            {produit.en_stock ? (
              <Chip
                icon={<CheckCircleIcon fontSize="small" />}
                label={
                  stockFaible(produit)
                    ? t("produit.plusQue", { n: stock })
                    : t("commun.enStock")
                }
                color={stockFaible(produit) ? "warning" : "success"}
                size="small"
                sx={stockFaible(produit) ? undefined : { bgcolor: "success.dark" }}
              />
            ) : (
              <Chip
                icon={<CancelIcon fontSize="small" />}
                label={t("commun.ruptureStock")}
                size="small"
              />
            )}
            {produit.famille && <Chip label={nomFamille} size="small" />}
          </Box>

          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="price" component="p" color="primary" sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" } }}>
              {formaterPrix(prixUnitaire, locale)}
            </Typography>
            {produit.prix_barre && produit.prix_effectif < produit.prix_barre && (
              <>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  {formaterPrix(produit.prix_barre, locale)}
                </Typography>
                <Chip
                  label={`−${remise} %`}
                  size="small"
                  sx={{ bgcolor: JETONS.promo.fond, color: JETONS.promo.texte, fontWeight: 700 }}
                />
              </>
            )}
          </Box>
          {produit.promo_active && produit.fin_promo && (
            <Typography variant="body2" color="error">
              {t("produit.promoJusqua", {
                date: formaterDate(produit.fin_promo, locale),
              })}
            </Typography>
          )}

          {/* Paliers réels ; la rangée applicable suit la quantité. */}
          {produit.paliers?.length > 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                {t("produit.prixDegressifs")}
              </Typography>
              <Table size="small" sx={{ maxWidth: 420 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("produit.aPartirDe")}</TableCell>
                    <TableCell>{t("produit.prixUnitaire")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {produit.paliers.map((palier) => (
                    <TableRow
                      key={palier.quantite_min}
                      selected={palierActif && palierActif.quantite_min === palier.quantite_min}
                      sx={{
                        "&.Mui-selected": {
                          bgcolor: "rgba(145,85,253,0.10)",
                          "& > *": { fontWeight: 700 },
                        },
                      }}
                    >
                      <TableCell>
                        {palier.quantite_min} {t("produit.pieces")}
                      </TableCell>
                      <TableCell>{formaterPrix(palier.prix_unitaire, locale)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {/* Stepper + CTA ambre ; prix et palier synchrones. */}
          <Box
            ref={atcRef}
            sx={{ display: "flex", gap: 2, mt: 3, alignItems: "center", flexWrap: "wrap" }}
          >
            <StepperQuantite
              valeur={quantite}
              onChange={setQuantite}
              libelle={t("produit.quantite")}
            />
            <Button
              variant="contained"
              color="secondary"
              size="large"
              disabled={!produit.en_stock}
              onClick={surAjouter}
              sx={{ flexGrow: 1, maxWidth: 360 }}
            >
              {produit.en_stock
                ? t("commun.ajouterPanier")
                : t("commun.ruptureStock")}
            </Button>
            {/* « Acheter maintenant » : desktop uniquement (décision n°7). */}
            {produit.en_stock && (
              <Button
                variant="outlined"
                color="primary"
                onClick={surAcheter}
                sx={{ display: { xs: "none", md: "inline-flex" } }}
              >
                {t("produit.acheterMaintenant")}
              </Button>
            )}
          </Box>
          {quantite > 1 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t("commun.total")}&nbsp;:{" "}
              <strong>{formaterPrix(totalLigne, locale)}</strong>{" "}
              ({quantite} × {formaterPrix(prixUnitaire, locale)})
            </Typography>
          )}

          {/* Estimation des frais réels par wilaya ; pas de date : les
              délais ne sont pas confirmés par le propriétaire. */}
          <Box sx={{ mt: 2, maxWidth: 480 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="wilaya-livraison-label">
                {t("panier.choisirWilaya")}
              </InputLabel>
              <Select
                labelId="wilaya-livraison-label"
                label={t("panier.choisirWilaya")}
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
              >
                {wilayas.map((w) => (
                  <MenuItem key={w.code} value={w.code}>
                    {String(w.code).padStart(2, "0")} — {w.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {wilaya && tarifEnCours && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                …
              </Typography>
            )}
            {wilaya && !tarifEnCours && tarif?.disponible && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {t("produit.livraisonWilaya", { wilaya: nomWilayaChoisie })} : +{" "}
                {formaterPrix(tarif.prix, locale)} —{" "}
                <strong>
                  {t("produit.totalALivraison")} :{" "}
                  {formaterPrix(totalLigne + tarif.prix, locale)}
                </strong>
              </Typography>
            )}
            {wilaya && !tarifEnCours && tarif && !tarif.disponible && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t("produit.livraisonIndispo")}
              </Typography>
            )}
          </Box>

          {/* Confiance au point d'action : 3 badges, pas de mur de badges. */}
          <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
            {[
              { Icone: PaymentIcon, texte: t("atouts.paiementTitre") },
              { Icone: LocalShippingIcon, texte: t("atouts.livraisonTitre") },
              { Icone: VerifiedIcon, texte: t("atouts.verifieTitre") },
            ].map(({ Icone, texte }) => (
              <Box
                key={texte}
                sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}
              >
                <Icone fontSize="small" color="primary" />
                <Typography variant="caption">{texte}</Typography>
              </Box>
            ))}
          </Box>

          {!produit.en_stock && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {t("produit.ruptureAlerte")}
            </Alert>
          )}
        </Grid>
      </Grid>

      {/* Onglets : description réelle, caractéristiques réelles, livraison
          et paiement — sous la ligne de flottaison. */}
      <Box sx={{ mt: 5 }}>
        <OngletsProduit>
          <OngletsProduit.Item
            id="description"
            label={t("produit.descriptionTab")}
          >
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {description || t("produit.aucuneDescription")}
            </Typography>
          </OngletsProduit.Item>
          <OngletsProduit.Item
            id="caracteristiques"
            label={t("produit.caracteristiques")}
          >
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
          </OngletsProduit.Item>
          <OngletsProduit.Item id="livraison" label={t("produit.livraisonTab")}>
            <Typography variant="body1">{t("atouts.paiementTexte")}</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {t("atouts.livraisonTexte")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              {t("commande.notePaiement")}
            </Typography>
          </OngletsProduit.Item>
        </OngletsProduit>
      </Box>

      {produit.produits_lies?.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
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

      <BarreAchatMobile
        produit={produit}
        quantite={quantite}
        prixUnitaire={prixUnitaire}
        visible={barreVisible}
        onAjouter={surAjouter}
      />
    </Box>
  );
};

export default PageProduit;
