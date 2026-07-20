// M-CHQ Document Generator — Times New Roman, A4, professional banking style
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, LevelFormat
} = require('docx');
const fs = require('fs');

// === CONSTANTS ===
const BLUE_DARK  = "1F3864";
const BLUE_MED   = "2E75B6";
const BLUE_LIGHT = "D9E2F3";
const WHITE      = "FFFFFF";
const RED        = "C00000";
const FONT       = "Times New Roman";

// === HELPERS ===
const sp = (b,a,l=276) => ({ before:b, after:a, line:l });
const run = (text, opts={}) => new TextRun({ text, font: FONT, size:24, ...opts });

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, pageBreakBefore: true,
    spacing: sp(480,240),
    children: [new TextRun({ text, font: FONT, size:32, bold:true, color: BLUE_DARK })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: sp(360,180),
    children: [new TextRun({ text, font: FONT, size:28, bold:true, color: BLUE_DARK })]
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: sp(240,120),
    children: [new TextRun({ text, font: FONT, size:26, bold:true, color: BLUE_MED })]
  });
}
function body(text) {
  return new Paragraph({ spacing: sp(60,60), children: [run(text)] });
}
function note(label, text) {
  return new Paragraph({
    spacing: sp(60,60),
    children: [
      new TextRun({ text: label+" : ", font: FONT, size:24, bold:true, color: RED }),
      new TextRun({ text, font: FONT, size:24, color: RED })
    ]
  });
}
function bul(text, lvl=0) {
  return new Paragraph({
    numbering:{ reference:"bullets", level:lvl },
    spacing: sp(40,40),
    children: [run(text)]
  });
}
function num(text) {
  return new Paragraph({
    numbering:{ reference:"numbers", level:0 },
    spacing: sp(40,40),
    children: [run(text)]
  });
}
function empty() { return new Paragraph({ spacing: sp(60,60), children:[run("")] }); }

// Border helpers
const thinBorder = { style: BorderStyle.SINGLE, size:4, color:"CCCCCC" };
const blueBorder = { style: BorderStyle.SINGLE, size:4, color: BLUE_MED };
const cellBorders = { top:thinBorder, bottom:thinBorder, left:thinBorder, right:thinBorder };
const hdrBorders  = { top:blueBorder, bottom:blueBorder, left:blueBorder, right:blueBorder };

function tbl(headers, rows, colWidths) {
  const total = colWidths.reduce((a,b)=>a+b,0);
  const hRow = new TableRow({ tableHeader:true, children: headers.map((h,i) =>
    new TableCell({
      borders: hdrBorders,
      width:{ size:colWidths[i], type:WidthType.DXA },
      shading:{ fill: BLUE_DARK, type: ShadingType.CLEAR },
      margins:{ top:100, bottom:100, left:150, right:150 },
      verticalAlign: VerticalAlign.CENTER,
      children:[new Paragraph({ children:[new TextRun({text:h, font:FONT, size:21, bold:true, color:WHITE})] })]
    })
  )});
  const dRows = rows.map(row => new TableRow({ children: row.map((cell,i) =>
    new TableCell({
      borders: cellBorders,
      width:{ size:colWidths[i], type:WidthType.DXA },
      margins:{ top:80, bottom:80, left:150, right:150 },
      children:[new Paragraph({ spacing:{ line:264 }, children:[new TextRun({text:cell, font:FONT, size:21})] })]
    })
  )}));
  return new Table({ width:{ size:total, type:WidthType.DXA }, columnWidths:colWidths, rows:[hRow,...dRows] });
}

// ===================================================================
// CONTENT
// ===================================================================
const C = []; // children array

// ---- SECTION V TITLE (no page break — first element) ----
C.push(new Paragraph({
  spacing: sp(0,480),
  children:[new TextRun({text:"V. Détail des Fonctionnalités", font:FONT, size:40, bold:true, color:BLUE_DARK})]
}));

// ============================================================
// FONCTIONNALITÉ 1
// ============================================================
C.push(h1("Fonctionnalité 1 : Accès et Navigation"));

// F1.1
C.push(h2("F1.1 : Affichage du menu « Chéquier »"));
C.push(h3("1. Définition et Objectif"));
C.push(body("Cette fonctionnalité permet au client authentifié sur la plateforme Internet Banking d'accéder à l'espace dédié à la gestion de ses demandes de chéquier. Un nouveau menu « Chéquier » est ajouté à la barre de navigation principale, organisé en deux sous-menus distincts : « Mes Demandes » pour consulter l'historique et le suivi des demandes existantes, et « Nouvelle Demande » pour initier une nouvelle demande. L'objectif est d'offrir un point d'entrée unique, clair et intuitif, accessible depuis tout appareil (web ou mobile), sans nécessiter de déplacement en agence."));
C.push(h3("2. Variantes"));
C.push(bul("Accès depuis un navigateur web (desktop)"));
C.push(bul("Accès depuis l'application mobile Internet Banking"));
C.push(bul("Client sans aucun compte éligible (affichage du menu mais accès restreint)"));
C.push(h3("3. Entrées"));
C.push(bul("Session client active et authentifiée (login + mot de passe validés)"));
C.push(h3("4. Sorties"));
C.push(bul("Affichage du menu « Chéquier » dans la barre de navigation principale"));
C.push(bul("Sous-menu « Mes Demandes » : redirige vers la liste des demandes du client"));
C.push(bul("Sous-menu « Nouvelle Demande » : redirige vers le formulaire de soumission"));
C.push(h3("5. Préconditions"));
C.push(bul("Client authentifié avec une session valide et non expirée sur la plateforme Internet Banking"));
C.push(h3("6. Postconditions"));
C.push(bul("Le client visualise les deux sous-menus disponibles"));
C.push(bul("La navigation est journalisée (identifiant client, horodatage, action)"));
C.push(h3("7. Processus"));
C.push(num("Le client se connecte à la plateforme Internet Banking AFBSS avec ses identifiants."));
C.push(num("Le système valide la session et affiche le tableau de bord principal."));
C.push(num("Le client repère et clique sur le menu « Chéquier » dans la barre de navigation."));
C.push(num("Le système affiche les deux sous-menus : « Mes Demandes » et « Nouvelle Demande »."));
C.push(num("Le client sélectionne l'action souhaitée."));
C.push(num("Le système journalise l'accès avec l'identifiant client et l'horodatage."));
C.push(h3("8. Scénarios Alternatifs et Cas d'Erreur"));
C.push(bul("Session expirée → Le système redirige automatiquement vers la page de connexion avec le message : « Votre session a expiré. Veuillez vous reconnecter pour continuer. »"));
C.push(bul("Client sans compte éligible → Le sous-menu « Nouvelle Demande » est visible mais affiche à l'ouverture : « Aucun de vos comptes n'est éligible à une demande de chéquier en ligne. Veuillez contacter votre agence. »"));
C.push(empty());

