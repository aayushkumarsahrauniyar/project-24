export default async function run(page) {
  page.on('response', r => { if (r.url().includes('/js/')) console.log('RESP', r.status(), r.url()); });
  page.on('requestfailed', r => console.log('FAILED', r.url(), r.failure()?.errorText));
  await page.goto('http://127.0.0.1:8099/templates.html');
  await page.waitForTimeout(1500);
  return await page.evaluate(() => ({ h: location.href, t: document.title, c: document.querySelectorAll('script').length }));
}
