/* APC — mémorise la source de la visite (QR code, lien de campagne).
   La page d'arrivée reçoit ?src=... (ex. ?src=courrier1) ; on le range
   dans sessionStorage pour tout l'onglet. Le formulaire de demande le
   relit et l'ajoute à l'origine du dossier. Défensif : jamais d'erreur
   visible, première source conservée, valeur assainie.
   27/11/2026 : sur l'accueil seulement, bandeau « Syndic bénévole ?
   Essayez APC 1 mois, 100 % gratuit » vers /gratuit/ (la source de la
   visite suit par sessionStorage). */
(function () {
  "use strict";
  try {
    var src = new URLSearchParams(window.location.search).get("src");
    if (src) {
      src = src.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40);
      if (src && !sessionStorage.getItem("apc_src")) {
        sessionStorage.setItem("apc_src", src);
      }
    }
  } catch (e) { /* navigation privée, stockage bloqué : on ignore */ }

  function bandeau() {
    try {
      var p = window.location.pathname;
      if (p !== "/" && p !== "/index.html") return;
      if (document.getElementById("bandeau-mois-gratuit")) return;
      var a = document.createElement("a");
      a.id = "bandeau-mois-gratuit";
      a.href = "/gratuit/";
      a.setAttribute("style", "display:block;background:var(--terra,#d96b41);color:#fff;text-align:center;font-weight:700;font-size:1rem;line-height:1.35;padding:10px 16px;text-decoration:none");
      a.innerHTML = "Syndic bénévole ? Essayez APC 1&nbsp;mois, 100&nbsp;%&nbsp;gratuit, sur votre copropriété <span aria-hidden=\"true\">→</span>";
      a.addEventListener("click", function () {
        try { if (typeof window.apcVisite === "function") window.apcVisite("clic_bandeau_mois_gratuit"); } catch (e) {}
      });
      document.body.insertBefore(a, document.body.firstChild);
    } catch (e) { /* jamais d'erreur visible */ }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bandeau);
  } else {
    bandeau();
  }
})();
