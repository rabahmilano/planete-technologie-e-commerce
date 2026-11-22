import { createContext, useContext, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";

// Onglets composés (pattern cc-skill-frontend-patterns) : contexte interne,
// navigation flèches au clavier dans la liste, sensible au sens de lecture,
// panels liés par aria. Utilisation :
//   <OngletsProduit>
//     <OngletsProduit.Item id="desc" label="Description">...</...Item>
//   </OngletsProduit>
const ContexteOnglets = createContext(null);

const OngletsProduit = ({ children }) => {
  const [activeId, setActiveId] = useState(null);
  const listeRef = useRef(null);

  // Items déclarés par l'usage : on lit les enfants pour la liste d'onglets.
  const items = Array.isArray(children) ? children : [children];

  const actifCourant =
    activeId && items.some((item) => item.props.id === activeId)
      ? activeId
      : items[0]?.props?.id;

  const deplacer = (direction) => {
    const index = items.findIndex((item) => item.props.id === actifCourant);
    const suivant = (index + direction + items.length) % items.length;
    const id = items[suivant].props.id;
    setActiveId(id);
    const bouton = listeRef.current?.querySelector(`#onglet-${id}`);
    bouton?.focus();
  };

  const onKeyDown = (e) => {
    const avance = 1;
    const recule = -1;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      deplacer(document.documentElement.dir === "rtl" ? -avance : avance);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      deplacer(document.documentElement.dir === "rtl" ? avance : recule);
    } else if (e.key === "Home" && items.length) {
      e.preventDefault();
      setActiveId(items[0].props.id);
      listeRef.current?.querySelector(`#onglet-${items[0].props.id}`)?.focus();
    } else if (e.key === "End" && items.length) {
      e.preventDefault();
      const dernier = items[items.length - 1].props.id;
      setActiveId(dernier);
      listeRef.current?.querySelector(`#onglet-${dernier}`)?.focus();
    }
  };

  return (
    <ContexteOnglets.Provider value={{ actif: actifCourant, setActiveId }}>
      <Box>
        <Box
          ref={listeRef}
          role="tablist"
          onKeyDown={onKeyDown}
          sx={{
            display: "flex",
            gap: 0.5,
            borderBottom: "2px solid",
            borderColor: "divider",
            mb: 2,
            overflowX: "auto",
          }}
        >
          {items.map((item) => {
            const actif = item.props.id === actifCourant;
            return (
              <Box
                key={item.props.id}
                id={`onglet-${item.props.id}`}
                role="tab"
                tabIndex={actif ? 0 : -1}
                aria-selected={actif}
                aria-controls={`panel-${item.props.id}`}
                onClick={() => setActiveId(item.props.id)}
                sx={{
                  px: 2,
                  py: 1.25,
                  minHeight: 44,
                  cursor: "pointer",
                  fontWeight: actif ? 700 : 400,
                  color: actif ? "primary.dark" : "text.secondary",
                  borderBottom: "2px solid",
                  borderColor: actif ? "primary.main" : "transparent",
                  mb: "-2px",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                }}
              >
                {item.props.label}
              </Box>
            );
          })}
        </Box>
        {items.map((item) => (
          <Box
            key={item.props.id}
            id={`panel-${item.props.id}`}
            role="tabpanel"
            aria-labelledby={`onglet-${item.props.id}`}
            hidden={item.props.id !== actifCourant}
            sx={{ pt: 1 }}
          >
            {item.props.id === actifCourant && item.props.children}
          </Box>
        ))}
      </Box>
    </ContexteOnglets.Provider>
  );
};

const Item = ({ id, label, children }) => {
  const { actif } = useContext(ContexteOnglets);
  // Le contenu n'est monté que pour l'onglet actif (rendu ci-dessus) ;
  // ce composant ne rend rien lui-même, il déclare un onglet.
  return actif === id ? children : null;
};

const TitreOnglet = ({ children }) => (
  <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700, mb: 1.5 }}>
    {children}
  </Typography>
);

OngletsProduit.Item = Item;
OngletsProduit.Titre = TitreOnglet;

export default OngletsProduit;
