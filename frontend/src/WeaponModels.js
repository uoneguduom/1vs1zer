import * as THREE from "three";

function mat(color, emissive = 0x000000, emissiveIntensity = 0) {
  return new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity });
}

const METAL  = mat(0x909090);
const DARK   = mat(0x1c1c1c);
const BLACK  = mat(0x0e0e0e);
const GOLD   = mat(0xd4a017, 0x8b6000, 0.5);
const CHROME = mat(0xc8c8e0, 0x4444bb, 0.2);
const ORANGE = mat(0xff5500, 0xcc2200, 0.6);
const WOOD   = mat(0x7a4a1e);
const GREEN  = mat(0x2e4a2e);
const GRAY   = mat(0x555566);
const TAN    = mat(0xb8a070);

function box(w, h, d, material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  return m;
}

function cyl(rt, rb, h, seg, material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  return m;
}

// ── Deagle ─────────────────────────────────────────────────────────────────
// Large, chunky desert eagle. Barrel points toward -Z.
function buildDeagle() {
  const g = new THREE.Group();
  // main slide (top block, runs along Z)
  g.add(box(0.20, 0.16, 0.50, CHROME,  0,  0.08, -0.10));
  // frame/body below slide
  g.add(box(0.18, 0.10, 0.38, METAL,   0,  0.00, -0.06));
  // barrel inside (darker)
  g.add(cyl(0.030, 0.030, 0.46, 10, DARK, 0, 0.08, -0.10, Math.PI/2, 0, 0));
  // muzzle ring
  g.add(cyl(0.038, 0.038, 0.025, 10, DARK, 0, 0.08, -0.335, Math.PI/2, 0, 0));
  // grip
  g.add(box(0.16, 0.28, 0.17, BLACK,   0, -0.18, 0.06));
  // trigger guard
  g.add(box(0.14, 0.04, 0.12, DARK,    0, -0.08, -0.04));
  // rear sight
  g.add(box(0.08, 0.025, 0.018, BLACK,  0, 0.175, 0.06));
  // front sight
  g.add(box(0.020, 0.030, 0.018, BLACK, 0, 0.165, -0.31));
  // hammer
  g.add(box(0.040, 0.060, 0.030, DARK,  0, 0.145, 0.13));
  return g;
}

// ── Single pistol used for Akimbo ──────────────────────────────────────────
function buildAkimboPistol(mirror = false) {
  const g = new THREE.Group();
  // slide
  g.add(box(0.18, 0.13, 0.40, METAL,  0, 0.07, -0.08));
  // frame
  g.add(box(0.16, 0.09, 0.30, GRAY,   0, 0.00, -0.05));
  // barrel
  g.add(cyl(0.025, 0.025, 0.36, 8, DARK, 0, 0.07, -0.08, Math.PI/2, 0, 0));
  // muzzle
  g.add(cyl(0.032, 0.032, 0.018, 8, BLACK, 0, 0.07, -0.27, Math.PI/2, 0, 0));
  // grip
  g.add(box(0.14, 0.24, 0.14, BLACK,  0, -0.15, 0.05));
  // trigger guard
  g.add(box(0.12, 0.035, 0.10, DARK,  0, -0.06, -0.04));
  // mag base
  g.add(box(0.12, 0.020, 0.12, CHROME,0, -0.275, 0.05));
  if (mirror) g.scale.x = -1;
  return g;
}

// ── Minigun ────────────────────────────────────────────────────────────────
function buildMinigun() {
  const g = new THREE.Group();
  // central chassis (box, runs along Z)
  g.add(box(0.18, 0.18, 0.55, DARK,   0,  0.00, -0.05));
  // 6 barrels
  for (let i = 0; i < 6; i++) {
    const a  = (i / 6) * Math.PI * 2;
    const bx = Math.cos(a) * 0.115;
    const by = Math.sin(a) * 0.115;
    g.add(cyl(0.022, 0.022, 0.52, 6, METAL, bx, by, -0.05, Math.PI/2, 0, 0));
    // muzzle cap per barrel
    g.add(cyl(0.028, 0.022, 0.018, 6, CHROME, bx, by, -0.315, Math.PI/2, 0, 0));
  }
  // front ring
  g.add(cyl(0.155, 0.155, 0.030, 12, CHROME, 0, 0, -0.30, Math.PI/2, 0, 0));
  // rear ring
  g.add(cyl(0.155, 0.155, 0.030, 12, CHROME, 0, 0, 0.22, Math.PI/2, 0, 0));
  // motor block at back
  g.add(box(0.22, 0.22, 0.16, GRAY,   0,  0.00, 0.22));
  // handle below
  g.add(box(0.10, 0.28, 0.12, BLACK,  0, -0.22, 0.10));
  // ammo feed on side
  g.add(box(0.10, 0.14, 0.20, ORANGE, 0.20, 0.05, 0.05));
  return g;
}

