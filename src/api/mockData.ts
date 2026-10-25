import { AppData, ClientCard, ChatConv, ChatMessage, PadDocument } from '../types/crm';

export const DEMO_APP_DATA_FLEXI: AppData = {
  me: 'Сюлейман',
  today: new Date().toISOString().slice(0, 10),
  adm: true,
  ws: '',
  wsr: true,
  perm: { a: true, f: true, d: true, k: true, r: true, boss: true },
  stages: [
    'Ново запитване',
    'Проведена среща',
    'Изпратена оферта',
    'Преговори',
    'Сключен договор',
    'Загубен',
  ],
  closed: ['Загубен'],
  models: [
    'Flexi 85 м² · Едноетажна',
    'Flexi 120 м² · Модерна с веранда',
    'Flexi 145 м² · Двуетажна Фамилна',
    'Flexi 64 м² · Модулна вила',
    'Flexi 180 м² · Лукс Панорама',
  ],
  sources: ['Facebook Ads', 'Instagram', 'Google Търсене', 'Препоръка', 'Изложение Пловдив'],
  types: [
    'Обаждане',
    'Среща в офис',
    'Оглед на парцел',
    'Изготвяне на оферта',
    'Подписване на договор',
    'Започване на работа',
    'Монтаж',
    'Работа на обекта',
    'Приемане',
  ],
  siteT: ['Започване на работа', 'Работа на обекта', 'Приемане', 'Монтаж'],
  reps: ['Сюлейман', 'Елена', 'Мартин', 'Хасан'],
  clients: [
    {
      n: 'Димитър Колев',
      p: '+359 888 412 900',
      c: 'Пловдив',
      s: 'Сключен договор',
      r: 'Сюлейман',
      m: 'Flexi 120 м² · Модерна с веранда',
      b: 78500,
      i: '2026-09-12',
      l: '2026-10-22',
      nx: new Date().toISOString().slice(0, 10),
      maps: 'https://www.google.com/maps?q=42.1354,24.7453',
      x: {
        o: '🔨 Тече',
        w: ['Бригада Хасан', 'Ел-Тех Георги', 'ВиК Стоян'],
        s0: '2026-10-02',
        deal: 78500,
        got: 52000,
        cost: 34200,
        owed: 3800,
        nx: {
          d: new Date().toISOString().slice(0, 10),
          t: '10:30',
          y: 'Монтаж',
          r: 'Сюлейман',
        },
      },
    },
    {
      n: 'Николай и Мария Василеви',
      p: '+359 899 305 118',
      c: 'София',
      s: 'Сключен договор',
      r: 'Сюлейман',
      m: 'Flexi 145 м² · Двуетажна Фамилна',
      b: 96000,
      i: '2026-08-25',
      l: '2026-10-21',
      nx: '2026-10-26',
      maps: 'https://www.google.com/maps?q=42.6541,23.3682',
      x: {
        o: '🔨 Тече',
        w: ['Бригада Мехмед', 'Кров Системс'],
        s0: '2026-09-18',
        deal: 96000,
        got: 70000,
        cost: 48900,
        owed: 2400,
        nx: {
          d: '2026-10-26',
          t: '14:00',
          y: 'Работа на обекта',
          r: 'Мартин',
        },
      },
    },
    {
      n: 'Атанас Георгиев',
      p: '+359 878 650 220',
      c: 'Кърджали',
      s: 'Сключен договор',
      r: 'Сюлейман',
      m: 'Flexi 85 м² · Едноетажна',
      b: 54000,
      i: '2026-09-01',
      l: '2026-10-18',
      nx: '2026-10-28',
      maps: 'https://www.google.com/maps?q=41.6338,25.3777',
      x: {
        o: '⏸️ Пауза',
        w: ['Бригада Хасан'],
        s0: '2026-09-20',
        deal: 54000,
        got: 27000,
        cost: 19500,
        owed: 0,
        nx: {
          d: '2026-10-28',
          t: '11:00',
          y: 'Работа на обекта',
          r: 'Сюлейман',
        },
      },
    },
    {
      n: 'Стефан Тодоров',
      p: '+359 887 912 440',
      c: 'Бургас',
      s: 'Преговори',
      r: 'Елена',
      m: 'Flexi 180 м² · Лукс Панорама',
      b: 124000,
      i: '2026-10-14',
      l: '2026-10-22',
      nx: new Date().toISOString().slice(0, 10),
    },
    {
      n: 'Кристина Иванова',
      p: '+359 885 771 390',
      c: 'Варна',
      s: 'Изпратена оферта',
      r: 'Сюлейман',
      m: 'Flexi 120 м² · Модерна с веранда',
      b: 79000,
      i: '2026-10-08',
      l: '2026-10-12',
      nx: '2026-10-25',
    },
    {
      n: 'Калоян Петков',
      p: '+359 898 114 700',
      c: 'Стара Загора',
      s: 'Проведена среща',
      r: 'Мартин',
      m: 'Flexi 85 м² · Едноетажна',
      b: 56000,
      i: '2026-10-19',
      l: '2026-10-21',
      nx: '2026-10-27',
    },
    {
      n: 'Радослав Христов',
      p: '+359 884 229 815',
      c: 'Хасково',
      s: 'Ново запитване',
      r: 'Сюлейман',
      m: 'Flexi 64 м² · Модулна вила',
      b: 42000,
      i: new Date().toISOString().slice(0, 10),
      l: '',
      nx: '',
    },
    {
      n: 'Ивайло Маринов (Завършен)',
      p: '+359 889 501 200',
      c: 'Асеновград',
      s: 'Сключен договор',
      r: 'Сюлейман',
      m: 'Flexi 120 м² · Модерна с веранда',
      b: 74000,
      i: '2026-06-10',
      l: '2026-10-05',
      nx: '',
      maps: 'https://www.google.com/maps?q=42.0167,24.8667',
      x: {
        o: '✅ Завършен',
        w: ['Бригада Хасан', 'Ел-Тех Георги'],
        s0: '2026-07-01',
        la: '2026-10-05',
        deal: 74000,
        got: 74000,
        cost: 49200,
        owed: 0,
      },
    },
  ],
  tasks: [
    {
      id: 'tsk-1',
      row: 101,
      client: 'Димитър Колев',
      type: 'Монтаж',
      date: new Date().toISOString().slice(0, 10),
      time: '10:30',
      remind: 'Проверка на покривни панели и хидроизолационна мембрана',
      desc: 'Парцел в кв. Прослав, Пловдив – кранът пристига в 09:30.',
      rep: 'Сюлейман',
      phone: '+359 888 412 900',
      city: 'Пловдив',
      maps: 'https://www.google.com/maps?q=42.1354,24.7453',
      status: 'Планирана',
    },
    {
      id: 'tsk-2',
      row: 102,
      client: 'Стефан Тодоров',
      type: 'Подписване на договор',
      date: new Date().toISOString().slice(0, 10),
      time: '14:30',
      remind: 'Финализиране на спецификация за дограма Алуминий Антрацит',
      desc: 'Клиентът иска 30% аванс по банка още утре.',
      rep: 'Сюлейман',
      phone: '+359 887 912 440',
      city: 'Бургас',
      status: 'Планирана',
    },
    {
      id: 'tsk-3',
      row: 103,
      client: 'Кристина Иванова',
      type: 'Обаждане',
      date: '2026-10-22',
      time: '11:00',
      remind: 'Проследяване на изпратена оферта за Flexi 120 м²',
      desc: 'Обсъждане на вариант с подово отопление.',
      rep: 'Сюлейман',
      phone: '+359 885 771 390',
      city: 'Варна',
      status: 'Планирана',
    },
    {
      id: 'tsk-4',
      row: 104,
      client: 'Николай и Мария Василеви',
      type: 'Работа на обекта',
      date: '2026-10-26',
      time: '14:00',
      remind: 'Проба под налягане на ВиК и преглед на Ел. табло',
      desc: 'Драгалевци, София – проверка на етап 4 от чеклиста.',
      rep: 'Мартин',
      phone: '+359 899 305 118',
      city: 'София',
      maps: 'https://www.google.com/maps?q=42.6541,23.3682',
      status: 'Планирана',
    },
    {
      id: 'tsk-5',
      row: 105,
      client: 'Калоян Петков',
      type: 'Оглед на парцел',
      date: '2026-10-27',
      time: '13:00',
      remind: 'Замерване на денивелация и достъп за бетоновоз',
      desc: 'Стара Загора, с. Малка Верея',
      rep: 'Мартин',
      phone: '+359 898 114 700',
      city: 'Стара Загора',
      status: 'Планирана',
    },
  ],
  workers: [
    {
      n: 'Бригада Хасан',
      p: '+359 889 441 200',
      sp: 'Конструкция, Панели, Покрив',
      city: 'Кърджали / Пловдив',
      r: 5,
      tags: '🎯 Качествен, ⚡ Бърз, 👥 Има екип',
      note: 'Основна монтажна бригада за сглобяеми къщи (5 човека + бус с инструменти).',
      owed: 2600,
      paid: 28400,
      jobs: [
        { c: 'Димитър Колев', j: 'Монтаж на конструкция и панели 120м²', d: '2026-10-05', a: 12000, pd: 9400, ow: 2600, jid: 'j-1' },
        { c: 'Ивайло Маринов (Завършен)', j: 'Пълен монтаж Flexi 120м²', d: '2026-07-15', a: 11500, pd: 11500, ow: 0, jid: 'j-2' },
      ],
    },
    {
      n: 'Бригада Мехмед',
      p: '+359 897 210 550',
      sp: 'Фундамент, Фасада, Гипсокартон',
      city: 'София / Пазарджик',
      r: 5,
      tags: '🤝 Надежден, 🕐 Точен, 🧾 С фактура',
      note: 'Специализирани в двуетажни къщи и довършителни работи до ключ.',
      owed: 2400,
      paid: 19600,
      jobs: [
        { c: 'Николай и Мария Василеви', j: 'Конструкция и фасада 145м²', d: '2026-09-20', a: 16000, pd: 13600, ow: 2400, jid: 'j-3' },
      ],
    },
    {
      n: 'Ел-Тех Георги',
      p: '+359 887 602 190',
      sp: 'Електроинсталации и Умен Дом',
      city: 'Пловдив',
      r: 5,
      tags: '🎯 Качествен, 🕐 Точен',
      note: 'Изгражда табла Schneider Electric с пълни протоколи за заземяване.',
      owed: 1200,
      paid: 7800,
      jobs: [
        { c: 'Димитър Колев', j: 'Ел. инсталация и табло 120м²', d: '2026-10-14', a: 3600, pd: 2400, ow: 1200, jid: 'j-1' },
      ],
    },
    {
      n: 'ВиК Стоян',
      p: '+359 898 331 040',
      sp: 'ВиК, Подово отопление, Пречиствателни станции',
      city: 'Пловдив / Стара Загора',
      r: 4,
      tags: '💰 Изгоден, 🤝 Надежден',
      note: 'Всички тръбни разводки с 10г. гаранция след тест под налягане.',
      owed: 0,
      paid: 6400,
      jobs: [
        { c: 'Димитър Колев', j: 'ВиК инсталация и подово', d: '2026-10-12', a: 3200, pd: 3200, ow: 0, jid: 'j-1' },
      ],
    },
  ],
  partners: [
    {
      n: 'Flexi Panel Factory TR',
      p: '+90 532 410 8890',
      t: '🏭 Фабрика',
      w: 'SIP и Сандвич Панели, Метална конструкция',
      city: 'Чорлу / Одрин',
      ct: 'Инж. Кемал Йълмаз',
      r: 5,
      note: 'Производство по чертеж за 14 дни + сертификат CE.',
    },
    {
      n: 'ПрофилГруп Дограма',
      p: '+359 888 990 112',
      t: '🪟 Дограма',
      w: 'Rehau Synego / Троен стъклопакет 4 сезона',
      city: 'Пловдив',
      ct: 'Красимир Костов',
      r: 5,
      note: 'Партньорска отстъпка 18% за всички обекти на Flexi Home.',
    },
    {
      n: 'СтройМат Логистик',
      p: '+359 899 710 400',
      t: '🧱 Строителни материали',
      w: 'Каменна вата Knauf, Гипсокартон, Фасадни мазилки Baumit',
      city: 'София / Пловдив',
      ct: 'Десислава Николова',
      r: 4,
      note: 'Доставка с кран-манипулатор директно на обекта.',
    },
  ],
  owed: [
    { w: 'Бригада Хасан', a: 2600, c: ['Димитър Колев'] },
    { w: 'Бригада Мехмед', a: 2400, c: ['Николай и Мария Василеви'] },
    { w: 'Ел-Тех Георги', a: 1200, c: ['Димитър Колев'] },
  ],
};

