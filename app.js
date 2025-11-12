// ===== Utilities & state =====
const $ = (sel) => document.querySelector(sel);
const fmt2 = (n) => String(n).padStart(2,'0');
const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
const qs = new URLSearchParams(location.search);

// ===== Language & Theme State =====
let currentLang = 'vi';
let currentTheme = 'auto';
const CUSTOM_EVENTS = [];
let target=null, startWhenSet=null;
const STORAGE_KEY_EVENTS = 'countdown_events';
const STORAGE_KEY_ACTIVE_EVENT = 'countdown_active_event';
let activeEventLoaded = false;

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
  if (key === 'helperCountdown') {
    const template = STRINGS[key] || '{d} days {h}:{m}:{s} left';
    return (d,h,m,s) => template.replace('{d}', d).replace('{h}', h).replace('{m}', m).replace('{s}', s);
  }
  // [MỚI] Thêm hàm đếm ngược mini
  if (key === 'helperMini') {
    const template = STRINGS[key] || '{d}d {h}h {m}m';
    return (d,h,m) => template.replace('{d}', d).replace('{h}', h).replace('{m}', m);
  }
  const str = STRINGS[key]; if (str) return str;
  const fallback = LANG_STRINGS_FALLBACK[key]; if (fallback) return fallback;
  return key;
}

// ===== Element cache (CẬP NHẬT) =====
const el = {
  // popup form
  modal: $('#modal'), modalTitle: $('#title'), modalDate: $('#date'), 
  tzSelect: $('#tzSelect'), modalApply: $('#apply'), modalIcs: $('#ics'), modalShare: $('#share'), modalClose: $('#modalClose'),
  // island button
  islandCreate: $('#islandCreate'),
  // main countdown
  d: $('#d'), h: $('#h'), m: $('#m'), s: $('#s'),
  displayTitle: $('#displayTitle'), displayDate: $('#displayDate'),
  helper: $('#helper'), bar: $('#bar'), progressBar: $('#progress-bar'),
  // library
  librarySection: $('#librarySection'),
  search: $('#search'), list: $('#list'), year: $('#year'),
  // [MỚI] My Events
  myEventsSection: $('#myEventsSection'),
  myEventsList: $('#my-events-list'),
  // misc
  status: $('#status'), urlStatus: $('#urlStatus'),
  langSwitch: $('#langSwitch'), themeSelect: $('#themeSelect'),
  settingsToggle: $('#settingsToggle'), settingsDropdown: $('#settingsDropdown'),
};

// ===== Hàm Lưu/Tải/Xoá (CẬP NHẬT) =====
function saveCustomEvents() { try { localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(CUSTOM_EVENTS)); } catch (e) { console.error("Lỗi lưu sự kiện:", e); } }
function loadCustomEvents() { const saved = localStorage.getItem(STORAGE_KEY_EVENTS); if (!saved) return; try { const parsed = JSON.parse(saved); parsed.forEach(ev => { CUSTOM_EVENTS.push({ title: ev.title, date: new Date(ev.date) }); }); } catch (e) { console.error("Lỗi tải sự kiện:", e); localStorage.removeItem(STORAGE_KEY_EVENTS); } }

// [MỚI] Hàm reset đồng hồ chính
function clearActiveCountdown() {
  target = null;
  startWhenSet = null;
  localStorage.removeItem(STORAGE_KEY_ACTIVE_EVENT);
  
  // Reset giá trị trong modal (nguồn chân lý)
  el.modalTitle.value = '';
  el.modalDate.value = '';

  // Reset hiển thị
  el.d.textContent = 0;
  el.h.textContent = fmt2(0);
  el.m.textContent = fmt2(0);
  el.s.textContent = fmt2(0);
  
  // Gọi updateLabels để điền text mặc định
  updateLabels();
}

