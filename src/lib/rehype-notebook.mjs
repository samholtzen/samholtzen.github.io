// Rehype plugin for the notebook look. No dependencies.
//
// 1. Footnotes -> margin notes. Standard Markdown footnotes ([^1] and
//    "[^1]: text") are moved out of the footnote list and placed inline, right
//    after their reference. CSS decides whether they sit in the margin (wide
//    screens) or in the text flow (narrow screens).
// 2. Images with a title -> figures. ![alt](src "Caption") becomes
//    <figure><img><figcaption>Caption</figcaption></figure>, numbered by CSS.
//    Width classes, after Distill: fig-body (default, text column), fig-page
//    (full page width), fig-screen (edge to edge). Set with "[page] Caption".
// 3. A bullet list where every item starts with an image -> a grid of cards.
//    The image becomes the card's figure; the rest of the item is the card text.

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
        // Optional width prefix in the title: "[body] Caption", "[page] ...", "[screen] ...".
        const m = String(title).match(/^\[(body|page|screen)\]\s*/i);
        const size = m ? m[1].toLowerCase() : 'body';
        const caption = m ? String(title).slice(m[0].length) : String(title);
        return el('figure', { className: [`fig-${size}`] }, [
          { ...img, properties: rest },
          el('figcaption', {}, [{ type: 'text', value: caption }]),
        ]);
      }
    }
    makeFigures(child);
    return child;
  });
}

/** The leading image of a list item as a figure, or null. Runs after makeFigures. */
function leadingFigure(li) {
  const first = li.children.find((c) => !isBlankText(c));
  if (isElement(first, 'figure')) return first;
  if (isElement(first, 'img')) return el('figure', {}, [first]);
  if (isElement(first, 'p')) {
    const content = first.children.filter((c) => !isBlankText(c));
    if (content.length === 1 && isElement(content[0], 'img')) return el('figure', {}, [content[0]]);
  }
  return null;
}

function makeCards(node) {
  if (!node.children) return;
  for (const child of node.children) {
    if (isElement(child, 'ul')) {
      const items = child.children.filter((c) => isElement(c, 'li'));
      const figures = items.map(leadingFigure);
      if (items.length && figures.every(Boolean)) {
        child.properties = { ...child.properties, className: ['cards'] };
        items.forEach((li, i) => {
          const rest = li.children.filter((c) => !isBlankText(c)).slice(1);
          figures[i].properties = { className: ['card-figure'] };
          li.children = [figures[i], el('div', { className: ['card-body'] }, rest)];
        });
        continue;
      }
    }
    makeCards(child);
  }
}

export default function rehypeNotebook() {
  return (tree) => {
    const notes = new Map();
    extractFootnotes(tree, notes);
    if (notes.size) replaceReferences(tree, notes);
    makeFigures(tree);
    makeCards(tree);
  };
}
