/**
 * This interface will be used to pass additional information
 * about the element whose name is being computed.
 */
export interface Context {
  /**
   * Indicates whether a node is referenced by aria-labelledby.
   * This would be set to true as nodes are processed in rule 2B.
   */
  ariaLabelledbyReference?: boolean;
  /**
   * Indicates whether a node is a label for another node,
   * i.e. a HTML label
   * This would be set to true by rule 2D.
   */
  labelReference?: boolean;
}
