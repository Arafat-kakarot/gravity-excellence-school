'use strict';

/* =========================================================
   Gravity Excellence School · Study Hub
   Vanilla JS — state persisted in localStorage
   ========================================================= */

const STORE_KEY = 'gravity-excellence-hub-v1';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const PERIODS = [
  { n: 1, time: '08:00 – 08:45' },
  { n: 2, time: '08:50 – 09:35' },
  { n: 3, time: '10:00 – 10:45' },
  { n: 4, time: '10:50 – 11:35' },
  { n: 5, time: '12:15 – 13:00' },
  { n: 6, time: '13:05 – 13:50' }
];

const SPECIALS = {
  library: { name: 'Library', code: 'LB', colour: '#5b8a72' },
  sports: { name: 'Sports', code: 'SP', colour: '#0e9f6e' },
  lab: { name: 'Science Lab', code: 'LB', colour: '#2f855a' },
  selfstudy: { name: 'Self Study', code: 'SS', colour: '#7a8a3a' },
  music: { name: 'Music', code: 'MU', colour: '#b08900' },
  games: { name: 'Games', code: 'GM', colour: '#0f7a43' }
};

/* ---------- helpers ---------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function isoOffset(days) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayISO() {
  return isoOffset(0);
}

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtShort(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function dueLabel(iso) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const d = new Date(iso + 'T00:00:00');
  const diff = Math.round((d - start) / 86400000);
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff === -1) return '1 day overdue';
  if (diff < 0) return Math.abs(diff) + ' days overdue';
  return 'Due in ' + diff + ' days';
}

function dueClass(iso) {
  if (iso < todayISO()) return 'late';
  return iso <= isoOffset(2) ? 'soon' : '';
}

/* ---------- default data ---------- */