// [CẬP NHẬT] deleteCustomEvent
function deleteCustomEvent(isoString) {
  const index = CUSTOM_EVENTS.findIndex(ev => ev.date.toISOString() === isoString);
  if (index > -1) {
    // Lấy ISO của đồng hồ chính TRƯỚC KHI xoá
    const activeISO = target ? target.toISOString() : null;
    
    // Xoá sự kiện
    CUSTOM_EVENTS.splice(index, 1);
    saveCustomEvents();
    renderMyEventsList(); // Vẽ lại danh sách "My Events"
    updateYearOptions(parseInt(el.year.value, 10)); // Cập nhật dropdown năm

    // [MỚI] Kiểm tra và reset đồng hồ chính
    if (activeISO === isoString) {
      clearActiveCountdown();
    }
  }
}

function loadActiveEvent() {
  const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_EVENT); if (!saved) return;
  try {
    const activeEvent = JSON.parse(saved); const t = new Date(activeEvent.date);
    if (isNaN(t)) { localStorage.removeItem(STORAGE_KEY_ACTIVE_EVENT); return; }
    el.modalTitle.value = activeEvent.title;
    el.modalDate.value = dateToLocalInputString(t);
    el.tzSelect.value = tzName;
    target = t; startWhenSet = new Date(); activeEventLoaded = true;
  } catch (e) { console.error("Lỗi tải sự kiện đang đếm:", e); localStorage.removeItem(STORAGE_KEY_ACTIVE_EVENT); }
}

// ===== Time helpers (Không thay đổi) =====
function dateToInputString(date, timeZone) { try { const d = new Date(date); const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d); const d_map = parts.reduce((acc, p) => (acc[p.type] = p.value, acc), {}); const hour = d_map.hour === '24' ? '00' : d_map.hour; return `${d_map.year}-${d_map.month}-${d_map.day}T${hour}:${d_map.minute}`; } catch (e) { console.error("Lỗi dateToInputString:", e); return ''; } }
function dateToLocalInputString(d) { const off = d.getTimezoneOffset(); const local = new Date(d.getTime() - off*60000); return local.toISOString().slice(0,16); }
function parseOffset(offsetStr) { const match = offsetStr.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/); if (!match) return 0; const sign = match[1] === '-' ? -1 : 1; const hours = parseInt(match[2], 10); const minutes = parseInt(match[3] || '0', 10); return sign * (hours * 60 + minutes); }
function formatOffset(offsetMinutes) { const sign = offsetMinutes >= 0 ? '+' : '-'; const absMin = Math.abs(offsetMinutes); const h = String(Math.floor(absMin / 60)).padStart(2, '0'); const m = String(absMin % 60).padStart(2, '0'); return `${sign}${h}:${m}`; }
function parseInputToDate() { const dateStr = el.modalDate.value; if (!dateStr) return null; const selectedTZ = el.tzSelect.value; if (selectedTZ === tzName) { const d = new Date(dateStr); return isNaN(d) ? null : d; } try { const tempDate = new Date(dateStr); if (isNaN(tempDate)) return null; const offsetStr = new Intl.DateTimeFormat('en', { timeZone: selectedTZ, timeZoneName: 'shortOffset' }).format(tempDate); const offsetMinutes = parseOffset(offsetStr); const isoStr = dateStr + formatOffset(offsetMinutes); const finalDate = new Date(isoStr); return isNaN(finalDate) ? null : finalDate; } catch (e) { console.error("Lỗi parseInputToDate:", e); return null; } }
function isoUTC(d){ return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString(); }
function bumpToFuture(date){ if(!(date instanceof Date) || isNaN(date)) return null; const now = new Date(); let years = 0; while (date <= now) { date = new Date( date.getFullYear()+1, date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds() ); years++; } return { date, yearsBumped: years }; }
function renderTemplateWithYear(templateKey, date){ const template = getString(templateKey); if(!template) return ''; return template.replace(/\{yyyy\+1\}/g, String(date.getFullYear()+1)).replace(/\{yyyy\}/g, String(date.getFullYear())); }
function syncTitleYearToDate(title, date){ if(!title || !(date instanceof Date)) return title; if(/\{yyyy\}/.test(title) || /\{yyyy\+1\}/.test(title)) return renderTemplateWithYear(title.replace(/.*\{(.+?)\}.*/, '$1'), date); const yr = String(date.getFullYear()); return title.replace(/(\d{4})(?!.*\d{4})/, yr); }

