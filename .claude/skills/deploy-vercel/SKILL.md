---
name: deploy-vercel
description: Héberge/déploie directement sur Vercel le site web de ce projet (TonKiné au Travail), depuis cette machine. Utilise ce skill dès que l'utilisateur parle de "mettre le site en ligne", "héberger", "déployer", "publier sur Vercel", ou demande si ce qu'il a créé sur une autre machine va "marcher ici" / se retrouver sur Vercel. Ne concerne QUE la partie site web (tonkine-frontend ou tonkine-au-travail) — ne jamais utiliser ce skill pour tonkine-backend (API Java), qui n'est pas hébergeable sur Vercel.
---

# Déployer le site sur Vercel

## Comprendre le projet avant d'agir

Ce dépôt contient plusieurs dossiers, mais **un seul type de contenu va sur Vercel** : le site web
que les visiteurs voient dans leur navigateur (HTML/CSS/JS, éventuellement React).

| Dossier | Nature | Va sur Vercel ? |
|---|---|---|
| `tonkine-frontend/` | App React + Vite (build via `npm run build`) | Oui |
| `tonkine-au-travail/` | Pages HTML/CSS/JS statiques, sans build | Oui |
| `tonkine-backend/` | API Java Spring Boot + PostgreSQL | **Non** — Vercel ne fait pas tourner de Java. Il faut un hébergeur type Railway, Render ou Fly.io, plus une base de données. |

Si l'utilisateur parle juste de "héberger le site" sans préciser, ne devine pas : demande-lui
clairement lequel des deux dossiers déployables il veut mettre en ligne (`tonkine-frontend` ou
`tonkine-au-travail`). Explique-lui simplement que ce sont deux versions différentes du même
projet — pas la peine d'entrer dans le détail technique React vs statique, l'essentiel est qu'il
choisisse le bon dossier.

Si l'utilisateur mentionne le backend, rappelle-lui simplement que cette partie doit être déployée
ailleurs, et propose de l'aider séparément le moment venu — ne tente jamais de le pousser vers Vercel.

## Un projet Vercel n'est pas lié à une machine

Si l'utilisateur dit avoir déjà créé un projet Vercel sur une autre machine, rassure-le : Vercel est
un service cloud, le projet existe dans son compte, pas sur le disque de l'ancien PC. Il suffit de se
connecter avec le même compte ici et de relier ce dossier au projet existant (voir étape 3). Rien à
recréer.

## Étapes d'exécution

### 1. Vérifier que la CLI Vercel est installée

```
vercel --version
```

Si la commande échoue, propose d'installer la CLI globalement et attends confirmation avant de lancer une installation globale :

```
npm i -g vercel
```

### 2. Vérifier la connexion au compte

```
vercel whoami
```

Si non connecté, lance `vercel login` — cette commande ouvre un flux d'authentification interactif
(navigateur ou email), l'utilisateur doit le compléter lui-même.

### 3. Se placer dans le bon dossier et vérifier le lien au projet

Une fois le dossier cible confirmé (étape "Comprendre le projet"), vérifie s'il est déjà relié à un
projet Vercel :

```
ls .vercel/project.json
```

- Si le fichier **n'existe pas** : lance `vercel link` depuis ce dossier. La CLI demande de manière
  interactive si on veut relier un projet existant ou en créer un nouveau — laisse l'utilisateur
  répondre lui-même dans le prompt (l'utilisateur a indiqué vouloir relier son projet existant créé
  sur l'autre machine, donc guide-le vers l'option "link to existing project" plutôt que "create
  new"). Ne force jamais un nom de projet à sa place.
- Si le fichier **existe déjà** : le dossier est déjà relié, passe à l'étape suivante.

### 4. Paramètres de build (généralement automatiques)

- **tonkine-frontend** : Vercel détecte Vite automatiquement. Build command `npm run build`, dossier
  de sortie `dist`. Pas besoin de configuration manuelle sauf si Vercel ne détecte pas le framework
  correctement.
- **tonkine-au-travail** : site 100 % statique, aucune build command nécessaire — Vercel sert les
  fichiers tels quels.

### 5. Déployer en preview d'abord

```
vercel
```

Cela crée un déploiement de preview (URL temporaire), sans toucher au site en production. Partage
l'URL obtenue à l'utilisateur pour qu'il vérifie que tout fonctionne.

### 6. Passer en production — seulement avec confirmation explicite

`vercel --prod` rend le déploiement visible publiquement à l'URL de production du projet (celle que
les vrais visiteurs utilisent). C'est une action visible par d'autres personnes : **ne jamais la
lancer sans que l'utilisateur ait confirmé explicitement dans la conversation**, même s'il a validé
la preview. Demande simplement : "La preview te convient, je passe en production ?"

```
vercel --prod
```

## Rappels

- Ne jamais tenter de déployer `tonkine-backend/` sur Vercel — ce n'est techniquement pas possible
  (pas de runtime Java) et ça ferait perdre du temps à l'utilisateur.
- Le dossier `.env` du projet contient des secrets (mots de passe DB, JWT) — ne jamais le committer
  ni le pousser vers Vercel. Les variables d'environnement du frontend (ex. `VITE_API_URL` pointant
  vers l'API backend déployée séparément) se configurent dans le dashboard Vercel du projet
  (Settings → Environment Variables), pas dans ce fichier.
- Si le dépôt n'est pas encore un repo git, la CLI Vercel peut déployer directement depuis le disque
  sans avoir besoin de git — ce n'est pas un prérequis pour ce skill.
