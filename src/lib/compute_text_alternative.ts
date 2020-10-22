/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {Context, getDefaultContext} from './context';
import {rule2A} from './rule2A';
import {resolveValidAriaLabelledbyIdrefs} from './rule2B';
import {getUnlabelledInputText, LABELLABLE_ELEMENT_TYPES} from './rule2D';
import {getValueIfRange, getValueIfTextbox, TEXT_INPUT_TYPES} from './rule2E';
import {allowsNameFromContent, getCssContent, inlineTags} from './rule2F';
import {rule2G} from './rule2G';
import {rule2I} from './rule2I';
import {hasTagName, isHTMLElement, isSVGElement} from './util';

// taze: SVG types from //javascript/externs:svg_lib

/**
 * A reference to the rules outlined in the accname spec.
 */
export type Rule = '2A'|'2B'|'2C'|'2D'|'2E'|'2F'|'2G'|'2I';

const ruleToImpl:
    {[rule in Rule]: (node: Node, context: Context) => string | null;} = {
      '2A': rule2A,
      '2B': rule2B,
      '2C': rule2C,
      '2D': rule2D,
      '2E': rule2E,
      '2F': rule2F,
      '2G': rule2G,
      '2I': rule2I,
    };

/**
 * Provides details about the computation of some accessible name, such as
 * the Nodes used and rules applied during computation.
 */
export interface ComputationDetails {
  name: string;
  nodesUsed: Set<Node>;
  rulesApplied: Set<Rule>;
}

/**
 * @param node - The node whose text alternative will be calculated
 * @param  context - Additional information relevant to the text alternative
 * computation for node. Optional paramater is 'getDefaultContext' by default.
 * @return - The text alternative for node
 */
export function computeTextAlternative(
    node: Node, context: Context = getDefaultContext()): ComputationDetails {
  context.inherited.nodesUsed.add(node);

  // Try each rule sequentially on the target Node.
  for (const [rule, impl] of Object.entries(ruleToImpl)) {
    const result = impl(node, context);
    // A rule has been applied if its implementation has
    // returned a string.
    if (result !== null) {
      context.inherited.rulesApplied.add(<Rule>rule);
      return {
        name: result,
        nodesUsed: context.inherited.nodesUsed,
        rulesApplied: context.inherited.rulesApplied,
      };
    }
  }

  return {
    name: '',
    nodesUsed: context.inherited.nodesUsed,
    rulesApplied: context.inherited.rulesApplied,
  };
}

// TODO(alexlloyd) fix cyclic dependencies in a nicer way than this

/* Rule2B */

/**
 * Implementation of rule 2B
 * @param node - node whose text alternative is being computed
 * @param context - Additional information relevant to the text alternative
 * computation for node
 * @return - The text alternative string is returned if condition is true,
 * null is returned otherwise, indicating that the condition of this rule was
 * not satisfied.
 */
function rule2B(node: Node, context = getDefaultContext()): string|null {
  if (!isHTMLElement(node)) {
    return null;
  }

  // #SPEC_ASSUMPTION (B.1) : definition of 'part of an aria-labelledby
  // traversal'
  if (context.directLabelReference) {
    return null;
  }

  const labelElems = resolveValidAriaLabelledbyIdrefs(node);
  if (labelElems.length === 0) {
    return null;
  }

  return labelElems
      .map(labelElem => {
        context.inherited.partOfName = true;
        return computeTextAlternative(labelElem, {
                 directLabelReference: true,
                 inherited: context.inherited,
               })
            .name;
      })
      .join(' ')
      .trim();
}

/* Rule2C */

/**
 * Implementation for rule 2C
 * @param node - node whose text alternative is being computed
 * @param context - information relevant to the computation of node's text
 *     alternative
 * @return text alternative for 'node' if rule 2C accepts 'node', null
 *     otherwise.
 */
function rule2C(node: Node, context = getDefaultContext()): string|null {
  if (!isHTMLElement(node)) {
    return null;
  }

  const ariaLabel = node.getAttribute('aria-label') ?? '';
  if (ariaLabel.trim() === '') {
    return null;
  }

  // #SPEC_ASSUMPTION (C.1) : 'part of name' implies 'traversal
  // due to recursion'.
  if (context.inherited.partOfName) {
    // 'rule2EResult !== null' indicates that 'node' is an embedded
    // control as defined in step 2E.
    const rule2EResult = rule2E(node, {inherited: context.inherited});
    if (rule2EResult !== null) {
      return rule2EResult;
    }
  }

  return ariaLabel;
}


/* Rule2D */

