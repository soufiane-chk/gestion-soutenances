# Frontend - Gestion de Soutenances

Application React.js pour la gestion de soutenances de projet d'étudiants.

## Technologies utilisées

- React 18
- React Router DOM
- Axios
- Tailwind CSS
- Vite
- Lucide React (icônes)

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet frontend :

```env
VITE_API_URL=http://localhost:8000/api
```

## Démarrage

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## Build pour production

```bash
npm run build
```

## Structure du projet

```
frontend/
├── src/
│   ├── components/      # Composants réutilisables
│   │   └── Layout/      # Layout principal, Navbar, Sidebar (adapté par rôle)
│   ├── context/         # Contextes React (Auth avec gestion des rôles)
│   ├── pages/           # Pages de l'application
│   │   ├── Admin/       # Pages réservées aux administrateurs
│   │   ├── Login.jsx    # Page de connexion
│   │   ├── Register.jsx # Page d'inscription avec sélection de rôle
│   │   └── Dashboard.jsx # Dashboard adapté selon le rôle
│   ├── services/        # Services API
│   ├── App.jsx          # Composant principal avec routing
│   ├── main.jsx         # Point d'entrée
│   └── index.css        # Styles globaux
├── index.html
├── package.json
└── vite.config.js
```

## Rôles et permissions

- **Admin** : Accès complet à toutes les fonctionnalités + gestion des utilisateurs
- **Professeur** : Gestion des rapports, soutenances et jurys
- **Étudiant** : Consultation et dépôt de ses rapports, suivi de sa soutenance
- **Jury** : Consultation des soutenances assignées

## Fonctionnalités

### Authentification
- **Inscription** : Création de compte avec sélection de rôle (Étudiant, Professeur, Jury)
- **Connexion** : Authentification avec redirection selon le rôle
- **Gestion des rôles** : Système de rôles avec interfaces adaptées

### Interfaces par rôle

#### Administrateur
- Dashboard avec statistiques globales
- Gestion complète des utilisateurs (CRUD)
- Modification des rôles des utilisateurs
- Accès à toutes les fonctionnalités :
  - Gestion des étudiants
  - Gestion des professeurs
  - Gestion des rapports
  - Gestion des soutenances
  - Gestion des jurys

#### Professeur
- Dashboard personnalisé
- Consultation et gestion des rapports
- Gestion des soutenances
- Gestion des jurys

#### Étudiant
- Dashboard personnel
- Dépôt et suivi de ses rapports
- Consultation de sa soutenance
- Informations sur son projet PFE

#### Jury
- Dashboard avec soutenances à évaluer
- Consultation des soutenances assignées
- Gestion des jurys

### Fonctionnalités principales
- Dashboard avec statistiques
- Gestion des étudiants (CRUD)
- Gestion des professeurs (CRUD)
- Gestion des rapports (CRUD avec upload)
- Gestion des soutenances (CRUD)
- Gestion des jurys (CRUD)
- Interface admin pour contrôle des accès et rôles

## API Backend

L'application communique avec le backend Laravel via les endpoints définis dans `src/services/api.js`.