// F1.2
C.push(h2("F1.2 : Consultation de l'historique des demandes (« Mes Demandes »)"));
C.push(h3("1. Définition et Objectif"));
C.push(body("Cette fonctionnalité permet au client de consulter l'ensemble de ses demandes de chéquier passées et en cours, avec leur statut actualisé en temps réel. Elle offre une visibilité complète et transparente sur l'avancement de chaque demande, sans avoir à contacter l'agence. Le client peut également consulter le détail d'une demande spécifique (compte débité, frais appliqués, agence de livraison, historique des transitions de statut)."));
C.push(h3("2. Variantes"));
C.push(bul("Client ayant plusieurs demandes en cours simultanément"));
C.push(bul("Client consultant une demande clôturée (statut « Livré »)"));
C.push(bul("Client consultant une demande échouée (statut « Échoué »)"));
C.push(h3("3. Entrées"));
C.push(bul("Identifiant client (extrait de la session active)"));
C.push(h3("4. Sorties"));
C.push(body("Liste des demandes triées par date de soumission décroissante, affichant pour chaque demande :"));
C.push(bul("Numéro de référence unique",1)); C.push(bul("Date et heure de soumission",1));
C.push(bul("Numéro de compte débité",1)); C.push(bul("Devise et nombre de feuillets demandés",1));
C.push(bul("Agence de livraison sélectionnée",1));
C.push(bul("Statut actuel (avec badge coloré) et date du dernier changement de statut",1));
C.push(body("Vue détaillée accessible par clic sur une demande, incluant :"));
C.push(bul("Détail des frais appliqués (commission + taxes)",1));
C.push(bul("Historique complet des transitions de statut avec horodatage",1));
C.push(h3("5. Préconditions"));
C.push(bul("Client authentifié avec une session valide")); C.push(bul("Base de données Internet Banking accessible"));
C.push(h3("6. Postconditions"));
C.push(bul("Le client visualise ses demandes avec les statuts actualisés en temps réel"));
C.push(bul("Aucune modification des données n'est possible depuis cet écran"));
C.push(h3("7. Processus"));
C.push(num("Le client sélectionne « Mes Demandes » dans le menu « Chéquier »."));
C.push(num("Le système interroge la base de données et récupère toutes les demandes associées à l'identifiant client."));
C.push(num("La liste est affichée avec les statuts actualisés, triée par date décroissante."));
C.push(num("Le client peut cliquer sur une demande pour en afficher le détail complet."));
C.push(num("Le système affiche le détail : informations de la demande, frais, historique des transitions."));
C.push(h3("8. Scénarios Alternatifs et Cas d'Erreur"));
C.push(bul("Aucune demande existante → Affichage du message : « Vous n'avez pas encore effectué de demande de chéquier en ligne. Cliquez sur \"Nouvelle Demande\" pour commencer. »"));
C.push(bul("Indisponibilité temporaire de la base de données → Message : « Impossible de charger vos demandes pour le moment. Veuillez réessayer dans quelques instants. »"));

// ============================================================
// FONCTIONNALITÉ 2
// ============================================================
C.push(h1("Fonctionnalité 2 : Soumission de la Demande"));

// F2.1
C.push(h2("F2.1 : Saisie du formulaire de demande"));
C.push(h3("1. Définition et Objectif"));
C.push(body("Cette fonctionnalité permet au client de renseigner les informations nécessaires à sa demande de chéquier via un formulaire structuré, guidé et sécurisé. Elle garantit que seuls les comptes éligibles sont proposés à la sélection, que la devise est automatiquement renseignée selon le compte choisi, et que toutes les données obligatoires sont présentes et cohérentes avant de procéder à l'étape de confirmation. Le formulaire est conçu pour être complété en moins de 2 minutes, avec un minimum de saisie manuelle."));
C.push(h3("2. Variantes"));
C.push(bul("Client possédant un seul compte éligible (pré-sélection automatique du compte)"));
C.push(bul("Client possédant plusieurs comptes éligibles (sélection manuelle dans la liste déroulante)"));
C.push(bul("Client choisissant une agence de livraison différente de son agence de domiciliation"));
C.push(bul("Client choisissant son agence de domiciliation comme agence de livraison"));
C.push(h3("3. Entrées"));
C.push(bul("Sélection du compte à débiter (liste déroulante des comptes éligibles du client, récupérée via le Core Banking)"));
C.push(bul("Devise (champ auto-renseigné et non modifiable, déterminée par le compte sélectionné)"));
C.push(bul("Nombre de feuillets : 25 ou 50 (sélection via boutons radio, valeur par défaut : 25)"));
C.push(bul("Agence de livraison (liste déroulante de toutes les agences AFBSS actives, issue du référentiel agences)"));
C.push(h3("4. Sorties"));
C.push(bul("Formulaire validé avec toutes les données obligatoires renseignées"));
C.push(bul("Données temporairement stockées en session (aucune écriture en base à ce stade)"));
C.push(bul("Calcul des frais déclenché automatiquement (F2.2)"));
C.push(bul("Redirection vers l'écran de confirmation (F2.3)"));
C.push(h3("5. Préconditions"));
C.push(bul("Client authentifié avec au moins un compte actif, non bloqué et disposant de l'autorisation chéquier dans le Core Banking (BR-01)"));
C.push(bul("Référentiel des agences AFBSS disponible et à jour"));
C.push(bul("Barème de frais disponible dans le Core Banking"));
C.push(h3("6. Postconditions"));
C.push(bul("Les données du formulaire sont stockées en session de manière sécurisée"));
C.push(bul("Aucune opération comptable ni écriture en base de données à ce stade"));
C.push(bul("Un jeton de session unique (token d'idempotence) est généré pour cette instance de formulaire (BR-10)"));
C.push(h3("7. Processus"));
C.push(num("Le client accède au formulaire via le sous-menu « Nouvelle Demande »."));
C.push(num("Le système appelle le Core Banking pour récupérer la liste des comptes éligibles du client."));
C.push(num("Si un seul compte éligible : il est pré-sélectionné automatiquement. Si plusieurs : liste déroulante affichée."));
C.push(num("Dès la sélection du compte, le système auto-renseigne la devise correspondante (non modifiable)."));
C.push(num("Le client choisit le nombre de feuillets (25 ou 50)."));
C.push(num("Le client sélectionne l'agence de livraison souhaitée dans la liste déroulante."));
C.push(num("Le système calcule automatiquement les frais en arrière-plan (F2.2)."));
C.push(num("Le client clique sur « Continuer »."));
C.push(num("Le système vérifie que tous les champs obligatoires sont renseignés."));
C.push(num("Si validation OK : redirection vers l'écran de confirmation (F2.3)."));
C.push(num("Le système génère et associe un jeton d'idempotence unique à cette session de formulaire."));
C.push(h3("8. Scénarios Alternatifs et Cas d'Erreur"));
C.push(bul("Aucun compte éligible → Le formulaire n'est pas affiché. Message : « Aucun de vos comptes n'est éligible à une demande de chéquier en ligne. »"));
C.push(bul("Champ obligatoire manquant → Mise en évidence visuelle du champ avec un message d'erreur inline explicite."));
C.push(bul("Indisponibilité du référentiel agences → Message : « Impossible de charger la liste des agences. Veuillez réessayer. »"));
C.push(bul("Indisponibilité du Core Banking → Message : « Service temporairement indisponible. Veuillez réessayer. »"));
C.push(empty());

