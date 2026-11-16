// Contact WhatsApp de la boutique.
// Aucun numéro en dur : si NEXT_PUBLIC_WHATSAPP_NUMERO est défini (format
// international sans « + », ex. 213550123456), le lien pointe vers ce numéro ;
// sinon, simple repli vers wa.me en attendant que le numéro soit fourni.
export const urlWhatsApp = () => {
  const numero = (process.env.NEXT_PUBLIC_WHATSAPP_NUMERO || "").replace(
    /\D/g,
    "",
  );
  return numero ? `https://wa.me/${numero}` : "https://wa.me/";
};
