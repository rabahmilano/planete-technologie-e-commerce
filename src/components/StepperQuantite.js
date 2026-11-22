import { Box, IconButton, TextField, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

// Stepper de quantité (− / champ / +) : remplace le champ numérique brut.
// 97 % des sites échouent à cette règle et provoquent des « 21 » au lieu
// de « 2 » (recherche UX du cahier des charges). Cibles tactiles ≥ 44 px,
// bornes 1–99, identiques au plafond du panier.
const StepperQuantite = ({ valeur, onChange, min = 1, max = 99, libelle }) => {
  const decrementer = () => onChange(Math.max(min, valeur - 1));
  const incrementer = () => onChange(Math.min(max, valeur + 1));

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <IconButton
        aria-label={libelle ? `${libelle} −` : "−"}
        onClick={decrementer}
        disabled={valeur <= min}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          width: 44,
          height: 44,
        }}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <TextField
        type="number"
        size="small"
        value={valeur}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isNaN(n) ? min : Math.max(min, Math.min(max, n)));
        }}
        inputProps={{
          min,
          max,
          inputMode: "numeric",
          // aria-label via inputProps : c'est le champ <input> qui porte le
          // nom accessible (les props de TextField tombent sur la FormControl).
          "aria-label": libelle,
        }}
        sx={{
          width: 64,
          "& input": { textAlign: "center", fontWeight: 700 },
          "& .MuiOutlinedInput-root": { borderRadius: 2 },
        }}
      />
      <IconButton
        aria-label={libelle ? `${libelle} +` : "+"}
        onClick={incrementer}
        disabled={valeur >= max}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          width: 44,
          height: 44,
        }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default StepperQuantite;
