/* musique-app.js — Zone Total Sport: Musiques Libres ÉPS */

const MUSIQUE_FILES = [
  '../data/musique/musiques_database.json',
];

const GENRE_COLORS = {
  'Electronic': '#004EBF', 'Hip-Hop': '#8e44ad', 'Pop': '#e91e63',
  'Rock': '#c0392b', 'Classique': '#795548', 'Ambient': '#0097a7',
  'Latin': '#e67e22', 'World': '#1a7f3c', 'Jazz': '#455a64',
  'Funk': '#ff6f00', 'Reggae': '#2e7d32', 'Country': '#6d4c41',
  'Folk': '#558b2f', 'R&B': '#6a1b9a', 'Metal': '#37474f',
};

const BPM_RANGES = [
  { label:'🧘 40-70', min:40,  max:70,  color:'#0097a7' },
  { label:'😌 70-100',min:70,  max:100, color:'#1a7f3c' },
  { label:'🚶 100-130',min:100,max:130, color:'#004EBF' },
  { label:'🏃 130-155',min:130,max:155, color:'#e67e22' },
  { label:'⚡ 155-180',min:155,max:200, color:'#c0392b' },
];

let ALL_MUSIQUES = [];
let filtered = [];
let currentTab = 'pistes';

async function loadAll() {
  const bar = document.getElementById('loadBar');
  let loaded = 0;

  for (const file of MUSIQUE_FILES) {
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      const arr = data.musiques || data.pistes || data.tracks || data.items || [];
      ALL_MUSIQUES.push(...arr);
    } catch (e) {
      console.warn('Skip', file, e);
    }
    loaded++;
    bar.style.width = (loaded / MUSIQUE_FILES.length * 100) + '%';
    await new Promise(r => setTimeout(r, 50));
  }

  const genres = new Set(ALL_MUSIQUES.map(m => m.genre || '').filter(Boolean));
  document.getElementById('badge-total').innerHTML = ALL_MUSIQUES.length + '<span>PISTES</span>';
  document.getElementById('badge-bpm').innerHTML   = genres.size + '<span>GENRES</span>';

  buildBpmPills();
  buildGuide();
  buildSources();
  applyFilters();
  updateStats();

  await new Promise(r => setTimeout(r, 300));
  document.getElementById('loading').style.display = 'none';
  document.getElementById('app').classList.remove('hidden');
}

function buildBpmPills() {
  const bar = document.getElementById('bpm-pills');
  bar.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.textContent = '⚡ TOUT';
  allBtn.className = 'bpm-pill';
  allBtn.style.cssText = 'font-family:Bangers,cursive;font-size:0.9rem;letter-spacing:2px;padding:0.4rem 1rem;border:3px solid var(--navy);background:var(--navy);color:var(--yellow);cursor:pointer;';
  allBtn.onclick = () => { document.getElementById('f-bpm').value = ''; applyFilters(); setActivePill(allBtn); };
  bar.appendChild(allBtn);

  BPM_RANGES.forEach(r => {
    const btn = document.createElement('button');
    btn.textContent = r.label;
    btn.className = 'bpm-pill';
    btn.style.cssText = `font-family:Bangers,cursive;font-size:0.9rem;letter-spacing:1px;padding:0.35rem 0.9rem;border:3px solid ${r.color};background:${r.color};color:#fff;cursor:pointer;`;
    btn.onclick = () => { document.getElementById('f-bpm').value = `${r.min}-${r.max}`; applyFilters(); setActivePill(btn); };
    bar.appendChild(btn);
  });
}

function setActivePill(active) {
  document.querySelectorAll('.bpm-pill').forEach(p => p.style.opacity = '0.6');
  active.style.opacity = '1';
}

function applyFilters() {
  const q      = document.getElementById('search').value.toLowerCase();
  const activ  = document.getElementById('f-activite').value;
  const bpmVal = document.getElementById('f-bpm').value;
  const lic    = document.getElementById('f-licence').value;
  const genre  = document.getElementById('f-genre').value;

  let bpmMin = 0, bpmMax = 9999;
  if (bpmVal) {
    const parts = bpmVal.split('-').map(Number);
    bpmMin = parts[0]; bpmMax = parts[1];
  }

  filtered = ALL_MUSIQUES.filter(m => {
    const text = [m.titre, m.artiste, m.genre, m.tags, m.activite, m.description].flat().join(' ').toLowerCase();
    if (q && !text.includes(q)) return false;
    if (activ) {
      const mActiv = (Array.isArray(m.activite) ? m.activite.join(' ') : m.activite || '').toLowerCase();
      if (!mActiv.includes(activ)) return false;
    }
    if (bpmVal) {
      const bpm = parseInt(m.bpm) || 0;
      if (bpm < bpmMin || bpm > bpmMax) return false;
    }
    if (lic) {
      const mLic = m.licence || m.license || '';
      if (!mLic.includes(lic)) return false;
    }
    if (genre && (m.genre || '') !== genre) return false;
    return true;
  });

  renderGrid();
  updateStats();
}

function updateStats() {
  const cc0   = filtered.filter(m => (m.licence || '').includes('CC0')).length;
  const genres= new Set(filtered.map(m => m.genre || '').filter(Boolean));
  document.getElementById('count-total').textContent  = filtered.length + ' pistes';
  document.getElementById('count-free').textContent   = cc0 + ' gratuites CC0';
  document.getElementById('count-genres').textContent = genres.size + ' genres';
}