export const DEMO_APP_DATA_RENO: AppData = {
  ...DEMO_APP_DATA_FLEXI,
  ws: 'r',
  stages: ['Ново запитване', 'Оглед', 'Изпратена оферта', 'В процес', 'Завършено', 'Загубен'],
  closed: ['Завършено', 'Загубен'],
  models: [
    'Цялостен вътрешен ремонт до ключ',
    'Ремонт на баня и ВиК',
    'Покрив, хидроизолация и фасада',
    'Офис / Търговски обект',
  ],
  clients: [
    {
      n: 'Адв. Петър Симеонов – Пентхаус',
      p: '+359 888 700 310',
      c: 'София',
      s: 'В процес',
      r: 'Сюлейман',
      m: 'Цялостен вътрешен ремонт до ключ',
      b: 48000,
      i: '2026-09-15',
      l: '2026-10-23',
      nx: new Date().toISOString().slice(0, 10),
      maps: 'https://www.google.com/maps?q=42.6812,23.3189',
      x: {
        o: '🔨 Тече',
        w: ['Бригада Мехмед', 'Ел-Тех Георги'],
        s0: '2026-09-25',
        deal: 48000,
        got: 30000,
        cost: 18400,
        owed: 1500,
        nx: {
          d: new Date().toISOString().slice(0, 10),
          t: '11:30',
          y: 'Работа на обекта',
          r: 'Сюлейман',
        },
      },
    },
    {
      n: 'Д-р Гергана Павлова – Клиника',
      p: '+359 887 401 990',
      c: 'Пловдив',
      s: 'Изпратена оферта',
      r: 'Елена',
      m: 'Офис / Търговски обект',
      b: 36500,
      i: '2026-10-12',
      l: '2026-10-20',
      nx: '2026-10-26',
    },
  ],
};