// ── SMG ────────────────────────────────────────────────────────────────────
function buildSmg() {
  const g = new THREE.Group();
  // receiver (short, compact)
  g.add(box(0.18, 0.14, 0.36, METAL,   0,  0.02, -0.02));
  // barrel (short protrusion)
  g.add(cyl(0.024, 0.024, 0.24, 8, DARK, 0, 0.05, -0.22, Math.PI/2, 0, 0));
  // suppressor
  g.add(cyl(0.035, 0.035, 0.12, 8, GRAY, 0, 0.05, -0.34, Math.PI/2, 0, 0));
  // stock (folded, stub at rear)
  g.add(box(0.08, 0.06, 0.16, DARK,    0, -0.02, 0.18));
  g.add(box(0.08, 0.06, 0.06, DARK,    0,  0.04, 0.26));
  // grip
  g.add(box(0.12, 0.24, 0.10, BLACK,   0, -0.16, 0.05));
  // mag (vertical, below receiver)
  g.add(box(0.08, 0.20, 0.07, DARK,    0, -0.17, -0.08));
  // front grip
  g.add(box(0.09, 0.16, 0.08, BLACK,   0, -0.12, -0.18));
  return g;
}

// ── Shotgun ────────────────────────────────────────────────────────────────
function buildShotgun() {
  const g = new THREE.Group();
  // receiver (wood colored)
  g.add(box(0.18, 0.14, 0.28, WOOD,    0,  0.00,  0.04));
  // double barrel (two side-by-side cylinders)
  g.add(cyl(0.030, 0.030, 0.50, 8, DARK,  -0.045, 0.05, -0.15, Math.PI/2, 0, 0));
  g.add(cyl(0.030, 0.030, 0.50, 8, DARK,   0.045, 0.05, -0.15, Math.PI/2, 0, 0));
  // barrel rib (flat piece between barrels on top)
  g.add(box(0.09, 0.012, 0.50, CHROME,  0, 0.08, -0.15));
  // pump forend
  g.add(box(0.14, 0.08, 0.13, WOOD,    0, 0.00, -0.22));
  // stock
  g.add(box(0.12, 0.10, 0.28, WOOD,    0, -0.02,  0.22));
  // stock butt plate
  g.add(box(0.14, 0.12, 0.025, BLACK,  0, -0.01,  0.365));
  // trigger guard
  g.add(box(0.08, 0.035, 0.12, DARK,   0, -0.06,  0.03));
  // trigger
  g.add(box(0.020, 0.07, 0.018, CHROME,0, -0.04, -0.01));
  return g;
}

// ── P2000 ──────────────────────────────────────────────────────────────────
function buildP2000() {
  const g = new THREE.Group();
  // green polymer frame
  g.add(box(0.16, 0.10, 0.36, GREEN,   0, -0.01, -0.06));
  // chrome slide
  g.add(box(0.14, 0.12, 0.34, CHROME,  0,  0.07, -0.05));
  // barrel
  g.add(cyl(0.022, 0.022, 0.30, 8, DARK, 0, 0.06, -0.05, Math.PI/2, 0, 0));
  // muzzle
  g.add(cyl(0.028, 0.028, 0.018, 8, DARK, 0, 0.06, -0.22, Math.PI/2, 0, 0));
  // grip
  g.add(box(0.14, 0.22, 0.12, GREEN,   0, -0.14,  0.04));
  // rail under barrel
  g.add(box(0.10, 0.030, 0.24, DARK,   0, -0.02, -0.08));
  // trigger guard
  g.add(box(0.12, 0.035, 0.12, GREEN,  0, -0.06, -0.03));
  // rear sight
  g.add(box(0.06, 0.020, 0.016, BLACK, 0, 0.135,  0.08));
  return g;
}

// ── AK ─────────────────────────────────────────────────────────────────────
function buildAk() {
  const g = new THREE.Group();
  // receiver (metal)
  g.add(box(0.18, 0.12, 0.44, METAL,   0,  0.02, -0.02));
  // barrel
  g.add(cyl(0.024, 0.024, 0.38, 8, DARK, 0, 0.05, -0.22, Math.PI/2, 0, 0));
  // gas tube (thinner, above barrel)
  g.add(cyl(0.014, 0.014, 0.28, 6, METAL, 0, 0.10, -0.16, Math.PI/2, 0, 0));
  // wooden handguard
  g.add(box(0.12, 0.07, 0.20, WOOD,    0,  0.01, -0.17));
  // wooden stock
  g.add(box(0.10, 0.08, 0.30, WOOD,    0, -0.01,  0.23));
  // stock butt
  g.add(box(0.12, 0.10, 0.025, WOOD,   0,  0.00,  0.39));
  // curved mag (big and distinctive)
  g.add(box(0.09, 0.20, 0.08, DARK,   -0.010, -0.15, -0.05));
  g.add(box(0.08, 0.08, 0.09, DARK,   -0.014, -0.26, -0.09)); // curve bottom
  // pistol grip
  g.add(box(0.10, 0.20, 0.10, WOOD,    0, -0.14,  0.07));
  // dust cover
  g.add(box(0.14, 0.035, 0.28, DARK,   0,  0.075, -0.05));
  return g;
}

