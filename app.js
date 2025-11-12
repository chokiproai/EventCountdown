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

// [THAY ĐỔI] Quay lại cấu trúc 3 biến, với tên biến mới
let VN_EVENTS = []; // <-- Đã đổi tên
let LUNAR_TEMPLATED = [];
let EDU_EVENTS = [];

// [THAY ĐỔI] Cache cho các thư viện đã tải
const LOADED_LIBRARIES = {}; 

// ===== Language Definitions =====
// (Nội dung LANG_STRINGS đầy đủ, không thay đổi)
const LANG_STRINGS = {
  'vi': {
    libraryFile: 'events-vi.json', 
    siteTitle: 'Event Countdown',
    createEventBtn: 'Tạo sự kiện',
    countdownHeading: 'Đếm ngược',
    lblDay: 'Ngày', lblHour: 'Giờ', lblMinute: 'Phút', lblSecond: 'Giây',
    defaultEventTitle: 'Sự kiện của bạn',
    defaultEventDate: 'Nhấn “Tạo sự kiện” để bắt đầu.',
    ariaProgress: 'Tiến độ tới thời điểm sự kiện',
    urlStatusLabel: 'Trạng thái URL:',
    libHeading: 'Thư viện sự kiện Việt Nam',
    searchPlaceholder: 'Tìm: Tết, 30/4, Quốc khánh, Trung thu, THPTQG...',
    libNote: '⚠️ Một số mốc theo âm lịch là ước tính (tham khảo); ngày dương có thể thay đổi từng năm.',
    modalTitle: 'Tạo sự kiện',
    modalCloseLabel: 'Đóng',
    modalLabelTitle: 'Tên sự kiện',
    modalPlaceholderTitle: 'VD: Giao thừa {yyyy}, Sinh nhật...',
    modalLabelDate: 'Ngày & giờ',
    modalLabelTZ: 'Múi giờ',
    modalBtnApply: 'Bắt đầu đếm',
    modalBtnIcs: 'Tải .ics',
    modalBtnShare: 'Sao chép link',
    urlStatusConfigured: 'Đang dùng tham số URL',
    urlStatusNotConfigured: 'Chưa cấu hình URL',
    statusCopied: '🔗 Đã sao chép link!',
    statusLink: '🔗 Link: ',
    statusIcsError: '⚠️ Cần ngày giờ để tạo .ics',
    statusDateError: '⚠️ Hãy nhập ngày giờ hợp lệ.',
    statusStarted: '✅ Đã bắt đầu đếm.',
    helperCountdown: (d,h,m,s) => `Còn ${d} ngày ${h}:${m}:${s}`,
    helperComplete: '🎉 Sự kiện đã tới!',
    pastSuffix: 'đã qua',
    pastEventTitle: 'Sự kiện đã qua trong năm này',
    newYearDay: 'Tết Dương lịch',
    liberationDay: 'Giải phóng miền Nam (30/4)',
    labourDay: 'Quốc tế Lao động (1/5)',
    independenceDay: 'Quốc khánh (2/9)',
    teachersDay: 'Ngày Nhà giáo Việt Nam (20/11)',
    womensDay: 'Quốc tế Phụ nữ (8/3)',
    childrensDay: 'Quốc tế Thiếu nhi (1/6)',
    midAutumn: 'Trung thu (tham khảo – {yyyy}-10-06)',
    midAutumnNote: 'Âm lịch 15/8 – dương lịch thay đổi',
    lunarNewYear: 'Tết Nguyên Đán {yyyy} (mùng 1)',
    lunarNewYearEve: 'Giao thừa {yyyy}',
    hungKings: 'Giỗ Tổ Hùng Vương {yyyy}',
    nationalExam: 'Kỳ thi THPTQG {yyyy} (ước tính)',
    nationalExamNote: 'Có thể thay đổi',
    schoolOpening: 'Khai giảng năm học {yyyy}-{yyyy+1} (ước tính)',
    schoolOpeningNote: 'Có thể thay đổi',
    genericNote: 'Tham khảo',
    settingsAria: 'Cài đặt và tuỳ chọn',
    modalLabelLang: 'Ngôn ngữ',
    modalLabelTheme: 'Giao diện',
    themeAuto: 'Tự động',
    themeLight: 'Sáng',
    themeDark: 'Tối',
    tzLocal: 'Cục bộ (của bạn)',
    btnDelete: 'Xoá',
    customEventNote: 'Sự kiện của bạn',
    libLoadError: 'Lỗi tải thư viện sự kiện. Hãy thử tải lại trang.'
  },
  'en': {
    libraryFile: null, 
    siteTitle: 'Event Countdown',
    createEventBtn: 'Create Event',
    countdownHeading: 'Countdown',
    lblDay: 'Days', lblHour: 'Hours', lblMinute: 'Minutes', lblSecond: 'Seconds',
    defaultEventTitle: 'Your Event',
    defaultEventDate: 'Press "Create Event" to start.',
    ariaProgress: 'Progress to the event time',
    urlStatusLabel: 'URL Status:',
    libHeading: 'Event Library',
    searchPlaceholder: 'Search: Event name...',
    libNote: '⚠️ Some lunar dates are estimates; solar dates may change annually.',
    modalTitle: 'Create Event',
    modalCloseLabel: 'Close',
    modalLabelTitle: 'Event Name',
    modalPlaceholderTitle: 'E.g., New Year\'s Eve {yyyy}, Birthday...',
    modalLabelDate: 'Date & Time',
    modalLabelTZ: 'Timezone',
    modalBtnApply: 'Start Countdown',
    modalBtnIcs: 'Download .ics',
    modalBtnShare: 'Copy Link',
    urlStatusConfigured: 'Using URL parameters',
    urlStatusNotConfigured: 'URL not configured',
    statusCopied: '🔗 Link copied!',
    statusLink: '🔗 Link: ',
    statusIcsError: '⚠️ Date and time required for .ics',
    statusDateError: '⚠️ Please enter a valid date and time.',
    statusStarted: '✅ Countdown started.',
    helperCountdown: (d,h,m,s) => `${d} days ${h}:${m}:${s} left`,
    helperComplete: '🎉 The event is here!',
    pastSuffix: 'past',
    pastEventTitle: 'Event has passed for this year',
    newYearDay: 'New Year\'s Day',
    liberationDay: 'Reunification Day (Apr 30)',
    labourDay: 'International Labor Day (May 1)',
    independenceDay: 'National Day (Sep 2)',
    teachersDay: 'Vietnamese Teachers\' Day (Nov 20)',
    womensDay: 'International Women\'s Day (Mar 8)',
    childrensDay: 'International Children\'s Day (Jun 1)',
    midAutumn: 'Mid-Autumn (Ref – {yyyy}-10-06)',
    midAutumnNote: 'Lunar 15/8 – solar date varies',
    lunarNewYear: 'Lunar New Year {yyyy} (1st day)',
    lunarNewYearEve: 'Lunar New Year\'s Eve {yyyy}',
    hungKings: 'Hung Kings\' Commemoration Day {yyyy}',
    nationalExam: 'National High School Exam {yyyy} (Est.)',
    nationalExamNote: 'Subject to change',
    schoolOpening: 'School Opening {yyyy}-{yyyy+1} (Est.)',
    schoolOpeningNote: 'Subject to change',
    genericNote: 'Reference',
    settingsAria: 'Settings and options',
    modalLabelLang: 'Language',
    modalLabelTheme: 'Theme',
    themeAuto: 'Auto',
    themeLight: 'Light',
    themeDark: 'Dark',
    tzLocal: 'Local (Yours)',
    btnDelete: 'Delete',
    customEventNote: 'My Event',
    libLoadError: 'Error loading event library. Please reload the page.'
  }
};

