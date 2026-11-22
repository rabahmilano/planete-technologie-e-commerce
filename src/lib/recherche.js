// Recherche : normalisation légère côté client (accents, pluriels) et
// correspondance FR/AR courante. La recherche API reste inchangée : ces
// utilitaires servent au surlignage des suggestions et aux propositions
// alternatives quand une requête ne donne rien.
//
// La liste des synonymes est tenue à la main (décision propriétaire) — à
// enrichir à partir des requêtes qui échouent, jamais générée automatiquement.
const SYNONYMES = {
  chargeur: ["شاحن", "chargeurs"],
  chargeurs: ["شاحن", "chargeur"],
  "شاحن": ["chargeur", "chargeurs"],
  cable: ["câble", "cables"],
  cables: ["câble", "cable"],
  "câble": ["cable", "cables"],
  wifi: ["wi-fi", "clé wifi", "واي فاي"],
  "wi-fi": ["wifi"],
  "clé wifi": ["wifi", "cle wifi"],
  "cle wifi": ["wifi", "clé wifi"],
  "واي فاي": ["wifi"],
};

// Minuscules + suppression des diacritiques + espaces réduits.
export const normaliser = (texte) =>
  (texte || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Retire un « s » de pluriel simple (≥ 4 lettres pour éviter les dégâts).
export const singulier = (terme) =>
  terme.length >= 4 && terme.endsWith("s") ? terme.slice(0, -1) : terme;

// Variantes d'une requête pour la recherche de rattrapage : sans pluriel,
// et avec les synonymes FR/AR mapés (après normalisation).
export const variantesRecherche = (terme) => {
  const base = normaliser(terme);
  if (!base) return [];
  const variantes = new Set();
  const sansPluriel = singulier(base);
  variantes.add(sansPluriel);
  (SYNONYMES[base] || []).forEach((v) => variantes.add(normaliser(v)));
  (SYNONYMES[sansPluriel] || []).forEach((v) => variantes.add(normaliser(v)));
  variantes.delete(base);
  return [...variantes];
};

// Découpe `texte` en segments pour surligner la première occurrence de
// `terme` (comparaison normalisée, accents ignorés). Renvoie
// [{ texte, fort }].
export const surligner = (texte, terme) => {
  const t = texte || "";
  const n = normaliser(t);
  const q = normaliser(terme);
  if (!q || !n.includes(q)) return [{ texte: t, fort: false }];
  // Repérer la position réelle : la normalisation peut changer la longueur
  // (diacritiques) — on cherche dans la chaîne normalisée puis on cale sur
  // les longueurs originale/normalisée caractère par caractère.
  let debut = n.indexOf(q);
  // Carte longueur normalisée → longueur originale
  let origineIndex = 0;
  let normaliseIndex = 0;
  let debutOriginal = t.length;
  let finOriginal = t.length;
  while (normaliseIndex <= debut && origineIndex <= t.length) {
    if (normaliseIndex === debut) {
      debutOriginal = origineIndex;
      break;
    }
    if (origineIndex < t.length) {
      const c = t[origineIndex];
      const cn = c
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      normaliseIndex += cn.length || 1;
    }
    origineIndex += 1;
  }
  finOriginal = debutOriginal + q.length;
  if (finOriginal > t.length) finOriginal = t.length;
  return [
    { texte: t.slice(0, debutOriginal), fort: false },
    { texte: t.slice(debutOriginal, finOriginal), fort: true },
    { texte: t.slice(finOriginal), fort: false },
  ].filter((segment) => segment.texte.length > 0);
};

// Historique local des recherches (localStorage, max 5, dédoublonné).
export const CLE_RECHERCHES = "ptech-recherches";

export const lireRecherchesRecentes = () => {
  try {
    const brut = window.localStorage.getItem(CLE_RECHERCHES);
    const liste = brut ? JSON.parse(brut) : [];
    return Array.isArray(liste) ? liste.filter((x) => typeof x === "string") : [];
  } catch (e) {
    return [];
  }
};

export const enregistrerRecherche = (terme) => {
  const propre = (terme || "").trim();
  if (!propre) return;
  try {
    const liste = lireRecherchesRecentes().filter(
      (x) => normaliser(x) !== normaliser(propre),
    );
    liste.unshift(propre);
    window.localStorage.setItem(CLE_RECHERCHES, JSON.stringify(liste.slice(0, 5)));
  } catch (e) {
    /* stockage indisponible */
  }
};

export const effacerRecherchesRecentes = () => {
  try {
    window.localStorage.removeItem(CLE_RECHERCHES);
  } catch (e) {
    /* stockage indisponible */
  }
};