// F2.2
C.push(h2("F2.2 : Calcul et affichage automatique des frais"));
C.push(h3("1. Définition et Objectif"));
C.push(body("Cette sous-fonctionnalité assure le calcul automatique, transparent et en temps réel des frais applicables à la demande de chéquier (commission bancaire + taxes réglementaires), sur la base du barème configuré dans le Core Banking ALTBank. Les frais sont calculés dès que le compte et le nombre de feuillets sont sélectionnés dans le formulaire, et affichés de manière détaillée sur l'écran de confirmation avant toute validation."));
C.push(h3("2. Variantes"));
C.push(bul("Calcul pour un chéquier de 25 feuillets"));
C.push(bul("Calcul pour un chéquier de 50 feuillets"));
C.push(bul("Barème différencié selon la devise du compte (SSP, USD, etc.)"));
C.push(h3("3. Entrées"));
C.push(bul("Identifiant du compte sélectionné (pour déterminer la devise et l'agence de domiciliation)"));
C.push(bul("Nombre de feuillets choisi (25 ou 50)"));
C.push(h3("4. Sorties"));
C.push(bul("Montant de la commission bancaire (en devise du compte)"));
C.push(bul("Montant des taxes applicables (en devise du compte)"));
C.push(bul("Montant total des frais = Commission + Taxes (affiché sur l'écran de confirmation)"));
C.push(h3("5. Préconditions"));
C.push(bul("Barème de frais disponible, actif et à jour dans le Core Banking ALTBank"));
C.push(bul("Compte sélectionné valide avec devise identifiée"));
C.push(h3("6. Postconditions"));
C.push(bul("Les frais calculés sont transmis et affichés sur l'écran de confirmation (F2.3)"));
C.push(bul("Le montant total est conservé en session pour être utilisé lors de l'exécution de la transaction (F4.1)"));
C.push(h3("7. Processus"));
C.push(num("Dès que le client sélectionne un compte et un nombre de feuillets, le système interroge le Core Banking pour récupérer le barème applicable."));
C.push(num("Le système calcule : Frais totaux = Commission + Taxes."));
C.push(num("Les trois montants (commission, taxes, total) sont conservés en session."));
C.push(num("Ils sont affichés de manière détaillée et lisible sur l'écran de confirmation (F2.3)."));
C.push(h3("8. Scénarios Alternatifs et Cas d'Erreur"));
C.push(bul("Barème non disponible (Core Banking indisponible) → Blocage de la progression avec le message : « Impossible de calculer les frais pour le moment. Veuillez réessayer ultérieurement. »"));
C.push(bul("Barème renvoyé incohérent → Alerte technique journalisée + blocage + message client : « Une erreur est survenue lors du calcul des frais. Veuillez contacter votre agence. »"));
C.push(empty());

// F2.3
C.push(h2("F2.3 : Écran de confirmation récapitulatif"));
C.push(h3("1. Définition et Objectif"));
C.push(body("Avant toute action irréversible (envoi OTP, débit du compte), cet écran présente au client un récapitulatif complet et lisible de sa demande, incluant toutes les informations saisies et les frais calculés. Il constitue la dernière opportunité pour le client de vérifier, corriger ou annuler sa demande avant engagement, conformément aux exigences de consentement éclairé (BR-06)."));
C.push(h3("2. Variantes"));
C.push(bul("Client confirmant sa demande → déclenchement de l'OTP (F3.1)"));
C.push(bul("Client souhaitant modifier ses informations → retour au formulaire (F2.1)"));
C.push(bul("Client annulant sa demande → retour au tableau de bord"));
C.push(h3("3. Entrées"));
C.push(bul("Données saisies dans le formulaire (F2.1) : compte, devise, nombre de feuillets, agence de livraison"));
C.push(bul("Frais calculés (F2.2) : commission, taxes, total"));
C.push(h3("4. Sorties"));
C.push(body("Écran récapitulatif affichant :"));
C.push(bul("Numéro et libellé du compte à débiter",1)); C.push(bul("Solde disponible actuel du compte",1));
C.push(bul("Devise et nombre de feuillets demandé",1));
C.push(bul("Agence de livraison sélectionnée (nom et adresse)",1));
C.push(bul("Détail des frais : commission, taxes, total à débiter",1));
C.push(bul("Mention explicite : « Ce montant sera immédiatement débité de votre compte lors de la validation. »",1));
C.push(bul("Bouton « Confirmer et recevoir mon code OTP »",1));
C.push(bul("Bouton « Modifier » (retour au formulaire)",1));
C.push(bul("Bouton « Annuler » (retour au tableau de bord, sans aucune action)",1));
C.push(h3("5. Préconditions"));
C.push(bul("Formulaire correctement renseigné et validé (F2.1)")); C.push(bul("Frais calculés avec succès (F2.2)"));
C.push(h3("6. Postconditions"));
C.push(bul("Si le client clique sur « Confirmer » : déclenchement de l'envoi OTP (F3.1)"));
C.push(bul("Si le client clique sur « Modifier » : retour au formulaire avec les données pré-remplies"));
C.push(bul("Si le client clique sur « Annuler » : invalidation du jeton de session, retour au tableau de bord"));
C.push(h3("7. Processus"));
C.push(num("Le système affiche l'écran récapitulatif avec toutes les informations de la demande et les frais calculés."));
C.push(num("Le client prend connaissance du résumé et des frais qui seront débités."));
C.push(num("Le client clique sur « Confirmer et recevoir mon code OTP » pour procéder à la validation."));
C.push(num("Le système déclenche la génération et l'envoi de l'OTP (F3.1)."));

// ============================================================
// FONCTIONNALITÉ 3
// ============================================================
C.push(h1("Fonctionnalité 3 : Validation et Sécurisation"));