/**
 * Gets the text alternative as defined by one or more native <label>s.
 * @param elem - element whose text alternative is being calculated
 * @param context - information relevant to the computation of elem's text
 *     alternative
 * @return - the text alternative for elem if elem is legally labelled by a
 *     native
 * <label>, null otherwise.
 */
function getTextIfLabelled(elem: HTMLElement, context: Context): string|null {
  // Using querySelectorAll to get <label>s in DOM order.
  const allLabelElems = document.querySelectorAll('label');
  const labelElems = Array.from(allLabelElems).filter(label => {
    return label.control === elem;
  });

  const textAlternative =
      labelElems
          .map(labelElem => computeTextAlternative(labelElem, {
                              directLabelReference: true,
                              inherited: context.inherited,
                            }).name)
          .filter(text => text !== '')
          .join(' ');

  return textAlternative || null;
}

/**
 * Implementation for rule 2D
 * @param node - the node whose text alternative is being computed
 * @param context - information relevant to the text alternative computation
 * for node
 * @return - text alternative for node if the conditions for applying
 * rule 2D are satisfied, null otherwise.
 */
function rule2D(node: Node, context: Context = getDefaultContext()): string|
    null {
  // <title>s define text alternatives for <svg>s
  // See: https://www.w3.org/TR/svg-aam-1.0/#mapping_additional_nd
  if (isSVGElement(node)) {
    for (const child of node.childNodes) {
      if (isSVGElement(child) && hasTagName(child, 'title')) {
        return child.textContent;
      }
    }
  }

  if (!isHTMLElement(node)) {
    return null;
  }

  const roleAttribute = node.getAttribute('role') ?? '';
  if (roleAttribute === 'presentation' || roleAttribute === 'none') {
    return null;
  }

  // #SPEC_ASSUMPTION (D.1) : html-aam (https://www.w3.org/TR/html-aam-1.0/)
  // specifies all native attributes and elements that define a text
  // alternative.
  if (LABELLABLE_ELEMENT_TYPES.includes(node.tagName)) {
    const labelText = getTextIfLabelled(node, context);
    if (labelText) {
      return labelText;
    }
  }

  // If input is not <label>led, use native attribute /
  // element information to compute a text alternative
  if (hasTagName(node, 'input')) {
    const inputTextAlternative = getUnlabelledInputText(node);
    if (inputTextAlternative) {
      return inputTextAlternative;
    }
  }

  // <caption>s define text alternatives for <table>s
  if (hasTagName(node, 'table')) {
    const captionElem = node.querySelector('caption');
    if (captionElem) {
      context.inherited.partOfName = true;
      return computeTextAlternative(captionElem, {
               inherited: context.inherited,
             })
          .name;
    }
  }

  // <figcaption>s define text alternatives for <figure>s
  if (hasTagName(node, 'figure')) {
    const figcaptionElem = node.querySelector('figcaption');
    if (figcaptionElem) {
      context.inherited.partOfName = true;
      return computeTextAlternative(figcaptionElem, {
               inherited: context.inherited,
             })
          .name;
    }
  }

  // <legend>s define text alternatives for <fieldset>s
  if (hasTagName(node, 'fieldset')) {
    const legendElem = node.querySelector('legend');
    if (legendElem) {
      context.inherited.partOfName = true;
      return computeTextAlternative(legendElem, {
               inherited: context.inherited,
             })
          .name;
    }
  }

  // alt attributes define text alternatives for
  // <img>s and <area>s
  const altAttribute = node.getAttribute('alt');
  if (altAttribute && (hasTagName(node, 'img') || hasTagName(node, 'area'))) {
    return altAttribute;
  }

  return null;
}

/* Rule2E */

/**
 * Determines whether a given node has role 'combobox'
 * or 'listbox' and, if so, gets the text alternative for the
 * option(s) selected by that combobox / listbox.
 * @param node - node whose role is being calculated
 * @param context - information relevant to the calculation of that role
 * @return - text alternative for selected option(s) if node is a
 * combobox or listbox, null otherwise.
 * (null indicates that node is neither combobox nor listbox).
 */
