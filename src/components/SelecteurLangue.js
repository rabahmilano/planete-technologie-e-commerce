import { useRouter } from "next/router";
import { Box, Button } from "@mui/material";
import { stockerLocale } from "src/lib/i18n";

// Sélecteur FR | عربي dans le header. Le routage de locale Next préserve
// la page courante ; le choix est persisté en localStorage.
const SelecteurLangue = () => {
  const router = useRouter();
  const locale = router.locale || "fr";

  const changer = (nouvelleLocale) => {
    if (nouvelleLocale === locale) return;
    stockerLocale(nouvelleLocale);
    router.push(
      { pathname: router.pathname, query: router.query },
      router.asPath,
      { locale: nouvelleLocale },
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        border: "1px solid rgba(255,255,255,0.35)",
        borderRadius: 2,
        overflow: "hidden",
        flexShrink: 0,
      }}
      role="group"
      aria-label="Langue / اللغة"
    >
      {[
        { code: "fr", label: "FR" },
        { code: "ar", label: "عربي" },
      ].map((option) => {
        const actif = option.code === locale;
        return (
          <Button
            key={option.code}
            onClick={() => changer(option.code)}
            aria-pressed={actif}
            sx={{
              minWidth: 44,
              minHeight: 36,
              px: 1.5,
              py: 0.5,
              borderRadius: 0,
              color: actif ? "navy.main" : "#FFFFFF",
              bgcolor: actif ? "#FFFFFF" : "transparent",
              fontWeight: 700,
              "&:hover": {
                bgcolor: actif ? "#FFFFFF" : "rgba(255,255,255,0.15)",
              },
            }}
          >
            {option.label}
          </Button>
        );
      })}
    </Box>
  );
};

export default SelecteurLangue;
