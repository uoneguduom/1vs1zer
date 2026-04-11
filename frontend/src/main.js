import * as THREE from "three";
import Game from "./Game";

const scene    = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

// ── DOM ────────────────────────────────────────────────────────────────────

const lobby       = document.getElementById("lobby");
const joinBtn     = document.getElementById("join-btn");
const pseudoInput = document.getElementById("pseudo-input");
const hud         = document.getElementById("hud");
const crosshair   = document.getElementById("crosshair");
const endScreen   = document.getElementById("end-screen");
const endScores   = document.getElementById("end-scores");

// ── Views ──────────────────────────────────────────────────────────────────

function showLobby() {
  lobby.style.display     = "flex";
  hud.style.display       = "none";
  crosshair.style.display = "none";
  endScreen.style.display = "none";
  joinBtn.disabled        = false;
  pseudoInput.value       = "";
  if (document.pointerLockElement) document.exitPointerLock();
}

function showGame() {
  lobby.style.display     = "none";
  hud.style.display       = "block";
  crosshair.style.display = "block";
  endScreen.style.display = "none";
}

function showEndScreen(scores) {
  endScreen.style.display = "flex";
  hud.style.display       = "none";
  crosshair.style.display = "none";
  endScores.innerHTML = [...scores]
    .sort((a, b) => b.kills - a.kills)
    .map(s => `<div>${s.pseudo} — ☠ ${s.kills}</div>`)
    .join("");
  setTimeout(showLobby, 5000);
}

// ── Game ───────────────────────────────────────────────────────────────────

const game = new Game(scene, renderer);

game.onGameEnd = (scores) => {
  game.resetGame();
  showEndScreen(scores);
};

joinBtn.addEventListener("click", () => {
  const pseudo = pseudoInput.value.trim();
  if (!pseudo) return;
  joinBtn.disabled = true;
  game.join(pseudo);
  showGame();
});

pseudoInput.addEventListener("keydown", (e) => {
  if (e.code === "Enter") joinBtn.click();
});

// ── Render loop ────────────────────────────────────────────────────────────

// Viewmodel viewport constants
const VM_W = 700;
const VM_H = 420;

renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();

  if (game.running) {
    game.animate(delta);

    const W = renderer.domElement.width;
    const H = renderer.domElement.height;

    // 1. Main scene — full canvas
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, W, H);
    renderer.render(scene, game.playerCamera.camera);

    // 2. Weapon viewmodel — rendered per viewport (akimbo = left + right)
    if (game.weaponSystem) {
      renderer.setScissorTest(true);
      for (const vp of game.weaponSystem.getViewports()) {
        const x = vp.side === "right" ? W - VM_W : 0;
        renderer.setScissor(x, 0, VM_W, VM_H);
        renderer.setViewport(x, 0, VM_W, VM_H);
        renderer.autoClear = false;
        renderer.clearDepth();
        renderer.render(vp.scene, game.weaponSystem.viewCamera);
      }
      renderer.autoClear = true;
      renderer.setScissorTest(false);
    }
  }
});

showLobby();
