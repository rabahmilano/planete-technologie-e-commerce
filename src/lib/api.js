import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/public`,
  headers: { "Content-Type": "application/json" },
});

export const getProduits = (params) =>
  api.get("/produits", { params }).then((r) => r.data);

export const getProduit = (slug) =>
  api.get(`/produits/${slug}`).then((r) => r.data);

export const getFamilles = () => api.get("/familles").then((r) => r.data);

export const getWilayas = () =>
  api.get("/livraison/wilayas").then((r) => r.data);

export const getCommunes = (wilaya) =>
  api.get("/livraison/communes", { params: { wilaya } }).then((r) => r.data);

export const getBureaux = (wilaya, commune) =>
  api
    .get("/livraison/bureaux", { params: { wilaya, commune } })
    .then((r) => r.data);

export const getTarif = (wilaya, type) =>
  api
    .get("/livraison/tarif", { params: { wilaya, type } })
    .then((r) => r.data);

export const verifierCode = (code, montant_commande) =>
  api
    .post("/codes-promo/verifier", { code, montant_commande })
    .then((r) => r.data);

export const creerCommande = (donnees) =>
  api.post("/commandes", donnees).then((r) => r.data);

export const getSuiviCommande = (id, telephone) =>
  api
    .get(`/commandes/${id}`, { params: { telephone } })
    .then((r) => r.data);

export default api;