// High-resolution SVG data URIs for realistic Before & After construction comparison
export const BEFORE_SITE_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750">
  <defs>
    <linearGradient id="skyB" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <linearGradient id="groundB" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#78716c"/>
      <stop offset="100%" stop-color="#44403c"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="460" fill="url(#skyB)"/>
  <rect y="460" width="1200" height="290" fill="url(#groundB)"/>
  <!-- Concrete foundation slab & steel frame under construction -->
  <polygon points="180,520 1020,520 1080,620 120,620" fill="#a8a29e" stroke="#57534e" stroke-width="6"/>
  <!-- Steel columns & trusses -->
  <g stroke="#334155" stroke-width="10" fill="none">
    <line x1="230" y1="520" x2="230" y2="250"/>
    <line x1="460" y1="520" x2="460" y2="250"/>
    <line x1="740" y1="520" x2="740" y2="250"/>
    <line x1="970" y1="520" x2="970" y2="250"/>
    <line x1="210" y1="250" x2="990" y2="250"/>
    <polygon points="200,250 600,120 1000,250" stroke-width="12"/>
    <line x1="460" y1="250" x2="600" y2="120"/>
    <line x1="740" y1="250" x2="600" y2="120"/>
    <!-- Cross bracing -->
    <line x1="230" y1="250" x2="460" y2="520" stroke-width="5" stroke-dasharray="12 8"/>
    <line x1="460" y1="250" x2="230" y2="520" stroke-width="5" stroke-dasharray="12 8"/>
  </g>
  <!-- Raw OSB / SIP panels partially installed -->
  <rect x="466" y="256" width="268" height="258" fill="#d6b37c" stroke="#92400e" stroke-width="3" opacity="0.9"/>
  <line x1="600" y1="256" x2="600" y2="514" stroke="#92400e" stroke-width="3"/>
  <!-- Scaffolding -->
  <g stroke="#f59e0b" stroke-width="4">
    <line x1="160" y1="540" x2="160" y2="220"/>
    <line x1="210" y1="540" x2="210" y2="220"/>
    <line x1="160" y1="320" x2="210" y2="320"/>
    <line x1="160" y1="420" x2="210" y2="420"/>
  </g>
  <rect x="40" y="40" width="380" height="58" rx="12" fill="rgba(15,23,42,0.78)"/>
  <text x="64" y="77" fill="#f8fafc" font-family="Inter, sans-serif" font-weight="700" font-size="22">ЕТАП 2 · ГРУБ СТРОЕЖ И КОНСТРУКЦИЯ</text>
