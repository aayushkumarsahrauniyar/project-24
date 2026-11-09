// Fake Firebase SDK injected before page scripts run, so the templates page
// renders real-looking data offline.
export default async function run(page, ui) {
  const stub = () => {
    const now = Date.now();
    const docs = [
      { scama: 'Instagram Login', country: 'France', createdAt: { toDate: () => new Date(now - 3600e3) } },
      { scama: 'Instagram Login', country: 'France', createdAt: { toDate: () => new Date(now - 7200e3) } },
      { scama: 'Instagram Login', country: 'Algeria', createdAt: { toDate: () => new Date(now - 86e6) } },
      { scama: 'Facebook Boost', country: 'Morocco', createdAt: { toDate: () => new Date(now - 600e3) } },
      { scama: 'Facebook Boost', country: 'Morocco', createdAt: { toDate: () => new Date(now - 900e3) } },
      { scama: 'Netflix Renewal', country: 'Spain', createdAt: { toDate: () => new Date(now - 172e6) } },
      { scama: 'Steam Gift', country: 'Germany', createdAt: { toDate: () => new Date(now - 30 * 864e5) } }
    ];
    const snapshot = { forEach: (cb) => docs.forEach((d, i) => cb({ id: 'doc' + i, data: () => d })) };
    Object.defineProperty(window, 'firebase', { configurable: true, value: {
      initializeApp() { },
      auth: () => ({ onAuthStateChanged: (cb) => cb({ displayName: 'Admin', email: 'admin@test.com' }), signOut: async () => { } }),
      firestore: () => ({
        enablePersistence: () => Promise.resolve(),
        collection: () => ({ orderBy: () => ({ onSnapshot: (ok) => { setTimeout(() => ok(snapshot), 30); return () => { }; } }) })
      })
    } });
  };
  await page.addInitScript(stub);
  await page.route('**/*', async (route) => {
    const req = route.request();
    if (req.resourceType() !== 'script') return route.continue();
    const url = req.url();
    if (url.includes('gstatic.com/firebasejs')) return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    if (url.includes('/js/toast.js') || url.includes('/js/particles.js')) {
      const res = await route.fetch();
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: await res.text() });
    }
    return route.continue();
  });
  await page.goto('http://127.0.0.1:8099/templates.html');
  await page.waitForSelector('.template-card', { timeout: 15000 });
  await page.waitForTimeout(400);

  const cards = await page.$$eval('.template-card', els => els.map(e => ({
    name: e.querySelector('.tc-name')?.textContent.trim(),
    meta: e.querySelector('.tc-meta')?.textContent.trim(),
    badges: [...e.querySelectorAll('.tc-badge')].map(b => b.textContent.trim()),
    href: e.querySelector('.tc-actions a')?.getAttribute('href')
  })));

  const stats = await page.evaluate(() => ({
    templates: document.getElementById('totalTemplates').textContent,
    victims: document.getElementById('totalVictims').textContent,
    top: document.getElementById('topTemplate').textContent,
    today: document.getElementById('todayVictims').textContent,
    visible: document.getElementById('visibleCount').textContent,
    total: document.getElementById('totalCount').textContent
  }));

  // Search filter
  await page.fill('#searchInput', 'facebook');
  await page.waitForTimeout(400);
  const filtered = await page.$$eval('.template-card .tc-name', els => els.map(e => e.textContent.trim()));

  await page.fill('#searchInput', '');
  await page.waitForTimeout(400);

  return { cards, stats, filtered, snapshot: await ui.snapshot() };
}
