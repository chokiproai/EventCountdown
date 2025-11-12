// ===== Utilities & state =====
const $ = (sel) => document.querySelector(sel);
const fmt2 = (n) => String(n).padStart(2,'0');
const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
const qs = new URLSearchParams(location.search);

// ===== Language & Theme State =====
let currentLang = 'vi';
let currentTheme = 'auto';
const CUSTOM_EVENTS = [];
const STORAGE_KEY_EVENTS = 'countdown_events';

let VN_EVENTS = [];
let LUNAR_TEMPLATED = [];
let EDU_EVENTS = [];
let STRINGS = {};
const LOADED_LOCALES = {}; 

const LANG_STRINGS_FALLBACK = {
  'siteTitle': 'Event Countdown', 'createEventBtn': 'Create Event', 'defaultEventTitle': 'Your Event', 'defaultEventDate': 'Press "Create Event" to start.', 'statusDateError': '⚠️ Please enter a valid date and time.', 'statusStarted': '✅ Countdown started.', 'helperComplete': '🎉 The event is here!', 'themeAuto': 'Auto', 'themeLight': 'Light', 'themeDark': 'Dark', 'tzLocal': 'Local (Yours)',
};

/** Lấy chuỗi dịch */
function getString(key) {
  if (key === 'helperCountdown') { const template = STRINGS[key] || '{d} days {h}:{m}:{s} left'; return (d,h,m,s) => template.replace('{d}', d).replace('{h}', h).replace('{m}', m).replace('{s}', s); }
  if (key === 'helperMini') { const template = STRINGS[key] || '{d}d {h}h {m}m'; return (d,h,m) => template.replace('{d}', d).replace('{h}', h).replace('{m}', m); }
  const str = STRINGS[key]; if (str) return str;
  const fallback = LANG_STRINGS_FALLBACK[key]; if (fallback) return fallback;
  return key;
}

// ===== Element cache =====
const el = {
  modal: $('#modal'), modalTitle: $('#title'), modalDate: $('#date'), 
  tzSelect: $('#tzSelect'), modalApply: $('#apply'), modalIcs: $('#ics'), modalShare: $('#share'), modalClose: $('#modalClose'),
  islandCreate: $('#islandCreate'),
  librarySection: $('#librarySection'),
  search: $('#search'), list: $('#list'), year: $('#year'),
  mainCountdownSection: $('#main-countdown-section'),
  countdownList: $('#countdown-list'),
  countdownEmptyPlaceholder: $('#countdown-empty-placeholder'),
  status: $('#status'), 
  urlStatus: $('#urlStatus'), 
  langSwitch: $('#langSwitch'), themeSelect: $('#themeSelect'),
  settingsToggle: $('#settingsToggle'), settingsDropdown: $('#settingsDropdown'),
  alarmSound: $('#alarmSound'),
};

// ===== Âm thanh =====
function initAudioUnlock() {
  function unlockAudio() {
    console.log('Audio context unlocked by user interaction.');
    el.alarmSound.load();
  }
  document.addEventListener('click', unlockAudio, { once: true });
  document.addEventListener('touchstart', unlockAudio, { once: true });
}

// ===== Hàm phát âm thanh N lần =====
function playAlarm(times) {
  let count = 0;
  function play() {
    if (count >= times) return;
    count++;
    try {
      el.alarmSound.currentTime = 0;
      el.alarmSound.play().catch(e => console.warn("Không thể tự động phát âm thanh.", e));
    } catch (e) {
      console.error("Lỗi phát âm thanh:", e);
    }
    if (count < times) {
      setTimeout(play, 1500);
    }
  }
  play();
}

// ===== Hàm Lưu/Tải/Xoá =====
function saveCustomEvents() { try { localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(CUSTOM_EVENTS)); } catch (e) { console.error("Lỗi lưu sự kiện:", e); } }

function loadCustomEvents() { 
  const saved = localStorage.getItem(STORAGE_KEY_EVENTS); if (!saved) return; 
  try { 
    const parsed = JSON.parse(saved); 
    parsed.forEach(ev => { 
      const eventDate = new Date(ev.date);
      CUSTOM_EVENTS.push({ 
        title: ev.title, 
        date: eventDate,
        isFinished: eventDate <= new Date() 
      }); 
    }); 
  } catch (e) { console.error("Lỗi tải sự kiện:", e); localStorage.removeItem(STORAGE_KEY_EVENTS); } 
}