</svg>`);

export const AFTER_SITE_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750">
  <defs>
    <linearGradient id="skyA" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#bae6fd"/>
    </linearGradient>
    <linearGradient id="lawnA" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#15803d"/>
      <stop offset="100%" stop-color="#166534"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="460" fill="url(#skyA)"/>
  <circle cx="1040" cy="110" r="52" fill="#fde047" opacity="0.9"/>
  <rect y="460" width="1200" height="290" fill="url(#lawnA)"/>
  <!-- Modern finished deck & patio -->
  <polygon points="180,520 1020,520 1080,620 120,620" fill="#d6d3d1" stroke="#a8a29e" stroke-width="4"/>
  <!-- Finished Modern Flexi Home 120m2 facade -->
  <rect x="230" y="250" width="740" height="270" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>
  <!-- Wood HPL decorative accent cladding -->
  <rect x="230" y="250" width="210" height="270" fill="#9a3412"/>
  <!-- Modern anthracite roof -->
  <polygon points="190,255 600,115 1010,255" fill="#1e293b" stroke="#0f172a" stroke-width="8"/>
  <!-- Floor-to-ceiling panoramic triple-glazed windows -->
  <rect x="480" y="290" width="220" height="230" fill="#0ea5e9" opacity="0.35" stroke="#1e293b" stroke-width="10"/>
  <line x1="590" y1="290" x2="590" y2="520" stroke="#1e293b" stroke-width="8"/>
  <rect x="750" y="290" width="170" height="150" fill="#0ea5e9" opacity="0.35" stroke="#1e293b" stroke-width="10"/>
  <!-- Entrance door with warm LED glow -->
  <rect x="295" y="320" width="90" height="200" fill="#1e293b" stroke="#0f172a" stroke-width="6"/>
  <circle cx="275" cy="345" r="10" fill="#fef08a"/>
  <circle cx="460" cy="345" r="10" fill="#fef08a"/>
  <rect x="760" y="40" width="400" height="58" rx="12" fill="rgba(13,148,136,0.9)"/>
  <text x="785" y="77" fill="#ffffff" font-family="Inter, sans-serif" font-weight="700" font-size="22">ЕТАП 6 · ЗАВЪРШЕНА КЪЩА ДО КЛЮЧ</text>
</svg>`);

