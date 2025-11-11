// ===== Utilities & state =====
const $ = (sel) => document.querySelector(sel);
const fmt2 = (n) => String(n).padStart(2,'0');
const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
const qs = new URLSearchParams(location.search);

const el = {
  // popup form
  modal: $('#modal'), modalTitle: $('#title'), modalDate: $('#date'), modalTZ: $('#tz'),
  modalApply: $('#apply'), modalIcs: $('#ics'), modalShare: $('#share'), modalClose: $('#modalClose'),

  // island button
  islandCreate: $('#islandCreate'),

  // countdown
  d: $('#d'), h: $('#h'), m: $('#m'), s: $('#s'),
  displayTitle: $('#displayTitle'), displayDate: $('#displayDate'),
  helper: $('#helper'), bar: $('#bar'),

  // library
  search: $('#search'), list: $('#list'), year: $('#year'),

  // misc
  status: $('#status'), urlStatus: $('#urlStatus')
};
el.modalTZ.value = tzName;

// User-created events kept in-memory to supply years & reopen quickly
const CUSTOM_EVENTS = []; // {title:string, date:Date}

// ===== Time helpers =====
function toLocalDatetimeInputValue(d){
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off*60000);
  return local.toISOString().slice(0,16);
}
function parseInputToDate(){
  if(!el.modalDate.value) return null;
  const local = new Date(el.modalDate.value);
  return isNaN(local) ? null : local;
}
function isoUTC(d){ return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString(); }

/** Bump mốc thời gian lên tương lai nếu đã qua; trả về cả số năm đã cộng. */
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

/** Templates năm */
function renderTemplateWithYear(template, date){
  if(!template) return '';
  return template.replace(/\{yyyy\+1\}/g, String(date.getFullYear()+1))
                 .replace(/\{yyyy\}/g, String(date.getFullYear()));
}
function syncTitleYearToDate(title, date){
  if(!title || !(date instanceof Date)) return title;
  if(/\{yyyy\}/.test(title) || /\{yyyy\+1\}/.test(title)) return renderTemplateWithYear(title, date);
  const yr = String(date.getFullYear());
  return title.replace(/(\d{4})(?!.*\d{4})/, yr); // thay năm cuối nếu có
}

// ===== Library definitions (no hard-coded 2025 in names) =====
const VN_EVENTS_FIXED = [
  { name:'Tết Dương lịch', month:1, day:1, emoji:'🎇' },
  { name:'Giải phóng miền Nam (30/4)', month:4, day:30, emoji:'🕊️' },
  { name:'Quốc tế Lao động (1/5)', month:5, day:1, emoji:'🛠️' },
  { name:'Quốc khánh (2/9)', month:9, day:2, emoji:'🇻🇳' },
  { name:'Ngày Nhà giáo Việt Nam (20/11)', month:11, day:20, emoji:'🍎' },
  { name:'Quốc tế Phụ nữ (8/3)', month:3, day:8, emoji:'🌸' },
  { name:'Quốc tế Thiếu nhi (1/6)', month:6, day:1, emoji:'🧸' },
  // Trung thu: dùng ngày tham khảo 10-06 dương lịch
  { nameTemplate:'Trung thu (tham khảo – {yyyy}-10-06)', fixedMonth:10, fixedDay:6, emoji:'🌕', note:'Âm lịch 15/8 – dương lịch thay đổi' }
];

const LUNAR_TEMPLATED = [
  { nameTemplate:'Tết Nguyên Đán {yyyy} (mùng 1)', baseISO:'2025-01-29T00:00', emoji:'🧧' },
  { nameTemplate:'Giao thừa {yyyy}',                 baseISO:'2025-01-28T23:59', emoji:'🎆' },
  { nameTemplate:'Giỗ Tổ Hùng Vương {yyyy}',         baseISO:'2025-04-08T00:00', emoji:'🏛️' }
];

const EDU_EVENTS = [
  { nameTemplate:'Kỳ thi THPTQG {yyyy} (ước tính)', baseISO:'2025-06-27T07:30', emoji:'🎓', note:'Có thể thay đổi' },
  { nameTemplate:'Khai giảng năm học {yyyy}-{yyyy+1} (ước tính)', baseISO:'2025-09-05T07:00', emoji:'📚', note:'Có thể thay đổi' }
];

