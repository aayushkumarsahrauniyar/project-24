export default async function run(page) {
  const log = [];
  page.on('framenavigated', f => { if (f === page.mainFrame()) log.push('nav ' + f.url()); });
  await page.addInitScript(() => {
    window.__log = [];
    const orig = window.addEventListener;
    window.addEventListener = function (type, fn, opts) {
      if (type === 'beforeunload' || type === 'unload' || type === 'pagehide') {
        window.__log.push('listener:' + type + ':' + String(fn).slice(0, 300));
      }
      return orig.call(this, type, fn, opts);
    };
    const desc = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
    Object.defineProperty(Location.prototype, 'href', {
      configurable: true,
      get() { return desc.get.call(this); },
      set(v) { window.__log.push('href=' + v + ' :: ' + new Error().stack.split('\n').slice(1, 5).join(' | ')); desc.set.call(this, v); }
    });
    const assign = Location.prototype.assign;
    Location.prototype.assign = function (v) { window.__log.push('assign=' + v + ' :: ' + new Error().stack.split('\n').slice(1, 5).join(' | ')); return assign.call(this, v); };
    const replace = Location.prototype.replace;
    Location.prototype.replace = function (v) { window.__log.push('replace=' + v + ' :: ' + new Error().stack.split('\n').slice(1, 5).join(' | ')); return replace.call(this, v); };
  });
  await page.goto('http://127.0.0.1:8099/templates.html');
  await page.waitForTimeout(2000);
  return { log, url: page.url() };
}
