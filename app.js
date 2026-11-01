/* Roster Run – clickable prototype. All data is fake and lives in localStorage. */
(() => {
'use strict';

const STORE_KEY = 'rosterrun.v1';
const EXPIRY_WARN_DAYS = 30;
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAY_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const LICENCE_RANK = { C:0, LR:1, MR:2, HR:3, HC:4, MC:5 };

/* ---------- date helpers (local time, YYYY-MM-DD strings) ---------- */
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return ymd(d); };
const mondayOf = s => { const d = parseD(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return ymd(d); };
const dow = s => parseD(s).getDay();
const todayStr = () => ymd(new Date());
const daysBetween = (a, b) => Math.round((parseD(b) - parseD(a)) / 86400000);
const fmtDate = s => { const d = parseD(s); return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const fmtDateLong = s => { const d = parseD(s); return `${DAY_LONG[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const fmtShort = s => { if (!s) return '—'; const d = parseD(s); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const toMin = t => { const [h, m] = (t || '0:0').split(':').map(Number); return h * 60 + m; };
const fmtTime = t => { if (!t) return ''; let [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return `${h}:${pad(m)}${ap}`; };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const uid = p => p + Math.random().toString(36).slice(2, 8);
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

/* ---------- seed data ---------- */
function seed() {
  const t = todayStr();
  const mon = mondayOf(t);
  const exp = n => addDays(t, n);
  const drivers = [
    ['d1','Karen Whitfield','0412 381 904','HR','DA-418 227', exp(410),'Active','Senior driver, Rosewood depot'],
    ['d2','Tama Ngata','0438 220 517','HR','DA-503 961', exp(265),'Active',''],
    ['d3','Bronwyn Keogh','0401 776 312','HR','DA-377 140', exp(9),'Active','Renewal paperwork lodged?'],
    ['d4','Daniel Pham','0455 913 208','MR','DA-612 885', exp(540),'Active',''],
    ['d5','Graham Lusk','0419 064 553','HR','DA-298 316', exp(181),'Active','Wheelchair hoist trained'],
    ['d6','Priya Raman','0447 351 690','MR','DA-655 402', exp(322),'Active',''],
    ['d7','Steve O\u2019Rourke','0408 590 774','LR','DA-441 093', exp(96),'Active','Prefers midday shifts'],
    ['d8','Mele Taufa','0433 812 465','HR','DA-520 778', exp(730),'Active','Charter lead'],
    ['d9','Liam Brennan','0421 667 019','HR','DA-689 314', exp(23),'Active','Spare / relief'],
    ['d10','Joanne Carter','0402 148 836','MR','DA-372 551', exp(455),'Active','Spare / relief'],
    ['d11','Hamid Rahimi','0466 307 942','HR','DA-305 287', exp(-12),'Active','Authorisation lapsed – do not roster'],
    ['d12','Sue Kingsley','0414 952 160','MR','DA-447 609', exp(388),'On leave','Annual leave until end of month'],
    ['d13','Ben Albury','0439 785 241','HC','DA-701 126', exp(612),'Active','Spare / relief'],
    ['d14','Rosa Delgado','0477 210 388','LR','DA-596 830', exp(147),'Active','Casual'],
  ].map(([id,name,phone,licenceClass,authNo,authExpiry,status,notes]) => ({ id,name,phone,licenceClass,authNo,authExpiry,status,notes }));
  const assistants = [
    ['a1','Leanne Moffat','0403 118 274','BC-1180442', exp(820),'Active',''],
    ['a2','Josh Tran','0429 576 300','BC-1342190', exp(360),'Active',''],
    ['a3','Fatima Noor','0451 230 989','BC-1287731', exp(540),'Active','First aid + hoist trained'],
    ['a4','Craig Duggan','0410 845 612','BC-1093318', exp(18),'Active','Blue card renewal due'],
    ['a5','Hannah Sievers','0436 904 157','BC-1401276', exp(1020),'Active','Spare'],
    ['a6','Kylie Brooks','0418 377 052','BC-1225609', exp(240),'Active','Spare'],
    ['a7','Ahmed Yousef','0459 612 840','BC-1376054', exp(-5),'Active','Blue card expired'],
    ['a8','Tegan Holloway','0422 095 763','BC-1318827', exp(700),'On leave',''],
  ].map(([id,name,phone,blueCardNo,blueCardExpiry,status,notes]) => ({ id,name,phone,blueCardNo,blueCardExpiry,status,notes }));
  const buses = [
    ['b1','B01','871 QBX','Volvo B8RLE / Volgren',57,'HR',false,'In service', exp(140),''],
    ['b2','B02','872 QBX','Scania K320 / Irizar',45,'MR',false,'In service', exp(201),''],
    ['b3','B03','034 RTA','MAN 18.320 / Express',57,'HR',false,'In service', exp(77),''],
    ['b4','B04','519 PKL','Iveco Daily Midi',33,'MR',false,'In service', exp(260),''],
    ['b5','B05','662 SNW','Mercedes Sprinter Access',14,'LR',true,'In service', exp(33),'Rear wheelchair hoist'],
    ['b6','B06','208 MVC','Hino Liesse II',33,'MR',false,'In service', exp(119),''],
    ['b7','B07','447 HJD','Volvo B7R / Volgren',53,'HR',false,'Out of service', exp(12),'Gearbox fault – at workshop'],
    ['b8','B08','125 TQW','Toyota Coaster',22,'LR',true,'In service', exp(305),'Low-floor ramp'],
    ['b9','B09','903 BUS','Scania K360 / Coach Design',57,'HR',false,'In service', exp(188),'Charter coach, luggage bays'],
    ['b10','B10','386 LZP','Isuzu MT / Custom',45,'MR',false,'In service', exp(232),'Spare'],
  ].map(([id,fleetNo,rego,make,capacity,licenceReq,wheelchair,status,coiExpiry,notes]) => ({ id,fleetNo,rego,make,capacity,licenceReq,wheelchair,status,coiExpiry,notes }));
  const R = (id,code,name,type,area,days,runs,minCapacity,needsAssistant,wheelchair,notes) =>
    ({ id,code,name,type,area,days,runs:runs.map(([rid,label,start,end]) => ({ id:rid,label,start,end })),minCapacity,needsAssistant,wheelchair,notes,active:true });
  const wk = [1,2,3,4,5];
  const routes = [
    R('r1','S101','Rosewood – Ipswich schools','School','Rosewood, Walloon, Thagoona, Ipswich CBD',wk,[['AM','AM','07:00','08:25'],['PM','PM','15:00','16:20']],57,true,false,'Primary + secondary students'),
    R('r2','S102','Karalee – Brassall loop','School','Karalee, Barellan Point, Brassall, North Ipswich',wk,[['AM','AM','07:15','08:30'],['PM','PM','15:05','16:10']],45,false,false,''),
    R('r3','S103','Ripley Valley – Springfield','School','Ripley, South Ripley, Deebing Heights, Springfield Central',wk,[['AM','AM','06:50','08:15'],['PM','PM','14:55','16:15']],57,true,false,'Busiest school run'),
    R('r4','S104','Redbank Plains – Goodna','School','Redbank Plains, Bellbird Park, Goodna',wk,[['AM','AM','07:20','08:20'],['PM','PM','15:10','16:00']],33,false,false,''),
    R('r5','S105','Special assistance – Yamanto/Raceview','School','Yamanto, Raceview, Flinders View, Bundamba',wk,[['AM','AM','07:30','08:40'],['PM','PM','14:45','15:50']],12,true,true,'Wheelchair-accessible vehicle required'),
    R('r6','S106','Walloon – Rosewood','School','Walloon, Haigslea, Rosewood',wk,[['AM','AM','07:05','08:10'],['PM','PM','15:00','16:05']],33,false,false,''),
    R('r7','R201','Booval – Bundamba shopper shuttle','Shuttle','Booval Fair, Bundamba, Riverlink',[1,3,5],[['MID','Midday','09:30','13:00']],22,false,true,'Seniors shuttle'),
    R('r8','C301','Saturday junior sport charter','Charter','Ipswich CBD → Brisbane venues',[6],[['DAY','Day','07:30','13:30']],57,true,false,'Supervised junior sport team'),
  ];
  // default crews
  const crew = { r1:['d1','a1','b1'], r2:['d2',null,'b2'], r3:['d3','a2','b3'], r4:['d4',null,'b4'], r5:['d5','a3','b5'], r6:['d6',null,'b6'], r7:['d7',null,'b8'], r8:['d8','a4','b9'] };
  const assignments = {};
  for (let w = -1; w <= 1; w++) {
    const wMon = addDays(mon, w * 7);
    for (let i = 0; i < 7; i++) {
      const date = addDays(wMon, i);
      for (const r of routes) {
        if (!r.days.includes(dow(date))) continue;
        for (const run of r.runs) {
          if (w === 1 && r.id === 'r6' && i >= 2) continue; // leave some gaps next week
          const [driverId, assistantId, busId] = crew[r.id];
          assignments[`${date}|${r.id}|${run.id}`] = { driverId, assistantId, busId, note:'' };
        }
      }
    }
  }
  // deliberate issues this week so the checks have something to show
  const d = i => addDays(mon, i);
  const set = (i, r, run, patch) => { const k = `${d(i)}|${r}|${run}`; assignments[k] = { ...(assignments[k] || { driverId:null, assistantId:null, busId:null, note:'' }), ...patch }; };
  set(1,'r1','AM',{ busId:'b10', note:'B01 in for tyre change' });           // capacity 45 < 57
  set(2,'r1','PM',{ assistantId:null });                                     // needs assistant
  set(3,'r4','PM',{ driverId:'d3', note:'Daniel off early – cover' });       // clashes with S103 PM
  set(4,'r2','AM',{ busId:'b7' });                                           // bus out of service
  set(3,'r5','AM',{ driverId:null });                                        // unfilled
  return { version:1, seededOn:t, drivers, assistants, buses, routes, assignments };
}

/* ---------- state ---------- */
let S;
function load() {
  try { S = JSON.parse(localStorage.getItem(STORE_KEY)); } catch { S = null; }
  if (!S || S.version !== 1) { S = seed(); save(); }
}
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
const ui = { week: mondayOf(todayStr()), day: todayStr(), rosterMode: null, palette: 'drivers', search: {}, tripFrom: null, tripTo: null, sheetDate: todayStr() };

const byId = (list, id) => id ? S[list].find(x => x.id === id) : null;
const driver = id => byId('drivers', id);
const assistant = id => byId('assistants', id);
const bus = id => byId('buses', id);
const route = id => byId('routes', id);

/* ---------- runs & checks ---------- */
function runsOn(date) {
  const out = [];
  for (const r of S.routes) {
    if (!r.active || !r.days.includes(dow(date))) continue;
    for (const run of r.runs) {
      const key = `${date}|${r.id}|${run.id}`;
      out.push({ key, date, route:r, run, start:run.start, end:run.end, a:S.assignments[key] || { driverId:null, assistantId:null, busId:null, note:'' } });
    }
  }
  return out.sort((x, y) => toMin(x.start) - toMin(y.start) || x.route.code.localeCompare(y.route.code));
}
const overlaps = (a, b) => toMin(a.start) < toMin(b.end) && toMin(b.start) < toMin(a.end);
const runLabel = r => `${r.route.code} ${r.run.label}`;
function findRun(key) { const [date] = key.split('|'); return runsOn(date).find(r => r.key === key); }

// Issues for a run given an (optionally hypothetical) assignment
function runIssues(run, a = run.a, sameDay = null) {
  const out = [];
  const add = (sev, type, msg) => out.push({ sev, type, msg, key: run.key });
  const others = (sameDay || runsOn(run.date)).filter(o => o.key !== run.key && overlaps(o, run));
  const dv = driver(a.driverId), as = assistant(a.assistantId), bs = bus(a.busId);
  if (!a.driverId) add('warn', 'unfilled', 'No driver assigned');
  if (!a.busId) add('warn', 'unfilled', 'No bus assigned');
  if (run.route.needsAssistant && !a.assistantId) add('err', 'assistant', 'Route needs an assistant – none assigned');
  if (dv) {
    const c = others.find(o => o.a.driverId === dv.id);
    if (c) add('err', 'clash', `${dv.name} double-booked with ${runLabel(c)} (${fmtTime(c.start)}–${fmtTime(c.end)})`);
    if (dv.authExpiry && dv.authExpiry < run.date) add('err', 'auth', `${dv.name}'s driver authorisation expired ${fmtShort(dv.authExpiry)}`);
    else if (dv.authExpiry && daysBetween(run.date, dv.authExpiry) <= EXPIRY_WARN_DAYS) add('warn', 'auth', `${dv.name}'s authorisation expires ${fmtShort(dv.authExpiry)}`);
    if (dv.status !== 'Active') add('err', 'status', `${dv.name} is ${dv.status.toLowerCase()}`);
    if (bs && (LICENCE_RANK[dv.licenceClass] ?? 0) < (LICENCE_RANK[bs.licenceReq] ?? 0)) add('err', 'licence', `${dv.name} holds ${dv.licenceClass}; ${bs.fleetNo} needs ${bs.licenceReq}`);
  }
  if (as) {
    const c = others.find(o => o.a.assistantId === as.id);
    if (c) add('err', 'clash', `${as.name} double-booked with ${runLabel(c)} (${fmtTime(c.start)}–${fmtTime(c.end)})`);
    if (as.blueCardExpiry && as.blueCardExpiry < run.date) add('err', 'bluecard', `${as.name}'s blue card expired ${fmtShort(as.blueCardExpiry)}`);
    if (as.status !== 'Active') add('err', 'status', `${as.name} is ${as.status.toLowerCase()}`);
  }
  if (bs) {
    const c = others.find(o => o.a.busId === bs.id);
    if (c) add('err', 'clash', `${bs.fleetNo} (${bs.rego}) double-booked with ${runLabel(c)}`);
    if (bs.status !== 'In service') add('err', 'bus', `${bs.fleetNo} is ${bs.status.toLowerCase()}${bs.notes ? ' – ' + bs.notes : ''}`);
    if (+bs.capacity < +run.route.minCapacity) add('err', 'capacity', `${bs.fleetNo} seats ${bs.capacity}; route needs ${run.route.minCapacity}`);
    if (run.route.wheelchair && !bs.wheelchair) add('err', 'access', `Route needs wheelchair access; ${bs.fleetNo} has none`);
    if (bs.coiExpiry && bs.coiExpiry < run.date) add('err', 'coi', `${bs.fleetNo} inspection certificate expired ${fmtShort(bs.coiExpiry)}`);
  }
  return out;
}
function weekDates(mon) { return [...Array(7)].map((_, i) => addDays(mon, i)); }
function issuesForDates(dates) {
  const map = {}; const all = [];
  for (const date of dates) {
    const day = runsOn(date);
    for (const run of day) { const is = runIssues(run, run.a, day); map[run.key] = is; all.push(...is.map(i => ({ ...i, run }))); }
  }
  return { map, all };
}
function sevOf(list) { return list.some(i => i.sev === 'err') ? 'err' : list.length ? 'warn' : 'ok'; }

// What would go wrong if a resource were placed on this run? (for dropdown hints)
function candidateNote(run, kind, id) {
  const a = { ...run.a, [kind]: id };
  const is = runIssues(run, a).filter(i => {
    if (i.type === 'unfilled' || i.type === 'assistant') return false;
    const name = kind === 'driverId' ? driver(id)?.name : kind === 'assistantId' ? assistant(id)?.name : bus(id)?.fleetNo;
    return name && i.msg.includes(name);
  });
  if (!is.length) return '';
  const i = is[0];
  const short = { clash: 'busy ' + (i.msg.match(/with (\S+ \S+)/) || [,''])[1], auth: i.sev === 'err' ? 'authorisation expired' : 'auth expiring', status: i.msg.split(' is ')[1], licence: 'licence too low', bluecard: 'blue card expired', bus: 'out of service', capacity: 'too few seats', access: 'no wheelchair access', coi: 'COI expired' }[i.type] || i.msg;
  return short;
}

/* ---------- compliance (people/buses) ---------- */
function expiryBadge(dateStr) {
  if (!dateStr) return '<span class="badge">—</span>';
  const d = daysBetween(todayStr(), dateStr);
  if (d < 0) return `<span class="badge b-err">Expired ${esc(fmtShort(dateStr))}</span>`;
  if (d <= EXPIRY_WARN_DAYS) return `<span class="badge b-warn">${d === 0 ? 'Expires today' : `Expires in ${d} day${d === 1 ? '' : 's'}`}</span>`;
  return `<span class="badge b-ok">Valid to ${esc(fmtShort(dateStr))}</span>`;
}
function statusBadge(s) {
  const cls = s === 'Active' || s === 'In service' ? 'b-ok' : s === 'On leave' || s === 'Workshop' ? 'b-warn' : 'b-err';
  return `<span class="badge ${cls}">${esc(s)}</span>`;
}
function complianceAlerts() {
  const t = todayStr(), out = [];
  for (const d of S.drivers) { const n = daysBetween(t, d.authExpiry); if (n <= EXPIRY_WARN_DAYS) out.push({ sev: n < 0 ? 'err' : 'warn', text: `${d.name} – driver authorisation ${n < 0 ? 'expired' : 'expires'} ${fmtShort(d.authExpiry)}`, link: '#/drivers' }); }
  for (const a of S.assistants) { const n = daysBetween(t, a.blueCardExpiry); if (n <= EXPIRY_WARN_DAYS) out.push({ sev: n < 0 ? 'err' : 'warn', text: `${a.name} – blue card ${n < 0 ? 'expired' : 'expires'} ${fmtShort(a.blueCardExpiry)}`, link: '#/assistants' }); }
  for (const b of S.buses) {
    if (b.status !== 'In service') out.push({ sev: 'err', text: `${b.fleetNo} (${b.rego}) – ${b.status}${b.notes ? ': ' + b.notes : ''}`, link: '#/buses' });
    const n = daysBetween(t, b.coiExpiry); if (b.coiExpiry && n <= EXPIRY_WARN_DAYS) out.push({ sev: n < 0 ? 'err' : 'warn', text: `${b.fleetNo} – inspection certificate ${n < 0 ? 'expired' : 'due'} ${fmtShort(b.coiExpiry)}`, link: '#/buses' });
  }
  return out.sort((a, b) => (a.sev === 'err' ? 0 : 1) - (b.sev === 'err' ? 0 : 1));
}

/* ---------- UI helpers ---------- */
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600); }
const firstName = n => (n || '').split(' ')[0];
const shortName = n => { const p = (n || '').split(' '); return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : n; };
function issueList(list) {
  if (!list.length) return '<p class="ok-line">✓ No issues</p>';
  return `<ul class="issues">${list.map(i => `<li class="${i.sev}">${i.sev === 'err' ? '⛔' : '⚠️'} ${esc(i.msg)}</li>`).join('')}</ul>`;
}

