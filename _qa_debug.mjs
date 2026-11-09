export default async function run(page) {
  // Installed after goto, so it wins over anything the page did at load time.
  await page.evaluate(() => {
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
    window.firebase = {
      initializeApp() { },
      auth: () => ({ onAuthStateChanged: (cb) => cb({ displayName: 'Admin', email: 'a@b.c' }), signOut: async () => { } }),
      firestore: () => ({
        enablePersistence: () => Promise.resolve(),
        collection: () => ({ orderBy: () => ({ onSnapshot: (ok) => { setTimeout(() => ok({ forEach: (cb) => docs.forEach((d, i) => cb({ id: 'doc' + i, data: () => d })) }), 20); return () => { }; } }) })
      })
    };
    console.log('stub installed, firebase =', typeof firebase);
  });

  await page.goto('http://127.0.0.1:8099/templates.html');

  await page.waitForTimeout(6000);

  return await page.evaluate(() => ({
    hasFirebase: typeof window.firebase,
    url: location.pathname,
    chars: document.body.innerHTML.length,
    title: document.title,
    cards: document.querySelectorAll('.template-card').length,
    container: (document.getElementById('templatesContainer') || {}).innerHTML?.slice(0, 400)
  }));
}