function defaultState() {
  return {
    theme: 'light',
    student: {
      name: 'Aarav Sharma',
      grade: 'Grade 9 · Section B',
      roll: 'GES-9B-014',
      attendance: 96,
      classesHeld: 50,
      streak: 12
    },
    weekly: [2.5, 3, 1.5, 2, 0, 1.5, 1],
    subjects: [
      {
        id: 'math', name: 'Mathematics', code: 'MA', teacher: 'Ms. Rhea Kapoor',
        room: 'A-12', colour: '#0f7a43', mastery: 84,
        chapters: [
          { t: 'Real Numbers', done: true },
          { t: 'Polynomials', done: true },
          { t: 'Linear Equations in Two Variables', done: true },
          { t: 'Coordinate Geometry', done: true },
          { t: 'Triangles', done: true },
          { t: 'Statistics', done: false }
        ]
      },
      {
        id: 'physics', name: 'Physics', code: 'PH', teacher: 'Mr. Daniel Okafor',
        room: 'B-04', colour: '#16a34a', mastery: 71,
        chapters: [
          { t: 'Motion & Force', done: true },
          { t: 'Gravitation', done: true },
          { t: 'Work, Energy & Power', done: true },
          { t: 'Sound', done: true },
          { t: 'Light — Reflection & Refraction', done: false },
          { t: 'Electricity', done: false }
        ]
      },
      {
        id: 'chemistry', name: 'Chemistry', code: 'CH', teacher: 'Dr. Nita Rao',
        room: 'B-07', colour: '#f0c000', mastery: 76,
        chapters: [
          { t: 'Matter in Our Surroundings', done: true },
          { t: 'Atoms & Molecules', done: true },
          { t: 'Structure of the Atom', done: true },
          { t: 'Acids, Bases & Salts', done: true },
          { t: 'Metals & Non-metals', done: false },
          { t: 'Carbon & Its Compounds', done: false }
        ]
      },
      {
        id: 'biology', name: 'Biology', code: 'BI', teacher: 'Ms. Sara Lin',
        room: 'C-02', colour: '#0d9488', mastery: 88,
        chapters: [
          { t: 'Cell — The Unit of Life', done: true },
          { t: 'Tissues', done: true },
          { t: 'Diversity in Living Organisms', done: true },
          { t: 'Why Do We Fall Ill', done: true },
          { t: 'Natural Resources', done: true },
          { t: 'Our Environment', done: false }
        ]
      },
      {
        id: 'english', name: 'English', code: 'EN', teacher: 'Mrs. Alina Fernandes',
        room: 'A-08', colour: '#65a30d', mastery: 79,
        chapters: [
          { t: 'The Fun They Had', done: true },
          { t: 'The Sound of Music', done: true },
          { t: 'The Little Girl', done: true },
          { t: 'Rain on the Roof', done: true },
          { t: 'A Truly Beautiful Mind', done: false },
          { t: 'The Snake & the Mirror', done: false }
        ]
      },
      {
        id: 'cs', name: 'Computer Science', code: 'CS', teacher: 'Mr. Vikram Shah',
        room: 'D-01', colour: '#ca8a04', mastery: 92,
        chapters: [
          { t: 'Computer Systems', done: true },
          { t: 'Python Basics', done: true },
          { t: 'Control Flow', done: true },
          { t: 'Lists & Dictionaries', done: true },
          { t: 'Functions', done: false },
          { t: 'Cyber Safety', done: false }
        ]
      },
      {
        id: 'history', name: 'History', code: 'HI', teacher: 'Ms. Priya Nair',
        room: 'A-15', colour: '#15803d', mastery: 68,
        chapters: [
          { t: 'The French Revolution', done: true },
          { t: 'Socialism in Europe', done: true },
          { t: 'Nazism & the Rise of Hitler', done: true },
          { t: 'Forest Society & Colonialism', done: false },
          { t: 'Pastoralists in the Modern World', done: false },
          { t: 'Peasants & Farmers', done: false }
        ]
      },
      {
        id: 'geography', name: 'Geography', code: 'GE', teacher: 'Mr. Arjun Mehta',
        room: 'A-16', colour: '#4d7c0f', mastery: 74,
        chapters: [
          { t: 'India — Size & Location', done: true },
          { t: 'Physical Features of India', done: true },
          { t: 'Drainage', done: true },
          { t: 'Climate', done: false },
          { t: 'Natural Vegetation & Wildlife', done: false },
          { t: 'Population', done: false }
        ]
      }
    ],
    timetable: {
      Mon: [
        { s: 'math', r: 'A-12' }, { s: 'english', r: 'A-08' }, { s: 'physics', r: 'B-04' },
        { s: 'chemistry', r: 'B-07' }, { s: 'biology', r: 'C-02' }, { s: 'sports', r: 'Ground' }
      ],
      Tue: [
        { s: 'cs', r: 'D-01' }, { s: 'math', r: 'A-12' }, { s: 'geography', r: 'A-16' },
        { s: 'history', r: 'A-15' }, { s: 'physics', r: 'B-04' }, { s: 'library', r: 'Library' }
      ],
      Wed: [
        { s: 'biology', r: 'C-02' }, { s: 'chemistry', r: 'B-07' }, { s: 'math', r: 'A-12' },
        { s: 'english', r: 'A-08' }, { s: 'cs', r: 'D-01' }, { s: 'selfstudy', r: 'A-12' }
      ],
      Thu: [
        { s: 'physics', r: 'B-04' }, { s: 'history', r: 'A-15' }, { s: 'geography', r: 'A-16' },
        { s: 'math', r: 'A-12' }, { s: 'english', r: 'A-08' }, { s: 'lab', r: 'B-07' }
      ],
      Fri: [
        { s: 'chemistry', r: 'B-07' }, { s: 'biology', r: 'C-02' }, { s: 'cs', r: 'D-01' },
        { s: 'math', r: 'A-12' }, { s: 'music', r: 'Hall' }, { s: 'games', r: 'Ground' }
      ]
    },
    assignments: [
      { id: 'a1', title: 'Coordinate Geometry — Worksheet 5', subjectId: 'math', due: isoOffset(1), priority: 'high', submitted: false },
      { id: 'a2', title: 'Lab report: Reflection of light', subjectId: 'physics', due: isoOffset(2), priority: 'medium', submitted: false },
      { id: 'a3', title: 'Essay: Causes of the French Revolution', subjectId: 'history', due: isoOffset(4), priority: 'high', submitted: false },
      { id: 'a4', title: 'Python — 10 loop exercises', subjectId: 'cs', due: isoOffset(3), priority: 'low', submitted: false },
      { id: 'a5', title: 'Acids & bases — revision quiz', subjectId: 'chemistry', due: isoOffset(-1), priority: 'high', submitted: false },
      { id: 'a6', title: 'Book review: The Little Girl', subjectId: 'english', due: isoOffset(6), priority: 'medium', submitted: false },
      { id: 'a7', title: 'Map work: Indian river systems', subjectId: 'geography', due: isoOffset(-2), priority: 'low', submitted: true },
      { id: 'a8', title: 'Cell diagram — labelled sketch', subjectId: 'biology', due: isoOffset(5), priority: 'medium', submitted: true }
    ],
    notes: [
      {
        id: 'n1', title: 'Gravitation — formula sheet', subjectId: 'physics', created: isoOffset(-3),
        body: 'F = G · m1 · m2 / r²\nG = 6.67 × 10⁻¹¹ N·m²/kg²\nEscape velocity (Earth) = 11.2 km/s\nWeight = m · g, where g = 9.8 m/s²'
      },
      {
        id: 'n2', title: 'French Revolution timeline', subjectId: 'history', created: isoOffset(-2),
        body: '1789 — Storming of the Bastille\n1791 — Constitutional monarchy\n1793 — Execution of Louis XVI\n1799 — Napoleon takes power'
      },
      {
        id: 'n3', title: 'Python — loop patterns', subjectId: 'cs', created: isoOffset(-1),
        body: 'for i in range(n):\n    print(i)\n\nwhile condition:\n    ...\n\nRemember: break exits the loop, continue skips one turn.'
      }
    ]
  };
}

