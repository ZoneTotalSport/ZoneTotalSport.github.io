
const JEUX_SOURCES = [
  {
    key: 'ballon_chasseur',
    path: 'data/jeux/ballon_chasseur.json',
    label: 'Ballon Chasseur', icon: '🎯',
    barClass: 'bar-bc', badgeClass: 'badge-bc', catPillColor: '#CC0000'
  },
  {
    key: 'poursuite',
    path: 'data/jeux/poursuite.json',
    label: 'Poursuite', icon: '🏃',
    barClass: 'bar-poursuite', badgeClass: 'badge-poursuite', catPillColor: '#00B0A0'
  },
  {
    key: 'cooperation',
    path: 'data/jeux/cooperation.json',
    label: 'Coopération', icon: '🤝',
    barClass: 'bar-coop', badgeClass: 'badge-coop', catPillColor: '#007A4D'
  },
  {
    key: 'opposition',
    path: 'data/jeux/opposition.json',
    label: 'Opposition/Duel', icon: '⚔️',
    barClass: 'bar-oppo', badgeClass: 'badge-oppo', catPillColor: '#D63031'
  },
  {
    key: 'sports_collectifs',
    path: 'data/jeux/sports_collectifs.json',
    label: 'Sports Collectifs', icon: '🏅',
    barClass: 'bar-collectif', badgeClass: 'badge-collectif', catPillColor: '#E17055'
  },
  {
    key: 'sans_materiel',
    path: 'data/jeux/sans_materiel.json',
    label: 'Sans Matériel', icon: '🙌',
    barClass: 'bar-sans', badgeClass: 'badge-sans', catPillColor: '#6C5CE7'
  },
  {
    key: 'exterieur',
    path: 'data/jeux/exterieur.json',
    label: 'Extérieur', icon: '🌿',
    barClass: 'bar-collectif', badgeClass: 'badge-collectif', catPillColor: '#27AE60'
  },
];

const SAE_SOURCES = [
  {
    key: 'prescolaire',
    path: 'data/sae/prescolaire.json',
    label: 'Préscolaire', cycle: 'Préscolaire'
  },
  {
    key: 'primaire',
    path: 'data/sae/primaire.json',
    label: 'Primaire', cycle: 'Primaire'
  },
  {
    key: 'secondaire',
    path: 'data/sae/secondaire.json',
    label: 'Secondaire', cycle: 'Secondaire'
  },
  {
    key: 'cooperation',
    path: 'data/sae/cooperation.json',
    label: 'Coopération', cycle: 'Primaire', arrayKey: 'saes'
  },
  {
    key: 'collectifs',
    path: 'data/sae/collectifs.json',
    label: 'Sports Collectifs', cycle: 'Secondaire', arrayKey: 'saes'
  },
  {
    key: 'opposition',
    path: 'data/sae/opposition.json',
    label: 'Opposition', cycle: 'Secondaire'
  },
  {
    key: 'dodgeball',
    path: 'data/sae/dodgeball.json',
    label: 'Ballon Chasseur', cycle: 'Primaire/Secondaire'
  },
  {
    key: 'locomotion',
    path: 'data/sae/locomotion.json',
    label: 'Locomotion', cycle: 'Primaire'
  },
  {
    key: 'mobilite',
    path: 'data/sae/mobilite.json',
    label: 'Mobilité', cycle: 'Primaire/Secondaire'
  },
];

const state = {
  allJeux: [],
  allSAE: [],
  filteredJeux: [],
  filteredSAE: [],
  currentTab: 'jeux',
};

document.addEventListener('DOMContentLoaded', async () => {
  try { drawBackground(); window.addEventListener('resize', drawBackground); } catch(e) {}

  setupNavigation();
  progress(10);

  try { await loadJeux(); } catch(e) { console.warn('jeux load error:', e); }
  progress(60);

  try { await loadSAE(); } catch(e) { console.warn('sae load error:', e); }
  progress(90);

  try { renderJeux(); }        catch(e) { console.error('renderJeux:', e); }
  try { renderSAE(); }         catch(e) { console.error('renderSAE:', e); }
  try { renderMusique(); }     catch(e) { console.error('renderMusique:', e); }
  try { setupSearch(); }       catch(e) { console.error('setupSearch:', e); }
  try { updateHeaderStats(); } catch(e) {}

  progress(100);
  setTimeout(hideLoading, 400);
});

