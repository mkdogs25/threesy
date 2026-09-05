import type { AppBuilderProject, InteractionBinding } from '../../project/schema/types'
import { collectSubtreeIds } from '../../project/history/tree'
import { renderNodeToHtml, type RenderContext } from './renderTree'

export interface GeneratedFiles {
  html: Record<string, string>
  css: string
  js: string
}

function slug(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'page'
}

function collectEvents(project: AppBuilderProject): Record<string, InteractionBinding[]> {
  const events: Record<string, InteractionBinding[]> = {}
  for (const node of Object.values(project.nodes)) {
    if (node.events.length > 0) events[node.id] = node.events
  }
  return events
}

const BASE_CSS = `* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif; color: #1a1d29; }
button { font-family: inherit; cursor: pointer; }
input { font-family: inherit; }
.icon { display: inline-flex; }
[data-hidden="true"] { display: none; }
.app-screen { display: none; }
.app-screen.active { display: flex; }
.modal-node { display: none; }
.modal-node.modal-open { display: flex; }
`

function runtimeJs(project: AppBuilderProject, pageFiles: Record<string, string>): string {
  const events = collectEvents(project)
  const isMobileSpa = project.target === 'mobile'
  return `(function () {
  var EVENTS = ${JSON.stringify(events)};
  var PAGE_FILES = ${JSON.stringify(pageFiles)};
  var IS_SPA = ${isMobileSpa};
  var currentPageId = ${JSON.stringify(project.activePageId)};
  var history = [];
  var toastTimer = null;

  function qs(id) { return document.querySelector('[data-node-id="' + id + '"]'); }

  function showScreen(pageId) {
    document.querySelectorAll('.app-screen').forEach(function (el) { el.classList.remove('active'); });
    var el = document.querySelector('.app-screen[data-page-id="' + pageId + '"]');
    if (el) el.classList.add('active');
    currentPageId = pageId;
    firePageOpened(pageId);
  }

  function showToast(message) {
    var toast = document.getElementById('threesy-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'threesy-toast';
      toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1a1d29;color:#fff;padding:10px 16px;border-radius:8px;font-size:13px;z-index:9999;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.style.display = 'none'; }, 2500);
  }

  function runAction(action) {
    switch (action.type) {
      case 'navigate':
        if (IS_SPA) { history.push(currentPageId); showScreen(action.pageId); }
        else { window.location.href = PAGE_FILES[action.pageId] || 'index.html'; }
        break;
      case 'show': { var el1 = qs(action.targetId); if (el1) el1.removeAttribute('data-hidden'); break; }
      case 'hide': { var el2 = qs(action.targetId); if (el2) el2.setAttribute('data-hidden', 'true'); break; }
      case 'changeText': { var el3 = qs(action.targetId); if (el3) el3.textContent = action.text; break; }
      case 'setValue': { var el4 = qs(action.targetId); if (el4) el4.value = action.value; break; }
      case 'changeStyle': { var el5 = qs(action.targetId); if (el5) Object.keys(action.style).forEach(function (k) { el5.style[k] = action.style[k]; }); break; }
      case 'openModal': { var el6 = qs(action.targetId); if (el6) el6.classList.add('modal-open'); break; }
      case 'closeModal': { var el7 = qs(action.targetId); if (el7) el7.classList.remove('modal-open'); break; }
      case 'notify': showToast(action.message); break;
      case 'openUrl': window.open(action.url, '_blank', 'noopener,noreferrer'); break;
      case 'goBack':
        if (IS_SPA && history.length) { showScreen(history.pop()); }
        else { window.history.back(); }
        break;
    }
  }

  function firePageOpened(pageId) {
    var root = document.querySelector('.app-screen[data-page-id="' + pageId + '"], [data-page-root="' + pageId + '"]');
    if (!root) return;
    var id = root.getAttribute('data-node-id');
    (EVENTS[id] || []).forEach(function (b) { if (b.trigger === 'pageOpened') runAction(b.action); });
  }

  document.querySelectorAll('[data-has-events="true"]').forEach(function (el) {
    var id = el.getAttribute('data-node-id');
    var bindings = EVENTS[id] || [];
    el.addEventListener('click', function () { bindings.filter(function (b) { return b.trigger === 'click'; }).forEach(function (b) { runAction(b.action); }); });
    if (el.tagName === 'INPUT') {
      el.addEventListener('input', function () { bindings.filter(function (b) { return b.trigger === 'inputChanged'; }).forEach(function (b) { runAction(b.action); }); });
    }
  });

  document.querySelectorAll('.nav-item').forEach(function (el) {
    el.addEventListener('click', function () {
      var target = el.getAttribute('data-nav-target');
      if (target) runAction({ type: 'navigate', pageId: target });
    });
  });

  if (IS_SPA) { showScreen(currentPageId); } else { firePageOpened(currentPageId); }
})();
`
}

/** Generates a full static project (HTML per page for web, one SPA page for
 * mobile, shared CSS, and a vanilla-JS interaction runtime) directly from
 * the project model — the exact same style engine and tree walk the canvas
 * and preview use, so exported output matches what was designed. */
export function generateHtmlProject(project: AppBuilderProject): GeneratedFiles {
  const cssRules: string[] = [BASE_CSS]
  const hasEventsSet = new Set(Object.values(project.nodes).filter((n) => n.events.length > 0).map((n) => n.id))
  const ctx: RenderContext = { project, cssRules, hasEvents: (id) => hasEventsSet.has(id) }

  const html: Record<string, string> = {}

  if (project.target === 'web') {
    const pageFiles: Record<string, string> = {}
    project.pages.forEach((p, i) => {
      pageFiles[p.id] = i === 0 ? 'index.html' : `${slug(p.name)}.html`
    })
    for (const page of project.pages) {
      const bodyHtml = renderNodeToHtml(page.rootId, ctx)
      html[pageFiles[page.id]] = wrapHtmlDocument(project.name, page.name, bodyHtml)
    }
    return { html, css: cssRules.join('\n\n'), js: runtimeJs(project, pageFiles) }
  }

  // Mobile: single-page app, one .app-screen per screen, bottom nav (if any)
  // switches between them client-side.
  const screensHtml = project.pages
    .map((page) => {
      const root = project.nodes[page.rootId]
      const inner = root.children.map((childId) => renderNodeToHtml(childId, ctx)).join('\n')
      cssRules.push(`.node-${root.id} {\n${Object.entries({ display: 'flex', 'flex-direction': 'column', width: '100%', 'min-height': '100vh' }).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`)
      return `<div class="app-screen node-${root.id}" data-page-id="${page.id}" data-node-id="${root.id}">\n${inner}\n</div>`
    })
    .join('\n')
  html['index.html'] = wrapHtmlDocument(project.name, project.name, screensHtml)
  return { html, css: cssRules.join('\n\n'), js: runtimeJs(project, {}) }
}

function wrapHtmlDocument(appName: string, pageName: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${appName} — ${pageName}</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
${body}
<script src="script.js"></script>
</body>
</html>
`
}

export function collectPageEventNodeIds(project: AppBuilderProject, pageId: string): string[] {
  const page = project.pages.find((p) => p.id === pageId)
  if (!page) return []
  return collectSubtreeIds(project, page.rootId)
}