function renderGrid() {
  const grid = document.getElementById('grid');
  if (filtered.length === 0) {
    grid.innerHTML = '<div style="text-align:center;padding:3rem;font-family:Bangers,cursive;font-size:1.5rem;color:var(--navy);letter-spacing:3px">AUCUNE PISTE TROUVÉE 🎵</div>';
    if (window.ZTS) window.ZTS.shakeElement(grid);
    return;
  }

  grid.innerHTML = filtered.slice(0, 300).map((m, i) => {
    const genre   = m.genre || 'Autre';
    const col     = GENRE_COLORS[genre] || '#004EBF';
    const bpm     = m.bpm || '?';
    const artiste = m.artiste || m.artist || 'Artiste inconnu';
    const titre   = m.titre || m.title || 'Sans titre';
    const duree   = m.duree || m.duration || '';
    const licence = m.licence || m.license || '';
    const activs  = Array.isArray(m.activite) ? m.activite.slice(0,3) : [m.activite].filter(Boolean);
    const src     = m.source || m.url || '';
    const delay   = (i % 30) * 30;

    // BPM color
    const bpmNum = parseInt(bpm) || 0;
    const bpmRange = BPM_RANGES.find(r => bpmNum >= r.min && bpmNum < r.max);
    const bpmCol = bpmRange ? bpmRange.color : '#888';

    return `
    <div id="card-${i}" class="zts-card" style="animation-delay:${delay}ms">
      <div style="background:${col};padding:0.6rem 1rem;display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:Bangers,cursive;font-size:0.9rem;letter-spacing:2px;color:#fff">🎵 ${genre}</span>
        <span style="background:${bpmCol};color:#fff;font-family:Bangers,cursive;font-size:0.95rem;letter-spacing:2px;padding:0.15rem 0.6rem;border:2px solid rgba(255,255,255,0.4)">${bpm} BPM</span>
      </div>
      <div style="padding:1.2rem">
        <div style="font-family:Bangers,cursive;font-size:1.3rem;letter-spacing:2px;color:var(--navy);margin-bottom:0.2rem">${titre}</div>
        <div style="font-size:0.85rem;color:#556;margin-bottom:0.6rem">🎤 ${artiste}${duree ? ` · ⏱ ${duree}` : ''}</div>
        ${activs.length ? `<div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.5rem">${activs.map(a=>`<span style="font-family:Bangers,cursive;font-size:0.75rem;letter-spacing:1px;padding:0.1rem 0.4rem;background:rgba(0,29,110,0.08);color:var(--navy);border:1px solid rgba(0,29,110,0.2)">${a}</span>`).join('')}</div>` : ''}
        ${licence ? `<div style="font-size:0.78rem;color:#1a7f3c;font-weight:bold">✅ ${licence}</div>` : ''}
        ${m.description ? `<div style="font-size:0.8rem;color:#446;line-height:1.4;margin-top:0.4rem">${m.description.substring(0,80)}…</div>` : ''}
      </div>
      <div id="card-footer-${i}" style="display:flex;border-top:3px solid var(--navy)">
        <div style="flex:1;background:#1a7f3c;padding:0.5rem;font-family:Bangers,cursive;font-size:1.1rem;letter-spacing:2px;color:#fff;text-align:center;cursor:pointer" onclick="event.stopPropagation();playDirect(${i})">▶ JOUER</div>
        <div style="flex:1;background:var(--yellow);padding:0.5rem;font-family:Bangers,cursive;font-size:1.1rem;letter-spacing:2px;color:var(--navy);text-align:center;border-left:3px solid var(--navy);cursor:pointer" onclick="event.stopPropagation();openModal(${i})">🎵 DÉTAILS</div>
        <div style="flex:0 0 auto;background:#8e44ad;padding:0.5rem 0.8rem;font-family:Bangers,cursive;font-size:1.1rem;letter-spacing:2px;color:#fff;text-align:center;border-left:3px solid var(--navy);cursor:pointer" onclick="event.stopPropagation();openMusTBI(${i})">📺 TBI</div>
      </div>
    </div>`;
  }).join('');

  if (filtered.length > 300) {
    grid.innerHTML += `<div style="text-align:center;padding:2rem;font-family:Bangers,cursive;font-size:1.1rem;color:var(--navy);letter-spacing:2px;grid-column:1/-1">... ET ${filtered.length - 300} AUTRES PISTES — AFFINEZ VOTRE RECHERCHE</div>`;
  }
  if (window.ZTS) {
    window.ZTS.restaggerCards(grid);
    window.ZTS.animateStatPills();
  }
}

// Jamendo public API — client_id b6747d04 is their documented public demo key
const JAMENDO_CLIENT = 'b6747d04';

// Map genres to Jamendo tags for better search results
const GENRE_TO_JAMENDO = {
  'Electronic': 'electronic+energetic',
  'Hip-Hop':    'hiphop',
  'Pop':        'pop+upbeat',
  'Rock':       'rock+energetic',
  'Classique':  'classical+orchestral',
  'Ambient':    'ambient+relaxing',
  'Latin':      'latin+dance',
  'World':      'world+ethnic',
  'Jazz':       'jazz+instrumental',
  'Funk':       'funk+groove',
  'Reggae':     'reggae',
  'Country':    'country',
  'Folk':       'folk+acoustic',
  'R&B':        'rnb+soul',
  'Metal':      'metal+hard',
};

let currentAudio = null;

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

async function searchAndPlay(genre, bpm, containerId, btnEl) {
  stopCurrentAudio();
  btnEl.disabled = true;
  btnEl.innerHTML = '⏳ RECHERCHE EN COURS...';

  const tags = GENRE_TO_JAMENDO[genre] || 'instrumental';
  // Determine mood from BPM
  let mood = '';
  if (bpm < 80)       mood = 'calm+relaxing';
  else if (bpm < 110) mood = 'happy';
  else if (bpm < 140) mood = 'energetic';
  else                mood = 'energetic+powerful';

  const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT}&format=json&limit=10&tags=${tags}&audioformat=mp32&order=popularity_total&include=musicinfo`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    const results = (data.results || []).filter(t => t.audio);

    if (results.length === 0) throw new Error('No results');

    // Pick a random track from results
    const track = results[Math.floor(Math.random() * results.length)];

    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div style="background:#f0f8ff;border:3px solid var(--navy);padding:1rem;margin-top:0.8rem;box-shadow:3px 3px 0 var(--navy)">
        <div style="font-family:Bangers,cursive;font-size:1rem;letter-spacing:2px;color:var(--navy);margin-bottom:0.5rem">
          🎵 ${track.name} — <span style="color:#1a7f3c">${track.artist_name}</span>
          <span style="font-size:0.75rem;background:#e8f5e9;color:#1a7f3c;padding:0.1rem 0.4rem;margin-left:0.3rem;border:1px solid #1a7f3c">CC BY-NC-SA · Jamendo</span>
        </div>
        <audio id="audio-el-${containerId}" controls style="width:100%;display:block">
          <source src="${track.audio}" type="audio/mpeg">
        </audio>
        <a href="${track.shareurl}" target="_blank" rel="noopener"
           style="display:inline-block;margin-top:0.5rem;font-size:0.8rem;color:var(--blue);text-decoration:none">
          ↗ Voir sur Jamendo
        </a>
      </div>
    `;
    currentAudio = document.getElementById(`audio-el-${containerId}`);
    if (currentAudio) currentAudio.play().catch(() => {});
  } catch(e) {
    btnEl.disabled = false;
    btnEl.innerHTML = '▶ RÉESSAYER';
    const container = document.getElementById(containerId);
    container.innerHTML = `<div style="color:#c0392b;font-size:0.85rem;margin-top:0.5rem">⚠️ Connexion impossible. <a href="https://www.jamendo.com/search?q=${encodeURIComponent(genre)}" target="_blank" rel="noopener" style="color:var(--blue)">Rechercher sur Jamendo</a></div>`;
  }
}

async function playDirect(idx) {
  const m = filtered[idx];
  if (!m) return;

  // Stop any currently playing audio
  stopCurrentAudio();

  const footer = document.getElementById('card-footer-' + idx);
  if (!footer) return;

  const src = m.source || m.url || '';
  const audioUrl = m.audio_url || (src.match(/\.(mp3|ogg|wav)(\?|$)/i) ? src : null);

  if (audioUrl) {
    // Tracks with a direct audio URL: inject player immediately
    footer.innerHTML = `
      <div style="width:100%;padding:0.5rem 0.7rem;background:#e8f5e9;display:flex;flex-direction:column;gap:0.4rem">
        <audio id="card-audio-${idx}" controls style="width:100%;display:block"></audio>
        <div style="display:flex;justify-content:flex-end">
          <span onclick="resetCardFooter(${idx})" style="font-family:Bangers,cursive;font-size:0.85rem;letter-spacing:1px;color:#c0392b;cursor:pointer;padding:0.1rem 0.4rem;border:1px solid #c0392b">✕ FERMER</span>
        </div>
      </div>`;
    const audioEl = document.getElementById('card-audio-' + idx);
    audioEl.src = audioUrl;
    currentAudio = audioEl;
    audioEl.play().catch(() => {});
  } else {
    // Tracks without audio_url: search Jamendo, show loading spinner first
    const genre  = m.genre || 'Autre';
    const bpmNum = parseInt(m.bpm) || 0;

    footer.innerHTML = `
      <div style="width:100%;padding:0.6rem 1rem;background:#f0f4ff;font-family:Bangers,cursive;font-size:1rem;letter-spacing:2px;color:var(--navy);text-align:center">
        ⏳ RECHERCHE EN COURS...
      </div>`;

    const tags = GENRE_TO_JAMENDO[genre] || 'instrumental';
    const url  = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT}&format=json&limit=10&tags=${tags}&audioformat=mp32&order=popularity_total`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      const results = (data.results || []).filter(t => t.audio);
      if (results.length === 0) throw new Error('No results');

      const track = results[Math.floor(Math.random() * results.length)];

      footer.innerHTML = `
        <div style="width:100%;padding:0.5rem 0.7rem;background:#e8f5e9;display:flex;flex-direction:column;gap:0.4rem">
          <div style="font-family:Bangers,cursive;font-size:0.8rem;letter-spacing:1px;color:var(--navy)">
            ${track.name} — <span style="color:#1a7f3c">${track.artist_name}</span>
            <span style="font-size:0.7rem;background:#fff;color:#1a7f3c;padding:0.05rem 0.3rem;margin-left:0.2rem;border:1px solid #1a7f3c">Jamendo CC</span>
          </div>
          <audio id="card-audio-${idx}" controls style="width:100%;display:block"></audio>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <a href="${track.shareurl}" target="_blank" rel="noopener" style="font-size:0.75rem;color:var(--blue)">↗ Jamendo</a>
            <span onclick="resetCardFooter(${idx})" style="font-family:Bangers,cursive;font-size:0.85rem;letter-spacing:1px;color:#c0392b;cursor:pointer;padding:0.1rem 0.4rem;border:1px solid #c0392b">✕ FERMER</span>
          </div>
        </div>`;
      const audioEl = document.getElementById('card-audio-' + idx);
      audioEl.src = track.audio;
      currentAudio = audioEl;
      audioEl.play().catch(() => {});
    } catch(e) {
      footer.innerHTML = `
        <div style="width:100%;padding:0.5rem 0.8rem;background:#fff3f3;display:flex;justify-content:space-between;align-items:center;gap:0.5rem">
          <span style="font-size:0.8rem;color:#c0392b">⚠️ Indisponible. <a href="https://www.jamendo.com/search?q=${encodeURIComponent(genre)}" target="_blank" rel="noopener" style="color:var(--blue)">Jamendo →</a></span>
          <span onclick="resetCardFooter(${idx})" style="font-family:Bangers,cursive;font-size:0.85rem;letter-spacing:1px;color:#c0392b;cursor:pointer;padding:0.1rem 0.4rem;border:1px solid #c0392b">✕</span>
        </div>`;
    }
  }
}