function drawBackground() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const ctx = canvas.getContext('2d');
  const W   = canvas.width;
  const H   = canvas.height;

  const ox = W;
  const oy = H;
  const maxR = Math.sqrt(W * W + H * H) * 1.1;

  ctx.fillStyle = '#00CCFF';
  ctx.fillRect(0, 0, W, H);

  const totalSectors = 22; // nombre de secteurs (jaune + cyan alternés)
  const sectorAngle  = (Math.PI * 2) / totalSectors;
  const startAngle   = Math.PI * 0.75;

  for (let i = 0; i < totalSectors; i += 2) {
    const a1 = startAngle + i * sectorAngle;
    const a2 = startAngle + (i + 1) * sectorAngle;

    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.arc(ox, oy, maxR, a1, a2);
    ctx.closePath();
    ctx.fillStyle = '#FFE000';
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.fillRect(0, 0, W, H);
}

function setupNavigation() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
      document.getElementById(`tab-${target}`).classList.add('active');
      state.currentTab = target;
    });
  });
}

async function loadJeux() {
  const results = await Promise.allSettled(
    JEUX_SOURCES.map(src =>
      fetch(src.path)
        .then(r => r.json())
        .then(data => ({ src, data }))
    )
  );

  results.forEach(result => {
    if (result.status !== 'fulfilled') return;
    const { src, data } = result.value;
    const jeux = data.jeux || data.items || [];

    jeux.forEach(jeu => {
      state.allJeux.push({
        ...jeu,
        _src: src,
        _key: src.key,
      });
    });
  });

  state.filteredJeux = [...state.allJeux];
}

async function loadSAE() {
  const results = await Promise.allSettled(
    SAE_SOURCES.map(src =>
      fetch(src.path)
        .then(r => r.json())
        .then(data => ({ src, data }))
    )
  );

  results.forEach(result => {
    if (result.status !== 'fulfilled') return;
    const { src, data } = result.value;
    const items = (src.arrayKey ? data[src.arrayKey] : null)
               || data.sae || data.saes || data.jeux || data.items || [];

    items.forEach(item => {
      state.allSAE.push({
        ...item,
        _src: src,
        _cycle: src.cycle,
        _fileLabel: src.label,
      });
    });
  });

  state.filteredSAE = [...state.allSAE];
}

function renderJeux() {
  const grid = document.getElementById('jeux-grid');

  if (state.filteredJeux.length === 0) {
    grid.innerHTML = `<div class="empty-state">🔍 AUCUN JEU TROUVÉ<br><small style="font-size:1rem">Essaie d'autres filtres</small></div>`;
    updateJeuxStats();
    return;
  }

  grid.innerHTML = state.filteredJeux.map((jeu, idx) => buildJeuCard(jeu, idx)).join('');

  grid.querySelectorAll('.game-card').forEach((card, i) => {
    card.addEventListener('click', () => openJeuModal(state.filteredJeux[i]));
  });

  updateJeuxStats();
}

function buildJeuCard(jeu, idx) {
  const src      = jeu._src || {};
  const titre    = jeu.titre || jeu.nom || 'Jeu sans titre';
  const origine  = jeu.origine || jeu.pays_origine || '';
  const niveau   = jeu.niveau  || (jeu.age_min ? `${jeu.age_min}–${jeu.age_max} ans` : '');
  const duree    = jeu.duree   || '';
  const joueurs  = jeu.nb_joueurs_min && jeu.nb_joueurs_max
    ? `${jeu.nb_joueurs_min}–${jeu.nb_joueurs_max}`
    : (jeu.nb_joueurs || '');
  const espace   = jeu.espace  || '';
  const intensite = jeu.niveau_activite || '';
  const intentions = jeu.intentions_pedagogiques || jeu.description || '';
  const tags     = (jeu.tags || []).slice(0, 3);

  const intensiteClass = getIntensite(intensite);
  const barClass   = src.barClass   || 'bar-default';
  const badgeClass = src.badgeClass || '';

  return `
    <div class="game-card" data-idx="${idx}">
      <div class="card-top-bar ${barClass}"></div>
      <div class="card-body">
        <div class="card-meta-top">
          ${src.label ? `<span class="card-category-badge ${badgeClass}">${src.icon || ''} ${src.label}</span>` : ''}
          ${origine ? `<span>🌍 ${origine}</span>` : ''}
        </div>
        <h3 class="card-titre">${titre}</h3>
        ${intentions ? `<p class="card-desc">${intentions.substring(0, 100)}${intentions.length > 100 ? '...' : ''}</p>` : ''}
        <div class="card-info-grid">
          ${niveau   ? `<div class="card-info-item">📅 ${niveau}</div>`              : ''}
          ${duree    ? `<div class="card-info-item">⏱️ ${duree}</div>`               : ''}
          ${joueurs  ? `<div class="card-info-item">👥 ${joueurs} joueurs</div>`    : ''}
          ${espace   ? `<div class="card-info-item">🏟️ ${espace}</div>`             : ''}
        </div>
        <div class="card-tags-row">
          ${tags.map(t => `<span class="ctag">${t}</span>`).join('')}
          ${intensite ? `<span class="ctag ${intensiteClass}">⚡ ${intensite}</span>` : ''}
        </div>
      </div>
      <div class="card-footer">👉 VOIR LE JEU</div>
    </div>
  `;
}

