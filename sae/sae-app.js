/* sae-app.js — Zone Total Sport: SAÉ PFEQ */

const SAE_FILES = [
  // Banque principale 1000+ SAÉ (maternelle → 6e année)
  '../data/sae/sae_banque_01.json',
  '../data/sae/sae_banque_02.json',
  '../data/sae/sae_banque_03.json',
  '../data/sae/sae_banque_04.json',
  '../data/sae/sae_banque_05.json',
  '../data/sae/sae_banque_06.json',
  '../data/sae/sae_banque_07.json',
  '../data/sae/sae_banque_08.json',
  '../data/sae/sae_banque_09.json',
  '../data/sae/sae_banque_10.json',
  '../data/sae/sae_banque_11.json',
  // Fichiers supplémentaires spécialisés
  '../data/sae/sae_manipulation_prescolaire.json',
  '../data/sae/sae_manipulation_primaire.json',
  '../data/sae/sae_manipulation_secondaire.json',
  '../data/sae/sae_cooperation_primaire.json',
  '../data/sae/sae_jeux_collectifs.json',
  '../data/sae/sae_opposition.json',
  '../data/sae/sae_dodgeball.json',
  '../data/sae/sae_locomotion.json',
  '../data/sae/sae_mobilite.json',
  '../data/sae/sae_expression_danse.json',
  '../data/sae/sae_poursuite_tous.json',
];

const CYCLE_COLORS = {
  'Préscolaire':   '#e67e22',
  '1er cycle':     '#27ae60',
  '2e cycle':      '#2980b9',
  '3e cycle':      '#8e44ad',
  'Secondaire':    '#c0392b',
};
const COMP_COLORS = {
  'Manipulation':  '#004EBF',
  'Locomotion':    '#1a7f3c',
  'Mobilité':      '#7b1fa2',
  'Coopération':   '#e67e22',
  'Opposition':    '#c0392b',
  'Poursuite':     '#0097a7',
  'Collectif':     '#d35400',
  'Expression':    '#ad1457',
  'Raquettes':     '#558b2f',
  'Extérieur':     '#00796b',
};

let ALL_SAE = [];
let filtered = [];

async function loadAll() {
  const bar = document.getElementById('loadBar');
  let loaded = 0;

  for (const file of SAE_FILES) {
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      const arr = data.sae || data.saes || data.jeux || data.items || [];
      ALL_SAE.push(...arr);
    } catch (e) {
      console.warn('Skip', file, e);
    }
    loaded++;
    bar.style.width = (loaded / SAE_FILES.length * 100) + '%';
    await new Promise(r => setTimeout(r, 30));
  }

  const cycles = new Set(ALL_SAE.map(s => s.cycle || '').filter(Boolean));
  document.getElementById('badge-total').innerHTML  = ALL_SAE.length + '<span>SAÉ</span>';
  document.getElementById('badge-cycles').innerHTML = cycles.size + '<span>CYCLES</span>';

  applyFilters();
  updateStats();

  await new Promise(r => setTimeout(r, 300));
  document.getElementById('loading').style.display = 'none';
  document.getElementById('app').classList.remove('hidden');
}

function applyFilters() {
  const q    = document.getElementById('search').value.toLowerCase();
  const cyc  = document.getElementById('f-cycle').value;
  const comp = document.getElementById('f-competence').value;
  const dur  = document.getElementById('f-duree').value;

  filtered = ALL_SAE.filter(s => {
    const text = [s.titre, s.intentions_pedagogiques, s.tache_complexe, s.competence_pfeq, s.moyen_action, s.contexte_mondial].flat().join(' ').toLowerCase();
    if (q && !text.includes(q)) return false;
    if (cyc) {
      const sCyc = s.cycle || '';
      if (!sCyc.includes(cyc.replace('Préscolaire','Préscolaire').replace('1er cycle','1er cycle'))) return false;
    }
    if (comp) {
      const sComp = (s.competence_pfeq || s.composante || s.moyen_action || '');
      if (!sComp.toLowerCase().includes(comp.toLowerCase())) return false;
    }
    if (dur) {
      const d = parseInt(s.duree_periodes) || 1;
      if (dur === '1' && d !== 1) return false;
      if (dur === '2' && d !== 2) return false;
      if (dur === '3' && d < 3) return false;
    }
    return true;
  });

  renderGrid();
  updateStats();
}

function updateStats() {
  const cycles  = new Set(filtered.map(s => s.cycle || '').filter(Boolean));
  const cultures = new Set(filtered.map(s => s.contexte_mondial || s.origine_culturelle || '').filter(Boolean));
  document.getElementById('count-total').textContent  = filtered.length + ' SAÉ';
  document.getElementById('count-cycles').textContent  = cycles.size + ' cycles couverts';
  document.getElementById('count-pays').textContent    = cultures.size + ' cultures mondiales';
}