// F3.1
C.push(h2("F3.1 : Génération et envoi de l'OTP"));
C.push(h3("1. Définition et Objectif"));
C.push(body("Cette fonctionnalité assure la sécurisation transactionnelle de la demande de chéquier en générant et en envoyant un code OTP (One-Time Password) à usage unique au client, via son canal de communication préféré (SMS en priorité, email en secondaire). L'OTP constitue le second facteur d'authentification transactionnelle obligatoire pour toute soumission de demande, conformément aux exigences de sécurité bancaire (BR-06)."));
C.push(h3("2. Variantes"));
C.push(bul("Envoi par SMS (canal prioritaire)"));
C.push(bul("Envoi par email (canal secondaire si SMS indisponible ou selon préférence client)"));
C.push(bul("Renvoi d'un nouvel OTP à la demande du client (en cas d'expiration)"));
C.push(h3("3. Entrées"));
C.push(bul("Confirmation de l'écran récapitulatif par le client (clic sur « Confirmer »)"));
C.push(bul("Numéro de téléphone mobile et/ou adresse email du client (issus du profil client)"));
C.push(bul("Canal de communication préféré du client"));
C.push(h3("4. Sorties"));
C.push(bul("OTP généré : code numérique à 6 chiffres, usage unique, validité de 5 minutes"));
C.push(bul("Message envoyé au client contenant : le code OTP, le rappel du montant à débiter, la durée de validité"));
C.push(bul("Écran de saisie OTP affiché avec un compteur de temps visible (décompte en temps réel)"));
C.push(bul("Lien « Renvoyer un code » disponible après expiration"));
C.push(h3("5. Préconditions"));
C.push(bul("Récapitulatif confirmé par le client"));
C.push(bul("Coordonnées de contact valides et disponibles dans le profil client"));
C.push(bul("Passerelle SMS et/ou service email opérationnels"));
C.push(h3("6. Postconditions"));
C.push(bul("L'OTP est généré, hashé et stocké temporairement côté serveur avec son horodatage de création"));
C.push(bul("Le compteur de tentatives est initialisé à 0"));
C.push(bul("Le chronomètre de validité (5 minutes) est démarré"));
C.push(bul("L'événement est journalisé (génération OTP, canal utilisé, horodatage)"));
C.push(h3("7. Processus"));
C.push(num("Le client clique sur « Confirmer et recevoir mon code OTP » sur l'écran récapitulatif."));
C.push(num("Le système génère un code OTP aléatoire à 6 chiffres."));
C.push(num("Le code est hashé et stocké temporairement en session serveur avec l'horodatage de génération."));
C.push(num("Le système envoie le message via le canal prioritaire du client (SMS)."));
C.push(num("En cas d'échec d'envoi SMS, tentative automatique par email, avec journalisation de l'incident."));
C.push(num("L'écran de saisie OTP est affiché avec un compteur de décompte visible."));
C.push(num("L'événement (génération, canal, horodatage) est journalisé dans le journal d'audit."));
C.push(h3("8. Scénarios Alternatifs et Cas d'Erreur"));
C.push(bul("Échec d'envoi SMS → Tentative automatique par email + journalisation + message au client : « Votre code vous a été envoyé par email. »"));
C.push(bul("Coordonnées absentes ou invalides → Message : « Impossible d'envoyer le code de validation. Vos coordonnées de contact sont manquantes. Veuillez contacter votre agence. »"));
C.push(bul("OTP expiré → Affichage du lien « Renvoyer un code » + message : « Votre code a expiré. Cliquez sur "Renvoyer un code" pour en recevoir un nouveau. »"));
C.push(empty());

// F3.2
C.push(h2("F3.2 : Vérification de l'OTP et autorisation de la transaction"));
C.push(h3("1. Définition et Objectif"));
C.push(body("Cette fonctionnalité vérifie la validité du code OTP saisi par le client, contrôle son intégrité (concordance, non-expiration, nombre de tentatives) et autorise ou bloque le passage à l'étape d'exécution Core Banking. Elle intègre un mécanisme de protection contre les attaques par force brute via un compteur de tentatives limité à 3."));
C.push(h3("2. Variantes"));
C.push(bul("OTP correct à la première tentative"));
C.push(bul("OTP incorrect avec tentatives restantes"));
C.push(bul("OTP expiré (délai de 5 minutes dépassé)"));
C.push(bul("Tentatives épuisées (3 échecs consécutifs)"));
C.push(h3("3. Entrées"));
C.push(bul("Code OTP saisi par le client (6 chiffres)"));
C.push(bul("Référence de la session de demande en cours (jeton de session)"));
C.push(bul("Horodatage de génération de l'OTP (pour contrôle d'expiration)"));
C.push(bul("Compteur de tentatives actuel"));
C.push(h3("4. Sorties"));
C.push(bul("OTP valide et non expiré : déclenchement de F4.1 (appel Core Banking et exécution atomique)"));
C.push(bul("OTP invalide avec tentatives restantes : message d'erreur + décrémentation du compteur"));
C.push(bul("OTP expiré : annulation de la saisie + proposition de renvoi"));
C.push(bul("Tentatives épuisées (3 échecs) : invalidation définitive de la session de demande"));
C.push(h3("5. Préconditions"));
C.push(bul("OTP généré et en cours de validité (moins de 5 minutes depuis la génération)"));
C.push(bul("Session de demande active et non invalidée"));
C.push(h3("6. Postconditions"));
C.push(bul("Si OTP valide : processus d'exécution Core Banking déclenché (F4.1)"));
C.push(bul("Si échec définitif : session invalidée, jeton d'idempotence détruit, client invité à recommencer"));
C.push(h3("7. Règles de Gestion"));
C.push(bul("Maximum 3 tentatives de saisie par OTP généré"));
C.push(bul("Expiration automatique de l'OTP après 5 minutes"));
C.push(bul("Après 3 échecs consécutifs : blocage définitif avec le message : « Trop de tentatives incorrectes. Votre demande a été annulée pour des raisons de sécurité. Veuillez recommencer votre demande. »"));
C.push(bul("Tous les échecs de saisie sont journalisés avec identifiant client, horodatage et nombre de tentatives"));
C.push(h3("8. Processus"));
C.push(num("Le client saisit le code OTP reçu sur l'écran de validation."));
C.push(num("Le système compare le hash du code saisi avec le hash stocké en session."));
C.push(num("Le système vérifie que le délai de validité (5 minutes) n'est pas dépassé."));
C.push(num("Si le code est correct et non expiré : le système valide l'OTP et déclenche F4.1."));
C.push(num("Si le code est incorrect : le compteur de tentatives est incrémenté. Si tentatives < 3 : message d'erreur. Si tentatives = 3 : invalidation de la session."));
C.push(num("Toute tentative (réussie ou non) est journalisée."));
C.push(h3("9. Scénarios Alternatifs et Cas d'Erreur"));
C.push(bul("OTP expiré → Message : « Votre code de validation a expiré. » + Bouton « Recevoir un nouveau code »."));
C.push(bul("OTP incorrect (1re ou 2e tentative) → Message : « Code incorrect. Il vous reste X tentative(s). »"));
C.push(bul("3 échecs consécutifs → Message : « Trop de tentatives incorrectes. Votre demande a été annulée. Veuillez recommencer. »"));

// ============================================================
// FONCTIONNALITÉ 4
// ============================================================
C.push(h1("Fonctionnalité 4 : Exécution et Création de la Demande"));

