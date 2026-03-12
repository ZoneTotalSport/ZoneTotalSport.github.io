/* jeux-app.js — Zone Total Sport: Jeux Sportifs */

const JEUX_FILES = [
  { file: '../data/jeux/jeux_ballon_chasseur.json',   cat: 'ballon_chasseur' },
  { file: '../data/jeux/jeux_poursuite.json',         cat: 'poursuite' },
  { file: '../data/jeux/jeux_cooperation.json',       cat: 'cooperation' },
  { file: '../data/jeux/jeux_opposition_duel.json',   cat: 'opposition' },
  { file: '../data/jeux/sports_collectifs.json',      cat: 'sports_collectifs' },
  { file: '../data/jeux/sports_individuels.json',     cat: 'individuels' },
  { file: '../data/jeux/jeux_traditionnels_monde.json', cat: 'traditionnels' },
  { file: '../data/jeux/jeux_sans_materiel.json',     cat: 'sans_materiel' },
  { file: '../data/jeux/jeux_exterieur.json',         cat: 'exterieur' },
  { file: '../data/jeux/jeux_prescolaire.json',       cat: 'prescolaire' },
  { file: '../data/jeux/jeux_avec_materiel.json',     cat: 'avec_materiel' },
  { file: '../data/jeux/jeux_interieur.json',         cat: 'poursuite' },
  { file: '../data/jeux/jeux_raquettes.json',         cat: 'raquettes' },
  { file: '../data/jeux/jeux_danse_expression.json',  cat: 'expression' },
  { file: '../data/jeux/jeux_prescolaire_extra.json', cat: 'prescolaire' },
];

const CAT_LABELS = {
  ballon_chasseur:  '🎯 Ballon Chasseur',
  poursuite:        '🏃 Poursuite',
  cooperation:      '🤝 Coopération',
  opposition:       '⚔️ Opposition/Duel',
  sports_collectifs:'🏅 Sports Collectifs',
  individuels:      '🏆 Sports Individuels',
  traditionnels:    '🌍 Jeux Traditionnels',
  sans_materiel:    '🙌 Sans Matériel',
  exterieur:        '🌿 Extérieur',
  avec_materiel:    '🎒 Avec Matériel',
  prescolaire:      '🌱 Préscolaire',
  raquettes:        '🏸 Raquettes',
  expression:       '💃 Danse/Expression',
};

// Illustrations visuelles par catégorie (grand emoji scène + schéma SVG)
const CAT_SCENE = {
  ballon_chasseur:  ['🏃‍♂️','💨','🎯','💥','🏃‍♀️'],
  poursuite:        ['🏃‍♂️','➡️','🏃‍♀️','🔴','⚡'],
  cooperation:      ['🤝','⭕','🔄','👥','💚'],
  opposition:       ['⚔️','🥊','🏆','💪','🎯'],
  sports_collectifs:['⚽','🏀','🤾','👥','🥅'],
  individuels:      ['🏆','🎯','💪','🌟','🏅'],
  traditionnels:    ['🌍','🎪','🏺','🌐','🎭'],
  sans_materiel:    ['🙌','💨','🏃','⭕','✨'],
  exterieur:        ['🌿','🌳','☀️','🏃','🌱'],
  avec_materiel:    ['🎒','🎯','⚽','🪃','🎽'],
  prescolaire:      ['🌱','🐣','😄','⭐','🎈'],
  raquettes:        ['🏸','🎾','🏓','🪶','🥏'],
  expression:       ['💃','🎶','🌊','🎭','✨'],
};