/** Lấy chuỗi dịch, fallback về tiếng Anh nếu thiếu */
function getString(key) { const str = LANG_STRINGS[currentLang]?.[key]; if (str) return str; const fallback = LANG_STRINGS['en']?.[key]; if (fallback) return fallback; return key; }

// ===== Element cache (Không thay đổi) =====
const el = {
  modal: $('#modal'), modalTitle: $('#title'), modalDate: $('#date'), 
  tzSelect: $('#tzSelect'), modalApply: $('#apply'), modalIcs: $('#ics'), modalShare: $('#share'), modalClose: $('#modalClose'),
  islandCreate: $('#islandCreate'),
  d: $('#d'), h: $('#h'), m: $('#m'), s: $('#s'),
  displayTitle: $('#displayTitle'), displayDate: $('#displayDate'),
  helper: $('#helper'), bar: $('#bar'), progressBar: $('#progress-bar'),
  search: $('#search'), list: $('#list'), year: $('#year'),
  librarySection: $('#librarySection'),
  status: $('#status'), urlStatus: $('#urlStatus'),
  langSwitch: $('#langSwitch'), themeSelect: $('#themeSelect'),
  settingsToggle: $('#settingsToggle'), settingsDropdown: $('#settingsDropdown'),
};

// ===== Hàm Lưu/Tải/Xoá (Không thay đổi) =====
function saveCustomEvents() { try { localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(CUSTOM_EVENTS)); } catch (e) { console.error("Lỗi lưu sự kiện:", e); } }
function loadCustomEvents() { const saved = localStorage.getItem(STORAGE_KEY_EVENTS); if (!saved) return; try { const parsed = JSON.parse(saved); parsed.forEach(ev => { CUSTOM_EVENTS.push({ title: ev.title, date: new Date(ev.date) }); }); } catch (e) { console.error("Lỗi tải sự kiện:", e); localStorage.removeItem(STORAGE_KEY_EVENTS); } }
function deleteCustomEvent(isoString) { const index = CUSTOM_EVENTS.findIndex(ev => ev.date.toISOString() === isoString); if (index > -1) { CUSTOM_EVENTS.splice(index, 1); saveCustomEvents(); renderList(); updateYearOptions(parseInt(el.year.value, 10)); } }

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