// ===== Hàm buildLibraryForYear (Không thay đổi) =====
function buildLibraryForYear(y){
  const items = [];
  VN_EVENTS.forEach(e=>{ const date = (e.fixedMonth && e.fixedDay) ? new Date(y, e.fixedMonth-1, e.fixedDay, 0, 0, 0) : new Date(y, e.month-1, e.day, 0, 0, 0); const name = e.templated ? renderTemplateWithYear(e.langKey, date) : getString(e.langKey); const note = e.noteKey ? getString(e.noteKey) : ''; items.push({ name, date, note, emoji: e.emoji || '📅' }); });
  LUNAR_TEMPLATED.forEach(e=>{ const base = new Date(e.baseISO); const date = new Date(y, base.getMonth(), base.getDate(), base.getHours(), base.getMinutes(), base.getSeconds()); const name = renderTemplateWithYear(e.langKey, date); items.push({ name, date, note: getString(e.noteKey || 'genericNote'), emoji: e.emoji || '📅' }); });
  EDU_EVENTS.forEach(e=>{ const base = new Date(e.baseISO); const date = new Date(y, base.getMonth(), base.getDate(), base.getHours(), base.getMinutes(), base.getSeconds()); const name = renderTemplateWithYear(e.langKey, date); items.push({ name, date, note: e.noteKey ? getString(e.noteKey) : '', emoji: e.emoji || '📅' }); });
  return items.sort((a,b)=> a.date - b.date);
}

// ===== Year options logic (Không thay đổi) =====
const YEAR_WINDOW_AHEAD = 5, YEAR_WINDOW_BEHIND = 0;
function collectLibraryYears(){ const nowY = new Date().getFullYear(); const years = new Set(); for(let y = nowY - YEAR_WINDOW_BEHIND; y <= nowY + YEAR_WINDOW_AHEAD; y++) years.add(y); return years; }
function collectCustomYears(){ const s = new Set(); CUSTOM_EVENTS.forEach(ev => s.add(ev.date.getFullYear())); return s; }
function updateYearOptions(selectedMaybe){ const libYears = collectLibraryYears(); const customYears = collectCustomYears(); const merged = new Set([...libYears, ...customYears]); const arr = [...merged].sort((a,b)=>a-b); const prefer = selectedMaybe ?? (arr.includes(new Date().getFullYear()) ? new Date().getFullYear() : arr[0]); el.year.innerHTML = arr.map(y => `<option value="${y}">${y}</option>`).join(''); el.year.value = String(prefer); }

// ===== URL init & labels (Không thay đổi) =====
function initFromURL(){
  let titleFromURL = qs.get('title');
  const dateStr = qs.get('date');
  if(dateStr){ 
    const raw = new Date(dateStr);
    if(!isNaN(raw)){
      const bumped = bumpToFuture(raw); const t = bumped ? bumped.date : raw;
      if(titleFromURL) titleFromURL = syncTitleYearToDate(decodeURIComponent(titleFromURL), t);
      el.modalTitle.value = titleFromURL || getString('defaultEventTitle');
      openModal({ name: el.modalTitle.value, date: t });
      apply(); return;
    }
  }
  if (activeEventLoaded) { return; }
  if(titleFromURL && !dateStr) el.modalTitle.value = titleFromURL;
}
function updateLabels(){
  const t = parseInputToDate(); 
  let title = el.modalTitle.value?.trim() || getString('defaultEventTitle');
  if(t) title = syncTitleYearToDate(title, t);
  el.displayTitle.textContent = title;
  if (title === getString('defaultEventTitle')) el.displayTitle.dataset.lang = 'defaultEventTitle';
  else el.displayTitle.removeAttribute('data-lang');
  if(t){
    const selectedTZ = el.tzSelect.value;
    const f = new Intl.DateTimeFormat(currentLang, {dateStyle:'full', timeStyle:'long', timeZone: selectedTZ}).format(t);
    el.displayDate.textContent = `${f} — ${selectedTZ.replace(/_/g, ' ')}`;
    el.displayDate.removeAttribute('data-lang');
  } else {
    el.displayDate.textContent = getString('defaultEventDate');
    el.displayDate.dataset.lang = 'defaultEventDate';
  }
  const statusKey = (qs.has('title') || qs.has('date')) ? 'urlStatusConfigured' : 'urlStatusNotConfigured';
  el.urlStatus.textContent = getString(statusKey);
}