function renderGrid() {
  const grid = document.getElementById('grid');
  if (filtered.length === 0) {
    grid.innerHTML = '<div style="text-align:center;padding:3rem;font-family:Bangers,cursive;font-size:1.5rem;color:var(--navy);letter-spacing:3px">AUCUNE SAÉ TROUVÉE 😅</div>';
    return;
  }

  grid.innerHTML = filtered.slice(0, 200).map((s, i) => {
    const cycle = s.cycle || 'Tous cycles';
    const comp  = s.moyen_action || s.composante || '';
    const cycleCol = CYCLE_COLORS[cycle] || '#004EBF';
    const compCol  = Object.entries(COMP_COLORS).find(([k]) => comp.includes(k))?.[1] || '#004EBF';
    const duree = s.duree_periodes ? `${s.duree_periodes} période${s.duree_periodes>1?'s':''}` : '';
    const pays  = s.contexte_mondial || s.origine_culturelle || '';
    const delay = (i % 20) * 40;

    return `
    <div class="zts-card" style="animation-delay:${delay}ms;cursor:pointer" onclick="openModal(${i})" tabindex="0" role="button">
      <div style="background:${cycleCol};padding:0.6rem 1rem;display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:Bangers,cursive;font-size:0.9rem;letter-spacing:2px;color:#fff">${cycle}</span>
        ${duree ? `<span style="background:rgba(255,255,255,0.25);color:#fff;font-family:Bangers,cursive;font-size:0.8rem;letter-spacing:1px;padding:0.1rem 0.5rem">⏱ ${duree}</span>` : ''}
      </div>
      <div style="padding:1.2rem">
        <div style="font-family:Bangers,cursive;font-size:1.4rem;letter-spacing:2px;color:var(--navy);margin-bottom:0.4rem">${s.titre}</div>
        ${s.competence_pfeq ? `<div style="font-size:0.78rem;font-style:italic;color:#556;margin-bottom:0.4rem">📚 ${s.competence_pfeq}</div>` : ''}
        ${comp ? `<div style="display:inline-block;font-family:Bangers,cursive;font-size:0.8rem;letter-spacing:1px;background:${compCol};color:#fff;padding:0.15rem 0.5rem;margin-bottom:0.5rem">${comp}</div>` : ''}
        <div style="font-size:0.85rem;color:#334;line-height:1.4">${(s.intentions_pedagogiques||s.tache_complexe||'').substring(0,120)}${(s.intentions_pedagogiques||'').length>120?'…':''}</div>
        ${pays ? `<div style="margin-top:0.6rem;font-size:0.78rem;color:#556">🌍 ${pays}</div>` : ''}
      </div>
      <div style="background:var(--yellow);border-top:3px solid var(--navy);padding:0.5rem 1rem;font-family:Bangers,cursive;font-size:1rem;letter-spacing:2px;color:var(--navy);text-align:center">→ VOIR LA SAÉ COMPLÈTE</div>
    </div>`;
  }).join('');

  if (filtered.length > 200) {
    grid.innerHTML += `<div style="text-align:center;padding:2rem;font-family:Bangers,cursive;font-size:1.1rem;color:var(--navy);letter-spacing:2px;grid-column:1/-1">... ET ${filtered.length - 200} AUTRES SAÉ — AFFINEZ VOTRE RECHERCHE</div>`;
  }
}

