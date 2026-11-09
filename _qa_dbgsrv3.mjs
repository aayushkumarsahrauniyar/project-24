// Load the page with the extension's own driver directly, no interception, and
// log *why* it leaves. This isolates whether the redirect is caused by the page
// or by the QA harness URL.
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export default async function run(page) {
  const log = [];
  page.on('framenavigated', f => { if (f === page.mainFrame()) log.push('nav ' + f.url()); });
  await page.addInitScript(() => {
    const orig = HTMLAnchorElement.prototype.setAttribute;
    const desc = Object.getOwnPropertyDescriptor(Location.prototype, 'assign');
    window.__log = [];
  });
  await page.goto('http://127.0.0.1:8099/templates.html');
  await page.waitForTimeout(2000);
  return { log, url: page.url() };
}
