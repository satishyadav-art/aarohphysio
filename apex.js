// APEX PHYSIOTHERAPY — app.js
// GSAP and ScrollTrigger are loaded via CDN in index.html before this script

gsap.registerPlugin(ScrollTrigger);

/* ─── TEAM DATA ─────────────────────────── */
const DOCTORS = [
  { id:'ryan', name:'Ryan Cole', specialty:'Founder & Lead Physiotherapist', color:'#3a9e40',
    img:'assets/images/team-ryan.webp', thumb:'assets/images/team-ryan-thumb.webp', years:10,
    action:'assets/images/team-ryan.webp', edu:'B.Sc. Physiotherapy · Return to Sport Specialist', cases:'600+ patients treated',
    stats:{precision:97,technique:95,experience:92},
    quote:'It\'s not the calendar that decides when you return — it\'s your readiness.',
    treatments:['Return to Sport','ACL Rehab','Manual Therapy'] },
  { id:'sophie', name:'Sophie Chen', specialty:'Physiotherapist', color:'#5ab45f',
    img:'assets/images/team-laura.webp', thumb:'assets/images/team-laura-thumb.webp', years:6,
    action:'assets/images/team-laura.webp', edu:'B.Sc. Physiotherapy · Orthopaedic Manual Therapy', cases:'380+ patients treated',
    stats:{precision:94,technique:93,experience:87},
    quote:'Every patient gets 60 minutes and 100% of my attention. That\'s not a promise — it\'s how we work.',
    treatments:['Manual Therapy','Shoulder & Neck','Post-OP Rehab'] },
  { id:'alex', name:'Alex Turner', specialty:'Sports Physiotherapist', color:'#4fbf68',
    img:'assets/images/team-marc.webp', thumb:'assets/images/team-marc-thumb.webp', years:7,
    action:'assets/images/team-marc.webp', edu:'B.Sc. Physiotherapy · Certified Sports Physiotherapist', cases:'420+ patients treated',
    stats:{precision:95,technique:96,experience:89},
    quote:'Sport after injury isn\'t a risk when the path is structured.',
    treatments:['Sports Physio','Strength & Plyometrics','Knee Rehab'] }
];

/* ─── HELPER ──────────────────────────────── */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

/* ─── ECHOES-STYLE CHARACTER SELECT ─────────── */
const CS_DOCTORS = DOCTORS.map((d, i) => ({
  ...d,
  mapPos: [{x:20,y:20},{x:50,y:10},{x:78,y:55}][i],
  hHeight: ['94%','96%','92%'][i],
  groundOffset: ['0%','4%','0%'][i],
  hX: 50,
  bio: [
    'Ryan is the founder of APEX and specialises in criterion-based return-to-sport rehabilitation. He has guided 600+ patients back to full performance after sports injuries — stronger than before.',
    'Sophie is an expert in orthopaedic manual therapy, focusing on shoulder, neck, and spinal conditions with a structured, active treatment approach.',
    'Alex is a certified sports physiotherapist specialising in functional training and plyometrics for athletes. He guides patients through knee and lower-limb rehabilitation back into sport.'
  ][i]
}));

/* ─── CS CROP SYSTEM ──── */
const CS_ORIG = [
  { w:1024, h:1600, src:'assets/images/team-ryan.webp', out:'assets/images/team-ryan.webp' },
  { w:1024, h:1600, src:'assets/images/team-laura.webp',   out:'assets/images/team-laura.webp' },
  { w:1024, h:1600, src:'assets/images/team-marc.webp',    out:'assets/images/team-marc.webp' },
];
const CS_CROP_DEFAULT = [1.0, 1.0, 1.0];
const CS_ZOOM_DEFAULT = [1.0, 1.0, 1.0];
let csCropFracs = (() => {
  try { const s = localStorage.getItem('apex-cs-crops'); return s ? JSON.parse(s) : CS_CROP_DEFAULT.slice(); }
  catch(e) { return CS_CROP_DEFAULT.slice(); }
})();
let csZoomFracs = (() => {
  try { const s = localStorage.getItem('apex-cs-zooms'); return s ? JSON.parse(s) : CS_ZOOM_DEFAULT.slice(); }
  catch(e) { return CS_ZOOM_DEFAULT.slice(); }
})();
function csCropApply() {
  csCharEls.forEach((el, i) => {
    el.style.clipPath = `inset(0 0 ${((1 - csCropFracs[i]) * 100).toFixed(2)}% 0)`;
  });
}
function csZoomApply() {
  csCharEls.forEach((el, i) => {
    const img = el.querySelector('img');
    if (img) { img.style.transform = `scale(${csZoomFracs[i]})`; img.style.transformOrigin = 'top center'; }
  });
}

const csStage = document.getElementById('cs-stage');
const csCharEls = [], csHotspotEls = [], csHudEntries = [];
let csActive = 0; // Lukas default
let csPrevActive = -1;
let csAnimating = false;

// build chars + hotspots
CS_DOCTORS.forEach((d, i) => {
  const el = document.createElement('div');
  el.className = 'char-item';
  el.innerHTML = `
    <img src="${d.img}" alt="${d.name}"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
    <div class="char-fallback" style="color:${d.color}">${d.name.split(' ').slice(-1)[0][0]}</div>
  `;
  el.addEventListener('click', () => {
    if (csAnimating) return;
    i === csActive ? openDoctorStory() : csGoTo(i);
  });
  csStage.appendChild(el);
  csCharEls.push(el);

  // hotspot
  const hs = document.createElement('div');
  hs.className = 'hotspot';
  hs.style.setProperty('--spot-color', d.color);
  hs.style.left = d.mapPos.x + '%';
  hs.style.top  = d.mapPos.y + '%';
  hs.innerHTML  = `<div class="hotspot-ring"></div><div class="hotspot-dot"></div><div class="hotspot-label">${d.name.split(' ').slice(-1)[0]}</div>`;
  hs.addEventListener('click', () => { if (!csAnimating) csGoTo(i); });
  csStage.appendChild(hs);
  csHotspotEls.push(hs);
});

