import {Context} from './context';

/**
 * Looks at a variety of characteristics (CSS, size on screen, attributes) 
 * to determine if 'node' should be considered hidden
 * @param node - node whose hidden-ness is being calculated
 * @return - whether or not the node is considered hidden
 */
function isHidden(node: Node): boolean {
  let hidden: boolean = false;
  if (node instanceof HTMLElement) {
    const nodeStyle = window.getComputedStyle(node);
    const hiddenByStyle = (
      nodeStyle.visibility === 'hidden' ||
      +nodeStyle.opacity <= 0
    );

    hidden = (
      node.hasAttribute('hidden') ||
      node.getAttribute('aria-hidden') === 'true' ||
      node.offsetHeight <= 0 ||
      node.offsetWidth <= 0 ||
      hiddenByStyle
    );
  }
  // A node is considered hidden if any ancestor is hidden
  const parentNode = node.parentNode;
  if (parentNode) {
    hidden = hidden || isHidden(parentNode);
  }
  return hidden;
}

/**
 * Condition for applying rule 2A
 * @param elem - The element whose accessible name is being calculated
 * @param context - Additional information relevant to the name computation for elem
 * @return - Whether of not elem satisfies the condition for rule 2A
 */
function rule2ACondition(node: Node, context: Context): boolean {
  return (
    isHidden(node) &&
    !context.ariaLabelledbyReference &&
    !context.labelReference
  );
}

/**
 * Implementation of rule 2A
 * @param elem - The element whose accessible name is being calculated
 * @param context - Additional information relevant to the name computation for elem
 * @return - The accessible name string is returned if condition is true,
 * null is returned otherwise, indicating that the condition of this rule was not satisfied.
 */
export function rule2A(node: Node, context: Context): string | null {
  let result = null;
  if (rule2ACondition(node, context)) {
    result = '';
  }
  return result;
}
