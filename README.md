# TonKiné au Travail

Application de prévention des troubles musculo-squelettiques (TMS) en entreprise —
suivi posture, exercices, protocoles curatifs, prise de rendez-vous kinésithérapeute.

Dépôt : https://github.com/NDHOMOU/tonkine-au-travail

## Structure du projet

| Dossier | Contenu | Rôle |
|---|---|---|
| `tonkine-frontend/` | React + Vite | App complète (connexion, tableaux de bord Employé/Admin RH/Kiné) — **c'est la version active** |
| `tonkine-backend/` | Java Spring Boot | API, connectée à PostgreSQL/MySQL/H2 au choix |
| `tonkine-au-travail/` | HTML/CSS/JS statique | Ancien prototype, gardé pour référence visuelle |

## État actuel

- [x] Frontend déployé **en production** sur Vercel : https://tonkine-frontend.vercel.app
- [x] Backend déployé et opérationnel sur Render
- [x] Base de données créée sur Neon (PostgreSQL gratuit)
- [x] Vercel connecté à Render (rewrite `/api` → URL Render)
- [x] Connexion testée de bout en bout en production — Admin RH **et** Kinésithérapeute fonctionnent (JWT, dashboards réels)
- [x] Compte de test Kinésithérapeute créé (Geneviève Ndhomou, seule kiné de l'appli — voir V4)
- [ ] Installation locale Docker pour le réseau d'entreprise (sans internet) — le fichier existe déjà (`docker-compose.yml`), reste à installer Docker Desktop et lancer

## Comptes de test

Le dépôt étant **public** et le backend accessible depuis internet, les mots de passe des
comptes de test ne sont volontairement **pas écrits ici** (un historique Git public est
permanent, même après suppression). Ils sont définis dans
`tonkine-backend/src/main/resources/db/migration/V4__fix_admin_password_et_kine.sql`
(hash BCrypt uniquement — le mot de passe en clair n'y figure pas non plus) et ont été
communiqués séparément.

| Rôle | Email | Statut |
|---|---|---|
| Admin RH | `admin@tonkine.cm` | Pré-créé (mot de passe corrigé en V4) |
| Kinésithérapeute | `genevieve.ndhomou@tonkine.cm` | Pré-créé en V4 — seule kiné de l'application |
| Employé | — | À créer via "Créer mon profil" sur `/inscription` (entreprise démo : *Acme Corporation Cameroun*) |

## Développement local (avec internet, pour coder)

**Frontend seul** (proxy automatique vers `localhost:8080`, voir `vite.config.js`) :
```
cd tonkine-frontend
npm install
npm run dev          # http://localhost:5173
```

**Backend seul** (nécessite Java 17 + Maven + une base locale) :
```
cd tonkine-backend
mvn spring-boot:run
```

## Installation complète en local — réseau d'entreprise, SANS internet

C'est la solution prévue pour un accès depuis tous les postes du bureau sans dépendre
d'internet. Nécessite **Docker Desktop** installé sur une machine du réseau (le "serveur").

```
cp .env.example .env       # remplir les mots de passe/secrets
docker compose --profile full up -d
```

Les collègues connectés au même réseau (Wi-Fi/Ethernet) accèdent ensuite via
`http://<IP-de-la-machine-serveur>:3000` — aucune connexion internet nécessaire une fois
les images Docker construites.

## Déploiement cloud actuel (démo / accès à distance, nécessite internet)

- **Frontend** : Vercel — projet `ndhomou-3478s-projects/tonkine-frontend`
- **Backend** : Render — service `tonkine-backend` (Docker)
- **Base de données** : Neon (projet `tonkine-au-travail`, base `neondb`)

Variables d'environnement du backend configurées **uniquement dans le tableau de bord
Render** (jamais dans ce dépôt, qui est public) :
`SPRING_PROFILES_ACTIVE`, `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
`SPRING_DATASOURCE_PASSWORD`, `TONKINE_JWT_SECRET`, `TONKINE_CORS_ALLOWED_ORIGINS`.

## Notes techniques

- Le backend s'adapte à 3 bases de données au choix (H2, MySQL, PostgreSQL) via les
  profils Spring — voir `tonkine-backend/src/main/resources/application*.properties`.
- Flyway crée automatiquement le schéma et les données de référence (exercices,
  protocoles, entreprise de démonstration, compte admin) au premier démarrage du backend.
- `.env` (racine) contient des secrets réels pour l'environnement Docker local — ne
  jamais le committer (déjà exclu par `.gitignore`).