// build HUD
const hudEl = document.getElementById('doctor-hud');
CS_DOCTORS.forEach((d, i) => {
  const entry = document.createElement('div');
  entry.className = 'hud-entry';
  entry.style.setProperty('--hud-color', d.color);
  entry.innerHTML = `<img class="hud-thumb" src="${d.thumb}" alt="${d.name}" loading="lazy" onerror="this.style.visibility='hidden'"><div class="hud-meta"><div class="hud-name">${d.name.split(' ').slice(-1)[0]}</div><div class="hud-spec">${d.specialty}</div></div>`;
  entry.addEventListener('click', () => { if (!csAnimating) csGoTo(i); });
  hudEl.appendChild(entry);
  csHudEntries.push(entry);
});

// ── Variant-aware character layout ───────────────────────────
// v1 single+rail | v2 3D coverflow | v3 elliptical orbit | v4 team lineup
let csVariant = localStorage.getItem('apex-cv') || 'v4';

function csComputeProps(v, i) {
  const N = CS_DOCTORS.length; let rel = i - csActive; if (rel > Math.floor(N/2)) rel -= N; if (rel < -Math.floor(N/2)) rel += N;
  const a = Math.abs(rel);
  // MOBILE (≤640px): active = big & solid & grounded; ALL neighbours = equal small size + ghosted.
  // Grounding handled in CSS (object-position:bottom + max-width:none, no letterbox float).
  if (typeof window !== 'undefined' && window.matchMedia('(max-width:640px)').matches) {
    // Atlas doctor images are near-square BUST crops (person fills frame) → smaller heights than Ivory
    return { left: 50 + rel*30, bottom: 0, height: a===0 ? 62 : 40,
      scale: 1, rotY: 0, opacity: a>2 ? 0 : (a===0 ? 1 : (a===1 ? 0.6 : 0.4)),
      z: 30 - a*8, filter: a===0 ? 'none' : `brightness(${a===1 ? 0.55 : 0.42})` };
  }
  if (v === 'v3') { // elliptical orbit — back ones lift up & shrink (solid, no tilt)
    return { left: 50 + rel*23, bottom: a*a*4.5, height: 102 - a*a*9,
      scale: 1 - a*0.26, rotY: 0, opacity: a>2 ? 0 : (a<=1 ? 1 : 0.8),
      z: 30 - a*8, filter: a===0 ? 'none' : `brightness(${a===1 ? 0.7 : 0.5})` };
  }
  // v4+ — height-based grounded lineup, exact Ivory settings
  if (v === 'v4' || v === 'v5' || v === 'v6' || v === 'v7' || v === 'v8' || v === 'v9' || v === 'v10') {
    const dim = a === 0 ? 'none' : `brightness(${a === 1 ? 0.20 : 0.09})`;
    return { left: 50 + rel*34, bottom: 0, height: a===0 ? 83 : (a===1 ? 60 : 48),
      scale: 1, rotY: 0, opacity: a>2 ? 0 : (a<=1 ? 1 : 0.82),
      z: 30 - a*8, filter: dim };
  }
  // v1 + v2 — single featured doctor, centered
  return rel === 0
    ? { left:50, bottom:0, height:90, scale:1, rotY:0, opacity:1, z:10, filter:'none' }
    : { left:50, bottom:0, height:90, scale:1, rotY:0, opacity:0, z:1,  filter:'none' };
}

function csLayout(animate) {
  CS_DOCTORS.forEach((d, i) => {
    const el = csCharEls[i];
    const p = csComputeProps(csVariant, i);
    const t = {
      left: p.left + '%', bottom: p.bottom + '%', height: p.height + '%',
      xPercent: -50, scale: p.scale, rotationY: p.rotY, opacity: p.opacity,
      zIndex: p.z, filter: p.filter, transformPerspective: 1200,
      transformOrigin: 'bottom center', pointerEvents: p.opacity > 0.15 ? 'auto' : 'none'
    };
    animate ? gsap.to(el, { ...t, duration: 0.7, ease: 'power3.out' }) : gsap.set(el, t);
  });
  csCropApply();
  csZoomApply();
}

function csUpdateUI(idx) {
  const d = CS_DOCTORS[idx];
  document.getElementById('cs-doc-specialty').textContent = d.specialty;
  document.getElementById('cs-doc-specialty').style.color = d.color;
  document.getElementById('cs-doc-name').textContent = d.name;
  document.getElementById('cs-doc-bio').textContent = d.bio;
  document.getElementById('cs-stat-pre').style.width = d.stats.precision+'%';
  document.getElementById('cs-stat-pre-val').textContent = d.stats.precision;
  document.getElementById('cs-stat-tec').style.width = d.stats.technique+'%';
  document.getElementById('cs-stat-tec-val').textContent = d.stats.technique;
  document.getElementById('cs-stat-exp').style.width = d.stats.experience+'%';
  document.getElementById('cs-stat-exp-val').textContent = d.stats.experience;
  document.getElementById('cs-stat-pre').style.background = d.color;
  document.getElementById('cs-stat-tec').style.background = d.color;
  document.getElementById('cs-stat-exp').style.background = d.color;
  document.getElementById('cs-book-btn').style.borderColor = d.color;
  document.getElementById('cs-book-btn').style.color = d.color;
  document.getElementById('cs-counter-num').textContent = String(idx+1).padStart(2,'0'); document.getElementById('cs-counter-total').textContent = String(CS_DOCTORS.length).padStart(2,'0');
  csHudEntries.forEach((e, i) => e.classList.toggle('active', i === idx));
  // update accent color for the stage elements
  csStage.style.setProperty('--accent', d.color);
}