const CAT_SVG = {
  ballon_chasseur: (col) => `
    <svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-height:180px;border:3px solid var(--navy);background:#f8f8ff">
      <rect width="400" height="180" fill="#eef2ff"/>
      <line x1="200" y1="0" x2="200" y2="180" stroke="${col}" stroke-width="4" stroke-dasharray="8,4"/>
      <text x="200" y="12" text-anchor="middle" font-size="10" fill="${col}" font-family="Bangers,cursive" letter-spacing="1">LIGNE CENTRALE</text>
      <!-- Équipe A (gauche) -->
      ${[40,70,100,130,160].map((y,i)=>`<circle cx="${50+i%2*30}" cy="${y}" r="14" fill="${col}" stroke="white" stroke-width="2"/>
      <text x="${50+i%2*30}" y="${y+5}" text-anchor="middle" font-size="11" fill="white" font-family="Arial">A</text>`).join('')}
      <!-- Équipe B (droite) -->
      ${[40,70,100,130,160].map((y,i)=>`<circle cx="${350-i%2*30}" cy="${y}" r="14" fill="#c0392b" stroke="white" stroke-width="2"/>
      <text x="${350-i%2*30}" y="${y+5}" text-anchor="middle" font-size="11" fill="white" font-family="Arial">B</text>`).join('')}
      <!-- Ballons -->
      <circle cx="185" cy="80" r="12" fill="#FFE000" stroke="var(--navy)" stroke-width="2"/>
      <circle cx="215" cy="110" r="12" fill="#FFE000" stroke="var(--navy)" stroke-width="2"/>
      <circle cx="200" cy="50" r="12" fill="#FFE000" stroke="var(--navy)" stroke-width="2"/>
      <!-- Flèches de lancer -->
      <path d="M 130 90 Q 155 85 178 80" stroke="${col}" stroke-width="3" fill="none" marker-end="url(#arr)"/>
      <path d="M 275 100 Q 245 105 225 110" stroke="#c0392b" stroke-width="3" fill="none" marker-end="url(#arr2)"/>
      <defs>
        <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="${col}"/></marker>
        <marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#c0392b"/></marker>
      </defs>
      <text x="200" y="170" text-anchor="middle" font-size="11" fill="var(--navy)" font-family="Bangers,cursive" letter-spacing="2">GYMNASE · 2 ÉQUIPES · BALLONS AU CENTRE</text>
    </svg>`,

  poursuite: (col) => `
    <svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-height:180px;border:3px solid var(--navy);background:#fff5f5">
      <rect width="400" height="180" fill="#fff5f5"/>
      <ellipse cx="200" cy="100" rx="160" ry="70" fill="none" stroke="#ddd" stroke-width="3" stroke-dasharray="10,5"/>
      <!-- Chasseur -->
      <circle cx="80" cy="100" r="20" fill="${col}" stroke="white" stroke-width="3"/>
      <text x="80" y="95" text-anchor="middle" font-size="10" fill="white" font-weight="bold" font-family="Arial">🚨</text>
      <text x="80" y="108" text-anchor="middle" font-size="9" fill="white" font-family="Bangers,cursive">IT</text>
      <!-- Fuyards -->
      <circle cx="200" cy="60" r="16" fill="#1a7f3c" stroke="white" stroke-width="2"/>
      <text x="200" y="65" text-anchor="middle" font-size="10" fill="white" font-family="Arial">🏃</text>
      <circle cx="300" cy="80" r="16" fill="#1a7f3c" stroke="white" stroke-width="2"/>
      <text x="300" y="85" text-anchor="middle" font-size="10" fill="white" font-family="Arial">🏃</text>
      <circle cx="250" cy="140" r="16" fill="#1a7f3c" stroke="white" stroke-width="2"/>
      <text x="250" y="145" text-anchor="middle" font-size="10" fill="white" font-family="Arial">🏃</text>
      <circle cx="330" cy="140" r="16" fill="#1a7f3c" stroke="white" stroke-width="2"/>
      <text x="330" y="145" text-anchor="middle" font-size="10" fill="white" font-family="Arial">🏃</text>
      <!-- Flèches de poursuite -->
      <path d="M 100 100 Q 150 80 182 65" stroke="${col}" stroke-width="3" fill="none" stroke-dasharray="5,3" marker-end="url(#arrP)"/>
      <defs><marker id="arrP" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="${col}"/></marker></defs>
      <text x="200" y="170" text-anchor="middle" font-size="11" fill="var(--navy)" font-family="Bangers,cursive" letter-spacing="2">🚨 CHASSEUR ATTRAPE LES FUYARDS 🏃</text>
    </svg>`,

  cooperation: (col) => `
    <svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-height:180px;border:3px solid var(--navy);background:#f0fff4">
      <rect width="400" height="180" fill="#f0fff4"/>
      ${[0,45,90,135,180,225,270,315].map((angle,i) => {
        const x = 200 + 100*Math.cos(angle*Math.PI/180);
        const y = 95 + 70*Math.sin(angle*Math.PI/180);
        const nx = 200 + 100*Math.cos((angle+45)*Math.PI/180);
        const ny = 95 + 70*Math.sin((angle+45)*Math.PI/180);
        return `<line x1="${x}" y1="${y}" x2="${nx}" y2="${ny}" stroke="${col}" stroke-width="2" stroke-dasharray="5,3"/>
        <circle cx="${x}" cy="${y}" r="16" fill="${col}" stroke="white" stroke-width="2"/>
        <text x="${x}" y="${y+5}" text-anchor="middle" font-size="12" fill="white">🤝</text>`;
      }).join('')}
      <text x="200" y="100" text-anchor="middle" font-size="24" fill="${col}">⭕</text>
      <text x="200" y="170" text-anchor="middle" font-size="11" fill="var(--navy)" font-family="Bangers,cursive" letter-spacing="2">TOUS ENSEMBLE · OBJECTIF COMMUN</text>
    </svg>`,

  opposition: (col) => `
    <svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-height:180px;border:3px solid var(--navy);background:#fdf0ff">
      <rect width="400" height="180" fill="#fdf0ff"/>
      <line x1="200" y1="20" x2="200" y2="160" stroke="${col}" stroke-width="3" stroke-dasharray="8,4"/>
      <circle cx="100" cy="90" r="30" fill="${col}" stroke="white" stroke-width="3"/>
      <text x="100" y="85" text-anchor="middle" font-size="20">🥊</text>
      <text x="100" y="105" text-anchor="middle" font-size="10" fill="white" font-family="Bangers,cursive">JOUEUR 1</text>
      <circle cx="300" cy="90" r="30" fill="#8e44ad" stroke="white" stroke-width="3"/>
      <text x="300" y="85" text-anchor="middle" font-size="20">🥊</text>
      <text x="300" y="105" text-anchor="middle" font-size="10" fill="white" font-family="Bangers,cursive">JOUEUR 2</text>
      <path d="M 135 80 L 165 90" stroke="${col}" stroke-width="4" marker-end="url(#arrO)"/>
      <path d="M 265 80 L 235 90" stroke="#8e44ad" stroke-width="4" marker-end="url(#arrO2)"/>
      <text x="200" y="90" text-anchor="middle" font-size="22">⚔️</text>
      <defs>
        <marker id="arrO" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="${col}"/></marker>
        <marker id="arrO2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#8e44ad"/></marker>
      </defs>
      <text x="200" y="170" text-anchor="middle" font-size="11" fill="var(--navy)" font-family="Bangers,cursive" letter-spacing="2">DUEL · 1 vs 1 · QUI GAGNE ?</text>
    </svg>`,

  sports_collectifs: (col) => `
    <svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-height:180px;border:3px solid var(--navy);background:#fff8f0">
      <rect width="400" height="180" fill="#fff8f0"/>
      <rect x="20" y="20" width="360" height="140" fill="none" stroke="#999" stroke-width="2"/>
      <line x1="200" y1="20" x2="200" y2="160" stroke="#999" stroke-width="2" stroke-dasharray="8,4"/>
      <circle cx="200" cy="90" r="30" fill="none" stroke="#999" stroke-width="2"/>
      <!-- But gauche -->
      <rect x="20" y="65" width="15" height="50" fill="${col}" opacity="0.7"/>
      <!-- But droit -->
      <rect x="365" y="65" width="15" height="50" fill="#c0392b" opacity="0.7"/>
      <!-- Équipe A -->
      ${[[60,50],[80,100],[60,140],[110,80],[120,130]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="13" fill="${col}" stroke="white" stroke-width="2"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="9" fill="white" font-family="Arial">A</text>`).join('')}
      <!-- Équipe B -->
      ${[[340,50],[320,100],[340,140],[290,80],[280,130]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="13" fill="#c0392b" stroke="white" stroke-width="2"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="9" fill="white" font-family="Arial">B</text>`).join('')}
      <!-- Ballon -->
      <circle cx="200" cy="90" r="10" fill="#FFE000" stroke="var(--navy)" stroke-width="2"/>
      <text x="200" y="170" text-anchor="middle" font-size="11" fill="var(--navy)" font-family="Bangers,cursive" letter-spacing="2">TERRAIN · 2 ÉQUIPES · OBJECTIF : MARQUER !</text>
    </svg>`,

  prescolaire: (col) => `
    <svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-height:180px;border:3px solid var(--navy);background:#fffde7">
      <rect width="400" height="180" fill="#fffde7"/>
      ${[50,120,200,270,340].map((x,i)=>{
        const emojis = ['🐣','🐥','🌟','🎈','⭐'];
        const colors = ['#f39c12','#e67e22','#f1c40f','#2ecc71','#e74c3c'];
        return `<circle cx="${x}" cy="90" r="28" fill="${colors[i]}" stroke="white" stroke-width="3"/>
        <text x="${x}" y="100" text-anchor="middle" font-size="20">${emojis[i]}</text>`;
      }).join('')}
      <path d="M 78 90 Q 100 70 92 90" stroke="${col}" stroke-width="2" fill="none" stroke-dasharray="4,3"/>
      <path d="M 148 90 Q 170 70 172 90" stroke="${col}" stroke-width="2" fill="none" stroke-dasharray="4,3"/>
      <text x="200" y="165" text-anchor="middle" font-size="11" fill="var(--navy)" font-family="Bangers,cursive" letter-spacing="2">🌱 APPRENTISSAGE PAR LE JEU · 3-6 ANS</text>
    </svg>`,

  raquettes: (col) => `
    <svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-height:180px;border:3px solid var(--navy);background:#e0f7fa">
      <rect width="400" height="180" fill="#e0f7fa"/>
      <line x1="200" y1="20" x2="200" y2="155" stroke="${col}" stroke-width="4"/>
      <rect x="195" y="20" width="10" height="135" fill="${col}" rx="3"/>
      <text x="200" y="15" text-anchor="middle" font-size="10" fill="${col}" font-family="Bangers,cursive">FILET / LIGNE</text>
      <!-- Joueur gauche -->
      <circle cx="80" cy="90" r="25" fill="${col}" stroke="white" stroke-width="3"/>
      <text x="80" y="85" text-anchor="middle" font-size="18">🏸</text>
      <text x="80" y="105" text-anchor="middle" font-size="9" fill="white" font-family="Bangers,cursive">J1</text>
      <!-- Joueur droit -->
      <circle cx="320" cy="90" r="25" fill="#00897b" stroke="white" stroke-width="3"/>
      <text x="320" y="85" text-anchor="middle" font-size="18">🏸</text>
      <text x="320" y="105" text-anchor="middle" font-size="9" fill="white" font-family="Bangers,cursive">J2</text>
      <!-- Volant/balle arc -->
      <path d="M 105 80 Q 200 30 295 80" stroke="${col}" stroke-width="3" fill="none" stroke-dasharray="6,3" marker-end="url(#arrR)"/>
      <circle cx="200" cy="38" r="7" fill="#FFE000" stroke="var(--navy)" stroke-width="2"/>
      <defs><marker id="arrR" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="${col}"/></marker></defs>
      <text x="200" y="172" text-anchor="middle" font-size="11" fill="var(--navy)" font-family="Bangers,cursive" letter-spacing="2">PAR-DESSUS LE FILET · RAQUETTES</text>
    </svg>`,
};

// Emoji scène par défaut pour les catégories sans SVG personnalisé
function getCatEmojis(cat) {
  const s = CAT_SCENE[cat] || ['🎮','⚡','🏆','💪','🌟'];
  return s.join(' ');
}

// Générer SVG diagram ou fallback
function getTerrainSVG(j) {
  const cat = j._cat || j.categorie || '';
  const col = CAT_COLORS[cat] || '#004EBF';
  if (CAT_SVG[cat]) return CAT_SVG[cat](col);

  // Fallback générique
  const emojis = CAT_SCENE[cat] || ['🎮','⚡','🏆'];
  const nbJ = j.nb_joueurs_min || 6;
  const espace = j.espace || 'Gymnase';
  const bg = espace === 'Extérieur' ? '#f0fff0' : '#f0f4ff';
  return `
    <svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-height:180px;border:3px solid var(--navy);background:${bg}">
      <rect width="400" height="180" fill="${bg}"/>
      <rect x="20" y="20" width="360" height="120" fill="none" stroke="${col}" stroke-width="3" rx="8"/>
      <text x="200" y="85" text-anchor="middle" font-size="42">${emojis[0]}</text>
      <text x="80" y="130" text-anchor="middle" font-size="22">${emojis[1]||'⚡'}</text>
      <text x="320" y="130" text-anchor="middle" font-size="22">${emojis[2]||'🏆'}</text>
      <text x="200" y="170" text-anchor="middle" font-size="11" fill="${col}" font-family="Bangers,cursive" letter-spacing="2">${espace.toUpperCase()} · ${nbJ}+ JOUEURS</text>
    </svg>`;
}

const CAT_COLORS = {
  ballon_chasseur:  '#004EBF',
  poursuite:        '#c0392b',
  cooperation:      '#1a7f3c',
  opposition:       '#8e44ad',
  sports_collectifs:'#e67e22',
  individuels:      '#2980b9',
  traditionnels:    '#d35400',
  sans_materiel:    '#16a085',
  exterieur:        '#27ae60',
  avec_materiel:    '#7f8c8d',
  prescolaire:      '#f39c12',
  raquettes:        '#00897b',
  expression:       '#ad1457',
};

const NIVEAU_ICONS = { prescolaire:'🌱', primaire:'📖', secondaire:'🎓' };

let ALL_JEUX = [];
let filtered = [];

async function loadAll() {
  const bar = document.getElementById('loadBar');
  let loaded = 0;

  for (const { file, cat } of JEUX_FILES) {
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      const arr = data.jeux || data.sports || data.games || data.items || [];
      arr.forEach(j => { if (!j._cat) j._cat = j.categorie || cat; });
      ALL_JEUX.push(...arr);
    } catch (e) {
      console.warn('Skip', file, e);
    }
    loaded++;
    bar.style.width = (loaded / JEUX_FILES.length * 100) + '%';
    await new Promise(r => setTimeout(r, 30));
  }

  // Update badges
  const pays = new Set(ALL_JEUX.map(j => j.pays || j.origine || '').filter(Boolean));
  document.getElementById('badge-total').innerHTML = ALL_JEUX.length + '<span>JEUX</span>';
  document.getElementById('badge-pays').innerHTML  = pays.size + '<span>PAYS</span>';

  buildCatPills();
  applyFilters();
  updateStats();

  // Show app
  await new Promise(r => setTimeout(r, 300));
  document.getElementById('loading').style.display = 'none';
  document.getElementById('app').classList.remove('hidden');
}