/* ---------- state ---------- */

let state = loadState();
let taskFilter = 'all';
let toastTimer = null;
let activeSubject = null;

function loadState() {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return Object.assign(base, saved);
    }
  } catch (err) {
    /* storage unavailable — run in-memory */
  }
  return base;
}

function saveState() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (err) {
    /* ignore */
  }
}

/* ---------- lookups ---------- */

function subjectById(id) {
  return state.subjects.find((s) => s.id === id);
}

function subjectName(id) {
  const s = subjectById(id);
  return s ? s.name : 'General';
}

function subjectColour(id) {
  const s = subjectById(id);
  return s ? s.colour : '#5c7067';
}

/* Pick readable text on a coloured chip. */
function readableInk(hex) {
  const c = String(hex).replace('#', '');
  if (c.length !== 6) return '#ffffff';
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? '#2f2500' : '#ffffff';
}

function specialOf(id) {
  return SPECIALS[id] || { name: 'Study Hall', code: 'SH', colour: '#5c7067' };
}

function slotSubject(slot) {
  const s = subjectById(slot.s);
  if (s) return { name: s.name, code: s.code, colour: s.colour };
  return specialOf(slot.s);
}

function chapterStats(subject) {
  const total = subject.chapters.length;
  const done = subject.chapters.filter((c) => c.done).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

function allChapters() {
  return state.subjects.reduce(
    (acc, s) => {
      const c = chapterStats(s);
      acc.done += c.done;
      acc.total += c.total;
      return acc;
    },
    { done: 0, total: 0 }
  );
}

function weeklyHours() {
  return state.weekly.reduce((a, b) => a + b, 0);
}

function pendingTasks() {
  return state.assignments.filter((a) => !a.submitted);
}

/* ---------- shared renderers ---------- */

function masteryRow(subject) {
  const good = subject.mastery >= 85 ? ' good' : '';
  return `
    <div class="mastery-row">
      <div class="mastery-top">
        <span>${esc(subject.name)}</span>
        <b class="${good.trim()}">${subject.mastery}%</b>
      </div>
      <div class="bar"><i style="width:${subject.mastery}%;background:linear-gradient(90deg, ${subject.colour}, ${subject.colour}cc)"></i></div>
    </div>`;
}

/* ---------- views ---------- */

function renderHome() {
  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const first = state.student.name.split(' ')[0];

  $('#todayLabel').textContent = now.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  $('#greeting').innerHTML = `${greet}, <span class="hl">${esc(first)}</span>.`;
  $('#avatar').textContent = initials(state.student.name);

  const chapters = allChapters();
  const pct = chapters.total ? Math.round((chapters.done / chapters.total) * 100) : 0;
  const ring = $('#termRing');
  ring.style.setProperty('--p', pct);
  $('#termRingValue').textContent = pct + '%';

  const pending = pendingTasks();
  const overdue = pending.filter((a) => a.due < todayISO()).length;
  const open = slotToday();

  let lede = `You have ${pending.length} open task${pending.length === 1 ? '' : 's'}`;
  lede += overdue ? ` (${overdue} overdue). ` : '. ';
  if (open.length) {
    const next = open.find((x) => x.status !== 'past');
    lede += next
      ? `Next up: ${next.name} at ${next.start}.`
      : 'Classes are done for today — a good time to revise.';
  } else {
    lede += 'No classes today — enjoy the weekend and catch up on notes.';
  }
  $('#heroLede').textContent = lede;

  renderStats(pending);
  renderTodayClasses();
  renderDueSoon(pending);
  $('#masteryGrid').innerHTML = state.subjects
    .slice()
    .sort((a, b) => b.mastery - a.mastery)
    .slice(0, 6)
    .map(masteryRow)
    .join('');
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

function renderStats(pending) {
  const avg = Math.round(state.subjects.reduce((a, s) => a + s.mastery, 0) / state.subjects.length);
  const hours = weeklyHours();
  const hoursLeft = Math.max(0, 15 - hours);
  const attendance = state.student.attendance;
  const attended = Math.round((attendance / 100) * state.student.classesHeld);

  const cards = [
    {
      label: 'Attendance', value: attendance + '<small>%</small>', delta: '<span class="delta up">▲ 2%</span>',
      note: `${attended} of ${state.student.classesHeld} classes this term`
    },
    {
      label: 'Average score', value: avg + '<small>%</small>', delta: '<span class="delta up">▲ 4%</span>',
      note: 'Across ' + state.subjects.length + ' subjects'
    },
    {
      label: 'Study time', value: hours.toFixed(1) + '<small>h</small>', delta: '<span class="delta flat">This week</span>',
      note: hoursLeft > 0 ? `${hoursLeft.toFixed(1)}h to reach the 15h goal` : 'Weekly goal reached 🎉'
    },
    {
      label: 'Open tasks', value: String(pending.length), delta: '<span class="delta flat">' + dueTodayCount() + ' due today</span>',
      note: 'Study streak: ' + state.student.streak + ' days'
    }
  ];

  $('#stats').innerHTML = cards
    .map(
      (c) => `
      <div class="stat">
        <div class="stat-top"><span>${c.label}</span>${c.delta}</div>
        <div class="stat-value">${c.value}</div>
        <div class="stat-note">${c.note}</div>
      </div>`
    )
    .join('');
}

function dueTodayCount() {
  return pendingTasks().filter((a) => a.due === todayISO()).length;
}

function todayKey() {
  const idx = new Date().getDay(); // Sun = 0
  return idx >= 1 && idx <= 5 ? DAYS[idx - 1] : null;
}

function isPeriodNow(period) {
  const parts = period.time.split('–').map((t) => t.trim());
  if (parts.length !== 2) return false;
  const toMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= toMin(parts[0]) && mins <= toMin(parts[1]);
}

function slotToday() {
  const day = todayKey();
  if (!day) return [];
  const slots = state.timetable[day] || [];
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const toMin = (t) => {
    const [h, m] = t.trim().split(':').map(Number);
    return h * 60 + m;
  };

  return slots.map((slot, i) => {
    const period = PERIODS[i];
    const info = slotSubject(slot);
    const start = period.time.split('–')[0].trim();
    const end = period.time.split('–')[1].trim();
    const status = nowMinutes > toMin(end) ? 'past' : nowMinutes >= toMin(start) ? 'now' : 'next';
    return { ...info, room: slot.r, time: period.time, start, end, status };
  });
}

function renderTodayClasses() {
  const list = $('#todayClasses');
  const day = todayKey();
  $('#todaySub').textContent = day ? day + ' · 6 periods' : 'Weekend';

  if (!day) {
    list.innerHTML = '<li><div class="empty" style="width:100%">No classes today. Enjoy your weekend!</div></li>';
    return;
  }

  const classes = slotToday();
  list.innerHTML = classes
    .map(
      (c) => `
      <li class="${c.status === 'now' ? 'now' : ''}">
        <span class="time">${c.time}</span>
        <span class="dot" style="background:${c.colour}"></span>
        <span class="class-main">
          <span class="class-name">${esc(c.name)}</span>
          <span class="class-room"> · ${esc(c.room)}</span>
        </span>
        ${c.status === 'now' ? '<span class="now-tag">Now</span>' : ''}
      </li>`
    )
    .join('');
}

function renderDueSoon(pending) {
  const list = $('#dueList');
  const items = pending.slice().sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4);

  if (!items.length) {
    list.innerHTML = '<li><div class="empty" style="width:100%">Nothing due. You are all caught up!</div></li>';
    return;
  }

  list.innerHTML = items
    .map((a) => {
      const cls = dueClass(a.due);
      return `
      <li>
        <span class="dot" style="background:${subjectColour(a.subjectId)}"></span>
        <span class="due-main">
          <span class="due-title">${esc(a.title)}</span>
          <span class="due-meta">${esc(subjectName(a.subjectId))} · ${fmtShort(a.due)}</span>
        </span>
        <span class="due-when ${cls}">${dueLabel(a.due)}</span>
      </li>`;
    })
    .join('');
}

function renderSubjects() {
  const sortMode = $('#subjectSort').value || 'az';
  const subjects = state.subjects.slice();

  if (sortMode === 'az') subjects.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortMode === 'progress') subjects.sort((a, b) => chapterStats(a).pct - chapterStats(b).pct);
  else subjects.sort((a, b) => b.mastery - a.mastery);

  $('#subjectGrid').innerHTML = subjects
    .map((s) => {
      const c = chapterStats(s);
      return `
      <button class="subject-card" data-action="open-subject" data-subject="${s.id}">
        <span class="subject-top">
          <span class="badge" style="background:${s.colour};color:${readableInk(s.colour)}">${s.code}</span>
          <span>
            <span class="subject-name" style="display:block">${esc(s.name)}</span>
            <span class="subject-teacher">${esc(s.teacher)} · Room ${esc(s.room)}</span>
          </span>
        </span>
        <span class="bar"><i style="width:${c.pct}%;background:linear-gradient(90deg, ${s.colour}, ${s.colour}cc)"></i></span>
        <span class="subject-foot">
          <span><strong>${c.done}/${c.total}</strong> chapters complete</span>
          <span>${c.pct}%</span>
        </span>
      </button>`;
    })
    .join('');
}

