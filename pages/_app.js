import { useEffect, useMemo, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
import { PanierProvider } from "src/context/CartContext";
import Layout from "src/components/Layout";
import { creerThemeBoutique } from "src/lib/theme";
import {
  LOCALE_DEFAUT,
  LOCALES,
  estRTL,
  lireLocaleStockee,
  stockerLocale,
} from "src/lib/i18n";
import "styles/globals.css";

// Cache emotion LTR (fr) et RTL (ar, stylis-plugin-rtl : voie standard MUI).
// Deux clés distinctes : les styles RTL ne doivent pas se mélanger aux LTR.
const cacheLTR = createCache({ key: "css", prepend: true });
const cacheRTL = createCache({
  key: "css-rtl",
  prepend: true,
  stylisPlugins: [prefixer, rtlPlugin],
});

const App = ({ Component, pageProps }) => {
  const router = useRouter();
  const locale = LOCALES.includes(router.locale)
    ? router.locale
    : LOCALE_DEFAUT;
  const rtl = estRTL(locale);
  const theme = useMemo(() => creerThemeBoutique(rtl), [rtl]);
  const restaurationFaite = useRef(false);

  // <html> lang + dir : _document.js les pose côté serveur, ce useEffect
  // les resynchronise lors d'un changement de langue côté client.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    stockerLocale(locale);
  }, [locale, rtl]);

  // Restaurer la dernière langue choisie (localStorage) au premier
  // chargement, une seule fois, sans boucle de redirection.
  useEffect(() => {
    if (!router.isReady || restaurationFaite.current) return;
    restaurationFaite.current = true;
    const stockee = lireLocaleStockee();
    if (stockee && stockee !== locale) {
      // `as` = undefined : Next recalcule l'URL avec la locale cible
      // (retire le préfixe /ar pour fr, l'ajoute pour ar).
      router.replace(
        { pathname: router.pathname, query: router.query },
        undefined,
        { locale: stockee },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  return (
    <CacheProvider value={rtl ? cacheRTL : cacheLTR}>
      <Head>
        <title>Planète Tech — Boutique</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta
          name="description"
          content="Planète Tech — cartes WiFi, répéteurs, SSD et accessoires. Paiement à la livraison dans les 58 wilayas."
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PanierProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
          <Toaster position="bottom-center" />
        </PanierProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default App;
