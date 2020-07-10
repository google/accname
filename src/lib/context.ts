/**
 * This interface will be used to pass additional information
 * about the element whose name is being computed.
 */
export interface Context {
  /**
   * Indicates whether a node was referenced by aria-labelledby by
   * a node previously traversed by the algorithm.
   * This would be set to true as nodes are processed in rule 2B.
   */
  wasAriaLabelledbyReferenced?: boolean;
  /**
   * Indicates whether a node is a label for another node
   * whose text alternative is being computed.
   * i.e 'referenced' by a node that has been traversed
   * by the algorithm.
   */
  isLabelReference?: boolean;
  /**
   * 'inherited' object stores any context properties
   * that are to be passed on to a new 'current node'
   * from the previous 'current node'.
   */
  inherited: {
    isLabelDescendant?: boolean;
    visitedNodes: Node[];
  };
}

/**
 * Returns a context instance in its default state.
 */
export function getDefaultContext(): Context {
  return {
    inherited: {
      visitedNodes: [],
    },
  };
}
