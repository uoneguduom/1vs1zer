const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map(); // id -> { ws, pseudo, kills }
let gameState    = "waiting";
let gameTimer    = null;
let gameStartedAt = null;
const GAME_DURATION = 300;

function broadcastAll(data) {
  const msg = JSON.stringify(data);
  for (const client of clients.values())
    if (client.ws.readyState === 1) client.ws.send(msg);
}

function broadcast(data, excludeId) {
  const msg = JSON.stringify(data);
  for (const [cid, client] of clients)
    if (cid !== excludeId && client.ws.readyState === 1) client.ws.send(msg);
}

function readyPlayers() {
  return Array.from(clients.entries()).filter(([, c]) => c.pseudo !== null);
}

function tryStartGame() {
  if (gameState !== "waiting") return;
  if (readyPlayers().length < 2) return;
  gameState     = "playing";
  gameStartedAt = Date.now();
  const players = readyPlayers().map(([id, c]) => ({ id, pseudo: c.pseudo }));
  broadcastAll({ type: "game_start", players, duration: GAME_DURATION, startedAt: gameStartedAt });
  gameTimer = setTimeout(endGame, GAME_DURATION * 1000);
}

function endGame() {
  if (gameTimer) { clearTimeout(gameTimer); gameTimer = null; }
  gameState     = "waiting";
  gameStartedAt = null;
  const scores  = readyPlayers().map(([id, c]) => ({ id, pseudo: c.pseudo, kills: c.kills }));
  broadcastAll({ type: "game_end", scores });
  for (const c of clients.values()) c.kills = 0;
}

wss.on("connection", (ws) => {
  const id = crypto.randomUUID();
  clients.set(id, { ws, pseudo: null, kills: 0 });
  ws.send(JSON.stringify({ type: "init", id }));

  ws.on("message", (data) => {
    const msg = JSON.parse(data);

    if (msg.type === "join") {
      clients.get(id).pseudo = msg.pseudo;
      if (gameState === "playing") {
        ws.send(JSON.stringify({ type: "game_start", duration: GAME_DURATION, startedAt: gameStartedAt }));
      } else {
        tryStartGame();
      }
      return;
    }

    if (!clients.get(id)?.pseudo) return;

    if (msg.type === "death" && msg.killerId && clients.has(msg.killerId)) {
      clients.get(msg.killerId).kills++;
    }

    broadcast(msg, id);
  });

  ws.on("close", () => {
    const hadPseudo = clients.get(id)?.pseudo !== null;
    clients.delete(id);
    if (hadPseudo) {
      broadcast({ type: "player_left", id });
      if (gameState === "playing" && readyPlayers().length < 2) endGame();
    }
  });
});

server.listen(3000, "0.0.0.0", () => console.log("Server on port 3000"));
