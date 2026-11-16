import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { urlImage } from "src/lib/api";

const CartContext = createContext(null);
const CLE_STOCKAGE = "ptech-panier";

export const usePanier = () => useContext(CartContext);

export const PanierProvider = ({ children }) => {
  const [articles, setArticles] = useState([]);
  const [codePromo, setCodePromo] = useState(null);
  const [charge, setCharge] = useState(true);

  useEffect(() => {
    try {
      const brut = window.localStorage.getItem(CLE_STOCKAGE);
      if (brut) {
        const donnees = JSON.parse(brut);
        setArticles(donnees.articles || []);
        setCodePromo(donnees.codePromo || null);
      }
    } catch (e) {
      setArticles([]);
    }
    setCharge(false);
  }, []);

  useEffect(() => {
    if (charge) return;
    window.localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({ articles, codePromo }),
    );
  }, [articles, codePromo, charge]);

  const ajouter = (produit, quantite = 1) => {
    if (!produit.en_stock) {
      toast.error("Ce produit est en rupture de stock.");
      return;
    }
    setArticles((precedents) => {
      const existant = precedents.find((a) => a.slug === produit.slug);
      if (existant) {
        return precedents.map((a) =>
          a.slug === produit.slug
            ? { ...a, quantite: Math.min(a.quantite + quantite, 99) }
            : a,
        );
      }
      return [
        ...precedents,
        {
          slug: produit.slug,
          designation: produit.designation,
          prix: produit.prix_effectif,
          image: urlImage(produit.image_principale),
          quantite,
        },
      ];
    });
    toast.success("Produit ajouté au panier.");
  };

  const changerQuantite = (slug, quantite) => {
    const qte = Math.max(1, Math.min(parseInt(quantite, 10) || 1, 99));
    setArticles((precedents) =>
      precedents.map((a) => (a.slug === slug ? { ...a, quantite: qte } : a)),
    );
  };

  const retirer = (slug) => {
    setArticles((precedents) => precedents.filter((a) => a.slug !== slug));
  };

  const vider = () => {
    setArticles([]);
    setCodePromo(null);
  };

  const sousTotal = useMemo(
    () => articles.reduce((t, a) => t + a.prix * a.quantite, 0),
    [articles],
  );

  const nbArticles = useMemo(
    () => articles.reduce((t, a) => t + a.quantite, 0),
    [articles],
  );

  return (
    <CartContext.Provider
      value={{
        articles,
        ajouter,
        changerQuantite,
        retirer,
        vider,
        sousTotal,
        nbArticles,
        codePromo,
        setCodePromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
