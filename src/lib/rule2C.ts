import {Context, getDefaultContext} from './context';
import {rule2E} from './rule2E';

/**
 * Implementation for rule 2C
 * @param node - node whose text alternative is being computed
 * @param context - information relevant to the computation of node's text alternative
 * @return text alternative for 'node' if rule 2C accepts 'node', null otherwise.
 */
export function rule2C(node: Node, context: Context = getDefaultContext()): string | null {
  if (!(node instanceof HTMLElement)) {
    return null;
  }

  const ariaLabel = node.getAttribute('aria-label') ?? '';
  if (ariaLabel.trim() === '') {
    return null;
  }

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