function getIntensite(val) {
  if (!val) return '';
  const v = val.toLowerCase();
  if (v.includes('élevé') || v.includes('eleve') || v.includes('intense') || v.includes('haute')) return 'intensite-eleve';
  if (v.includes('modéré') || v.includes('modere') || v.includes('moyen'))  return 'intensite-modere';
  if (v.includes('faible') || v.includes('léger') || v.includes('leger'))   return 'intensite-faible';
  return 'intensite-variable';
}

function openJeuModal(jeu) {
  const src      = jeu._src || {};
  const titre    = jeu.titre    || jeu.nom            || 'Jeu';
  const origine  = jeu.origine  || jeu.pays_origine   || 'Monde';
  const niveau   = jeu.niveau   || `${jeu.age_min || '?'}–${jeu.age_max || '?'} ans`;
  const duree    = jeu.duree    || '?';
  const joueurs  = jeu.nb_joueurs_min ? `${jeu.nb_joueurs_min}–${jeu.nb_joueurs_max}` : (jeu.nb_joueurs || '?');
  const espace   = jeu.espace   || '?';
  const intensite = jeu.niveau_activite || '';
  const materiel = Array.isArray(jeu.materiel)
    ? jeu.materiel.join(', ')
    : (jeu.materiel || 'Aucun');

  const intentions  = jeu.intentions_pedagogiques  || '';
  const butDuJeu    = jeu.but_du_jeu               || '';
  const disposition = jeu.disposition              || '';
  const deroulement = jeu.deroulement              || '';
  const variantes   = Array.isArray(jeu.variantes)   ? jeu.variantes  : (jeu.variantes  ? [jeu.variantes]  : []);
  const competences = Array.isArray(jeu.competences_motrices) ? jeu.competences_motrices : [];
  const valeurs     = Array.isArray(jeu.valeurs)     ? jeu.valeurs    : [];
  const adaptations = jeu.adaptations_besoins_speciaux || '';
  const tags        = Array.isArray(jeu.tags)        ? jeu.tags       : [];

  const html = `
    <div class="modal-head">
      <div class="modal-icon">${src.icon || '🎮'}</div>
      <div class="modal-titre">${titre}</div>
      <div class="modal-sub">
        🌍 ${origine}
        ${src.label ? ` &nbsp;·&nbsp; ${src.label}` : ''}
        ${intensite  ? ` &nbsp;·&nbsp; ⚡ ${intensite}`  : ''}
      </div>
      <button class="modal-close-btn" id="closeBtn">✕ FERMER</button>
    </div>
    <div class="modal-content-body">
      <div class="modal-meta-row">
        <div class="meta-chip chip-yellow"><span class="meta-chip-label">NIVEAU</span><span class="meta-chip-val">${niveau}</span></div>
        <div class="meta-chip chip-cyan">  <span class="meta-chip-label">DURÉE</span><span class="meta-chip-val">${duree}</span></div>
        <div class="meta-chip chip-white"> <span class="meta-chip-label">JOUEURS</span><span class="meta-chip-val">${joueurs}</span></div>
        <div class="meta-chip chip-yellow"><span class="meta-chip-label">ESPACE</span><span class="meta-chip-val">${espace}</span></div>
        <div class="meta-chip chip-white"> <span class="meta-chip-label">MATÉRIEL</span><span class="meta-chip-val" style="font-size:0.78rem">${materiel}</span></div>
      </div>

      ${intentions ? modalSection('🎯 INTENTIONS PÉDAGOGIQUES', intentions) : ''}
      ${butDuJeu   ? modalSection('🏆 BUT DU JEU', butDuJeu, 'cyan-accent') : ''}
      ${disposition? modalSection('📐 DISPOSITION', disposition) : ''}
      ${deroulement? modalSection('▶️ DÉROULEMENT', deroulement, 'red-accent') : ''}

      ${variantes.length ? `
        <div class="modal-section cyan-accent">
          <div class="modal-section-title">🔄 VARIANTES</div>
          <ul class="modal-list">
            ${variantes.map(v => `<li>${v}</li>`).join('')}
          </ul>
        </div>` : ''}

      ${competences.length ? `
        <div class="modal-section">
          <div class="modal-section-title">💪 COMPÉTENCES MOTRICES</div>
          <div class="modal-tag-row">
            ${competences.map(c => `<span class="modal-tag">${c}</span>`).join('')}
          </div>
        </div>` : ''}

      ${valeurs.length ? `
        <div class="modal-section">
          <div class="modal-section-title">⭐ VALEURS</div>
          <div class="modal-tag-row">
            ${valeurs.map(v => `<span class="modal-tag modal-tag-cyan">${v}</span>`).join('')}
          </div>
        </div>` : ''}

      ${adaptations ? modalSection('♿ ADAPTATIONS', adaptations) : ''}

      ${tags.length ? `
        <div class="modal-tag-row" style="margin-top:1rem">
          ${tags.map(t => `<span class="modal-tag">${t}</span>`).join('')}
        </div>` : ''}
    </div>
  `;

  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  document.getElementById('closeBtn').addEventListener('click', closeModal);
}

