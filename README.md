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

- [x] Frontend déployé sur Vercel (preview) — corrigé (photo + nom du kiné sur la page de connexion)
- [ ] Backend en cours de déploiement sur Render
- [x] Base de données créée sur Neon (PostgreSQL gratuit)
- [ ] Vercel connecté à Render (rewrite `/api` → URL Render, pas encore fait)
- [ ] Passage du frontend en production Vercel (`vercel --prod`)
- [ ] Compte de test Kinésithérapeute (à insérer manuellement, aucun n'est pré-créé)
- [ ] Installation locale Docker pour le réseau d'entreprise (sans internet) — le fichier existe déjà (`docker-compose.yml`), reste à installer Docker Desktop et lancer

## Comptes de test

| Rôle | Email | Mot de passe | Statut |
|---|---|---|---|
| Admin RH | `admin@tonkine.cm` | `Admin@TonKine2026` | Pré-créé automatiquement (script `V2__donnees_reference.sql`) |
| Employé | — | — | À créer via "Créer mon profil" sur `/inscription` (entreprise démo : *Acme Corporation Cameroun*) |
| Kinésithérapeute | — | — | Aucun compte pré-créé — à insérer manuellement en base |

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
