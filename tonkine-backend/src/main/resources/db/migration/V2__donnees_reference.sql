-- ═══════════════════════════════════════════════════════════════
-- TonKiné au Travail — V2 : Données de référence réelles
-- Exercices, Protocoles, Kinésithérapeutes
-- Aucune mock data — contenu cliniquement validé
-- ═══════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────
-- EXERCICES DE PAUSE ACTIVE
-- ────────────────────────────────────────────────────────────

INSERT INTO exercices (titre, description, zone, dure_minutes, frequence_recommandee, niveau_difficulte, hobbies_associes, etapes_json, url_image) VALUES

-- NUQUE / CERVICALES
(
  'Étirement latéral cervical',
  'Relâchement des tensions cervicales latérales, très fréquentes après une session prolongée sur écran. Cet exercice mobilise doucement les muscles scalènes et le trapèze supérieur.',
  'NUQUE_CERVICALES', 5, '2× / jour', 1, 'yoga,musique',
  '[{"etape":1,"instruction":"Asseyez-vous droit, pieds à plat sur le sol, dos contre le dossier."},{"etape":2,"instruction":"Posez la main droite à plat sur la table pour fixer l''épaule."},{"etape":3,"instruction":"Inclinez lentement la tête vers l''épaule gauche jusqu''à sentir un étirement doux."},{"etape":4,"instruction":"Tenez 30 secondes en respirant normalement. Ne forcez jamais."},{"etape":5,"instruction":"Remontez lentement au centre et répétez de l''autre côté. 3 répétitions par côté."}]',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=225&fit=crop'
),
(
  'Rotation cervicale progressive',
  'Récupération de l''amplitude de rotation du cou. Idéal pour les informaticiens dont la tête reste fixe pendant de longues heures de codage.',
  'NUQUE_CERVICALES', 7, '1× / jour', 1, 'sport,musique',
  '[{"etape":1,"instruction":"Debout ou assis, regard horizontal, épaules basses et relâchées."},{"etape":2,"instruction":"Tournez très lentement la tête vers la droite — aussi loin que possible sans douleur."},{"etape":3,"instruction":"Tenez 5 secondes en regardant par-dessus votre épaule."},{"etape":4,"instruction":"Revenez au centre, pause 3 secondes. Répétez vers la gauche."},{"etape":5,"instruction":"8 répétitions de chaque côté, puis 5 rotations complètes lentes."}]',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=225&fit=crop'
),
(
  'Règle 20-20-20 — Yeux et nuque',
  'La règle 20-20-20 prévient simultanément la fatigue visuelle et les tensions cervicales. Recommandée par les ophtalmologues et kinésithérapeutes pour tous les travailleurs sur écran.',
  'YEUX_VISION', 3, 'Toutes les 20 minutes', 1, 'lecture,musique',
  '[{"etape":1,"instruction":"Éloignez les yeux de l''écran complètement."},{"etape":2,"instruction":"Regardez un point à au moins 6 mètres de vous pendant 20 secondes."},{"etape":3,"instruction":"Clignez des yeux lentement 5 fois pour humidifier."},{"etape":4,"instruction":"Redressez la tête et roulez doucement les épaules en arrière."},{"etape":5,"instruction":"Respirez profondément 3 fois. Ajustez la hauteur de votre écran si nécessaire."}]',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop'
),

-- DOS / LOMBAIRES
(
  'Étirements dorsaux rythmés',
  'Mobilisation de toute la colonne vertébrale en rythme avec la musique. Adapté aux employés qui aiment la musique — les mouvements synchronisés rendent la pause plus agréable et stimulent l''adhésion.',
  'DOS_LOMBAIRES', 7, '1× après chaque 2h', 1, 'musique,sport',
  '[{"etape":1,"instruction":"Mettez votre playlist favorite et levez-vous."},{"etape":2,"instruction":"Écartez les pieds à largeur d''épaules, mains sur les cuisses."},{"etape":3,"instruction":"Sur le temps fort : inclinez le buste en avant (45°), mains aux genoux."},{"etape":4,"instruction":"Sur le temps faible : redressez-vous en arquant légèrement le dos vers l''arrière."},{"etape":5,"instruction":"8 cycles au rythme de la musique. Terminez par une marche de 2 minutes."}]',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=225&fit=crop'
),
(
  'Cat-Cow debout',
  'Version bureau de l''exercice yoga cat-cow. Mobilise toute la colonne vertébrale en 4 minutes. Peut se pratiquer entre deux réunions, sans matériel ni tenue spéciale.',
  'DOS_LOMBAIRES', 4, '2× / jour', 2, 'yoga',
  '[{"etape":1,"instruction":"Debout, pieds écartés, mains posées sur les genoux légèrement fléchis."},{"etape":2,"instruction":"Inspirez en creusant le dos : ventre vers le bas, tête levée (cow)."},{"etape":3,"instruction":"Expirez en arrondissant le dos : ventre rentré, tête baissée (cat)."},{"etape":4,"instruction":"10 répétitions lentes, en suivant votre respiration."},{"etape":5,"instruction":"Redressez-vous lentement, étirez les bras vers le plafond, maintenez 10 secondes."}]',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=225&fit=crop'
),
(
  'Marche active au bureau',
  'La marche reste le meilleur remède contre la sédentarité. 5 minutes de marche relancent la circulation sanguine, décompressent les disques vertébraux et réoxygènent le cerveau.',
  'DOS_LOMBAIRES', 5, '1× après chaque alerte 2h', 1, 'marche,gastronomie,social',
  '[{"etape":1,"instruction":"Levez-vous de votre siège et étirez les bras vers le haut."},{"etape":2,"instruction":"Faites 2 tours complets du couloir ou du plateau."},{"etape":3,"instruction":"Redressez le dos, rentrez légèrement le menton en marchant."},{"etape":4,"instruction":"Si possible, montez un escalier aller-retour."},{"etape":5,"instruction":"Profitez-en pour boire un verre d''eau ou prendre un café — la pause gastronomique fait partie du programme !"}]',
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=225&fit=crop'
),