// ===== Modal open/close (Không thay đổi) =====
function openModal(prefill){ const selectedYear = parseInt(el.year.value || new Date().getFullYear(), 10); el.tzSelect.value = tzName; if(prefill){ if(prefill.date){ const d = new Date(prefill.date); d.setFullYear(selectedYear); el.modalDate.value = dateToInputString(d, tzName); el.modalTitle.value = syncTitleYearToDate(prefill.name || '', d); } else if(prefill.name){ el.modalTitle.value = prefill.name; const t = new Date(selectedYear, new Date().getMonth(), new Date().getDate(), 9, 0, 0); el.modalDate.value = dateToInputString(t, tzName); } } if(!el.modalDate.value){ const t = new Date(selectedYear, new Date().getMonth(), new Date().getDate(), new Date().getHours()+1, 0, 0); el.modalDate.value = dateToInputString(t, tzName); } el.modal.setAttribute('aria-hidden','false'); el.modalTitle.focus(); }
function closeModal(){ el.modal.setAttribute('aria-hidden','true'); }

// ===== Share & ICS (Không thay đổi) =====
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

// ===== Apply countdown (CẬP NHẬT) =====
function apply(){ 
  let t = parseInputToDate(); if(!t){ el.status.textContent=getString('statusDateError'); shake(el.modalDate); return; } 
  const bumped = bumpToFuture(new Date(t)); if(bumped){ t = bumped.date; el.modalDate.value = dateToInputString(t, el.tzSelect.value); } 
  const rawTitle = (el.modalTitle.value?.trim()||getString('defaultEventTitle')); 
  el.modalTitle.value = syncTitleYearToDate(rawTitle, t); 
  target=t; startWhenSet=new Date(); el.status.textContent=getString('statusStarted'); 
  
  try { const activeEvent = { title: el.modalTitle.value, date: t.toISOString(), }; localStorage.setItem(STORAGE_KEY_ACTIVE_EVENT, JSON.stringify(activeEvent)); } catch (e) { console.error("Lỗi lưu sự kiện đang đếm:", e); } 
  
  const exists = CUSTOM_EVENTS.some(ev => ev.date.toISOString() === t.toISOString() && ev.title === el.modalTitle.value); 
  if (!exists) { CUSTOM_EVENTS.push({ title: el.modalTitle.value, date: t }); saveCustomEvents(); } 
  
  updateYearOptions(el.year.value ? parseInt(el.year.value,10) : t.getFullYear()); 
  
  // [CẬP NHẬT] Chỉ render danh sách "My Events"
  renderMyEventsList(); 
  
  updateLabels(); 
  // [XÓA] tick() sẽ được gọi bởi vòng lặp toàn cục
  // tick(); 
  closeModal(); 
}

// ===== [THAY ĐỔI] Tách `tick()` thành 3 hàm =====

/** Vòng lặp chính, chạy mỗi 500ms */
function tick() {
  updateMainCountdown();  // Cập nhật đồng hồ chính
  renderMyEventsList();   // Cập nhật danh sách "Sự kiện của tôi" (bao gồm mini-countdowns)
  
  setTimeout(tick, 500); // Lên lịch chạy lại
}

