# 1vs1zer

Jeu de tir multijoueur en vue FPS, jouable dans le navigateur. Basé sur Three.js pour le rendu 3D et WebSocket pour le multijoueur en temps réel.

---

## Démarrage rapide

### Prérequis

- [Node.js](https://nodejs.org/) installé sur la machine

### 1. Lancer le backend

```bash
cd backend
npm install
node server.js
```

Le serveur démarre sur le port **3000**.

### 2. Lancer le frontend

Dans un autre terminal :

```bash
cd frontend
npm install
npm start
```

Vite démarre un serveur de développement, généralement sur [http://localhost:5173](http://localhost:5173).

### 3. Jouer

Ouvre le jeu dans **deux onglets ou deux navigateurs différents** (ou sur deux machines du même réseau).  
Saisis un pseudo, clique sur Rejoindre — la partie démarre automatiquement dès que 2 joueurs sont connectés.

> Pour jouer depuis une autre machine sur le réseau local, remplace `localhost` par l'IP de la machine qui héberge le backend.

---

## Structure du projet

```
1vs1zer/
├── backend/
│   ├── server.js        # Serveur WebSocket (Node.js + Express + ws)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── main.js            # Point d'entrée, boucle de rendu Three.js
    │   ├── Game.js            # Logique principale du jeu
    │   ├── Player.js          # Joueur (mouvement, saut, dash, mort, respawn)
    │   ├── WeaponSystem.js    # Système d'armes
    │   ├── BulletSystem.js    # Système de projectiles
    │   ├── CollisionSystem.js # Collisions joueur/map
    │   ├── NetworkManager.js  # Communication WebSocket côté client
    │   ├── Map.js             # Génération et gestion de la map
    │   ├── HUD.js             # Interface (HP, kills, timer, leaderboard)
    │   ├── PlayerCamera.js    # Caméra FPS + pointer lock
    │   ├── Light.js           # Éclairage de la scène
    │   └── config.js          # Constantes globales (gravité, vitesse…)
    ├── public/                # Assets (textures)
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Règles du jeu

- La partie dure **5 minutes**.
- Elle démarre automatiquement dès que **2 joueurs ou plus** sont connectés.
- À chaque mort, le joueur **respawn après 5 secondes** avec une arme aléatoire différente.
- Le joueur avec le plus de **kills** à la fin de la partie gagne.
- Si un joueur quitte et qu'il reste moins de 2 joueurs pendant une partie, la partie se termine immédiatement.

---

## Contrôles

| Touche | Action |
|---|---|
| `Z` / `Q` / `S` / `D` (ou `W/A/S/D`) | Se déplacer |
| `Souris` | Viser |
| `Clic gauche` | Tirer |
| `Espace` | Sauter (double saut possible) |
| `Shift` | Dash dans la direction du mouvement |

> Clique sur le jeu pour activer le **pointer lock** (capture de la souris). Appuie sur `Échap` pour la libérer.

---

## Armes

Les armes sont attribuées **aléatoirement** au début et à chaque mort. Il y en a 10 :

| Arme | Type | Dégâts | Particularité |
|---|---|---|---|
| **Deagle** | Semi-auto | 50 | Puissant, lent |
| **P2000** | Semi-auto | 20 | Pas de cooldown |
| **Revolver** | Semi-auto | 100 | Tire **en arrière** |
| **SMG** | Automatique | 10 | Très rapide |
| **AK** | Automatique | 25 | Bon équilibre |
| **Minigun** | Automatique | 5 | Cadence extrême |
| **FAMAS** | Rafale (3) | 20 | Rafale de 3 balles |
| **Akimbo** | Semi-auto | 15 | Deux pistolets, rafale de 2 |
| **Shotgun** | Semi-auto | 40 | 6 pellets, courte portée |
| **Rocket** | Semi-auto | 50 | Explosion (rayon 3), détruit les blocs |

---

## Stack technique

| Côté | Technologie |
|---|---|
| Frontend | [Three.js](https://threejs.org/) + [Vite](https://vitejs.dev/) |
| Backend | Node.js + [Express](https://expressjs.com/) + [ws](https://github.com/websockets/ws) |
| Réseau | WebSocket (messages JSON) |

### Messages WebSocket

| Type | Direction | Description |
|---|---|---|
| `init` | Serveur → Client | Attribue un ID unique au joueur |
| `join` | Client → Serveur | Rejoindre la partie avec un pseudo |
| `game_start` | Serveur → Client | Démarre la partie (timestamp + durée) |
| `game_end` | Serveur → Client | Fin de partie avec les scores |
| `position` | Client → Serveur | Position du joueur (20 Hz) |
| `shoot` | Client → Serveur | Tir effectué |
| `hit` | Client → Serveur | Impact sur un autre joueur |
| `death` | Client → Serveur | Mort du joueur |
| `explosion` | Client → Serveur | Explosion de roquette |
| `player_left` | Serveur → Client | Un joueur a quitté |