function buildCatPills() {
  const bar = document.getElementById('cat-pills-bar');
  const cats = [...new Set(ALL_JEUX.map(j => j._cat || j.categorie || '').filter(Boolean))];
  bar.innerHTML = '';

  const allPill = document.createElement('button');
  allPill.className = 'cat-pill active';
  allPill.textContent = '⚡ TOUT';
  allPill.style.cssText = 'font-family:Bangers,cursive;font-size:0.95rem;letter-spacing:2px;padding:0.4rem 1rem;border:3px solid var(--navy);background:var(--navy);color:var(--yellow);cursor:pointer;';
  allPill.onclick = () => { document.getElementById('f-cat').value = ''; applyFilters(); setActivePill(allPill); };
  bar.appendChild(allPill);

  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-pill';
    btn.textContent = CAT_LABELS[cat] || cat;
    const col = CAT_COLORS[cat] || '#004EBF';
    btn.style.cssText = `font-family:Bangers,cursive;font-size:0.9rem;letter-spacing:1px;padding:0.35rem 0.9rem;border:3px solid ${col};background:${col};color:#fff;cursor:pointer;`;
    btn.onclick = () => { document.getElementById('f-cat').value = cat; applyFilters(); setActivePill(btn); };
    bar.appendChild(btn);
  });
}