/** Cập nhật đồng hồ đếm ngược chính */
function updateMainCountdown() {
  const now = new Date();
  const t = target; // Chỉ đọc từ 'target' toàn cục
  
  if (!t) {
    // Nếu không có 'target', đảm bảo thanh tiến trình trống
    el.bar.style.width = '0%';
    el.progressBar.setAttribute('aria-valuenow', '0');
    el.helper.textContent = '';
    return; // Dừng
  }

  const diff = t - now;
  const past = diff <= 0;
  const total = Math.abs(diff);
  const sec = Math.floor(total / 1000) % 60;
  const min = Math.floor(total / 60000) % 60;
  const hr = Math.floor(total / 3600000) % 24;
  const day = Math.floor(total / 86400000);
  
  el.d.textContent = day;
  el.h.textContent = fmt2(hr);
  el.m.textContent = fmt2(min);
  el.s.textContent = fmt2(sec);
  
  if (startWhenSet && !past) {
    const totalDur = t - startWhenSet;
    const passed = now - startWhenSet;
    const pct = Math.min(100, Math.max(0, (passed / totalDur) * 100));
    el.bar.style.width = pct + '%';
    el.progressBar.setAttribute('aria-valuenow', String(Math.round(pct)));
    el.helper.textContent = getString('helperCountdown')(day, fmt2(hr), fmt2(min), fmt2(sec));
  } else if (past) {
    el.bar.style.width = '100%';
    el.progressBar.setAttribute('aria-valuenow', '100');
    el.helper.textContent = getString('helperComplete');
  }
}

// ===== [THAY ĐỔI] Tách hàm render =====

/** [MỚI] Chỉ vẽ danh sách "Sự kiện của tôi" (được gọi bởi tick()) */
function renderMyEventsList() {
  const now = new Date();
  const q = (el.search.value || '').toLowerCase();

  // Sắp xếp theo ngày gần nhất
  const items = CUSTOM_EVENTS
    .filter(it => it.title.toLowerCase().includes(q))
    .sort((a, b) => a.date - b.date);

  if (items.length === 0) {
    el.myEventsSection.setAttribute('hidden', '');
    el.myEventsList.innerHTML = '';
  } else {
    el.myEventsSection.removeAttribute('hidden');
    el.myEventsList.innerHTML = ''; // Xóa và vẽ lại
  }

  items.forEach(it => {
    const diff = it.date - now;
    const past = diff <= 0;
    const total = Math.abs(diff);
    
    // Tính toán mini
    const m_total = Math.floor(total / 60000);
    const d = Math.floor(m_total / 1440); // 1440 phút/ngày
    const h = Math.floor((m_total % 1440) / 60);
    const m = m_total % 60;

    let miniCountdownText;
    let miniClass = 'mini-countdown';
    
    if (past) {
      miniCountdownText = getString('helperMiniPast');
      miniClass += ' past';
    } else {
      miniCountdownText = getString('helperMini')(d, fmt2(h), fmt2(m));
    }

    const when = new Intl.DateTimeFormat(currentLang, { dateStyle: 'full', timeStyle: 'short' }).format(it.date);
    const li = document.createElement('li');
    li.className = 'card-item' + (past ? ' past' : '');

    const deleteBtn = `<button class="btn" data-act="delete" data-iso="${it.date.toISOString()}" title="${getString('btnDelete')}"> ${getString('btnDelete')} </button>`;
    
    // [CẬP NHẬT] Ghi đè `.item-sub` bằng `.mini-countdown`
    li.innerHTML = `
      <div class="item-left">
        <div class="emoji">👤</div>
        <div class="item-meta">
          <div class="item-title">${it.title}</div>
          <div class="item-sub">${when}</div>
        </div>
      </div>
      <div class="item-actions">
        <span class="${miniClass}">${miniCountdownText}</span>
        ${deleteBtn}
        <button class="btn" data-act="create" ${past ? `disabled aria-disabled="true" title="${getString('pastEventTitle')}"` : ''}>
          ${getString('modalBtnApply')}
        </button>
      </div>
    `;

    li.querySelector('[data-act="delete"]').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCustomEvent(e.currentTarget.dataset.iso);
    });
    
    // Nút "Bắt đầu đếm" trên thẻ "My Event"
    li.querySelector('[data-act="create"]').addEventListener('click', () => {
      // Điền thông tin vào modal và gọi apply()
      el.modalTitle.value = it.title;
      el.modalDate.value = dateToInputString(it.date, tzName);
      el.tzSelect.value = tzName;
      apply(); // Áp dụng ngay lập tức
    });
    
    el.myEventsList.appendChild(li);
  });
}