// ── FAMAS ──────────────────────────────────────────────────────────────────
function buildFamas() {
  const g = new THREE.Group();
  // bullpup body (long, goes far back)
  g.add(box(0.18, 0.14, 0.52, mat(0x8a9a88),  0,  0.01,  0.04));
  // carry handle on top (very distinctive)
  g.add(box(0.06, 0.10, 0.42, mat(0x6a7a68),  0,  0.13, -0.01));
  // barrel (protrudes forward a lot)
  g.add(cyl(0.020, 0.020, 0.44, 8, DARK,      0,  0.06, -0.18, Math.PI/2, 0, 0));
  // muzzle brake
  g.add(box(0.05, 0.05, 0.06, DARK,            0,  0.06, -0.40));
  // mag (center-body, underneath)
  g.add(box(0.08, 0.17, 0.07, DARK,            0, -0.10,  0.03));
  // pistol grip
  g.add(box(0.10, 0.20, 0.10, BLACK,           0, -0.14, -0.08));
  // front grip (under barrel)
  g.add(box(0.08, 0.14, 0.08, BLACK,           0, -0.09, -0.22));
  // bipod feet
  g.add(box(0.15, 0.008, 0.006, DARK,          0, -0.01, -0.40));
  return g;
}

// ── Rocket launcher ────────────────────────────────────────────────────────
function buildRocket() {
  const g = new THREE.Group();
  // main tube (wide!)
  g.add(cyl(0.095, 0.095, 0.64, 14, GREEN,    0,  0.00, -0.06, Math.PI/2, 0, 0));
  // front opening (slightly wider, dark)
  g.add(cyl(0.10, 0.095, 0.025, 14, DARK,     0,  0.00, -0.385, Math.PI/2, 0, 0));
  // rear exhaust bell (flares out)
  g.add(cyl(0.095, 0.130, 0.07, 14, DARK,     0,  0.00,  0.335, Math.PI/2, 0, 0));
  // sight rail on top
  g.add(box(0.035, 0.040, 0.40, DARK,         0,  0.12,  0.00));
  // front sight post
  g.add(box(0.015, 0.06, 0.015, CHROME,       0,  0.15, -0.28));
  // rear sight
  g.add(box(0.08, 0.025, 0.018, DARK,         0,  0.14,  0.10));
  // pistol grip
  g.add(box(0.12, 0.28, 0.12, BLACK,          0, -0.18,  0.08));
  // shoulder pad
  g.add(box(0.12, 0.10, 0.18, mat(0x2e3e2e),  0, -0.06,  0.32));
  // warning stripe orange
  g.add(box(0.096, 0.018, 0.018, ORANGE,      0,  0.00, -0.18));
  return g;
}

// ── Revolver ───────────────────────────────────────────────────────────────
function buildRevolver() {
  const g = new THREE.Group();
  // frame
  g.add(box(0.16, 0.18, 0.38, METAL,   0,  0.01, -0.04));
  // long barrel (very distinctive)
  g.add(cyl(0.026, 0.026, 0.44, 8, DARK,  0, 0.07, -0.20, Math.PI/2, 0, 0));
  // barrel top rib
  g.add(box(0.025, 0.020, 0.44, DARK,   0, 0.10, -0.20));
  // front sight
  g.add(box(0.012, 0.04, 0.012, BLACK,  0, 0.115, -0.42));
  // ejector rod under barrel
  g.add(cyl(0.012, 0.012, 0.30, 6, METAL, 0, 0.02, -0.16, Math.PI/2, 0, 0));
  // cylinder (big and visible, to the side)
  g.add(cyl(0.065, 0.065, 0.09, 14, CHROME, 0, 0.00, 0.02, 0, 0, Math.PI/2));
  // cylinder chambers
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    g.add(cyl(0.014, 0.014, 0.092, 6, GOLD,
      Math.cos(a) * 0.038, 0.00 + Math.sin(a) * 0.038, 0.02, 0, 0, Math.PI/2));
  }
  // ivory grip
  g.add(box(0.12, 0.24, 0.10, TAN,     0, -0.16,  0.07));
  // hammer
  g.add(box(0.030, 0.07, 0.04, DARK,   0,  0.12,  0.13));
  // trigger guard
  g.add(box(0.09, 0.04, 0.12, DARK,    0, -0.07, -0.03));
  return g;
}

// ── Registry ───────────────────────────────────────────────────────────────

const BUILDERS = {
  deagle:         buildDeagle,
  minigun:        buildMinigun,
  akimbo:         () => buildAkimboPistol(false),
  akimbo_left:    () => buildAkimboPistol(true),
  smg:            buildSmg,
  shotgun:        buildShotgun,
  p2000:          buildP2000,
  ak:             buildAk,
  famas:          buildFamas,
  rocket:         buildRocket,
  revolver:       buildRevolver,
};

export function buildWeaponModel(name) {
  const builder = BUILDERS[name];
  if (!builder) {
    console.warn("buildWeaponModel: unknown weapon", name);
    return new THREE.Group();
  }
  return builder();
}