function getValueIfComboboxOrListbox(
    node: HTMLElement, context: Context): string|null {
  // Handles the case where node role is explictly overwritten
  const nodeRole = node.getAttribute('role');
  if (nodeRole && nodeRole !== 'listbox' && nodeRole !== 'combobox') {
    return null;
  }

  // Combobox role implied by input type and presence of list attribute,
  // chosen option is the input value.
  if (hasTagName(node, 'input') && TEXT_INPUT_TYPES.includes(node.type) &&
      (node.hasAttribute('list') || nodeRole === 'combobox')) {
    return node.value;
  }

  // Text alternative for elems of role 'listbox' and 'combobox'
  // consists of the text alternatives for their selected options.
  let selectedOptions: HTMLElement[] = [];
  // Listbox may be defined explicitly using 'role',
  // and using 'aria-selected' attribute to mark selected options.
  if (nodeRole && nodeRole === 'listbox') {
    selectedOptions = Array.from(
        node.querySelectorAll('[role="option"][aria-selected="true"]'));
  }
  // A <select> element is always implicitly either a listbox or a combobox
  else if (hasTagName(node, 'select')) {
    selectedOptions = Array.from(node.selectedOptions);
  }

  // If the current node has any selected options (either by aria-selected
  // or semantic <option selected>) they will be stored in selectedOptions.
  if (selectedOptions.length > 0) {
    // #SPEC_ASSUMPTION (E.2) : consider multiple selected options' text
    // alternatives, joining them with a space as in 2B.ii.c
    return selectedOptions
        .map(optionElem => {
          return computeTextAlternative(optionElem, {
                   inherited: context.inherited,
                 })
              .name;
        })
        .filter(alternativeText => alternativeText !== '')
        .join(' ');
  }

  return null;
}

/**
 * Implementation for rule 2E.
 * @param node - node whose text alternative is being calculated
 * @param context - additional information relevant to the computation of a text
 * alternative for node.
 * @return text alternative for 'node' if rule 2E accepts 'node', null
 *     otherwise.
 */
function rule2E(node: Node, context = getDefaultContext()): string|null {
  if (!isHTMLElement(node)) {
    return null;
  }

  // #SPEC_ASSUMPTION (E.1) : that 'embedded within the label
  // for another widget' is equivalent to 'part of a name computation'
  if (!context.inherited.partOfName) {
    return null;
  }

  const textboxValue = getValueIfTextbox(node);
  if (textboxValue) {
    return textboxValue;
  }

  // #SPEC_ASSUMPTION (E.4) : menu button is handled by 2F

  const comboboxOrListboxValue = getValueIfComboboxOrListbox(node, context);
  if (comboboxOrListboxValue) {
    return comboboxOrListboxValue;
  }

  const rangeValue = getValueIfRange(node);
  if (rangeValue) {
    return rangeValue;
  }

  return null;
}

/* Rule2F */

/**
 * Implementation of rule 2F
 * @param node - node whose text alternative is being calculated
 * @param context - additional info relevant to the calculation of nodes
 * text alternative
 * @return - text alternative for node if the conditions of 2F are satisfied,
 * null otherwise.
 */
function rule2F(node: Node, context = getDefaultContext()): string|null {
  if (!isHTMLElement(node)) {
    return null;
  }

  // The condition for rule 2F determines if the contents of the
  // current node should be used in its accessible name.
  if (!allowsNameFromContent(node, context)) {
    return null;
  }

  const a11yChildNodes = Array.from(node.childNodes);

  // Include any aria-owned Nodes in the list of 'child nodes'
  const ariaOwnedNodeIds = node.getAttribute('aria-owns');
  if (ariaOwnedNodeIds) {
    for (const idref of ariaOwnedNodeIds.split(' ')) {
      const referencedNode = document.getElementById(idref);
      if (referencedNode) {
        a11yChildNodes.push(referencedNode);
      }
    }
  }

  const textAlterantives: string[] = [];
  for (const childNode of a11yChildNodes) {
    if (!context.inherited.visitedNodes.includes(childNode)) {
      context.inherited.visitedNodes.push(childNode);
      context.inherited.partOfName = true;

      const textAlterantive = computeTextAlternative(childNode, {
                                inherited: context.inherited,
                              }).name;

      if (inlineTags.includes(childNode.nodeName.toLowerCase()) ||
          childNode.nodeType === Node.TEXT_NODE) {
        textAlterantives.push(textAlterantive);
      } else {
        textAlterantives.push(` ${textAlterantive} `);
      }
    }
  }

  // Consider only non-empty text alternatives to prevent double
  // spacing between text alternatives in accumulatedText.
  // #SPEC_ASSUMPTION (F.1) : that accumulated texts should be space separated
  // for readability
  const accumulatedText =
      textAlterantives.filter(textAlterantive => textAlterantive !== '')
          .join('')
          .replace(/\s+/g, ' ')
          .trim();

  const cssBeforeContent = getCssContent(node, ':before');
  const cssAfterContent = getCssContent(node, ':after');

  // #SPEC_ASSUMPTION (F.2) : that CSS generated content should be
  // concatenated to accumulatedText
  const result = (cssBeforeContent + accumulatedText + cssAfterContent).trim();

  return result || null;
}

export const TEST_ONLY = {
  rule2B,
  rule2C,
  rule2D,
  rule2E,
  rule2F
}