function renderSAE() {
  const grid = document.getElementById('sae-grid');

  if (state.filteredSAE.length === 0) {
    grid.innerHTML = `<div class="empty-state">🔍 AUCUNE SAÉ TROUVÉE<br><small style="font-size:1rem">Essaie d'autres filtres</small></div>`;
    updateSAEStats();
    return;
  }

  grid.innerHTML = state.filteredSAE.map((sae, idx) => buildSAECard(sae, idx)).join('');

  grid.querySelectorAll('.game-card').forEach((card, i) => {
    card.addEventListener('click', () => openSAEModal(state.filteredSAE[i]));
  });

  updateSAEStats();
}

function buildSAECard(sae, idx) {
  const titre   = sae.titre || 'SAÉ sans titre';
  const niveau  = sae.niveau || sae._cycle || sae._fileLabel || '';
  const cycle   = sae.cycle  || sae._cycle || '';
  const duree   = sae.duree_periodes
    ? `${sae.duree_periodes} × ${sae.duree_par_periode || '?'}`
    : (sae.duree || '');
  const moyenAction  = sae.moyen_action || '';
  const origMondiale = sae.origine_mondiale || '';
  const tags         = (sae.tags || []).slice(0, 3);

  return `
    <div class="game-card" data-idx="${idx}">
      <div class="card-top-bar bar-sae"></div>
      <div class="card-body">
        <div class="card-meta-top">
          <span class="card-category-badge badge-sae">📚 ${niveau}</span>
          ${origMondiale ? `<span>🌍 ${origMondiale.substring(0, 30)}${origMondiale.length > 30 ? '...' : ''}</span>` : ''}
        </div>
        <h3 class="card-titre">${titre}</h3>
        ${moyenAction ? `<p class="card-desc">${moyenAction}</p>` : ''}
        <div class="card-info-grid">
          ${duree ? `<div class="card-info-item">⏱️ ${duree}</div>` : ''}
          ${cycle ? `<div class="card-info-item">📖 ${cycle}</div>` : ''}
        </div>
        <div class="card-tags-row">
          ${tags.map(t => `<span class="ctag">${t}</span>`).join('')}
        </div>
      </div>
      <div class="card-footer">👉 VOIR LA SAÉ</div>
    </div>
  `;
}