function deleteCustomEvent(isoString) {
  const index = CUSTOM_EVENTS.findIndex(ev => ev.date.toISOString() === isoString);
  if (index > -1) {
    CUSTOM_EVENTS.splice(index, 1);
    saveCustomEvents();
    buildMyEventsSkeleton();
  }
}

// ===== Time helpers =====
function dateToInputString(date, timeZone) { try { const d = new Date(date); const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d); const d_map = parts.reduce((acc, p) => (acc[p.type] = p.value, acc), {}); const hour = d_map.hour === '24' ? '00' : d_map.hour; return `${d_map.year}-${d_map.month}-${d_map.day}T${hour}:${d_map.minute}`; } catch (e) { console.error("Lỗi dateToInputString:", e); return ''; } }
function dateToLocalInputString(d) { const off = d.getTimezoneOffset(); const local = new Date(d.getTime() - off*60000); return local.toISOString().slice(0,16); }
function parseOffset(offsetStr) { const match = offsetStr.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/); if (!match) return 0; const sign = match[1] === '-' ? -1 : 1; const hours = parseInt(match[2], 10); const minutes = parseInt(match[3] || '0', 10); return sign * (hours * 60 + minutes); }
function formatOffset(offsetMinutes) { const sign = offsetMinutes >= 0 ? '+' : '-'; const absMin = Math.abs(offsetMinutes); const h = String(Math.floor(absMin / 60)).padStart(2, '0'); const m = String(absMin % 60).padStart(2, '0'); return `${sign}${h}:${m}`; }
function parseInputToDate() { const dateStr = el.modalDate.value; if (!dateStr) return null; const selectedTZ = el.tzSelect.value; if (selectedTZ === tzName) { const d = new Date(dateStr); return isNaN(d) ? null : d; } try { const tempDate = new Date(dateStr); if (isNaN(tempDate)) return null; const offsetStr = new Intl.DateTimeFormat('en', { timeZone: selectedTZ, timeZoneName: 'shortOffset' }).format(tempDate); const offsetMinutes = parseOffset(offsetStr); const isoStr = dateStr + formatOffset(offsetMinutes); const finalDate = new Date(isoStr); return isNaN(finalDate) ? null : finalDate; } catch (e) { console.error("Lỗi parseInputToDate:", e); return null; } }
function isoUTC(d){ return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString(); }
function bumpToFuture(date){ if(!(date instanceof Date) || isNaN(date)) return null; const now = new Date(); let years = 0; while (date <= now) { date = new Date( date.getFullYear()+1, date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds() ); years++; } return { date, yearsBumped: years }; }
function renderTemplateWithYear(templateKey, date){ const template = getString(templateKey); if(!template) return ''; return template.replace(/\{yyyy\+1\}/g, String(date.getFullYear()+1)).replace(/\{yyyy\}/g, String(date.getFullYear())); }
function syncTitleYearToDate(title, date){ if(!title || !(date instanceof Date)) return title; if(/\{yyyy\}/.test(title) || /\{yyyy\+1\}/.test(title)) return renderTemplateWithYear(title.replace(/.*\{(.+?)\}.*/, '$1'), date); const yr = String(date.getFullYear()); return title.replace(/(\d{4})(?!.*\d{4})/, yr); }

// ===== Hàm buildLibraryForYear =====
function buildLibraryForYear(y){
  const items = [];
  VN_EVENTS.forEach(e=>{ const date = (e.fixedMonth && e.fixedDay) ? new Date(y, e.fixedMonth-1, e.fixedDay, 0, 0, 0) : new Date(y, e.month-1, e.day, 0, 0, 0); const name = e.templated ? renderTemplateWithYear(e.langKey, date) : getString(e.langKey); const note = e.noteKey ? getString(e.noteKey) : ''; items.push({ name, date, note, emoji: e.emoji || '📅' }); });
  LUNAR_TEMPLATED.forEach(e=>{ const base = new Date(e.baseISO); const date = new Date(y, base.getMonth(), base.getDate(), base.getHours(), base.getMinutes(), base.getSeconds()); const name = renderTemplateWithYear(e.langKey, date); items.push({ name, date, note: getString(e.noteKey || 'genericNote'), emoji: e.emoji || '📅' }); });
  EDU_EVENTS.forEach(e=>{ const base = new Date(e.baseISO); const date = new Date(y, base.getMonth(), base.getDate(), base.getHours(), base.getMinutes(), base.getSeconds()); const name = renderTemplateWithYear(e.langKey, date); items.push({ name, date, note: e.noteKey ? getString(e.noteKey) : '', emoji: e.emoji || '📅' }); });
  return items.sort((a,b)=> a.date - b.date);
}