// ===== [THAY ĐỔI] Quay lại hàm `buildLibraryForYear` cũ =====
/** Tạo items cho MỘT năm cụ thể (không bump), đọc từ 3 mảng toàn cục */
function buildLibraryForYear(y){
  const items = [];
  
  // Vòng lặp 1: VN_EVENTS (Đã đổi tên)
  VN_EVENTS.forEach(e=>{
    const date = (e.fixedMonth && e.fixedDay)
      ? new Date(y, e.fixedMonth-1, e.fixedDay, 0, 0, 0)
      : new Date(y, e.month-1, e.day, 0, 0, 0);
    const name = e.templated ? renderTemplateWithYear(e.langKey, date) : getString(e.langKey);
    const note = e.noteKey ? getString(e.noteKey) : '';
    items.push({ name, date, note, emoji: e.emoji || '📅' });
  });

  // Vòng lặp 2: LUNAR_TEMPLATED
  LUNAR_TEMPLATED.forEach(e=>{
    const base = new Date(e.baseISO);
    const date = new Date(y, base.getMonth(), base.getDate(), base.getHours(), base.getMinutes(), base.getSeconds());
    const name = renderTemplateWithYear(e.langKey, date);
    items.push({ name, date, note: getString(e.noteKey || 'genericNote'), emoji: e.emoji || '📅' });
  });

  // Vòng lặp 3: EDU_EVENTS
  EDU_EVENTS.forEach(e=>{
    const base = new Date(e.baseISO);
    const date = new Date(y, base.getMonth(), base.getDate(), base.getHours(), base.getMinutes(), base.getSeconds());
    const name = renderTemplateWithYear(e.langKey, date);
    items.push({ name, date, note: e.noteKey ? getString(e.noteKey) : '', emoji: e.emoji || '📅' });
  });

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
      el.modalDate.value = dateToLocalInputString(t);
      if(titleFromURL) titleFromURL = syncTitleYearToDate(decodeURIComponent(titleFromURL), t);
      el.modalTitle.value = titleFromURL || getString('defaultEventTitle');
      openModal({ name: el.modalTitle.value, date: t });
      apply(); 
    }
  }
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

// ===== Apply countdown (Không thay đổi) =====
function apply(){ let t = parseInputToDate(); if(!t){ el.status.textContent=getString('statusDateError'); shake(el.modalDate); return; } const bumped = bumpToFuture(new Date(t)); if(bumped){ t = bumped.date; el.modalDate.value = dateToInputString(t, el.tzSelect.value); } const rawTitle = (el.modalTitle.value?.trim()||getString('defaultEventTitle')); el.modalTitle.value = syncTitleYearToDate(rawTitle, t); target=t; startWhenSet=new Date(); el.status.textContent=getString('statusStarted'); CUSTOM_EVENTS.push({ title: el.modalTitle.value, date: t }); saveCustomEvents(); updateYearOptions(el.year.value ? parseInt(el.year.value,10) : t.getFullYear()); renderList(); updateLabels(); tick(); closeModal(); }

