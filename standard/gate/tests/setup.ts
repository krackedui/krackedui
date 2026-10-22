// jsdom gaps that Radix and layout code rely on.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

class RO { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver ??= RO as unknown as typeof ResizeObserver;
globalThis.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } root = null; rootMargin = ''; thresholds = []; } as unknown as typeof IntersectionObserver;
window.matchMedia ??= ((query: string) => ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false })) as typeof window.matchMedia;
Element.prototype.scrollIntoView ??= function () {};
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.setPointerCapture ??= () => {};
Element.prototype.releasePointerCapture ??= () => {};
window.HTMLElement.prototype.scrollTo ??= function () {};
