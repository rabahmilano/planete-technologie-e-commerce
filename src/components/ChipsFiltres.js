import { Box, Chip } from "@mui/material";
import { useTr } from "src/lib/i18n";
import { nomFamille } from "src/lib/produit";

// Chips des filtres actifs, dérivées de l'URL (état shareable). Chaque chip
// est retirable individuellement ; le compte alimente aussi le bouton
// mobile « Filtres (n) ».
const ChipsFiltres = ({ filtres, familles, onRetirer }) => {
  const { t, locale } = useTr();

  const famille = familles.find(
    (f) => String(f.id) === String(filtres.famille) ||
      (f.sous_familles || []).some(
        (sf) => String(sf.id) === String(filtres.famille),
      ),
  );
  const nomFamilleActive = famille
    ? nomFamille(
        famille.sous_familles?.find(
          (sf) => String(sf.id) === String(filtres.famille),
        ) || famille,
        locale,
      )
    : filtres.famille;

  const chips = [];
  if (filtres.recherche) {
    chips.push({ cle: "recherche", libelle: `« ${filtres.recherche} »` });
  }
  if (filtres.famille) {
    chips.push({ cle: "famille", libelle: nomFamilleActive });
  }
  if (filtres.prix_min) {
    chips.push({ cle: "prix_min", libelle: `≥ ${filtres.prix_min} DA` });
  }
  if (filtres.prix_max) {
    chips.push({ cle: "prix_max", libelle: `≤ ${filtres.prix_max} DA` });
  }
  if (filtres.promo === "true") {
    chips.push({ cle: "promo", libelle: t("filtres.enPromo") });
  }
  if (filtres.en_stock === "true") {
    chips.push({ cle: "en_stock", libelle: t("filtres.enStockUniquement") });
  }

  if (chips.length === 0) return null;

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
      {chips.map((chip) => (
        <Chip
          key={chip.cle}
          label={chip.libelle}
          size="small"
          onDelete={() => onRetirer(chip.cle)}
          aria-label={`${chip.libelle} — ${t("panier.retirer")}`}
        />
      ))}
    </Box>
  );
};

export default ChipsFiltres;
