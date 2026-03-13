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
  // 458 SAÉ détaillées par domaine (manipulation, locomotion, coopération, etc.)
  '../data/sae/sae_domaines_01.json',
  '../data/sae/sae_domaines_02.json',
  '../data/sae/sae_domaines_03.json',
  '../data/sae/sae_domaines_04.json',
  '../data/sae/sae_domaines_05.json',
  '../data/sae/sae_domaines_06.json',
  '../data/sae/sae_domaines_07.json',
  '../data/sae/sae_domaines_08.json',
  '../data/sae/sae_domaines_09.json',
  '../data/sae/sae_domaines_10.json',
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

function showApp() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('app').classList.remove('hidden');
}

async function loadAll() {
  const bar = document.getElementById('loadBar');
  let loaded = 0;

  // Safety timeout: if loading takes more than 8 seconds, show whatever is loaded
  const timeoutId = setTimeout(() => {
    console.warn('SAÉ: timeout de chargement atteint — affichage des', ALL_SAE.length, 'SAÉ déjà chargées');
    const cycles = new Set(ALL_SAE.map(s => s.cycle || '').filter(Boolean));
    document.getElementById('badge-total').innerHTML  = ALL_SAE.length + '<span>SAÉ</span>';
    document.getElementById('badge-cycles').innerHTML = cycles.size + '<span>CYCLES</span>';
    applyFilters();
    updateStats();
    showApp();
  }, 8000);

  try {
    for (const file of SAE_FILES) {
      try {
        const res = await fetch(file);
        if (!res.ok) throw new Error('HTTP ' + res.status + ' pour ' + file);
        const data = await res.json();
        const arr = Array.isArray(data)
          ? data
          : (data.sae || data.saes || data.jeux || data.items || []);
        if (!Array.isArray(arr)) {
          console.error('SAÉ: format inattendu dans', file, '— clés disponibles:', Object.keys(data));
        } else {
          ALL_SAE.push(...arr);
        }
      } catch (e) {
        console.error('SAÉ: impossible de charger', file, e);
      }
      loaded++;
      bar.style.width = (loaded / SAE_FILES.length * 100) + '%';
      await new Promise(r => setTimeout(r, 20));
    }

    clearTimeout(timeoutId);

    const cycles = new Set(ALL_SAE.map(s => s.cycle || '').filter(Boolean));
    document.getElementById('badge-total').innerHTML  = ALL_SAE.length + '<span>SAÉ</span>';
    document.getElementById('badge-cycles').innerHTML = cycles.size + '<span>CYCLES</span>';

    console.log('SAÉ: chargement terminé —', ALL_SAE.length, 'SAÉ sur', SAE_FILES.length, 'fichiers');

    applyFilters();
    updateStats();

    await new Promise(r => setTimeout(r, 300));
    showApp();
  } catch (fatalErr) {
    clearTimeout(timeoutId);
    console.error('SAÉ: erreur fatale dans loadAll()', fatalErr);
    // Show whatever loaded so far so the user sees something
    try {
      const cycles = new Set(ALL_SAE.map(s => s.cycle || '').filter(Boolean));
      document.getElementById('badge-total').innerHTML  = ALL_SAE.length + '<span>SAÉ</span>';
      document.getElementById('badge-cycles').innerHTML = cycles.size + '<span>CYCLES</span>';
      applyFilters();
      updateStats();
    } catch (e2) {
      console.error('SAÉ: erreur dans la récupération de secours', e2);
    }
    showApp();
  }
}

