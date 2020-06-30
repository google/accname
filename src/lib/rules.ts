import { hiddenNode } from './hidden_node';

// This object maps the labels from the steps at https://www.w3.org/TR/accname-1.1/#mapping_additional_nd_te
// to the functions that implement those steps.
const rules: { [key: string]: Function} = {
    '2A': hiddenNode
};

export { rules };