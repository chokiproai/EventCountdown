// ===== Utilities & state =====
const $ = (sel) => document.querySelector(sel);
const fmt2 = (n) => String(n).padStart(2,'0');
const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
const qs = new URLSearchParams(location.search);

// ===== Language & Theme State =====
let currentLang = 'vi';
let currentTheme = 'auto';
const CUSTOM_EVENTS = []; // {title:string, date:Date}
let target=null, startWhenSet=null;

// ===== Language Definitions =====
const LANG_STRINGS = {
  'vi': {
    // ... (tất cả các chuỗi cũ) ...
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
    // CHUỖI MỚI CHO MÚI GIỜ
    tzLocal: 'Cục bộ (của bạn)',
  },
  'en': {
    // ... (tất cả các chuỗi cũ) ...
    siteTitle: 'Event Countdown',
    createEventBtn: 'Create Event',
    countdownHeading: 'Countdown',
    lblDay: 'Days', lblHour: 'Hours', lblMinute: 'Minutes', lblSecond: 'Seconds',
    defaultEventTitle: 'Your Event',
    defaultEventDate: 'Press "Create Event" to start.',
    ariaProgress: 'Progress to the event time',
    urlStatusLabel: 'URL Status:',
    libHeading: 'Vietnamese Event Library',
    searchPlaceholder: 'Search: Tết, 30/4, National Day, Mid-Autumn, Exam...',
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
    // CHUỖI MỚI CHO MÚI GIỜ
    tzLocal: 'Local (Yours)',
  }
};

/** Lấy chuỗi dịch, fallback về tiếng Anh nếu thiếu */
function getString(key) {
  const str = LANG_STRINGS[currentLang][key];
  if (str) return str;
  const fallback = LANG_STRINGS['en'][key];
  if (fallback) return fallback;
  return key; // Fallback
}

// ===== Element cache (CẬP NHẬT) =====
const el = {
  // popup form
  modal: $('#modal'), modalTitle: $('#title'), modalDate: $('#date'), 
  tzSelect: $('#tzSelect'), // THAY ĐỔI: (thay cho modalTZ)
  modalApply: $('#apply'), modalIcs: $('#ics'), modalShare: $('#share'), modalClose: $('#modalClose'),

  // island button
  islandCreate: $('#islandCreate'),

  // countdown
  d: $('#d'), h: $('#h'), m: $('#m'), s: $('#s'),
  displayTitle: $('#displayTitle'), displayDate: $('#displayDate'),
  helper: $('#helper'), bar: $('#bar'), progressBar: $('#progress-bar'),

  // library
  search: $('#search'), list: $('#list'), year: $('#year'),
  librarySection: $('#librarySection'), // MỚI: để ẩn/hiện

  // misc
  status: $('#status'), urlStatus: $('#urlStatus'),
  
  // New controls
  langSwitch: $('#langSwitch'),
  themeSelect: $('#themeSelect'),
  settingsToggle: $('#settingsToggle'),
  settingsDropdown: $('#settingsDropdown'),
};
// XÓA: el.modalTZ.value = tzName;


// ===== Time helpers (ĐÃ CẬP NHẬT) =====

/**
 * [HELPER MỚI]
 * Chuyển một đối tượng Date sang chuỗi input 'YYYY-MM-DDTHH:MM' 
 * TRONG MỘT MÚI GIỜ CỤ THỂ.
 */
function dateToInputString(date, timeZone) {
  try {
    const d = new Date(date);
    const parts = new Intl.DateTimeFormat('en-CA', { // 'en-CA' dùng định dạng YYYY-MM-DD
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Rất quan trọng, dùng 24-giờ
    }).formatToParts(d);
    
    const d_map = parts.reduce((acc, p) => (acc[p.type] = p.value, acc), {});
    // Xử lý trường hợp 24:00 (nửa đêm)
    const hour = d_map.hour === '24' ? '00' : d_map.hour;
    return `${d_map.year}-${d_map.month}-${d_map.day}T${hour}:${d_map.minute}`;
  } catch (e) {
    console.error("Lỗi dateToInputString:", e);
    return ''; // Trả về rỗng nếu lỗi
  }
}

/** [HELPER MỚI] Wrapper cho hàm cũ, luôn dùng múi giờ local */
function dateToLocalInputString(d) {
  // Hàm này trả về string cho input, dựa trên MÚI GIỜ LOCAL
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off*60000);
  return local.toISOString().slice(0,16);
}

