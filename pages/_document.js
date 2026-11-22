import Document, { Html, Head, Main, NextScript } from "next/document";
import { policeArabe, policeLatine } from "src/lib/fonts";

// lang + dir sont posés côté serveur d'après la locale de la requête
// (__NEXT_DATA__.locale) : le HTML arrive déjà en RTL pour /ar.
// Le basculement côté client (changement de langue sans rechargement) est
// synchronisé par _app.js (useEffect sur document.documentElement).
class DocumentBoutique extends Document {
  render() {
    const locale = this.props.__NEXT_DATA__?.locale || "fr";
    const rtl = locale === "ar";
    return (
      <Html lang={locale} dir={rtl ? "rtl" : "ltr"}>
        <Head>
          <link rel="icon" href="/favicon.png" />
          <link rel="apple-touch-icon" href="/favicon.png" />
        </Head>
        {/* Classes next/font : @font-face + préchargement d'Inter et
            IBM Plex Sans Arabic sur chaque page, LTR comme RTL. */}
        <body className={`${policeLatine.variable} ${policeArabe.variable}`}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default DocumentBoutique;
