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
    const origSetInterval = window.setInterval;
    window.setInterval = function (fn, ms) {
      if (typeof fn === 'function') {
        const wrapped = function () { window.__log.push('interval-fired:' + String(fn).slice(0, 200)); return fn.apply(this, arguments); };
        return origSetInterval(wrapped, ms);
      }
      return origSetInterval.apply(this, arguments);
    };
    const origRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function (fn) {
      const wrapped = function (t) { window.__log.push('raf-fired:' + String(fn).slice(0, 200)); return fn.call(this, t); };
      return origRAF(wrapped);
    };
    const origAdd = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, fn, opts) {
      if (type === 'load' || type === 'DOMContentLoaded' || type === 'readystatechange') {
        window.__log.push('listener:' + type + ':' + String(fn).slice(0, 200));
      }
      return origAdd.call(this, type, fn, opts);
    };
    const origFetch = window.fetch;
    window.fetch = function (u) { window.__log.push('fetch:' + u); return origFetch.apply(this, arguments); };
    const origXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (m, u) { window.__log.push('xhr:' + u); return origXHR.apply(this, arguments); };
    const origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function () { window.__log.push('xhr-send'); return origSend.apply(this, arguments); };
    const origBeacon = navigator.sendBeacon;
    if (origBeacon) navigator.sendBeacon = function (u) { window.__log.push('beacon:' + u); return origBeacon.apply(this, arguments); };
    const origWS = window.WebSocket;
    window.WebSocket = function (u) { window.__log.push('ws:' + u); return new origWS(u); };
    const origES = window.EventSource;
    if (origES) window.EventSource = function (u) { window.__log.push('es:' + u); return new origES(u); };
    const origWorker = window.Worker;
    if (origWorker) window.Worker = function (u) { window.__log.push('worker:' + u); return new origWorker(u); };
    const origSW = navigator.serviceWorker;
    if (origSW) {
      const reg = origSW.register.bind(origSW);
      origSW.register = function (u) { window.__log.push('sw:' + u); return reg(u); };
    }
    const origPush = history.pushState;
    history.pushState = function (a, b, u) { window.__log.push('pushState:' + u); return origPush.apply(this, arguments); };
    const origRep = history.replaceState;
    history.replaceState = function (a, b, u) { window.__log.push('replaceState:' + u); return origRep.apply(this, arguments); };
    const origGo = history.go;
    history.go = function (n) { window.__log.push('history.go:' + n); return origGo.apply(this, arguments); };
    const origBack = history.back;
    history.back = function () { window.__log.push('history.back'); return origBack.apply(this, arguments); };
    const origForward = history.forward;
    history.forward = function () { window.__log.push('history.forward'); return origForward.apply(this, arguments); };
    const origPost = window.postMessage;
    window.postMessage = function (m) { window.__log.push('postMessage:' + String(m).slice(0, 100)); return origPost.apply(this, arguments); };
    const origAlert = window.alert;
    window.alert = function (m) { window.__log.push('alert:' + m); return origAlert.apply(this, arguments); };
    const origConfirm = window.confirm;
    window.confirm = function (m) { window.__log.push('confirm:' + m); return origConfirm.apply(this, arguments); };
    const origPrompt = window.prompt;
    window.prompt = function (m) { window.__log.push('prompt:' + m); return origPrompt.apply(this, arguments); };
    const origPrint = window.print;
    window.print = function () { window.__log.push('print'); return origPrint.apply(this, arguments); };
    const origClose = window.close;
    window.close = function () { window.__log.push('close'); return origClose.apply(this, arguments); };
    const origStop = window.stop;
    window.stop = function () { window.__log.push('stop'); return origStop.apply(this, arguments); };
    const origFocus = window.focus;
    window.focus = function () { window.__log.push('focus'); return origFocus.apply(this, arguments); };
    const origBlur = window.blur;
    window.blur = function () { window.__log.push('blur'); return origBlur.apply(this, arguments); };
    const origScrollTo = window.scrollTo;
    window.scrollTo = function () { window.__log.push('scrollTo'); return origScrollTo.apply(this, arguments); };
    const origScrollBy = window.scrollBy;
    window.scrollBy = function () { window.__log.push('scrollBy'); return origScrollBy.apply(this, arguments); };
    const origScroll = window.scroll;
    window.scroll = function () { window.__log.push('scroll'); return origScroll.apply(this, arguments); };
    const origScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function () { window.__log.push('scrollIntoView'); return origScrollIntoView.apply(this, arguments); };
    const origFocusEl = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function () { window.__log.push('el.focus'); return origFocusEl.apply(this, arguments); };
    const origBlurEl = HTMLElement.prototype.blur;
    HTMLElement.prototype.blur = function () { window.__log.push('el.blur'); return origBlurEl.apply(this, arguments); };
    const origRemove = Element.prototype.remove;
    Element.prototype.remove = function () { window.__log.push('el.remove:' + this.tagName); return origRemove.apply(this, arguments); };
    const origAppend = Element.prototype.appendChild;
    Element.prototype.appendChild = function (n) { window.__log.push('appendChild:' + (n.tagName || n.nodeName)); return origAppend.call(this, n); };
    const origInsert = Element.prototype.insertBefore;
    Element.prototype.insertBefore = function (n) { window.__log.push('insertBefore:' + (n.tagName || n.nodeName)); return origInsert.apply(this, arguments); };
    const origReplaceChild = Element.prototype.replaceChild;
    Element.prototype.replaceChild = function (n) { window.__log.push('replaceChild:' + (n.tagName || n.nodeName)); return origReplaceChild.apply(this, arguments); };
    const origSetAttr = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (k, v) { if (k === 'src' || k === 'href') window.__log.push('setAttribute:' + k + '=' + v); return origSetAttr.apply(this, arguments); };
    const origInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    Object.defineProperty(Element.prototype, 'innerHTML', {
      configurable: true,
      get() { return origInnerHTML.get.call(this); },
      set(v) { window.__log.push('innerHTML:' + this.tagName + ':' + String(v).slice(0, 80)); return origInnerHTML.set.call(this, v); }
    });
    const origTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
    Object.defineProperty(Node.prototype, 'textContent', {
      configurable: true,
      get() { return origTextContent.get.call(this); },
      set(v) { window.__log.push('textContent:' + this.nodeName + ':' + String(v).slice(0, 60)); return origTextContent.set.call(this, v); }
    });
    const origSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
    Object.defineProperty(HTMLScriptElement.prototype, 'src', {
      configurable: true,
      get() { return origSrc.get.call(this); },
      set(v) { window.__log.push('script.src=' + v); return origSrc.set.call(this, v); }
    });
    const origHrefA = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'href');
    Object.defineProperty(HTMLAnchorElement.prototype, 'href', {
      configurable: true,
      get() { return origHrefA.get.call(this); },
      set(v) { window.__log.push('a.href=' + v); return origHrefA.set.call(this, v); }
    });
    const origFormAction = Object.getOwnPropertyDescriptor(HTMLFormElement.prototype, 'action');
    Object.defineProperty(HTMLFormElement.prototype, 'action', {
      configurable: true,
      get() { return origFormAction.get.call(this); },
      set(v) { window.__log.push('form.action=' + v); return origFormAction.set.call(this, v); }
    });
    const origRequestSubmit = HTMLFormElement.prototype.requestSubmit;
    if (origRequestSubmit) HTMLFormElement.prototype.requestSubmit = function () { window.__log.push('form.requestSubmit'); return origRequestSubmit.apply(this, arguments); };
    const origSubmitEvent = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function () { window.__log.push('form.submit2'); return origSubmitEvent.apply(this, arguments); };
    const origDispatch = EventTarget.prototype.dispatchEvent;
    EventTarget.prototype.dispatchEvent = function e.type && /submit|click|load|unload|beforeunload|pagehide/.test(e.type)) window.__log.push('dispatch:' + e.type + ':' + (this.tagName || this.nodeName)); return origDispatch.apply(this, arguments);
};
const origCreateElement = document.createElement;
document.createElement = function (t) { if (t === 'script' || t === 'iframe' || t === 'form') window.__log.push('createElement:' + t); return origCreateElement.apply(this, arguments); };
const origWrite = document.write;
document.write = function (s) { window.__log.push('document.write:' + String(s).slice(0, 100)); return origWrite.apply(this, arguments); };
const origOpenDoc = document.open;
document.open = function () { window.__log.push('document.open'); return origOpenDoc.apply(this, arguments); };
const origCloseDoc = document.close;
document.close = function () { window.__log.push('document.close'); return origCloseDoc.apply(this, arguments); };
const origCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
Object.defineProperty(Document.prototype, 'cookie', {
  configurable: true,
  get() { return origCookie.get.call(this); },
  set(v) { window.__log.push('cookie=' + v); return origCookie.set.call(this, v); }
});
const origLS = Storage.prototype.setItem;
Storage.prototype.setItem = function (k, v) { window.__log.push('setItem:' + k + '=' + String(v).slice(0, 60)); return origLS.apply(this, arguments); };
const origSS = Storage.prototype.removeItem;
Storage.prototype.removeItem = function (k) { window.__log.push('removeItem:' + k); return origSS.apply(this, arguments); };
const origClear = Storage.prototype.clear;
Storage.prototype.clear = function () { window.__log.push('storage.clear'); return origClear.apply(this, arguments); };
const origIDB = window.indexedDB;
if (origIDB) {
  const origOpenIDB = origIDB.open.bind(origIDB);
  origIDB.open = function (n) { window.__log.push('idb.open:' + n); return origOpenIDB.apply(this, arguments); };
}
const origCaches = window.caches;
if (origCaches) {
  const origOpenC = origCaches.open.bind(origCaches);
  origCaches.open = function (n) { window.__log.push('caches.open:' + n); return origOpenC.apply(this, arguments); };
}
const origMatchMedia = window.matchMedia;
window.matchMedia = function (q) { window.__log.push('matchMedia:' + q); return origMatchMedia.apply(this, arguments); };
const origGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = function () { return origGetComputedStyle.apply(this, arguments); };
const origResize = window.resizeTo;
window.resizeTo = function () { window.__log.push('resizeTo'); return origResize.apply(this, arguments); };
const origMoveTo = window.moveTo;
window.moveTo = function () { window.__log.push('moveTo'); return origMoveTo.apply(this, arguments); };
const origNavigate = window.navigation;
if (origNavigate) {
  try {
    origNavigate.addEventListener('navigate', (e) => { window.__log.push('navigation-event:' + e.destination.url); });
  } catch (e) { }
}
const origOnError = window.onerror;
window.onerror = function (m, s, l, c, e) { window.__log.push('onerror:' + m); return origOnError ? origOnError.apply(this, arguments) : false; };
const origUnhandled = window.onunhandledrejection;
window.onunhandledrejection = function (e) { window.__log.push('unhandledrejection:' + (e.reason && e.reason.message)); return origUnhandled ? origUnhandled.apply(this, arguments) : false; };
const origOnLoad = window.onload;
window.onload = function () { window.__log.push('window.onload'); return origOnLoad ? origOnLoad.apply(this, arguments) : undefined; };
const origOnBeforeUnload = window.onbeforeunload;
window.onbeforeunload = function () { window.__log.push('window.onbeforeunload'); return origOnBeforeUnload ? origOnBeforeUnload.apply(this, arguments) : undefined; };
const origOnUnload = window.onunload;
window.onunload = function () { window.__log.push('window.onunload'); return origOnUnload ? origOnUnload.apply(this, arguments) : undefined; };
const origOnPageHide = window.onpagehide;
window.onpagehide = function () { window.__log.push('window.onpagehide'); return origOnPageHide ? origOnPageHide.apply(this, arguments) : undefined; };
const origOnHashChange = window.onhashchange;
window.onhashchange = function () { window.__log.push('window.onhashchange'); return origOnHashChange ? origOnHashChange.apply(this, arguments) : undefined; };
const origOnPopState = window.onpopstate;
window.onpopstate = function () { window.__log.push('window.onpopstate'); return origOnPopState ? origOnPopState.apply(this, arguments) : undefined; };
const origOnMessage = window.onmessage;
window.onmessage = function () { window.__log.push('window.onmessage'); return origOnMessage ? origOnMessage.apply(this, arguments) : undefined; };
const origOnStorage = window.onstorage;
window.onstorage = function () { window.__log.push('window.onstorage'); return origOnStorage ? origOnStorage.apply(this, arguments) : undefined; };
const origOnVisibility = document.onvisibilitychange;
document.onvisibilitychange = function () { window.__log.push('document.onvisibilitychange'); return origOnVisibility ? origOnVisibility.apply(this, arguments) : undefined; };
const origOnReadyState = document.onreadystatechange;
document.onreadystatechange = function () { window.__log.push('document.onreadystatechange:' + document.readyState); return origOnReadyState ? origOnReadyState.apply(this, arguments) : undefined; };
const origOnDOMContent = document.onDOMContentLoaded;
document.onDOMContentLoaded = function () { window.__log.push('document.onDOMContentLoaded'); return origOnDOMContent ? origOnDOMContent.apply(this, arguments) : undefined; };
const origOnClick = document.onclick;
document.onclick = function () { window.__log.push('document.onclick'); return origOnClick ? origOnClick.apply(this, arguments) : undefined; };
const origOnSubmit = document.onsubmit;
document.onsubmit = function () { window.__log.push('document.onsubmit'); return origOnSubmit ? origOnSubmit.apply(this, arguments) : undefined; };
const origOnKeydown = document.onkeydown;
document.onkeydown = function () { window.__log.push('document.onkeydown'); return origOnKeydown ? origOnKeydown.apply(this, arguments) : undefined; };
const origOnKeyup = document.onkeyup;
document.onkeyup = function () { window.__log.push('document.onkeyup'); return origOnKeyup ? origOnKeyup.apply(this, arguments) : undefined; };
const origOnKeypress = document.onkeypress;
document.onkeypress = function () { window.__log.push('document.onkeypress'); return origOnKeypress ? origOnKeypress.apply(this, arguments) : undefined; };
const origOnInput = document.oninput;
document.oninput = function () { window.__log.push('document.oninput'); return origOnInput ? origOnInput.apply(this, arguments) : undefined; };
const origOnChange = document.onchange;
document.onchange = function () { window.__log.push('document.onchange'); return origOnChange ? origOnChange.apply(this, arguments) : undefined; };
const origOnFocus = document.onfocus;
document.onfocus = function () { window.__log.push('document.onfocus'); return origOnFocus ? origOnFocus.apply(this, arguments) : undefined; };
const origOnBlur = document.onblur;
document.onblur = function () { window.__log.push('document.onblur'); return origOnBlur ? origOnBlur.apply(this, arguments) : undefined; };
const origOnScroll = document.onscroll;
document.onscroll = function () { window.__log.push('document.onscroll'); return origOnScroll ? origOnScroll.apply(this, arguments) : undefined; };
const origOnResize = window.onresize;
window.onresize = function () { window.__log.push('window.onresize'); return origOnResize ? origOnResize.apply(this, arguments) : undefined; };
const origOnError2 = window.onerror;
window.onerror = function () { window.__log.push('window.onerror2'); return origOnError2 ? origOnError2.apply(this, arguments) : false; };
const origOnRejection = window.onunhandledrejection;
window.onunhandledrejection = function () { window.__log.push('window.onunhandledrejection2'); return origOnRejection ? origOnRejection.apply(this, arguments) : false; };
const origOnLoad2 = window.onload;
window.onload = function () { window.__log.push('window.onload2'); return origOnLoad2 ? origOnLoad2.apply(this, arguments) : undefined; };
const origOnBeforeUnload2 = window.onbeforeunload;
window.onbeforeunload = function () { window.__log.push('window.onbeforeunload2'); return origOnBeforeUnload2 ? origOnBeforeUnload2.apply(this, arguments) : undefined; };
const origOnUnload2 = window.onunload;
window.onunload = function () { window.__log.push('window.onunload2'); return origOnUnload2 ? origOnUnload2.apply(this, arguments) : undefined; };
const origOnPageHide2 = window.onpagehide;
window.onpagehide = function () { window.__log.push('window.onpagehide2'); return origOnPageHide2 ? origOnPageHide2.apply(this, arguments) : undefined; };
const origOnHashChange2 = window.onhashchange;
window.onhashchange = function () { window.__log.push('window.onhashchange2'); return origOnHashChange2 ? origOnHashChange2.apply(this, arguments) : undefined; };
const origOnPopState2 = window.onpopstate;
window.onpopstate = function () { window.__log.push('window.onpopstate2'); return origOnPopState2 ? origOnPopState2.apply(this, arguments) : undefined; };
const origOnMessage2 = window.onmessage;
window.onmessage = function () { window.__log.push('window.onmessage2'); return origOnMessage2 ? origOnMessage2.apply(this, arguments) : undefined; };
const origOnStorage2 = window.onstorage;
window.onstorage = function () { window.__log.push('window.onstorage2'); return origOnStorage2 ? origOnStorage2.apply(this, arguments) : undefined; };
const origOnVisibility2 = document.onvisibilitychange;
document.onvisibilitychange = function () { window.__log.push('document.onvisibilitychange2'); return origOnVisibility2 ? origOnVisibility2.apply(this, arguments) : undefined; };
const origOnReadyState2 = document.onreadystatechange;
document.onreadystatechange = function () { window.__log.push('document.onreadystatechange2:' + document.readyState); return origOnReadyState2 ? origOnReadyState2.apply(this, arguments) : undefined; };
const origOnDOMContent2 = document.onDOMContentLoaded;
document.onDOMContentLoaded = function () { window.__log.push('document.onDOMContentLoaded2'); return origOnDOMContent2 ? origOnDOMContent2.apply(this, arguments) : undefined; };
const origOnClick2 = document.onclick;
document.onclick = function () { window.__log.push('document.onclick2'); return origOnClick2 ? origOnClick2.apply(this, arguments) : undefined; };
const origOnSubmit2 = document.onsubmit;
document.onsubmit = function () { window.__log.push('document.onsubmit2'); return origOnSubmit2 ? origOnSubmit2.apply(this, arguments) : undefined; };
const origOnKeydown2 = document.onkeydown;
document.onkeydown = function () { window.__log.push('document.onkeydown2'); return origOnKeydown2 ? origOnKeydown2.apply(this, arguments) : undefined; };
const origOnKeyup2 = document.onkeyup;
document.onkeyup = function () { window.__log.push('document.onkeyup2'); return origOnKeyup2 ? origOnKeyup2.apply(this, arguments) : undefined; };
const origOnKeypress2 = document.onkeypress;
document.onkeypress = function () { window.__log.push('document.onkeypress2'); return origOnKeypress2 ? origOnKeypress2.apply(this, arguments) : undefined; };
const origOnInput2 = document.oninput;
document.oninput = function () { window.__log.push('document.oninput2'); return origOnInput2 ? origOnInput2.apply(this, arguments) : undefined; };
const origOnChange2 = document.onchange;
document.onchange = function () { window.__log.push('document.onchange2'); return origOnChange2 ? origOnChange2.apply(this, arguments) : undefined; };
const origOnFocus2 = document.onfocus;
document.onfocus = function () { window.__log.push('document.onfocus2'); return origOnFocus2 ? origOnFocus2.apply(this, arguments) : undefined; };
const origOnBlur2 = document.onblur;
document.onblur = function () { window.__log.push('document.onblur2'); return origOnBlur2 ? origOnBlur2.apply(this, arguments) : undefined; };
const origOnScroll2 = document.onscroll;
document.onscroll = function () { window.__log.push('document.onscroll2'); return origOnScroll2 ? origOnScroll2.apply(this, arguments) : undefined; };
const origOnResize2 = window.onresize;
window.onresize = function () { window.__log.push('window.onresize2'); return origOnResize2 ? origOnResize2.apply(this, arguments) : undefined; };
  });
await page.goto('http://127.0.0.1:8099/templates.html');
await page.waitForTimeout(2000);
return { log, url: page.url() };
}
