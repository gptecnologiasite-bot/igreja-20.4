const KEY = 'admac_analytics';

const read = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : { events: [] };
    if (!parsed.events) parsed.events = [];
    return parsed;
  } catch {
    return { events: [] };
  }
};

const write = (data) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    try { window.dispatchEvent(new StorageEvent('storage', { key: KEY })); } catch { void 0 }
  } catch { void 0 }
};

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const monthsBack = (n) => {
  const now = new Date();
  const arr = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    arr.push({ y: d.getFullYear(), m: d.getMonth(), k: monthKey(d), label: d.toLocaleString('pt-BR', { month: 'short' }) });
  }
  return arr;
};

const AnalyticsService = {
  recordPageView(pathname) {
    if (!pathname) return;
    const data = read();
    let user = null;
    try {
      const u = localStorage.getItem('user');
      if (u) user = JSON.parse(u);
    } catch { void 0 }
    let sid = null;
    try {
      sid = localStorage.getItem('currentSessionId') || sessionStorage.getItem('admac_sid');
      if (!sid) {
        sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem('admac_sid', sid);
      }
    } catch { void 0 }
    const meta = {
      ua: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      lang: typeof navigator !== 'undefined' ? navigator.language : undefined,
      ref: typeof document !== 'undefined' ? document.referrer : undefined
    };
    data.events.push({
      t: Date.now(),
      p: pathname,
      sid,
      u: user ? { id: user.id, name: user.name, email: user.email, userType: user.userType, location: user.location } : null,
      m: meta
    });
    if (data.events.length > 5000) data.events = data.events.slice(-5000);
    write(data);
  },
  getMonthlyCounts(months = 12) {
    const data = read();
    const monthsList = monthsBack(months);
    const byMonth = Object.fromEntries(monthsList.map(x => [x.k, 0]));
    for (const e of data.events) {
      const d = new Date(e.t || 0);
      const k = monthKey(d);
      if (k in byMonth) byMonth[k] += 1;
    }
    const series = monthsList.map(x => ({ label: x.label.charAt(0).toUpperCase() + x.label.slice(1), count: byMonth[x.k] }));
    return series;
  },
  getTopPages(limit = 5) {
    const data = read();
    const counts = {};
    for (const e of data.events) {
      counts[e.p] = (counts[e.p] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([p, c]) => ({ path: p, count: c }));
  },
  getReportText() {
    const series = this.getMonthlyCounts(12);
    const total = series.reduce((s, x) => s + x.count, 0);
    const top = this.getTopPages(5);
    const lines = [];
    lines.push('Relatório de Acessos — ADMAC');
    lines.push('');
    lines.push(`Total de visitas (últimos 12 meses): ${total}`);
    lines.push('');
    lines.push('Visitas por mês:');
    for (const s of series) lines.push(`- ${s.label}: ${s.count}`);
    lines.push('');
    lines.push('Páginas mais acessadas:');
    for (const t of top) lines.push(`- ${t.path}: ${t.count}`);
    return lines.join('\n');
  },
  getPeopleSummary() {
    const data = read();
    const map = new Map();
    for (const e of data.events) {
      const key = e?.u?.email || 'anon';
      if (!map.has(key)) {
        map.set(key, {
          email: e?.u?.email || null,
          name: e?.u?.name || 'Anônimo',
          userType: e?.u?.userType || null,
          location: e?.u?.location || null,
          sessions: new Set(),
          pages: new Set(),
          count: 0,
          last: 0
        });
      }
      const rec = map.get(key);
      if (e.sid) rec.sessions.add(e.sid);
      if (e.p) rec.pages.add(e.p);
      rec.count += 1;
      rec.last = Math.max(rec.last, e.t || 0);
    }
    return Array.from(map.values()).map(r => ({
      email: r.email,
      name: r.name,
      userType: r.userType,
      location: r.location,
      sessions: r.sessions.size,
      pages: Array.from(r.pages),
      pagesCount: r.pages.size,
      count: r.count,
      last: r.last
    })).sort((a, b) => (b.count - a.count));
  },
  getPeopleReportText() {
    const people = this.getPeopleSummary();
    const series = this.getMonthlyCounts(12);
    const total = series.reduce((s, x) => s + x.count, 0);
    const top = this.getTopPages(5);
    const lines = [];
    lines.push('Relatório de Acessos — ADMAC');
    lines.push('');
    lines.push(`Total de visitas (últimos 12 meses): ${total}`);
    lines.push('');
    lines.push('Páginas mais acessadas:');
    for (const t of top) lines.push(`- ${t.path}: ${t.count}`);
    lines.push('');
    lines.push('Pessoas que acessaram (agregado por e-mail/sessão):');
    if (people.length === 0) {
      lines.push('- Nenhum dado de acesso registrado.');
    } else {
      for (const p of people) {
        const idTxt = p.email ? `${p.name} <${p.email}>` : p.name;
        const last = p.last ? new Date(p.last).toLocaleString('pt-BR') : '-';
        const locTxt = p.location ? ` | local: ${p.location}` : '';
        lines.push(`- ${idTxt}${locTxt} | visitas: ${p.count} | sessões: ${p.sessions} | páginas únicas: ${p.pagesCount} | último acesso: ${last}`);
      }
    }
    return lines.join('\n');
  },
  getPagesSummary(days = null) {
    const data = read();
    const since = days ? Date.now() - days * 24 * 60 * 60 * 1000 : 0;
    const map = new Map();
    for (const e of data.events) {
      if (since && (e.t || 0) < since) continue;
      const k = e.p || '/';
      if (!map.has(k)) {
        map.set(k, { path: k, count: 0, sessions: new Set(), people: new Set(), last: 0 });
      }
      const rec = map.get(k);
      rec.count += 1;
      if (e.sid) rec.sessions.add(e.sid);
      const pid = e?.u?.email ? e.u.email : (e.sid ? `anon:${e.sid}` : 'anon');
      rec.people.add(pid);
      rec.last = Math.max(rec.last, e.t || 0);
    }
    return Array.from(map.values()).map(r => ({
      path: r.path,
      count: r.count,
      sessions: r.sessions.size,
      people: r.people.size,
      last: r.last
    })).sort((a, b) => b.count - a.count);
  }
};

export default AnalyticsService;