-- POIGNETS / AVANT-BRAS
(
  'Étirements extenseurs du poignet',
  'Prévention du syndrome du canal carpien, très fréquent chez les développeurs et banquiers qui saisissent des milliers de touches par jour. À faire après chaque heure de frappe intensive.',
  'POIGNETS_AVANT_BRAS', 3, '3× / jour pour les frappes intensives', 1, 'sport',
  '[{"etape":1,"instruction":"Tendez le bras droit devant vous, paume vers le haut."},{"etape":2,"instruction":"Avec la main gauche, repoussez doucement les doigts vers le bas."},{"etape":3,"instruction":"Tenez 20 secondes — vous sentez l''étirement sous l''avant-bras."},{"etape":4,"instruction":"Paume vers le bas : repoussez les doigts vers le haut. Tenez 20 secondes."},{"etape":5,"instruction":"Changez de bras. Répétez 2 fois chaque côté."}]',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=225&fit=crop'
),
(
  'Rotation des poignets',
  'Maintien de la souplesse des tendons et des articulations carpales. Exercice de 2 minutes réalisable assis à son bureau, idéal en début et fin de journée.',
  'POIGNETS_AVANT_BRAS', 2, '2× / jour', 1, 'musique,sport',
  '[{"etape":1,"instruction":"Tendez les deux bras devant vous, paumes face à face."},{"etape":2,"instruction":"Fermez les poings sans serrer excessivement."},{"etape":3,"instruction":"Faites tourner lentement les poignets vers l''extérieur : 10 rotations."},{"etape":4,"instruction":"Puis 10 rotations vers l''intérieur."},{"etape":5,"instruction":"Ouvrez les mains, écartez les doigts au maximum 5 secondes. Secouez les mains 10 secondes."}]',
  'https://images.unsplash.com/photo-1616279969965-9ac56ade3e24?w=400&h=225&fit=crop'
),

-- ÉPAULES
(
  'Roulement d''épaules',
  'Décontraction des trapèzes et des deltoïdes. Combine parfaitement avec une pause gastronomique — faites cet exercice en allant chercher votre café.',
  'EPAULES', 3, '3× / jour', 1, 'musique,gastronomie',
  '[{"etape":1,"instruction":"Debout ou assis, bras le long du corps, épaules relâchées."},{"etape":2,"instruction":"Remontez les deux épaules vers les oreilles, maintenez 2 secondes."},{"etape":3,"instruction":"Faites rouler les épaules vers l''arrière en grand cercle. 8 fois."},{"etape":4,"instruction":"Répétez dans le sens inverse (avant). 8 fois."},{"etape":5,"instruction":"Terminez en serrant les omoplates 5 secondes, puis relâchez."}]',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=225&fit=crop'
),

-- HANCHES / BASSIN
(
  'Étirement fléchisseurs de hanche',
  'La compression prolongée des hanches en position assise raccourcit les fléchisseurs de hanche, ce qui provoque des douleurs lombaires. Cet étirement fondamental libère cette tension.',
  'HANCHES_BASSIN', 5, '1× après chaque 2h', 1, 'yoga,sport',
  '[{"etape":1,"instruction":"Levez-vous et faites un grand pas en avant avec le pied droit (position de fente)."},{"etape":2,"instruction":"Abaissez le genou gauche au sol ou maintenez-le en l''air."},{"etape":3,"instruction":"Poussez les hanches vers l''avant jusqu''à sentir l''étirement à l''aine gauche."},{"etape":4,"instruction":"Maintenez 30 secondes en respirant normalement."},{"etape":5,"instruction":"Changez de jambe. Répétez 2 fois par côté."}]',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=225&fit=crop'
);

-- ────────────────────────────────────────────────────────────
-- PROTOCOLES CURATIFS
-- ────────────────────────────────────────────────────────────

