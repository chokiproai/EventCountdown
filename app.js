// ===== Utilities & state =====
const $ = (sel) => document.querySelector(sel);
const fmt2 = (n) => String(n).padStart(2, '0');
const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
const qs = new URLSearchParams(location.search);

// ===== Language & Theme State =====
let currentLang = 'vi';
let currentTheme = 'auto';
const CUSTOM_EVENTS = [];
const STORAGE_KEY_EVENTS = 'countdown_events';

let VN_EVENTS = [];
let LUNAR_DATES = {};
let EDU_EVENTS = [];
let STRINGS = {};
// State for year rotation
let lastCheckedYear = new Date().getFullYear();
const LOADED_LOCALES = {};

const DEFAULT_LOCALES = {
  vi: {
    strings: {
      "siteTitle": "Event Countdown",
      "createEventBtn": "Tạo sự kiện",
      "countdownHeading": "Đếm ngược",
      "lblDay": "Ngày",
      "lblHour": "Giờ",
      "lblMinute": "Phút",
      "lblSecond": "Giây",
      "defaultEventTitle": "Sự kiện của bạn",
      "defaultEventDate": "Nhấn “Tạo sự kiện” để bắt đầu.",
      "ariaProgress": "Tiến độ tới thời điểm sự kiện",
      "urlStatusLabel": "Trạng thái URL:",
      "libHeading": "Thư viện sự kiện Việt Nam",
      "searchPlaceholder": "Tìm: Tết, 30/4, Quốc khánh, Trung thu, THPTQG...",
      "libNote": "⚠️ Một số mốc theo âm lịch là ước tính (tham khảo); ngày dương có thể thay đổi từng năm.",
      "modalTitle": "Tạo sự kiện",
      "modalCloseLabel": "Đóng",
      "modalLabelTitle": "Tên sự kiện",
      "modalPlaceholderTitle": "VD: Giao thừa {yyyy}, Sinh nhật...",
      "modalLabelDate": "Ngày & giờ",
      "modalLabelTZ": "Múi giờ",
      "modalBtnApply": "Bắt đầu đếm",
      "modalBtnIcs": "Tải .ics",
      "modalBtnShare": "Sao chép link",
      "urlStatusConfigured": "Đang dùng tham số URL",
      "urlStatusNotConfigured": "Chưa cấu hình URL",
      "statusCopied": "🔗 Đã sao chép link!",
      "statusLink": "🔗 Link: ",
      "statusIcsError": "⚠️ Cần ngày giờ để tạo .ics",
      "statusDateError": "⚠️ Hãy nhập ngày giờ hợp lệ.",
      "statusStarted": "✅ Đã bắt đầu đếm.",
      "helperCountdown": "Còn {d} ngày {h}:{m}:{s}",
      "helperComplete": "🎉 Sự kiện đã tới!",
      "pastSuffix": "đã qua",
      "pastEventTitle": "Sự kiện đã qua trong năm này",
      "newYearDay": "Tết Dương lịch",
      "liberationDay": "Giải phóng miền Nam (30/4)",
      "labourDay": "Quốc tế Lao động (1/5)",
      "independenceDay": "Quốc khánh (2/9)",
      "teachersDay": "Ngày Nhà giáo Việt Nam (20/11)",
      "womensDay": "Quốc tế Phụ nữ (8/3)",
      "childrensDay": "Quốc tế Thiếu nhi (1/6)",
      "midAutumn": "Trung thu (tham khảo – {yyyy}-10-06)",
      "midAutumnNote": "Âm lịch 15/8 – dương lịch thay đổi",
      "lunarNewYear": "Tết Nguyên Đán {yyyy} (mùng 1)",
      "lunarNewYearEve": "Giao thừa {yyyy}",
      "hungKings": "Giỗ Tổ Hùng Vương {yyyy}",
      "nationalExam": "Kỳ thi THPTQG {yyyy} (ước tính)",
      "nationalExamNote": "Có thể thay đổi",
      "schoolOpening": "Khai giảng năm học {yyyy}-{yyyy+1} (ước tính)",
      "schoolOpeningNote": "Có thể thay đổi",
      "genericNote": "Tham khảo",
      "christmas": "Giáng sinh (Noel)",
      "halloween": "Lễ hội Halloween",
      "valentine": "Lễ tình nhân (Valentine)",
      "settingsAria": "Cài đặt và tuỳ chọn",
      "modalLabelLang": "Ngôn ngữ",
      "modalLabelTheme": "Giao diện",
      "themeAuto": "Tự động",
      "themeLight": "Sáng",
      "themeDark": "Tối",
      "tzLocal": "Cục bộ (của bạn)",
      "btnDelete": "Xoá",
      "customEventNote": "Sự kiện của bạn",
      "libLoadError": "Lỗi tải thư viện sự kiện. Hãy thử tải lại trang.",
      "myEventsHeading": "Sự kiện của tôi",
      "helperMini": "Còn {d}d {h}h {m}m",
      "helperMiniPast": "Đã qua",
      "myEventsEmptyHeading": "Chưa có sự kiện nào",
      "myEventsEmptyBody": "Nhấn \"Tạo sự kiện\" hoặc thêm một sự kiện từ thư viện bên dưới để bắt đầu.",
      "upcomingEvents": "Sự kiện sắp tới"
    },
    library: {
      "VN_EVENTS": [
        { "langKey": "newYearDay", "month": 1, "day": 1, "emoji": "🎇" },
        { "langKey": "liberationDay", "month": 4, "day": 30, "emoji": "🕊️" },
        { "langKey": "labourDay", "month": 5, "day": 1, "emoji": "🛠️" },
        { "langKey": "independenceDay", "month": 9, "day": 2, "emoji": "🇻🇳" },
        { "langKey": "teachersDay", "month": 11, "day": 20, "emoji": "🍎" },
        { "langKey": "womensDay", "month": 3, "day": 8, "emoji": "🌸" },
        { "langKey": "childrensDay", "month": 6, "day": 1, "emoji": "🧸" },
        { "langKey": "christmas", "month": 12, "day": 25, "emoji": "🎄" },
        { "langKey": "halloween", "month": 10, "day": 31, "emoji": "🎃" },
        { "langKey": "valentine", "month": 2, "day": 14, "emoji": "💘" }
      ],
      "LUNAR_DATES": {
        "2025": { "lunarNewYear": "2025-01-29T00:00", "lunarNewYearEve": "2025-01-28T23:59", "hungKings": "2025-04-07T00:00", "midAutumn": "2025-10-06T00:00" },
        "2026": { "lunarNewYear": "2026-02-17T00:00", "lunarNewYearEve": "2026-02-16T23:59", "hungKings": "2026-04-25T00:00", "midAutumn": "2026-09-25T00:00" },
        "2027": { "lunarNewYear": "2027-02-06T00:00", "lunarNewYearEve": "2027-02-05T23:59", "hungKings": "2027-04-16T00:00", "midAutumn": "2027-09-15T00:00" },
        "2028": { "lunarNewYear": "2028-01-26T00:00", "lunarNewYearEve": "2028-01-25T23:59", "hungKings": "2028-04-04T00:00", "midAutumn": "2028-10-03T00:00" },
        "2029": { "lunarNewYear": "2029-02-13T00:00", "lunarNewYearEve": "2029-02-12T23:59", "hungKings": "2029-04-22T00:00", "midAutumn": "2029-09-22T00:00" },
        "2030": { "lunarNewYear": "2030-02-03T00:00", "lunarNewYearEve": "2030-02-02T23:59", "hungKings": "2030-04-12T00:00", "midAutumn": "2030-09-12T00:00" }
      },
      "EDU_EVENTS": [
        { "langKey": "nationalExam", "templated": true, "baseISO": "2025-06-27T07:30", "emoji": "🎓", "noteKey": "nationalExamNote" },
        { "langKey": "schoolOpening", "templated": true, "baseISO": "2025-09-05T07:00", "emoji": "📚", "noteKey": "schoolOpeningNote" }
      ]
    }
  },
  en: {
    strings: {
      "siteTitle": "Event Countdown",
      "createEventBtn": "Create Event",
      "countdownHeading": "Countdown",
      "lblDay": "Days",
      "lblHour": "Hours",
      "lblMinute": "Minutes",
      "lblSecond": "Seconds",
      "defaultEventTitle": "Your Event",
      "defaultEventDate": "Press \"Create Event\" to start.",
      "ariaProgress": "Progress to the event time",
      "urlStatusLabel": "URL Status:",
      "libHeading": "Event Library",
      "searchPlaceholder": "Search: Event name...",
      "libNote": "⚠️ Some lunar dates are estimates; solar dates may change annually.",
      "modalTitle": "Create Event",
      "modalCloseLabel": "Close",
      "modalLabelTitle": "Event Name",
      "modalPlaceholderTitle": "E.g., New Year's Eve {yyyy}, Birthday...",
      "modalLabelDate": "Date & Time",
      "modalLabelTZ": "Timezone",
      "modalBtnApply": "Start Countdown",
      "modalBtnIcs": "Download .ics",
      "modalBtnShare": "Copy Link",
      "urlStatusConfigured": "Using URL parameters",
      "urlStatusNotConfigured": "URL not configured",
      "statusCopied": "🔗 Link copied!",
      "statusLink": "🔗 Link: ",
      "statusIcsError": "⚠️ Date and time required for .ics",
      "statusDateError": "⚠️ Please enter a valid date and time.",
      "statusStarted": "✅ Countdown started.",
      "helperCountdown": "{d} days {h}:{m}:{s} left",
      "helperComplete": "🎉 The event is here!",
      "pastSuffix": "past",
      "pastEventTitle": "Event has passed for this year",
      "newYearDay": "New Year's Day",
      "liberationDay": "Reunification Day (Apr 30)",
      "labourDay": "International Labor Day (May 1)",
      "independenceDay": "National Day (Sep 2)",
      "teachersDay": "Vietnamese Teachers' Day (Nov 20)",
      "womensDay": "International Women's Day (Mar 8)",
      "childrensDay": "International Children's Day (Jun 1)",
      "midAutumn": "Mid-Autumn (Ref – {yyyy}-10-06)",
      "midAutumnNote": "Lunar 15/8 – solar date varies",
      "lunarNewYear": "Lunar New Year {yyyy} (1st day)",
      "lunarNewYearEve": "Lunar New Year's Eve {yyyy}",
      "hungKings": "Hung Kings' Commemoration Day {yyyy}",
      "nationalExam": "National High School Exam {yyyy} (Est.)",
      "nationalExamNote": "Subject to change",
      "schoolOpening": "School Opening {yyyy}-{yyyy+1} (Est.)",
      "schoolOpeningNote": "Subject to change",
      "genericNote": "Reference",
      "christmas": "Christmas Day (Noel)",
      "halloween": "Halloween",
      "valentine": "Valentine's Day",
      "settingsAria": "Settings and options",
      "modalLabelLang": "Language",
      "modalLabelTheme": "Theme",
      "themeAuto": "Auto",
      "themeLight": "Light",
      "themeDark": "Dark",
      "tzLocal": "Local (Yours)",
      "btnDelete": "Delete",
      "customEventNote": "My Event",
      "libLoadError": "Error loading event library. Please reload the page.",
      "myEventsHeading": "My Events",
      "helperMini": "{d}d {h}h {m}m left",
      "helperMiniPast": "Finished",
      "myEventsEmptyHeading": "No events yet",
      "myEventsEmptyBody": "Press \"Create Event\" or add one from the library below to get started.",
      "upcomingEvents": "Upcoming Events"
    },
    library: {
      "VN_EVENTS": [
        { "langKey": "newYearDay", "month": 1, "day": 1, "emoji": "🎇" },
        { "langKey": "christmas", "month": 12, "day": 25, "emoji": "🎄" },
        { "langKey": "halloween", "month": 10, "day": 31, "emoji": "🎃" },
        { "langKey": "valentine", "month": 2, "day": 14, "emoji": "💘" }
      ],
      "EDU_EVENTS": []
    }
  }
};

