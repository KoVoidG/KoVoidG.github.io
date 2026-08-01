/**
 * Shared DOM helpers — tiny, pure, no side effects on import.
 */

/** querySelector shorthand */
export function qs(selector, root = document) {
  return root.querySelector(selector);
}

/** querySelectorAll shorthand returning a real Array */
export function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

/** Clone a <template> element's content (deep clone) */
export function cloneTemplate(template) {
  return template.content.cloneNode(true);
}

/**
 * Set textContent on a node. If value is absent (null, undefined, or empty
 * string after trimming), remove the node from its parent instead.
 */
export function fillText(node, value) {
  if (node == null) return;
  if (value == null || String(value).trim() === '') {
    node.remove();
    return;
  }
  node.textContent = value;
}
