import { ChangeListeners, StickyEvent, StickyHTMLElement, StickyState } from './types';

export function isStickyPossibleAtAll(element: StickyHTMLElement): boolean {
  return (
    element.sticky.rect.top + element.sticky.rect.height <
    element.sticky.container.rect.top + element.sticky.container.rect.height
  );
}

export function isSticky(element: StickyHTMLElement, scrollTop: number): boolean {
  return scrollTop > element.sticky.rect.top - element.sticky.offsetTop;
}

export function isStickyEndOfContainer(element: StickyHTMLElement, scrollTop: number): boolean {
  const elementWithValidState: boolean =
    element.sticky.state === StickyState.STICKY || element.sticky.state === StickyState.STICKY_END_OF_CONTAINER;

  return (
    elementWithValidState &&
    scrollTop + element.sticky.rect.height + element.sticky.offsetTop >
      element.sticky.container.rect.top + element.sticky.container.offsetHeight - element.sticky.offsetBottom
  );
}

export function makeNormal(element: StickyHTMLElement, scrollTop: number, changeListeners: ChangeListeners): void {
  make(StickyState.NORMAL, element, scrollTop, changeListeners);
}

export function makeSticky(element: StickyHTMLElement, scrollTop: number, changeListeners: ChangeListeners): void {
  make(StickyState.STICKY, element, scrollTop, changeListeners);
}

export function makeStickyEndOfContainer(
  element: StickyHTMLElement,
  scrollTop: number,
  changeListeners: ChangeListeners
): void {
  make(StickyState.STICKY_END_OF_CONTAINER, element, scrollTop, changeListeners);
}

function make(
  state: StickyState,
  element: StickyHTMLElement,
  scrollTop: number,
  changeListeners: ChangeListeners
): void {
  const event: StickyEvent = {
    prevState: element.sticky.state,
    nextState: state,
    element,
    scrollTop
  };

  changeListeners.update(event);

  if (element.sticky.state !== state) {
    element.sticky.state = state;
    changeListeners.stateChange(event);
  }
}