/** Tạo items cho MỘT năm cụ thể (không bump). */
function buildLibraryForYear(y){
  const items = [];

  // Solar fixed
  VN_EVENTS_FIXED.forEach(e=>{
    const date = (e.fixedMonth && e.fixedDay)
      ? new Date(y, e.fixedMonth-1, e.fixedDay, 0, 0, 0)
      : new Date(y, e.month-1, e.day, 0, 0, 0);

    const name = e.nameTemplate ? renderTemplateWithYear(e.nameTemplate, date) : e.name;
    items.push({ name, date, note: e.note || '', emoji: e.emoji || '📅' });
  });

  // “Âm lịch” tham khảo: lấy tháng/ngày từ baseISO, gán năm = y
  LUNAR_TEMPLATED.forEach(e=>{
    const base = new Date(e.baseISO);
    const date = new Date(y, base.getMonth(), base.getDate(), base.getHours(), base.getMinutes(), base.getSeconds());
    const name = renderTemplateWithYear(e.nameTemplate, date);
    items.push({ name, date, note:'Tham khảo', emoji: e.emoji || '📅' });
  });

  // Giáo dục
  EDU_EVENTS.forEach(e=>{
    const base = new Date(e.baseISO);
    const date = new Date(y, base.getMonth(), base.getDate(), base.getHours(), base.getMinutes(), base.getSeconds());
    const name = renderTemplateWithYear(e.nameTemplate, date);
    items.push({ name, date, note: e.note || '', emoji: e.emoji || '📅' });
  });

  return items.sort((a,b)=> a.date - b.date);
}

// ===== Year options logic =====
const YEAR_WINDOW_AHEAD = 5;     // số năm thư viện mặc định (năm hiện tại → +5)
const YEAR_WINDOW_BEHIND = 0;    // có thể để 0 để không rối

function collectLibraryYears(){
  const nowY = new Date().getFullYear();
  const years = new Set();
  for(let y = nowY - YEAR_WINDOW_BEHIND; y <= nowY + YEAR_WINDOW_AHEAD; y++){
    // Nếu buildLibraryForYear(y) có ít nhất 1 item, thêm y (luôn có vì mốc cố định)
    years.add(y);
  }
  return years;
}

function collectCustomYears(){
  const s = new Set();
  CUSTOM_EVENTS.forEach(ev => s.add(ev.date.getFullYear()));
  return s;
}

function updateYearOptions(selectedMaybe){
  const libYears = collectLibraryYears();
  const customYears = collectCustomYears();
  const merged = new Set([...libYears, ...customYears]);
  const arr = [...merged].sort((a,b)=>a-b);

  // Nếu chưa có lựa chọn, ưu tiên năm hiện tại
  const prefer = selectedMaybe ?? (arr.includes(new Date().getFullYear()) ? new Date().getFullYear() : arr[0]);

  el.year.innerHTML = arr.map(y => `<option value="${y}">${y}</option>`).join('');
  el.year.value = String(prefer);
}

// ===== URL init & labels =====
function initFromURL(){
  let titleFromURL = qs.get('title');
  const dateStr = qs.get('date');

  if(dateStr){
    const raw = new Date(dateStr);
    if(!isNaN(raw)){
      const bumped = bumpToFuture(raw);
      const t = bumped ? bumped.date : raw;
      el.modalDate.value = toLocalDatetimeInputValue(t);
      if(titleFromURL) titleFromURL = syncTitleYearToDate(decodeURIComponent(titleFromURL), t);
      // thêm năm của URL vào options
      CUSTOM_EVENTS.push({ title: titleFromURL || 'Sự kiện', date: t });
    }
  }
  if(titleFromURL) el.modalTitle.value = titleFromURL;

  updateYearOptions();
  renderList();
  updateLabels();
  tick();
}

function updateLabels(){
  const t = parseInputToDate();
  let title = el.modalTitle.value?.trim() || 'Sự kiện của bạn';
  if(t) title = syncTitleYearToDate(title, t);
  el.displayTitle.textContent = title;

  if(t){
    const f = new Intl.DateTimeFormat(undefined, {dateStyle:'full', timeStyle:'long'}).format(t);
    el.displayDate.textContent = `${f} — ${tzName}`;
  } else {
    el.displayDate.textContent = 'Nhấn “Tạo sự kiện” để bắt đầu.';
  }
  el.urlStatus.textContent = (qs.has('title') || qs.has('date')) ? 'Đang dùng tham số URL' : 'Chưa cấu hình URL';
}