function renderTimetable() {
  const today = todayKey();
  let html = '<thead><tr><th>Period</th>';
  DAYS.forEach((d) => {
    html += `<th class="${d === today ? 'today' : ''}">${d}</th>`;
  });
  html += '</tr></thead><tbody>';

  PERIODS.forEach((period, i) => {
    html += `<tr><td>${period.time}</td>`;
    DAYS.forEach((d) => {
      const slot = (state.timetable[d] || [])[i];
      if (!slot) {
        html += `<td class="${d === today ? 'today' : ''}">—</td>`;
        return;
      }
      const info = slotSubject(slot);
      const current = d === today && isPeriodNow(period);
      html += `
        <td class="${d === today ? 'today' : ''}">
          <div class="slot ${current ? 'current' : ''}">
            <span class="dot" style="background:${info.colour}"></span>
            <div>
              <strong>${esc(info.name)}</strong>
              <span>${esc(slot.r)}${current ? ' · now' : ''}</span>
            </div>
          </div>
        </td>`;
    });
    html += '</tr>';
  });

  html += '</tbody>';
  $('#timetable').innerHTML = html;
}

function renderTasks() {
  const pending = pendingTasks();
  const overdue = pending.filter((a) => a.due < todayISO()).length;
  $('#taskSummary').textContent =
    `${pending.length} open · ${overdue} overdue · ${state.assignments.length - pending.length} submitted`;

  $$('#taskFilters .chip').forEach((chip) => {
    chip.classList.toggle('is-active', chip.dataset.filter === taskFilter);
  });

  const visible = state.assignments
    .filter((a) => {
      if (taskFilter === 'pending') return !a.submitted;
      if (taskFilter === 'submitted') return a.submitted;
      if (taskFilter === 'overdue') return !a.submitted && a.due < todayISO();
      return true;
    })
    .sort((a, b) => {
      if (a.submitted !== b.submitted) return a.submitted ? 1 : -1;
      return a.due.localeCompare(b.due);
    });

  const list = $('#taskList');
  if (!visible.length) {
    list.innerHTML = '<div class="empty">No tasks in this view.</div>';
    return;
  }

  list.innerHTML = visible
    .map((a) => {
      const cls = dueClass(a.due);
      const dueTxt = a.submitted ? 'Submitted' : dueLabel(a.due);
      return `
      <div class="task ${a.submitted ? 'done' : ''}">
        <button class="check" data-action="toggle-task" data-id="${a.id}"
          aria-label="${a.submitted ? 'Mark as pending' : 'Mark as submitted'}"
          aria-pressed="${a.submitted}">✓</button>
        <div class="task-main">
          <div class="task-title">${esc(a.title)}</div>
          <div class="task-meta">
            <span class="dot" style="background:${subjectColour(a.subjectId)}"></span>
            <span>${esc(subjectName(a.subjectId))}</span>
            <span class="sep">|</span>
            <span>${fmtShort(a.due)}</span>
            <span class="pill ${a.priority}">${a.priority}</span>
          </div>
        </div>
        <div class="task-due ${a.submitted ? '' : cls}">${dueTxt}</div>
      </div>`;
    })
    .join('');
}