// F4.1
C.push(h2("F4.1 : Appel au Core Banking et exécution de la transaction atomique"));
C.push(h3("1. Définition et Objectif"));
C.push(body("C'est la fonctionnalité centrale et critique du module M-CHQ. Suite à la validation réussie de l'OTP, l'Internet Banking déclenche une transaction atomique dans le Core Banking ALTBank, comprenant simultanément et indivisiblement : le débit du compte client du montant total des frais (commission + taxes), et le crédit des comptes de commission et de taxes de l'agence de domiciliation du compte (Home Branch). Si l'une des deux opérations ne peut pas être exécutée, l'ensemble de la transaction est annulé sans aucun effet partiel (principe du tout ou rien - BR-02)."));
C.push(empty());
C.push(note("Règle critique (BR-04)", "Les comptes crédités (commission et taxes) sont obligatoirement ceux de l'agence de domiciliation du compte débité (Home Branch), quelle que soit l'agence de livraison choisie par le client. Cette règle est non négociable et doit être strictement contrôlée en tests de recette."));
C.push(h3("2. Variantes"));
C.push(bul("Transaction exécutée avec succès (solde suffisant, Core Banking disponible)"));
C.push(bul("Transaction refusée pour solde insuffisant"));
C.push(bul("Transaction échouée pour indisponibilité ou timeout du Core Banking"));
C.push(bul("Transaction refusée pour compte bloqué ou non éligible"));
C.push(h3("3. Entrées"));
C.push(bul("Identifiant du compte client à débiter"));
C.push(bul("Montant total des frais calculés et validés (commission + taxes)"));
C.push(bul("Identifiant de l'agence de domiciliation du compte (Home Branch) — pour le crédit comptable"));
C.push(bul("Jeton d'idempotence de session (pour éviter la double exécution)"));
C.push(bul("Référence de la demande (générée en session)"));
C.push(h3("4. Sorties"));
C.push(bul("Succès : accusé de transaction du Core Banking contenant le numéro de référence, la date et l'heure d'exécution, la confirmation du débit et du crédit effectués"));
C.push(bul("Échec solde insuffisant : code erreur INSUFFICIENT_FUNDS + motif explicite"));
C.push(bul("Échec technique : code erreur CORE_BANKING_UNAVAILABLE ou TIMEOUT + motif"));
C.push(bul("Échec compte : code erreur ACCOUNT_BLOCKED ou ACCOUNT_NOT_ELIGIBLE + motif"));
C.push(h3("5. Préconditions"));
C.push(bul("OTP validé avec succès (F3.2)"));
C.push(bul("Connexion au Core Banking ALTBank disponible et opérationnelle"));
C.push(bul("Jeton d'idempotence valide et non déjà utilisé"));
C.push(h3("6. Postconditions"));
C.push(bul("En cas de succès : débit effectif du compte client + crédit effectif des comptes de commission et taxes de la Home Branch + enregistrement dans la table checkbook_requests du Core Banking"));
C.push(bul("En cas d'échec : aucun débit, aucun crédit, aucun enregistrement partiel dans le Core Banking"));
C.push(bul("Dans tous les cas : journalisation complète de la tentative (paramètres envoyés, réponse reçue, horodatage)"));
C.push(h3("7. Processus"));
C.push(num("L'Internet Banking envoie une requête de transaction sécurisée au Core Banking ALTBank, contenant : l'identifiant du compte à débiter, le montant total des frais, l'identifiant de la Home Branch et le jeton d'idempotence."));
C.push(num("Le Core Banking vérifie l'idempotence (la transaction n'a pas déjà été exécutée avec ce jeton)."));
C.push(num("Le Core Banking vérifie que le compte est actif, non bloqué et dispose d'un solde suffisant."));
C.push(num("Si toutes les vérifications sont positives : exécution atomique (débit + crédit simultanés) en une seule opération indivisible."));
C.push(num("Le Core Banking enregistre la demande dans sa table dédiée (checkbook_requests)."));
C.push(num("Le Core Banking retourne un accusé de succès à l'Internet Banking avec le numéro de référence de la transaction."));
C.push(num("L'Internet Banking reçoit l'accusé de succès et déclenche immédiatement F4.2 (création du ticket IB)."));
C.push(h3("8. Scénarios Alternatifs et Cas d'Erreur"));
C.push(bul("Solde insuffisant → Code INSUFFICIENT_FUNDS. Aucun débit effectué. Message : « Votre solde est insuffisant pour couvrir les frais. Aucun montant n'a été débité. Veuillez alimenter votre compte et réessayer. »"));
C.push(bul("Core Banking indisponible ou timeout → Annulation complète. Message : « Le service bancaire est temporairement indisponible. Votre demande n'a pas été enregistrée et aucun montant n'a été débité. Veuillez réessayer. »"));
C.push(bul("Compte bloqué ou non éligible → Message : « Votre compte ne permet pas d'effectuer cette opération. Veuillez contacter votre agence. »"));
C.push(bul("Jeton d'idempotence déjà utilisé (double soumission) → Rejet silencieux côté serveur + retour au statut de la demande déjà créée si elle existe."));
C.push(empty());

// F4.2
C.push(h2("F4.2 : Création du ticket Internet Banking"));
C.push(h3("1. Définition et Objectif"));
C.push(body("Uniquement et exclusivement après réception d'un accusé de succès formel du Core Banking ALTBank (BR-08), l'Internet Banking procède à la création de son propre enregistrement de la demande (ticket IB). Cette séquence stricte — Core Banking en premier, ticket IB en second — garantit l'invariant fondamental du module : il ne peut jamais exister une demande enregistrée dans l'Internet Banking sans transaction comptable correspondante et confirmée dans ALTBank."));
C.push(h3("2. Entrées"));
C.push(bul("Accusé de succès du Core Banking (numéro de référence de la transaction, horodatage d'exécution)"));
C.push(bul("Données complètes de la demande (compte, devise, nombre de feuillets, agence de livraison)"));
C.push(bul("Identifiant client"));
C.push(bul("Montant des frais débités (commission + taxes)"));
C.push(h3("3. Sorties"));
C.push(body("Ticket de demande créé dans la base de données Internet Banking, contenant :"));
C.push(bul("Numéro de référence IB unique (ex. : CHQ-2026-XXXXXX)",1));
C.push(bul("Référence de la transaction Core Banking (lien avec ALTBank)",1));
C.push(bul("Statut initial : « En attente de traitement »",1));
C.push(bul("Date et heure de création",1));
C.push(bul("Identifiant client et numéro de compte débité",1));
C.push(bul("Devise et nombre de feuillets",1));
C.push(bul("Agence de livraison sélectionnée",1));
C.push(bul("Montant total des frais débités",1));
C.push(bul("Notification de succès envoyée au client (F6.1)"));
C.push(bul("Demande visible dans « Mes Demandes » côté client"));
C.push(bul("Demande visible dans la file d'attente de l'agence de livraison côté back-office opérateur"));
C.push(h3("4. Préconditions"));
C.push(bul("Accusé de succès du Core Banking reçu et validé")); C.push(bul("Base de données Internet Banking disponible"));
C.push(h3("5. Postconditions"));
C.push(bul("La demande est enregistrée en base IB avec le statut « En attente de traitement »"));
C.push(bul("La demande apparaît dans l'interface client (« Mes Demandes »)"));
C.push(bul("La demande apparaît dans la file d'attente de l'agence de livraison (back-office)"));
C.push(bul("La création est journalisée (numéro de référence, horodatage, identifiant client)"));
C.push(h3("6. Processus"));
C.push(num("L'Internet Banking reçoit l'accusé de succès du Core Banking avec le numéro de référence de transaction."));
C.push(num("Le système génère un numéro de référence IB unique pour la demande."));
C.push(num("Le système crée l'enregistrement complet de la demande en base de données IB."));
C.push(num("Le statut initial « En attente de traitement » est affecté automatiquement."));
C.push(num("La création est journalisée."));
C.push(num("Le système déclenche l'envoi de la notification de succès au client (F6.1)."));
C.push(num("La demande devient immédiatement visible dans l'interface client et dans le back-office de l'agence de livraison."));
C.push(h3("7. Scénarios Alternatifs et Cas d'Erreur"));
C.push(bul("Échec d'écriture en base IB après succès Core Banking → Incident critique journalisé immédiatement avec alerte au niveau administrateur (incohérence entre Core Banking et IB). Un mécanisme de réconciliation doit être déclenché pour créer le ticket IB en rattrapage."));
C.push(empty());