// ===== Tick (Không thay đổi) =====
function tick(){ const now=new Date(); const t=target||parseInputToDate(); if(!t) return; const diff=t-now, past=diff<=0, total=Math.abs(diff); const sec=Math.floor(total/1000)%60, min=Math.floor(total/60000)%60, hr=Math.floor(total/3600000)%24, day=Math.floor(total/86400000); el.d.textContent=day; el.h.textContent=fmt2(hr); el.m.textContent=fmt2(min); el.s.textContent=fmt2(sec); if(startWhenSet && !past){ const totalDur=t-startWhenSet; const passed=now-startWhenSet; const pct=Math.min(100,Math.max(0,(passed/totalDur)*100)); el.bar.style.width=pct+'%'; el.progressBar.setAttribute('aria-valuenow', String(Math.round(pct))); el.helper.textContent = getString('helperCountdown')(day, fmt2(hr), fmt2(min), fmt2(sec)); } else if(past){ el.bar.style.width='100%'; el.progressBar.setAttribute('aria-valuenow','100'); el.helper.textContent=getString('helperComplete'); } setTimeout(tick,500); }

// ===== Library render (CẬP NHẬT) =====
function renderList(){ const now = new Date(); const currentYear = now.getFullYear(); const selectedYear = parseInt(el.year.value || currentYear, 10); const q = (el.search.value || '').toLowerCase(); const customItems = CUSTOM_EVENTS .filter(it => it.date.getFullYear() === selectedYear) .map(it => ({ name: it.title, date: it.date, note: getString('customEventNote'), emoji: '👤', isCustom: true })); 
  // [THAY ĐỔI] Kiểm tra biến mới
  const libItems = (VN_EVENTS.length === 0 && LUNAR_TEMPLATED.length === 0) ? [] : buildLibraryForYear(selectedYear); 
  const items = [...libItems, ...customItems] .sort((a,b) => a.date - b.date) .filter(it => it.name.toLowerCase().includes(q)); el.list.innerHTML = ''; items.forEach(it => { let isPast; if (selectedYear < currentYear) isPast = true; else if (selectedYear > currentYear) isPast = false; else isPast = it.date < now; const when = new Intl.DateTimeFormat(currentLang, { dateStyle: 'full', timeStyle: 'short' }).format(it.date); const li = document.createElement('li'); li.className = 'card-item' + (isPast ? ' past' : ''); const deleteBtn = it.isCustom ? `<button class="btn" data-act="delete" data-iso="${it.date.toISOString()}" title="${getString('btnDelete')}"> ${getString('btnDelete')} </button>` : ''; li.innerHTML = ` <div class="item-left"> <div class="emoji">${it.emoji || '📅'}</div> <div class="item-meta"> <div class="item-title">${it.name}</div> <div class="item-sub">${when}${it.note ? ' · ' + it.note : ''}${isPast ? ' · ' + getString('pastSuffix') : ''}</div> </div> </div> <div class="item-actions"> ${deleteBtn} <button class="btn" data-act="create" ${isPast ? `disabled aria-disabled="true" title="${getString('pastEventTitle')}"` : ''}> ${getString('modalBtnApply')} </button> </div> `; if (it.isCustom) { li.querySelector('[data-act="delete"]').addEventListener('click', (e) => { e.stopPropagation(); deleteCustomEvent(e.currentTarget.dataset.iso); }); } if (!isPast) { li.querySelector('[data-act="create"]').addEventListener('click', () => { openModal({ name: it.name, date: it.date }); }); } el.list.appendChild(li); }); }