function csGoTo(target) {
  const n = CS_DOCTORS.length; const t = ((target % n) + n) % n;
  if (csAnimating || t === csActive) return;
  csAnimating = true;
  csPrevActive = csActive;
  csActive = t;
  if (typeof csSwitchFx === 'function') csSwitchFx(t);
  const infoEls = ['#cs-doc-specialty', '#cs-doc-name', '#cs-doc-bio', '#cs-doc-stats', '#cs-book-btn'];
  gsap.to(infoEls, {opacity: 0, y: -8, duration: .18, ease: 'power2.in', onComplete: () => {
    csUpdateUI(t);
    gsap.fromTo(infoEls, {opacity: 0, y: 8}, {opacity: 1, y: 0, stagger: .06, duration: .42, ease: 'power3.out'});
  }});
  csLayout(true);
  setTimeout(() => { csAnimating = false; }, 820);
}

function csSyncAll() { csLayout(false); }

// story panel
const csStoryPanel = document.getElementById('cs-story-panel');
const csStoryOverlay = document.getElementById('cs-story-overlay');
gsap.set(csStoryPanel, {x: '-100%'});

function openDoctorStory() {
  const d = CS_DOCTORS[csActive];
  document.getElementById('cs-story-img').src = d.action || d.img;
  document.getElementById('cs-story-specialty').textContent = d.specialty;
  document.getElementById('cs-story-specialty').style.color = d.color;
  document.getElementById('cs-story-name').textContent = d.name;
  const yrs = document.getElementById('cs-story-years');
  yrs.textContent = d.years + ' Years'; yrs.style.color = d.color;
  document.getElementById('cs-story-edu').textContent = d.edu || '';
  document.getElementById('cs-story-quote').textContent = '“' + d.quote + '”';
  document.getElementById('cs-story-bio').textContent = d.bio;
  document.getElementById('cs-story-cases').textContent = d.cases || '';
  document.getElementById('cs-story-treatments').innerHTML =
    (d.treatments || []).map(t => `<span class="cs-treat-tag">${t}</span>`).join('');
  csStoryPanel.style.setProperty('--doc', d.color);
  ['pre','tec','exp'].forEach((k, i) => {
    const val = [d.stats.precision, d.stats.technique, d.stats.experience][i];
    const fill = document.getElementById('cs-st-'+k);
    fill.style.width = '0%'; fill.style.background = d.color;
    document.getElementById('cs-st-'+k+'-val').textContent = val;
    document.getElementById('cs-st-'+k+'-val').style.color = d.color;
    setTimeout(() => { fill.style.width = val+'%'; }, 350 + i*120);
  });
  document.getElementById('cs-story-body').scrollTop = 0;
  gsap.fromTo('#cs-story-img', {scale: 1.08}, {scale: 1, duration: 1.1, ease: 'power3.out'});
  gsap.to(csStoryPanel, {x: 0, duration: .55, ease: 'power3.out'});
  csStoryOverlay.classList.add('active');
}
window.closeDoctorStory = function() {
  gsap.to(csStoryPanel, {x: '-100%', duration: .4, ease: 'power3.in'});
  csStoryOverlay.classList.remove('active');
};

// arrows + keyboard
document.getElementById('cs-btn-next').addEventListener('click', () => csGoTo(csActive+1));
document.getElementById('cs-btn-prev').addEventListener('click', () => csGoTo(csActive-1));
// mobile "tap for full profile" hint → opens the active doctor's story panel
var csHintEl = document.getElementById('cs-mobile-hint');
if (csHintEl) csHintEl.addEventListener('click', function(e){ e.stopPropagation(); openDoctorStory(); });
// mobile: swipe left / right to change specialist
var csTouchX = null, csTouchY = null;
csStage.addEventListener('touchstart', function(e){ csTouchX = e.touches[0].clientX; csTouchY = e.touches[0].clientY; }, { passive: true });
csStage.addEventListener('touchend', function(e){
  if (csTouchX === null) return;
  var dx = e.changedTouches[0].clientX - csTouchX;
  var dy = e.changedTouches[0].clientY - csTouchY;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4 && !csAnimating) {
    csGoTo(csActive + (dx < 0 ? 1 : -1)); // swipe left → next, right → previous
  }
  csTouchX = null; csTouchY = null;
}, { passive: true });
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') csGoTo(csActive+1);
  if (e.key === 'ArrowLeft')  csGoTo(csActive-1);
  if (e.key === 'Escape') closeDoctorStory();
  if (e.key === 'd' || e.key === 'D') csDevToggle();
});

// init CS
const csSectionEl = document.getElementById('character-select');
csSectionEl.dataset.cv = csVariant;
csUpdateUI(csActive);
csSyncAll();
gsap.set(['#cs-doc-specialty','#cs-doc-name','#cs-doc-bio','#cs-doc-stats','#cs-book-btn'], {opacity: 1, y: 0});