// F4.3
C.push(h2("F4.3 : Gestion des cas d'échec"));
C.push(h3("1. Définition et Objectif"));
C.push(body("Cette fonctionnalité définit le comportement du système en cas d'échec à toute étape du processus de soumission. Elle garantit qu'en toutes circonstances, aucune situation intermédiaire incohérente n'est créée dans le système (pas de débit sans ticket IB, pas de ticket IB sans débit confirmé - BR-02 et BR-08), et que le client reçoit un message clair, explicite et orienté action."));
C.push(empty());
C.push(tbl(
  ["Cas d'erreur", "Comportement système", "Message affiché au client", "Action proposée"],
  [
    ["Solde insuffisant","Aucun débit, aucune demande créée","Votre solde est insuffisant. Aucun montant n'a été débité.","Alimentez votre compte et réessayez."],
    ["Core Banking indisponible / timeout","Annulation complète, aucune opération partielle","Service temporairement indisponible. Votre demande n'a pas été enregistrée.","Réessayez dans quelques instants."],
    ["OTP invalide (tentatives restantes)","Maintien sur l'écran OTP, compteur décrémenté","Code incorrect. Il vous reste X tentative(s).","Ressaisie du code OTP"],
    ["OTP expiré","Invalidation du code, maintien de la session","Votre code a expiré.","Cliquez sur \"Renvoyer un code\"."],
    ["3 échecs OTP consécutifs","Invalidation définitive de la session de demande","Trop de tentatives. Votre demande a été annulée.","Recommencez votre demande."],
    ["Double soumission","Rejet par contrôle d'idempotence côté serveur","Cette demande a déjà été soumise.","Redirection vers « Mes Demandes »"],
    ["Compte bloqué / inéligible","Blocage dès le formulaire","Votre compte ne permet pas cette opération.","Contactez votre agence."],
  ],
  [2100,2200,2800,1926]
));

// ============================================================
// FONCTIONNALITÉ 5
// ============================================================
C.push(h1("Fonctionnalité 5 : Traitement Back-Office"));

// F5.1
C.push(h2("F5.1 : Consultation de la file d'attente (opérateur)"));
C.push(h3("1. Définition et Objectif"));
C.push(body("L'interface back-office dédiée aux opérateurs d'agence affiche exclusivement les demandes de chéquier dont l'agence de livraison correspond à l'agence d'appartenance de l'opérateur connecté. Ce cloisonnement strict (BR-09) garantit que chaque opérateur ne traite que les demandes relevant de sa responsabilité. L'interface offre des fonctionnalités de filtrage et de tri pour faciliter la gestion quotidienne."));
C.push(h3("2. Variantes"));
C.push(bul("File d'attente avec plusieurs demandes en statut « En attente de traitement »"));
C.push(bul("File d'attente vide (aucune demande en attente)"));
C.push(bul("Consultation des demandes dans tous les statuts (historique complet)"));
C.push(h3("3. Entrées"));
C.push(bul("Authentification de l'opérateur (identifiant et agence d'appartenance extraits du profil)"));
C.push(h3("4. Sorties"));
C.push(body("Liste des demandes filtrées par agence de livraison de l'opérateur, affichant pour chaque demande :"));
C.push(bul("Numéro de référence IB",1)); C.push(bul("Date et heure de soumission",1));
C.push(bul("Nom du client et numéro de compte",1)); C.push(bul("Devise et nombre de feuillets",1));
C.push(bul("Statut actuel avec horodatage du dernier changement",1));
C.push(bul("Opérateur responsable (si déjà pris en charge)",1));
C.push(bul("Filtres disponibles : par statut, par date, par numéro de compte",1));
C.push(bul("Tri par défaut : date de soumission croissante (plus ancienne demande en premier)",1));
C.push(h3("5. Préconditions"));
C.push(bul("Opérateur authentifié avec le profil « Opérateur agence »"));
C.push(bul("Agence d'appartenance de l'opérateur identifiée dans son profil"));
C.push(h3("6. Postconditions"));
C.push(bul("L'opérateur visualise uniquement les demandes de son agence de livraison"));
C.push(bul("Aucune modification des données n'est effectuée à cette étape"));
C.push(empty());

// F5.2
C.push(h2("F5.2 : Prise en charge d'une demande (→ statut « En cours »)"));
C.push(h3("1. Définition et Objectif"));
C.push(body("Cette action permet à un opérateur d'agence de prendre officiellement en charge une demande dont le statut est « En attente de traitement », signalant ainsi au système, aux autres opérateurs et au client que le traitement physique du chéquier a débuté. La prise en charge attribue la responsabilité de la demande à l'opérateur concerné et déclenche une notification automatique au client."));
C.push(h3("2. Entrées"));
C.push(bul("Sélection de la demande par l'opérateur dans la file d'attente"));
C.push(bul("Action « Prendre en charge » (bouton d'action sur la demande sélectionnée)"));
C.push(h3("3. Sorties"));
C.push(bul("Statut de la demande mis à jour : « En attente de traitement » → « En cours »"));
C.push(bul("Identifiant de l'opérateur et horodatage de la prise en charge enregistrés"));
C.push(bul("Notification automatique envoyée au client (F6.3) : « Votre demande de chéquier est en cours de traitement par notre équipe. »"));
C.push(bul("Journalisation de l'action (opérateur, demande, horodatage)"));
C.push(h3("4. Préconditions"));
C.push(bul("Demande en statut « En attente de traitement »"));
C.push(bul("Opérateur appartenant à l'agence de livraison de la demande (contrôle RBAC)"));
C.push(h3("5. Postconditions"));
C.push(bul("Le statut « En cours » est visible côté client dans « Mes Demandes »"));
C.push(bul("La demande est marquée comme prise en charge par l'opérateur dans le back-office"));
C.push(h3("6. Scénarios Alternatifs et Cas d'Erreur"));
C.push(bul("Tentative de prise en charge d'une demande déjà prise par un autre opérateur → Message : « Cette demande est déjà prise en charge par [Opérateur X]. »"));
C.push(empty());

// F5.3
C.push(h2("F5.3 : Déclaration de l'impression (→ statut « Imprimé / Prêt »)"));
C.push(h3("1. Définition et Objectif"));
C.push(body("L'opérateur déclare dans le système que le chéquier a été physiquement imprimé et est disponible pour retrait par le client dans l'agence de livraison. Cette action déclenche la notification la plus importante pour le client, l'informant qu'il peut se présenter à l'agence pour récupérer son chéquier."));
C.push(h3("2. Entrées"));
C.push(bul("Action « Déclarer Imprimé / Prêt » sur la demande en statut « En cours »"));
C.push(h3("3. Sorties"));
C.push(bul("Statut mis à jour : « En cours » → « Imprimé / Prêt »"));
C.push(bul("Identifiant de l'opérateur et horodatage enregistrés"));
C.push(bul("Notification automatique envoyée au client : « Votre chéquier est prêt. Présentez-vous à l'agence [Nom et adresse] muni de votre pièce d'identité pour le retirer. »"));
C.push(bul("Journalisation de l'action"));
C.push(h3("4. Préconditions"));
C.push(bul("Demande en statut « En cours »"));
C.push(bul("Opérateur responsable de la demande ou appartenant à l'agence de livraison"));
C.push(empty());

