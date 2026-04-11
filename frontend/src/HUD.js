export default class HUD {
  constructor() {
    this.hp           = document.getElementById("hp");
    this.kills        = document.getElementById("kills");
    this.timer        = document.getElementById("timer");
    this.dashBar      = document.getElementById("dash-bar");
    this.damageInd    = document.getElementById("damage-indicator");
    this.hitmarker    = document.getElementById("hitmarker");
    this.weaponName   = document.getElementById("weapon-name");
    this.leaderboard  = document.getElementById("leaderboard");
    this._timerInterval = null;
    this._labels      = {};
  }

  setHp(value) {
    this.hp.textContent = "❤ " + value;
  }

  setKills(value) {
    this.kills.textContent = "☠ " + value;
  }

  setDashCharge(pct) {
    this.dashBar.style.width = (pct * 100) + "%";
    this.dashBar.style.background = pct >= 1 ? "cyan" : "rgba(0,200,255,0.5)";
  }

  showDamage(amount) {
    this.damageInd.textContent = "-" + amount;
    this.damageInd.style.transition = "none";
    this.damageInd.style.opacity = "1";
    requestAnimationFrame(() => {
      this.damageInd.style.transition = "opacity 2s ease-out";
      this.damageInd.style.opacity = "0";
    });
  }

  showHitmarker() {
    this.hitmarker.style.opacity = "1";
    setTimeout(() => (this.hitmarker.style.opacity = "0"), 100);
  }

  startTimer(startedAt, duration) {
    if (!startedAt || !duration) return;
    this.stopTimer();
    this._timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, duration - elapsed);
      const m = Math.floor(left / 60);
      const s = left % 60;
      this.timer.textContent = `${m}:${String(s).padStart(2, "0")}`;
      if (left <= 0) this.stopTimer();
    }, 500);
  }

  stopTimer() {
    if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
  }

  createLabel(id, pseudo) {
    if (this._labels[id]) return;
    const el = document.createElement("div");
    el.style.cssText = `
      position: fixed; pointer-events: none;
      color: white; font-family: monospace; font-size: 13px; font-weight: bold;
      text-shadow: 0 0 4px black, 0 0 8px black;
      transform: translateX(-50%); white-space: nowrap;
    `;
    el.textContent = pseudo ?? id.slice(0, 6);
    document.body.appendChild(el);
    this._labels[id] = el;
  }

  updateLabel(id, screenX, screenY, visible) {
    const el = this._labels[id];
    if (!el) return;
    el.style.display = visible ? "block" : "none";
    if (visible) {
      el.style.left = screenX + "px";
      el.style.top  = screenY + "px";
    }
  }

  removeLabel(id) {
    if (this._labels[id]) {
      document.body.removeChild(this._labels[id]);
      delete this._labels[id];
    }
  }

  updateLeaderboard(entries) {
    if (!this.leaderboard) return;
    const rows = [...entries]
      .sort((a, b) => b.kills - a.kills)
      .map(e => `<div style="color:${e.color};text-shadow:0 0 6px ${e.color}88">${e.pseudo} <span style="float:right;margin-left:18px">☠ ${e.kills}</span></div>`)
      .join("");
    this.leaderboard.innerHTML = `<div class="lb-title">Kills</div>${rows}`;
  }

  setWeapon(name) {
    if (this.weaponName) this.weaponName.textContent = name.toUpperCase();
  }

  reset() {
    this.setHp(100);
    this.setKills(0);
    this.stopTimer();
    this.timer.textContent = "5:00";
  }
}