// ===== [THAY ĐỔI] Hàm `loadEventLibrary` đã được cập nhật =====
/** Tải (hoặc lấy từ cache) thư viện sự kiện cho một ngôn ngữ */
async function loadEventLibrary(lang) {
  const langConfig = LANG_STRINGS[lang];
  const fileToLoad = langConfig?.libraryFile;

  // Xoá thư viện cũ
  VN_EVENTS = [];
  LUNAR_TEMPLATED = [];
  EDU_EVENTS = [];

  // Trường hợp 1: Ngôn ngữ này không có thư viện (VD: 'en')
  if (!fileToLoad) {
    console.log(`Không có thư viện cho ngôn ngữ: ${lang}`);
    el.librarySection.setAttribute('hidden', ''); // Ẩn section
    return; // Hoàn thành
  }

  // Trường hợp 2: Thư viện đã được tải trước đó
  if (LOADED_LIBRARIES[lang]) {
    console.log(`Sử dụng thư viện từ cache cho: ${lang}`);
    const data = LOADED_LIBRARIES[lang];
    // [THAY ĐỔI] Đọc từ cache với 3 biến
    VN_EVENTS = data.VN_EVENTS || [];
    LUNAR_TEMPLATED = data.LUNAR_TEMPLATED || [];
    EDU_EVENTS = data.EDU_EVENTS || [];
    el.librarySection.removeAttribute('hidden'); // Hiện section
    return; // Hoàn thành
  }

  // Trường hợp 3: Phải tải thư viện mới
  try {
    console.log(`Đang tải thư viện: ${fileToLoad}`);
    const response = await fetch(fileToLoad);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // [THAY ĐỔI] Đọc 3 mảng với tên biến mới
    VN_EVENTS = data.VN_EVENTS || [];
    LUNAR_TEMPLATED = data.LUNAR_TEMPLATED || [];
    EDU_EVENTS = data.EDU_EVENTS || [];
    
    // [THAY ĐỔI] Lưu cấu trúc 3 mảng vào cache
    LOADED_LIBRARIES[lang] = {
      VN_EVENTS,
      LUNAR_TEMPLATED,
      EDU_EVENTS
    };

    el.librarySection.removeAttribute('hidden'); // Hiện section

  } catch (error) {
    console.error(`Lỗi tải thư viện sự kiện (${fileToLoad}):`, error);
    el.librarySection.innerHTML = `<p>${getString('libLoadError')}</p>`;
    el.librarySection.removeAttribute('hidden'); // Hiện (để báo lỗi)
  }
}

// ===== Theme & Language Logic (Không thay đổi) =====
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
function populateTimezoneSelect() { const currentTZ = el.tzSelect.value || tzName; el.tzSelect.innerHTML = ''; const localOpt = new Option(`${getString('tzLocal')} (${tzName})`, tzName); el.tzSelect.add(localOpt); const sep = new Option('---', ''); sep.disabled = true; el.tzSelect.add(sep); try { const timezones = Intl.supportedValuesOf('timeZone'); timezones.filter(tz => tz !== tzName).forEach(tz => { const opt = new Option(tz.replace(/_/g, ' '), tz); el.tzSelect.add(opt); }); } catch (e) { console.warn("Không thể tải danh sách múi giờ."); } if (Array.from(el.tzSelect.options).some(opt => opt.value === currentTZ)) { el.tzSelect.value = currentTZ; } else { el.tzSelect.value = tzName; } }

async function setLanguage(lang) {
  if (!LANG_STRINGS[lang]) return;
  currentLang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem('countdown_lang', lang);
  el.langSwitch.value = lang;
  document.querySelectorAll('[data-lang]').forEach(node => { if (node.tagName === 'OPTION') return; node.textContent = getString(node.dataset.lang); });
  document.querySelectorAll('#themeSelect option[data-lang]').forEach(node => { node.textContent = getString(node.dataset.lang); });
  document.querySelectorAll('[data-lang-placeholder]').forEach(node => { node.placeholder = getString(node.dataset.langPlaceholder); });
  document.querySelectorAll('[data-lang-aria]').forEach(node => { node.setAttribute('aria-label', getString(node.dataset.langAria)); });
  document.querySelectorAll('[data-lang-default]').forEach(node => { const defaultKey = node.dataset.langDefault; const isDefault = Object.values(LANG_STRINGS).some(langPack => langPack[defaultKey] === node.textContent.trim()); if (isDefault) { node.textContent = getString(defaultKey); } });
  
  await loadEventLibrary(lang);
  
  populateTimezoneSelect();
  updateLabels();
  renderList();
  updateYearOptions(parseInt(el.year.value, 10));
}
function applyTheme(theme) { if (theme === 'dark') { document.documentElement.classList.add('dark'); } else { document.documentElement.classList.remove('dark'); } }
function setTheme(theme) { currentTheme = theme; localStorage.setItem('countdown_theme', theme); el.themeSelect.value = theme; if (theme === 'auto') { applyTheme(prefersDark.matches ? 'dark' : 'light'); } else { applyTheme(theme); } }
prefersDark.addEventListener('change', (e) => { if (currentTheme === 'auto') { applyTheme(e.matches ? 'dark' : 'light'); } });