export function buildDemoClientCard(name: string, ws: '' | 'r' = ''): ClientCard {
  const data = ws === 'r' ? DEMO_APP_DATA_RENO : DEMO_APP_DATA_FLEXI;
  const c = data.clients.find((x) => x.n.toLowerCase() === name.toLowerCase()) || data.clients[0];
  const tasks = data.tasks.filter((t) => t.client.toLowerCase() === c.n.toLowerCase());
  const deal = c.x?.deal || c.b || 78500;
  const got = c.x?.got ?? Math.round(deal * 0.65);
  const cost = c.x?.cost ?? Math.round(deal * 0.44);
  const owed = c.x?.owed ?? 2600;

  return {
    name: c.n,
    phone: c.p,
    city: c.c,
    stage: c.s,
    rep: c.r,
    model: c.m,
    budget: c.b,
    src: 'Facebook Ads',
    inq: c.i || '2026-09-12',
    last: c.l || '2026-10-22',
    notes:
      'Парцел с готов ПУП и партиди за ток и вода. Избрана дограма Антрацит RAL 7016, фасадна мазилка Силикон + HPL дървесен акцент.',
    maps: c.maps || 'https://www.google.com/maps?q=42.1354,24.7453',
    mediaOk: true,
    tasks,
    costs: {
      deal,
      got,
      cost,
      owed,
      deals: [
        {
          id: 'j-1',
          desc: c.m || 'Изграждане на къща Flexi Home',
          amount: deal,
          date: c.i || '2026-09-15',
          due: '2026-11-30',
          status: c.x?.o === '✅ Завършен' ? 'done' : '',
        },
      ],
      inc: [
        { id: 'inc-1', date: '2026-09-16', amount: Math.round(deal * 0.35), desc: 'Аванс (35%)', method: 'Банка', jid: 'j-1' },
        { id: 'inc-2', date: '2026-10-10', amount: Math.max(0, got - Math.round(deal * 0.35)), desc: 'Междинно плащане – Конструкция', method: 'Банка', jid: 'j-1' },
      ],
      exp: [
        { id: 'exp-1', date: '2026-09-22', amount: Math.round(cost * 0.55), desc: 'Панели и метална конструкция', type: 'Материали', method: 'Банка', jid: 'j-1' },
        { id: 'exp-2', date: '2026-10-08', amount: Math.round(cost * 0.25), desc: 'Дограма троен стъклопакет', type: 'Дограма', method: 'Банка', jid: 'j-1' },
        { id: 'exp-3', date: '2026-10-14', amount: Math.round(cost * 0.20), desc: 'Кран и специализиран транспорт', type: 'Транспорт', method: 'Кеш', jid: 'j-1' },
      ],
      workers: [
        {
          id: 'wk-1',
          name: 'Бригада Хасан',
          job: 'Монтаж на конструкция, панели и покрив',
          agreed: 12000,
          paid: 9400,
          owed: 2600,
          date: '2026-10-05',
          jid: 'j-1',
          pays: [
            { id: 'wp-1', date: '2026-10-06', amount: 5000, method: 'Кеш', note: 'Аванс монтаж' },
            { id: 'wp-2', date: '2026-10-18', amount: 4400, method: 'Банка', note: 'Етап покрив' },
          ],
        },
        {
          id: 'wk-2',
          name: 'Ел-Тех Георги',
          job: 'Електроинсталация и табло',
          agreed: 3600,
          paid: 2400,
          owed: 1200,
          date: '2026-10-14',
          jid: 'j-1',
          pays: [{ id: 'wp-3', date: '2026-10-15', amount: 2400, method: 'Банка', note: 'Кабели и табло' }],
        },
      ],
    },
    photos: [
      {
        id: 'ph-before-1',
        name: '01_Груб_строеж_конструкция.webp',
        thumb: BEFORE_SITE_SVG,
        view: BEFORE_SITE_SVG,
        t: Date.now() - 86400000 * 14,
        beforeAfter: 'before',
        note: 'Монтаж на метална конструкция и SIP панели (Преди)',
      },
      {
        id: 'ph-after-1',
        name: '02_Завършена_фасада_до_ключ.webp',
        thumb: AFTER_SITE_SVG,
        view: AFTER_SITE_SVG,
        t: Date.now() - 86400000 * 1,
        beforeAfter: 'after',
        note: 'Готова фасада с HPL обшивка и панорамна дограма (След)',
      },
    ],
    files: [
      {
        id: 'fl-1',
        name: `Оферта_и_Спецификация_${c.n.replace(/\s+/g, '_')}.pdf`,
        mime: 'application/pdf',
        size: 1482000,
        url: 'https://suleyman-ismail.github.io/flexi-crm/',
        t: Date.now() - 86400000 * 20,
      },
      {
        id: 'fl-2',
        name: `Архитектурен_Чертеж_Разпределение.pdf`,
        mime: 'application/pdf',
        size: 3240000,
        url: 'https://suleyman-ismail.github.io/flexi-crm/',
        t: Date.now() - 86400000 * 18,
      },
    ],
  };
}

