// Contact WhatsApp de la boutique.
// Aucun numéro en dur : si NEXT_PUBLIC_WHATSAPP_NUMERO est défini (format
// international sans « + », ex. 213550123456), le lien pointe vers ce numéro.
// Sans numéro configuré, urlWhatsApp() renvoie null : les composants cachent
// le bouton WhatsApp au lieu de créer un lien mort vers https://wa.me/.
const numeroWhatsApp = () =>
  (process.env.NEXT_PUBLIC_WHATSAPP_NUMERO || "").replace(/\D/g, "");

export const whatsappConfigure = () => numeroWhatsApp().length > 0;

export const urlWhatsApp = () => {
  const numero = numeroWhatsApp();
  return numero ? `https://wa.me/${numero}` : null;
};