// ===== Year options logic =====
const YEAR_WINDOW_AHEAD = 5, YEAR_WINDOW_BEHIND = 0;
function collectLibraryYears(){ const nowY = new Date().getFullYear(); const years = new Set(); for(let y = nowY - YEAR_WINDOW_BEHIND; y <= nowY + YEAR_WINDOW_AHEAD; y++) years.add(y); return years; }
function collectCustomYears(){ const s = new Set(); CUSTOM_EVENTS.forEach(ev => s.add(ev.date.getFullYear())); return s; }
function updateYearOptions(selectedMaybe){ const libYears = collectLibraryYears(); const customYears = collectCustomYears(); const merged = new Set([...libYears, ...customYears]); const arr = [...merged].sort((a,b)=>a-b); const prefer = selectedMaybe ?? (arr.includes(new Date().getFullYear()) ? new Date().getFullYear() : arr[0]); el.year.innerHTML = arr.map(y => `<option value="${y}">${y}</option>`).join(''); el.year.value = String(prefer); }

// ===== URL init & labels =====
function initFromURL(){
  let titleFromURL = qs.get('title');
  const dateStr = qs.get('date');
  if(dateStr){ 
    const raw = new Date(dateStr);
    if(!isNaN(raw)){
      const bumped = bumpToFuture(raw); const t = bumped ? bumped.date : raw;
      if(titleFromURL) titleFromURL = syncTitleYearToDate(decodeURIComponent(titleFromURL), t);
      el.modalTitle.value = titleFromURL || getString('defaultEventTitle');
      el.modalDate.value = dateToInputString(t, tzName);
      el.tzSelect.value = tzName;
      openModal({ name: el.modalTitle.value, date: t });
      return;
    }
  }
  if(titleFromURL && !dateStr) el.modalTitle.value = titleFromURL;
}

function updateLabels(){
  const statusKey = (qs.has('title') || qs.has('date')) ? 'urlStatusConfigured' : 'urlStatusNotConfigured';
  if (el.urlStatus) {
    el.urlStatus.textContent = getString(statusKey);
  }
}

// ===== Modal open/close =====
function openModal(prefill){ const selectedYear = parseInt(el.year.value || new Date().getFullYear(), 10); el.tzSelect.value = tzName; if(prefill){ if(prefill.date){ const d = new Date(prefill.date); d.setFullYear(selectedYear); el.modalDate.value = dateToInputString(d, tzName); el.modalTitle.value = syncTitleYearToDate(prefill.name || '', d); } else if(prefill.name){ el.modalTitle.value = prefill.name; const t = new Date(selectedYear, new Date().getMonth(), new Date().getDate(), 9, 0, 0); el.modalDate.value = dateToInputString(t, tzName); } } if(!el.modalDate.value){ const t = new Date(selectedYear, new Date().getMonth(), new Date().getDate(), new Date().getHours()+1, 0, 0); el.modalDate.value = dateToInputString(t, tzName); } el.modal.setAttribute('aria-hidden','false'); el.modalTitle.focus(); }
function closeModal(){ el.modal.setAttribute('aria-hidden','true'); }

