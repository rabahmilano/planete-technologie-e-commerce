/** @type {import('next').NextConfig} */

// Origine du backend (fichiers produits statiques existants) dérivée de
// NEXT_PUBLIC_API_URL : seul cet hôte et Cloudinary sont autorisés pour
// next/image — plus de joker « ** » ouvert à tous les hébergeurs.
const origineApi = (() => {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_API_URL || "");
    const motif = { protocol: url.protocol.replace(":", ""), hostname: url.hostname };
    if (url.port) motif.port = url.port;
    return motif;
  } catch (e) {
    return null;
  }
})();

const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["fr", "ar"],
    defaultLocale: "fr",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      ...(origineApi ? [origineApi] : []),
    ],
  },
};

module.exports = nextConfig;
