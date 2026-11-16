// Prix en dinars. Chiffres latins dans les deux langues (usage courant du
// e-commerce algérien) ; en arabe, le suffixe devient « د.ج. ».
export const formaterPrix = (montant, locale = "fr") => {
  if (montant === null || montant === undefined || Number.isNaN(montant)) {
    return "—";
  }
  const nombre = Number(montant).toLocaleString(
    locale === "ar" ? "ar-DZ-u-nu-latn" : "fr-DZ",
  );
  return locale === "ar" ? `${nombre} د.ج.` : `${nombre} DZD`;
};

export const TELEPHONE_DZ = /^0(5|6|7)[0-9]{8}$/;

export const formaterDate = (date, locale = "fr") => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString(
      locale === "ar" ? "ar-DZ-u-nu-latn" : "fr-FR",
    );
  } catch (e) {
    return String(date);
  }
};