function resetCardFooter(idx) {
  stopCurrentAudio();
  const footer = document.getElementById('card-footer-' + idx);
  if (!footer) return;
  footer.innerHTML = `
    <div style="flex:1;background:#1a7f3c;padding:0.5rem;font-family:Bangers,cursive;font-size:1.1rem;letter-spacing:2px;color:#fff;text-align:center;cursor:pointer" onclick="event.stopPropagation();playDirect(${idx})">▶ JOUER</div>
    <div style="flex:1;background:var(--yellow);padding:0.5rem;font-family:Bangers,cursive;font-size:1.1rem;letter-spacing:2px;color:var(--navy);text-align:center;border-left:3px solid var(--navy);cursor:pointer" onclick="event.stopPropagation();openModal(${idx})">🎵 DÉTAILS</div>`;
}

function openModal(idx) {
  stopCurrentAudio();
  const m = filtered[idx];
  if (!m) return;
  const genre = m.genre || 'Autre';
  const col   = GENRE_COLORS[genre] || '#004EBF';
  const bpm   = m.bpm || '?';
  const bpmNum= parseInt(bpm) || 0;
  const bpmRange = BPM_RANGES.find(r => bpmNum >= r.min && bpmNum < r.max);
  const bpmCol = bpmRange ? bpmRange.color : '#888';
  const activs = Array.isArray(m.activite) ? m.activite : [m.activite].filter(Boolean);
  const tags   = Array.isArray(m.tags) ? m.tags : [m.tags].filter(Boolean);
  const src    = m.source || m.url || '';
  const audioUrl = m.audio_url || (src.match(/\.(mp3|ogg|wav)(\?|$)/i) ? src : null);
  const containerId = 'audio-container-' + idx;

  const audioSection = audioUrl
    ? `<div class="modal-section">
        <div class="modal-section-title">▶️ ÉCOUTER DIRECTEMENT</div>
        <audio id="audio-el-direct" controls style="width:100%;margin-top:0.5rem">
          <source src="${audioUrl}" type="audio/mpeg">
        </audio>
       </div>`
    : `<div class="modal-section">
        <div class="modal-section-title">▶️ ÉCOUTER UNE PISTE SIMILAIRE</div>
        <div style="font-size:0.82rem;color:#557;margin-bottom:0.6rem">Recherche une piste <strong>${genre}</strong> · ${bpm} BPM sur Jamendo (libre de droits)</div>
        <button id="play-btn-${idx}" onclick="searchAndPlay('${genre}',${bpmNum},'${containerId}',this)"
          style="font-family:Bangers,cursive;font-size:1.2rem;letter-spacing:3px;background:#1a7f3c;color:#fff;border:3px solid var(--navy);padding:0.6rem 2rem;cursor:pointer;box-shadow:4px 4px 0 var(--navy)">
          ▶ JOUER
        </button>
        <div id="${containerId}"></div>
       </div>`;

  document.getElementById('modal-body').innerHTML = `
    <div style="background:${col};padding:1.5rem 2rem;border-bottom:4px solid var(--navy);position:relative">
      <div style="font-family:Bangers,cursive;font-size:2rem;letter-spacing:3px;color:#fff">${m.titre || m.title}</div>
      <div style="color:rgba(255,255,255,0.9);font-size:1rem;margin-top:0.3rem">🎤 ${m.artiste || m.artist || '—'}</div>
      <div style="margin-top:0.6rem;display:flex;gap:0.5rem;flex-wrap:wrap">
        <span style="background:${bpmCol};color:#fff;font-family:Bangers,cursive;letter-spacing:2px;padding:0.2rem 0.7rem;font-size:1rem">${bpm} BPM</span>
        <span style="background:rgba(255,255,255,0.2);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">🎵 ${genre}</span>
        ${m.duree ? `<span style="background:rgba(255,255,255,0.2);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">⏱ ${m.duree}</span>` : ''}
        ${m.licence ? `<span style="background:var(--yellow);color:var(--navy);font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">✅ ${m.licence}</span>` : ''}
        ${m.annee ? `<span style="background:rgba(255,255,255,0.2);color:#fff;font-family:Bangers,cursive;letter-spacing:1px;padding:0.2rem 0.7rem;font-size:0.9rem">${m.annee}</span>` : ''}
      </div>
      <button onclick="closeModal()" style="position:absolute;top:1rem;right:1rem;font-family:Bangers,cursive;font-size:1.2rem;background:rgba(255,255,255,0.2);color:#fff;border:2px solid #fff;padding:0.2rem 0.8rem;cursor:pointer">✕ FERMER</button>
    </div>
    <div style="padding:1.5rem 2rem;overflow-y:auto;max-height:70vh">
      ${audioSection}
      ${m.description ? `<div class="modal-section"><div class="modal-section-title">📝 DESCRIPTION</div><p style="margin:0;line-height:1.6;color:#223">${m.description}</p></div>` : ''}
      ${activs.length ? `<div class="modal-section"><div class="modal-section-title">🏃 ACTIVITÉS ÉPS</div><div style="display:flex;gap:0.4rem;flex-wrap:wrap">${activs.map(a=>`<span style="font-family:Bangers,cursive;font-size:0.9rem;letter-spacing:1px;padding:0.2rem 0.6rem;background:var(--blue);color:#fff">${a}</span>`).join('')}</div></div>` : ''}
      ${tags.length ? `<div class="modal-section"><div class="modal-section-title">🏷️ TAGS</div><div style="display:flex;gap:0.3rem;flex-wrap:wrap">${tags.map(t=>`<span style="font-size:0.82rem;padding:0.15rem 0.5rem;background:#f0f4ff;border:1px solid #cce;color:#334">${t}</span>`).join('')}</div></div>` : ''}
      ${m.ambiance ? `<div class="modal-section"><div class="modal-section-title">💫 AMBIANCE</div><p style="margin:0;color:#223">${m.ambiance}</p></div>` : ''}
      ${m.niveau_scolaire ? `<div class="modal-section"><div class="modal-section-title">🎓 NIVEAU SCOLAIRE</div><p style="margin:0;color:#223">${Array.isArray(m.niveau_scolaire)?m.niveau_scolaire.join(', '):m.niveau_scolaire}</p></div>` : ''}
      ${src ? `<div class="modal-section"><div class="modal-section-title">🔗 SOURCE</div>
        <a href="${src}" target="_blank" rel="noopener" style="display:inline-block;font-family:Bangers,cursive;font-size:1rem;letter-spacing:2px;background:var(--blue);color:var(--yellow);padding:0.5rem 1.2rem;border:3px solid var(--navy);text-decoration:none;box-shadow:4px 4px 0 var(--navy)">→ ACCÉDER À LA PISTE</a>
      </div>` : ''}
      ${m.notes ? `<div class="modal-section"><div class="modal-section-title">📌 NOTES</div><p style="margin:0;color:#223">${m.notes}</p></div>` : ''}
    </div>
  `;

  if (audioUrl) {
    const el = document.getElementById('audio-el-direct');
    if (el) { currentAudio = el; el.play().catch(() => {}); }
  }

  document.getElementById('modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  stopCurrentAudio();
  document.getElementById('modal').classList.add('hidden');
  document.body.style.overflow = '';
}

function buildGuide() {
  const el = document.getElementById('guide-content');
  el.innerHTML = `
    <div style="max-width:800px;margin:0 auto">
      ${BPM_RANGES.map(r => {
        const count = ALL_MUSIQUES.filter(m => {
          const b = parseInt(m.bpm)||0;
          return b >= r.min && b < r.max;
        }).length;
        const activExamples = {
          'Calme': 'Yoga, méditation, retour au calme, étirements',
          'Doux':  'Réchauffement léger, mobilité, coopération douce',
          'Modéré':'Jeux collectifs, exercices techniques, circuits modérés',
          'Actif': 'Cardio, poursuite, sports collectifs intensifs, échauffement dynamique',
          'Intense':'HIIT, circuits intenses, haute intensité, sports de combat'
        };
        const intensity = r.label.split(' ').pop().replace('(','').replace(')','').replace('BPM','').trim();
        const zone = r.min < 70 ? 'Zone 1 — Récupération' : r.min < 100 ? 'Zone 2 — Endurance légère' : r.min < 130 ? 'Zone 3 — Endurance modérée' : r.min < 155 ? 'Zone 4 — Seuil anaérobie' : 'Zone 5 — Haute intensité';
        const examples = Object.values(activExamples)[BPM_RANGES.indexOf(r)];
        return `
          <div style="border:4px solid var(--navy);margin-bottom:1.5rem;box-shadow:6px 6px 0 var(--navy)">
            <div style="background:${r.color};padding:1rem 1.5rem;display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-family:Bangers,cursive;font-size:1.8rem;letter-spacing:3px;color:#fff">${r.label}</div>
                <div style="color:rgba(255,255,255,0.85);font-size:0.9rem">${zone}</div>
              </div>
              <div style="font-family:Bangers,cursive;font-size:2rem;color:#fff;text-align:right">${count}<div style="font-size:0.9rem;letter-spacing:2px">PISTES</div></div>
            </div>
            <div style="padding:1.2rem 1.5rem;background:#fff">
              <div style="font-family:Bangers,cursive;font-size:1rem;letter-spacing:2px;color:var(--navy);margin-bottom:0.4rem">ACTIVITÉS RECOMMANDÉES</div>
              <p style="margin:0;color:#334;line-height:1.6">${examples}</p>
            </div>
          </div>`;
      }).join('')}
      <div style="border:4px solid var(--navy);padding:1.5rem;background:var(--yellow);box-shadow:6px 6px 0 var(--navy)">
        <div style="font-family:Bangers,cursive;font-size:1.3rem;letter-spacing:3px;color:var(--navy);margin-bottom:0.8rem">💡 CONSEIL PÉDAGOGIQUE</div>
        <p style="margin:0;color:#001D6E;line-height:1.7">Commencez toujours par un échauffement à <strong>100-130 BPM</strong>, montez progressivement à <strong>130-155 BPM</strong> pour la partie principale, puis redescendez à <strong>70-100 BPM</strong> pour le retour au calme. Cette progression respecte la physiologie de l'effort et favorise une récupération optimale.</p>
      </div>
    </div>
  `;
}

function buildSources() {
  const el = document.getElementById('sources-content');
  const sources = [
    { nom:'Free Music Archive (FMA)', url:'https://freemusicarchive.org', desc:'Archive musicale libre américaine. Milliers de pistes CC0 et Creative Commons. Filtrable par genre et licence.', licence:'CC0 / CC', icon:'🎵' },
    { nom:'ccMixter', url:'https://ccmixter.org', desc:'Communauté de musiciens créant de la musique Creative Commons. Remix et mashup autorisés.', licence:'CC', icon:'🎛️' },
    { nom:'Incompetech (Kevin MacLeod)', url:'https://incompetech.com', desc:'Plus de 2000 pistes instrumentales CC BY. Classées par genre et mood. Idéal pour l\'ÉPS.', licence:'CC BY', icon:'🎹' },
    { nom:'YouTube Audio Library', url:'https://www.youtube.com/audiolibrary', desc:'Bibliothèque officielle YouTube. Musiques et effets sonores gratuits pour usage éducatif.', licence:'Gratuit', icon:'▶️' },
    { nom:'Pixabay Music', url:'https://pixabay.com/music/', desc:'Musiques 100% libres de droits. Pas d\'attribution requise. Idéal pour l\'éducation.', licence:'Pixabay License', icon:'🎶' },
    { nom:'Bensound', url:'https://www.bensound.com', desc:'Musiques originales royalty-free. Plusieurs catégories incluant sport et énergie.', licence:'CC BY-ND', icon:'🎸' },
    { nom:'Jamendo', url:'https://www.jamendo.com', desc:'Plateforme de musique indépendante. Nombreuses licences Creative Commons. Grande sélection.', licence:'CC', icon:'🎺' },
    { nom:'Musopen', url:'https://musopen.org', desc:'Musique classique libre de droits. Parfait pour activités de relaxation et yoga en ÉPS.', licence:'CC0', icon:'🎻' },
  ];

  el.innerHTML = `
    <div style="max-width:900px;margin:0 auto">
      <div style="background:var(--yellow);border:4px solid var(--navy);padding:1rem 1.5rem;margin-bottom:1.5rem;box-shadow:4px 4px 0 var(--navy)">
        <div style="font-family:Bangers,cursive;font-size:1.2rem;letter-spacing:2px;color:var(--navy)">ℹ️ TOUTES LES PISTES DE CETTE BIBLIOTHÈQUE SONT LIBRES DE DROITS POUR USAGE ÉDUCATIF</div>
        <div style="font-size:0.85rem;color:#334;margin-top:0.3rem">Conformément à la Loi sur le droit d'auteur du Canada, l'utilisation dans un contexte scolaire est généralement permise. Vérifiez toujours les conditions de la licence spécifique.</div>
      </div>
      <div class="cards-grid">
        ${sources.map(s => `
          <div style="border:4px solid var(--navy);box-shadow:5px 5px 0 var(--navy);background:#fff">
            <div style="background:var(--navy);padding:0.8rem 1.2rem">
              <div style="font-family:Bangers,cursive;font-size:1.3rem;letter-spacing:2px;color:var(--yellow)">${s.icon} ${s.nom}</div>
              <span style="background:var(--yellow);color:var(--navy);font-family:Bangers,cursive;font-size:0.8rem;letter-spacing:1px;padding:0.1rem 0.5rem">${s.licence}</span>
            </div>
            <div style="padding:1rem 1.2rem">
              <p style="margin:0 0 0.8rem;font-size:0.88rem;color:#334;line-height:1.5">${s.desc}</p>
              <a href="${s.url}" target="_blank" rel="noopener" style="font-family:Bangers,cursive;font-size:0.9rem;letter-spacing:2px;background:var(--blue);color:var(--yellow);padding:0.4rem 0.9rem;text-decoration:none;border:3px solid var(--navy);display:inline-block">→ VISITER</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function switchMusicTab(tab) {
  currentTab = tab;
  document.getElementById('tab-pistes').classList.add('hidden');
  document.getElementById('tab-guide').classList.add('hidden');
  document.getElementById('tab-sources').classList.add('hidden');
  document.getElementById(`tab-${tab}`).classList.remove('hidden');

  document.querySelectorAll('.music-tab').forEach(btn => {
    const isActive = btn.dataset.mtab === tab;
    btn.style.background = isActive ? 'var(--navy)' : 'var(--yellow)';
    btn.style.color = isActive ? 'var(--yellow)' : 'var(--navy)';
  });
}

document.getElementById('search').addEventListener('input', applyFilters);
document.getElementById('f-activite').addEventListener('change', applyFilters);
document.getElementById('f-bpm').addEventListener('change', applyFilters);
document.getElementById('f-licence').addEventListener('change', applyFilters);
document.getElementById('f-genre').addEventListener('change', applyFilters);
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
// TBI MODE MUSIQUE — LECTEUR DJ GÉANT
// ═══════════════════════════════════════
let musTbiActive = false;
let musTbiIdx = 0;
let musTbiList = [];
let musTbiAudio = null;
let musTbiPlaying = false;
let musTbiTouchStartX = 0;
let musTbiAnimFrame = null;

function openMusTBI(idx) {
  musTbiList = (typeof filtered !== 'undefined' && filtered.length > 0) ? filtered : (window.ALL_MUSIQUES || []);
  musTbiIdx = idx !== undefined ? idx : 0;
  musTbiActive = true;
  renderMusTBI();
  document.addEventListener('keydown', musTbiKeyHandler);
}

function closeMusTBI() {
  musTbiActive = false;
  if (musTbiAudio) { musTbiAudio.pause(); musTbiAudio = null; }
  musTbiPlaying = false;
  if (musTbiAnimFrame) { cancelAnimationFrame(musTbiAnimFrame); musTbiAnimFrame = null; }
  const el = document.getElementById('mus-tbi-overlay');
  if (el) el.remove();
  document.removeEventListener('keydown', musTbiKeyHandler);
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}

function musTbiKeyHandler(e) {
  if (!musTbiActive) return;
  if (e.key === 'Escape') { closeMusTBI(); return; }
  if (e.key === 'ArrowRight') { e.preventDefault(); musTbiNextTrack(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); musTbiPrevTrack(); }
  if (e.key === ' ') { e.preventDefault(); musTbiTogglePlay(); }
}

function musTbiNextTrack() {
  if (musTbiIdx < musTbiList.length - 1) { musTbiIdx++; renderMusTBI(); }
}
function musTbiPrevTrack() {
  if (musTbiIdx > 0) { musTbiIdx--; renderMusTBI(); }
}

function musTbiTogglePlay() {
  if (!musTbiAudio) { musTbiPlayCurrent(); return; }
  if (musTbiPlaying) {
    musTbiAudio.pause(); musTbiPlaying = false;
    const btn = document.getElementById('mus-tbi-playbtn');
    if (btn) btn.textContent = '▶ JOUER';
    updateMusTBIState(false);
  } else {
    musTbiAudio.play().catch(() => {}); musTbiPlaying = true;
    const btn = document.getElementById('mus-tbi-playbtn');
    if (btn) btn.textContent = '⏸ PAUSE';
    updateMusTBIState(true);
  }
}

function musTbiPlayCurrent() {
  const m = musTbiList[musTbiIdx];
  if (!m) return;
  const src = m.audio_url || m.url || '';
  if (!src) return;
  if (musTbiAudio) { musTbiAudio.pause(); musTbiAudio = null; }
  musTbiAudio = new Audio(src);
  musTbiAudio.volume = 1;
  musTbiAudio.play().catch(() => {});
  musTbiPlaying = true;
  musTbiAudio.onended = () => { musTbiPlaying = false; updateMusTBIState(false); if (musTbiIdx < musTbiList.length-1) setTimeout(musTbiNextTrack, 500); };
  const btn = document.getElementById('mus-tbi-playbtn');
  if (btn) btn.textContent = '⏸ PAUSE';
  updateMusTBIState(true);
  animateMusTBIBars();
}

function updateMusTBIState(playing) {
  const bars = document.querySelectorAll('.mus-tbi-bar');
  bars.forEach(b => { b.style.animationPlayState = playing ? 'running' : 'paused'; });
}

function animateMusTBIBars() {
  // bars are CSS animated
}

function renderMusTBI() {
  if (musTbiAudio) { musTbiAudio.pause(); musTbiAudio = null; musTbiPlaying = false; }
  const existing = document.getElementById('mus-tbi-overlay');
  if (existing) existing.remove();

  const m = musTbiList[musTbiIdx];
  if (!m) return;

  const total = musTbiList.length;
  const bpm = m.bpm || '—';
  const bpmNum = parseInt(bpm) || 0;
  let bpmColor = '#1a7f3c';
  if (bpmNum >= 155) bpmColor = '#e74c3c';
  else if (bpmNum >= 130) bpmColor = '#e67e22';
  else if (bpmNum >= 100) bpmColor = '#f39c12';
  else if (bpmNum >= 70) bpmColor = '#27ae60';
  else bpmColor = '#2980b9';

  // Build beat visualizer bars (CSS animated)
  const bars = Array.from({length:12}, (_,i) => {
    const h = 20 + Math.random()*60;
    const dur = (0.4 + Math.random()*0.6).toFixed(2);
    const delay = (Math.random()*0.3).toFixed(2);
    return `<div class="mus-tbi-bar" style="height:${h}px;animation-duration:${dur}s;animation-delay:${delay}s;background:${bpmColor}"></div>`;
  }).join('');

  const hasAudio = !!(m.audio_url || m.url || '').match(/\.(mp3|ogg|wav)(\?|$)/i);

  const overlay = document.createElement('div');
  overlay.id = 'mus-tbi-overlay';
  overlay.className = 'tbi-overlay';
  overlay.style.cssText = 'background:linear-gradient(135deg,#001030 0%,#001D6E 60%,#003090 100%)';
  overlay.innerHTML = `
    <style>
      .mus-tbi-bar {
        width: 18px; border-radius: 4px 4px 0 0;
        animation: mus-tbi-bounce 0.5s ease-in-out infinite alternate;
        transform-origin: bottom;
      }
      @keyframes mus-tbi-bounce {
        from { transform: scaleY(0.2); opacity:0.6; }
        to   { transform: scaleY(1);   opacity:1;   }
      }
    </style>

    <div class="tbi-header">
      <div class="tbi-logo">🎵 ZONE TOTAL SPORT — MUSIQUES LIBRES — MODE TBI</div>
      <div style="background:${bpmColor};color:#fff;padding:0.2rem 1.2rem;font-family:Bangers,cursive;font-size:1.3rem;letter-spacing:3px">${bpm} BPM</div>
      <button class="tbi-btn-exit" onclick="closeMusTBI()">✕ QUITTER TBI (ESC)</button>
    </div>

    <div class="tbi-content"
         ontouchstart="musTbiTouchStartX=event.changedTouches[0].clientX"
         ontouchend="(event.changedTouches[0].clientX-musTbiTouchStartX>50)?musTbiPrevTrack():(musTbiTouchStartX-event.changedTouches[0].clientX>50)?musTbiNextTrack():null">

      <!-- Left panel: player controls -->
      <div class="tbi-left" style="gap:1.5rem">
        <!-- Big music emoji -->
        <div style="font-size:5rem;line-height:1;filter:drop-shadow(0 0 20px ${bpmColor})">${m.genre==='Electronic'?'⚡':m.genre==='Hip-Hop'?'🎤':m.genre==='Rock'?'🎸':m.genre==='Classique'?'🎻':m.genre==='Latin'?'💃':m.genre==='Ambient'?'🌊':'🎵'}</div>

        <!-- Title -->
        <div class="tbi-title" style="font-size:clamp(1.5rem,4vw,2.8rem)">${m.titre || 'SANS TITRE'}</div>

        <!-- Artist -->
        ${m.artiste ? `<div style="font-family:Nunito,sans-serif;font-size:1.3rem;font-weight:700;color:#adf;letter-spacing:1px">${m.artiste}</div>` : ''}

        <!-- BPM + genre badges -->
        <div class="tbi-meta">
          <div class="tbi-meta-chip" style="background:${bpmColor};border-color:${bpmColor}">⏱ ${bpm} BPM</div>
          ${m.genre ? `<div class="tbi-meta-chip">🎶 ${m.genre}</div>` : ''}
          ${m.licence ? `<div class="tbi-meta-chip" style="background:#1a7f3c;border-color:#1a7f3c">✅ ${m.licence}</div>` : ''}
        </div>

        <!-- Beat visualizer -->
        <div style="display:flex;align-items:flex-end;gap:4px;height:80px;padding:0.5rem;background:rgba(0,0,0,0.3);border:3px solid ${bpmColor};width:100%;box-sizing:border-box;justify-content:center">
          ${bars}
        </div>

        <!-- Play controls -->
        <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;justify-content:center">
          <button class="tbi-arrow" style="font-size:2rem;padding:0.8rem 1.5rem" onclick="musTbiPrevTrack()" ${musTbiIdx===0?'disabled style="opacity:0.4"':''}>⏮</button>
          ${hasAudio ? `
          <button id="mus-tbi-playbtn" style="background:#1a7f3c;color:#fff;border:4px solid #FFE000;padding:1rem 2.5rem;font-family:Bangers,cursive;font-size:2rem;letter-spacing:2px;cursor:pointer;box-shadow:4px 4px 0 rgba(0,0,0,0.3)" onclick="musTbiTogglePlay()">▶ JOUER</button>
          ` : `<div style="font-family:Nunito,sans-serif;color:#ff9;font-size:0.9rem;text-align:center">Aperçu non disponible<br>pour cette piste</div>`}
          <button class="tbi-arrow" style="font-size:2rem;padding:0.8rem 1.5rem" onclick="musTbiNextTrack()" ${musTbiIdx===total-1?'disabled style="opacity:0.4"':''}>⏭</button>
        </div>
      </div>

      <!-- Right panel: track list -->
      <div class="tbi-right" style="overflow-y:auto">
        <div class="tbi-section-title">📋 LISTE DES PISTES</div>
        <div style="display:flex;flex-direction:column;gap:0.4rem;margin-top:0.5rem">
          ${musTbiList.slice(Math.max(0,musTbiIdx-3), musTbiIdx+10).map((t,relIdx) => {
            const absIdx = Math.max(0,musTbiIdx-3) + relIdx;
            const isActive = absIdx === musTbiIdx;
            return `<div onclick="musTbiIdx=${absIdx};renderMusTBI()"
              style="padding:0.7rem 1rem;border-left:5px solid ${isActive?'#FFE000':'rgba(255,224,0,0.2)'};background:${isActive?'rgba(255,224,0,0.15)':'rgba(255,255,255,0.04)'};cursor:pointer;display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-family:Bangers,cursive;font-size:1.1rem;letter-spacing:2px;color:${isActive?'#FFE000':'#fff'}">${t.titre||'—'}</div>
                ${t.artiste?`<div style="font-family:Nunito,sans-serif;font-size:0.85rem;color:#adf">${t.artiste}</div>`:''}
              </div>
              <div style="font-family:Bangers,cursive;font-size:0.95rem;color:${bpmColor}">${t.bpm||'?'} BPM</div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="tbi-nav-arrows">
        <button class="tbi-arrow" onclick="musTbiPrevTrack()" ${musTbiIdx===0?'disabled style="opacity:0.4"':''}>← PRÉCÉDENTE</button>
        <div class="tbi-counter">${musTbiIdx+1} / ${total}</div>
        <button class="tbi-arrow" onclick="musTbiNextTrack()" ${musTbiIdx===total-1?'disabled style="opacity:0.4"':''}>SUIVANTE →</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  if (overlay.requestFullscreen) overlay.requestFullscreen().catch(() => {});
  else if (overlay.webkitRequestFullscreen) overlay.webkitRequestFullscreen();
}