function renderProgress() {
  const hours = weeklyHours();
  const max = Math.max(...state.weekly, 1);
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon = 0

  $('#studyTotal').textContent = `${hours.toFixed(1)}h / 15h goal`;
  $('#weekChart').innerHTML = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    .map((label, i) => {
      const v = state.weekly[i] || 0;
      const frac = Math.max(v / max, 0.03);
      return `
      <div class="bar-col ${i === todayIdx ? 'today' : ''}" title="${label}: ${v}h">
        <em>${v ? v + 'h' : ''}</em>
        <div class="col ${v ? '' : 'zero'}" style="height:calc((100% - 46px) * ${frac.toFixed(3)})"></div>
        <span>${label}</span>
      </div>`;
    })
    .join('');

  const attendance = state.student.attendance;
  const donut = $('#attendanceDonut');
  donut.style.setProperty('--v', attendance);
  $('#attendanceValue').textContent = attendance + '%';
  $('#attendanceNote').textContent =
    Math.round((attendance / 100) * state.student.classesHeld) + ' of ' + state.student.classesHeld + ' classes attended';

  const chapters = allChapters();
  const syllabusPct = chapters.total ? Math.round((chapters.done / chapters.total) * 100) : 0;
  const goals = [
    {
      label: 'Finish the Term 2 syllabus',
      detail: `${chapters.done} of ${chapters.total} chapters`,
      pct: syllabusPct
    },
    {
      label: 'Study 15 hours this week',
      detail: `${hours.toFixed(1)}h logged`,
      pct: Math.min(100, Math.round((hours / 15) * 100))
    },
    {
      label: 'Read 6 books this term',
      detail: '4 of 6 books',
      pct: 67
    },
    {
      label: 'Keep attendance above 95%',
      detail: attendance + '% attendance',
      pct: Math.min(100, Math.round((attendance / 95) * 100))
    }
  ];

  $('#goalList').innerHTML = goals
    .map(
      (g) => `
      <div class="goal">
        <div class="goal-top"><strong>${g.label}</strong><span>${g.detail}</span></div>
        <div class="bar"><i style="width:${g.pct}%"></i></div>
      </div>`
    )
    .join('');

  $('#streakGrid').innerHTML = streakCells();
  $('#streakLabel').textContent = state.student.streak + ' day streak';

  const mastery = state.subjects.slice().sort((a, b) => b.mastery - a.mastery);
  $('#masteryGridFull').innerHTML = mastery.map(masteryRow).join('');
  const avg = Math.round(mastery.reduce((a, s) => a + s.mastery, 0) / mastery.length);
  const headSub = $('#masteryGridFull').parentElement.querySelector('.card-sub');
  if (headSub) headSub.textContent = 'Average ' + avg + '%';
}