export const DEMO_CONVS: ChatConv[] = [
  {
    id: 'g:all',
    n: 'Целият екип · Flexi Home',
    g: true,
    un: 2,
    t: Date.now() - 180000,
    x: 'Кранът за обекта в Пловдив е потвърден за 09:30.',
    f: 'Мартин',
  },
  {
    id: 'Елена',
    n: 'Елена (Продажби)',
    g: false,
    un: 1,
    t: Date.now() - 950000,
    x: 'Стефан Тодоров от Бургас потвърди срещата за договора днес в 14:30!',
    f: 'Елена',
  },
  {
    id: 'Мартин',
    n: 'Мартин (Технически ръководител)',
    g: false,
    un: 0,
    t: Date.now() - 7200000,
    x: 'Качих новите WebP снимки от проверката на фундамента в Драгалевци.',
    f: 'Мартин',
  },
];

export const DEMO_MESSAGES: Record<string, ChatMessage[]> = {
  'g:all': [
    {
      id: 'm-1',
      t: Date.now() - 3600000,
      f: 'Сюлейман',
      x: 'Добро утро! Днес приключваме покривните панели на Димитър Колев в Пловдив.',
      r: 1,
    },
    {
      id: 'm-2',
      t: Date.now() - 1800000,
      f: 'Елена',
      x: 'Клиентът от Бургас (Flexi 180 м²) идва за подписване на договор следобед.',
      r: 1,
    },
    {
      id: 'm-3',
      t: Date.now() - 180000,
      f: 'Мартин',
      x: 'Кранът за обекта в Пловдив е потвърден за 09:30. Чеклистът за Етап 1 е 100% изпълнен.',
      r: 0,
      q: {
        id: 'm-1',
        f: 'Сюлейман',
        x: 'Добро утро! Днес приключваме покривните панели на Димитър Колев в Пловдив.',
      },
    },
  ],
  Елена: [
    {
      id: 'me-1',
      t: Date.now() - 950000,
      f: 'Елена',
      x: 'Стефан Тодоров от Бургас потвърди срещата за договора днес в 14:30!',
      r: 0,
    },
  ],
  Мартин: [
    {
      id: 'mm-1',
      t: Date.now() - 7200000,
      f: 'Мартин',
      x: 'Качих новите WebP снимки от проверката на фундамента в Драгалевци.',
      r: 1,
    },
  ],
};

