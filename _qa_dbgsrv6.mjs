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
    const open = window.open;
    window.open = function (v) { window.__log.push('open=' + v); return open.apply(this, arguments); };
    const submit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function () { window.__log.push('form.submit'); return submit.apply(this, arguments); };
    const click = HTMLElement.prototype.click;
    HTMLElement.prototype.click = function () { window.__log.push('click:' + this.tagName + ':' + (this.getAttribute('href') || this.id || '')); return click.apply(this, arguments); };
    const origSetTimeout = window.setTimeout;
    window.setTimeout = function (fn, ms) {
      if (typeof fn === 'function') {
        const wrapped = function () { window.__log.push('timeout-fired:' + String(fn).slice(0, 200)); return fn.apply(this, arguments); };
        return origSetTimeout(wrapped, ms);
      }
      return origSetTimeout.apply(this, arguments);
    };
  });
  await page.goto('http://127.0.0.1:8099/templates.html');
  await page.waitForTimeout(2000);
  return { log, url: page.url() };
}