// ===== Events (Không thay đổi) =====
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
['input','change'].forEach(ev=>{ el.search.addEventListener(ev, renderList); el.year.addEventListener(ev, renderList); });
el.langSwitch.addEventListener('change', () => { setLanguage(el.langSwitch.value); toggleSettings(false); });
el.themeSelect.addEventListener('change', () => { setTheme(el.themeSelect.value); });
function toggleSettings(show) { const isHidden = el.settingsDropdown.hasAttribute('hidden'); if (show === true || (show !== false && isHidden)) { el.settingsDropdown.removeAttribute('hidden'); el.settingsToggle.setAttribute('aria-expanded', 'true'); } else { el.settingsDropdown.setAttribute('hidden', ''); el.settingsToggle.setAttribute('aria-expanded', 'false'); } }
el.settingsToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleSettings(); });
document.addEventListener('click', (e) => { if (!el.settingsDropdown.hasAttribute('hidden') && !el.settingsDropdown.contains(e.target) && !el.settingsToggle.contains(e.target)) { toggleSettings(false); } });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !el.settingsDropdown.hasAttribute('hidden')) { toggleSettings(false); el.settingsToggle.focus(); } });
el.settingsDropdown.addEventListener('click', (e) => e.stopPropagation());
function applyHashPreset(){ const h=(location.hash||'').toLowerCase(); if(!h) return; const y = parseInt(el.year.value || new Date().getFullYear(), 10); let t; if(h==='#tomorrow'){ t = new Date(y, new Date().getMonth(), new Date().getDate()+1, 9, 0, 0); } else if(h==='#in-1h'){ t = new Date(); t.setHours(t.getHours()+1); } else if(h==='#in-10m'){ t = new Date(); t.setMinutes(t.getMinutes()+10); } else return; el.modalDate.value = dateToInputString(t, tzName); el.tzSelect.value = tzName; openModal(); }

// ===== Tests (console) (CẬP NHẬT) =====
function runTests(){ const dUtc=new Date(Date.UTC(2025,0,2,3,4,5)); console.assert(icsDate(dUtc)==='20250102T030405Z','icsDate failed'); const cases=[ {input:'commas,semis;back\\slash', expect:'commas\\,semis\\;back\\\\slash'}, {input:'line\nbreak', expect:'line\\nbreak'}, ]; cases.forEach((c,i)=>{ const got=escapeICS(c.input); console.assert(got===c.expect, 'escapeICS '+i); }); 
  // [THAY ĐỔI] Kiểm tra biến mới
  console.assert(typeof buildLibraryForYear==='function' && (VN_EVENTS.length > 0 || EDU_EVENTS.length > 0 || LOADED_LIBRARIES['vi']), 'library build failed or empty');
  console.log('✅ Tests passed'); 
}

// ===== Boot (Không thay đổi) =====
async function boot(){
  loadCustomEvents();
  
  const savedLang = localStorage.getItem('countdown_lang');
  const browserLang = (navigator.language || 'vi').split('-')[0];
  const langToLoad = savedLang && LANG_STRINGS[savedLang] ? savedLang : (browserLang && LANG_STRINGS[browserLang] ? browserLang : 'vi');
  await setLanguage(langToLoad);
  
  const savedTheme = localStorage.getItem('countdown_theme') || 'auto';
  setTheme(savedTheme);
  
  updateYearOptions();
  initFromURL();       
  applyHashPreset();
  runTests();          

  updateLabels();
  renderList();
  tick();
}
boot();

// ===== Helpers (Không thay đổi) =====
function shake(node){ if(!node) return; node.animate( [{transform:'translateY(0)'},{transform:'translateY(-3px)'},{transform:'translateY(0)'}], {duration:300,iterations:1} ); }