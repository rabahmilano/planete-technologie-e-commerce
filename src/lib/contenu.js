// Contenu éditorial de la boutique : descriptions produits et noms de
// familles en français et en arabe.
// L'API publique ne renvoie pas de descriptions bilingues (ni description,
// ni description_ar, ni nom_famille_ar) : ce fichier est la source de
// vérité, fusionnée avec les données de l'API au rendu (voir
// src/lib/produit.js). Repli : français si l'arabe est absent, puis
// description de l'API si elle existe un jour.
// Rédigé uniquement à partir des désignations et des données réelles de
// l'API (GET /api/public/produits, 16 nov. 2026) : aucune spécification
// inventée (pas de port, pas de vitesse, pas de compatibilité affirmée
// au-delà de ce que dit la désignation).
export const DESCRIPTIONS_PRODUITS = {
  "chargeur-ugreen-30w-cd319": {
    fr: "Chargeur Ugreen 30 W, modèle CD319 (réf. 90766), pour recharger vos appareils au quotidien.",
    ar: "شاحن يوغرين بقدرة 30 واط، موديل CD319 (مرجع 90766)، لشحن أجهزتك اليومية.",
  },
  "adaptateur-otn-uc102": {
    fr: "Adaptateur OTN-UC102 : reliez un appareil USB-C à un écran ou un téléviseur HDTV.",
    ar: "محول OTN-UC102: يربط جهاز USB-C بشاشة أو تلفاز HDTV.",
  },
  "carte-wifi-6e-fenvi-ax-5400-mt7922": {
    fr: "Carte WiFi 6E Fenvi AX-5400 à puce MT7922, pour ajouter le WiFi 6E à votre ordinateur.",
    ar: "بطاقة واي فاي 6E فينفي AX-5400 بشريحة MT7922، لإضافة الواي فاي 6E إلى حاسوبك.",
  },
};

// Noms de familles bilingues, keyés par slug de famille (API publique).
// Familles connues : cartes-wifi, cartes-pcie, cles-wifi-usb,
// chargeurs-et-cables. Une famille absente d'ici garde son nom API.
export const NOMS_FAMILLES = {
  "cartes-wifi": { fr: "Cartes WiFi", ar: "بطاقات واي فاي" },
  "cartes-pcie": { fr: "Cartes PCIe", ar: "بطاقات PCIe" },
  "cles-wifi-usb": { fr: "Clés WiFi USB", ar: "مفاتيح واي فاي USB" },
  "chargeurs-et-cables": { fr: "Chargeurs et câbles", ar: "الشواحن والكابلات" },
};
