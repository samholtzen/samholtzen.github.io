// Rehype plugin for the notebook look. No dependencies.
//
// 1. Footnotes -> margin notes. Standard Markdown footnotes ([^1] and
//    "[^1]: text") are moved out of the footnote list and placed inline, right
//    after their reference. CSS decides whether they sit in the margin (wide
//    screens) or in the text flow (narrow screens).
// 2. Images with a title -> figures. ![alt](src "Caption") becomes
//    <figure><img><figcaption>Caption</figcaption></figure>, numbered by CSS.

const isElement = (node, tag) => node?.type === 'element' && (!tag || node.tagName === tag);
const isBlankText = (node) => node.type === 'text' && node.value.trim() === '';

function el(tagName, properties = {}, children = []) {
  return { type: 'element', tagName, properties, children };
}

/** Find, remove, and return the footnote <li> elements keyed by id. */
function extractFootnotes(node, notes) {
  if (!node.children) return;
  node.children = node.children.filter((child) => {
    if (isElement(child, 'section') && child.properties?.dataFootnotes !== undefined) {
      const stack = [child];
      while (stack.length) {
        const cur = stack.pop();
        if (isElement(cur, 'li') && cur.properties?.id) notes.set(cur.properties.id, cur);
        stack.push(...(cur.children ?? []));
      }
      return false;
    }
    return true;
  });
  node.children.forEach((child) => extractFootnotes(child, notes));
}

/** Footnote paragraphs -> inline content, without the "back" arrows. */
function noteContent(li) {
  const out = [];
  for (const child of li.children) {
    if (isBlankText(child)) continue;
    if (isElement(child, 'p')) {
      if (out.length) out.push({ type: 'text', value: ' ' });
      out.push(...child.children.filter((c) => !(isElement(c, 'a') && c.properties?.dataFootnoteBackref !== undefined)));
    } else {
      out.push(child);
    }
  }
  return out;
}

function replaceReferences(node, notes) {
  if (!node.children) return;
  node.children = node.children.map((child) => {
    if (isElement(child, 'sup')) {
      const link = child.children.find((c) => isElement(c, 'a') && c.properties?.dataFootnoteRef !== undefined);
      const li = link && notes.get(String(link.properties.href).slice(1));
      if (li) {
        return el('span', { className: ['sidenote-wrap'] }, [
          el('sup', { className: ['sidenote-ref'] }),
          el('span', { className: ['sidenote'] }, noteContent(li)),
        ]);
      }
    }
    replaceReferences(child, notes);
    return child;
  });
}

function makeFigures(node) {
  if (!node.children) return;
  node.children = node.children.map((child) => {
    if (isElement(child, 'p')) {
      const content = child.children.filter((c) => !isBlankText(c));
      const [img] = content;
      if (content.length === 1 && isElement(img, 'img') && img.properties?.title) {
        const { title, ...rest } = img.properties;
        return el('figure', {}, [
          { ...img, properties: rest },
          el('figcaption', {}, [{ type: 'text', value: String(title) }]),
        ]);
      }
    }
    makeFigures(child);
    return child;
  });
}

export default function rehypeNotebook() {
  return (tree) => {
    const notes = new Map();
    extractFootnotes(tree, notes);
    if (notes.size) replaceReferences(tree, notes);
    makeFigures(tree);
  };
}
