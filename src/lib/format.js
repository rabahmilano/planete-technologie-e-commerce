export const formaterPrix = (montant) => {
  if (montant === null || montant === undefined || Number.isNaN(montant)) {
    return "—";
  }
  return `${Number(montant).toLocaleString("fr-DZ")} DZD`;
};

export const TELEPHONE_DZ = /^0(5|6|7)[0-9]{8}$/;