/* ─── CS DEV PANEL (Crop + Zoom live) ─────────── */
let csDevOpen = false;
const csDevPanel = (() => {
  const panel = document.createElement('div');
  panel.id = 'cs-dev-panel';
  panel.style.cssText = [
    'display:none','position:fixed','bottom:0','left:0','right:0','z-index:9999',
    'background:rgba(6,6,6,0.97)','border-top:2px solid #5FB8E6',
    'padding:12px 20px 18px','font-family:system-ui,sans-serif'
  ].join(';');

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:10px;';
  header.innerHTML = `
    <span style="color:#5FB8E6;font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:bold;">&#9881;&#65039; CROP + ZOOM &#8212; D = schlie&szlig;en</span>
    <button id="cs-dev-save" style="margin-left:auto;background:#22c55e;color:#000;border:none;border-radius:4px;padding:4px 14px;font-size:0.7rem;font-weight:bold;cursor:pointer;">Speichern</button>
    <button id="cs-dev-copy" style="background:#5FB8E6;color:#000;border:none;border-radius:4px;padding:4px 14px;font-size:0.7rem;font-weight:bold;cursor:pointer;">sips-Befehle</button>
  `;
  panel.appendChild(header);

  const grid = document.createElement('div');
  grid.style.cssText = 'display:flex;gap:20px;flex-wrap:wrap;';
  panel.appendChild(grid);

  CS_DOCTORS.forEach((d, i) => {
    const o = CS_ORIG[i];
    const col = document.createElement('div');
    col.style.cssText = 'flex:1;min-width:140px;display:flex;flex-direction:column;gap:3px;';

    const name = document.createElement('div');
    name.style.cssText = 'color:#aaa;font-size:0.58rem;text-transform:uppercase;letter-spacing:0.1em;font-weight:bold;margin-bottom:2px;';
    name.textContent = d.name.split(' ').pop();

    // CROP
    const cropLbl = document.createElement('div');
    cropLbl.style.cssText = 'color:#666;font-size:0.55rem;';
    cropLbl.textContent = 'Crop (unten abschneiden)';

    const cropSlider = document.createElement('input');
    cropSlider.type = 'range'; cropSlider.min = '40'; cropSlider.max = '100'; cropSlider.step = '1';
    cropSlider.value = Math.round(csCropFracs[i] * 100);
    cropSlider.style.cssText = 'width:100%;accent-color:#ef4444;cursor:pointer;';

    const cropVal = document.createElement('div');
    cropVal.style.cssText = 'color:#ef4444;font-size:0.65rem;font-weight:bold;font-variant-numeric:tabular-nums;';

    function refreshCrop() {
      csCropFracs[i] = parseInt(cropSlider.value) / 100;
      const pxH = Math.round(o.h * csCropFracs[i]);
      cropVal.textContent = cropSlider.value + '% · ' + pxH + 'px';
      csCropApply();
    }
    cropSlider.addEventListener('input', refreshCrop);
    refreshCrop();

    // ZOOM
    const zoomLbl = document.createElement('div');
    zoomLbl.style.cssText = 'color:#666;font-size:0.55rem;margin-top:5px;';
    zoomLbl.textContent = 'Zoom (Figur vergrößern)';

    const zoomSlider = document.createElement('input');
    zoomSlider.type = 'range'; zoomSlider.min = '70'; zoomSlider.max = '200'; zoomSlider.step = '5';
    zoomSlider.value = Math.round(csZoomFracs[i] * 100);
    zoomSlider.style.cssText = 'width:100%;accent-color:#5FB8E6;cursor:pointer;';

    const zoomVal = document.createElement('div');
    zoomVal.style.cssText = 'color:#5FB8E6;font-size:0.65rem;font-weight:bold;font-variant-numeric:tabular-nums;';

    function refreshZoom() {
      csZoomFracs[i] = parseInt(zoomSlider.value) / 100;
      zoomVal.textContent = zoomSlider.value + '%';
      csZoomApply();
    }
    zoomSlider.addEventListener('input', refreshZoom);
    refreshZoom();

    // Reset
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.style.cssText = 'background:none;border:1px solid #2a2a2a;color:#444;border-radius:3px;padding:2px 8px;font-size:0.55rem;cursor:pointer;align-self:flex-start;margin-top:4px;';
    resetBtn.addEventListener('click', () => {
      cropSlider.value = Math.round(CS_CROP_DEFAULT[i] * 100); refreshCrop();
      zoomSlider.value = 100; refreshZoom();
    });

    col.append(name, cropLbl, cropSlider, cropVal, zoomLbl, zoomSlider, zoomVal, resetBtn);
    grid.appendChild(col);
  });

  panel.querySelector('#cs-dev-save').addEventListener('click', () => {
    localStorage.setItem('apex-cs-crops', JSON.stringify(csCropFracs));
    localStorage.setItem('apex-cs-zooms', JSON.stringify(csZoomFracs));
    const btn = panel.querySelector('#cs-dev-save');
    btn.textContent = 'Gespeichert!';
    setTimeout(() => { btn.textContent = 'Speichern'; }, 2000);
  });

  panel.querySelector('#cs-dev-copy').addEventListener('click', () => {
    localStorage.setItem('apex-cs-crops', JSON.stringify(csCropFracs));
    localStorage.setItem('apex-cs-zooms', JSON.stringify(csZoomFracs));
    const lines = CS_DOCTORS.map((d, i) => {
      const o = CS_ORIG[i];
      const keptH = Math.round(o.h * csCropFracs[i]);
      return '# ' + d.name.split(' ').pop() + ' (zoom ' + Math.round(csZoomFracs[i]*100) + '%, crop ' + keptH + 'px)\nsips --cropToHeightWidth ' + keptH + ' ' + o.w + ' --cropOffset 0 0 "' + o.src + '" --out "' + o.out + '"';
    });
    navigator.clipboard.writeText('#!/bin/bash\ncd ~/Projects/atlas-orthopaedie\n\n' + lines.join('\n\n'));
    const btn = panel.querySelector('#cs-dev-copy');
    btn.textContent = 'Kopiert!'; btn.style.background = '#22c55e';
    setTimeout(() => { btn.textContent = 'sips-Befehle'; btn.style.background = '#5FB8E6'; }, 2500);
  });

  document.body.appendChild(panel);
  return panel;
})();

function csDevToggle() {
  csDevOpen = !csDevOpen;
  csDevPanel.style.display = csDevOpen ? 'block' : 'none';
}

// Character-select layout switcher (V1–V4)
document.querySelectorAll('#cs-vsw .vsw-btn').forEach(btn => {
  btn.classList.toggle('active', btn.dataset.cv === csVariant);
  btn.addEventListener('click', () => {
    if (csAnimating) return;
    csVariant = btn.dataset.cv;
    csSectionEl.dataset.cv = csVariant;
    document.querySelectorAll('#cs-vsw .vsw-btn').forEach(b => b.classList.toggle('active', b === btn));
    localStorage.setItem('apex-cv', csVariant);
    csLayout(true);
    applyVariantEffects();
  });
});