/** [MỚI] Chỉ vẽ danh sách "Thư viện sự kiện" */
function renderLibraryList() {
  const now = new Date(); 
  const currentYear = now.getFullYear(); 
  const selectedYear = parseInt(el.year.value || currentYear, 10); 
  const q = (el.search.value || '').toLowerCase(); 
  
  const libItems = (VN_EVENTS.length === 0 && LUNAR_TEMPLATED.length === 0) ? [] : buildLibraryForYear(selectedYear);
  const items = libItems.filter(it => it.name.toLowerCase().includes(q));
  
  el.list.innerHTML = ''; // Chỉ xóa danh sách thư viện
  
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

// ===== [CẬP NHẬT] Hàm `loadEventLibrary` =====
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

// ===== Theme & Language Logic (CẬP NHẬT) =====
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

  // Dịch các chuỗi tĩnh
  document.querySelectorAll('[data-lang]').forEach(node => { if (node.tagName === 'OPTION') return; node.textContent = getString(node.dataset.lang); });
  document.querySelectorAll('#themeSelect option[data-lang]').forEach(node => { node.textContent = getString(node.dataset.lang); });
  document.querySelectorAll('[data-lang-placeholder]').forEach(node => { node.placeholder = getString(node.dataset.langPlaceholder); });
  document.querySelectorAll('[data-lang-aria]').forEach(node => { node.setAttribute('aria-label', getString(node.dataset.langAria)); });
  document.querySelectorAll('[data-lang-default]').forEach(node => { const defaultKey = node.dataset.langDefault; const isDefault = Object.values(LOADED_LOCALES).some(loc => loc.strings[defaultKey] === node.textContent.trim()) || LANG_STRINGS_FALLBACK[defaultKey] === node.textContent.trim(); if (isDefault) { node.textContent = getString(defaultKey); } });
  
  // Cập nhật các phần động
  populateTimezoneSelect();
  updateLabels();
  renderLibraryList();  // [MỚI] Vẽ lại thư viện
  renderMyEventsList(); // [MỚI] Vẽ lại sự kiện của tôi
  updateYearOptions(parseInt(el.year.value, 10));
}
function applyTheme(theme) { if (theme === 'dark') { document.documentElement.classList.add('dark'); } else { document.documentElement.classList.remove('dark'); } }
function setTheme(theme) { currentTheme = theme; localStorage.setItem('countdown_theme', theme); el.themeSelect.value = theme; if (theme === 'auto') { applyTheme(prefersDark.matches ? 'dark' : 'light'); } else { applyTheme(theme); } }
prefersDark.addEventListener('change', (e) => { if (currentTheme === 'auto') { applyTheme(e.matches ? 'dark' : 'light'); } });

// ===== Events (CẬP NHẬT) =====
el.modalApply.addEventListener('click', apply);
el.modalShare.addEventListener('click', copyShare);
el.modalIcs.addEventListener('click', makeICS);
el.modalTitle.addEventListener('input', updateLabels);
el.modalDate.addEventListener('input', updateLabels);
el.tzSelect.addEventListener('input', updateLabels); 
el.islandCreate.addEventListener('click', ()=> openModal());
$('#modalClose').addEventListener('click', closeModal);
el.modal.addEventListener('click', (e)=>{ if(e.target===el.modal) closeModal(); });
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && el.modal.getAttribute('aria-hidden')==='false') closeModal(); });

// [CẬP NHẬT] Sự kiện tìm kiếm và năm
el.search.addEventListener('input', () => {
  renderLibraryList();
  renderMyEventsList();
});
el.year.addEventListener('change', () => {
  renderLibraryList(); // Chỉ cần render lại thư viện
});