const modal = $('#modal');
function openModal(title, body, foot, onSubmit) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = body;
  $('#modalFoot').innerHTML = foot;
  modal._submit = onSubmit;
  if (!modal.open) modal.showModal();
  const f = $('input,select,textarea', $('#modalBody')); if (f && matchMedia('(pointer:fine)').matches) f.focus();
}
function closeModal() { if (modal.open) modal.close(); }
$('#modalForm').addEventListener('submit', e => {
  const btn = e.submitter;
  if (btn && btn.value === 'cancel') return;
  e.preventDefault();
  if (modal._submit && modal._submit(btn ? btn.value : 'save') !== false) closeModal();
});
modal.addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target === modal) closeModal(); });

/* ---------- views ---------- */
const views = {};
let currentView = 'dashboard';

function render() {
  const v = (location.hash.replace(/^#\//, '') || 'dashboard').split('?')[0];
  currentView = views[v] ? v : 'dashboard';
  $$('#tabs a').forEach(a => a.classList.toggle('active', a.dataset.view === currentView));
  const active = $('#tabs a.active'); if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  $('#view').innerHTML = views[currentView]();
  if (views[currentView].after) views[currentView].after();
}
window.addEventListener('hashchange', render);

/* Dashboard */
views.dashboard = () => {
  const t = todayStr();
  const mon = mondayOf(t);
  const dates = weekDates(mon);
  const { all } = issuesForDates(dates);
  const today = runsOn(t);
  const todayIss = issuesForDates([t]).map;
  const filledToday = today.filter(r => r.a.driverId && r.a.busId).length;
  const weekRuns = dates.flatMap(runsOn);
  const unfilled = weekRuns.filter(r => !r.a.driverId || !r.a.busId).length;
  const errs = all.filter(i => i.sev === 'err');
  const comp = complianceAlerts();
  const inService = S.buses.filter(b => b.status === 'In service').length;
  const now = nowMin();
  const status = r => toMin(r.end) <= now ? ['done', 'Completed'] : toMin(r.start) <= now ? ['live', 'On the road'] : ['next', 'Upcoming'];
  const grouped = []; const seen = {};
  for (const i of all) { const g = i.type === 'auth' && i.sev === 'warn' ? 'auth|' + i.msg : i.key + i.msg; if (seen[g]) { seen[g].n++; continue; } seen[g] = { ...i, n: 1 }; grouped.push(seen[g]); }
  const sorted = [...grouped].sort((a, b) => (a.sev === 'err' ? 0 : 1) - (b.sev === 'err' ? 0 : 1) || a.run.date.localeCompare(b.run.date) || toMin(a.run.start) - toMin(b.run.start));
  return `
  <section class="page-head">
    <div><h1>${esc(fmtDateLong(t))}</h1><p class="muted">Week of ${esc(fmtShort(mon))} · ${weekRuns.length} scheduled runs</p></div>
    <div class="head-actions"><a class="btn" href="#/runsheet">Today's run sheet</a><a class="btn btn-primary" href="#/roster">Open roster</a></div>
  </section>
  <section class="kpis">
    <div class="kpi"><span class="kpi-n">${filledToday}<small>/${today.length}</small></span><span class="kpi-l">Runs crewed today</span></div>
    <div class="kpi ${unfilled ? 'k-warn' : ''}"><span class="kpi-n">${unfilled}</span><span class="kpi-l">Unfilled runs this week</span></div>
    <div class="kpi ${errs.length ? 'k-err' : ''}"><span class="kpi-n">${errs.length}</span><span class="kpi-l">Clashes &amp; problems this week</span></div>
    <div class="kpi ${comp.length ? 'k-warn' : ''}"><span class="kpi-n">${comp.length}</span><span class="kpi-l">Compliance alerts</span></div>
    <div class="kpi"><span class="kpi-n">${inService}<small>/${S.buses.length}</small></span><span class="kpi-l">Buses in service</span></div>
  </section>
  <div class="dash-grid">
    <section class="card">
      <div class="card-head"><h2>Today's runs</h2><a href="#/roster" class="link" data-goday="${t}">Edit in roster →</a></div>
      ${today.length ? `<div class="today-list">${today.map(r => {
        const [cls, lbl] = status(r); const is = todayIss[r.key] || []; const d = driver(r.a.driverId), a = assistant(r.a.assistantId), b = bus(r.a.busId);
        return `<button class="today-run sev-${sevOf(is)}" data-open="${r.key}">
          <span class="tr-time">${fmtTime(r.start)}<small>${fmtTime(r.end)}</small></span>
          <span class="tr-main"><strong>${esc(r.route.code)} ${esc(r.run.label)}</strong> ${esc(r.route.name)}
            <span class="tr-crew">${d ? '👤 ' + esc(d.name) : '<em class="miss">No driver</em>'} · ${b ? '🚌 ' + esc(b.fleetNo) + ' ' + esc(b.rego) : '<em class="miss">No bus</em>'}${a ? ' · 🦺 ' + esc(a.name) : r.route.needsAssistant ? ' · <em class="miss">No assistant</em>' : ''}</span>
          </span>
          <span class="tr-status st-${cls}">${lbl}${is.length ? `<span class="pill ${sevOf(is)}">${is.length} ⚠</span>` : ''}</span>
        </button>`; }).join('')}</div>` : '<p class="empty">No runs scheduled today.</p>'}
    </section>
    <section class="card">
      <div class="card-head"><h2>Warnings this week</h2><span class="muted">${all.length} across ${new Set(all.map(i => i.key)).size} runs</span></div>
      ${sorted.length ? `<ul class="warn-list">${sorted.slice(0, 12).map(i => `<li class="${i.sev}"><button data-open="${i.run.key}"><span class="wl-when">${esc(fmtDate(i.run.date))} · ${esc(runLabel(i.run))}</span><span>${i.sev === 'err' ? '⛔' : '⚠️'} ${esc(i.msg)}${i.n > 1 ? ` <span class="muted">· affects ${i.n} runs</span>` : ''}</span></button></li>`).join('')}</ul>${sorted.length > 12 ? `<a class="link" href="#/roster">+ ${sorted.length - 12} more in the roster →</a>` : ''}` : '<p class="ok-line">✓ No warnings this week</p>'}
    </section>
    <section class="card">
      <div class="card-head"><h2>Compliance &amp; fleet</h2></div>
      ${comp.length ? `<ul class="warn-list">${comp.map(c => `<li class="${c.sev}"><a href="${c.link}">${c.sev === 'err' ? '⛔' : '⚠️'} ${esc(c.text)}</a></li>`).join('')}</ul>` : '<p class="ok-line">✓ Everything current</p>'}
    </section>
    <section class="card">
      <div class="card-head"><h2>Week at a glance</h2></div>
      <div class="glance">${dates.map(date => { const rs = runsOn(date); const f = rs.filter(r => r.a.driverId && r.a.busId).length; const pct = rs.length ? Math.round(f / rs.length * 100) : 0; const iss = all.filter(i => i.run.date === date && i.sev === 'err').length;
        return `<button class="glance-row ${date === t ? 'is-today' : ''}" data-goday="${date}"><span class="g-day">${esc(fmtDate(date))}</span><span class="bar"><span style="width:${rs.length ? pct : 0}%"></span></span><span class="g-n">${rs.length ? `${f}/${rs.length}` : '—'}${iss ? ` <span class="pill err">${iss}</span>` : ''}</span></button>`; }).join('')}</div>
    </section>
  </div>`;
};

/* Roster */
function cellHTML(run, issues, compact = false) {
  const d = driver(run.a.driverId), a = assistant(run.a.assistantId), b = bus(run.a.busId);
  const sev = sevOf(issues);
  const errs = issues.filter(i => i.sev === 'err').length;
  return `<div class="cell sev-${sev}" data-key="${run.key}" tabindex="0" role="button" aria-label="Edit ${esc(runLabel(run))} on ${esc(fmtDate(run.date))}">
    ${issues.length ? `<span class="cell-flag ${sev}" title="${esc(issues.map(i => i.msg).join('\n'))}">${errs || issues.length}</span>` : ''}
    ${compact ? `<div class="cell-run"><strong>${esc(run.route.code)} ${esc(run.run.label)}</strong> <span class="muted">${fmtTime(run.start)}–${fmtTime(run.end)}</span><div class="muted small">${esc(run.route.name)}</div></div>` : ''}
    <div class="slot ${d ? '' : 'vacant'}" data-slot="driverId">${d ? `<span class="ic">👤</span>${esc(shortName(d.name))}` : '<span class="ic">👤</span>Driver?'}</div>
    <div class="slot ${b ? '' : 'vacant'}" data-slot="busId">${b ? `<span class="ic">🚌</span>${esc(b.fleetNo)} <span class="muted">${esc(b.rego)}</span>` : '<span class="ic">🚌</span>Bus?'}</div>
    ${a ? `<div class="slot" data-slot="assistantId"><span class="ic">🦺</span>${esc(shortName(a.name))}</div>` : run.route.needsAssistant ? `<div class="slot vacant need" data-slot="assistantId"><span class="ic">🦺</span>Assistant needed</div>` : `<div class="slot vacant opt" data-slot="assistantId"><span class="ic">🦺</span>—</div>`}
    ${compact && issues.length ? issueList(issues) : ''}
  </div>`;
}
views.roster = () => {
  const mode = ui.rosterMode || (innerWidth < 900 ? 'day' : 'grid');
  const dates = weekDates(ui.week);
  const { map, all } = issuesForDates(dates);
  const usedDays = dates.filter(d => runsOn(d).length);
  if (!dates.includes(ui.day)) ui.day = dates.includes(todayStr()) ? todayStr() : usedDays[0] || dates[0];
  const t = todayStr();
  const errs = all.filter(i => i.sev === 'err').length, warns = all.length - errs;
  // rows: route-run combos
  const TYPE_RANK = { School: 0, Regular: 1, Shuttle: 2, Charter: 3 };
  const rows = S.routes.filter(r => r.active).flatMap(r => r.runs.map(run => ({ r, run }))).sort((x, y) => (TYPE_RANK[x.r.type] ?? 9) - (TYPE_RANK[y.r.type] ?? 9) || x.r.code.localeCompare(y.r.code) || toMin(x.run.start) - toMin(y.run.start));
  const head = `
  <section class="page-head">
    <div><h1>Roster</h1><p class="muted">Week of ${esc(fmtShort(ui.week))} · <span class="${errs ? 'txt-err' : ''}">${errs} problem${errs === 1 ? '' : 's'}</span> · <span class="${warns ? 'txt-warn' : ''}">${warns} warning${warns === 1 ? '' : 's'}</span></p></div>
    <div class="head-actions wrap">
      <div class="seg"><button class="btn" data-week="-1" aria-label="Previous week">‹ Prev</button><button class="btn" data-week="0">This week</button><button class="btn" data-week="1" aria-label="Next week">Next ›</button></div>
      <div class="seg"><button class="btn ${mode === 'grid' ? 'on' : ''}" data-mode="grid">Week grid</button><button class="btn ${mode === 'day' ? 'on' : ''}" data-mode="day">Day list</button></div>
      <button class="btn" data-act="copyweek" title="Copy last week's assignments into this week">Copy last week</button>
      <button class="btn btn-danger-ghost" data-act="clearweek">Clear week</button>
    </div>
  </section>`;
  if (mode === 'day') {
    const runs = runsOn(ui.day);
    return head + `
    <div class="day-chips">${dates.map(d => { const rs = runsOn(d); const e = rs.reduce((n, r) => n + (map[r.key] || []).filter(i => i.sev === 'err').length, 0);
      return `<button class="chip ${d === ui.day ? 'on' : ''} ${d === t ? 'is-today' : ''}" data-day="${d}"><span>${DAY_NAMES[dow(d)]}</span><strong>${parseD(d).getDate()}</strong>${e ? `<i class="dot err"></i>` : rs.some(r => (map[r.key] || []).length) ? '<i class="dot warn"></i>' : ''}</button>`; }).join('')}</div>
    <h2 class="day-title">${esc(fmtDateLong(ui.day))}</h2>
    ${runs.length ? `<div class="day-list">${runs.map(r => cellHTML(r, map[r.key] || [], true)).join('')}</div>` : '<p class="empty card">No runs on this day.</p>'}`;
  }
  const palList = ui.palette === 'drivers' ? S.drivers.map(d => ({ id: d.id, label: d.name, sub: `${d.licenceClass} · ${d.status}`, bad: d.status !== 'Active' || d.authExpiry < t }))
    : ui.palette === 'assistants' ? S.assistants.map(a => ({ id: a.id, label: a.name, sub: a.status, bad: a.status !== 'Active' || a.blueCardExpiry < t }))
    : S.buses.map(b => ({ id: b.id, label: `${b.fleetNo} · ${b.rego}`, sub: `${b.capacity} seats · ${b.status}`, bad: b.status !== 'In service' }));
  const kind = { drivers: 'driverId', assistants: 'assistantId', buses: 'busId' }[ui.palette];
  return head + `
  <div class="roster-wrap">
    <div class="grid-scroll">
      <table class="grid">
        <thead><tr><th class="rowh">Route / run</th>${usedDays.map(d => `<th class="${d === t ? 'is-today' : ''}"><span>${DAY_NAMES[dow(d)]}</span> ${parseD(d).getDate()} ${MONTHS[parseD(d).getMonth()]}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(({ r, run }) => `<tr>
          <th class="rowh"><strong>${esc(r.code)} <span class="runlbl">${esc(run.label)}</span></strong><span class="muted small">${fmtTime(run.start)}–${fmtTime(run.end)}</span><span class="rname">${esc(r.name)}</span>
            <span class="tags">${r.needsAssistant ? '<span class="tag">Assistant</span>' : ''}${r.wheelchair ? '<span class="tag">♿</span>' : ''}<span class="tag">${r.minCapacity}+ seats</span></span></th>
          ${usedDays.map(d => { if (!r.days.includes(dow(d))) return `<td class="off ${d === t ? 'is-today' : ''}"></td>`;
            const runObj = runsOn(d).find(x => x.route.id === r.id && x.run.id === run.id); return `<td class="${d === t ? 'is-today' : ''}">${cellHTML(runObj, map[runObj.key] || [])}</td>`; }).join('')}
        </tr>`).join('')}</tbody>
      </table>
    </div>
    <aside class="palette card">
      <div class="seg full">${['drivers', 'assistants', 'buses'].map(p => `<button class="btn ${ui.palette === p ? 'on' : ''}" data-pal="${p}">${p[0].toUpperCase() + p.slice(1)}</button>`).join('')}</div>
      <p class="muted small">Drag onto a run to assign, or click a run to edit.</p>
      <div class="pal-list">${palList.map(p => `<div class="pchip ${p.bad ? 'bad' : ''}" draggable="true" data-kind="${kind}" data-id="${p.id}"><strong>${esc(p.label)}</strong><span>${esc(p.sub)}</span></div>`).join('')}</div>
    </aside>
  </div>`;
};
views.roster.after = () => {
  $$('.pchip').forEach(el => el.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', JSON.stringify({ kind: el.dataset.kind, id: el.dataset.id })); e.dataTransfer.effectAllowed = 'copy'; document.body.classList.add('dragging'); }));
  $$('.pchip').forEach(el => el.addEventListener('dragend', () => document.body.classList.remove('dragging')));
  $$('.grid .cell').forEach(el => {
    el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('drop'); });
    el.addEventListener('dragleave', () => el.classList.remove('drop'));
    el.addEventListener('drop', e => {
      e.preventDefault(); el.classList.remove('drop');
      let p; try { p = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
      assign(el.dataset.key, { [p.kind]: p.id });
    });
  });
};

function assign(key, patch, silent) {
  const cur = S.assignments[key] || { driverId: null, assistantId: null, busId: null, note: '' };
  S.assignments[key] = { ...cur, ...patch };
  save();
  const run = findRun(key);
  const is = runIssues(run);
  if (!silent) {
    const e = is.filter(i => i.sev === 'err');
    toast(e.length ? `Saved – ⛔ ${e[0].msg}` : `Saved ${runLabel(run)} · ${fmtDate(run.date)}`);
  }
  render();
}

function openRunEditor(key) {
  const run = findRun(key);
  if (!run) return;
  const opts = (list, kind, labelFn) => {
    const ok = [], bad = [];
    for (const x of list) { const note = candidateNote(run, kind, x.id); (note ? bad : ok).push(`<option value="${x.id}" ${run.a[kind] === x.id ? 'selected' : ''}>${esc(labelFn(x))}${note ? ' — ⚠ ' + esc(note) : ''}</option>`); }
    return `<option value="">— None —</option>${ok.length ? `<optgroup label="Available">${ok.join('')}</optgroup>` : ''}${bad.length ? `<optgroup label="Has a problem">${bad.join('')}</optgroup>` : ''}`;
  };
  const body = `
    <p class="muted">${esc(run.route.name)} · ${fmtTime(run.start)}–${fmtTime(run.end)} · needs ${run.route.minCapacity}+ seats${run.route.needsAssistant ? ' · assistant required' : ''}${run.route.wheelchair ? ' · wheelchair access' : ''}</p>
    <label class="fld"><span>Driver</span><select name="driverId">${opts(S.drivers, 'driverId', d => `${d.name} (${d.licenceClass})`)}</select></label>
    <label class="fld"><span>Bus</span><select name="busId">${opts(S.buses, 'busId', b => `${b.fleetNo} · ${b.rego} · ${b.capacity} seats`)}</select></label>
    <label class="fld"><span>Assistant${run.route.needsAssistant ? ' <em class="req">required</em>' : ' <em class="muted">optional</em>'}</span><select name="assistantId">${opts(S.assistants, 'assistantId', a => a.name)}</select></label>
    <label class="fld"><span>Note</span><input name="note" maxlength="120" value="${esc(run.a.note || '')}" placeholder="e.g. covering for…"></label>
    <label class="check"><input type="checkbox" name="applyWeek"> Apply this crew to every ${esc(run.route.code)} ${esc(run.run.label)} run this week</label>
    <div id="liveIssues" class="live-issues"></div>`;
  const foot = `<button type="button" class="btn btn-danger-ghost" data-act="clearrun">Clear run</button><span class="spacer"></span><button type="button" class="btn" data-close>Cancel</button><button value="save" class="btn btn-primary">Save</button>`;
  openModal(`${runLabel(run)} · ${fmtDate(run.date)}`, body, foot, () => {
    const f = $('#modalForm');
    const patch = { driverId: f.driverId.value || null, busId: f.busId.value || null, assistantId: f.assistantId.value || null, note: f.note.value.trim() };
    if (f.applyWeek.checked) {
      for (const d of weekDates(mondayOf(run.date))) if (run.route.days.includes(dow(d))) S.assignments[`${d}|${run.route.id}|${run.run.id}`] = { ...patch };
      save(); toast(`Applied to all ${runLabel(run)} runs this week`); render();
    } else assign(key, patch);
  });
  const live = () => {
    const f = $('#modalForm');
    const a = { driverId: f.driverId.value || null, busId: f.busId.value || null, assistantId: f.assistantId.value || null };
    $('#liveIssues').innerHTML = issueList(runIssues(run, a));
  };
  $$('#modalBody select').forEach(s => s.addEventListener('change', live));
  live();
}

/* ---------- generic CRUD lists ---------- */
const LIC = ['LR', 'MR', 'HR', 'HC', 'MC'];
const ENT = {
  drivers: {
    title: 'Drivers', one: 'driver', id: 'd',
    fields: [
      { k: 'name', label: 'Full name', req: true }, { k: 'phone', label: 'Mobile', type: 'tel' },
      { k: 'licenceClass', label: 'Licence class', type: 'select', options: LIC, req: true },
      { k: 'authNo', label: 'Driver authorisation no.', req: true, ph: 'DA-000 000' },
      { k: 'authExpiry', label: 'Authorisation expiry', type: 'date', req: true },
      { k: 'status', label: 'Status', type: 'select', options: ['Active', 'On leave', 'Inactive'] },
      { k: 'notes', label: 'Notes', type: 'textarea', wide: true },
    ],
    cols: [
      ['Name', d => `<strong>${esc(d.name)}</strong><div class="muted small">${esc(d.phone)}</div>`],
      ['Licence', d => `<span class="tag">${esc(d.licenceClass)}</span>`],
      ['Authorisation', d => `${esc(d.authNo)}<div>${expiryBadge(d.authExpiry)}</div>`],
      ['Status', d => statusBadge(d.status)],
      ['Runs this week', d => countRuns('driverId', d.id)],
      ['Notes', d => `<span class="muted small">${esc(d.notes)}</span>`],
    ],
  },
  assistants: {
    title: 'Driver assistants', one: 'assistant', id: 'a',
    fields: [
      { k: 'name', label: 'Full name', req: true }, { k: 'phone', label: 'Mobile', type: 'tel' },
      { k: 'blueCardNo', label: 'Blue card no.', ph: 'BC-0000000' },
      { k: 'blueCardExpiry', label: 'Blue card expiry', type: 'date' },
      { k: 'status', label: 'Status', type: 'select', options: ['Active', 'On leave', 'Inactive'] },
      { k: 'notes', label: 'Notes', type: 'textarea', wide: true },
    ],
    cols: [
      ['Name', a => `<strong>${esc(a.name)}</strong><div class="muted small">${esc(a.phone)}</div>`],
      ['Blue card', a => `${esc(a.blueCardNo)}<div>${expiryBadge(a.blueCardExpiry)}</div>`],
      ['Status', a => statusBadge(a.status)],
      ['Runs this week', a => countRuns('assistantId', a.id)],
      ['Notes', a => `<span class="muted small">${esc(a.notes)}</span>`],
    ],
  },
  buses: {
    title: 'Buses', one: 'bus', id: 'b',
    fields: [
      { k: 'fleetNo', label: 'Fleet no.', req: true, ph: 'B11' }, { k: 'rego', label: 'Rego', req: true, ph: '123 ABC' },
      { k: 'make', label: 'Make / model', wide: true },
      { k: 'capacity', label: 'Seats', type: 'number', req: true, min: 1 },
      { k: 'licenceReq', label: 'Licence needed', type: 'select', options: LIC },
      { k: 'wheelchair', label: 'Wheelchair accessible', type: 'checkbox' },
      { k: 'status', label: 'Status', type: 'select', options: ['In service', 'Workshop', 'Out of service'] },
      { k: 'coiExpiry', label: 'Inspection cert. (COI) expiry', type: 'date' },
      { k: 'notes', label: 'Notes', type: 'textarea', wide: true },
    ],
    cols: [
      ['Bus', b => `<strong>${esc(b.fleetNo)}</strong> <span class="rego">${esc(b.rego)}</span><div class="muted small">${esc(b.make)}</div>`],
      ['Seats', b => `${esc(b.capacity)}${b.wheelchair ? ' <span class="tag" title="Wheelchair accessible">♿</span>' : ''}`],
      ['Licence', b => `<span class="tag">${esc(b.licenceReq)}</span>`],
      ['Status', b => `${statusBadge(b.status)}${b.notes && b.status !== 'In service' ? `<div class="muted small">${esc(b.notes)}</div>` : ''}`],
      ['COI', b => expiryBadge(b.coiExpiry)],
      ['Runs this week', b => countRuns('busId', b.id)],
    ],
  },
  routes: {
    title: 'Routes', one: 'route', id: 'r',
    fields: [
      { k: 'code', label: 'Route code', req: true, ph: 'S107' },
      { k: 'type', label: 'Type', type: 'select', options: ['School', 'Charter', 'Shuttle', 'Regular'] },
      { k: 'name', label: 'Route name', req: true, wide: true },
      { k: 'area', label: 'Suburbs / stops', wide: true },
      { k: 'days', label: 'Operates on', type: 'days', wide: true },
      { k: 'run1', label: 'Run 1', type: 'run', wide: true, req: true },
      { k: 'run2', label: 'Run 2 (optional)', type: 'run', wide: true },
      { k: 'minCapacity', label: 'Seats needed', type: 'number', min: 1 },
      { k: 'needsAssistant', label: 'Needs a driver assistant', type: 'checkbox' },
      { k: 'wheelchair', label: 'Needs wheelchair access', type: 'checkbox' },
      { k: 'active', label: 'Active (show in roster)', type: 'checkbox' },
      { k: 'notes', label: 'Notes', type: 'textarea', wide: true },
    ],
    cols: [
      ['Route', r => `<strong>${esc(r.code)}</strong> <span class="tag">${esc(r.type)}</span><div>${esc(r.name)}</div><div class="muted small">${esc(r.area)}</div>`],
      ['Runs', r => r.runs.map(x => `<div><strong>${esc(x.label)}</strong> ${fmtTime(x.start)}–${fmtTime(x.end)}</div>`).join('')],
      ['Days', r => [1, 2, 3, 4, 5, 6, 0].filter(d => r.days.includes(d)).map(d => DAY_NAMES[d]).join(', ')],
      ['Needs', r => `${r.minCapacity}+ seats${r.needsAssistant ? '<div class="tag">Assistant</div>' : ''}${r.wheelchair ? ' <span class="tag">♿</span>' : ''}`],
      ['Status', r => statusBadge(r.active ? 'Active' : 'Inactive')],
    ],
  },
};
function countRuns(kind, id) {
  const n = weekDates(mondayOf(todayStr())).flatMap(runsOn).filter(r => r.a[kind] === id).length;
  return n ? `<span class="count">${n}</span>` : '<span class="muted">0</span>';
}
function listView(type) {
  const E = ENT[type];
  const q = (ui.search[type] || '').toLowerCase();
  const rows = S[type].filter(x => !q || JSON.stringify(x).toLowerCase().includes(q));
  return `
  <section class="page-head">
    <div><h1>${E.title}</h1><p class="muted">${S[type].length} on file${q ? ` · ${rows.length} matching` : ''}</p></div>
    <div class="head-actions"><input type="search" class="search" data-search="${type}" placeholder="Search ${E.title.toLowerCase()}…" value="${esc(ui.search[type] || '')}" aria-label="Search"><button class="btn btn-primary" data-add="${type}">+ Add ${E.one}</button></div>
  </section>
  <div class="card table-card">
    <table class="list">
      <thead><tr>${E.cols.map(c => `<th>${c[0]}</th>`).join('')}<th class="act-col"><span class="sr">Actions</span></th></tr></thead>
      <tbody>${rows.map(x => `<tr>${E.cols.map(c => `<td data-label="${c[0]}">${c[1](x)}</td>`).join('')}<td class="act-col"><button class="btn btn-sm" data-edit="${type}" data-id="${x.id}">Edit</button><button class="btn btn-sm btn-danger-ghost" data-del="${type}" data-id="${x.id}" aria-label="Delete">Delete</button></td></tr>`).join('') || `<tr><td colspan="${E.cols.length + 1}" class="empty">Nothing matches “${esc(q)}”.</td></tr>`}</tbody>
    </table>
  </div>`;
}
['drivers', 'assistants', 'buses', 'routes'].forEach(t => {
  views[t] = () => listView(t);
});

function fieldHTML(f, item) {
  const v = item[f.k];
  const req = f.req ? ' required' : '';
  const lab = `<span>${esc(f.label)}${f.req ? ' <em class="req">*</em>' : ''}</span>`;
  const cls = `fld ${f.wide ? 'wide' : ''}`;
  switch (f.type) {
    case 'select': return `<label class="${cls}">${lab}<select name="${f.k}"${req}>${f.options.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
    case 'textarea': return `<label class="${cls}">${lab}<textarea name="${f.k}" rows="2">${esc(v)}</textarea></label>`;
    case 'checkbox': return `<label class="check ${f.wide ? 'wide' : ''}"><input type="checkbox" name="${f.k}" ${v ? 'checked' : ''}> ${esc(f.label)}</label>`;
    case 'days': return `<fieldset class="${cls} days"><legend>${esc(f.label)}</legend>${[1, 2, 3, 4, 5, 6, 0].map(d => `<label><input type="checkbox" name="day" value="${d}" ${(v || []).includes(d) ? 'checked' : ''}> ${DAY_NAMES[d]}</label>`).join('')}</fieldset>`;
    case 'run': { const r = v || {}; return `<fieldset class="${cls} runf"><legend>${esc(f.label)}${f.req ? ' <em class="req">*</em>' : ''}</legend>
      <label><span>Label</span><input name="${f.k}_label" value="${esc(r.label || '')}" placeholder="AM"${req}></label>
      <label><span>Start</span><input type="time" name="${f.k}_start" value="${esc(r.start || '')}"${req}></label>
      <label><span>Finish</span><input type="time" name="${f.k}_end" value="${esc(r.end || '')}"${req}></label></fieldset>`; }
    default: return `<label class="${cls}">${lab}<input name="${f.k}" type="${f.type || 'text'}" value="${esc(v)}"${f.min ? ` min="${f.min}"` : ''}${f.ph ? ` placeholder="${esc(f.ph)}"` : ''}${req}></label>`;
  }
}
function openEntityForm(type, id) {
  const E = ENT[type];
  let item = id ? S[type].find(x => x.id === id) : null;
  const blank = { drivers: { licenceClass: 'MR', status: 'Active', authExpiry: addDays(todayStr(), 365) }, assistants: { status: 'Active' }, buses: { status: 'In service', licenceReq: 'MR', capacity: 45 }, routes: { type: 'School', days: [1, 2, 3, 4, 5], run1: { label: 'AM', start: '07:00', end: '08:15' }, run2: { label: 'PM', start: '15:00', end: '16:15' }, minCapacity: 33, active: true } }[type];
  const view = item ? { ...item } : { ...blank };
  if (type === 'routes' && item) { view.run1 = item.runs[0]; view.run2 = item.runs[1]; }
  openModal(`${item ? 'Edit' : 'Add'} ${E.one}`, `<div class="form-grid">${E.fields.map(f => fieldHTML(f, view)).join('')}</div><p class="form-err" id="formErr" hidden></p>`,
    `<span class="spacer"></span><button type="button" class="btn" data-close>Cancel</button><button value="save" class="btn btn-primary">${item ? 'Save changes' : 'Add ' + E.one}</button>`,
    () => {
      const f = $('#modalForm');
      const bad = $$('[required]', f).find(el => !el.value.trim());
      const err = $('#formErr');
      if (bad) { err.textContent = 'Please fill in the required fields.'; err.hidden = false; bad.focus(); bad.classList.add('invalid'); return false; }
      const data = {};
      for (const fl of E.fields) {
        if (fl.type === 'checkbox') data[fl.k] = f[fl.k].checked;
        else if (fl.type === 'number') data[fl.k] = Number(f[fl.k].value) || 0;
        else if (fl.type === 'days') data.days = $$('input[name=day]:checked', f).map(c => +c.value);
        else if (fl.type === 'run') { /* handled below */ }
        else data[fl.k] = f[fl.k].value.trim();
      }
      if (type === 'routes') {
        const runs = [];
        for (const k of ['run1', 'run2']) {
          const label = f[k + '_label'].value.trim(), start = f[k + '_start'].value, end = f[k + '_end'].value;
          if (!label && !start && !end) continue;
          if (!label || !start || !end) { err.textContent = `${k === 'run1' ? 'Run 1' : 'Run 2'} needs a label, start and finish time.`; err.hidden = false; return false; }
          if (toMin(end) <= toMin(start)) { err.textContent = 'Finish time must be after start time.'; err.hidden = false; return false; }
          const prev = item?.runs.find(r => r.label === label);
          runs.push({ id: prev ? prev.id : label.toUpperCase().replace(/\W+/g, '') || uid('run'), label, start, end });
        }
        if (runs.length === 2 && runs[0].id === runs[1].id) runs[1].id += '2';
        if (!data.days.length) { err.textContent = 'Pick at least one day.'; err.hidden = false; return false; }
        data.runs = runs;
      }
      const dupKey = { drivers: 'authNo', buses: 'rego', routes: 'code' }[type];
      if (dupKey && S[type].some(x => x.id !== item?.id && x[dupKey].toLowerCase() === data[dupKey].toLowerCase())) { err.textContent = `Another ${E.one} already has that ${dupKey === 'authNo' ? 'authorisation number' : dupKey}.`; err.hidden = false; return false; }
      if (item) Object.assign(item, data); else { item = { id: uid(E.id), ...data }; S[type].push(item); }
      save(); toast(`${id ? 'Saved' : 'Added'} ${data.name || data.fleetNo || data.code}`); render();
    });
}
function deleteEntity(type, id) {
  const E = ENT[type];
  const x = S[type].find(i => i.id === id); if (!x) return;
  const label = x.name || `${x.fleetNo || x.code}`;
  let n = 0;
  const kind = { drivers: 'driverId', assistants: 'assistantId', buses: 'busId' }[type];
  if (kind) n = Object.values(S.assignments).filter(a => a[kind] === id).length;
  else n = Object.keys(S.assignments).filter(k => k.split('|')[1] === id).length;
  if (!confirm(`Delete ${label}?${n ? `\nThis also removes them from ${n} rostered run${n === 1 ? '' : 's'}.` : ''}`)) return;
  S[type] = S[type].filter(i => i.id !== id);
  if (kind) Object.values(S.assignments).forEach(a => { if (a[kind] === id) a[kind] = null; });
  else Object.keys(S.assignments).forEach(k => { if (k.split('|')[1] === id) delete S.assignments[k]; });
  save(); toast(`Deleted ${label}`); render();
  void E;
}

/* Trip log */
function tripRows(from, to) {
  const out = [];
  const now = new Date(), t = todayStr(), nm = nowMin();
  for (let d = from; d <= to; d = addDays(d, 1)) {
    for (const r of runsOn(d)) {
      if (!r.a.driverId && !r.a.busId) continue;
      const dv = driver(r.a.driverId), b = bus(r.a.busId), as = assistant(r.a.assistantId);
      const status = d < t || (d === t && toMin(r.end) <= nm) ? 'Completed' : 'Scheduled';
      out.push({ date: d, start: r.start, end: r.end, route: r.route.code, run: r.run.label, routeName: r.route.name, driver: dv?.name || '', authNo: dv?.authNo || '', licence: dv?.licenceClass || '', fleetNo: b?.fleetNo || '', rego: b?.rego || '', assistant: as?.name || '', note: r.a.note || '', status });
    }
  }
  void now;
  return out;
}
views.trips = () => {
  const mon = mondayOf(todayStr());
  ui.tripFrom = ui.tripFrom || addDays(mon, -7); ui.tripTo = ui.tripTo || todayStr();
  const rows = tripRows(ui.tripFrom, ui.tripTo);
  return `
  <section class="page-head">
    <div><h1>Trip log</h1><p class="muted">Who drove which bus, when – the record a Queensland operator keeps for each trip (driver, authorisation no., vehicle rego, date and times).</p></div>
    <div class="head-actions wrap">
      <label class="inline">From <input type="date" id="tripFrom" value="${ui.tripFrom}"></label>
      <label class="inline">To <input type="date" id="tripTo" value="${ui.tripTo}"></label>
      <button class="btn btn-primary" data-act="csv">Export CSV</button>
    </div>
  </section>
  <div class="card table-card">
    <table class="list trips">
      <thead><tr><th>Date</th><th>Time</th><th>Route</th><th>Driver</th><th>Auth no.</th><th>Bus / rego</th><th>Assistant</th><th>Status</th></tr></thead>
      <tbody>${rows.map(r => `<tr><td data-label="Date">${esc(fmtDate(r.date))}</td><td data-label="Time">${fmtTime(r.start)}–${fmtTime(r.end)}</td><td data-label="Route"><strong>${esc(r.route)} ${esc(r.run)}</strong></td><td data-label="Driver">${esc(r.driver) || '<em class="miss">—</em>'}</td><td data-label="Auth no.">${esc(r.authNo)}</td><td data-label="Bus / rego">${esc(r.fleetNo)} <span class="rego">${esc(r.rego)}</span></td><td data-label="Assistant">${esc(r.assistant)}</td><td data-label="Status"><span class="badge ${r.status === 'Completed' ? 'b-ok' : ''}">${r.status}</span></td></tr>`).join('') || '<tr><td colspan="8" class="empty">No trips in this range.</td></tr>'}</tbody>
    </table>
  </div>
  <p class="muted small">${rows.length} trip${rows.length === 1 ? '' : 's'}. In the real app this log would be locked once a trip is completed and kept for the required retention period.</p>`;
};
function exportCSV() {
  const rows = tripRows(ui.tripFrom, ui.tripTo);
  const head = ['Date', 'Start', 'End', 'Route', 'Run', 'Route name', 'Driver', 'Driver authorisation no.', 'Licence class', 'Fleet no.', 'Bus rego', 'Assistant', 'Note', 'Status'];
  const q = v => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [head, ...rows.map(r => [r.date, r.start, r.end, r.route, r.run, r.routeName, r.driver, r.authNo, r.licence, r.fleetNo, r.rego, r.assistant, r.note, r.status])].map(l => l.map(q).join(',')).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `roster-run-trips-${ui.tripFrom}-to-${ui.tripTo}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast(`Exported ${rows.length} trips`);
}

/* Run sheet */
views.runsheet = () => {
  const d = ui.sheetDate;
  const runs = runsOn(d);
  const iss = issuesForDates([d]).map;
  return `
  <section class="page-head no-print">
    <div><h1>Daily run sheet</h1><p class="muted">A printable sheet for the depot noticeboard or to hand to drivers.</p></div>
    <div class="head-actions"><input type="date" id="sheetDate" value="${d}" aria-label="Date"><button class="btn btn-primary" data-act="print">Print</button></div>
  </section>
  <article class="sheet card">
    <header class="sheet-head"><div><h2>Run sheet – ${esc(fmtDateLong(d))}</h2><p class="muted">Roster Run · Ipswich depot · DEMO DATA</p></div><img src="icon.svg" alt="" width="44" height="44"></header>
    ${runs.length ? `<table class="sheet-table"><thead><tr><th>Time</th><th>Run</th><th>Driver</th><th>Bus</th><th>Assistant</th><th>Odo out / in</th><th>Sign</th></tr></thead><tbody>
    ${runs.map(r => { const dv = driver(r.a.driverId), b = bus(r.a.busId), a = assistant(r.a.assistantId); const is = iss[r.key] || [];
      return `<tr><td class="nowrap"><strong>${fmtTime(r.start)}</strong><br>${fmtTime(r.end)}</td><td><strong>${esc(r.route.code)} ${esc(r.run.label)}</strong><br>${esc(r.route.name)}<div class="small muted">${esc(r.route.area)}</div>${r.a.note ? `<div class="small">Note: ${esc(r.a.note)}</div>` : ''}${is.filter(i => i.sev === 'err').map(i => `<div class="small txt-err">⛔ ${esc(i.msg)}</div>`).join('')}</td>
      <td>${dv ? `${esc(dv.name)}<div class="small muted">Auth ${esc(dv.authNo)}<br>${esc(dv.phone)}</div>` : '<em class="miss">UNFILLED</em>'}</td>
      <td>${b ? `${esc(b.fleetNo)}<div class="small muted">${esc(b.rego)}<br>${b.capacity} seats</div>` : '<em class="miss">UNFILLED</em>'}</td>
      <td>${a ? esc(a.name) : r.route.needsAssistant ? '<em class="miss">NEEDED</em>' : '—'}</td><td class="blank"></td><td class="blank"></td></tr>`; }).join('')}</tbody></table>` : '<p class="empty">No runs on this day.</p>'}
    <footer class="sheet-foot small muted">Printed ${esc(fmtShort(todayStr()))} · Report vehicle defects to the workshop before departure.</footer>
  </article>`;
};

/* ---------- global events ---------- */
document.addEventListener('click', e => {
  const t = e.target;
  const el = s => t.closest(s);
  let x;
  if ((x = el('[data-open]'))) { const key = x.dataset.open; ui.week = mondayOf(key.split('|')[0]); ui.day = key.split('|')[0]; openRunEditor(key); return; }
  if ((x = el('.cell[data-key]'))) { openRunEditor(x.dataset.key); return; }
  if ((x = el('[data-goday]'))) { e.preventDefault(); ui.day = x.dataset.goday; ui.week = mondayOf(ui.day); ui.rosterMode = 'day'; if (location.hash === '#/roster') render(); else location.hash = '#/roster'; return; }
  if ((x = el('[data-week]'))) { const n = +x.dataset.week; ui.week = n === 0 ? mondayOf(todayStr()) : addDays(ui.week, n * 7); ui.day = addDays(ui.week, (dow(ui.day) + 6) % 7); render(); return; }
  if ((x = el('[data-mode]'))) { ui.rosterMode = x.dataset.mode; render(); return; }
  if ((x = el('[data-day]'))) { ui.day = x.dataset.day; render(); return; }
  if ((x = el('[data-pal]'))) { ui.palette = x.dataset.pal; render(); return; }
  if ((x = el('[data-add]'))) { openEntityForm(x.dataset.add); return; }
  if ((x = el('[data-edit]'))) { openEntityForm(x.dataset.edit, x.dataset.id); return; }
  if ((x = el('[data-del]'))) { deleteEntity(x.dataset.del, x.dataset.id); return; }
  if ((x = el('[data-act]'))) {
    const act = x.dataset.act;
    if (act === 'csv') exportCSV();
    if (act === 'print') window.print();
    if (act === 'clearrun') { const f = $('#modalForm'); ['driverId', 'busId', 'assistantId'].forEach(n => { f[n].value = ''; }); f.note.value = ''; f.driverId.dispatchEvent(new Event('change')); }
    if (act === 'copyweek') {
      const prev = addDays(ui.week, -7); let n = 0;
      for (let i = 0; i < 7; i++) { const src = addDays(prev, i), dst = addDays(ui.week, i);
        for (const r of runsOn(dst)) { const a = S.assignments[`${src}|${r.route.id}|${r.run.id}`]; if (a) { S.assignments[r.key] = { ...a, note: '' }; n++; } } }
      save(); toast(n ? `Copied ${n} runs from last week` : 'Nothing to copy from last week'); render();
    }
    if (act === 'clearweek') {
      if (!confirm(`Clear every assignment for the week of ${fmtShort(ui.week)}?`)) return;
      for (const d of weekDates(ui.week)) for (const r of runsOn(d)) delete S.assignments[r.key];
      save(); toast('Week cleared'); render();
    }
  }
});
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.cell[data-key]')) { e.preventDefault(); openRunEditor(e.target.dataset.key); } });
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.search) { ui.search[t.dataset.search] = t.value; const pos = t.selectionStart; render(); const n = $(`[data-search="${t.dataset.search}"]`); n.focus(); n.setSelectionRange(pos, pos); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'tripFrom' && t.value) { ui.tripFrom = t.value; render(); }
  if (t.id === 'tripTo' && t.value) { ui.tripTo = t.value; render(); }
  if (t.id === 'sheetDate' && t.value) { ui.sheetDate = t.value; render(); }
});
$('#resetBtn').addEventListener('click', () => {
  if (!confirm('Reset all demo data? Your changes in this browser will be lost.')) return;
  S = seed(); save(); ui.week = mondayOf(todayStr()); ui.day = todayStr(); ui.search = {}; toast('Demo data reset'); render();
});
let lastW = innerWidth;
addEventListener('resize', () => { if (currentView === 'roster' && !ui.rosterMode && (lastW < 900) !== (innerWidth < 900)) render(); lastW = innerWidth; });

load();
render();
})();
