var accname = (function (exports) {
    'use strict';

    /**
     * Returns a context instance in its default state.
     */
    function getDefaultContext() {
        return {
            inherited: {
                visitedNodes: [],
                nodesUsed: new Set(),
                rulesApplied: new Set(),
            },
        };
    }

    /** `element.matches(selector)` with a polyfill for IE */
    function matches(element, selector) {
        var _a, _b, _c, _d, _e;
        return ((_e = (_b = (_a = element.matches) === null || _a === void 0 ? void 0 : _a.call(element, selector)) !== null && _b !== void 0 ? _b : (_d = (_c = element).msMatchesSelector) === null || _d === void 0 ? void 0 : _d.call(_c, selector)) !== null && _e !== void 0 ? _e : element.webkitMatchesSelector(selector));
    }
    /** `element.closest(selector)` with a polyfill for IE */
    function closest(element, selector) {
        if (element.closest) {
            return element.closest(selector);
        }
        while (!matches(element, selector)) {
            if (element.parentElement === null) {
                return null;
            }
            element = element.parentElement;
        }
        return element;
    }

    /*
      util.ts contains helper functions that are used by more than one rule.
    */
    /**
     * Calculates whether or not a given element is focusable.
     * @param elem - The element whose focusability is to be calculated.
     */
    function isFocusable(elem) {
        // See https://html.spec.whatwg.org/multipage/interaction.html#the-tabindex-attribute
        if ((elem instanceof HTMLAnchorElement ||
            elem instanceof HTMLAreaElement ||
            elem instanceof HTMLLinkElement) &&
            elem.hasAttribute('href')) {
            return true;
        }
        if ((elem instanceof HTMLInputElement ||
            elem instanceof HTMLSelectElement ||
            elem instanceof HTMLTextAreaElement ||
            elem instanceof HTMLButtonElement) &&
            !elem.hasAttribute('disabled')) {
            return true;
        }
        return elem.hasAttribute('tabindex') || elem.isContentEditable;
    }

    /**
     * Looks at a variety of characteristics (CSS, size on screen, attributes)
     * to determine if 'node' should be considered hidden
     * @param node - node whose hidden-ness is being calculated
     * @return - whether or not the node is considered hidden
     */
    // #SPEC_ASSUMPTION (A.2) : definition of 'hidden'
    function isHidden(node, context) {
        if (!(node instanceof HTMLElement)) {
            return false;
        }
        // #SPEC_ASSUMPTION (A.3) : options shouldn't be hidden
        if (node instanceof HTMLOptionElement &&
            closest(node, 'select') !== null &&
            context.inherited.partOfName) {
            return false;
        }
        const notDisplayed = node.offsetHeight === 0 && node.offsetWidth === 0;
        if (notDisplayed && !isFocusable(node)) {
            return true;
        }
        const visibility = window.getComputedStyle(node).visibility;
        if (visibility === 'hidden') {
            return true;
        }
        const hiddenAncestor = closest(node, '[hidden],[aria-hidden="true"]');
        if (hiddenAncestor !== null) {
            return true;
        }
        return false;
    }
    /**
     * Condition for applying rule 2A
     * @param node - The node whose text alternative is being calculated
     * @param context - Additional information relevant to the text alternative
     *     computation for node
     * @return - Whether or not node satisfies the condition for rule 2A
     */
    function rule2ACondition(node, context) {
        // #SPEC_ASSUMPTION (A.1) : definition of 'directly referenced'
        return isHidden(node, context) && !context.directLabelReference;
    }
    /**
     * Implementation of rule 2A
     * @param node - The element whose text alternative is being calculated
     * @param context - Additional information relevant to the text alternative
     *     computation for node
     * @return - The text alternative string is returned if condition is true,
     * null is returned otherwise, indicating that the condition of this rule was
     * not satisfied.
     */
    function rule2A(node, context = getDefaultContext()) {
        let result = null;
        if (rule2ACondition(node, context)) {
            result = '';
        }
        return result;
    }

    /**
     * Get any HTMLElement referenced in the aria-labelledby attribute
     * of 'elem' that exist in the document (i.e is 'valid')
     * @param elem - element whose aria-labelledby attribute is considered
     * @return - An array of any HTMLElement in the document that is referenced
     * by elem's aria-labelledby
     */
    function resolveValidAriaLabelledbyIdrefs(elem) {
        var _a, _b;
        const idrefs = (_b = (_a = elem.getAttribute('aria-labelledby')) === null || _a === void 0 ? void 0 : _a.split(' ')) !== null && _b !== void 0 ? _b : [];
        const validElems = [];
        for (const id of idrefs) {
            const elem = document.getElementById(id);
            if (elem) {
                validElems.push(elem);
            }
        }
        return validElems;
    }
    /**
     * Implementation of rule 2B
     * @param node - node whose text alternative is being computed
     * @param context - Additional information relevant to the text alternative
     * computation for node
     * @return - The text alternative string is returned if condition is true,
     * null is returned otherwise, indicating that the condition of this rule was
     * not satisfied.
     */
    function rule2B(node, context = getDefaultContext()) {
        if (!(node instanceof HTMLElement)) {
            return null;
        }
        // #SPEC_ASSUMPTION (B.1) : definition of 'part of an aria-labelledby traversal'
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
            }).name;
        })
            .join(' ')
            .trim();
    }

    // Input types that imply role 'textbox' if list attribute is not present,
    // and imply role 'combobox' if list attribute is present.
    const TEXT_INPUT_TYPES = ['email', 'tel', 'text', 'url', 'search'];
    /**
     * Determines whether a given node has role 'textbox' and,
     * if so, gets the value of that textbox.
     * @param node - element whose role is being calculated
     * @return - textbox value if node is a textbox, null otherwise
     * (null indicates that node is not a textbox).
     */
    function getValueIfTextbox(node) {
        // #SPEC_ASSUMPTION (E.3) : Explicit role='textbox' are handled by rule2F.
        // Handles the case where node role is explictly overwritten
        const nodeRole = node.getAttribute('role');
        if (nodeRole && nodeRole !== 'textbox') {
            return null;
        }
        // type <textarea> implies role='textbox'
        if (node instanceof HTMLTextAreaElement) {
            return node.value;
        }
        // <input> with certain type values & no list attribute implies role='textbox'
        if (node instanceof HTMLInputElement &&
            TEXT_INPUT_TYPES.includes(node.type) &&
            !node.hasAttribute('list')) {
            return node.value;
        }
        return null;
    }
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
    function getValueIfComboboxOrListbox(node, context) {
        // Handles the case where node role is explictly overwritten
        const nodeRole = node.getAttribute('role');
        if (nodeRole && nodeRole !== 'listbox' && nodeRole !== 'combobox') {
            return null;
        }
        // Combobox role implied by input type and presence of list attribute,
        // chosen option is the input value.
        if (node instanceof HTMLInputElement &&
            TEXT_INPUT_TYPES.includes(node.type) &&
            (node.hasAttribute('list') || nodeRole === 'combobox')) {
            return node.value;
        }
        // Text alternative for elems of role 'listbox' and 'combobox'
        // consists of the text alternatives for their selected options.
        let selectedOptions = [];
        // Listbox may be defined explicitly using 'role',
        // and using 'aria-selected' attribute to mark selected options.
        if (nodeRole && nodeRole === 'listbox') {
            selectedOptions = Array.from(node.querySelectorAll('[role="option"][aria-selected="true"]'));
        }
        // A <select> element is always implicitly either a listbox or a combobox
        else if (node instanceof HTMLSelectElement) {
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
                }).name;
            })
                .filter(alternativeText => alternativeText !== '')
                .join(' ');
        }
        return null;
    }
    // Input types that imply role 'range'
    const RANGE_INPUT_TYPES = ['number', 'range'];
    // Roles for whom 'range' is a superclass.
    // Each of these roles explicitly defines the 'range' role.
    const RANGE_ROLES = ['spinbutton', 'slider', 'progressbar', 'scrollbar'];
    /**
     * Determines whether a given node has role 'range' and,
     * if so, gets the text alternative for that node.
     * @param node - node whose role is being calculated
     * @return - text alternative for node if node is a 'range',
     * null otherwise (indicating that node is not a range).
     */
    function getValueIfRange(node) {
        var _a;
        const nodeRoleAttribute = (_a = node.getAttribute('role')) !== null && _a !== void 0 ? _a : '';
        const isExplicitRange = RANGE_ROLES.includes(nodeRoleAttribute);
        // Handles the case where node role is explictly overwritten
        if (nodeRoleAttribute && !isExplicitRange) {
            return null;
        }
        const isImplicitRange = (node instanceof HTMLInputElement &&
            RANGE_INPUT_TYPES.includes(node.type)) ||
            node instanceof HTMLProgressElement;
        if (isExplicitRange || isImplicitRange) {
            if (node.hasAttribute('aria-valuetext')) {
                return node.getAttribute('aria-valuetext');
            }
            if (node.hasAttribute('aria-valuenow')) {
                return node.getAttribute('aria-valuenow');
            }
            if (node instanceof HTMLInputElement) {
                return node.value;
            }
            if (node instanceof HTMLProgressElement) {
                return node.value.toString();
            }
        }
        return null;
    }
    /**
     * Implementation for rule 2E.
     * @param node - node whose text alternative is being calculated
     * @param context - additional information relevant to the computation of a text
     * alternative for node.
     * @return text alternative for 'node' if rule 2E accepts 'node', null otherwise.
     */
    function rule2E(node, context = getDefaultContext()) {
        if (!(node instanceof HTMLElement)) {
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

    /**
     * Implementation for rule 2C
     * @param node - node whose text alternative is being computed
     * @param context - information relevant to the computation of node's text alternative
     * @return text alternative for 'node' if rule 2C accepts 'node', null otherwise.
     */
    function rule2C(node, context = getDefaultContext()) {
        var _a;
        if (!(node instanceof HTMLElement)) {
            return null;
        }
        const ariaLabel = (_a = node.getAttribute('aria-label')) !== null && _a !== void 0 ? _a : '';
        if (ariaLabel.trim() === '') {
            return null;
        }
        // #SPEC_ASSUMPTION (C.1) : 'part of name' implies 'traversal
        // due to recursion'.
        if (context.inherited.partOfName) {
            // 'rule2EResult !== null' indicates that 'node' is an embedded
            // control as defined in step 2E.
            const rule2EResult = rule2E(node, { inherited: context.inherited });
            if (rule2EResult !== null) {
                return rule2EResult;
            }
        }
        return ariaLabel;
    }

    /**
     * Implementation for rule 2D
     * @param node - the node whose text alternative is being computed
     * @param context - information relevant to the text alternative computation
     * for node
     * @return - text alternative for node if the conditions for applying
     * rule 2D are satisfied, null otherwise.
     */
    function rule2D(node, context = getDefaultContext()) {
        var _a;
        // <title>s define text alternatives for <svg>s
        // See: https://www.w3.org/TR/svg-aam-1.0/#mapping_additional_nd
        if (node instanceof SVGElement) {
            for (const child of node.childNodes) {
                if (child instanceof SVGTitleElement) {
                    return child.textContent;
                }
            }
        }
        if (!(node instanceof HTMLElement)) {
            return null;
        }
        const roleAttribute = (_a = node.getAttribute('role')) !== null && _a !== void 0 ? _a : '';
        if (roleAttribute === 'presentation' || roleAttribute === 'none') {
            return null;
        }
        // #SPEC_ASSUMPTION (D.1) : html-aam (https://www.w3.org/TR/html-aam-1.0/)
        // specifies all native attributes and elements that define a text alternative.
        if (LABELLABLE_ELEMENT_TYPES.includes(node.tagName)) {
            const labelText = getTextIfLabelled(node, context);
            if (labelText) {
                return labelText;
            }
        }
        // If input is not <label>led, use native attribute /
        // element information to compute a text alternative
        if (node instanceof HTMLInputElement) {
            const inputTextAlternative = getUnlabelledInputText(node);
            if (inputTextAlternative) {
                return inputTextAlternative;
            }
        }
        // <caption>s define text alternatives for <table>s
        if (node instanceof HTMLTableElement) {
            const captionElem = node.querySelector('caption');
            if (captionElem) {
                context.inherited.partOfName = true;
                return computeTextAlternative(captionElem, {
                    inherited: context.inherited,
                }).name;
            }
        }
        // <figcaption>s define text alternatives for <figure>s
        // Checking tagName due to lack of HTMLFigureElement
        if (node.tagName === 'FIGURE') {
            const figcaptionElem = node.querySelector('figcaption');
            if (figcaptionElem) {
                context.inherited.partOfName = true;
                return computeTextAlternative(figcaptionElem, {
                    inherited: context.inherited,
                }).name;
            }
        }
        // <legend>s define text alternatives for <fieldset>s
        if (node instanceof HTMLFieldSetElement) {
            const legendElem = node.querySelector('legend');
            if (legendElem) {
                context.inherited.partOfName = true;
                return computeTextAlternative(legendElem, {
                    inherited: context.inherited,
                }).name;
            }
        }
        // alt attributes define text alternatives for
        // <img>s and <area>s
        const altAttribute = node.getAttribute('alt');
        if (altAttribute &&
            (node instanceof HTMLImageElement || node instanceof HTMLAreaElement)) {
            return altAttribute;
        }
        return null;
    }
    /**
     * Process elem's text alternative if elem is an <input>, assuming
     * that no <label> element references elem.
     * @param elem - element whose text alternative is being processed
     * @return - text alternative of elem if elem is an <input>
     */
    function getUnlabelledInputText(elem) {
        // Implementation reflects rules defined in sections 5.1 - 5.3 of html-aam spec:
        // https://www.w3.org/TR/html-aam-1.0/#accessible-name-and-description-computation
        var _a;
        const inputType = (_a = elem.getAttribute('type')) !== null && _a !== void 0 ? _a : '';
        if ((inputType === 'button' ||
            inputType === 'submit' ||
            inputType === 'reset') &&
            elem.hasAttribute('value')) {
            return elem.value;
        }
        if (inputType === 'submit' || inputType === 'reset') {
            // This should be a localised string, but for now we are
            // just supporting English.
            return inputType;
        }
        if (inputType === 'image' && elem.hasAttribute('alt')) {
            return elem.getAttribute('alt');
        }
        if (inputType === 'image' && !elem.hasAttribute('title')) {
            // This should be a localised string, but for now we are
            // just supporting English.
            return 'Submit Query';
        }
        // Title attribute handled by 2I.
        return null;
    }
    // Only certain element types are labellable
    // See: https://html.spec.whatwg.org/multipage/forms.html#category-label
    const LABELLABLE_ELEMENT_TYPES = [
        'BUTTON',
        'INPUT',
        'METER',
        'OUTPUT',
        'PROGRESS',
        'SELECT',
        'TEXTAREA',
    ];
    /**
     * Gets the text alternative as defined by one or more native <label>s.
     * @param elem - element whose text alternative is being calculated
     * @param context - information relevant to the computation of elem's text alternative
     * @return - the text alternative for elem if elem is legally labelled by a native
     * <label>, null otherwise.
     */
    function getTextIfLabelled(elem, context) {
        // Using querySelectorAll to get <label>s in DOM order.
        const allLabelElems = document.querySelectorAll('label');
        const labelElems = Array.from(allLabelElems).filter(label => {
            return label.control === elem;
        });
        const textAlternative = labelElems
            .map(labelElem => computeTextAlternative(labelElem, {
            directLabelReference: true,
            inherited: context.inherited,
        }).name)
            .filter(text => text !== '')
            .join(' ');
        return textAlternative || null;
    }

    const ALWAYS_NAME_FROM_CONTENT = {
        // Explicit roles allowing 'name from content'
        // (https://www.w3.org/TR/wai-aria-1.1/#namefromcontent)
        roles: [
            'button',
            'cell',
            'checkbox',
            'columnheader',
            'gridcell',
            'heading',
            'link',
            'menuitem',
            'menuitemcheckbox',
            'menuitemradio',
            'option',
            'radio',
            'row',
            'rowgroup',
            'rowheader',
            'switch',
            'tab',
            'tooltip',
            'tree',
            'treeitem',
        ],
        // HTML element types that allow name from content according
        // to their implicit aria roles.
        // (https://www.w3.org/TR/html-aria/#docconformance)
        tags: [
            'button',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'summary',
            'tbody',
            'tfoot',
            'thead',
        ],
    };
    // See https://lists.w3.org/Archives/Public/public-aria/2017Jun/0057.html
    // for discussion of roles & tags that forbid name from content.
    //
    // *This case is not explicitly included in version 1.1 of the spec, however,
    // as per the thread linked above we have included it (as have other implementations).
    const NEVER_NAME_FROM_CONTENT = {
        roles: [
            'alert',
            'alertdialog',
            'application',
            'article',
            'banner',
            'complementary',
            'contentinfo',
            'definition',
            'dialog',
            'directory',
            'document',
            'feed',
            'figure',
            'form',
            'grid',
            'group',
            'img',
            'list',
            'listbox',
            'log',
            'main',
            'marquee',
            'math',
            'menu',
            'menubar',
            'navigation',
            'note',
            'radiogroup',
            'region',
            'row',
            'rowgroup',
            'scrollbar',
            'search',
            'searchbox',
            'separator',
            'slider',
            'spinbutton',
            'status',
            'table',
            'tablist',
            'tabpanel',
            'term',
            'textbox',
            'timer',
            'toolbar',
            'tree',
            'treegrid',
        ],
        tags: [
            'article',
            'aside',
            'body',
            'datalist',
            'dialog',
            'fieldset',
            'figure',
            'footer',
            'form',
            'header',
            'hr',
            'img',
            'input',
            'main',
            'math',
            'menu',
            'nav',
            'optgroup',
            'section',
            'select',
            'textarea',
        ],
    };
    // List 3 from https://lists.w3.org/Archives/Public/public-aria/2017Jun/0057.html
    const SOMETIMES_NAME_FROM_CONTENT = {
        roles: [
            'contentinfo',
            'definition',
            'directory',
            'list',
            'note',
            'status',
            'table',
            'term',
        ],
        tags: ['dd', 'details', 'dl', 'ol', 'output', 'table', 'ul'],
    };
    /**
     * Some HTML elements allow name from context only if certain
     * conditions apply. This function maps element types to functions that
     * determine if a specific element of that type allows name from content
     * (https://www.w3.org/TR/html-aria/#docconformance)
     * @param elemNodeName - the nodeName (tag type) of the element whose ability
     * to allow name from content is being calculated.
     * @return - a function that may be applied to an element of type elemNodeName
     * that returns true if that node allows name from content, and false otherwise.
     */
    function getFunctionCalculatingAllowsNameFromContent(elemNodeName) {
        switch (elemNodeName) {
            case 'th':
                return (elem) => {
                    return closest(elem, 'table') !== null;
                };
            case 'td':
                return (elem) => {
                    return closest(elem, 'table') !== null;
                };
            case 'option':
                return (elem) => {
                    return closest(elem, 'select,datalist') !== null;
                };
            case 'a':
                return (elem) => {
                    return elem.hasAttribute('href');
                };
            case 'area':
                return (elem) => {
                    return elem.hasAttribute('href');
                };
            case 'link':
                return (elem) => {
                    return elem.hasAttribute('href');
                };
            default:
                return null;
        }
    }
    /**
     * Checks if a given HTMLElement matches any of the roles in a given RoleType.
     * @param elem - element whose role type is in question.
     * @param roleType - lists of indicators for some role type.
     */
    function matchesRole(elem, roleType) {
        var _a, _b;
        // Explicit roles : specified using 'role' attribute
        const explicitRole = (_b = (_a = elem.getAttribute('role')) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase()) !== null && _b !== void 0 ? _b : '';
        if (roleType.roles.includes(explicitRole)) {
            return true;
        }
        // Implicit roles : implied by current node tag name.
        const elemNodeName = elem.nodeName.toLowerCase();
        if (roleType.tags.includes(elemNodeName)) {
            return true;
        }
        return false;
    }
    /**
     * Checks if the contents of 'elem' with context 'context' should
     * be used in its accesssible name. This is the condition for
     * rule 2F.
     * @param elem - elem whose text alternative is being computed
     * @param context - additional information about the context of elem
     * @return - whether or not rule 2Fs condition has been satisfied
     */
    function allowsNameFromContent(elem, context) {
        // The terms 'list 1', 'list 2', 'list 3' are used in reference
        // to the following thread: see: https://lists.w3.org/Archives/Public/public-aria/2017Jun/0057.html
        var _a;
        // Handles list 3 roles
        if (context.inherited.partOfName && elem.parentElement) {
            const parent = elem.parentElement;
            if (matchesRole(parent, ALWAYS_NAME_FROM_CONTENT) &&
                matchesRole(elem, SOMETIMES_NAME_FROM_CONTENT)) {
                return true;
            }
        }
        // Handles list 2 roles
        if (matchesRole(elem, NEVER_NAME_FROM_CONTENT)) {
            // role=menu should not allow name from content even if focusable.
            // See http://wpt.live/accname/name_test_case_733-manual.html
            if (((_a = elem.getAttribute('role')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'menu') {
                return false;
            }
            return isFocusable(elem);
        }
        // Handles list 1 roles
        if (matchesRole(elem, ALWAYS_NAME_FROM_CONTENT)) {
            return true;
        }
        // Elements that conditionally have an implicit role that matches
        // ALWAYS_NAME_FROM_CONTENT
        const elemNodeName = elem.nodeName.toLowerCase();
        const nameFromContentFunction = getFunctionCalculatingAllowsNameFromContent(elemNodeName);
        if (nameFromContentFunction && nameFromContentFunction(elem)) {
            return true;
        }
        if (context.directLabelReference) {
            return true;
        }
        if (context.inherited.partOfName) {
            return true;
        }
        return false;
    }
    /**
     * Gets text content generated by CSS pseudo elements for a given HTMLElement
     * @param elem - element whose css generated content is being calculated
     * @param pseudoElementName - the name of the pseudo element whose content is
     * being resolved.
     * @return - css generated content for pseudoElementName if such content exists,
     * empty string otherwise.
     */
    function getCssContent(elem, pseudoElementName) {
        const computedStyle = window.getComputedStyle(elem, pseudoElementName);
        const cssContent = computedStyle.content;
        const isBlockDisplay = computedStyle.display === 'block';
        // <string> CSS content identified by surrounding quotes
        // see: https://developer.mozilla.org/en-US/docs/Web/CSS/content
        // and: https://developer.mozilla.org/en-US/docs/Web/CSS/string
        if ((cssContent[0] === '"' && cssContent[cssContent.length - 1] === '"') ||
            (cssContent[0] === "'" && cssContent[cssContent.length - 1] === "'")) {
            return isBlockDisplay
                ? ' ' + cssContent.slice(1, -1) + ' '
                : cssContent.slice(1, -1);
        }
        return '';
    }
    // See https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements
    // 'br' removed as it should add a whitespace to the accessible name.
    const inlineTags = [
        'a',
        'abbr',
        'acronym',
        'b',
        'bdi',
        'bdo',
        'big',
        'button',
        'canvas',
        'cite',
        'code',
        'data',
        'datalist',
        'del',
        'dfn',
        'em',
        'embed',
        'i',
        'iframe',
        'img',
        'ins',
        'kbd',
        'label',
        'map',
        'mark',
        'meter',
        'noscript',
        'object',
        'output',
        'picture',
        'progress',
        'q',
        'ruby',
        's',
        'samp',
        'script',
        'select',
        'slot',
        'small',
        'span',
        'strong',
        'sub',
        'sup',
        'template',
        'textarea',
        'time',
        'tt',
        'u',
        'var',
        'video',
        'wbr',
    ];
    /**
     * Implementation of rule 2F
     * @param node - node whose text alternative is being calculated
     * @param context - additional info relevant to the calculation of nodes
     * text alternative
     * @return - text alternative for node if the conditions of 2F are satisfied,
     * null otherwise.
     */
    function rule2F(node, context = getDefaultContext()) {
        if (!(node instanceof HTMLElement)) {
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
        const textAlterantives = [];
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
                }
                else {
                    textAlterantives.push(` ${textAlterantive} `);
                }
            }
        }
        // Consider only non-empty text alternatives to prevent double
        // spacing between text alternatives in accumulatedText.
        // #SPEC_ASSUMPTION (F.1) : that accumulated texts should be space separated
        // for readability
        const accumulatedText = textAlterantives
            .filter(textAlterantive => textAlterantive !== '')
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

    /**
     * Implementation for rule 2G
     * @param node - node whose text alternative is being computed
     * @return - text alternative of node if node is a TEXT_NODE,
     * null otherwise.
     */
    function rule2G(node) {
        var _a, _b;
        if (node.nodeType === Node.TEXT_NODE) {
            // 'Flattening' the string with .replace()
            // #SPEC_ASSUMPTION (G.1) : that the resulting text alternative
            // from 2G should be a flat string.
            return (_b = (_a = node.textContent) === null || _a === void 0 ? void 0 : _a.replace(/\s\s+/g, ' ')) !== null && _b !== void 0 ? _b : '';
        }
        return null;
    }

    // Input types for whom placeholders should be considered when computing
    // a text alternative. See https://www.w3.org/TR/html-aam-1.0/#input-type-text-input-type-password-input-type-search-input-type-tel-input-type-email-input-type-url-and-textarea-element-accessible-name-computation
    const TEXTUAL_INPUT_TYPES = [
        'text',
        'password',
        'search',
        'tel',
        'email',
        'url',
    ];
    /**
     * Implementation for rule 2I
     * @param node - node whose text alternative is being computed
     * @return - text alternative if rule 2I applies to node, null otherwise.
     */
    function rule2I(node) {
        if (!(node instanceof HTMLElement)) {
            return null;
        }
        if (node.title) {
            return node.title;
        }
        // Placeholder considered if no title is present.
        // See https://www.w3.org/TR/html-aam-1.0/#input-type-text-input-type-password-input-type-search-input-type-tel-input-type-email-input-type-url-and-textarea-element-accessible-name-computation
        if (node instanceof HTMLInputElement &&
            TEXTUAL_INPUT_TYPES.includes(node.type)) {
            return node.placeholder;
        }
        if (node instanceof HTMLTextAreaElement && node.hasAttribute('placeholder')) {
            return node.getAttribute('placeholder');
        }
        return null;
    }

    const ruleToImpl = {
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
     * @param node - The node whose text alternative will be calculated
     * @param  context - Additional information relevant to the text alternative
     * computation for node. Optional paramater is 'getDefaultContext' by default.
     * @return - The text alternative for node
     */
    function computeTextAlternative(node, context = getDefaultContext()) {
        context.inherited.nodesUsed.add(node);
        // Try each rule sequentially on the target Node.
        for (const [rule, impl] of Object.entries(ruleToImpl)) {
            const result = impl(node, context);
            // A rule has been applied if its implementation has
            // returned a string.
            if (result !== null) {
                context.inherited.rulesApplied.add(rule);
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

    /**
     * Compute the accessible name for a given HTMLElement.
     * @param elem - The HTMLElement whose accessible name will be calculated.
     */
    function getAccessibleName(elem) {
        return computeTextAlternative(elem).name;
    }
    /**
     * Get details surrounding the computation of the accessible name for a given HTMLElement
     * @param elem - The HTMLElement whose accessible name will be calculated.
     */
    function getNameComputationDetails(elem) {
        return computeTextAlternative(elem);
    }

    exports.getAccessibleName = getAccessibleName;
    exports.getNameComputationDetails = getNameComputationDetails;

    return exports;

}({}));