// F5.4
C.push(h2("F5.4 : Confirmation de livraison (→ statut « Livré »)"));
C.push(h3("1. Définition et Objectif"));
C.push(body("L'opérateur confirme dans le système la remise physique du chéquier au client après vérification de son identité au guichet. Cette action clôture définitivement le cycle de vie de la demande et déclenche la notification finale au client."));
C.push(h3("2. Entrées"));
C.push(bul("Action « Confirmer Livré » sur la demande en statut « Imprimé / Prêt »"));
C.push(h3("3. Sorties"));
C.push(bul("Statut mis à jour : « Imprimé / Prêt » → « Livré »"));
C.push(bul("Identifiant de l'opérateur et horodatage de livraison enregistrés"));
C.push(bul("Notification finale envoyée au client : « Votre chéquier vous a été remis. Merci pour votre confiance. AFBSS reste à votre disposition. »"));
C.push(bul("Demande définitivement clôturée dans le système (état terminal)"));
C.push(bul("Journalisation complète de la clôture"));
C.push(h3("4. Préconditions"));
C.push(bul("Demande en statut « Imprimé / Prêt »"));
C.push(bul("Opérateur appartenant à l'agence de livraison de la demande"));

// ============================================================
// FONCTIONNALITÉ 6
// ============================================================
C.push(h1("Fonctionnalité 6 : Notifications Automatiques"));
C.push(h2("F6.1 – F6.3 : Notifications client à chaque étape"));
C.push(h3("1. Définition et Objectif"));
C.push(body("Le système envoie automatiquement des notifications au client à chaque étape significative du cycle de vie de sa demande, via les canaux configurés dans ses préférences (in-app, SMS, email). Ces notifications assurent une transparence totale et une expérience client fluide, en informant le client en temps réel sans qu'il ait à consulter activement l'application. Elles constituent également une preuve de traitement conservée dans le journal d'audit."));
C.push(h3("2. Règles de Fonctionnement"));
C.push(bul("Envoi automatique déclenché par chaque transition de statut ou événement système"));
C.push(bul("Canal prioritaire : SMS. Canal secondaire : email. Canal complémentaire : notification in-app"));
C.push(bul("En cas d'échec d'envoi : tentative sur canal secondaire + journalisation de l'échec + alerte administrateur"));
C.push(bul("Toutes les notifications sont journalisées : type, canal, horodatage, statut de délivrance"));
C.push(empty());
C.push(tbl(
  ["Événement déclencheur", "Contenu de la notification", "Canaux"],
  [
    ["Demande créée avec succès","Votre demande de chéquier n° [REF] a bien été enregistrée le [DATE] à [HEURE]. Un montant de [TOTAL] a été débité de votre compte [COMPTE]. Vous serez notifié à chaque avancement.","In-app, SMS, Email"],
    ["Solde insuffisant (échec)","Votre demande de chéquier n'a pas abouti. Solde insuffisant sur votre compte [COMPTE]. Aucun montant n'a été débité. Veuillez alimenter votre compte et réessayer.","In-app, SMS, Email"],
    ["Service indisponible (échec technique)","Votre demande de chéquier n'a pas pu être enregistrée en raison d'une indisponibilité technique. Aucun montant n'a été débité. Veuillez réessayer ultérieurement.","In-app, SMS"],
    ["Prise en charge (→ En cours)","Votre demande de chéquier n° [REF] est en cours de traitement par notre équipe à l'agence [AGENCE]. Vous serez notifié dès que votre chéquier sera prêt.","In-app, SMS"],
    ["Chéquier imprimé (→ Imprimé / Prêt)","Votre chéquier est prêt ! Présentez-vous à l'agence [NOM AGENCE] — [ADRESSE] muni de votre pièce d'identité. Réf. demande : [REF].","In-app, SMS, Email"],
    ["Chéquier remis (→ Livré)","Votre chéquier (n° [REF]) vous a été remis le [DATE]. Merci pour votre confiance. Pour toute question, contactez votre agence AFBSS.","In-app, SMS"],
  ],
  [2400,5000,1626]
));

// ============================================================
// VI. MODÈLE DE DONNÉES
// ============================================================
C.push(new Paragraph({
  heading: HeadingLevel.HEADING_1, pageBreakBefore: true,
  spacing: sp(480,240),
  children:[new TextRun({text:"VI. Modèle de Données", font:FONT, size:32, bold:true, color:BLUE_DARK})]
}));

C.push(h2("Entités principales et cardinalités"));
C.push(empty());
C.push(tbl(
  ["Entité 1","Card. 1","Entité 2","Card. 2","Description / Règle métier clé"],
  [
    ["Client","1","Compte bancaire","N","Un client peut être titulaire de plusieurs comptes bancaires. Seuls les comptes actifs, non bloqués et disposant de l'autorisation chéquier sont éligibles (BR-01)."],
    ["Compte bancaire","1","Demande chéquier","N","Un compte peut générer plusieurs demandes. Une demande est obligatoirement rattachée à un seul compte actif et éligible au moment de la soumission."],
    ["Client","1","Demande chéquier","N","Un client peut soumettre plusieurs demandes. Chaque demande est liée à un et un seul client identifié."],
    ["Compte bancaire","N","Agence domiciliation (Home Branch)","1","Chaque compte est rattaché à une agence de domiciliation unique. Cette agence est le destinataire obligatoire du crédit de commission et taxes, indépendamment de l'agence de livraison choisie (BR-04)."],
    ["Demande chéquier","1","Transaction Core Banking","1","Chaque demande validée est associée à exactement une transaction atomique dans ALTBank. Impossible de créer une demande dans l'IB sans transaction Core Banking confirmée (BR-02, BR-08)."],
    ["Demande chéquier","1","Historique de statuts","N","Une demande passe par plusieurs statuts. Chaque transition génère un enregistrement horodaté avec l'identifiant de l'acteur ayant effectué la transition (BR-07)."],
    ["Demande chéquier","1","Notification","N","Une demande peut générer plusieurs notifications client au cours de son cycle de vie (création, chaque transition de statut, erreur)."],
    ["Demande chéquier","N","Agence de livraison","1","Le client choisit librement une agence de livraison parmi toutes les agences AFBSS actives (BR-05). L'agence détermine la file d'attente back-office, mais pas l'affectation comptable."],
    ["Opérateur agence","1","Changement de statut","N","Chaque changement de statut initié par un opérateur est tracé avec son identifiant nominatif. Un opérateur ne peut agir que sur les demandes de son agence (BR-09)."],
    ["Agence AFBSS","1","Opérateur agence","N","Une agence compte un ou plusieurs opérateurs. Chaque opérateur est rattaché à une seule agence qui détermine son périmètre de travail dans le back-office."],
    ["Session formulaire","1","Jeton idempotence","1","Chaque instance de formulaire génère un jeton d'idempotence unique. Ce jeton garantit qu'une même demande ne peut être exécutée deux fois (BR-10). Le jeton est invalidé après utilisation ou abandon."],
  ],
  [1700,550,1900,550,4326]
));