function setActivePill(active) {
  document.querySelectorAll('.cat-pill').forEach(p => p.style.opacity = '0.6');
  active.style.opacity = '1';
}

function applyFilters() {
  const q    = document.getElementById('search').value.toLowerCase();
  const cat  = document.getElementById('f-cat').value;
  const niv  = document.getElementById('f-niveau').value;
  const esp  = document.getElementById('f-espace').value;
  const inte = document.getElementById('f-intensite').value;

  filtered = ALL_JEUX.filter(j => {
    const text = [j.titre, j.noms_alternatifs, j.but_du_jeu, j.deroulement, j.pays, j.origine].flat().join(' ').toLowerCase();
    if (q && !text.includes(q)) return false;
    if (cat) {
      const jCat = j._cat || j.categorie || '';
      if (!jCat.includes(cat)) return false;
    }
    if (niv) {
      const niveauStr = (j.niveau || '').toLowerCase();
      if (!niveauStr.includes(niv)) return false;
    }
    if (esp && (j.espace || '') !== esp) return false;
    if (inte && (j.intensite || '') !== inte) return false;
    return true;
  });

  renderGrid();
  updateStats();
}

function updateStats() {
  const pays = new Set(filtered.map(j => j.pays || j.origine || '').filter(Boolean));
  const cats = new Set(filtered.map(j => j._cat || j.categorie || '').filter(Boolean));
  document.getElementById('count-total').textContent = filtered.length + ' jeux';
  document.getElementById('count-pays').textContent  = pays.size + ' origines';
  document.getElementById('count-cat').textContent   = cats.size + ' catégories';
}

