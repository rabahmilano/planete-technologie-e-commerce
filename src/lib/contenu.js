// Contenu éditorial de la boutique : noms de familles en français et en
// arabe, keyés par slug de famille (API publique).
// Les descriptions produits vivent désormais dans la base (champs
// description / description_ar du produit, écrits côté dashboard) et sont
// renvoyées par l'API publique : voir src/lib/produit.js.
// Une famille absente d'ici garde son nom API.
export const NOMS_FAMILLES = {
  "cartes-wifi": { fr: "Cartes WiFi", ar: "بطاقات واي فاي" },
  "cartes-pcie": { fr: "Cartes PCIe", ar: "بطاقات PCIe" },
  "cles-wifi-usb": { fr: "Clés WiFi USB", ar: "مفاتيح واي فاي USB" },
  "chargeurs-et-cables": { fr: "Chargeurs et câbles", ar: "الشواحن والكابلات" },
};