/* ─── Character-Select V5–V10 effect layers (additive; V1–V4 untouched) ─── */
const csSpot = document.createElement('div'); csSpot.id = 'cs-spotlight'; csStage.appendChild(csSpot);
const csAura = document.createElement('div'); csAura.id = 'cs-aura';
for (let i = 0; i < 14; i++) { const p = document.createElement('span'); p.className = 'cs-aura-p'; p.style.setProperty('--i', i); csAura.appendChild(p); }
csStage.appendChild(csAura);

function csSwitchFx(t) {
  if (csVariant === 'v7' || csVariant === 'v5') {           // holographic scan-in
    const el = csCharEls[t];
    if (el) { el.classList.remove('cs-holo'); void el.offsetWidth; el.classList.add('cs-holo');
      setTimeout(() => el.classList.remove('cs-holo'), 900); }
  }
  if (csVariant === 'v10') {                                 // cinematic motion-blur flash
    csStage.classList.add('cs-mblur');
    setTimeout(() => csStage.classList.remove('cs-mblur'), 600);
  }
}

let csOrbit = null, csHover = false;
csStage.addEventListener('pointerenter', () => { csHover = true; });
csStage.addEventListener('pointerleave', () => { csHover = false; });
function startOrbit() {
  stopOrbit();
  csOrbit = setInterval(() => {
    if (csVariant === 'v10' && !csAnimating && !csHover && document.visibilityState === 'visible') csGoTo(csActive + 1);
  }, 3600);
}
function stopOrbit() { if (csOrbit) { clearInterval(csOrbit); csOrbit = null; } }

window.addEventListener('pointermove', (e) => {                // parallax depth (v9)
  if (csVariant !== 'v9') return;
  const px = (e.clientX / window.innerWidth - 0.5), py = (e.clientY / window.innerHeight - 0.5);
  gsap.to(csStage, { x: -px * 26, y: -py * 14, duration: .6, ease: 'power2.out' });
  const bg = document.getElementById('cs-stage-bg');
  if (bg) gsap.to(bg, { x: px * 46, y: py * 26, scale: 1.06, duration: .8, ease: 'power2.out' });
});

function applyVariantEffects() {
  if (csVariant !== 'v9') {                                   // reset parallax transforms
    gsap.to(csStage, { x: 0, y: 0, duration: .4 });
    const bg = document.getElementById('cs-stage-bg');
    if (bg) gsap.to(bg, { x: 0, y: 0, scale: 1, duration: .4 });
  }
  if (csVariant === 'v10') startOrbit(); else stopOrbit();
}
applyVariantEffects();

/* ── Journey V7 spotlight auto-cycle ── */
(function() {
  const jSection = document.getElementById('journey');
  if (!jSection) return;
  let jSpotIdx = 0, jSpotTimer = null;
  function jSpotRun() {
    if (jSection.dataset.v !== 'v7') return;
    const steps = jSection.querySelectorAll('.step');
    steps.forEach((s, i) => s.classList.toggle('jspot', i === jSpotIdx));
    jSpotIdx = (jSpotIdx + 1) % steps.length;
  }
  function jSpotStart() {
    jSpotRun();
    jSpotTimer = setInterval(jSpotRun, 2600);
  }
  function jSpotStop() { clearInterval(jSpotTimer); jSection.querySelectorAll('.step').forEach(s => s.classList.remove('jspot')); }
  /* observe when journey is in view */
  if (window.IntersectionObserver) {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (jSection.dataset.v !== 'v7') return;
        e.isIntersecting ? jSpotStart() : jSpotStop();
      });
    }, { threshold: 0.3 }).observe(jSection);
  }
  /* react to variant switch */
  jSection.addEventListener('variantChange', () => {
    jSpotStop(); jSpotIdx = 0;
    if (jSection.dataset.v === 'v7') jSpotStart();
  });
})();

/* Team Intro: Scan entfernt — Video + Titel sofort sichtbar (2026-06-26) */

/* cinematic scroll-entrance for the whole Character-Select section (plays once) */
if (window.ScrollTrigger) {
  ScrollTrigger.create({
    trigger: '#character-select', start: 'top 72%', once: true,
    onEnter: () => {
      gsap.from('#cs-heading', { y: -28, opacity: 0, duration: 1, ease: 'power3.out' });
      gsap.from(csCharEls, { y: 95, opacity: 0, duration: 1.05, stagger: 0.09, ease: 'power3.out' });
      gsap.from('#cs-stage-bg', { scale: 1.14, opacity: 0.35, duration: 1.5, ease: 'power2.out' });
      gsap.from('#cs-info-panel', { x: -45, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.25 });
      gsap.from('#cs-bottombar', { y: 28, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.45 });
      gsap.from('#doctor-hud', { x: 45, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.35 });
    }
  });
}