function renderGrid() {
  const grid = document.getElementById('grid');
  if (filtered.length === 0) {
    grid.innerHTML = '<div style="text-align:center;padding:3rem;font-family:Bangers,cursive;font-size:1.5rem;color:var(--navy);letter-spacing:3px">AUCUN JEU TROUVÉ 😅</div>';
    return;
  }

  grid.innerHTML = filtered.slice(0, 200).map((j, i) => {
    const cat   = j._cat || j.categorie || 'jeux';
    const col   = CAT_COLORS[cat] || '#004EBF';
    const label = CAT_LABELS[cat] || cat;
    const pays  = j.pays || j.origine || '';
    const niveau = j.niveau || '';
    const duree  = j.duree || '';
    const intensite = j.intensite || '';
    const materiel = Array.isArray(j.materiel) ? j.materiel.slice(0,3) : [];
    const delay = (i % 20) * 40;

    const emojis = getCatEmojis(cat);

    return `
    <div class="zts-card" style="animation-delay:${delay}ms;cursor:pointer" onclick="openModal(${i})" tabindex="0" role="button" aria-label="${j.titre}">
      <div style="background:${col};padding:0.6rem 1rem;display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:Bangers,cursive;font-size:0.9rem;letter-spacing:2px;color:#fff">${label}</span>
        ${pays ? `<span style="font-size:0.8rem;background:rgba(255,255,255,0.2);color:#fff;padding:0.1rem 0.5rem;font-family:Bangers,cursive;letter-spacing:1px">🌍 ${pays}</span>` : ''}
      </div>
      <!-- Illustration visuelle -->
      <div style="background:${col}22;padding:0.8rem 1rem;text-align:center;font-size:2.2rem;letter-spacing:4px;border-bottom:2px solid ${col}44">
        ${emojis}
      </div>
      <div style="padding:1.2rem">
        <div style="font-family:Bangers,cursive;font-size:1.4rem;letter-spacing:2px;color:var(--navy);margin-bottom:0.3rem">${j.titre}</div>
        ${j.noms_alternatifs && j.noms_alternatifs.length ? `<div style="font-size:0.78rem;color:#556;margin-bottom:0.4rem;font-style:italic">= ${Array.isArray(j.noms_alternatifs)?j.noms_alternatifs.slice(0,2).join(' · '):j.noms_alternatifs}</div>` : ''}
        <div style="font-size:0.88rem;color:#334;line-height:1.5;margin-bottom:0.8rem;padding:0.5rem;background:#f8f9ff;border-left:3px solid ${col}"><strong>But :</strong> ${(j.but_du_jeu || j.intentions_pedagogiques || '').substring(0,130)}${((j.but_du_jeu||j.intentions_pedagogiques||'').length>130?'…':'')}</div>
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap">
          ${niveau ? `<span style="font-family:Bangers,cursive;font-size:0.78rem;letter-spacing:1px;padding:0.12rem 0.5rem;border:2px solid var(--navy);color:var(--navy)">🎓 ${niveau}</span>` : ''}
          ${duree  ? `<span style="font-family:Bangers,cursive;font-size:0.78rem;letter-spacing:1px;padding:0.12rem 0.5rem;background:var(--yellow);border:2px solid var(--navy);color:var(--navy)">⏱ ${duree}</span>` : ''}
          ${intensite ? `<span style="font-family:Bangers,cursive;font-size:0.78rem;letter-spacing:1px;padding:0.12rem 0.5rem;background:${col};color:#fff">🔥 ${intensite}</span>` : ''}
          ${j.nb_joueurs_min ? `<span style="font-family:Bangers,cursive;font-size:0.78rem;letter-spacing:1px;padding:0.12rem 0.5rem;background:#f0f4ff;border:2px solid var(--navy);color:var(--navy)">👥 ${j.nb_joueurs_min}${j.nb_joueurs_max?'–'+j.nb_joueurs_max:''} joueurs</span>` : ''}
        </div>
        ${materiel.length ? `<div style="margin-top:0.6rem;font-size:0.8rem;color:#556;background:#fffde7;padding:0.3rem 0.5rem;border:1px solid #ffe082">📦 ${materiel.join(' · ')}</div>` : ''}
      </div>
      <div style="background:var(--yellow);border-top:3px solid var(--navy);padding:0.5rem 1rem;font-family:Bangers,cursive;font-size:1rem;letter-spacing:2px;color:var(--navy);text-align:center">→ VOIR LA FICHE COMPLÈTE</div>
    </div>`;
  }).join('');

  if (filtered.length > 200) {
    grid.innerHTML += `<div style="text-align:center;padding:2rem;font-family:Bangers,cursive;font-size:1.1rem;color:var(--navy);letter-spacing:2px;grid-column:1/-1">... ET ${filtered.length - 200} AUTRES JEUX — AFFINEZ VOTRE RECHERCHE</div>`;
  }
}

