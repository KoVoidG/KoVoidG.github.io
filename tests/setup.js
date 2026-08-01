/**
 * Test harness — seeds a jsdom document from the shipped index.html and stubs
 * fetch, matchMedia, and IntersectionObserver at the module boundary.
 *
 * Dev-only. Never referenced from index.html. The site runs with node_modules/ deleted.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, '..', 'index.html');
const htmlSource = readFileSync(htmlPath, 'utf-8');

/**
 * Create a fresh jsdom document from the shipped index.html.
 * Each call returns an independent DOM so tests do not leak state.
 */
export function createDocument() {
  const dom = new JSDOM(htmlSource, {
    url: 'http://localhost:8000/',
    contentType: 'text/html',
    runScripts: 'outside-only',
  });
  const { window } = dom;
  const { document } = window;

  // --- Stub fetch ---
  const fetchStub = createFetchStub();
  window.fetch = fetchStub.fn;

  // --- Stub matchMedia ---
  const matchMediaStub = createMatchMediaStub();
  window.matchMedia = matchMediaStub.fn;

  // --- Stub IntersectionObserver ---
  const intersectionObserverStub = createIntersectionObserverStub(window);
  window.IntersectionObserver = intersectionObserverStub.cls;

  return {
    dom,
    window,
    document,
    stubs: {
      fetch: fetchStub,
      matchMedia: matchMediaStub,
      intersectionObserver: intersectionObserverStub,
    },
  };
}

// ---------------------------------------------------------------------------
// Fetch stub
// ---------------------------------------------------------------------------

function createFetchStub() {
  let responseBody = { featured: [], other: [] };
  let responseStatus = 200;
  let shouldReject = false;
  let rejectError = null;
  let delay = 0;

  const fn = (url, options) => {
    fn.calls.push({ url, options });

    if (shouldReject) {
      return Promise.reject(rejectError || new TypeError('Network error'));
    }

    const respond = () => {
      const body = JSON.stringify(responseBody);
      const response = {
        ok: responseStatus >= 200 && responseStatus < 300,
        status: responseStatus,
        statusText: responseStatus === 200 ? 'OK' : 'Error',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(JSON.parse(body)),
        text: () => Promise.resolve(body),
      };
      return Promise.resolve(response);
    };

    if (delay > 0) {
      return new Promise((resolve) => setTimeout(() => resolve(respond()), delay));
    }
    return respond();
  };

  fn.calls = [];

  return {
    fn,
    /** Set the JSON body the stub will return */
    setResponse(body) { responseBody = body; },
    /** Set the HTTP status code */
    setStatus(status) { responseStatus = status; },
    /** Make fetch reject with an error */
    setReject(error) { shouldReject = true; rejectError = error; },
    /** Set response delay in ms */
    setDelay(ms) { delay = ms; },
    /** Reset to defaults */
    reset() {
      responseBody = { featured: [], other: [] };
      responseStatus = 200;
      shouldReject = false;
      rejectError = null;
      delay = 0;
      fn.calls = [];
    },
  };
}

// ---------------------------------------------------------------------------
// matchMedia stub
// ---------------------------------------------------------------------------

function createMatchMediaStub() {
  let reducedMotion = false;

  const fn = (query) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? reducedMotion : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  });

  return {
    fn,
    /** Set whether prefers-reduced-motion: reduce matches */
    setReducedMotion(value) { reducedMotion = value; },
    /** Reset to defaults */
    reset() { reducedMotion = false; },
  };
}

// ---------------------------------------------------------------------------
// IntersectionObserver stub
// ---------------------------------------------------------------------------

function createIntersectionObserverStub(window) {
  const instances = [];

  class MockIntersectionObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options || {};
      this.observedElements = new Set();
      this.disconnected = false;
      instances.push(this);
    }

    observe(element) {
      if (!this.disconnected) {
        this.observedElements.add(element);
      }
    }

    unobserve(element) {
      this.observedElements.delete(element);
    }

    disconnect() {
      this.observedElements.clear();
      this.disconnected = true;
    }

    takeRecords() {
      return [];
    }

    /** Test helper: trigger the callback with provided entries */
    trigger(entries) {
      if (!this.disconnected) {
        this.callback(entries, this);
      }
    }
  }

  return {
    cls: MockIntersectionObserver,
    /** Get all created observer instances */
    get instances() { return instances; },
    /** Get the most recently created instance */
    get latest() { return instances[instances.length - 1] || null; },
    /** Clear tracking */
    reset() { instances.length = 0; },
  };
}

export { createFetchStub, createMatchMediaStub, createIntersectionObserverStub };