/* ─── BUILD SPECIALTIES — Leistungen ─── */
const TREATMENTS = [
  { name:'Physiotherapy', tag:'Insured & Private', img:'assets/images/treat-sports.webp',
    desc:'One-to-one therapy with full focus on you. 60 minutes. One therapist. No production line.',
    long:'Manual treatment, mobilisation, exercise therapy — individually tailored to your diagnosis. You\'ll feel the difference from the very first session.',
    benefits:['60-minute individual session','Manual Therapy & Mobilisation','Targeted exercise therapy','Insured referrals accepted','Self-pay — no referral needed'],
    meta:['60 minutes','Insured & self-pay','First appointment without waiting'] },
  { name:'Return to Sport', tag:'Sports Rehabilitation', img:'assets/images/treat-shockwave.webp',
    desc:'Criteria-based return to sport after injury. ACL, shoulder, knee.',
    long:'We measure strength, jump, reaction time, and load tolerance. Not the calendar decides — your readiness does. The core of what we do at APEX.',
    benefits:['Functional strength & jump tests','Sport-specific training','ACL, shoulder, knee','Progressive load management','Close coordination with your doctor'],
    meta:['4–9 months','Depends on injury','Goal: full performance'] },
  { name:'Personal Training', tag:'Strength & Performance', img:'assets/images/tech-training.webp',
    desc:'Functional strength training with a therapeutic background. 1:1, structured, measurable.',
    long:'Squat rack, cable machine, kettlebell — sport-specific, measurable, adapted to your injury history. Get stronger — safely and systematically.',
    benefits:['1:1 coaching','Sport-specific exercises','Build strength & endurance','Injury-preventive training','Measurable progress'],
    meta:['60 minutes','No referral needed','Packages available'] },
  { name:'Shockwave Therapy', tag:'Device-assisted', img:'assets/images/tech-shockwave.webp',
    desc:'Focused sound waves for chronic tendon pain. Non-invasive, no anaesthesia.',
    long:'Clinically proven for plantar fasciitis, patellar tendon, Achilles tendon, and calcific shoulder. When conservative therapy is no longer enough.',
    benefits:['Plantar fasciitis & Achilles tendon','Patellar tendon syndrome','Calcific shoulder','Tennis elbow','Chronic muscle pain'],
    meta:['20–30 minutes','3–5 sessions','No downtime'] },
  { name:'Sports Massage', tag:'Recovery', img:'assets/images/treat-massage.webp',
    desc:'Deep tissue, myofascial treatment, and relaxation massage. For body & mind.',
    long:'For athletes in recovery, desk workers with tension, and anyone who needs to reset. Lets you breathe deeply again.',
    benefits:['Deep tissue & myofascial treatment','Shoulder, neck, back','Recovery support','Stress relief & relaxation','No referral needed'],
    meta:['60 minutes','No referral','Book directly'] },
  { name:'Mobility & Prevention', tag:'Long-term health', img:'assets/images/treat-mobility.webp',
    desc:'Joint mobilisation, Pilates, and flexibility training. Prevention is the best therapy.',
    long:'For athletes as a complement and for anyone who wants to stay healthy longer. Joint & fascia work, Pilates for all levels.',
    benefits:['Joint & fascia work','Pilates for all levels','Hip & shoulder mobility','Posture & balance','Injury prevention'],
    meta:['60 minutes','Preventive & therapeutic','No referral needed'] }
];
const specGrid = document.getElementById('specialtiesGrid');
if (specGrid) {
  TREATMENTS.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'specialty-card reveal';
    card.dataset.tx = i;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML = `
      <div class="spec-photo"><img src="${t.img}" alt="${t.name}" loading="lazy"></div>
      <span class="spec-name">${t.name}</span>
      <span class="spec-specialty">${t.tag}</span>
      <p class="spec-desc">${t.desc}</p>
      <span class="spec-more">Learn more →</span>
    `;
    card.addEventListener('click', () => openTx(i));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTx(i); } });
    specGrid.appendChild(card);
  });
}

/* ─── TREATMENT DETAIL PANEL — slides in like the patient story ─── */
const txPanel = document.getElementById('tx-panel');
const txOverlay = document.getElementById('tx-overlay');
window.openTx = function(i){
  const t = TREATMENTS[i];
  if (!t || !txPanel) return;
  document.getElementById('tx-img').src = t.img;
  document.getElementById('tx-tag').textContent = t.tag;
  document.getElementById('tx-name').textContent = t.name;
  document.getElementById('tx-desc').textContent = t.long || t.desc;
  document.getElementById('tx-benefits').innerHTML =
    (t.benefits || []).map(b => `<li>${b}</li>`).join('');
  document.getElementById('tx-meta').innerHTML =
    (t.meta || []).map(m => `<span class="tx-chip">${m}</span>`).join('');
  document.getElementById('tx-body').scrollTop = 0;
  txOverlay.classList.add('active');
  txPanel.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (window.gsap) {
    gsap.fromTo('#tx-img', {scale: 1.12}, {scale: 1, duration: 1.1, ease: 'power3.out'});
    gsap.fromTo('#tx-body > *', {opacity: 0, y: 16}, {opacity: 1, y: 0, stagger: .06, duration: .5, ease: 'power3.out', delay: .12});
  }
};
window.closeTx = function(){
  if (!txPanel) return;
  txPanel.classList.remove('open');
  txOverlay.classList.remove('active');
  document.body.style.overflow = '';
};
document.addEventListener('keydown', e => { if (e.key === 'Escape') window.closeTx(); });