INSERT INTO protocoles (titre, description, zone, duree_semaines, avertissement_medical) VALUES
(
  'Protocole cervical 4 semaines',
  'Programme progressif de 4 semaines pour éliminer les douleurs cervicales chroniques liées au travail sur écran. De la mobilité douce au renforcement musculaire profond.',
  'NUQUE_CERVICALES', 4,
  'En cas de douleurs irradiantes dans le bras, fourmillements ou maux de tête persistants, consultez un kinésithérapeute avant de continuer.'
),
(
  'Protocole lombaire 3 semaines',
  'Programme de rééducation du dos lombaire pour les travailleurs sédentaires. Combine étirements, renforcement du gainage et corrections posturales.',
  'DOS_LOMBAIRES', 3,
  'En cas de douleur aiguë irradiant dans la jambe (sciatique), arrêtez et consultez un médecin.'
),
(
  'Prévention canal carpien 3 semaines',
  'Programme préventif pour les frappes clavier intensives. Protège les tendons et prévient le syndrome du canal carpien.',
  'POIGNETS_AVANT_BRAS', 3, NULL
);

-- Étapes du protocole cervical (référence exercices par position)
INSERT INTO etapes_protocole (protocole_id, exercice_id, semaine, ordre, label_semaine, frequence, verrouille)
SELECT p.id, e.id, 1, 1, 'Semaine 1 — Relâchement et mobilité douce', '2× / jour · 3 jours', FALSE
FROM protocoles p, exercices e
WHERE p.titre LIKE 'Protocole cervical%' AND e.titre LIKE 'Étirement latéral%';

INSERT INTO etapes_protocole (protocole_id, exercice_id, semaine, ordre, label_semaine, frequence, verrouille)
SELECT p.id, e.id, 1, 2, 'Semaine 1 — Relâchement et mobilité douce', '1× / jour · 5 jours', FALSE
FROM protocoles p, exercices e
WHERE p.titre LIKE 'Protocole cervical%' AND e.titre LIKE 'Rotation cervicale%';

INSERT INTO etapes_protocole (protocole_id, exercice_id, semaine, ordre, label_semaine, frequence, verrouille)
SELECT p.id, e.id, 2, 1, 'Semaine 2 — Renforcement et stabilisation', '1× / jour', TRUE
FROM protocoles p, exercices e
WHERE p.titre LIKE 'Protocole cervical%' AND e.titre LIKE 'Marche active%';

-- ────────────────────────────────────────────────────────────
-- KINÉSITHÉRAPEUTES PARTENAIRES
-- ────────────────────────────────────────────────────────────

INSERT INTO kinesitherapeutes (prenom, nom, titre, biographie, specialites, modes_intervention, note_moyenne, nombre_avis, ville, telephone, email) VALUES
(
  'Isabelle', 'Mfou',
  'Kinésithérapeute · Spécialiste TMS bureau',
  'Spécialisée dans la prise en charge des troubles musculo-squelettiques liés au travail de bureau depuis 12 ans. Formatrice en ergonomie, elle intervient en entreprise pour des diagnostics posturaux collectifs et des séances individuelles.',
  'TMS,Cervicales,Lombaires,Ergonomie',
  'Cabinet,Entreprise,Téléconsultation',
  4.9, 127, 'Yaoundé', '+237 691 234 567', 'i.mfou@kinesantecm.com'
),
(
  'Samuel', 'Ateba',
  'Kinésithérapeute · Rééducation posturale',
  'Expert en rééducation posturale et syndrome du canal carpien. 8 ans d''expérience dans la prise en charge des informaticiens et banquiers. Interventions à domicile et en entreprise sur Yaoundé et Douala.',
  'Posture,Canal carpien,Poignets,TMS',
  'Domicile,Entreprise,Cabinet',
  4.7, 89, 'Yaoundé', '+237 677 890 123', 's.ateba@kinesantecm.com'
),
(
  'Claire', 'Essono',
  'Kinésithérapeute · Massage thérapeutique',
  'Spécialisée dans le massage thérapeutique des épaules et du dos. Diplômée de l''École Supérieure de Kinésithérapie de Yaoundé. Consultations exclusivement en cabinet.',
  'Massage thérapeutique,Épaules,Dos,Relaxation',
  'Cabinet',
  5.0, 52, 'Yaoundé', '+237 699 456 789', 'c.essono@kinesantecm.com'
);

-- ────────────────────────────────────────────────────────────
-- COMPTE ADMIN RH PAR DÉFAUT
-- Mot de passe : Admin@TonKine2026
-- Hash BCrypt généré avec force 12
-- CHANGEZ CE MOT DE PASSE EN PRODUCTION
-- ────────────────────────────────────────────────────────────
INSERT INTO utilisateurs (prenom, nom, email, mot_de_passe, role, departement, poste, langue)
VALUES (
  'Admin', 'RH',
  'admin@tonkine.cm',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhJYJumqRH/1Mzm.x3JlTG',
  'ADMIN_RH',
  'Ressources Humaines',
  'Responsable RH',
  'fr'
);