// ===== Modal open/close =====
function openModal(prefill){
  const selectedYear = parseInt(el.year.value || new Date().getFullYear(), 10);

  if(prefill){
    if(prefill.date){
      // Nếu prefill có Date, ưu tiên giữ y theo danh sách (không bump ở library)
      const d = new Date(prefill.date);
      d.setFullYear(selectedYear);
      el.modalDate.value = toLocalDatetimeInputValue(d);
      el.modalTitle.value = syncTitleYearToDate(prefill.name || '', d);
    } else if(prefill.name){
      el.modalTitle.value = prefill.name;
      // nếu chưa có ngày, set mặc định trong năm đang chọn
      const t = new Date(selectedYear, new Date().getMonth(), new Date().getDate(), 9, 0, 0);
      el.modalDate.value = toLocalDatetimeInputValue(t);
    }
  }

  if(!el.modalDate.value){
    const t = new Date(selectedYear, new Date().getMonth(), new Date().getDate(), new Date().getHours()+1, 0, 0);
    el.modalDate.value = toLocalDatetimeInputValue(t);
  }

  el.modal.setAttribute('aria-hidden','false');
  el.modalTitle.focus();
}
function closeModal(){ el.modal.setAttribute('aria-hidden','true'); }
el.islandCreate.addEventListener('click', ()=> openModal());
$('#modalClose').addEventListener('click', closeModal);
el.modal.addEventListener('click', (e)=>{ if(e.target===el.modal) closeModal(); });
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && el.modal.getAttribute('aria-hidden')==='false') closeModal(); });

// ===== Share & ICS =====
function buildShareURL(){
  const p=new URLSearchParams();
  const title=el.modalTitle.value?.trim();
  const t=parseInputToDate();
  if(title) p.set('title', encodeURIComponent(title));
  if(t) p.set('date', isoUTC(t));
  return location.origin+location.pathname+'?'+p.toString();
}
async function copyShare(){
  const url=buildShareURL();
  try{ await navigator.clipboard.writeText(url); el.status.textContent='🔗 Đã sao chép link!'; }
  catch{ el.status.textContent='🔗 Link: '+url; }
}

