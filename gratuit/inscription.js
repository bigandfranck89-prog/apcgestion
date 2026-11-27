/* APC — inscription au mois gratuit (apcgestion.fr/gratuit).
   Écrit par APC — Le programme le 26/11/2026 (tâche 6957, brique H).
   La page appelle window.apcInscrireMoisGratuit(v) à l'envoi du formulaire.
   v : nom, email, telephone, copro_nom, copro_adresse, code_postal, ville,
       nb_lots, accepte, src (source de la visite, déjà assainie par la page).
   La fonction de la base (f_essai_inscrire) refait tous les contrôles, enregistre
   la version des conditions acceptées et son empreinte, et dit en clair ce qui manque.
   Rend une promesse { ok, texte } : texte est la phrase à montrer au visiteur.
   Une coupure du réseau rejette la promesse (la page dit alors « la connexion
   n'a pas abouti »). */
(function () {
  "use strict";
  var API = "https://bmvytqfddrfgcgokoxfn.supabase.co";
  var CLE = "sb_publishable_tGwuRROW7-AjWdE8K8ZbFA_R8_V2LUU";   // même clé publique que les autres pages du site
  var VERSION = "essai-v2";                                      // version des conditions affichées sur la page

  var MOTIFS = {
    nom: "Écrivez votre prénom et votre nom.",
    email: "Cette adresse mail ne semble pas valide : c'est là que vous recevrez le premier message.",
    copropriete: "Écrivez le nom de la copropriété.",
    adresse: "Écrivez l'adresse de l'immeuble.",
    code_postal: "Le code postal doit avoir 5 chiffres.",
    nb_lots: "Indiquez le nombre de lots principaux (de 1 à 500).",
    telephone: "Ce numéro ne semble pas valide (le téléphone est facultatif).",
    conditions_non_acceptees: "Cochez la case pour accepter les conditions du mois gratuit.",
    conditions_inconnues: "Les inscriptions ne sont pas encore ouvertes. Réessayez dans quelques jours, ou appelez Franck au 06 30 52 99 86.",
    limite_adresse: "Plusieurs inscriptions viennent déjà de cette adresse aujourd'hui. Réessayez demain.",
    limite_poste: "Plusieurs inscriptions viennent déjà de ce poste aujourd'hui. Réessayez demain.",
    limite_jour: "Trop d'inscriptions aujourd'hui. Réessayez demain."
  };
  var ECHEC = "L'inscription n'a pas abouti. Réessayez dans un instant, ou appelez Franck au 06 30 52 99 86.";

  function source(v) {
    var s = (v && v.src) || "";
    if (!s) {
      try { s = new URLSearchParams(location.search).get("src") || sessionStorage.getItem("apc_src") || ""; } catch (e) { s = ""; }
    }
    s = String(s).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 60);
    return s || "site";
  }

  function inscrire(v) {
    var lots = parseInt(v && v.nb_lots, 10);
    return fetch(API + "/rest/v1/rpc/f_essai_inscrire", {
      method: "POST",
      headers: { "apikey": CLE, "Authorization": "Bearer " + CLE, "Content-Type": "application/json" },
      body: JSON.stringify({
        p_nom: v.nom, p_email: v.email, p_telephone: v.telephone || null,
        p_copro_nom: v.copro_nom, p_copro_adresse: v.copro_adresse,
        p_code_postal: v.code_postal, p_ville: v.ville,
        p_nb_lots: isNaN(lots) ? null : lots, p_accepte: !!v.accepte,
        p_version: VERSION, p_source: source(v), p_ip: null
      })
    }).then(function (r) {
      if (!r.ok) return { ok: false, texte: ECHEC };
      return r.json().then(function (j) {
        if (j && j.ok) {
          return { ok: true, texte: "C'est noté (inscription n° " + j.reference + "). Vous recevez un message d'APC au plus tard sous 48 heures ouvrées "
            + "(pensez à regarder dans vos courriers indésirables) : répondez-y en joignant le procès-verbal de l'assemblée qui vous a désigné syndic." };
        }
        return { ok: false, texte: MOTIFS[j && j.motif] || ECHEC };
      }, function () { return { ok: false, texte: ECHEC }; });
    });
  }

  window.apcInscrireMoisGratuit = inscrire;
})();
