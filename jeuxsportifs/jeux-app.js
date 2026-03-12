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

    return `
    <div class="zts-card" style="animation-delay:${delay}ms;cursor:pointer" onclick="openModal(${i})" tabindex="0" role="button" aria-label="${j.titre}">
      <div style="background:${col};padding:0.6rem 1rem;display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:Bangers,cursive;font-size:0.9rem;letter-spacing:2px;color:#fff">${label}</span>
        ${pays ? `<span style="font-size:0.8rem;background:rgba(255,255,255,0.2);color:#fff;padding:0.1rem 0.5rem;font-family:Bangers,cursive;letter-spacing:1px">${pays}</span>` : ''}
      </div>
      <div style="padding:1.2rem">
        <div style="font-family:Bangers,cursive;font-size:1.4rem;letter-spacing:2px;color:var(--navy);margin-bottom:0.4rem">${j.titre}</div>
        ${j.noms_alternatifs && j.noms_alternatifs.length ? `<div style="font-size:0.78rem;color:#556;margin-bottom:0.5rem;font-style:italic">${Array.isArray(j.noms_alternatifs)?j.noms_alternatifs.slice(0,2).join(' · '):j.noms_alternatifs}</div>` : ''}
        <div style="font-size:0.85rem;color:#334;line-height:1.4;margin-bottom:0.8rem">${(j.but_du_jeu || j.intentions_pedagogiques || '').substring(0,120)}${(j.but_du_jeu||'').length>120?'…':''}</div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          ${niveau ? `<span style="font-family:Bangers,cursive;font-size:0.8rem;letter-spacing:1px;padding:0.15rem 0.5rem;border:2px solid var(--navy);color:var(--navy)">${niveau}</span>` : ''}
          ${duree  ? `<span style="font-family:Bangers,cursive;font-size:0.8rem;letter-spacing:1px;padding:0.15rem 0.5rem;background:var(--yellow);border:2px solid var(--navy);color:var(--navy)">⏱ ${duree}</span>` : ''}
          ${intensite ? `<span style="font-family:Bangers,cursive;font-size:0.8rem;letter-spacing:1px;padding:0.15rem 0.5rem;background:${col};color:#fff">🔥 ${intensite}</span>` : ''}
        </div>
        ${materiel.length ? `<div style="margin-top:0.6rem;font-size:0.78rem;color:#556">📦 ${materiel.join(' · ')}</div>` : ''}
      </div>
      <div style="background:var(--yellow);border-top:3px solid var(--navy);padding:0.5rem 1rem;font-family:Bangers,cursive;font-size:1rem;letter-spacing:2px;color:var(--navy);text-align:center">→ VOIR LA FICHE</div>
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

  document.getElementById('modal-body').innerHTML = `
    <div style="background:${col};padding:1.5rem 2rem;border-bottom:4px solid var(--navy)">
      <div style="font-family:Bangers,cursive;font-size:2rem;letter-spacing:3px;color:#fff">${j.titre}</div>
      ${j.noms_alternatifs ? `<div style="color:rgba(255,255,255,0.8);font-size:0.9rem;margin-top:0.3rem">${Array.isArray(j.noms_alternatifs)?j.noms_alternatifs.join(' · '):j.noms_alternatifs}</div>` : ''}
      <div style="margin-top:0.5rem;display:flex;gap:0.5rem;flex-wrap:wrap">
        <span style="background:rgba(255,255,255,0.2);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">${label}</span>
        ${j.pays||j.origine ? `<span style="background:var(--yellow);color:var(--navy);font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">🌍 ${j.pays||j.origine}</span>` : ''}
        ${j.niveau ? `<span style="background:rgba(255,255,255,0.2);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">${j.niveau}</span>` : ''}
        ${j.duree  ? `<span style="background:rgba(255,255,255,0.2);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">⏱ ${j.duree}</span>` : ''}
        ${j.intensite?`<span style="background:rgba(255,255,255,0.2);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">🔥 ${j.intensite}</span>` : ''}
        ${j.espace  ?`<span style="background:rgba(255,255,255,0.2);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">📍 ${j.espace}</span>` : ''}
      </div>
      <button onclick="closeModal()" style="position:absolute;top:1rem;right:1rem;font-family:Bangers,cursive;font-size:1.2rem;background:rgba(255,255,255,0.2);color:#fff;border:2px solid #fff;padding:0.2rem 0.8rem;cursor:pointer">✕ FERMER</button>
    </div>
    <div style="padding:1.5rem 2rem;overflow-y:auto;max-height:70vh">
      ${j.intentions_pedagogiques ? `<div class="modal-section"><div class="modal-section-title">🎯 INTENTIONS PÉDAGOGIQUES</div><p>${j.intentions_pedagogiques}</p></div>` : ''}
      ${j.but_du_jeu ? `<div class="modal-section"><div class="modal-section-title">🏆 BUT DU JEU</div><p>${j.but_du_jeu}</p></div>` : ''}
      <div class="modal-section"><div class="modal-section-title">📦 MATÉRIEL</div>${materielHtml}</div>
      ${j.disposition ? `<div class="modal-section"><div class="modal-section-title">📐 DISPOSITION</div><p>${j.disposition}</p></div>` : ''}
      ${j.deroulement ? `<div class="modal-section"><div class="modal-section-title">▶️ DÉROULEMENT</div><p>${typeof j.deroulement === 'string' ? j.deroulement : JSON.stringify(j.deroulement)}</p></div>` : ''}
      ${variantesHtml ? `<div class="modal-section"><div class="modal-section-title">🔀 VARIANTES</div>${variantesHtml}</div>` : ''}
      ${adapHtml ? `<div class="modal-section"><div class="modal-section-title">♿ ADAPTATIONS INCLUSIVES</div>${adapHtml}</div>` : ''}
      ${j.connexion_culturelle ? `<div class="modal-section"><div class="modal-section-title">🌍 CONNEXION CULTURELLE</div><p>${j.connexion_culturelle}</p></div>` : ''}
      ${j.lien_pfeq ? `<div class="modal-section"><div class="modal-section-title">📚 LIEN PFEQ</div><p>${j.lien_pfeq}</p></div>` : ''}
      ${j.regles ? `<div class="modal-section"><div class="modal-section-title">📋 RÈGLES</div><p>${Array.isArray(j.regles)?j.regles.join('<br>'):j.regles}</p></div>` : ''}
      ${j.consignes_securite ? `<div class="modal-section"><div class="modal-section-title">⚠️ SÉCURITÉ</div><p>${Array.isArray(j.consignes_securite)?j.consignes_securite.join('<br>'):j.consignes_securite}</p></div>` : ''}
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