// ===== Share & ICS =====
function buildShareURL(){ const p=new URLSearchParams(); const title=el.modalTitle.value?.trim(); const t=parseInputToDate(); if(title) p.set('title', encodeURIComponent(title)); if(t) p.set('date', isoUTC(t)); return location.origin+location.pathname+'?'+p.toString(); }
async function copyShare(){ const url=buildShareURL(); try{ await navigator.clipboard.writeText(url); el.status.textContent=getString('statusCopied'); } catch{ el.status.textContent=getString('statusLink') + url; } }
function icsDate(d){ const pad=(n)=>String(n).padStart(2,'0'); return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+'T'+ pad(d.getUTCHours())+pad(d.getUTCMinutes())+pad(d.getUTCSeconds())+'Z'; }
function escapeICS(s){ return String(s).replace(/[\\,;]/g,(m)=>'\\'+m).replace(/\n/g,'\\n'); }
function makeICS(){ const t=parseInputToDate(); const raw=(el.modalTitle.value?.trim()||getString('defaultEventTitle')); const title=syncTitleYearToDate(raw, t || new Date()); if(!t){ el.status.textContent=getString('statusIcsError'); return; } const dtStart=icsDate(t); const dtEnd=icsDate(new Date(t.getTime()+60*60*1000)); const ics=`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EventCountdown//VN//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${crypto.randomUUID()}
DTSTAMP:${icsDate(new Date())}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${escapeICS(title)}
DESCRIPTION:Countdown: ${escapeICS(location.href)}
END:VEVENT
END:VCALENDAR`; const blob=new Blob([ics],{type:'text/calendar'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='event.ics'; document.body.appendChild(a); a.click(); a.remove(); }

// ===== Apply countdown =====
function apply(){ 
  let t = parseInputToDate(); if(!t){ el.status.textContent=getString('statusDateError'); shake(el.modalDate); return; } 
  const bumped = bumpToFuture(new Date(t)); if(bumped){ t = bumped.date; el.modalDate.value = dateToInputString(t, el.tzSelect.value); } 
  const rawTitle = (el.modalTitle.value?.trim()||getString('defaultEventTitle')); 
  el.modalTitle.value = syncTitleYearToDate(rawTitle, t); 
  el.status.textContent=getString('statusStarted'); 
  
  const exists = CUSTOM_EVENTS.some(ev => ev.date.toISOString() === t.toISOString() && ev.title === el.modalTitle.value); 
  if (!exists) { 
    CUSTOM_EVENTS.push({ 
      title: el.modalTitle.value, 
      date: t,
      isFinished: t <= new Date()
    }); 
    saveCustomEvents(); 
  } 
  
  updateYearOptions(el.year.value ? parseInt(el.year.value,10) : t.getFullYear()); 
  buildMyEventsSkeleton();
  updateLabels();
  closeModal(); 
}

// ===== Vòng lặp `tick()` =====
function tick() {
  updateEventCards();
  setTimeout(tick, 500);
}

// ===== Hàm xây dựng =====
function buildMyEventsSkeleton() {
  const items = CUSTOM_EVENTS.sort((a, b) => a.date - b.date);
  
  el.countdownList.classList.remove('layout-single');
  if (items.length === 1) {
    el.countdownList.classList.add('layout-single');
  }

  if (items.length === 0) {
    el.countdownList.innerHTML = '';
    el.countdownEmptyPlaceholder.removeAttribute('hidden');
    return;
  }
  
  el.countdownEmptyPlaceholder.setAttribute('hidden', '');
  el.countdownList.innerHTML = '';

  items.forEach(it => {
    const iso = it.date.toISOString();
    const when = new Intl.DateTimeFormat(currentLang, { dateStyle: 'full', timeStyle: 'short' }).format(it.date);
    const card = document.createElement('div');
    card.className = 'event-card';
    card.id = `card-${iso}`;
    
    card.innerHTML = `
      <div class="countdown">
        <div class="cell"><div id="d-${iso}" class="num">0</div><div class="lbl" data-lang="lblDay">${getString('lblDay')}</div></div>
        <div class="cell"><div id="h-${iso}" class="num">00</div><div class="lbl" data-lang="lblHour">${getString('lblHour')}</div></div>
        <div class="cell"><div id="m-${iso}" class="num">00</div><div class="lbl" data-lang="lblMinute">${getString('lblMinute')}</div></div>
        <div class="cell"><div id="s-${iso}" class="num">00</div><div class="lbl" data-lang="lblSecond">${getString('lblSecond')}</div></div>
      </div>
      <div class="meta">
        <div class="event-title">${it.title}</div>
        <div class="event-date">${when}</div>
      </div>
      <div class="progress">
        <div id="bar-${iso}" class="bar"></div>
      </div>
      <div id="helper-${iso}" class="helper"></div>
      <div class="event-card-actions">
        <button class="btn" data-act="delete" data-iso="${iso}" title="${getString('btnDelete')}">
          ${getString('btnDelete')}
        </button>
      </div>
    `;

    card.querySelector('[data-act="delete"]').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCustomEvent(e.currentTarget.dataset.iso);
    });
    
    el.countdownList.appendChild(card);
  });
  
  updateEventCards();
}

