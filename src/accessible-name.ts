export default function getAccessibleName(elem: HTMLElement): string {
    let accessibleName: string = '';
    if (elem.nodeType === 3 && elem.textContent) {
        accessibleName = elem.textContent;
    }
    return accessibleName;
}