function openSAEModal(sae) {
  const titre       = sae.titre || 'SAÉ';
  const niveau      = sae.niveau     || sae._fileLabel || '';
  const cycle       = sae.cycle      || sae._cycle     || '';
  const duree       = sae.duree_periodes
    ? `${sae.duree_periodes} périodes × ${sae.duree_par_periode || '?'}`
    : (sae.duree || '?');
  const espace      = sae.espace     || '?';
  const origMon     = sae.origine_mondiale       || '';
  const intentions  = sae.intentions_pedagogiques || '';
  const competence  = sae.competence_pfeq         || '';
  const composante  = sae.composante              || '';
  const moyenAction = sae.moyen_action             || '';
  const situDepart  = sae.situation_depart         || '';
  const tacheCompl  = sae.tache_complexe           || '';
  const deroulement = sae.deroulement              || {};
  const criteres    = Array.isArray(sae.criteres_evaluation) ? sae.criteres_evaluation : [];
  const grille      = sae.grille_evaluation        || null;
  const adaptations = sae.adaptations              || null;
  const variantes   = Array.isArray(sae.variantes)   ? sae.variantes  : [];
  const valeurs     = Array.isArray(sae.valeurs)     ? sae.valeurs    : [];
  const tags        = Array.isArray(sae.tags)        ? sae.tags       : [];

  const deroSteps = [
    deroulement.mise_en_train       ? `<li><strong>Mise en train:</strong> ${deroulement.mise_en_train}</li>`         : '',
    deroulement.partie_principale_1 ? `<li><strong>Partie principale 1:</strong> ${deroulement.partie_principale_1}</li>` : '',
    deroulement.partie_principale_2 ? `<li><strong>Partie principale 2:</strong> ${deroulement.partie_principale_2}</li>` : '',
    deroulement.retour_au_calme     ? `<li><strong>Retour au calme:</strong> ${deroulement.retour_au_calme}</li>`     : '',
  ].filter(Boolean).join('');

  const html = `
    <div class="modal-head">
      <div class="modal-icon">📚</div>
      <div class="modal-titre">${titre}</div>
      <div class="modal-sub">
        ${niveau} ${cycle ? `· ${cycle}` : ''}
        ${origMon ? ` &nbsp;·&nbsp; 🌍 ${origMon.substring(0, 60)}` : ''}
      </div>
      <button class="modal-close-btn" id="closeBtn">✕ FERMER</button>
    </div>
    <div class="modal-content-body">
      <div class="modal-meta-row">
        <div class="meta-chip chip-cyan">  <span class="meta-chip-label">NIVEAU</span><span class="meta-chip-val">${niveau}</span></div>
        <div class="meta-chip chip-yellow"><span class="meta-chip-label">CYCLE</span><span class="meta-chip-val">${cycle || '?'}</span></div>
        <div class="meta-chip chip-white"> <span class="meta-chip-label">DURÉE</span><span class="meta-chip-val">${duree}</span></div>
        <div class="meta-chip chip-yellow"><span class="meta-chip-label">ESPACE</span><span class="meta-chip-val">${espace}</span></div>
        ${moyenAction ? `<div class="meta-chip chip-cyan"><span class="meta-chip-label">MOYEN D'ACTION</span><span class="meta-chip-val" style="font-size:0.78rem">${moyenAction}</span></div>` : ''}
      </div>

      ${intentions  ? modalSection('🎯 INTENTIONS PÉDAGOGIQUES', intentions) : ''}

      ${competence  ? `
        <div class="modal-section cyan-accent">
          <div class="modal-section-title">📋 COMPÉTENCE PFEQ</div>
          <p class="modal-text">${competence}</p>
          ${composante ? `<p class="modal-text" style="margin-top:0.5rem"><strong>Composante:</strong> ${composante}</p>` : ''}
        </div>` : ''}

      ${origMon     ? modalSection('🌍 ORIGINE MONDIALE', origMon, 'cyan-accent') : ''}
      ${situDepart  ? modalSection('🌟 SITUATION DE DÉPART', situDepart)          : ''}
      ${tacheCompl  ? modalSection('💡 TÂCHE COMPLEXE', tacheCompl, 'red-accent') : ''}

      ${deroSteps   ? `
        <div class="modal-section">
          <div class="modal-section-title">▶️ DÉROULEMENT</div>
          <ul class="modal-list">${deroSteps}</ul>
        </div>` : ''}

      ${criteres.length ? `
        <div class="modal-section cyan-accent">
          <div class="modal-section-title">✅ CRITÈRES D'ÉVALUATION</div>
          <ul class="modal-list">
            ${criteres.map(c => `<li>${c}</li>`).join('')}
          </ul>
        </div>` : ''}

      ${grille ? `
        <div class="modal-section">
          <div class="modal-section-title">📊 GRILLE D'ÉVALUATION</div>
          <div class="eval-grid">
            ${grille.tres_bien ? `<div class="eval-cell eval-tres-bien"><div class="eval-level">⭐ TRÈS BIEN</div><div class="eval-desc">${grille.tres_bien}</div></div>` : ''}
            ${grille.bien      ? `<div class="eval-cell eval-bien">     <div class="eval-level">✅ BIEN</div>     <div class="eval-desc">${grille.bien}</div></div>` : ''}
            ${grille.en_developpement ? `<div class="eval-cell eval-en-dev"><div class="eval-level">📈 EN DÉVELOPPEMENT</div><div class="eval-desc">${grille.en_developpement}</div></div>` : ''}
          </div>
        </div>` : ''}

      ${variantes.length ? `
        <div class="modal-section">
          <div class="modal-section-title">🔄 VARIANTES</div>
          <ul class="modal-list">
            ${variantes.map(v => `<li>${v}</li>`).join('')}
          </ul>
        </div>` : ''}

      ${valeurs.length ? `
        <div class="modal-section">
          <div class="modal-section-title">⭐ VALEURS</div>
          <div class="modal-tag-row">
            ${valeurs.map(v => `<span class="modal-tag modal-tag-cyan">${v}</span>`).join('')}
          </div>
        </div>` : ''}

      ${tags.length ? `
        <div class="modal-tag-row" style="margin-top:1rem">
          ${tags.map(t => `<span class="modal-tag">${t}</span>`).join('')}
        </div>` : ''}
    </div>
  `;

  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  document.getElementById('closeBtn').addEventListener('click', closeModal);
}

function modalSection(title, content, extraClass = '') {
  return `
    <div class="modal-section ${extraClass}">
      <div class="modal-section-title">${title}</div>
      <p class="modal-text">${content}</p>
    </div>`;
}

function renderMusique() {
  const bpmMoments = [
    { moment: 'ENTRÉE EN CLASSE',     bpm: '90–110',  desc: 'Signal de transition, concentration',         icon: '🚶' },
    { moment: 'ÉCHAUFFEMENT',         bpm: '115–135', desc: 'Élever progressivement le rythme cardiaque',  icon: '🔥' },
    { moment: 'APPRENTISSAGE',        bpm: '120–145', desc: 'Ambiance, signal de départ et d\'arrêt',      icon: '📚' },
    { moment: 'JEU / COMPÉTITION',    bpm: '140–165', desc: 'Énergie maximale, ambiance compétitive',      icon: '🏆' },
    { moment: 'RETOUR AU CALME',      bpm: '60–85',   desc: 'Réduction progressive du rythme cardiaque',   icon: '🧘' },
    { moment: 'BILAN / OBJECTIVATION',bpm: '50–70',   desc: 'Fond calme pour la discussion de groupe',     icon: '💭' },
  ];

  const bpmActivites = [
    { moment: 'Ballon Chasseur',      bpm: '140–155', desc: 'Electronic, Hip-Hop instrumental, Rock Sport', icon: '🎯' },
    { moment: 'Poursuite / Chat',     bpm: '150–165', desc: 'Electronic rapide, Drum and Bass léger',       icon: '🏃' },
    { moment: 'Sports Collectifs',    bpm: '135–150', desc: 'Hip-Hop instrumental, Pop Sport',              icon: '🏀' },
    { moment: 'Coopération',          bpm: '100–120', desc: 'Acoustique positif, Pop douce, bienveillant',  icon: '🤝' },
    { moment: 'Badminton / Raquettes',bpm: '120–135', desc: 'Pop légère, Jazz moderne, focalisante',        icon: '🏸' },
    { moment: 'Yoga / Méditation',    bpm: '40–65',   desc: 'Classique, Ambient, Sons de nature',           icon: '🧘' },
    { moment: 'Danse / Expression',   bpm: '85–130',  desc: 'Hip-Hop 85-95 · Pop 115-130 · Classique libre',icon: '💃' },
    { moment: 'Circuits / Stations',  bpm: '130–145', desc: 'Electronic, Gym Music + signal de cloche',    icon: '⚡' },
  ];

  const sources = [
    { name: 'YouTube Audio Library', badge: 'GRATUIT',  badgeClass: 'badge-free', bpm: 'Tous BPM', desc: 'Bibliothèque officielle YouTube — milliers de pistes classées par genre et humeur.', url: 'https://studio.youtube.com/channel/UC/music' },
    { name: 'Pixabay Music',         badge: 'CC0',      badgeClass: 'badge-cc0',  bpm: 'Tous BPM', desc: 'Totalement libre de droits · Idéal pour l\'éducation sans aucune restriction.', url: 'https://pixabay.com/music/' },
    { name: 'Free Music Archive',    badge: 'CC',       badgeClass: 'badge-cc',   bpm: 'Tous BPM', desc: 'Archive mondiale de musiques Creative Commons · Catégories Sport, World, Electronic.', url: 'https://freemusicarchive.org/' },
    { name: 'Incompetech',           badge: 'CC-BY',    badgeClass: 'badge-cc',   bpm: 'Par BPM',  desc: 'Catalogue trié par BPM et par ambiance · Parfait pour l\'enseignement en ÉPS.', url: 'https://incompetech.com/' },
    { name: 'Mixkit',                badge: 'GRATUIT',  badgeClass: 'badge-free', bpm: '120–160',  desc: 'Musique + effets sonores sport · Téléchargement sans compte requis.', url: 'https://mixkit.co/free-stock-music/' },
    { name: 'Musopen',               badge: 'CC0',      badgeClass: 'badge-cc0',  bpm: '40–80',    desc: 'Musique classique libre de droits · Idéal pour retour au calme et yoga.', url: 'https://musopen.org/' },
    { name: 'Moby Gratis',           badge: 'GRATUIT',  badgeClass: 'badge-free', bpm: '50–90',    desc: 'Musiques ambient de Moby offertes gratuitement aux enseignants et éducateurs.', url: 'https://mobygratis.com/' },
    { name: 'ccMixter',              badge: 'CC',       badgeClass: 'badge-cc',   bpm: '100–160',  desc: 'Remix communautaire Creative Commons · Electronic et Hip-Hop instrumental.', url: 'https://ccmixter.org/' },
    { name: 'Jamendo',               badge: 'CC',       badgeClass: 'badge-cc',   bpm: 'Tous BPM', desc: 'Artistes indépendants · Usage pédagogique gratuit · Grande variété culturelle.', url: 'https://www.jamendo.com/' },
    { name: 'Freesound',             badge: 'EFFETS',   badgeClass: 'badge-fx',   bpm: 'Effets',   desc: 'Base de données d\'effets sonores · Sifflets, cloches, air horn, fanfares.', url: 'https://freesound.org/' },
    { name: 'Bensound',              badge: 'GRATUIT',  badgeClass: 'badge-free', bpm: '90–150',   desc: 'Musique instrumentale professionnelle · Pop, Acoustic, Corporate, Upbeat.', url: 'https://www.bensound.com/' },
    { name: 'Free PD',               badge: 'DOMAINE PUBLIC', badgeClass: 'badge-cc0', bpm: 'Classique', desc: 'Musique du domaine public uniquement · 0% risque légal pour l\'enseignement.', url: 'https://freepd.com/' },
  ];

  const signaux = [
    { signal: '⚽ Départ',          son: 'Sifflet court (1×)',      signification: 'Commencer l\'activité' },
    { signal: '🛑 Arrêt immédiat',  son: '3 coups de sifflet',      signification: 'STOP — urgence ou fin' },
    { signal: '📣 Rassemblement',   son: '2 coups longs',            signification: 'Regroupement des élèves' },
    { signal: '🔔 Changement',      son: 'Cloche ou ding',           signification: 'Rotation de station' },
    { signal: '⏸️ Pause',           son: 'Air horn court',           signification: 'Arrêt temporaire' },
    { signal: '🏆 Victoire',        son: 'Fanfare courte',           signification: 'Célébration · Félicitations' },
    { signal: '🏁 Fin du cours',    son: 'Musique douce qui monte',  signification: 'Rangement et transition' },
  ];

  const html = `
    <h3 class="music-h3">⏱️ STRUCTURE D'UN COURS ÉPS PAR BPM</h3>
    <div class="bpm-grid">
      ${bpmMoments.map(item => `
        <div class="bpm-card">
          <div class="bpm-moment">${item.icon} ${item.moment}</div>
          <div class="bpm-number">${item.bpm}</div>
          <div class="bpm-unit">BPM</div>
          <div class="bpm-desc">${item.desc}</div>
        </div>`).join('')}
    </div>

    <h3 class="music-h3">🏃 BPM PAR TYPE D'ACTIVITÉ ÉPS</h3>
    <div class="bpm-grid">
      ${bpmActivites.map(item => `
        <div class="bpm-card">
          <div class="bpm-moment">${item.icon} ${item.moment}</div>
          <div class="bpm-number">${item.bpm}</div>
          <div class="bpm-unit">BPM</div>
          <div class="bpm-desc">${item.desc}</div>
        </div>`).join('')}
    </div>

    <h3 class="music-h3">🎼 20+ SOURCES DE MUSIQUE GRATUITE</h3>
    <div class="sources-grid">
      ${sources.map(s => `
        <div class="source-card">
          <span class="source-badge ${s.badgeClass}">${s.badge}</span>
          <div class="source-name">${s.name}</div>
          <div class="source-bpm">📊 ${s.bpm}</div>
          <div class="source-desc">${s.desc}</div>
          <a href="${s.url}" target="_blank" rel="noopener" class="source-link">🔗 ACCÉDER AU SITE</a>
        </div>`).join('')}
    </div>

    <h3 class="music-h3">🔊 SIGNAUX SONORES RECOMMANDÉS EN ÉPS</h3>
    <table class="signals-table">
      <thead>
        <tr>
          <th>Signal</th>
          <th>Son recommandé</th>
          <th>Signification</th>
        </tr>
      </thead>
      <tbody>
        ${signaux.map(s => `
          <tr>
            <td>${s.signal}</td>
            <td>${s.son}</td>
            <td>${s.signification}</td>
          </tr>`).join('')}
      </tbody>
    </table>

    <div style="background:var(--black);border:5px solid var(--yellow);padding:1.5rem;box-shadow:var(--shadow-l);margin-top:2rem">
      <h3 style="font-family:'Bangers',cursive;font-size:1.8rem;color:var(--yellow);letter-spacing:3px;margin-bottom:1rem">📊 EFFETS DE LA MUSIQUE SUR L'ACTIVITÉ PHYSIQUE</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem">
        ${[
          { stat: '+15–20%', desc: 'd\'effort lors d\'activités avec musique motivante' },
          { stat: '60–70 BPM', desc: 'favorise la mémorisation (onde alpha cérébrale)' },
          { stat: 'Sans paroles', desc: 'réduit la distraction cognitive chez les élèves' },
          { stat: 'Culturelle', desc: 'facilite l\'ouverture à la diversité mondiale' },
        ].map(item => `
          <div style="border:3px solid var(--yellow);padding:1rem;text-align:center">
            <div style="font-family:'Bangers',cursive;font-size:2rem;color:var(--yellow);letter-spacing:2px">${item.stat}</div>
            <div style="font-size:0.82rem;color:#ccc;margin-top:0.3rem;font-weight:700">${item.desc}</div>
          </div>`).join('')}
      </div>
    </div>
  `;

  document.getElementById('musique-content').innerHTML = html;
}

function setupSearch() {
  ['jeux-search', 'jeux-category', 'jeux-niveau', 'jeux-espace', 'jeux-intensite'].forEach(id => {
    document.getElementById(id).addEventListener('input', filterJeux);
    document.getElementById(id).addEventListener('change', filterJeux);
  });

  ['sae-search', 'sae-cycle', 'sae-competence'].forEach(id => {
    document.getElementById(id).addEventListener('input', filterSAE);
    document.getElementById(id).addEventListener('change', filterSAE);
  });
}

function filterJeux() {
  const q        = document.getElementById('jeux-search').value.toLowerCase().trim();
  const category = document.getElementById('jeux-category').value;
  const niveau   = document.getElementById('jeux-niveau').value;
  const espace   = document.getElementById('jeux-espace').value;
  const intensite = document.getElementById('jeux-intensite').value;

  state.filteredJeux = state.allJeux.filter(jeu => {
    const text = [jeu.titre, jeu.nom, jeu.origine, ...(jeu.tags || [])].join(' ').toLowerCase();
    if (q && !text.includes(q)) return false;
    if (category && jeu._key !== category) return false;
    if (espace && jeu.espace !== espace) return false;
    if (intensite && !(jeu.niveau_activite || '').toLowerCase().includes(intensite.toLowerCase())) return false;

    if (niveau) {
      const nv  = (jeu.niveau || '').toLowerCase();
      const ageMin = jeu.age_min || 0;
      const ageMax = jeu.age_max || 99;
      if (niveau === 'prescolaire' && !(nv.includes('préscolaire') || nv.includes('maternelle') || ageMax <= 6))  return false;
      if (niveau === 'primaire'    && !(nv.includes('primaire')    || (ageMin <= 12 && ageMax >= 6)))              return false;
      if (niveau === 'secondaire'  && !(nv.includes('secondaire')  || ageMin >= 11))                              return false;
    }

    return true;
  });

  renderJeux();
}

function filterSAE() {
  const q         = document.getElementById('sae-search').value.toLowerCase().trim();
  const cycle     = document.getElementById('sae-cycle').value;
  const competence = document.getElementById('sae-competence').value;

  state.filteredSAE = state.allSAE.filter(sae => {
    const text = [sae.titre, sae.moyen_action, ...(sae.tags || [])].join(' ').toLowerCase();
    if (q && !text.includes(q)) return false;
    if (cycle && !(sae.cycle || sae._cycle || '').includes(cycle)) return false;
    if (competence) {
      const ma = (sae.moyen_action || '').toLowerCase();
      const cp = (sae.competence_pfeq || '').toLowerCase();
      if (!ma.includes(competence.toLowerCase()) && !cp.includes(competence.toLowerCase())) return false;
    }
    return true;
  });

  renderSAE();
}

function updateJeuxStats() {
  const total  = state.filteredJeux.length;
  const pays   = new Set(state.filteredJeux.map(j => j.origine || '').filter(Boolean)).size;
  document.getElementById('jeux-count').textContent = `${total} JEUX`;
  document.getElementById('jeux-pays').textContent  = `${pays} ORIGINES`;
}

function updateSAEStats() {
  const total  = state.filteredSAE.length;
  const pays   = new Set(state.filteredSAE.map(s => s.origine_mondiale || '').filter(Boolean)).size;
  document.getElementById('sae-count').textContent = `${total} SAÉ`;
  document.getElementById('sae-pays').textContent  = `${pays} CULTURES`;
}

function updateHeaderStats() {
  document.getElementById('hstat-jeux').innerHTML = `${state.allJeux.length}<span>JEUX</span>`;
  document.getElementById('hstat-sae').innerHTML  = `${state.allSAE.length}<span>SAÉ</span>`;
  const allPays = new Set([
    ...state.allJeux.map(j => j.origine || ''),
    ...state.allSAE.map(s => s.origine_mondiale || ''),
  ].filter(Boolean)).size;
  document.getElementById('hstat-pays').innerHTML = `${allPays}<span>PAYS</span>`;
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

document.getElementById('modal-backdrop').addEventListener('click', closeModal);

function progress(pct) {
  const bar = document.getElementById('loadProgress');
  if (bar) bar.style.width = pct + '%';
}

function hideLoading() {
  const loading = document.getElementById('loading');
  const app     = document.getElementById('app');
  loading.style.opacity = '0';
  loading.style.transition = 'opacity 0.5s';
  setTimeout(() => {
    loading.classList.add('hidden');
    app.classList.remove('hidden');
  }, 500);
}