// ===== Hàm Cập nhật Thẻ =====
function updateEventCards() {
  const now = new Date();
  
  CUSTOM_EVENTS.forEach(it => {
    const iso = it.date.toISOString();
    const el_d = document.getElementById(`d-${iso}`);
    if (!el_d) return; 
    
    const el_h = document.getElementById(`h-${iso}`);
    const el_m = document.getElementById(`m-${iso}`);
    const el_s = document.getElementById(`s-${iso}`);
    const el_bar = document.getElementById(`bar-${iso}`);
    const el_helper = document.getElementById(`helper-${iso}`);
    const el_card = document.getElementById(`card-${iso}`);
    
    const t = it.date;
    const diff = t - now;
    const past = diff <= 0;
    const total = Math.abs(diff);
    const sec = Math.floor(total / 1000) % 60;
    const min = Math.floor(total / 60000) % 60;
    const hr = Math.floor(total / 3600000) % 24;
    const day = Math.floor(total / 86400000);
    
    el_d.textContent = day;
    el_h.textContent = fmt2(hr);
    el_m.textContent = fmt2(min);
    el_s.textContent = fmt2(sec);
    
    if (!past) {
      el_bar.style.width = '0%';
      el_helper.textContent = getString('helperCountdown')(day, fmt2(hr), fmt2(min), fmt2(sec));
      el_card.classList.remove('past');
    } else {
      el_bar.style.width = '100%';
      el_helper.textContent = getString('helperComplete');
      el_card.classList.add('past');
      
      if (!it.isFinished) {
        playAlarm(3);
        it.isFinished = true;
      }
    }
  });
}

// ===== Hàm Render Thư viện =====
function renderLibraryList() {
  const now = new Date(); 
  const currentYear = now.getFullYear(); 
  const selectedYear = parseInt(el.year.value || currentYear, 10); 
  const q = (el.search.value || '').toLowerCase(); 
  
  const libItems = (VN_EVENTS.length === 0 && LUNAR_TEMPLATED.length === 0) ? [] : buildLibraryForYear(selectedYear);
  const items = libItems.filter(it => it.name.toLowerCase().includes(q));
  
  el.list.innerHTML = '';
  
  items.forEach(it => { 
    let isPast; 
    if (selectedYear < currentYear) isPast = true; 
    else if (selectedYear > currentYear) isPast = false; 
    else isPast = it.date < now; 
    
    const when = new Intl.DateTimeFormat(currentLang, { dateStyle: 'full', timeStyle: 'short' }).format(it.date); 
    const li = document.createElement('li'); 
    li.className = 'card-item' + (isPast ? ' past' : ''); 
    
    li.innerHTML = ` 
      <div class="item-left"> 
        <div class="emoji">${it.emoji || '📅'}</div> 
        <div class="item-meta"> 
          <div class="item-title">${it.name}</div> 
          <div class="item-sub">${when}${it.note ? ' · ' + it.note : ''}${isPast ? ' · ' + getString('pastSuffix') : ''}</div> 
        </div> 
      </div> 
      <div class="item-actions"> 
        <button class="btn" data-act="create" ${isPast ? `disabled aria-disabled="true" title="${getString('pastEventTitle')}"` : ''}> 
          ${getString('modalBtnApply')} 
        </button> 
      </div> 
    `; 
    
    if (!isPast) { 
      li.querySelector('[data-act="create"]').addEventListener('click', () => { 
        openModal({ name: it.name, date: it.date }); 
      }); 
    } 
    el.list.appendChild(li); 
  }); 
}

