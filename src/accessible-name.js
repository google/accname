"use strict";
exports.__esModule = true;
exports.getAccessibleName = void 0;
function getAccessibleName(elem) {
    var accessibleName = '';
    if (elem.nodeType === Node.TEXT_NODE && elem.textContent) {
        accessibleName = elem.textContent;
    }
    return accessibleName;
}
exports.getAccessibleName = getAccessibleName;
