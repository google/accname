// Helper function for shorter 'document.getElementById(id)'
const getElem = (id: string) => document.getElementById(id);

class ElemNotFound extends Error {
  constructor() {
    super(
      'An Element essential to the UI for this app could not be found in the document.'
    );
  }
}
