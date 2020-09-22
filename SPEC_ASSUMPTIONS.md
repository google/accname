# AccName Spec Assumptions

This doc should be used to explain in detail the `#SPEC_ASSUMPTION` comments made in the code for AccName.

W3C spec for accessible name computation: https://www.w3.org/TR/accname-1.1/

## A.1
Step 2A: if node is hidden and not directly referenced by aria-labelledby. Does directly here mean that another element contains elem’s idref?
```html
<div id="fee" hidden>words</div>
<div id="bee" hidden>Hello world <div id="test" aria-labelledby="fee"></div></div>
<div id="foo" aria-labelledby="bee"></div>
```
So in this example div#test is hidden because it has a hidden ancestor, namely div#bee. div#test is not directly referenced by an aria-labelledby, but it is a descendant of a directly referenced node. Because of this rule 2A returns empty string for div#test, resulting in the text alternative for div#foo ignoring the text content of div#fee. Chrome includes div#fee, yielding acc-name(div#foo)=’Hello world words’. But does this ignore rule 2A?

If I make div#bee not hidden then I get ‘Hello world words’. I think that Chrome’s result makes the most sense here, and so maybe ‘direct’ in the spec should be defined, or rule 2A should be changed?

#### Related GitHub Issues:
- https://github.com/w3c/accname/issues/48
- https://github.com/w3c/accname/issues/57
## A.2
Step 2A: ‘hidden’ is defined as ‘not visible, perceivable, or interactive to any user. An element is considered hidden if it or any one of its ancestor elements is not rendered or is explicitly hidden’.

In the context of HTML, CSS we consider an element to be hidden if it:
- Has style ‘visibility: hidden’
- Has an offsetHeight and offsetWidth of 0
- Has ‘hidden’ or ‘aria-hidden=true’ attributes
- Has any ancestors for which any of (1-3) apply
- Is not focusable

#### Related GitHub Issues
- https://github.com/w3c/accname/issues/57
## A.3
Step 2A: We assume that `<option>`s shouldn’t be considered ‘hidden’ if they are part of the text alternative computation for a `<select>` (as handled by 2E role=combobox, listbox).

The labelled chunk of code in 2A `isHidden()` specifically addresses the fact that Chrome considers `<option>` elements (even if selected) to be hidden, according to offsetWidth & Height == 0.

## B.1
Step 2B: ‘already part of an aria-labelledby traversal’ does this mean that any parents have been referenced by aria-labelledby or simply that the referenced node does not go on to aria-labelledby reference another?
```html
<div id='bar' hidden> and some more words</div>
<div id='foo' hidden>
    Some words 
    <div aria-labelledby='bar'></div>
</div>
<div aria-labelledby='foo'></div>
```
Does div#foo’s aria-labelledby=’bar’ count as being part of an aria-labelledby traversal? Chrome says no, and for this example acc-name of div#foo = ‘Some words and some more words’.

We assume that a node must be directly referenced by aria-labelledby to be part of an aria-labelledby traversal.
#### Related GitHub Issues
- https://github.com/w3c/accname/issues/79

## C.1
We assume that context.partOfName is true implies that the current node is being traversed due to recursion. We can make this assumption because partOfName is set to true any time the algorithm is called recursively.
## D.1
We assume that the [HTML Accessibility API Mappings spec](https://www.w3.org/TR/html-aam-1.0/#accessible-name-and-description-computation) lists all instances in which native elements or attributes define a text alternative. It is this document that we used as a guide to implement 2D.

#### Related GitHub PR
- https://github.com/w3c/accname/pull/88

## E.1
Step 2E accepts elements that are ‘embedded within the label [...] for another widget,’. If we consider only label references here (aria-labelledby, native <label>), then we ignore controls that are embedded within nodes that allow name from content (see 2F).
```html
<button>
      Flash the screen
    	<input type="number" value="5"/>
    	times
</button>
```
If 2E doesn’t pick up elements descended from allow name from content elements, then the output is ‘Flash the screen times’, omitting whatever input value is present.

We assume that step 2E should accept elements within allow name from content elements as well as those within labels.

#### Related GitHub PR
- https://github.com/w3c/accname/pull/90

## E.2
Step 2E calculates text alternatives for <select> controls that are part of an accessible name. It defines the text alternative for a <select> as the text alternative for the chosen option in that <select>. This potentially ignores <select>s in which multiple options may be selected.

We assume that if a <select> has multiple selected options, then the text alternative for that <select> should be a string containing the text alternative for each of the selected options separated by spaces.
```html
<select id="foo" multiple>
       <option selected>Hello</option>
       <option selected>world</option>
</select>
```
So under this assumption, accName(div#foo) = ‘Hello world’
	
#### Related GitHub Issues
- https://github.com/w3c/accname/issues/91

## E.3
The term value as used in the ‘textbox’ computation in step 2E is not well defined. We assume that this refers to either:
(i) HTML .value attribute on <input>s, <textarea>s (implicit textboxes with value specified by host language attribute).
(ii) Subtree text content for elements with explicit role=’textbox’.

In case (ii), simply ignoring the text alternative computation in this step results in the node being passed on to 2F for text alternative computation.
## E.4
We assume that the text alternative computation for nodes with role ‘menu button’ is handled by 2F.

This is based on an assumption that the text alternative for a menu button should be calculated in the same way as that of a button as in 2F.

This assumption relies on the fact that all nodes that are accepted by 2E may also be accepted by 2F due to context.partOfName = true. So ignoring the node in 2E simply results in that node being passed on to 2F.

#### Related GitHub PR
- https://github.com/w3c/accname/pull/92

## G.1
Step 2G: It is stated that the accessible name for an element should be a flat string at the end of section 4.3. In step 2D it’s explicitly stated that the text alternative should be a flat string. 
Step 2G, however, does not state that the text alternative should be a flat string -- we are assuming that it should be in order to ensure that the accessible name as a whole is a flat string.
#### Related GitHub Issues
- https://github.com/w3c/accname/issues/63
## CON.1
Context interface: we assume that aria-labelledby and native label references may both be handled by a single boolean node marker directLabelReference. This assumption is made because the two conditions appear alongside one another in rules 2A, 2E, 2F.

We also assume that nodes directly labelled by native labels are part of an aria-labelledby traversal as mentioned in 2B. This means that aria-labelledby attributes on <label> elements [that are currently being used to label an element whose text alternative is being computed] will not be followed.

For example:
```html
<div id="baz">world!</div>
<label id="bar" for="foo" aria-labelledby="baz">
	Hello
</label>
<div id="foo"></div>
```
Under our assumption, accName(div#foo) = ‘Hello’ and accName(label#bar) = ‘world!’
## CON.2
Context interface: we make the assumption that all of the following node conditions are equivalent:
- referenced by aria-labelledby 
- native host language text alternative element 
- traversal of the current node is due to recursion 
- embedded within the label for another widget 
- allows name from content
- a descendant of an element whose Accessible Name is being computed
- And thus that they may all be represented by a single node marker partOfName.

We make this assumption because any node that is accepted by rule 2F will always be sent back to 2F.i by 2H as long as it has descendants, even if it doesn’t satisfy the conditions for 2F.