el.langSwitch.addEventListener('change', () => { setLanguage(el.langSwitch.value); toggleSettings(false); });
el.themeSelect.addEventListener('change', () => { setTheme(el.themeSelect.value); });
function toggleSettings(show) { const isHidden = el.settingsDropdown.hasAttribute('hidden'); if (show === true || (show !== false && isHidden)) { el.settingsDropdown.removeAttribute('hidden'); el.settingsToggle.setAttribute('aria-expanded', 'true'); } else { el.settingsDropdown.setAttribute('hidden', ''); el.settingsToggle.setAttribute('aria-expanded', 'false'); } }
el.settingsToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleSettings(); });
document.addEventListener('click', (e) => { if (!el.settingsDropdown.hasAttribute('hidden') && !el.settingsDropdown.contains(e.target) && !el.settingsToggle.contains(e.target)) { toggleSettings(false); } });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !el.settingsDropdown.hasAttribute('hidden')) { toggleSettings(false); el.settingsToggle.focus(); } });
el.settingsDropdown.addEventListener('click', (e) => e.stopPropagation());
function applyHashPreset(){ const h=(location.hash||'').toLowerCase(); if(!h) return; const y = parseInt(el.year.value || new Date().getFullYear(), 10); let t; if(h==='#tomorrow'){ t = new Date(y, new Date().getMonth(), new Date().getDate()+1, 9, 0, 0); } else if(h==='#in-1h'){ t = new Date(); t.setHours(t.getHours()+1); } else if(h==='#in-10m'){ t = new Date(); t.setMinutes(t.getMinutes()+10); } else return; el.modalDate.value = dateToInputString(t, tzName); el.tzSelect.value = tzName; openModal(); }

// ===== Tests (console) (Không thay đổi) =====
function runTests(){ const dUtc=new Date(Date.UTC(2025,0,2,3,4,5)); console.assert(icsDate(dUtc)==='20250102T030405Z','icsDate failed'); const cases=[ {input:'commas,semis;back\\slash', expect:'commas\\,semis\\;back\\\\slash'}, {input:'line\nbreak', expect:'line\\nbreak'}, ]; cases.forEach((c,i)=>{ const got=escapeICS(c.input); console.assert(got===c.expect, 'escapeICS '+i); }); 
  console.assert(typeof buildLibraryForYear==='function' && (VN_EVENTS.length > 0 || EDU_EVENTS.length > 0 || LOADED_LOCALES['vi']), 'library build failed or empty');
  console.log('✅ Tests passed'); 
}


// ===== Boot (CẬP NHẬT) =====
async function boot(){
  // 1. Tải danh sách sự kiện (đã lưu)
  loadCustomEvents();
  
  // 2. Tải sự kiện đang đếm (nếu có)
  loadActiveEvent();
  
  // 3. Tải ngôn ngữ (và thư viện đi kèm)
  const savedLang = localStorage.getItem('countdown_lang');
  const browserLang = (navigator.language || 'vi').split('-')[0];
  const langToLoad = (savedLang && ['vi', 'en'].includes(savedLang)) ? savedLang : (['vi', 'en'].includes(browserLang) ? browserLang : 'vi');
  await setLanguage(langToLoad);
  
  // 4. Setup Theme
  const savedTheme = localStorage.getItem('countdown_theme') || 'auto';
  setTheme(savedTheme);
  
  // 5. Khởi chạy
  updateYearOptions();
  initFromURL();       
  applyHashPreset();
  runTests();          
  
  // 6. Cập nhật lần cuối
  updateLabels();
  renderLibraryList();  // [THAY ĐỔI]
  renderMyEventsList(); // [THAY ĐỔI]
  
  // [THAY ĐỔI] Bắt đầu vòng lặp tick() toàn cục
  tick();
}

// Bắt đầu chạy ứng dụng
boot();

// ===== Helpers (Không thay đổi) =====
function shake(node){ if(!node) return; node.animate( [{transform:'translateY(0)'},{transform:'translateY(-3px)'},{transform:'translateY(0)'}], {duration:300,iterations:1} ); }