function streakCells() {
  const cells = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  for (let offset = 20; offset >= 0; offset--) {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    const iso = d.toISOString().slice(0, 10);

    // Stable pseudo-pattern so the strip does not flicker between reloads.
    let hash = 0;
    for (let i = 0; i < iso.length; i++) hash = (hash * 31 + iso.charCodeAt(i)) % 997;
    const studied = offset === 0 ? true : hash % 4 !== 0;

    cells.push(
      `<i class="${studied ? 'on' : ''} ${offset === 0 ? 'today' : ''}" title="${iso}${studied ? ' · studied' : ' · no study logged'}"></i>`
    );
  }
  return cells.join('');
}

function renderNotes() {
  const select = $('#noteSubject');
  if (!select.options.length) {
    select.innerHTML = state.subjects
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => `<option value="${s.id}">${esc(s.name)}</option>`)
      .join('');
  }

  const list = $('#noteList');
  if (!state.notes.length) {
    list.innerHTML = '<div class="empty" style="grid-column:1/-1">No notes yet — add your first one above.</div>';
    return;
  }

  list.innerHTML = state.notes
    .map(
      (n) => `
      <article class="note" style="border-left-color:${subjectColour(n.subjectId)}">
        <button class="note-del" data-action="delete-note" data-id="${n.id}" aria-label="Delete note">×</button>
        <h3>${esc(n.title)}</h3>
        <p>${esc(n.body)}</p>
        <div class="note-foot">
          <span>${esc(subjectName(n.subjectId))}</span>
          <span>${fmtShort(n.created)}</span>
        </div>
      </article>`
    )
    .join('');
}

