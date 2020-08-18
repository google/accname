import {Context, getDefaultContext} from './context';
import {computeTextAlternative} from './compute_text_alternative';

/**
 * Implementation for rule 2D
 * @param node - the node whose text alternative is being computed
 * @param context - information relevant to the text alternative computation
 * for node
 * @return - text alternative for node if the conditions for applying
 * rule 2D are satisfied, null otherwise.
 */
export function rule2D(
  node: Node,
  context: Context = getDefaultContext()
): string | null {
  if (!(node instanceof HTMLElement)) {
    return null;
  }

  const roleAttribute = node.getAttribute('role') ?? '';
  if (roleAttribute === 'presentation' || roleAttribute === 'none') {
    return null;
  }

  // #SPEC_ASSUMPTION (D.1) : html-aam (https://www.w3.org/TR/html-aam-1.0/)
  // specifies all native attributes and elements that define a text alternative.
  if (LABELLABLE_ELEMENT_TYPES.includes(node.tagName)) {
    const labelText = getTextIfLabelled(node, context);
    if (labelText) {
      return labelText;
    }
  }

  // If input is not <label>led, use native attribute /
  // element information to compute a text alternative
  if (node instanceof HTMLInputElement) {
    const inputTextAlternative = getUnlabelledInputText(node);
    if (inputTextAlternative) {
      return inputTextAlternative;
    }
  }

  // <caption>s define text alternatives for <table>s
  if (node instanceof HTMLTableElement) {
    const captionElem = node.querySelector('caption');
    if (captionElem) {
      context.inherited.partOfName = true;
      return computeTextAlternative(captionElem, {
        inherited: context.inherited,
      }).name;
    }
  }

  // <figcaption>s define text alternatives for <figure>s
  // Checking tagName due to lack of HTMLFigureElement
  if (node.tagName === 'FIGURE') {
    const figcaptionElem = node.querySelector('figcaption');
    if (figcaptionElem) {
      context.inherited.partOfName = true;
      return computeTextAlternative(figcaptionElem, {
        inherited: context.inherited,
      }).name;
    }
  }

  // <legend>s define text alternatives for <fieldset>s
  if (node instanceof HTMLFieldSetElement) {
    const legendElem = node.querySelector('legend');
    if (legendElem) {
      context.inherited.partOfName = true;
      return computeTextAlternative(legendElem, {
        inherited: context.inherited,
      }).name;
    }
  }

  // alt attributes define text alternatives for
  // <img>s and <area>s
  const altAttribute = node.getAttribute('alt');
  if (
    altAttribute &&
    (node instanceof HTMLImageElement || node instanceof HTMLAreaElement)
  ) {
    return altAttribute;
  }

  return null;
}

/**
 * Process elem's text alternative if elem is an <input>, assuming
 * that no <label> element references elem.
 * @param elem - element whose text alternative is being processed
 * @return - text alternative of elem if elem is an <input>
 */
function getUnlabelledInputText(elem: HTMLInputElement): string | null {
  // Implementation reflects rules defined in sections 5.1 - 5.3 of html-aam spec:
  // https://www.w3.org/TR/html-aam-1.0/#accessible-name-and-description-computation

  const inputType = elem.getAttribute('type') ?? '';
  if (
    (inputType === 'button' ||
      inputType === 'submit' ||
      inputType === 'reset') &&
    elem.hasAttribute('value')
  ) {
    return elem.value;
  }

  if (inputType === 'submit' || inputType === 'reset') {
    // This should be a localised string, but for now we are
    // just supporting English.
    return inputType;
  }

  if (inputType === 'image' && elem.hasAttribute('alt')) {
    return elem.getAttribute('alt');
  }

  if (inputType === 'image' && !elem.hasAttribute('title')) {
    // This should be a localised string, but for now we are
    // just supporting English.
    return 'Submit Query';
  }

  // Title attribute handled by 2I.

  return null;
}

// Only certain element types are labellable
// See: https://html.spec.whatwg.org/multipage/forms.html#category-label
const LABELLABLE_ELEMENT_TYPES = [
  'BUTTON',
  'INPUT',
  'METER',
  'OUTPUT',
  'PROGRESS',
  'SELECT',
  'TEXTAREA',
];

/**
 * Gets the text alternative as defined by one or more native <label>s.
 * @param elem - element whose text alternative is being calculated
 * @param context - information relevant to the computation of elem's text alternative
 * @return - the text alternative for elem if elem is legally labelled by a native
 * <label>, null otherwise.
 */
function getTextIfLabelled(elem: HTMLElement, context: Context): string | null {
  // Using querySelectorAll to get <label>s in DOM order.
  const allLabelElems = document.querySelectorAll('label');
  const labelElems = Array.from(allLabelElems).filter(label => {
    return label.control === elem;
  });

  const textAlternative = labelElems
    .map(
      labelElem =>
        computeTextAlternative(labelElem, {
          directLabelReference: true,
          inherited: context.inherited,
        }).name
    )
    .filter(text => text !== '')
    .join(' ');

  return textAlternative || null;
}