/* ─── CTA BUCHUNG (Demo-Kalender + WhatsApp) ─────────────────── */
const ctaBook = document.getElementById('ctaBook');
const ctaSuccess = document.getElementById('ctaSuccess');
const WA_NUMBER = '491759262803';
if (ctaBook) {
  const calGrid = document.getElementById('cal-grid');
  const calMonth = document.getElementById('cal-month');
  const slotGrid = document.getElementById('slot-grid');
  const summary = document.getElementById('bk-summary');
  const ddRoot = document.getElementById('bk-treatment');
  const ddBtn = document.getElementById('bk-dd-btn');
  const ddVal = ddRoot ? ddRoot.querySelector('.bk-dd-val') : null;
  let bkTreatment = '';
  if (ddBtn && ddRoot) {
    ddBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = ddRoot.classList.toggle('open');
      ddBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    ddRoot.querySelectorAll('.bk-dd-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        bkTreatment = opt.textContent.trim();
        ddVal.textContent = bkTreatment; ddVal.removeAttribute('data-placeholder');
        ddRoot.querySelectorAll('.bk-dd-opt').forEach(o => o.classList.remove('sel'));
        opt.classList.add('sel');
        ddRoot.classList.remove('open'); ddBtn.setAttribute('aria-expanded', 'false');
        updateBooking();
      });
    });
    document.addEventListener('click', (e) => {
      if (!ddRoot.contains(e.target)) { ddRoot.classList.remove('open'); ddBtn.setAttribute('aria-expanded', 'false'); }
    });
  }
  const waBtn = document.getElementById('bk-wa');
  const SLOTS = ['09:00','10:00','11:00','13:00','14:30','16:00','17:30'];
  const today = new Date(); today.setHours(0,0,0,0);
  let viewY = today.getFullYear(), viewM = today.getMonth();
  let selDate = null, selTime = null;
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function fmtDate(d){ return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}); }
  function updateBooking(){
    const t = bkTreatment || 'an appointment';
    let txt = `Hi APEX, I'd like to book ${t}`;
    if (selDate) txt += ` on ${fmtDate(selDate)}`;
    if (selTime) txt += ` at ${selTime}`;
    txt += '.';
    if (waBtn) waBtn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(txt)}`;
    if (summary) summary.textContent = selDate ? `${fmtDate(selDate)}${selTime ? ' · ' + selTime : ''}` : '';
  }
  function renderSlots(){
    if (!slotGrid) return;
    slotGrid.innerHTML = '';
    if (!selDate){ slotGrid.innerHTML = '<span class="slot-hint">Pick a date first</span>'; return; }
    SLOTS.forEach(s => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'slot' + (s===selTime ? ' active' : ''); b.textContent = s;
      b.addEventListener('click', () => { selTime = s; renderSlots(); updateBooking(); });
      slotGrid.appendChild(b);
    });
  }
  function renderCal(){
    if (!calGrid || !calMonth) return;
    calMonth.textContent = `${MONTHS[viewM]} ${viewY}`;
    calGrid.innerHTML = '';
    const first = new Date(viewY, viewM, 1);
    const startDow = (first.getDay()+6)%7; // Mo=0
    const days = new Date(viewY, viewM+1, 0).getDate();
    for (let i=0;i<startDow;i++){ const e=document.createElement('span'); e.className='cal-empty'; calGrid.appendChild(e); }
    for (let d=1;d<=days;d++){
      const date = new Date(viewY, viewM, d);
      const b = document.createElement('button');
      b.type='button'; b.className='cal-day'; b.textContent=d;
      const isPast = date < today;
      const isSun = date.getDay()===0;
      if (isPast || isSun){ b.disabled = true; b.classList.add('off'); }
      if (selDate && date.getTime()===selDate.getTime()) b.classList.add('active');
      if (date.getTime()===today.getTime()) b.classList.add('today');
      if (!b.disabled) b.addEventListener('click', () => { selDate = date; selTime = null; renderCal(); renderSlots(); updateBooking(); });
      calGrid.appendChild(b);
    }
  }
  const calPrev = document.getElementById('cal-prev');
  const calNext = document.getElementById('cal-next');
  if (calPrev) calPrev.addEventListener('click', () => {
    if (viewY===today.getFullYear() && viewM===today.getMonth()) return;
    viewM--; if (viewM<0){ viewM=11; viewY--; } renderCal();
  });
  if (calNext) calNext.addEventListener('click', () => { viewM++; if (viewM>11){ viewM=0; viewY++; } renderCal(); });
  const bkConfirm = document.getElementById('bk-confirm');
  if (bkConfirm) bkConfirm.addEventListener('click', () => {
    if (!bkTreatment || !selDate || !selTime){
      if (summary){ summary.textContent = 'Please select a treatment, date and time.'; summary.classList.add('warn');
        setTimeout(()=>summary.classList.remove('warn'), 1800); }
      return;
    }
    gsap.to(ctaBook, {opacity:0, y:-10, duration:.4, ease:'power2.in', onComplete:()=>{
      ctaBook.style.display='none';
      if (ctaSuccess){ ctaSuccess.style.display='';
        ctaSuccess.innerHTML = `✓ Request received — <strong>${bkTreatment}</strong>, ${fmtDate(selDate)} at ${selTime}. We will get back to you within 24 hours.`;
        ctaSuccess.classList.add('visible');
        gsap.from(ctaSuccess, {opacity:0, y:12, duration:.5, ease:'power3.out'}); }
    }});
  });
  renderCal(); renderSlots(); updateBooking();
}

/* ─── BUILD FULL TEAM GRID ─────────────────── */
const TEAM = [];
const tg = document.getElementById('teamGrid');
if (tg) tg.style.display = 'none';

/* ─── GALLERY RESULT MODAL ───────────────────────────────────── */
const GAL_STORIES = {
  'Return to Sport': 'After his ACL surgery, a 26-year-old footballer faced an uncertain future. Ryan\'s return-to-sport protocol at APEX brought him back stronger than before in just 8 months — with 97% strength symmetry and zero fear of re-injury.',
  'Shoulder Rehabilitation': 'A 32-year-old competitive swimmer battled shoulder impingement for two years. After six sessions of manual therapy with Sophie, the restriction was gone. She\'s now back competing at her previous level.',
  'Hip Mobilisation': 'A 68-year-old former marathon runner could barely manage stairs due to hip osteoarthritis. After a structured mobilisation programme at APEX, he runs regularly again — pain-free.',
  'Back & Neck': 'A desk worker with chronic neck pain found the solution at APEX after years of searching. Posture correction, targeted exercise therapy, and manual treatment — after two months, she was pain-free.',
  'Strength & Plyometrics': 'A basketball player recovering from a knee injury worked with Alex on jump strength and reaction time. After 5 months he reached his pre-injury performance and was back in his team\'s starting lineup.',
  'Funktionelle Stärke': 'Das gesamte STATIC-Team begleitet regelmäßig Gruppe-Sessions für Sportler in der Regenerationsphase. Funktionelle Stärke als Basis für alles — nicht als letzter Schritt.'
};
const galModal = document.getElementById('gal-modal');
if (galModal) {
  document.querySelectorAll('#gallery .gallery-card').forEach(card => {
    card.addEventListener('click', () => {
      const t = (card.querySelector('.gallery-treatment')||{}).textContent || '';
      const detail = (card.querySelector('.gallery-detail')||{}).textContent || '';
      const photo = card.querySelector('.gallery-photo');
      document.getElementById('gal-modal-title').textContent = t;
      document.getElementById('gal-modal-detail').textContent = detail;
      document.getElementById('gal-modal-story').textContent = GAL_STORIES[t] || '';
      const mImg = document.getElementById('gal-modal-photo');
      if (photo && photo.getAttribute('src')) { mImg.src = photo.getAttribute('src'); mImg.parentElement.style.display = ''; }
      else { mImg.parentElement.style.display = 'none'; }
      galModal.classList.add('open');
      gsap.fromTo('.gal-modal-panel', {scale:.94, opacity:0, y:24}, {scale:1, opacity:1, y:0, duration:.5, ease:'power3.out'});
      gsap.fromTo('#gal-modal-photo', {scale:1.1}, {scale:1, duration:1.1, ease:'power3.out'});
    });
  });
}
window.closeGalleryModal = function() { if (galModal) galModal.classList.remove('open'); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') window.closeGalleryModal(); });

/* ─── TESTIMONIALS V3 SLIDER ─────────────────────────────────── */
(() => {
  const cards = document.querySelectorAll('#testimonials .test-card');
  const dotsWrap = document.getElementById('test-dots');
  const prev = document.getElementById('test-prev');
  const next = document.getElementById('test-next');
  if (!cards.length || !dotsWrap || !prev || !next) return;
  let idx = 0;
  cards.forEach((_, k) => {
    const d = document.createElement('button');
    d.className = 'test-dot'; d.setAttribute('aria-label', 'Review ' + (k + 1));
    d.addEventListener('click', () => show(k));
    dotsWrap.appendChild(d);
  });
  const dots = dotsWrap.querySelectorAll('.test-dot');
  function show(i){
    idx = (i + cards.length) % cards.length;
    cards.forEach((c, k) => c.classList.toggle('active', k === idx));
    dots.forEach((d, k) => d.classList.toggle('on', k === idx));
  }
  prev.addEventListener('click', () => show(idx - 1));
  next.addEventListener('click', () => show(idx + 1));
  show(0);
})();

/* ─── CURSOR SPOTLIGHT — injects a glow layer into each card and tracks the pointer ─── */
(function(){
  var sel = '.specialty-card, .tech-card, .gallery-card, .test-card, .stat-item, .team-card, .journey-step';
  var cards = document.querySelectorAll(sel);
  cards.forEach(function(card){
    if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
    var glow = document.createElement('i');
    glow.className = 'cglow';
    card.appendChild(glow);
    card.addEventListener('pointermove', function(e){
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();

/* ─── AUTO-ACTIVATE SOFIA (idx 2) — handled by csActive=2 in ECHOES system ─── */

/* ─── AUTO-ACTIVATE LUKAS (idx 0) — handled by csActive=0 ─── */

/* ─── SPINE HERO — A/B/C style switcher ───────────────────────── */
(function initSpineHero() {
  const img = document.getElementById('spine-hero-img');
  const sw = document.getElementById('hero-spine-sw');
  if (!img || !sw) return;
  const btns = sw.querySelectorAll('.vsw-btn');
  const SPINE_MAP = {
    A: 'assets/images/spine-A.webp',
    B: 'assets/images/spine-B.webp',
    C: 'assets/images/spine-C.webp'
  };
  const saved = localStorage.getItem('apex-spine') || 'B';
  function setSpine(key) {
    if (img.tagName === 'IMG') {
      const src = SPINE_MAP[key] || SPINE_MAP['A'];
      img.src = src;
    }
    btns.forEach(b => b.classList.toggle('active', b.dataset.spine === key));
    localStorage.setItem('apex-spine', key);
  }
  setSpine(saved);
  btns.forEach(btn => {
    btn.addEventListener('click', () => setSpine(btn.dataset.spine));
  });
  if (window.gsap) {
    gsap.from(img, { opacity: 0, scale: 0.94, duration: 1.5, ease: 'power3.out', delay: 0.4 });
    gsap.from('.hero-accent-line', { opacity: 0, scaleY: 0, duration: 1.2, ease: 'power3.out', delay: 0.8, transformOrigin: 'top center' });
  }

  /* Ping-pong: vorwärts → rückwärts → vorwärts … (zwei echte Videos) */
  if (img.tagName === 'VIDEO') {
    const imgRev = document.getElementById('spine-hero-img-rev');
    if (imgRev) {
      img.addEventListener('ended', () => {
        img.style.display = 'none';
        imgRev.style.display = 'block';
        imgRev.currentTime = 0;
        imgRev.play();
      });
      imgRev.addEventListener('ended', () => {
        imgRev.style.display = 'none';
        img.style.display = 'block';
        img.currentTime = 0;
        img.play();
      });
    }
  }
})();

/* ─── NAV SCROLL ──────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

/* ─── SCROLL REVEAL ─────────────────────────── */
// Cards inside a grid reveal one-by-one (stagger via transition-delay)
document.querySelectorAll('.specialties-grid, .team-grid, .tech-grid, .stats-grid, .gallery-grid, .test-grid, .journey-grid').forEach(grid => {
  [...grid.children].forEach((child, i) => {
    if (child.classList && child.classList.contains('reveal')) child.style.transitionDelay = ((i % 8) * 0.07) + 's';
  });
});
document.querySelectorAll('.reveal').forEach(el => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    onEnter: () => el.classList.add('in'),
    once: true
  });
});

/* Section-level "come alive" trigger (journey path draw, stats bars build) */
['journey','stats','technology','gallery'].forEach(id => {
  const sec = document.getElementById(id);
  if (sec) ScrollTrigger.create({ trigger: sec, start: 'top 78%', once: true, onEnter: () => sec.classList.add('animate') });
});

/* Stats count-up (0 → data-target) */
document.querySelectorAll('.stat-num').forEach(el => {
  const target = parseInt(el.dataset.target, 10);
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.fromTo(el,
        { innerText: 0 },
        {
          innerText: target,
          duration: 2.2,
          ease: 'power2.out',
          snap: { innerText: 1 },
          onUpdate() { el.textContent = Math.round(parseFloat(el.innerText)); }
        }
      );
    }
  });
});