function renderAll() {
  renderHome();
  renderSubjects();
  renderTimetable();
  renderTasks();
  renderProgress();
  renderNotes();
}

/* ---------- subject modal ---------- */

function openSubject(id) {
  const s = subjectById(id);
  if (!s) return;
  activeSubject = id;
  const c = chapterStats(s);

  $('#modalBody').innerHTML = `
    <div class="modal-head">
      <span class="badge" style="background:${s.colour};color:${readableInk(s.colour)}">${s.code}</span>
      <div>
        <h2 id="modalTitle">${esc(s.name)}</h2>
        <p>${esc(s.teacher)} · Room ${esc(s.room)} · Mastery ${s.mastery}%</p>
      </div>
    </div>
    <div class="modal-progress">
      <div class="bar"><i style="width:${c.pct}%;background:${s.colour}"></i></div>
      <strong>${c.done}/${c.total} chapters</strong>
    </div>
    <h3>Chapters</h3>
    <div class="chapter-list">
      ${s.chapters
        .map(
          (ch, i) => `
        <button class="chapter ${ch.done ? 'done' : ''}" data-action="toggle-chapter"
          data-subject="${s.id}" data-index="${i}" aria-pressed="${ch.done}">
          <span class="check">✓</span>
          <span class="chapter-title">${esc(ch.t)}</span>
        </button>`
        )
        .join('')}
    </div>`;

  $('#modal').hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('#modal').hidden = true;
  document.body.style.overflow = '';
  activeSubject = null;
}

/* ---------- actions ---------- */

function toggleChapter(subjectId, index) {
  const s = subjectById(subjectId);
  if (!s || !s.chapters[index]) return;
  s.chapters[index].done = !s.chapters[index].done;
  saveState();
  renderAll();
  openSubject(subjectId);
  toast(s.chapters[index].done ? 'Chapter marked complete' : 'Chapter reopened');
}

function toggleTask(id) {
  const task = state.assignments.find((a) => a.id === id);
  if (!task) return;
  task.submitted = !task.submitted;
  saveState();
  renderAll();
  toast(task.submitted ? 'Nice — task submitted!' : 'Task moved back to pending');
}

function deleteNote(id) {
  state.notes = state.notes.filter((n) => n.id !== id);
  saveState();
  renderNotes();
  toast('Note deleted');
}

/* ---------- toast ---------- */

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 2200);
}

/* ---------- theme ---------- */

const SUN_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/></g></svg>';
const MOON_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" fill="currentColor"/></svg>';

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  const btn = $('#themeBtn');
  btn.innerHTML = state.theme === 'dark' ? SUN_ICON : MOON_ICON;
  btn.setAttribute('aria-label', state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  saveState();
  applyTheme();
}