function applyFilters() {
  const q    = document.getElementById('search').value.toLowerCase();
  const cyc  = document.getElementById('f-cycle').value;
  const comp = document.getElementById('f-competence').value;
  const dur  = document.getElementById('f-duree').value;

  filtered = ALL_SAE.filter(s => {
    if (!s || typeof s !== 'object') return false;
    const text = [s.titre, s.intentions_pedagogiques, s.tache_complexe, s.competence_pfeq, s.moyen_action, s.contexte_mondial].filter(Boolean).join(' ').toLowerCase();
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
    if (ALL_SAE.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;font-family:Bangers,cursive;font-size:1.3rem;color:var(--navy);letter-spacing:2px;background:#fff;border:5px solid var(--navy);box-shadow:4px 4px 0 var(--navy)">⚠️ AUCUNE SAÉ CHARGÉE<br><span style="font-size:0.9rem;letter-spacing:1px">Vérifiez votre connexion ou rechargez la page.</span></div>';
    } else {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;font-family:Bangers,cursive;font-size:1.5rem;color:var(--navy);letter-spacing:3px">AUCUNE SAÉ TROUVÉE 😅</div>';
    }
    if (window.ZTS) window.ZTS.shakeElement(grid);
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
      <div style="display:flex;border-top:3px solid var(--navy)">
        <div style="flex:1;background:var(--yellow);padding:0.5rem 1rem;font-family:Bangers,cursive;font-size:1rem;letter-spacing:2px;color:var(--navy);text-align:center">→ VOIR LA SAÉ COMPLÈTE</div>
        <button onclick="event.stopPropagation();openSaeTBI(${i})" style="background:#001D6E;color:#FFE000;border:none;border-left:3px solid var(--navy);padding:0.5rem 0.8rem;font-family:Bangers,cursive;font-size:0.95rem;letter-spacing:1px;cursor:pointer;flex-shrink:0">📺 TBI</button>
      </div>
    </div>`;
  }).join('');

  if (filtered.length > 200) {
    grid.innerHTML += `<div style="text-align:center;padding:2rem;font-family:Bangers,cursive;font-size:1.1rem;color:var(--navy);letter-spacing:2px;grid-column:1/-1">... ET ${filtered.length - 200} AUTRES SAÉ — AFFINEZ VOTRE RECHERCHE</div>`;
  }
  if (window.ZTS) {
    window.ZTS.restaggerCards(grid);
    window.ZTS.animateStatPills();
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

// ═══════════════════════════════════════
// TBI MODE — TABLEAU BLANC INTERACTIF
// ═══════════════════════════════════════
let saeTbiActive = false;
let saeTbiIndex = 0;
let saeTbiGames = [];
let saeTbiTimerVal = 0;
let saeTbiTimerInterval = null;
let saeTbiTouchStartX = 0;

function openSaeTBI(idx) {
  saeTbiGames = filtered.length > 0 ? filtered : ALL_SAE;
  saeTbiIndex = idx !== undefined ? idx : 0;
  saeTbiActive = true;
  renderSaeTBI();
  document.addEventListener('keydown', saeTbiKeyHandler);
}

function closeSaeTBI() {
  saeTbiActive = false;
  stopSaeTBITimer();
  const el = document.getElementById('sae-tbi-overlay');
  if (el) el.remove();
  document.removeEventListener('keydown', saeTbiKeyHandler);
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}

function saeTbiKeyHandler(e) {
  if (!saeTbiActive) return;
  if (e.key === 'Escape') { closeSaeTBI(); return; }
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); saeTbiNext(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); saeTbiPrev(); }
}

function saeTbiNext() {
  if (saeTbiIndex < saeTbiGames.length - 1) { saeTbiIndex++; renderSaeTBI(); }
}
function saeTbiPrev() {
  if (saeTbiIndex > 0) { saeTbiIndex--; renderSaeTBI(); }
}

function startSaeTBITimer(seconds) {
  stopSaeTBITimer();
  saeTbiTimerVal = seconds;
  const disp = document.getElementById('sae-tbi-timer-disp');
  if (disp) { disp.classList.add('running'); disp.textContent = formatSaeTBITime(saeTbiTimerVal); }
  saeTbiTimerInterval = setInterval(() => {
    saeTbiTimerVal--;
    const d = document.getElementById('sae-tbi-timer-disp');
    if (d) d.textContent = formatSaeTBITime(saeTbiTimerVal);
    if (saeTbiTimerVal <= 0) {
      stopSaeTBITimer();
      const d2 = document.getElementById('sae-tbi-timer-disp');
      if (d2) { d2.textContent = '⏰ 0:00'; d2.classList.remove('running'); }
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.4);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.4 + 0.3);
          osc.start(ctx.currentTime + i * 0.4); osc.stop(ctx.currentTime + i * 0.4 + 0.3);
        }
      } catch(e) {}
    }
  }, 1000);
}

function stopSaeTBITimer() {
  if (saeTbiTimerInterval) { clearInterval(saeTbiTimerInterval); saeTbiTimerInterval = null; }
  const d = document.getElementById('sae-tbi-timer-disp');
  if (d) d.classList.remove('running');
}

function formatSaeTBITime(s) {
  return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0');
}

function renderSaeTBI() {
  const existing = document.getElementById('sae-tbi-overlay');
  if (existing) existing.remove();

  const s = saeTbiGames[saeTbiIndex];
  if (!s) return;

  const total = saeTbiGames.length;
  const cycleColors = {
    'Préscolaire':'#e74c3c','1er cycle':'#27ae60','2e cycle':'#2980b9',
    '3e cycle':'#8e44ad','Secondaire':'#d35400'
  };
  const cycleColor = cycleColors[s.cycle] || '#004EBF';

  // Build objectifs
  const objList = Array.isArray(s.objectifs)
    ? s.objectifs.map(o => `<li>${o}</li>`).join('')
    : (s.objectifs ? `<li>${s.objectifs}</li>` : '');

  // Build phases
  let phasesHTML = '';
  if (s.phases && Array.isArray(s.phases)) {
    phasesHTML = s.phases.map(p => `
      <div style="background:rgba(255,255,255,0.08);border-left:5px solid #FFE000;padding:0.8rem 1rem;margin-bottom:0.6rem">
        <div style="font-family:Bangers,cursive;font-size:1.2rem;letter-spacing:2px;color:#FFE000">${p.nom || p.titre || ''} ${p.duree ? '— ' + p.duree + ' min' : ''}</div>
        <div style="font-family:Nunito,sans-serif;font-size:1rem;color:#fff;margin-top:0.3rem;line-height:1.4">${p.description || p.activite || ''}</div>
      </div>`).join('');
  }

  // Materiel
  const mat = s.materiel || [];
  const matHTML = Array.isArray(mat) && mat.length
    ? mat.map(m => `<span class="tbi-mat-chip">${m}</span>`).join('')
    : '<span class="tbi-mat-chip">Sans matériel spécifique</span>';

  const overlay = document.createElement('div');
  overlay.id = 'sae-tbi-overlay';
  overlay.className = 'tbi-overlay';
  overlay.innerHTML = `
    <div class="tbi-header">
      <div class="tbi-logo">📚 ZONE TOTAL SPORT — SAÉ PFEQ — MODE TBI</div>
      <div class="tbi-nav-info" style="background:${cycleColor};color:#fff;padding:0.2rem 1rem;font-size:1rem">${s.cycle || ''} · ${s.competence || ''}</div>
      <button class="tbi-btn-exit" onclick="closeSaeTBI()">✕ QUITTER TBI (ESC)</button>
    </div>

    <div class="tbi-content"
         ontouchstart="saeTbiTouchStartX=event.changedTouches[0].clientX"
         ontouchend="(event.changedTouches[0].clientX-saeTbiTouchStartX>50)?saeTbiPrev():(saeTbiTouchStartX-event.changedTouches[0].clientX>50)?saeTbiNext():null">

      <div class="tbi-left">
        <div class="tbi-title">${s.titre || s.nom || 'SAÉ'}</div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;justify-content:center">
          <div class="tbi-cat-badge" style="background:${cycleColor};border-color:${cycleColor}">🎓 ${s.cycle || ''}</div>
          <div class="tbi-cat-badge">⏱️ ${s.duree || s.duree_periodes || '?'} période${(s.duree||s.duree_periodes||1)>1?'s':''}</div>
        </div>
        ${s.contexte ? `<div style="font-family:Nunito,sans-serif;font-size:1rem;color:#ffe;text-align:center;line-height:1.4;max-width:280px">${s.contexte}</div>` : ''}
        <div>
          <div class="tbi-section-title">🧰 MATÉRIEL</div>
          <div class="tbi-materiel" style="margin-top:0.5rem;justify-content:center">${matHTML}</div>
        </div>
        <div style="width:100%">
          <div class="tbi-section-title" style="font-size:1.1rem">⏱️ MINUTERIE</div>
          <div class="tbi-timer" style="margin-top:0.4rem;justify-content:center">
            <button class="tbi-timer-btn" onclick="startSaeTBITimer(30)">30s</button>
            <button class="tbi-timer-btn" onclick="startSaeTBITimer(60)">1min</button>
            <button class="tbi-timer-btn" onclick="startSaeTBITimer(120)">2min</button>
            <button class="tbi-timer-btn" onclick="startSaeTBITimer(300)">5min</button>
            <button class="tbi-timer-btn" style="background:#c00" onclick="stopSaeTBITimer();document.getElementById('sae-tbi-timer-disp').textContent='—'">■</button>
            <div class="tbi-timer-display" id="sae-tbi-timer-disp">—</div>
          </div>
        </div>
      </div>

      <div class="tbi-right">
        ${objList ? `
        <div>
          <div class="tbi-section-title">🎯 OBJECTIFS PFEQ</div>
          <ul class="tbi-rules" style="margin-top:0.5rem">${objList}</ul>
        </div>` : (s.intentions_pedagogiques ? `
        <div>
          <div class="tbi-section-title">🎯 INTENTIONS PÉDAGOGIQUES</div>
          <ul class="tbi-rules" style="margin-top:0.5rem"><li>${s.intentions_pedagogiques}</li></ul>
        </div>` : '')}

        ${phasesHTML ? `
        <div>
          <div class="tbi-section-title">📋 DÉROULEMENT</div>
          <div style="margin-top:0.5rem">${phasesHTML}</div>
        </div>` : (s.description ? `
        <div>
          <div class="tbi-section-title">📋 DESCRIPTION</div>
          <div style="font-family:Nunito,sans-serif;font-size:1.1rem;color:#fff;line-height:1.5;margin-top:0.5rem">${s.description}</div>
        </div>` : (s.tache_complexe ? `
        <div>
          <div class="tbi-section-title">💪 TÂCHE COMPLEXE</div>
          <div style="font-family:Nunito,sans-serif;font-size:1.1rem;color:#fff;line-height:1.5;margin-top:0.5rem">${s.tache_complexe}</div>
        </div>` : ''))}

        ${s.evaluation ? `
        <div>
          <div class="tbi-section-title">📊 ÉVALUATION</div>
          <div style="font-family:Nunito,sans-serif;font-size:1rem;color:#ffe;background:rgba(255,224,0,0.1);padding:0.8rem;border-left:4px solid #FFE000;line-height:1.4;margin-top:0.5rem">${Array.isArray(s.evaluation)?s.evaluation.join(' · '):s.evaluation}</div>
        </div>` : ''}
      </div>

      <div class="tbi-nav-arrows">
        <button class="tbi-arrow" onclick="saeTbiPrev()" ${saeTbiIndex===0?'disabled style="opacity:0.4"':''}>← PRÉCÉDENTE</button>
        <div class="tbi-counter">${saeTbiIndex+1} / ${total}</div>
        <button class="tbi-arrow" onclick="saeTbiNext()" ${saeTbiIndex===total-1?'disabled style="opacity:0.4"':''}>SUIVANTE →</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  if (overlay.requestFullscreen) overlay.requestFullscreen().catch(() => {});
  else if (overlay.webkitRequestFullscreen) overlay.webkitRequestFullscreen();
}
