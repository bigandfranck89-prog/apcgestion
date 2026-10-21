/* APC — compteur de visites SANS COOKIE (mesure d'audience exemptée CNIL).
   Aucun cookie, aucun stockage durable, aucune adresse IP enregistrée :
   seulement la page, l'origine de la visite (moteur, pub, lettre, lien),
   le type d'appareil et un numéro de session aléatoire gardé le temps de
   l'onglet (sessionStorage). Défensif : ne casse jamais la page.
   Usage complémentaire : window.apcVisite("demande") après un envoi réussi. */
(function () {
  "use strict";
  var API = "https://bmvytqfddrfgcgokoxfn.supabase.co";
  var CLE = "sb_publishable_tGwuRROW7-AjWdE8K8ZbFA_R8_V2LUU";

  function session() {
    var s = "";
    try { s = sessionStorage.getItem("apc_visite") || ""; } catch (e) {}
    if (!s) {
      try {
        var a = new Uint8Array(12);
        (window.crypto || window.msCrypto).getRandomValues(a);
        for (var i = 0; i < a.length; i++) s += ("0" + a[i].toString(16)).slice(-2);
      } catch (e) { s = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); }
      try { sessionStorage.setItem("apc_visite", s); } catch (e) {}
    }
    return s;
  }

  function lire(nom) {
    var cle = "apc_v_" + nom, v = null;
    try { v = new URLSearchParams(window.location.search).get(nom); } catch (e) {}
    try {
      if (v) { if (!sessionStorage.getItem(cle)) sessionStorage.setItem(cle, v); }
      else { v = sessionStorage.getItem(cle); }
    } catch (e) {}
    return v || null;
  }

  function referent() {
    var d = "";
    try { d = document.referrer ? new URL(document.referrer).hostname : ""; } catch (e) {}
    try {
      if (d && d !== window.location.hostname) {
        if (!sessionStorage.getItem("apc_v_ref")) sessionStorage.setItem("apc_v_ref", d);
      } else {
        d = sessionStorage.getItem("apc_v_ref") || "";
      }
    } catch (e) {}
    return d || null;
  }

  function noter(evenement) {
    try {
      if (navigator.webdriver) return;
      if (/bot|crawl|spider|slurp|headless|lighthouse|preview/i.test(navigator.userAgent || "")) return;
      var src = lire("src");
      try { src = src || sessionStorage.getItem("apc_src"); } catch (e) {}
      var corps = {
        p_page: window.location.pathname || "/",
        p_referent: referent(),
        p_src: src,
        p_utm_source: lire("utm_source"),
        p_utm_medium: lire("utm_medium"),
        p_campagne: lire("utm_campaign"),
        p_gclid: !!lire("gclid"),
        p_appareil: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || "") ? "mobile" : "ordinateur",
        p_session: session(),
        p_evenement: evenement === "demande" ? "demande" : "vue"
      };
      fetch(API + "/rest/v1/rpc/f_visite_noter", {
        method: "POST",
        keepalive: true,
        headers: { "apikey": CLE, "Authorization": "Bearer " + CLE, "Content-Type": "application/json" },
        body: JSON.stringify(corps)
      }).catch(function () {});
    } catch (e) { /* jamais d'erreur visible */ }
  }

  window.apcVisite = noter;
  noter("vue");
})();