function icsDate(d){
  const pad=(n)=>String(n).padStart(2,'0');
  return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+'T'+
         pad(d.getUTCHours())+pad(d.getUTCMinutes())+pad(d.getUTCSeconds())+'Z';
}
function escapeICS(s){
  return String(s).replace(/[\\,;]/g,(m)=>'\\'+m).replace(/\n/g,'\\n');
}
function makeICS(){
  const t=parseInputToDate();
  const raw=(el.modalTitle.value?.trim()||'Sự kiện');
  const title=syncTitleYearToDate(raw, t || new Date());
  if(!t){ el.status.textContent='⚠️ Cần ngày giờ để tạo .ics'; return; }
  const dtStart=icsDate(t);
  const dtEnd=icsDate(new Date(t.getTime()+60*60*1000)); // default 1h
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
DESCRIPTION:Đếm ngược: ${escapeICS(location.href)}
END:VEVENT
END:VCALENDAR`;
  const blob=new Blob([ics],{type:'text/calendar'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download='event.ics';
  document.body.appendChild(a); a.click(); a.remove();
}

// ===== Apply countdown =====
let target=null, startWhenSet=null;
function apply(){
  let t=parseInputToDate();
  if(!t){ el.status.textContent='⚠️ Hãy nhập ngày giờ hợp lệ.'; shake(el.modalDate); return; }

  // Bump tới tương lai
  const bumped = bumpToFuture(new Date(t));
  if(bumped){ t = bumped.date; el.modalDate.value = toLocalDatetimeInputValue(t); }

  // Đồng bộ tiêu đề theo năm t
  const rawTitle = (el.modalTitle.value?.trim()||'Sự kiện');
  el.modalTitle.value = syncTitleYearToDate(rawTitle, t);

  target=t; startWhenSet=new Date(); el.status.textContent='✅ Đã bắt đầu đếm.';
  // Lưu custom event để bổ sung năm vào dropdown
  CUSTOM_EVENTS.push({ title: el.modalTitle.value, date: t });
  updateYearOptions(el.year.value ? parseInt(el.year.value,10) : t.getFullYear());

  updateLabels(); tick(); closeModal();
}

// ===== Tick =====
function tick(){
  const now=new Date();
  const t=target||parseInputToDate();
  if(!t) return;

  const diff=t-now, past=diff<=0, total=Math.abs(diff);
  const sec=Math.floor(total/1000)%60, min=Math.floor(total/60000)%60, hr=Math.floor(total/3600000)%24, day=Math.floor(total/86400000);
  el.d.textContent=day; el.h.textContent=fmt2(hr); el.m.textContent=fmt2(min); el.s.textContent=fmt2(sec);

  if(startWhenSet && !past){
    const totalDur=t-startWhenSet; const passed=now-startWhenSet;
    const pct=Math.min(100,Math.max(0,(passed/totalDur)*100));
    el.bar.style.width=pct+'%'; el.bar.parentElement.setAttribute('aria-valuenow', String(Math.round(pct)));
    el.helper.textContent=`Còn ${day} ngày ${fmt2(hr)}:${fmt2(min)}:${fmt2(sec)}`;
  } else if(past){
    el.bar.style.width='100%'; el.bar.parentElement.setAttribute('aria-valuenow','100');
    el.helper.textContent='🎉 Sự kiện đã tới!';
  }
  setTimeout(tick,500);
}

// ===== Library render (by selected year, no bump) =====
function buildEventsForSelectedYear(){
  const y = parseInt(el.year.value || new Date().getFullYear(), 10);
  const items = buildLibraryForYear(y);
  return items;
}
function renderList(){
  const now = new Date();
  const currentYear = now.getFullYear();
  const selectedYear = parseInt(el.year.value || currentYear, 10);

  const q = (el.search.value || '').toLowerCase();
  const items = buildEventsForSelectedYear().filter(it => it.name.toLowerCase().includes(q));

  el.list.innerHTML = '';
  items.forEach(it => {
    // Quy tắc “đã qua trong năm đang chọn”
    let isPast;
    if (selectedYear < currentYear) isPast = true;           // năm quá khứ → luôn đã qua
    else if (selectedYear > currentYear) isPast = false;      // năm tương lai → chưa qua
    else isPast = it.date < now;                              // cùng năm → so với hiện tại

    const when = new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'short' }).format(it.date);

    const li = document.createElement('li');
    li.className = 'card-item' + (isPast ? ' past' : '');
    li.innerHTML = `
      <div class="item-left">
        <div class="emoji">${it.emoji || '📅'}</div>
        <div class="item-meta">
          <div class="item-title">${it.name}</div>
          <div class="item-sub">${when}${it.note ? ' · ' + it.note : ''}${isPast ? ' · đã qua' : ''}</div>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn" data-act="create" ${isPast ? 'disabled aria-disabled="true" title="Sự kiện đã qua trong năm này"' : ''}>
          Tạo sự kiện
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

// ===== Events =====
el.modalApply.addEventListener('click', apply);
el.modalShare.addEventListener('click', copyShare);
el.modalIcs.addEventListener('click', makeICS);
el.modalTitle.addEventListener('input', updateLabels);
el.modalDate.addEventListener('input', updateLabels);

// search & year controls
['input','change'].forEach(ev=>{
  el.search.addEventListener(ev, renderList);
  el.year.addEventListener(ev, renderList);
});

// Hash presets -> mở popup; ngày ở năm đang chọn
function applyHashPreset(){
  const h=(location.hash||'').toLowerCase();
  if(!h) return;
  const y = parseInt(el.year.value || new Date().getFullYear(), 10);
  let t;
  if(h==='#tomorrow'){ t = new Date(y, new Date().getMonth(), new Date().getDate()+1, 9, 0, 0); }
  else if(h==='#in-1h'){ t = new Date(); t.setHours(t.getHours()+1); }
  else if(h==='#in-10m'){ t = new Date(); t.setMinutes(t.getMinutes()+10); }
  else return;
  el.modalDate.value = toLocalDatetimeInputValue(t);
  openModal();
}

// ===== Tests (console) =====
function runTests(){
  const dUtc=new Date(Date.UTC(2025,0,2,3,4,5));
  console.assert(icsDate(dUtc)==='20250102T030405Z','icsDate failed');
  const cases=[
    {input:'commas,semis;back\\slash', expect:'commas\\,semis\\;back\\\\slash'},
    {input:'line\nbreak', expect:'line\\nbreak'},
  ];
  cases.forEach((c,i)=>{ const got=escapeICS(c.input); console.assert(got===c.expect, 'escapeICS '+i); });
  console.assert(typeof buildLibraryForYear==='function' && buildLibraryForYear(new Date().getFullYear()).length>0, 'library build failed');
  console.log('✅ Tests passed');
}

// ===== Boot =====
function boot(){
  updateYearOptions();
  initFromURL();
  applyHashPreset();
  renderList();
  updateLabels();
  runTests();
}
boot();

// ===== Helpers =====
function shake(node){
  if(!node) return;
  node.animate(
    [{transform:'translateY(0)'},{transform:'translateY(-3px)'},{transform:'translateY(0)'}],
    {duration:300,iterations:1}
  );
}