/** [HELPER MỚI] Phân tích chuỗi offset "GMT+9", "GMT-5:30" */
function parseOffset(offsetStr) {
  const match = offsetStr.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return 0;
  const sign = match[1] === '-' ? -1 : 1;
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3] || '0', 10);
  return sign * (hours * 60 + minutes);
}

/** [HELPER MỚI] Định dạng offset (phút) sang "+HH:MM" */
function formatOffset(offsetMinutes) {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absMin = Math.abs(offsetMinutes);
  const h = String(Math.floor(absMin / 60)).padStart(2, '0');
  const m = String(absMin % 60).padStart(2, '0');
  return `${sign}${h}:${m}`;
}

/**
 * [ĐÃ VIẾT LẠI HOÀN TOÀN]
 * Phân tích chuỗi ngày + múi giờ đã chọn để ra 1 đối tượng Date (thời điểm tuyệt đối)
 */
function parseInputToDate() {
  const dateStr = el.modalDate.value;
  if (!dateStr) return null;
  const selectedTZ = el.tzSelect.value;

  // Trường hợp 1: Dùng múi giờ local (giống hệt logic cũ)
  if (selectedTZ === tzName) {
    const d = new Date(dateStr);
    return isNaN(d) ? null : d;
  }

  // Trường hợp 2: Dùng múi giờ tùy chỉnh
  // Chúng ta phải tạo một chuỗi ISO 8601 đầy đủ VỚI OFFSET
  try {
    // Lấy một ngày bất kỳ (VD: 'now') để kiểm tra offset
    // Lưu ý: offset có thể thay đổi (DST), nên dùng 1 ngày *gần* ngày đã nhập
    // Để đơn giản, chúng ta sẽ dùng ngày đã nhập (dù có rủi ro nhỏ)
    const tempDate = new Date(dateStr);
    if (isNaN(tempDate)) return null; // Chuỗi ngày không hợp lệ

    // Lấy chuỗi offset (VD: "GMT-5") CHO ngày/giờ đó TRONG múi giờ đó
    const offsetStr = new Intl.DateTimeFormat('en', {
      timeZone: selectedTZ,
      timeZoneName: 'shortOffset'
    }).format(tempDate);
    
    const offsetMinutes = parseOffset(offsetStr);
    
    // Tạo chuỗi ISO đầy đủ: "2025-11-20T07:00-05:00"
    const isoStr = dateStr + formatOffset(offsetMinutes);
    
    const finalDate = new Date(isoStr);
    return isNaN(finalDate) ? null : finalDate;
  } catch (e) {
    console.error("Lỗi parseInputToDate với múi giờ tuỳ chỉnh:", e);
    return null;
  }
}

function isoUTC(d){ return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString(); }

function bumpToFuture(date){
  if(!(date instanceof Date) || isNaN(date)) return null;
  const now = new Date();
  let years = 0;
  while (date <= now) {
    date = new Date(
      date.getFullYear()+1, date.getMonth(), date.getDate(),
      date.getHours(), date.getMinutes(), date.getSeconds()
    );
    years++;
  }
  return { date, yearsBumped: years };
}

function renderTemplateWithYear(templateKey, date){
  const template = getString(templateKey);
  if(!template) return '';
  return template.replace(/\{yyyy\+1\}/g, String(date.getFullYear()+1))
                 .replace(/\{yyyy\}/g, String(date.getFullYear()));
}
function syncTitleYearToDate(title, date){
  if(!title || !(date instanceof Date)) return title;
  if(/\{yyyy\}/.test(title) || /\{yyyy\+1\}/.test(title)) return renderTemplateWithYear(title.replace(/.*\{(.+?)\}.*/, '$1'), date);
  const yr = String(date.getFullYear());
  return title.replace(/(\d{4})(?!.*\d{4})/, yr);
}

