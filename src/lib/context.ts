/**
 * This interface will be used to pass additional information
 * about the element whose name is being computed.
 */
export interface Context {
  /**
   * Indicates whether a node is referenced by aria-labelledby.
   * This would be set to true as nodes are processed in rule 2B.
   */
  ariaLabelledbyReference: boolean;
  /**
   * Indicates whether a node is a label for another node,
   * i.e. a HTML label
   * This would be set to true by rule 2D.
   */
  isLabelReference: boolean;
  /**
   * 'inherited' object stores any context properties
   * that are to be passed on to a new 'current node'
   * from the previous 'current node'.
   */
  inherited: {
    isLabelDescendant: boolean;
    visitedNodes: Node[];
  };
}

/**
 * Returns a context instance in its 'default' state.
 */
export function getEmptyContext(): Context {
  return {
    ariaLabelledbyReference: false,
    isLabelReference: false,
    inherited: {
      isLabelDescendant: false,
      visitedNodes: []
    }
  };
}

/**
 * Resets all context properties to default except for
 * the inherited object, which remains the same in the
 * new context.
 * @param context - the context instance that is being reset
 * @return - a new context instance whose values are default
 * except for its inherited object.
 */
export function resetUninherited(context: Context): Context {
  const inherited = context.inherited;
  const newContext = getEmptyContext();
  newContext.inherited = inherited;
  return newContext;
}