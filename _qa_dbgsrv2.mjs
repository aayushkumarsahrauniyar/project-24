export default async function run(page) {
  await page.addInitScript(() => {
    window.__log = [];
    const orig = window.addEventListener;
    window.addEventListener = function (type, fn, opts) {
      if (type === 'beforeunload' || type === 'unload' || type === 'pagehide') {
        window.__log.push('listener:' + type + ':' + String(fn).slice(0, 200));
      }
      return orig.call(this, type, fn, opts);
    };
    const desc = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
    Object.defineProperty(Location.prototype, 'href', {
      configurable: true,
      get() { return desc.get.call(this); },
      set(v) { window.__log.push('href=' + v + ' :: ' + new Error().stack.split('\n').slice(1, 4).join(' | ')); desc.set.call(this, v); }
    });
  });
  await page.goto('http://127.0.0.1:8099/templates.html');
  await page.waitForTimeout(1500);
  return await page.evaluate(() => ({ log: window.__log, h: location.href }));
}