// ===== Tải Ngôn ngữ & Theme =====
async function loadEventLibrary(libraryData) {
  VN_EVENTS = []; LUNAR_TEMPLATED = []; EDU_EVENTS = [];
  if (!libraryData || Object.keys(libraryData).length === 0) {
    console.log(`Không có thư viện cho ngôn ngữ: ${currentLang}`);
    el.librarySection.setAttribute('hidden', '');
    return;
  }
  VN_EVENTS = libraryData.VN_EVENTS || [];
  LUNAR_TEMPLATED = libraryData.LUNAR_TEMPLATED || [];
  EDU_EVENTS = libraryData.EDU_EVENTS || [];
  el.librarySection.removeAttribute('hidden');
}

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
function populateTimezoneSelect() { const currentTZ = el.tzSelect.value || tzName; el.tzSelect.innerHTML = ''; const localOpt = new Option(`${getString('tzLocal')} (${tzName})`, tzName); el.tzSelect.add(localOpt); const sep = new Option('---', ''); sep.disabled = true; el.tzSelect.add(sep); try { const timezones = Intl.supportedValuesOf('timeZone'); timezones.filter(tz => tz !== tzName).forEach(tz => { const opt = new Option(tz.replace(/_/g, ' '), tz); el.tzSelect.add(opt); }); } catch (e) { console.warn("Không thể tải danh sách múi giờ."); } if (Array.from(el.tzSelect.options).some(opt => opt.value === currentTZ)) { el.tzSelect.value = currentTZ; } else { el.tzSelect.value = tzName; } }

async function setLanguage(lang) {
  if (!['vi', 'en'].includes(lang)) { lang = 'en'; }
  currentLang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem('countdown_lang', lang);
  el.langSwitch.value = lang;
  
  if (LOADED_LOCALES[lang]) {
    console.log(`Sử dụng ngôn ngữ từ cache: ${lang}`);
    const data = LOADED_LOCALES[lang];
    STRINGS = data.strings;
    loadEventLibrary(data.library);
  } else {
    try {
      console.log(`Đang tải ngôn ngữ: locales/${lang}.json`);
      const response = await fetch(`locales/${lang}.json`);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      STRINGS = data.strings;
      loadEventLibrary(data.library);
      LOADED_LOCALES[lang] = data;
    } catch (error) {
      console.error(`Lỗi tải tệp ngôn ngữ (${lang}):`, error);
      STRINGS = LANG_STRINGS_FALLBACK;
      loadEventLibrary({});
      el.librarySection.innerHTML = `<p>${getString('libLoadError')}</p>`;
      el.librarySection.removeAttribute('hidden');
    }
  }

  document.querySelectorAll('[data-lang]').forEach(node => { if (node.tagName === 'OPTION') return; node.textContent = getString(node.dataset.lang); });
  document.querySelectorAll('#themeSelect option[data-lang]').forEach(node => { node.textContent = getString(node.dataset.lang); });
  document.querySelectorAll('[data-lang-placeholder]').forEach(node => { node.placeholder = getString(node.dataset.langPlaceholder); });
  document.querySelectorAll('[data-lang-aria]').forEach(node => { node.setAttribute('aria-label', getString(node.dataset.langAria)); });
  document.querySelectorAll('[data-lang-default]').forEach(node => { const defaultKey = node.dataset.langDefault; const isDefault = Object.values(LOADED_LOCALES).some(loc => loc.strings[defaultKey] === node.textContent.trim()) || LANG_STRINGS_FALLBACK[defaultKey] === node.textContent.trim(); if (isDefault) { node.textContent = getString(defaultKey); } });
  
  populateTimezoneSelect();
  updateLabels();
  renderLibraryList();
  buildMyEventsSkeleton();
  updateYearOptions(parseInt(el.year.value, 10));
}
function applyTheme(theme) { if (theme === 'dark') { document.documentElement.classList.add('dark'); } else { document.documentElement.classList.remove('dark'); } }
function setTheme(theme) { currentTheme = theme; localStorage.setItem('countdown_theme', theme); el.themeSelect.value = theme; if (theme === 'auto') { applyTheme(prefersDark.matches ? 'dark' : 'light'); } else { applyTheme(theme); } }
prefersDark.addEventListener('change', (e) => { if (currentTheme === 'auto') { applyTheme(e.matches ? 'dark' : 'light'); } });