function openModal(idx) {
  const j = filtered[idx];
  if (!j) return;
  const cat  = j._cat || j.categorie || '';
  const col  = CAT_COLORS[cat] || '#004EBF';
  const label= CAT_LABELS[cat] || cat;

  const materielHtml = Array.isArray(j.materiel) && j.materiel.length
    ? `<ul style="margin:0.5rem 0 0 1rem;padding:0">${j.materiel.map(m=>`<li>${m}</li>`).join('')}</ul>`
    : (j.materiel || '—');

  const variantesHtml = Array.isArray(j.variantes) && j.variantes.length
    ? `<ul style="margin:0.5rem 0 0 1rem;padding:0">${j.variantes.map(v=>`<li>${v}</li>`).join('')}</ul>`
    : '';

  const adapHtml = Array.isArray(j.adaptations_inclusives)
    ? `<ul style="margin:0.5rem 0 0 1rem;padding:0">${j.adaptations_inclusives.map(a=>`<li>${a}</li>`).join('')}</ul>`
    : (j.adaptations_inclusives || '');

  // Déroulement structuré en étapes visuelles
  const derHtml = (() => {
    if (!j.deroulement) return '';
    if (typeof j.deroulement === 'string') {
      // Découper en phrases pour affichage étapes
      const phrases = j.deroulement.split(/(?<=[.!?])\s+/).filter(p => p.length > 10);
      const icons = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣'];
      return phrases.map((p,i) =>
        `<div style="display:flex;gap:0.6rem;margin-bottom:0.6rem;padding:0.5rem;background:${i%2?'#f8f9ff':'#fff'};border-left:3px solid ${col}">
          <span style="font-size:1.2rem;flex-shrink:0">${icons[i]||'▶️'}</span>
          <span style="font-size:0.9rem;line-height:1.5;color:#223">${p}</span>
        </div>`
      ).join('');
    }
    // Objet structuré
    return Object.entries(j.deroulement).map(([k,v]) =>
      `<div style="margin-bottom:0.8rem"><strong style="color:${col}">${k} :</strong> ${v}</div>`
    ).join('');
  })();

  document.getElementById('modal-body').innerHTML = `
    <div style="background:${col};padding:1.5rem 2rem;border-bottom:4px solid var(--navy);position:relative">
      <div style="font-family:Bangers,cursive;font-size:2rem;letter-spacing:3px;color:#fff">${j.titre}</div>
      ${j.noms_alternatifs ? `<div style="color:rgba(255,255,255,0.8);font-size:0.9rem;margin-top:0.3rem">= ${Array.isArray(j.noms_alternatifs)?j.noms_alternatifs.join(' · '):j.noms_alternatifs}</div>` : ''}
      <div style="margin-top:0.5rem;display:flex;gap:0.5rem;flex-wrap:wrap">
        <span style="background:rgba(255,255,255,0.2);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">${label}</span>
        ${j.pays||j.origine ? `<span style="background:var(--yellow);color:var(--navy);font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">🌍 ${j.pays||j.origine}</span>` : ''}
        ${j.niveau ? `<span style="background:rgba(255,255,255,0.2);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">🎓 ${j.niveau}</span>` : ''}
        ${j.duree  ? `<span style="background:rgba(255,255,255,0.2);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">⏱ ${j.duree}</span>` : ''}
        ${j.intensite?`<span style="background:rgba(255,255,255,0.2);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">🔥 ${j.intensite}</span>` : ''}
        ${j.espace  ?`<span style="background:rgba(255,255,255,0.2);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">📍 ${j.espace}</span>` : ''}
        ${j.nb_joueurs_min?`<span style="background:rgba(255,255,255,0.2);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">👥 ${j.nb_joueurs_min}${j.nb_joueurs_max?'–'+j.nb_joueurs_max:''} joueurs</span>`:''}
      </div>
      <button onclick="closeModal()" style="position:absolute;top:1rem;right:1rem;font-family:Bangers,cursive;font-size:1.2rem;background:rgba(255,255,255,0.2);color:#fff;border:2px solid #fff;padding:0.2rem 0.8rem;cursor:pointer">✕ FERMER</button>
    </div>

    <!-- SCHÉMA DU TERRAIN -->
    <div style="padding:1rem 1.5rem;background:#fafafa;border-bottom:3px solid var(--navy)">
      <div style="font-family:Bangers,cursive;font-size:1rem;letter-spacing:2px;color:var(--navy);margin-bottom:0.5rem">📐 SCHÉMA DU TERRAIN</div>
      ${getTerrainSVG(j)}
    </div>

    <div style="padding:1.5rem 2rem;overflow-y:auto;max-height:60vh">
      ${j.but_du_jeu ? `<div class="modal-section">
        <div class="modal-section-title">🏆 BUT DU JEU</div>
        <div style="background:var(--yellow);border:3px solid var(--navy);padding:0.8rem 1rem;font-size:1rem;font-weight:bold;color:var(--navy);line-height:1.5">${j.but_du_jeu}</div>
      </div>` : ''}
      ${j.intentions_pedagogiques ? `<div class="modal-section"><div class="modal-section-title">🎯 INTENTIONS PÉDAGOGIQUES</div><p>${j.intentions_pedagogiques}</p></div>` : ''}
      <div class="modal-section"><div class="modal-section-title">📦 MATÉRIEL NÉCESSAIRE</div>${materielHtml}</div>
      ${j.disposition ? `<div class="modal-section"><div class="modal-section-title">📐 MISE EN PLACE</div><p>${j.disposition}</p></div>` : ''}
      ${derHtml ? `<div class="modal-section"><div class="modal-section-title">▶️ COMMENT JOUER — ÉTAPE PAR ÉTAPE</div>${derHtml}</div>` : ''}
      ${j.competences_motrices && j.competences_motrices.length ? `<div class="modal-section"><div class="modal-section-title">💪 COMPÉTENCES MOTRICES DÉVELOPPÉES</div>
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap">${(Array.isArray(j.competences_motrices)?j.competences_motrices:[j.competences_motrices]).map(c=>`<span style="background:${col};color:#fff;font-family:Bangers,cursive;font-size:0.85rem;letter-spacing:1px;padding:0.2rem 0.6rem">${c}</span>`).join('')}</div>
      </div>` : ''}
      ${variantesHtml ? `<div class="modal-section"><div class="modal-section-title">🔀 VARIANTES ET ADAPTATIONS</div>${variantesHtml}</div>` : ''}
      ${adapHtml ? `<div class="modal-section"><div class="modal-section-title">♿ ADAPTATIONS INCLUSIVES</div>${adapHtml}</div>` : ''}
      ${j.valeurs && j.valeurs.length ? `<div class="modal-section"><div class="modal-section-title">💚 VALEURS ÉDUCATIVES</div>
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap">${(Array.isArray(j.valeurs)?j.valeurs:[j.valeurs]).map(v=>`<span style="background:#f0fff4;border:2px solid #1a7f3c;color:#1a7f3c;font-family:Bangers,cursive;font-size:0.85rem;letter-spacing:1px;padding:0.2rem 0.6rem">✅ ${v}</span>`).join('')}</div>
      </div>` : ''}
      ${j.connexion_culturelle ? `<div class="modal-section"><div class="modal-section-title">🌍 CONNEXION CULTURELLE</div><p>${j.connexion_culturelle}</p></div>` : ''}
      ${j.lien_pfeq ? `<div class="modal-section"><div class="modal-section-title">📚 LIEN PFEQ</div><p>${j.lien_pfeq}</p></div>` : ''}
      ${j.regles ? `<div class="modal-section"><div class="modal-section-title">📋 RÈGLES DÉTAILLÉES</div><p>${Array.isArray(j.regles)?j.regles.join('<br><br>'):j.regles}</p></div>` : ''}
      ${j.consignes_securite ? `<div class="modal-section" style="background:#fff3cd;border:2px solid #e67e22;padding:0.8rem"><div class="modal-section-title" style="color:#e67e22">⚠️ SÉCURITÉ</div><p>${Array.isArray(j.consignes_securite)?j.consignes_securite.join('<br>'):j.consignes_securite}</p></div>` : ''}
    </div>
  `;

  document.getElementById('modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.body.style.overflow = '';
}

// Event listeners
document.getElementById('search').addEventListener('input', applyFilters);
document.getElementById('f-cat').addEventListener('change', applyFilters);
document.getElementById('f-niveau').addEventListener('change', applyFilters);
document.getElementById('f-espace').addEventListener('change', applyFilters);
document.getElementById('f-intensite').addEventListener('change', applyFilters);
document.getElementById('modal-backdrop').addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Add modal section styles
const style = document.createElement('style');
style.textContent = `
  .modal-section { margin-bottom: 1.2rem; }
  .modal-section-title { font-family:'Bangers',cursive; font-size:1.1rem; letter-spacing:2px; color:var(--navy); border-bottom:2px solid var(--yellow); margin-bottom:0.5rem; padding-bottom:0.2rem; }
  .modal-section p { margin:0; line-height:1.6; color:#223; }
  .modal-section ul { color:#223; line-height:1.6; }
`;
document.head.appendChild(style);

// Start
loadAll();