export function buildDefaultChecklistPad(model: string, ws: '' | 'r' = ''): PadDocument {
  const now = Date.now();
  if (ws === 'r') {
    return {
      v: 2,
      u: now,
      blocks: [
        {
          id: 'chk_st1',
          t: 'check',
          title: `Етап 1 · Оглед, къртене и подготовка · ${model || 'Ремонт'}`,
          col: 'yellow',
          items: [
            { x: 'Оглед на място, точни размери и уточняване на заданието с клиента', d: true },
            { x: 'Защита на общи части, дограма и налични настилки с фолио / велпапе', d: true },
            { x: 'Къртене, демонтаж и извозване на строителни отпадъци', d: true },
            { x: 'Доставка и качване на материали за първи етап', d: false },
          ],
        },
        {
          id: 'chk_st2',
          t: 'check',
          title: 'Етап 2 · Електро, ВиК и груби работи',
          col: 'blue',
          items: [
            { x: 'Преработка / полагане на нови ел. кабели, кутии и табло', d: true },
            { x: 'Преработка на водопровод и канализация + проба под налягане', d: false },
            { x: 'Подова замазка, изравняване на стени и мазилки', d: false },
            { x: 'Хидроизолация в баня / мокри помещения и тераси', d: false },
          ],
        },
        {
          id: 'chk_st3',
          t: 'check',
          title: 'Етап 3 · Довършителни работи и издаване',
          col: 'green',
          items: [
            { x: 'Монтаж на гипсокартон, шпакловка и боядисване (2 ръце)', d: false },
            { x: 'Лепене на фаянс, теракот / гранитогрес и фугиране', d: false },
            { x: 'Монтаж на настилки, врати, санитария и осветление', d: false },
            { x: 'Основно почистване, оглед с клиента и приемо-предавателен протокол', d: false },
          ],
        },
      ],
    };
  }

  return {
    v: 2,
    u: now,
    blocks: [
      {
        id: 'chk_st1',
        t: 'check',
        title: `Етап 1 · Основа и площадка (Фундамент) · ${model || 'Flexi Home'}`,
        col: 'yellow',
        items: [
          { x: 'Нивелация и проверка на размерите и диагоналите на фундамента по проект', d: true },
          { x: 'Проверка на изводите за ВиК (чиста вода и канализация) на точните коти', d: true },
          { x: 'Гофре за захранващ ел. кабел и заземителен контур', d: true },
          { x: 'Осигурен достъп за камион / кран и място за разтоварване на площадката', d: true },
          { x: 'Приемателен протокол и снимки на готовия фундамент преди монтаж', d: true },
        ],
      },
      {
        id: 'chk_st2',
        t: 'check',
        title: 'Етап 2 · Конструкция, панели и покрив',
        col: 'orange',
        items: [
          { x: 'Доставка и разтоварване на конструкция и панели – проверка по опис', d: true },
          { x: 'Полагане на хидроизолационна лента и анкериране на основата към бетона', d: true },
          { x: 'Монтаж на външни и вътрешни стени – нивелиране и крепежи', d: true },
          { x: 'Монтаж на покривна конструкция, мембрана, изолация и покривно покритие', d: false },
          { x: 'Монтаж на улуци, водосточни тръби и покривни обшивки', d: false },
        ],
      },
      {
        id: 'chk_st3',
        t: 'check',
        title: 'Етап 3 · Дограма и външна фасада',
        col: 'blue',
        items: [
          { x: 'Монтаж на прозорци и входна врата (нивелация, монтажна пяна и пароизолационни ленти)', d: false },
          { x: 'Реглаж на крила и механизми + монтаж на подпрозоречни первази', d: false },
          { x: 'Външна топлоизолация / фасадна система, мрежа, шпакловка и мазилка', d: false },
          { x: 'Оформяне на цокъл, HPL акценти и фасадни детайли', d: false },
        ],
      },
      {
        id: 'chk_st4',
        t: 'check',
        title: 'Етап 4 · Електро и ВиК инсталации',
        col: 'teal',
        items: [
          { x: 'Изтегляне на ел. кабели в негорими гофрета и разклонителни кутии по проект', d: false },
          { x: 'Монтаж и тест на главно ел. табло с дефектнотокова защита', d: false },
          { x: 'Изграждане на вътрешен водопровод и 24ч проба под налягане за течове', d: false },
          { x: 'Изграждане на канализация с правилен наклон и ревизии', d: false },
        ],
      },
      {
        id: 'chk_st5',
        t: 'check',
        title: 'Етап 5 · Вътрешни довършителни работи',
        col: 'purple',
        items: [
          { x: 'Вътрешна каменна вата, гипсокартон, фугиране, шпакловка и боядисване', d: false },
          { x: 'Хидроизолация, фаянс/теракот и оборудване на баня и санитарен възел', d: false },
          { x: 'Полагане на ламинат / гранитогрес и первази във всички помещения', d: false },
          { x: 'Монтаж на интериорни врати, ключове, контакти и осветителни тела', d: false },
        ],
      },
      {
        id: 'chk_st6',
        t: 'check',
        title: 'Етап 6 · Приемане и предаване на обекта',
        col: 'green',
        items: [
          { x: 'Почистване на къщата и площадката от строителни отпадъци', d: false },
          { x: 'Пълна проба на ел. табло, контакти, осветление, вода и сифони пред клиента', d: false },
          { x: 'Финални снимки (Преди / След) за архива на клиента', d: false },
          { x: 'Подписване на Приемо-предавателен протокол и Гаранционна карта', d: false },
          { x: 'Окончателно плащане и тържествено предаване на ключовете', d: false },
        ],
      },
    ],
  };
}