// ===== Library definitions (Không thay đổi) =====
const VN_EVENTS_FIXED = [
  { langKey:'newYearDay', month:1, day:1, emoji:'🎇' }, { langKey:'liberationDay', month:4, day:30, emoji:'🕊️' }, { langKey:'labourDay', month:5, day:1, emoji:'🛠️' }, { langKey:'independenceDay', month:9, day:2, emoji:'🇻🇳' }, { langKey:'teachersDay', month:11, day:20, emoji:'🍎' }, { langKey:'womensDay', month:3, day:8, emoji:'🌸' }, { langKey:'childrensDay', month:6, day:1, emoji:'🧸' }, { langKey:'midAutumn', templated: true, fixedMonth:10, fixedDay:6, emoji:'🌕', noteKey:'midAutumnNote' }
];
const LUNAR_TEMPLATED = [
  { langKey:'lunarNewYear', templated: true, baseISO:'2025-01-29T00:00', emoji:'🧧' }, { langKey:'lunarNewYearEve', templated: true, baseISO:'2025-01-28T23:59', emoji:'🎆' }, { langKey:'hungKings', templated: true, baseISO:'2025-04-08T00:00', emoji:'🏛️' }
];
const EDU_EVENTS = [
  { langKey:'nationalExam', templated: true, baseISO:'2025-06-27T07:30', emoji:'🎓', noteKey:'nationalExamNote' }, { langKey:'schoolOpening', templated: true, baseISO:'2025-09-05T07:00', emoji:'📚', noteKey:'schoolOpeningNote' }
];
function buildLibraryForYear(y){
  const items = [];
  VN_EVENTS_FIXED.forEach(e=>{
    const date = (e.fixedMonth && e.fixedDay) ? new Date(y, e.fixedMonth-1, e.fixedDay, 0, 0, 0) : new Date(y, e.month-1, e.day, 0, 0, 0);
    const name = e.templated ? renderTemplateWithYear(e.langKey, date) : getString(e.langKey);
    const note = e.noteKey ? getString(e.noteKey) : '';
    items.push({ name, date, note, emoji: e.emoji || '📅' });
  });
  LUNAR_TEMPLATED.forEach(e=>{
    const base = new Date(e.baseISO);
    const date = new Date(y, base.getMonth(), base.getDate(), base.getHours(), base.getMinutes(), base.getSeconds());
    const name = renderTemplateWithYear(e.langKey, date);
    items.push({ name, date, note: getString('genericNote'), emoji: e.emoji || '📅' });
  });
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
function collectLibraryYears(){
  const nowY = new Date().getFullYear(); const years = new Set();
  for(let y = nowY - YEAR_WINDOW_BEHIND; y <= nowY + YEAR_WINDOW_AHEAD; y++) years.add(y);
  return years;
}
function collectCustomYears(){
  const s = new Set(); CUSTOM_EVENTS.forEach(ev => s.add(ev.date.getFullYear())); return s;
}
function updateYearOptions(selectedMaybe){
  const libYears = collectLibraryYears(); const customYears = collectCustomYears();
  const merged = new Set([...libYears, ...customYears]);
  const arr = [...merged].sort((a,b)=>a-b);
  const prefer = selectedMaybe ?? (arr.includes(new Date().getFullYear()) ? new Date().getFullYear() : arr[0]);
  el.year.innerHTML = arr.map(y => `<option value="${y}">${y}</option>`).join('');
  el.year.value = String(prefer);
}

// ===== URL init & labels (CẬP NHẬT) =====
function initFromURL(){
  let titleFromURL = qs.get('title');
  const dateStr = qs.get('date');

  if(dateStr){
    const raw = new Date(dateStr);
    if(!isNaN(raw)){
      const bumped = bumpToFuture(raw);
      const t = bumped ? bumped.date : raw;
      // CẬP NHẬT: Dùng hàm mới
      el.modalDate.value = dateToLocalInputString(t);
      if(titleFromURL) titleFromURL = syncTitleYearToDate(decodeURIComponent(titleFromURL), t);
      CUSTOM_EVENTS.push({ title: titleFromURL || getString('defaultEventTitle'), date: t });
    }
  }
  if(titleFromURL) el.modalTitle.value = titleFromURL;

  updateYearOptions();
  renderList();
  updateLabels();
  tick();
}

function updateLabels(){
  const t = parseInputToDate(); // Hàm này đã bao gồm logic múi giờ
  let title = el.modalTitle.value?.trim() || getString('defaultEventTitle');
  if(t) title = syncTitleYearToDate(title, t);
  el.displayTitle.textContent = title;
  
  if (title === getString('defaultEventTitle')) el.displayTitle.dataset.lang = 'defaultEventTitle';
  else el.displayTitle.removeAttribute('data-lang');

  if(t){
    // CẬP NHẬT: Hiển thị múi giờ đã chọn
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

// ===== Modal open/close (CẬP NHẬT) =====
function openModal(prefill){
  const selectedYear = parseInt(el.year.value || new Date().getFullYear(), 10);
  
  // CẬP NHẬT: Luôn đặt múi giờ về local khi mở modal
  el.tzSelect.value = tzName;

  if(prefill){
    if(prefill.date){
      const d = new Date(prefill.date);
      d.setFullYear(selectedYear);
      el.modalDate.value = dateToInputString(d, tzName); // Dùng múi giờ local
      el.modalTitle.value = syncTitleYearToDate(prefill.name || '', d);
    } else if(prefill.name){
      el.modalTitle.value = prefill.name;
      const t = new Date(selectedYear, new Date().getMonth(), new Date().getDate(), 9, 0, 0);
      el.modalDate.value = dateToInputString(t, tzName);
    }
  }

  if(!el.modalDate.value){
    const t = new Date(selectedYear, new Date().getMonth(), new Date().getDate(), new Date().getHours()+1, 0, 0);
    el.modalDate.value = dateToInputString(t, tzName);
  }

  el.modal.setAttribute('aria-hidden','false');
  el.modalTitle.focus();
}
function closeModal(){ el.modal.setAttribute('aria-hidden','true'); }

// ===== Share & ICS (Không thay đổi) =====
function buildShareURL(){
  const p=new URLSearchParams();
  const title=el.modalTitle.value?.trim(); const t=parseInputToDate();
  if(title) p.set('title', encodeURIComponent(title));
  if(t) p.set('date', isoUTC(t));
  return location.origin+location.pathname+'?'+p.toString();
}
async function copyShare(){
  const url=buildShareURL();
  try{ await navigator.clipboard.writeText(url); el.status.textContent=getString('statusCopied'); }
  catch{ el.status.textContent=getString('statusLink') + url; }
}
function icsDate(d){
  const pad=(n)=>String(n).padStart(2,'0');
  return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+'T'+
         pad(d.getUTCHours())+pad(d.getUTCMinutes())+pad(d.getUTCSeconds())+'Z';
}
function escapeICS(s){ return String(s).replace(/[\\,;]/g,(m)=>'\\'+m).replace(/\n/g,'\\n'); }
function makeICS(){
  const t=parseInputToDate();
  const raw=(el.modalTitle.value?.trim()||getString('defaultEventTitle'));
  const title=syncTitleYearToDate(raw, t || new Date());
  if(!t){ el.status.textContent=getString('statusIcsError'); return; }
  const dtStart=icsDate(t); const dtEnd=icsDate(new Date(t.getTime()+60*60*1000));
  const ics=`BEGIN:VCALENDAR
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
END:VCALENDAR`;
  const blob=new Blob([ics],{type:'text/calendar'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='event.ics';
  document.body.appendChild(a); a.click(); a.remove();
}

// ===== Apply countdown (CẬP NHẬT) =====
function apply(){
  let t = parseInputToDate(); // Hàm này đã bao gồm logic múi giờ
  if(!t){ el.status.textContent=getString('statusDateError'); shake(el.modalDate); return; }

  const bumped = bumpToFuture(new Date(t));
  if(bumped){
    t = bumped.date;
    // CẬP NHẬT: Phải hiển thị lại ngày đã bump
    // Dùng múi giờ đang chọn trong modal
    el.modalDate.value = dateToInputString(t, el.tzSelect.value); 
  }

  const rawTitle = (el.modalTitle.value?.trim()||getString('defaultEventTitle'));
  el.modalTitle.value = syncTitleYearToDate(rawTitle, t);

  target=t; startWhenSet=new Date(); el.status.textContent=getString('statusStarted');
  CUSTOM_EVENTS.push({ title: el.modalTitle.value, date: t });
  updateYearOptions(el.year.value ? parseInt(el.year.value,10) : t.getFullYear());

  updateLabels(); tick(); closeModal();
}

// ===== Tick (Không thay đổi) =====
function tick(){
  const now=new Date(); const t=target||parseInputToDate(); if(!t) return;
  const diff=t-now, past=diff<=0, total=Math.abs(diff);
  const sec=Math.floor(total/1000)%60, min=Math.floor(total/60000)%60, hr=Math.floor(total/3600000)%24, day=Math.floor(total/86400000);
  el.d.textContent=day; el.h.textContent=fmt2(hr); el.m.textContent=fmt2(min); el.s.textContent=fmt2(sec);
  if(startWhenSet && !past){
    const totalDur=t-startWhenSet; const passed=now-startWhenSet;
    const pct=Math.min(100,Math.max(0,(passed/totalDur)*100));
    el.bar.style.width=pct+'%'; el.progressBar.setAttribute('aria-valuenow', String(Math.round(pct)));
    el.helper.textContent = getString('helperCountdown')(day, fmt2(hr), fmt2(min), fmt2(sec));
  } else if(past){
    el.bar.style.width='100%'; el.progressBar.setAttribute('aria-valuenow','100');
    el.helper.textContent=getString('helperComplete');
  }
  setTimeout(tick,500);
}

// ===== Library render (Không thay đổi) =====
function buildEventsForSelectedYear(){
  const y = parseInt(el.year.value || new Date().getFullYear(), 10);
  return buildLibraryForYear(y);
}
function renderList(){
  const now = new Date(); const currentYear = now.getFullYear();
  const selectedYear = parseInt(el.year.value || currentYear, 10);
  const q = (el.search.value || '').toLowerCase();
  const items = buildEventsForSelectedYear().filter(it => it.name.toLowerCase().includes(q));
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

// ===== Theme & Language Logic (CẬP NHẬT) =====

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

/** [HÀM MỚI] Điền danh sách múi giờ */
function populateTimezoneSelect() {
  const currentTZ = el.tzSelect.value || tzName; // Lưu lựa chọn hiện tại
  el.tzSelect.innerHTML = ''; // Xóa

  // Thêm múi giờ Local (của người dùng) lên đầu
  const localOpt = new Option(`${getString('tzLocal')} (${tzName})`, tzName);
  el.tzSelect.add(localOpt);

  // Thêm dấu gạch ngang
  const sep = new Option('---', '');
  sep.disabled = true;
  el.tzSelect.add(sep);

  // Thêm tất cả múi giờ khác
  try {
    const timezones = Intl.supportedValuesOf('timeZone');
    timezones
      .filter(tz => tz !== tzName) // Lọc bỏ múi giờ local (đã thêm)
      .forEach(tz => {
        const opt = new Option(tz.replace(/_/g, ' '), tz);
        el.tzSelect.add(opt);
      });
  } catch (e) {
    // Trình duyệt cũ (IE) không hỗ trợ Intl.supportedValuesOf
    console.warn("Không thể tải danh sách múi giờ.");
  }

  // Khôi phục lựa chọn
  if (Array.from(el.tzSelect.options).some(opt => opt.value === currentTZ)) {
    el.tzSelect.value = currentTZ;
  } else {
    el.tzSelect.value = tzName; // Fallback
  }
}


function setLanguage(lang) {
  if (!LANG_STRINGS[lang]) return;
  currentLang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem('countdown_lang', lang);
  el.langSwitch.value = lang;

  document.querySelectorAll('[data-lang]').forEach(node => {
    if (node.tagName === 'OPTION') return;
    node.textContent = getString(node.dataset.lang);
  });
  document.querySelectorAll('#themeSelect option[data-lang]').forEach(node => {
    node.textContent = getString(node.dataset.lang);
  });

  document.querySelectorAll('[data-lang-placeholder]').forEach(node => {
    node.placeholder = getString(node.dataset.langPlaceholder);
  });
  document.querySelectorAll('[data-lang-aria]').forEach(node => {
    node.setAttribute('aria-label', getString(node.dataset.langAria));
  });
  document.querySelectorAll('[data-lang-default]').forEach(node => {
    const defaultKey = node.dataset.langDefault;
    const isDefault = Object.values(LANG_STRINGS).some(langPack => langPack[defaultKey] === node.textContent.trim());
    if (isDefault) {
      node.textContent = getString(defaultKey);
    }
  });

  // CẬP NHẬT: Ẩn/hiện thư viện
  if (lang === 'en') {
    el.librarySection.setAttribute('hidden', '');
  } else {
    el.librarySection.removeAttribute('hidden');
  }
  
  // CẬP NHẬT: Dịch lại danh sách múi giờ
  populateTimezoneSelect();

  updateLabels();
  renderList();
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function setTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('countdown_theme', theme);
  el.themeSelect.value = theme;

  if (theme === 'auto') {
    applyTheme(prefersDark.matches ? 'dark' : 'light');
  } else {
    applyTheme(theme);
  }
}

prefersDark.addEventListener('change', (e) => {
  if (currentTheme === 'auto') {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});


// ===== Events (CẬP NHẬT) =====
el.modalApply.addEventListener('click', apply);
el.modalShare.addEventListener('click', copyShare);
el.modalIcs.addEventListener('click', makeICS);
el.modalTitle.addEventListener('input', updateLabels);
el.modalDate.addEventListener('input', updateLabels);
// CẬP NHẬT: Khi đổi múi giờ, cập nhật lại label (để user thấy giờ đổi)
el.tzSelect.addEventListener('input', updateLabels); 

el.islandCreate.addEventListener('click', ()=> openModal());
$('#modalClose').addEventListener('click', closeModal);
el.modal.addEventListener('click', (e)=>{ if(e.target===el.modal) closeModal(); });
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && el.modal.getAttribute('aria-hidden')==='false') closeModal(); });

// search & year controls
['input','change'].forEach(ev=>{
  el.search.addEventListener(ev, renderList);
  el.year.addEventListener(ev, renderList);
});

// Event handlers
el.langSwitch.addEventListener('change', () => {
  setLanguage(el.langSwitch.value);
  toggleSettings(false);
});

el.themeSelect.addEventListener('change', () => {
  setTheme(el.themeSelect.value);
});

// --- LOGIC MENU CÀI ĐẶT (Không thay đổi) ---
function toggleSettings(show) {
  const isHidden = el.settingsDropdown.hasAttribute('hidden');
  if (show === true || (show !== false && isHidden)) {
    el.settingsDropdown.removeAttribute('hidden');
    el.settingsToggle.setAttribute('aria-expanded', 'true');
  } else {
    el.settingsDropdown.setAttribute('hidden', '');
    el.settingsToggle.setAttribute('aria-expanded', 'false');
  }
}
el.settingsToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleSettings(); });
document.addEventListener('click', (e) => {
  if (!el.settingsDropdown.hasAttribute('hidden') && !el.settingsDropdown.contains(e.target) && !el.settingsToggle.contains(e.target)) {
    toggleSettings(false);
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !el.settingsDropdown.hasAttribute('hidden')) {
    toggleSettings(false); el.settingsToggle.focus();
  }
});
el.settingsDropdown.addEventListener('click', (e) => e.stopPropagation());


// Hash presets (CẬP NHẬT)
function applyHashPreset(){
  const h=(location.hash||'').toLowerCase(); if(!h) return;
  const y = parseInt(el.year.value || new Date().getFullYear(), 10);
  let t;
  if(h==='#tomorrow'){ t = new Date(y, new Date().getMonth(), new Date().getDate()+1, 9, 0, 0); }
  else if(h==='#in-1h'){ t = new Date(); t.setHours(t.getHours()+1); }
  else if(h==='#in-10m'){ t = new Date(); t.setMinutes(t.getMinutes()+10); }
  else return;
  
  // CẬP NHẬT: Dùng hàm mới (với múi giờ local)
  el.modalDate.value = dateToInputString(t, tzName);
  el.tzSelect.value = tzName;
  openModal();
}

// ===== Tests (console) (Không thay đổi) =====
function runTests(){
  const dUtc=new Date(Date.UTC(2025,0,2,3,4,5));
  console.assert(icsDate(dUtc)==='20250102T030405Z','icsDate failed');
  const cases=[ {input:'commas,semis;back\\slash', expect:'commas\\,semis\\;back\\\\slash'}, {input:'line\nbreak', expect:'line\\nbreak'}, ];
  cases.forEach((c,i)=>{ const got=escapeICS(c.input); console.assert(got===c.expect, 'escapeICS '+i); });
  console.assert(typeof buildLibraryForYear==='function' && buildLibraryForYear(new Date().getFullYear()).length>0, 'library build failed');
  console.log('✅ Tests passed');
}

// ===== Boot (CẬP NHẬT) =====
function boot(){
  // 1. Setup Language (Phải chạy trước theme và timezone)
  const savedLang = localStorage.getItem('countdown_lang');
  const browserLang = (navigator.language || 'vi').split('-')[0];
  setLanguage(savedLang && LANG_STRINGS[savedLang] ? savedLang : (browserLang && LANG_STRINGS[browserLang] ? browserLang : 'vi'));
  
  // 2. Setup Timezone (Phải chạy sau Ngôn ngữ để dịch, trước Theme)
  // (Hàm setLanguage đã gọi populateTimezoneSelect)
  
  // 3. Setup Theme
  const savedTheme = localStorage.getItem('countdown_theme') || 'auto'; // Mặc định là 'auto'
  setTheme(savedTheme);
  
  // 4. Khởi chạy phần còn lại
  updateYearOptions();
  initFromURL();
  applyHashPreset();
  runTests();
}
boot();

// ===== Helpers (Không thay đổi) =====
function shake(node){
  if(!node) return;
  node.animate(
    [{transform:'translateY(0)'},{transform:'translateY(-3px)'},{transform:'translateY(0)'}],
    {duration:300,iterations:1}
  );
}