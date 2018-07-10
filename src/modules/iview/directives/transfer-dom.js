// Thanks to: https://github.com/airyland/vux/blob/v2/src/directives/transfer-dom/index.js
// Thanks to: https://github.com/calebroseland/vue-dom-portal

/* eslint-disable no-restricted-globals */

/**
 * Get target DOM Node
 * @param {(Node|string|Boolean)} [node=parent.document.body] DOM Node, CSS selector, or Boolean
 * @return {Node} The target that the el will be appended to
 */
function getTarget(node) {
  if (node === undefined) {
    node = parent.document.body;
  }
  if (node === true) {
    return parent.document.body;
  }
  return node instanceof parent.window.Node ? node : parent.document.querySelector(node);
}

const directive = {
  inserted(el, { value }) {
    if (el.dataset.transfer !== "true") return false;
    el.className = el.className ? `${el.className  } v-transfer-dom` : "v-transfer-dom";
    const { parentNode } = el;
    if (!parentNode) return false;
    const home = parent.document.createComment("");
    let hasMovedOut = false;

    if (value !== false) {
      parentNode.replaceChild(home, el); // moving out, el is no longer in the document
      getTarget(value).appendChild(el); // moving into new place
      hasMovedOut = true;
    }
    if (!el.__transferDomData) {
      el.__transferDomData = {
        parentNode,
        home,
        target: getTarget(value),
        hasMovedOut,
      };
    }
    return true
  },
  componentUpdated(el, { value }) {
    if (el.dataset.transfer !== "true") return false;
    // need to make sure children are done updating (vs. `update`)
    const ref$1 = el.__transferDomData;
    if (!ref$1) return false;
    // homes.get(el)
    const { parentNode } = ref$1;
    const { home, hasMovedOut } = ref$1;

    if (!hasMovedOut && value) {
      // remove from document and leave placeholder
      parentNode.replaceChild(home, el);
      // append to target
      getTarget(value).appendChild(el);
      el.__transferDomData = Object.assign({}, el.__transferDomData, {
        hasMovedOut: true,
        target: getTarget(value),
      });
    } else if (hasMovedOut && value === false) {
      // previously moved, coming back home
      parentNode.replaceChild(el, home);
      el.__transferDomData = Object.assign({}, el.__transferDomData, {
        hasMovedOut: false,
        target: getTarget(value),
      });
    } else if (value) {
      // already moved, going somewhere else
      getTarget(value).appendChild(el);
    }
    return true
  },
  unbind(el) {
    if (el.dataset.transfer !== "true") return false;
    el.className = el.className.replace("v-transfer-dom", "");
    const ref$1 = el.__transferDomData;
    if (!ref$1) return false;
    if (el.__transferDomData.hasMovedOut === true && el.__transferDomData.parentNode) {
      el.__transferDomData.parentNode.appendChild(el);
    }
    el.__transferDomData = null;
    return true
  },
};

export default directive;
