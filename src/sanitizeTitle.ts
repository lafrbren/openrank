/**
 * Rebuild the title's HTML from an allowlist before it is injected into the page.
 *
 * The preview renders the title with `dangerouslySetInnerHTML`, and its source is
 * Quill's `getSemanticHTML()` — the exact surface of GHSA-v3m3-f69x-jf25, which has
 * no fixed release. The vector here is paste: copy crafted markup from a web page
 * into the title field and it would execute on the studio's own origin, with reach
 * into the local API. Rather than trust the editor's escaping, take only the shapes
 * the editor is configured to produce (bold, italic, colour, highlight) and drop
 * everything else.
 *
 * Nothing is copied by attribute, so no event handler can survive. Colours go
 * through CSSOM, which rejects anything that isn't a valid value.
 */

const ALLOWED_TAGS = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'SPAN'])
const ALLOWED_STYLE = new Set(['color', 'background-color'])

export function sanitizeTitleHtml(html: string): string {
  if (!html) return ''
  // DOMParser builds an inert document: scripts do not run and images do not load.
  const parsed = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')

  const copyInto = (src: Node, dest: Node) => {
    for (const node of Array.from(src.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        dest.appendChild(document.createTextNode(node.nodeValue ?? ''))
        continue
      }
      if (node.nodeType !== Node.ELEMENT_NODE) continue

      const el = node as HTMLElement
      if (!ALLOWED_TAGS.has(el.tagName)) {
        // Unwrap rather than delete: a disallowed wrapper loses its tag, not its words.
        copyInto(el, dest)
        continue
      }

      const copy = document.createElement(el.tagName.toLowerCase())
      for (const prop of Array.from(el.style)) {
        if (ALLOWED_STYLE.has(prop)) copy.style.setProperty(prop, el.style.getPropertyValue(prop))
      }
      copyInto(el, copy)
      dest.appendChild(copy)
    }
  }

  const out = document.createElement('div')
  copyInto(parsed.body, out)
  return out.innerHTML
}