function openModal(idx) {
  const s = filtered[idx];
  if (!s) return;
  const cycle = s.cycle || '';
  const col   = CYCLE_COLORS[cycle] || '#004EBF';

  function section(title, content) {
    if (!content) return '';
    const body = typeof content === 'string'
      ? `<p style="margin:0;line-height:1.6;color:#223">${content}</p>`
      : Array.isArray(content)
        ? `<ul style="margin:0.3rem 0 0 1rem;padding:0;color:#223;line-height:1.6">${content.map(c=>`<li>${typeof c==='string'?c:JSON.stringify(c)}</li>`).join('')}</ul>`
        : `<p style="margin:0;line-height:1.6;color:#223">${JSON.stringify(content)}</p>`;
    return `<div class="modal-section"><div class="modal-section-title">${title}</div>${body}</div>`;
  }

  let deroulementHtml = '';
  if (s.deroulement) {
    if (typeof s.deroulement === 'string') {
      deroulementHtml = section('▶️ DÉROULEMENT', s.deroulement);
    } else if (typeof s.deroulement === 'object') {
      const parts = Object.entries(s.deroulement).map(([k,v]) =>
        `<div style="margin-bottom:0.5rem"><strong style="color:var(--navy)">${k}:</strong> ${typeof v==='string'?v:Array.isArray(v)?v.join('<br>'):JSON.stringify(v)}</div>`
      ).join('');
      deroulementHtml = `<div class="modal-section"><div class="modal-section-title">▶️ DÉROULEMENT</div>${parts}</div>`;
    }
  }

  let grillehHtml = '';
  if (s.grille_evaluation) {
    const criteres = Array.isArray(s.grille_evaluation)
      ? s.grille_evaluation
      : (s.grille_evaluation.criteres || []);
    if (criteres.length) {
      grillehHtml = `<div class="modal-section"><div class="modal-section-title">📊 GRILLE D'ÉVALUATION</div>
        <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
          <thead><tr style="background:var(--navy);color:var(--yellow)">
            <th style="padding:0.4rem;font-family:Bangers,cursive;letter-spacing:1px;text-align:left">Critère</th>
            <th style="padding:0.4rem;font-family:Bangers,cursive;letter-spacing:1px">Échelon A</th>
            <th style="padding:0.4rem;font-family:Bangers,cursive;letter-spacing:1px">Échelon B</th>
            <th style="padding:0.4rem;font-family:Bangers,cursive;letter-spacing:1px">Échelon C</th>
          </tr></thead>
          <tbody>${criteres.map((c,i)=>`
            <tr style="background:${i%2?'#f5f7ff':'#fff'}">
              <td style="padding:0.4rem;border:1px solid #dde">${c.critere||c.nom||''}</td>
              <td style="padding:0.4rem;border:1px solid #dde;text-align:center">${c.echelon_A||c.A||'—'}</td>
              <td style="padding:0.4rem;border:1px solid #dde;text-align:center">${c.echelon_B||c.B||'—'}</td>
              <td style="padding:0.4rem;border:1px solid #dde;text-align:center">${c.echelon_C||c.C||'—'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    }
  }

  document.getElementById('modal-body').innerHTML = `
    <div style="background:${col};padding:1.5rem 2rem;border-bottom:4px solid var(--navy);position:relative">
      <div style="font-family:Bangers,cursive;font-size:2rem;letter-spacing:3px;color:#fff">${s.titre}</div>
      <div style="margin-top:0.5rem;display:flex;gap:0.5rem;flex-wrap:wrap">
        ${cycle ? `<span style="background:rgba(255,255,255,0.25);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">${cycle}</span>` : ''}
        ${s.duree_periodes ? `<span style="background:var(--yellow);color:var(--navy);font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">⏱ ${s.duree_periodes} période${s.duree_periodes>1?'s':''}</span>` : ''}
        ${s.espace ? `<span style="background:rgba(255,255,255,0.25);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">📍 ${s.espace}</span>` : ''}
        ${s.contexte_mondial ? `<span style="background:rgba(255,255,255,0.25);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">🌍 ${s.contexte_mondial}</span>` : ''}
      </div>
      <button onclick="closeModal()" style="position:absolute;top:1rem;right:1rem;font-family:Bangers,cursive;font-size:1.2rem;background:rgba(255,255,255,0.2);color:#fff;border:2px solid #fff;padding:0.2rem 0.8rem;cursor:pointer">✕ FERMER</button>
    </div>
    <div style="padding:1.5rem 2rem;overflow-y:auto;max-height:70vh">
      ${section('🎯 INTENTIONS PÉDAGOGIQUES', s.intentions_pedagogiques)}
      ${section('📚 COMPÉTENCE PFEQ', s.competence_pfeq)}
      ${section('🔧 COMPOSANTE / MOYEN D\'ACTION', s.moyen_action || s.composante)}
      ${section('📦 MATÉRIEL', s.materiel)}
      ${section('🌟 SITUATION DE DÉPART', s.situation_depart)}
      ${section('💪 TÂCHE COMPLEXE', s.tache_complexe)}
      ${deroulementHtml}
      ${grillehHtml}
      ${section('🔀 VARIANTES / DIFFÉRENCIATION', s.variantes || s.differenciation)}
      ${section('♿ ADAPTATIONS INCLUSIVES', s.adaptations_inclusives)}
      ${section('🌍 CONNEXION CULTURELLE MONDIALE', s.connexion_culturelle || s.origine_culturelle)}
      ${section('🔗 LIENS INTERDISCIPLINAIRES', s.liens_interdisciplinaires)}
      ${section('📝 NOTES PÉDAGOGIQUES', s.notes_pedagogiques)}
    </div>
  `;

  document.getElementById('modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.body.style.overflow = '';
}

document.getElementById('search').addEventListener('input', applyFilters);
document.getElementById('f-cycle').addEventListener('change', applyFilters);
document.getElementById('f-competence').addEventListener('change', applyFilters);
document.getElementById('f-duree').addEventListener('change', applyFilters);
document.getElementById('modal-backdrop').addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

const style = document.createElement('style');
style.textContent = `
  .modal-section { margin-bottom:1.2rem; }
  .modal-section-title { font-family:'Bangers',cursive;font-size:1.1rem;letter-spacing:2px;color:var(--navy);border-bottom:2px solid var(--yellow);margin-bottom:0.5rem;padding-bottom:0.2rem; }
`;
document.head.appendChild(style);

loadAll();