const LANG_STRINGS_FALLBACK = {
  'siteTitle': 'Event Countdown', 'createEventBtn': 'Create Event', 'defaultEventTitle': 'Your Event', 'defaultEventDate': 'Press "Create Event" to start.', 'statusDateError': '⚠️ Please enter a valid date and time.', 'statusStarted': '✅ Countdown started.', 'helperComplete': '🎉 The event is here!', 'themeAuto': 'Auto', 'themeLight': 'Light', 'themeDark': 'Dark', 'tzLocal': 'Local (Yours)', 'upcomingEvents': 'Upcoming Events',
};

/** Lấy chuỗi dịch */
function getString(key) {
  if (key === 'helperCountdown') { const template = STRINGS[key] || '{d} days {h}:{m}:{s} left'; return (d, h, m, s) => template.replace('{d}', d).replace('{h}', h).replace('{m}', m).replace('{s}', s); }
  if (key === 'helperMini') { const template = STRINGS[key] || '{d}d {h}h {m}m'; return (d, h, m) => template.replace('{d}', d).replace('{h}', h).replace('{m}', m); }
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
    el.alarmSound.load();
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }
  document.addEventListener('click', unlockAudio, { once: true });
  document.addEventListener('touchstart', unlockAudio, { once: true });
}

// ===== Hàm phát âm thanh =====
function playAlarm(times) {
  let count = 0;
  function play() {
    if (count >= times) return;
    count++;
    try {
      el.alarmSound.currentTime = 0;
      el.alarmSound.play().catch(e => console.warn("Không thể tự động phát âm thanh.", e));
    } catch (e) { console.error(e); }
    if (count < times) { setTimeout(play, 1500); }
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
function parseOffset(offsetStr) { const match = offsetStr.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/); if (!match) return 0; const sign = match[1] === '-' ? -1 : 1; const hours = parseInt(match[2], 10); const minutes = parseInt(match[3] || '0', 10); return sign * (hours * 60 + minutes); }
function formatOffset(offsetMinutes) { const sign = offsetMinutes >= 0 ? '+' : '-'; const absMin = Math.abs(offsetMinutes); const h = String(Math.floor(absMin / 60)).padStart(2, '0'); const m = String(absMin % 60).padStart(2, '0'); return `${sign}${h}:${m}`; }
function parseInputToDate() { const dateStr = el.modalDate.value; if (!dateStr) return null; const selectedTZ = el.tzSelect.value; if (selectedTZ === tzName) { const d = new Date(dateStr); return isNaN(d) ? null : d; } try { const tempDate = new Date(dateStr); if (isNaN(tempDate)) return null; const offsetStr = new Intl.DateTimeFormat('en', { timeZone: selectedTZ, timeZoneName: 'shortOffset' }).format(tempDate); const offsetMinutes = parseOffset(offsetStr); const isoStr = dateStr + formatOffset(offsetMinutes); const finalDate = new Date(isoStr); return isNaN(finalDate) ? null : finalDate; } catch (e) { console.error("Lỗi parseInputToDate:", e); return null; } }
function isoUTC(d) { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString(); }
function bumpToFuture(date) { if (!(date instanceof Date) || isNaN(date)) return null; const now = new Date(); let years = 0; while (date <= now) { date = new Date(date.getFullYear() + 1, date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()); years++; } return { date, yearsBumped: years }; }
function renderTemplateWithYear(templateKey, date) { const template = getString(templateKey); if (!template) return ''; return template.replace(/\{yyyy\+1\}/g, String(date.getFullYear() + 1)).replace(/\{yyyy\}/g, String(date.getFullYear())); }
function syncTitleYearToDate(title, date) { if (!title || !(date instanceof Date)) return title; if (/\{yyyy\}/.test(title) || /\{yyyy\+1\}/.test(title)) return renderTemplateWithYear(title.replace(/.*\{(.+?)\}.*/, '$1'), date); const yr = String(date.getFullYear()); return title.replace(/(\d{4})(?!.*\d{4})/, yr); }

// ===== Logic Thư viện =====
function buildLibraryForYear(y) {
  const items = [];
  VN_EVENTS.forEach(e => { const date = (e.fixedMonth && e.fixedDay) ? new Date(y, e.fixedMonth - 1, e.fixedDay, 0, 0, 0) : new Date(y, e.month - 1, e.day, 0, 0, 0); const name = e.templated ? renderTemplateWithYear(e.langKey, date) : getString(e.langKey); const note = e.noteKey ? getString(e.noteKey) : ''; items.push({ name, date, note, emoji: e.emoji || '📅' }); });

  // Lunar Events Calculation (Automatic)
  if (typeof Lunisolar !== 'undefined') {
    try {
      // Tet Nguyen Dan (1/1 Lunar)
      const tet = Lunisolar.getSolarDateFromLunar(1, 1, y);
      if (tet) {
        items.push({ name: renderTemplateWithYear('lunarNewYear', tet), date: tet, note: getString('genericNote'), emoji: '🧧' });
        // Tet Eve (Tet - 1 day)
        const eve = new Date(tet);
        eve.setDate(eve.getDate() - 1);
        items.push({ name: renderTemplateWithYear('lunarNewYearEve', eve), date: eve, note: getString('genericNote'), emoji: '🎆' });
      }

      // Hung Kings (10/3 Lunar)
      const hungKings = Lunisolar.getSolarDateFromLunar(10, 3, y);
      if (hungKings) {
        items.push({ name: renderTemplateWithYear('hungKings', hungKings), date: hungKings, note: getString('hungKingsNote') || getString('genericNote'), emoji: '🏛️' });
      }

      // Mid Autumn (15/8 Lunar)
      const midAutumn = Lunisolar.getSolarDateFromLunar(15, 8, y);
      if (midAutumn) {
        items.push({ name: renderTemplateWithYear('midAutumn', midAutumn), date: midAutumn, note: getString('midAutumnNote'), emoji: '🌕' });
      }

    } catch (e) { console.error("Lunar calc error:", e); }
  }

  EDU_EVENTS.forEach(e => { const base = new Date(e.baseISO); const date = new Date(y, base.getMonth(), base.getDate(), base.getHours(), base.getMinutes(), base.getSeconds()); const name = renderTemplateWithYear(e.langKey, date); items.push({ name, date, note: e.noteKey ? getString(e.noteKey) : '', emoji: e.emoji || '📅' }); });
  return items.sort((a, b) => a.date - b.date);
}
function collectLibraryYears() { const nowY = new Date().getFullYear(); const years = new Set(); for (let y = nowY; y <= nowY + 5; y++) years.add(y); return years; }
function updateYearOptions(selectedMaybe) { const libYears = collectLibraryYears(); const arr = [...libYears].sort((a, b) => a - b); el.year.innerHTML = arr.map(y => `<option value="${y}">${y}</option>`).join(''); el.year.value = String(selectedMaybe || new Date().getFullYear()); }

// ===== URL Logic  =====
function initFromURL() {
  let titleFromURL = qs.get('title'); const dateStr = qs.get('date');
  if (dateStr) { const raw = new Date(dateStr); if (!isNaN(raw)) { const bumped = bumpToFuture(raw); const t = bumped ? bumped.date : raw; if (titleFromURL) titleFromURL = syncTitleYearToDate(decodeURIComponent(titleFromURL), t); el.modalTitle.value = titleFromURL || getString('defaultEventTitle'); el.modalDate.value = dateToInputString(t, tzName); el.tzSelect.value = tzName; openModal({ name: el.modalTitle.value, date: t }); return; } }
  if (titleFromURL && !dateStr) el.modalTitle.value = titleFromURL;
}
function updateLabels() { if (el.urlStatus) { el.urlStatus.textContent = (qs.has('title') || qs.has('date')) ? getString('urlStatusConfigured') : getString('urlStatusNotConfigured'); } }

// ===== Modal Open/Close  =====
function openModal(prefill) { const selectedYear = parseInt(el.year.value || new Date().getFullYear(), 10); el.tzSelect.value = tzName; if (prefill) { if (prefill.date) { const d = new Date(prefill.date); el.modalDate.value = dateToInputString(d, tzName); el.modalTitle.value = syncTitleYearToDate(prefill.name || '', d); } else if (prefill.name) { el.modalTitle.value = prefill.name; const t = new Date(selectedYear, new Date().getMonth(), new Date().getDate(), 9, 0, 0); el.modalDate.value = dateToInputString(t, tzName); } } else { el.modalTitle.value = ''; const t = new Date(selectedYear, new Date().getMonth(), new Date().getDate(), new Date().getHours() + 1, 0, 0); el.modalDate.value = dateToInputString(t, tzName); } el.modal.setAttribute('aria-hidden', 'false'); el.modalTitle.focus(); }
function closeModal() { el.modal.setAttribute('aria-hidden', 'true'); }

// ===== ICS & Share  =====
function buildShareURL() { const p = new URLSearchParams(); const title = el.modalTitle.value?.trim(); const t = parseInputToDate(); if (title) p.set('title', encodeURIComponent(title)); if (t) p.set('date', isoUTC(t)); return location.origin + location.pathname + '?' + p.toString(); }
async function copyShare() { const url = buildShareURL(); try { await navigator.clipboard.writeText(url); el.status.textContent = getString('statusCopied'); } catch { el.status.textContent = getString('statusLink') + url; } }
function icsDate(d) { const pad = (n) => String(n).padStart(2, '0'); return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z'; }
function escapeICS(s) { return String(s).replace(/[\\,;]/g, (m) => '\\' + m).replace(/\n/g, '\\n'); }
function makeICS() { const t = parseInputToDate(); const raw = (el.modalTitle.value?.trim() || getString('defaultEventTitle')); const title = syncTitleYearToDate(raw, t || new Date()); if (!t) { el.status.textContent = getString('statusIcsError'); return; } const dtStart = icsDate(t); const dtEnd = icsDate(new Date(t.getTime() + 60 * 60 * 1000)); const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nSUMMARY:${escapeICS(title)}\nEND:VEVENT\nEND:VCALENDAR`; const blob = new Blob([ics], { type: 'text/calendar' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'event.ics'; a.click(); }

// ===== Apply  =====
function apply() {
  let t = parseInputToDate(); if (!t) { el.status.textContent = getString('statusDateError'); return; }
  const nowY = new Date().getFullYear();

  if (t.getFullYear() < nowY) {
    const msg = currentLang === 'vi' ? `⚠️ Không thể chọn năm trước ${nowY}.` : `⚠️ Cannot select year before ${nowY}.`;
    alert(msg);
    return;
  }

  // Prevent past dates
  if (t <= new Date()) {
    const msg = currentLang === 'vi' ? `⚠️ Sự kiện phải ở tương lai!` : `⚠️ Event must be in the future!`;
    alert(msg);
    return;
  }

  const rawTitle = (el.modalTitle.value?.trim() || getString('defaultEventTitle'));
  el.modalTitle.value = syncTitleYearToDate(rawTitle, t);
  const exists = CUSTOM_EVENTS.some(ev => ev.date.toISOString() === t.toISOString() && ev.title === el.modalTitle.value);
  if (!exists) { CUSTOM_EVENTS.push({ title: el.modalTitle.value, date: t, isFinished: t <= new Date() }); saveCustomEvents(); }
  updateYearOptions(el.year.value ? parseInt(el.year.value, 10) : t.getFullYear());
  buildMyEventsSkeleton(); updateLabels(); closeModal();
}

function tick() {
  updateEventCards();

  // Check year rotation
  const nowY = new Date().getFullYear();
  if (nowY !== lastCheckedYear) {
    lastCheckedYear = nowY;
    updateYearOptions(parseInt(el.year.value, 10)); // Re-render year options
    renderLibraryList(); // Refresh list to remove old events if displayed
  }

  setTimeout(tick, 500);
}

// ===== Render Thẻ Sự Kiện (Bento Grid) =====
function buildMyEventsSkeleton() {
  const items = CUSTOM_EVENTS.sort((a, b) => a.date - b.date);

  if (items.length === 0) {
    el.countdownList.innerHTML = '';
    el.countdownEmptyPlaceholder.removeAttribute('hidden');
    return;
  }

  el.countdownEmptyPlaceholder.setAttribute('hidden', '');
  el.countdownList.innerHTML = '';

  items.forEach(it => {
    const iso = it.date.toISOString();
    const card = document.createElement('div');
    card.className = 'event-card-modern';
    card.id = `card-${iso}`;

    card.innerHTML = `
      <div class="ev-header">
        <span>${it.title}</span>
        <span class="del-btn" data-iso="${iso}">✕</span>
      </div>
      <div class="ev-timer">
        <div class="t-box"><span class="t-num" id="d-${iso}">0</span><span class="t-lbl" data-lang="lblDay">${getString('lblDay')}</span></div>
        <div class="t-box"><span class="t-num" id="h-${iso}">00</span><span class="t-lbl" data-lang="lblHour">${getString('lblHour')}</span></div>
        <div class="t-box"><span class="t-num" id="m-${iso}">00</span><span class="t-lbl" data-lang="lblMinute">${getString('lblMinute')}</span></div>
        <div class="t-box"><span class="t-num" id="s-${iso}">00</span><span class="t-lbl" data-lang="lblSecond">${getString('lblSecond')}</span></div>
      </div>
      <div class="ev-progress">
        <div class="ev-fill" id="bar-${iso}"></div>
      </div>
    `;

    card.querySelector('.del-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCustomEvent(e.currentTarget.dataset.iso);
    });

    el.countdownList.appendChild(card);
  });

  updateEventCards();
}

// ===== Update Time =====
function updateEventCards() {
  const now = new Date();
  CUSTOM_EVENTS.forEach(it => {
    const iso = it.date.toISOString();
    const el_d = document.getElementById(`d-${iso}`);
    if (!el_d) return;

    const t = it.date;
    const diff = t - now;
    const past = diff <= 0;
    const total = Math.abs(diff);

    // Logic tính toán gốc của bạn
    el_d.textContent = Math.floor(total / 86400000);
    document.getElementById(`h-${iso}`).textContent = fmt2(Math.floor(total / 3600000) % 24);
    document.getElementById(`m-${iso}`).textContent = fmt2(Math.floor(total / 60000) % 60);
    document.getElementById(`s-${iso}`).textContent = fmt2(Math.floor(total / 1000) % 60);

    const bar = document.getElementById(`bar-${iso}`);
    const card = document.getElementById(`card-${iso}`);

    if (!past) {
      bar.style.width = '0%';
      card.classList.remove('past');
    } else {
      bar.style.width = '100%';
      card.classList.add('past'); // Thêm class để làm mờ
      if (!it.isFinished) {
        playAlarm(3);
        if ('Notification' in window && Notification.permission === 'granted') {
          try { new Notification(getString('helperComplete'), { body: it.title }); } catch (e) { }
        }

        // Trigger Effects
        const titleLower = it.title.toLowerCase();
        if (titleLower.includes('new year') || titleLower.includes('tết') || titleLower.includes('giao thừa')) {
          if (typeof startFireworks === 'function') startFireworks();
        } else {
          if (typeof startConfetti === 'function') startConfetti();
        }

        it.isFinished = true;
      }
    }
  });
}

// ===== Render Thư Viện =====
// ===== Logic Gợi ý sự kiện sắp tới =====
function getUpcomingEvents(limit = 5) {
  const now = new Date();
  const currentY = now.getFullYear();
  const yearsToCheck = [currentY, currentY + 1];
  let candidates = [];

  yearsToCheck.forEach(y => {
    candidates = candidates.concat(buildLibraryForYear(y));
  });

  // Filter for future events only
  const future = candidates.filter(it => it.date > now);

  // Sort by date ascending
  future.sort((a, b) => a.date - b.date);

  // Unique by name (to avoid duplicates if event is close to year end)
  const unique = [];
  const seen = new Set();
  future.forEach(it => {
    if (!seen.has(it.name)) {
      unique.push(it);
      seen.add(it.name);
    }
  });

  return unique.slice(0, limit);
}

// ===== Render Thư Viện =====
function renderLibraryList() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const selectedYear = parseInt(el.year.value || currentYear, 10);
  const q = (el.search.value || '').toLowerCase();

  el.list.innerHTML = '';

  // Logic hiển thị Suggestion khi không search
  if (!q) {
    const suggestions = getUpcomingEvents(3);
    if (suggestions.length > 0) {
      const header = document.createElement('li');
      header.className = 'lib-header';
      header.innerHTML = `<span style="opacity:0.8; font-size:0.85rem; text-transform:uppercase; letter-spacing:1px; font-weight:700">✨ ${getString('upcomingEvents') || 'Upcoming Events'}</span>`;
      el.list.appendChild(header);

      suggestions.forEach(it => {
        const li = createLibraryItem(it, now, currentYear, true);
        if (li) el.list.appendChild(li);
      });

      const divider = document.createElement('li');
      divider.style.height = '1px';
      divider.style.background = 'var(--glass-border)';
      divider.style.margin = '8px 0';
      el.list.appendChild(divider);
    }
  }

  const libItems = (VN_EVENTS.length === 0 && LUNAR_TEMPLATED.length === 0) ? [] : buildLibraryForYear(selectedYear);
  const items = libItems.filter(it => it.name.toLowerCase().includes(q));

  items.forEach(it => {
    const li = createLibraryItem(it, now, selectedYear, false);
    if (li) el.list.appendChild(li);
  });
}

function createLibraryItem(it, now, displayedYear, isSuggestion) {
  const isPast = isSuggestion ? false : ((displayedYear < now.getFullYear()) ? true : (displayedYear > now.getFullYear() ? false : it.date < now));

  // Create LI
  const li = document.createElement('li');
  li.className = 'lib-item';

  // Logic hiển thị Suggestion đặc biệt
  if (isSuggestion) {
    li.classList.add('suggestion-item');

    // Tính số ngày còn lại
    const diffTime = it.date - now;
    let val = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    let label = getString('lblDay') || 'Days';

    // Nếu còn dưới 1 ngày (0 ngày), chuyển sang hiển thị giờ
    if (val === 0) {
      val = Math.floor(diffTime / (1000 * 60 * 60));
      label = getString('lblHour') || 'Hours';
    }

    // Format date nicely
    const dateStr = new Intl.DateTimeFormat(currentLang, { day: 'numeric', month: 'short' }).format(it.date);

    li.innerHTML = `
      <div class="suggestion-content">
        <div class="sug-icon">${it.emoji || '📅'}</div>
        <div class="sug-info">
          <div class="sug-title">${it.name}</div>
          <div class="sug-date">${dateStr} • ${it.date.getFullYear()}</div>
        </div>
        <div class="sug-badge ${val <= 7 && label !== getString('lblHour') ? 'urgent' : ''}">
          <span class="sug-days">${val}</span>
          <span class="sug-label">${label}</span>
        </div>
      </div>
    `;
  } else {
    // Standard List Item
    const dateFormat = new Intl.DateTimeFormat(currentLang, { dateStyle: 'medium' });
    const when = dateFormat.format(it.date);

    li.innerHTML = ` 
      <div class="lib-icon">${it.emoji || '📅'}</div>
      <div style="flex:1">
         <div style="font-weight:700">${it.name}</div>
         <div style="font-size:0.8rem; opacity:0.7">${when} ${isPast ? '(Qua)' : ''}</div>
      </div>
      <div style="font-size:1.2rem; opacity:0.5">＋</div>
    `;
  }

  if (!isPast) {
    li.addEventListener('click', () => { openModal({ name: it.name, date: it.date }); });
  } else {
    li.style.opacity = '0.5'; li.style.cursor = 'default';
  }
  return li;
}

// ===== Load Data =====
async function loadEventLibrary(libraryData) {
  VN_EVENTS = libraryData.VN_EVENTS || [];
  LUNAR_DATES = libraryData.LUNAR_DATES || {};
  EDU_EVENTS = libraryData.EDU_EVENTS || [];
  if (VN_EVENTS.length > 0) el.librarySection.removeAttribute('hidden');
}

// ===== Populate TZ =====
function populateTimezoneSelect() { const currentTZ = el.tzSelect.value || tzName; el.tzSelect.innerHTML = ''; const localOpt = new Option(`${getString('tzLocal')} (${tzName})`, tzName); el.tzSelect.add(localOpt); const sep = new Option('---', ''); sep.disabled = true; el.tzSelect.add(sep); try { const timezones = Intl.supportedValuesOf('timeZone'); timezones.filter(tz => tz !== tzName).forEach(tz => { const opt = new Option(tz.replace(/_/g, ' '), tz); el.tzSelect.add(opt); }); } catch (e) { } if (Array.from(el.tzSelect.options).some(opt => opt.value === currentTZ)) { el.tzSelect.value = currentTZ; } else { el.tzSelect.value = tzName; } }

// ===== Set Language =====
async function setLanguage(lang) {
  if (!['vi', 'en'].includes(lang)) lang = 'en'; currentLang = lang;
  document.documentElement.lang = lang; localStorage.setItem('countdown_lang', lang); el.langSwitch.value = lang;

  if (DEFAULT_LOCALES[lang]) {
    const data = DEFAULT_LOCALES[lang];
    STRINGS = data.strings;
    loadEventLibrary(data.library);
    LOADED_LOCALES[lang] = data;
  } else if (LOADED_LOCALES[lang]) {
    const data = LOADED_LOCALES[lang]; STRINGS = data.strings; loadEventLibrary(data.library);
  } else {
    try {
      const response = await fetch(`locales/${lang}.json`);
      const data = await response.json();
      STRINGS = data.strings; loadEventLibrary(data.library); LOADED_LOCALES[lang] = data;
    } catch (error) { STRINGS = LANG_STRINGS_FALLBACK; loadEventLibrary({}); }
  }

  // Update Labels
  document.querySelectorAll('[data-lang]').forEach(node => { if (node.tagName !== 'OPTION') node.textContent = getString(node.dataset.lang); });
  document.querySelectorAll('[data-lang-placeholder]').forEach(node => { node.placeholder = getString(node.dataset.langPlaceholder); });
  document.querySelectorAll('#themeSelect option').forEach(opt => opt.textContent = getString(opt.dataset.lang));

  populateTimezoneSelect(); updateLabels(); renderLibraryList(); buildMyEventsSkeleton(); updateYearOptions(parseInt(el.year.value, 10));
}

// ===== Theme Handling (UPDATE CSS CLASS) =====
function applyTheme(theme) { document.documentElement.classList.toggle('dark', theme === 'dark'); }
function setTheme(theme) {
  currentTheme = theme; localStorage.setItem('countdown_theme', theme); el.themeSelect.value = theme;
  if (theme === 'auto') { applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
  else { applyTheme(theme); }
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => { if (currentTheme === 'auto') applyTheme(e.matches ? 'dark' : 'light'); });

// ===== Events binding =====
el.modalApply.addEventListener('click', apply);
el.modalShare.addEventListener('click', copyShare);
el.modalIcs.addEventListener('click', makeICS);
// Sửa logic click vào thẻ Hero mới
el.islandCreate.addEventListener('click', () => openModal());
$('#modalClose').addEventListener('click', closeModal);
el.modal.addEventListener('click', (e) => { if (e.target === el.modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && el.modal.getAttribute('aria-hidden') === 'false') closeModal(); });

el.search.addEventListener('input', () => { renderLibraryList(); });
el.year.addEventListener('change', () => { renderLibraryList(); });
el.langSwitch.addEventListener('change', () => { setLanguage(el.langSwitch.value); });
el.themeSelect.addEventListener('change', () => { setTheme(el.themeSelect.value); });
// Toggle Settings
el.settingsToggle.addEventListener('click', (e) => { e.stopPropagation(); el.settingsDropdown.hidden = !el.settingsDropdown.hidden; });
document.addEventListener('click', (e) => { if (!el.settingsDropdown.hidden && !el.settingsDropdown.contains(e.target) && !el.settingsToggle.contains(e.target)) el.settingsDropdown.hidden = true; });

// ===== Boot =====
async function boot() {
  loadCustomEvents();
  const savedLang = localStorage.getItem('countdown_lang') || 'vi';
  await setLanguage(savedLang);
  const savedTheme = localStorage.getItem('countdown_theme') || 'auto';
  setTheme(savedTheme);

  updateYearOptions(); initFromURL(); initAudioUnlock(); updateLabels();
  buildMyEventsSkeleton(); renderLibraryList(); tick();
}

boot();