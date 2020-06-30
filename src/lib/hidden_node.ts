/**
 * Condition for applying rule 2A (see spec for details)
 * @param {HTMLElement} elem - The element whose accessible name is being calculated
 * @return {boolean} - Whether of not elem satisfies the condition for rule 2A
 */
function hiddenNodeCondition(elem: HTMLElement): boolean {
  const document: HTMLDocument = elem.getRootNode() as HTMLDocument;

  const hidden: boolean = elem.hasAttribute('hidden');
  let ariaLabelledBy = false;
  let nativeLabel = false;

  const idref: string = elem.id;
  if (idref !== '') {
    // Checks if elem is directly referenced by an aria-labelledby attribute
    // or a label element 'for' attribute
    const ariaLabelledByElems: NodeListOf<Element> = document.querySelectorAll(
      '[aria-labelledby]'
    );
    ariaLabelledByElems.forEach(ariaLabelledByElem => {
      const idrefs = ariaLabelledByElem.getAttribute('aria-labelledby');
      if (idrefs?.includes(idref)) {
        ariaLabelledBy = true;
      }
    });
    nativeLabel = document.querySelector('label[for="' + idref + '"]') !== null;
  }
  return hidden && !ariaLabelledBy && !nativeLabel;
}

/**
 * Implementation of rule 2A
 * @param {HTMLElement} elem - The element whose accessible name is being calculated
 * @return {string | null} - The accessible name string is returned if condition is true,
 * null is returned otherwise, indicating that the condition of this rule was not satisfied.
 */
export function hiddenNode(elem: HTMLElement): string | null {
  let result = null;
  if (hiddenNodeCondition(elem)) {
    result = '';
  }
  return result;
}
