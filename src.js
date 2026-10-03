/* APC — mémorise la source de la visite (QR code, lien de campagne).
   La page d'arrivée reçoit ?src=... (ex. ?src=courrier1) ; on le range
   dans sessionStorage pour tout l'onglet. Le formulaire de demande le
   relit et l'ajoute à l'origine du dossier. Défensif : jamais d'erreur
   visible, première source conservée, valeur assainie. */
(function () {
  "use strict";
  try {
    var src = new URLSearchParams(window.location.search).get("src");
    if (!src) return;
    src = src.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40);
    if (src && !sessionStorage.getItem("apc_src")) {
      sessionStorage.setItem("apc_src", src);
    }
  } catch (e) { /* navigation privée, stockage bloqué : on ignore */ }
})();
