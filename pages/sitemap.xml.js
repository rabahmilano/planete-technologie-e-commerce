import { getProduits } from "src/lib/api";

export const getServerSideProps = async ({ res }) => {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002"
  ).replace(/\/$/, "");
  const urls = [`${base}/`, `${base}/boutique`];
  try {
    const donnees = await getProduits({ limit: 100 });
    for (const produit of donnees.produits) {
      urls.push(`${base}/produits/${produit.slug}`);
    }
  } catch (e) {
    urls.push(`${base}/produits`);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${url}</loc></url>`)
    .join("\n")}\n</urlset>`;
  res.setHeader("Content-Type", "text/xml");
  res.write(xml);
  res.end();
  return { props: {} };
};

const Sitemap = () => null;

export default Sitemap;
