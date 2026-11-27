import { parla } from '../parla.js';
import { getLab } from './store.js';

/** How long after a switch lands a text change still counts as the switch's. */
const WINDOW_MS = 400;

let armedUntil = 0;

function flash(elements: ReadonlySet<Element>): void {
  const color = getComputedStyle(document.documentElement).getPropertyValue('--flash').trim();
  for (const element of elements) {
    // One keyframe: the animation runs back to the element's own background.
    element.animate([{ backgroundColor: color, offset: 0 }], { duration: 1400, easing: 'ease-out' });
  }
}

const observer = new MutationObserver((mutations) => {
  if (performance.now() > armedUntil || !getLab().highlight) {
    return;
  }
  const changed = new Set<Element>();
  for (const { type, target } of mutations) {
    const element = type === 'characterData' ? target.parentElement : target;
    if (element instanceof Element && !element.closest('[data-no-flash]')) {
      changed.add(element);
    }
  }
  flash(changed);
});

observer.observe(document.body, { subtree: true, childList: true, characterData: true });

parla.subscribe(() => {
  armedUntil = performance.now() + WINDOW_MS;
});