// ===== Events =====
el.modalApply.addEventListener('click', apply);
el.modalShare.addEventListener('click', copyShare);
el.modalIcs.addEventListener('click', makeICS);
el.islandCreate.addEventListener('click', ()=> openModal());
$('#modalClose').addEventListener('click', closeModal);
el.modal.addEventListener('click', (e)=>{ if(e.target===el.modal) closeModal(); });
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && el.modal.getAttribute('aria-hidden')==='false') closeModal(); });

el.search.addEventListener('input', () => {
  renderLibraryList();
  buildMyEventsSkeleton();
});
el.year.addEventListener('change', () => {
  renderLibraryList();
});

el.langSwitch.addEventListener('change', () => { setLanguage(el.langSwitch.value); toggleSettings(false); });
el.themeSelect.addEventListener('change', () => { setTheme(el.themeSelect.value); });
function toggleSettings(show) { const isHidden = el.settingsDropdown.hasAttribute('hidden'); if (show === true || (show !== false && isHidden)) { el.settingsDropdown.removeAttribute('hidden'); el.settingsToggle.setAttribute('aria-expanded', 'true'); } else { el.settingsDropdown.setAttribute('hidden', ''); el.settingsToggle.setAttribute('aria-expanded', 'false'); } }
el.settingsToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleSettings(); });
document.addEventListener('click', (e) => { if (!el.settingsDropdown.hasAttribute('hidden') && !el.settingsDropdown.contains(e.target) && !el.settingsToggle.contains(e.target)) { toggleSettings(false); } });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !el.settingsDropdown.hasAttribute('hidden')) { toggleSettings(false); el.settingsToggle.focus(); } });
el.settingsDropdown.addEventListener('click', (e) => e.stopPropagation());
function applyHashPreset(){ const h=(location.hash||'').toLowerCase(); if(!h) return; const y = parseInt(el.year.value || new Date().getFullYear(), 10); let t; if(h==='#tomorrow'){ t = new Date(y, new Date().getMonth(), new Date().getDate()+1, 9, 0, 0); } else if(h==='#in-1h'){ t = new Date(); t.setHours(t.getHours()+1); } else if(h==='#in-10m'){ t = new Date(); t.setMinutes(t.getMinutes()+10); } else return; el.modalDate.value = dateToInputString(t, tzName); el.tzSelect.value = tzName; openModal(); }

// ===== Tests =====
function runTests(){ const dUtc=new Date(Date.UTC(2025,0,2,3,4,5)); console.assert(icsDate(dUtc)==='20250102T030405Z','icsDate failed'); const cases=[ {input:'commas,semis;back\\slash', expect:'commas\\,semis\\;back\\\\slash'}, {input:'line\nbreak', expect:'line\\nbreak'}, ]; cases.forEach((c,i)=>{ const got=escapeICS(c.input); console.assert(got===c.expect, 'escapeICS '+i); }); 
  console.assert(typeof buildLibraryForYear==='function' && (VN_EVENTS.length > 0 || EDU_EVENTS.length > 0 || LOADED_LOCALES['vi']), 'library build failed or empty');
}


// ===== Boot =====
async function boot(){
  loadCustomEvents();
  
  const savedLang = localStorage.getItem('countdown_lang');
  const browserLang = (navigator.language || 'vi').split('-')[0];
  const langToLoad = (savedLang && ['vi', 'en'].includes(savedLang)) ? savedLang : (['vi', 'en'].includes(browserLang) ? browserLang : 'vi');
  await setLanguage(langToLoad);
  
  const savedTheme = localStorage.getItem('countdown_theme') || 'auto';
  setTheme(savedTheme);
  updateYearOptions();
  initFromURL();       
  applyHashPreset();
  runTests();
  initAudioUnlock();
  updateLabels();
  buildMyEventsSkeleton();
  renderLibraryList();
  tick();
}

boot();

// ===== Helpers =====
function shake(node){ if(!node) return; node.animate( [{transform:'translateY(0)'},{transform:'translateY(-3px)'},{transform:'translateY(0)'}], {duration:300,iterations:1} ); }