C.push(empty());
C.push(h2("Description des attributs clés des entités principales"));
C.push(h3("Entité : Demande chéquier"));
C.push(tbl(
  ["Attribut","Type","Contrainte","Description"],
  [
    ["Numéro de référence IB","VARCHAR(20)","PK, UNIQUE, NOT NULL","Identifiant unique IB (ex. CHQ-2026-XXXXXX)"],
    ["Référence transaction Core Banking","VARCHAR(50)","UNIQUE, NOT NULL","Lien avec la transaction ALTBank"],
    ["Identifiant client","VARCHAR(50)","FK, NOT NULL","Identifiant du client titulaire"],
    ["Numéro de compte débité","VARCHAR(30)","NOT NULL","Compte source du débit (affiché masqué)"],
    ["Devise","CHAR(3)","NOT NULL","Devise ISO 4217 (USD, SSP, EUR...)"],
    ["Nombre de feuillets","INTEGER","NOT NULL, IN (25, 50)","Nombre de feuillets demandé"],
    ["Montant commission","DECIMAL(15,2)","NOT NULL, ≥ 0","Commission bancaire débitée"],
    ["Montant taxes","DECIMAL(15,2)","NOT NULL, ≥ 0","Taxes réglementaires débitées"],
    ["Montant total frais","DECIMAL(15,2)","NOT NULL, ≥ 0","Total débité (commission + taxes)"],
    ["Code agence de livraison","VARCHAR(10)","FK, NOT NULL","Agence choisie par le client pour le retrait"],
    ["Code agence domiciliation","VARCHAR(10)","FK, NOT NULL","Home Branch — reçoit le crédit des frais (BR-04)"],
    ["Statut courant","ENUM","NOT NULL","EN_ATTENTE / EN_COURS / IMPRIME / LIVRE / ECHOUE"],
    ["Date de création","TIMESTAMP","NOT NULL","Horodatage de création du ticket IB"],
    ["Date de dernière MAJ","TIMESTAMP","NOT NULL","Horodatage de la dernière modification"],
  ],
  [2300,1600,2000,3126]
));

C.push(empty());
C.push(h3("Entité : Historique de statuts"));
C.push(tbl(
  ["Attribut","Type","Contrainte","Description"],
  [
    ["Identifiant historique","UUID","PK, NOT NULL","Identifiant unique de l'entrée"],
    ["Référence demande","VARCHAR(20)","FK, NOT NULL","Demande concernée"],
    ["Statut source","ENUM","NOT NULL","Statut avant la transition"],
    ["Statut cible","ENUM","NOT NULL","Statut après la transition"],
    ["Identifiant acteur","VARCHAR(50)","NOT NULL","Opérateur ou « SYSTEM »"],
    ["Type acteur","ENUM","NOT NULL","CLIENT / OPERATEUR / SYSTEME"],
    ["Horodatage","TIMESTAMP","NOT NULL","Date et heure précise de la transition"],
    ["Commentaire","TEXT","NULLABLE","Commentaire libre (ex. motif d'un blocage)"],
  ],
  [2300,1600,2000,3126]
));

C.push(empty());
C.push(h3("Entité : Notification"));
C.push(tbl(
  ["Attribut","Type","Contrainte","Description"],
  [
    ["Identifiant notification","UUID","PK, NOT NULL","Identifiant unique de la notification"],
    ["Référence demande","VARCHAR(20)","FK, NOT NULL","Demande associée"],
    ["Type d'événement","ENUM","NOT NULL","CREATION / ECHEC / PRISE_EN_CHARGE / IMPRIME / LIVRE"],
    ["Canal d'envoi","ENUM","NOT NULL","SMS / EMAIL / IN_APP"],
    ["Destinataire","VARCHAR(255)","NOT NULL","Numéro ou email (affiché masqué)"],
    ["Contenu du message","TEXT","NOT NULL","Corps du message envoyé"],
    ["Statut d'envoi","ENUM","NOT NULL","SUCCES / ECHEC / EN_ATTENTE"],
    ["Horodatage d'envoi","TIMESTAMP","NOT NULL","Date et heure de l'envoi ou de la tentative"],
    ["Code erreur","VARCHAR(50)","NULLABLE","Code d'erreur en cas d'échec d'envoi"],
  ],
  [2300,1600,2000,3126]
));

// ===================================================================
// BUILD DOC
// ===================================================================
const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: 24 } } },
    paragraphStyles: [
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:32, bold:true, font:FONT, color:BLUE_DARK },
        paragraph:{ spacing:{ before:480, after:240 }, outlineLevel:0 } },
      { id:"Heading2", name:"Heading 2", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:28, bold:true, font:FONT, color:BLUE_DARK },
        paragraph:{ spacing:{ before:360, after:180 }, outlineLevel:1 } },
      { id:"Heading3", name:"Heading 3", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:26, bold:true, font:FONT, color:BLUE_MED },
        paragraph:{ spacing:{ before:240, after:120 }, outlineLevel:2 } },
    ]
  },
  numbering: {
    config: [
      { reference:"bullets", levels:[
        { level:0, format:LevelFormat.BULLET, text:"•", alignment:AlignmentType.LEFT,
          style:{ paragraph:{ indent:{ left:720, hanging:360 } } } },
        { level:1, format:LevelFormat.BULLET, text:"◦", alignment:AlignmentType.LEFT,
          style:{ paragraph:{ indent:{ left:1080, hanging:360 } } } },
      ]},
      { reference:"numbers", levels:[
        { level:0, format:LevelFormat.DECIMAL, text:"%1.", alignment:AlignmentType.LEFT,
          style:{ paragraph:{ indent:{ left:720, hanging:360 } } } },
      ]},
    ]
  },
  sections:[{
    properties:{
      page:{
        size:{ width:11906, height:16838 }, // A4
        margin:{ top:1134, right:1134, bottom:1134, left:1134 }
      }
    },
    headers:{ default: new Header({ children:[
      new Paragraph({
        border:{ bottom:{ style:BorderStyle.SINGLE, size:6, color:BLUE_MED, space:1 } },
        children:[
          new TextRun({ text:"AFRILAND FIRST BANK SOUTH SUDAN", font:FONT, size:18, bold:true, color:BLUE_DARK }),
          new TextRun({ text:"     |     MODULE M-CHQ — Demande de Chéquier en Ligne     |     Version 1.0", font:FONT, size:18, color:"595959" }),
        ]
      })
    ]})},
    footers:{ default: new Footer({ children:[
      new Paragraph({
        border:{ top:{ style:BorderStyle.SINGLE, size:6, color:BLUE_MED, space:1 } },
        alignment: AlignmentType.RIGHT,
        children:[
          new TextRun({ text:"Page ", font:FONT, size:18, color:"595959" }),
          new TextRun({ children:[PageNumber.CURRENT], font:FONT, size:18, color:"595959" }),
          new TextRun({ text:" / ", font:FONT, size:18, color:"595959" }),
          new TextRun({ children:[PageNumber.TOTAL_PAGES], font:FONT, size:18, color:"595959" }),
        ]
      })
    ]})},
    children: C
  }]
});

const out = "C:/Mes Sites Web/Projet_Kiné_Entreprise/M-CHQ_Fonctionnalites.docx";
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(out, buf);
  console.log("SUCCESS: " + out);
}).catch(e => { console.error("ERROR:", e.message); });