/* ---------- navigation ---------- */

function setView(name) {
  const target = document.getElementById('view-' + name);
  if (!target) return;

  $$('.view').forEach((v) => {
    v.hidden = v !== target;
  });
  $$('.tab').forEach((t) => {
    t.classList.toggle('is-active', t.dataset.viewLink === name);
  });
  closeSearch();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- search ---------- */

function closeSearch() {
  const box = $('#searchResults');
  box.hidden = true;
  box.innerHTML = '';
}

function renderSearch(query) {
  const q = query.trim().toLowerCase();
  const box = $('#searchResults');

  if (!q) {
    closeSearch();
    return;
  }

  const subjects = state.subjects
    .filter((s) => s.name.toLowerCase().includes(q) || s.teacher.toLowerCase().includes(q))
    .slice(0, 4);
  const tasks = state.assignments
    .filter((a) => a.title.toLowerCase().includes(q))
    .slice(0, 4);

  let html = '';
  subjects.forEach((s) => {
    html += `
      <button class="sr-item" data-action="search-subject" data-subject="${s.id}">
        <span class="badge" style="width:24px;height:24px;border-radius:7px;font-size:9px;background:${s.colour};color:${readableInk(s.colour)}">${s.code}</span>
        <span>${esc(s.name)}</span>
        <small>Subject</small>
      </button>`;
  });
  tasks.forEach((a) => {
    html += `
      <button class="sr-item" data-action="search-task">
        <span class="dot" style="background:${subjectColour(a.subjectId)}"></span>
        <span>${esc(a.title)}</span>
        <small>Task</small>
      </button>`;
  });

  box.innerHTML = html || '<div class="sr-empty">No matches found.</div>';
  box.hidden = false;
}

/* ---------- events ---------- */

document.addEventListener('click', (event) => {
  const viewLink = event.target.closest('[data-view-link]');
  if (viewLink) {
    event.preventDefault();
    setView(viewLink.dataset.viewLink);
    return;
  }

  const actionEl = event.target.closest('[data-action]');
  if (actionEl) {
    const action = actionEl.dataset.action;
    if (action === 'open-subject') {
      openSubject(actionEl.dataset.subject);
    } else if (action === 'toggle-chapter') {
      toggleChapter(actionEl.dataset.subject, Number(actionEl.dataset.index));
    } else if (action === 'toggle-task') {
      toggleTask(actionEl.dataset.id);
    } else if (action === 'delete-note') {
      deleteNote(actionEl.dataset.id);
    } else if (action === 'search-subject') {
      setView('subjects');
      openSubject(actionEl.dataset.subject);
      $('#searchInput').value = '';
      closeSearch();
    } else if (action === 'search-task') {
      setView('assignments');
      $('#searchInput').value = '';
      closeSearch();
    }
    return;
  }

  if (!event.target.closest('.search')) closeSearch();
});

$('#taskFilters').addEventListener('click', (event) => {
  const chip = event.target.closest('.chip');
  if (!chip) return;
  taskFilter = chip.dataset.filter;
  renderTasks();
});

$('#themeBtn').addEventListener('click', toggleTheme);

$('#searchInput').addEventListener('input', (event) => renderSearch(event.target.value));
$('#searchInput').addEventListener('focus', (event) => {
  if (event.target.value.trim()) renderSearch(event.target.value);
});

$('#subjectSort').addEventListener('change', renderSubjects);

$('#noteForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const title = $('#noteTitle').value.trim();
  const body = $('#noteBody').value.trim();
  const subjectId = $('#noteSubject').value;

  if (!title || !body) {
    toast('Add a title and a few words first');
    return;
  }

  state.notes.unshift({
    id: 'n' + Date.now().toString(36),
    title,
    subjectId,
    body,
    created: todayISO()
  });
  saveState();
  renderNotes();
  event.target.reset();
  toast('Note saved');
});

$('#modalClose').addEventListener('click', closeModal);
$('#modal').addEventListener('click', (event) => {
  if (event.target.id === 'modal') closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!$('#modal').hidden) closeModal();
    closeSearch();
  }
});

/* ---------- boot ---------- */

$('#year').textContent = new Date().getFullYear();
applyTheme();
renderAll();
setView('home');