export const BEFORE_SVG_DATA_URI = BEFORE_SITE_SVG;
export const AFTER_SVG_DATA_URI = AFTER_SITE_SVG;

export function buildStandardChecklist(model: string, ws: '' | 'r' = '') {
  return buildDefaultChecklistPad(model, ws).blocks;
}

export const MONTHLY_FINANCE_SERIES = [
  { month: 'Май', revenue: 64000, expenses: 41000, profit: 23000 },
  { month: 'Юни', revenue: 82000, expenses: 52000, profit: 30000 },
  { month: 'Юли', revenue: 95000, expenses: 58000, profit: 37000 },
  { month: 'Авг', revenue: 112000, expenses: 67000, profit: 45000 },
  { month: 'Сеп', revenue: 138000, expenses: 79000, profit: 59000 },
  { month: 'Окт', revenue: 164500, expenses: 91200, profit: 73300 },
];

export const CITY_COORDS: Record<string, [number, number]> = {
  софия: [42.6977, 23.3219],
  пловдив: [42.1354, 24.7453],
  варна: [43.2141, 27.9147],
  бургас: [42.5048, 27.4626],
  русе: [43.8356, 25.9657],
  'стара загора': [42.4258, 25.6345],
  кърджали: [41.6338, 25.3777],
  хасково: [41.9344, 25.5556],
  асеновград: [42.0167, 24.8667],
  пазарджик: [42.1887, 24.3332],
  благоевград: [42.0209, 23.0943],
  одрин: [41.6771, 26.5557],
  истанбул: [41.0082, 28.9784],
};

