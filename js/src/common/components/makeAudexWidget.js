/**
 * Builds the Audex widget class on top of fof's Widget base (resolved at
 * initializer time via the registry).
 *
 * Content comes from the Audex endpoint, which serves the blocks marked with
 * the "widget" placement and enforces the same per-user/group exclusions as
 * the head/foot injection. For excluded users the widget never mounts at all
 * (see isDisabled in registerWidget); the endpoint is the second line of
 * defence, so the code is never even delivered to them.
 *
 * Scripts are inserted through the DOM API on purpose: script tags parsed as
 * HTML (m.trust/innerHTML) never execute in the browser.
 */
export default function makeAudexWidget(Widget) {
  return class AudexWidget extends Widget {
    oninit(vnode) {
      super.oninit(vnode);

      this.blocks = null;
      this.mountedKey = null;

      // Cache-bust with the revision from the page payload: when an admin
      // edits the blocks the rev changes, so the URL changes and the browser's
      // private cache is bypassed.
      const rev = (app.data && app.data['stezkoy-audex.widgetRev']) || '';
      const base = app.forum.attribute('apiUrl') + '/audex/widget';
      const url = rev ? base + '?v=' + encodeURIComponent(rev) : base;

      app
        .request({
          method: 'GET',
          url,
        })
        .then((data) => {
          this.blocks = (data && data.blocks) || [];
          m.redraw();
        })
        .catch(() => {
          this.blocks = [];
          m.redraw();
        });
    }

    view() {
      // No shell at all until there is something to show.
      if (!this.blocks || !this.blocks.length) return null;

      return m('div.AudexWidget', {
        oncreate: (vnode) => this.mount(vnode.dom),
        onupdate: (vnode) => this.mount(vnode.dom),
      });
    }

    mount(container) {
      const key = this.cacheKey();

      if (this.mountedKey === key) return;
      this.mountedKey = key;

      container.textContent = '';

      this.blocks.forEach((block) => {
        if (block.name) {
          container.appendChild(document.createComment(' audex: ' + block.name + ' '));
        }

        mountHtml(container, block.code || '');
      });
    }

    cacheKey() {
      return (this.blocks || []).map((block) => block.code).join('\n--audex--\n');
    }
  };
}

/**
 * Inserts an admin-supplied HTML fragment so that scripts actually execute.
 * Everything is appended through DOM node APIs; script elements are recreated
 * (imported script nodes stay inert), other nodes are imported as-is.
 */
function mountHtml(container, html) {
  const parsed = new DOMParser().parseFromString(html, 'text/html');

  Array.from(parsed.body.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SCRIPT') {
      const script = document.createElement('script');

      Array.from(node.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
      script.textContent = node.textContent;

      container.appendChild(script);
      return;
    }

    container.appendChild(document.importNode(node, true));
  });
}
