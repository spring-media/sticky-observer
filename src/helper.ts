import { RectPosition, StickyHTMLElement, StickyState } from './types';

export const position: (element: HTMLElement) => RectPosition = (element: HTMLElement): RectPosition => {
  const width: number = Math.max(element.offsetWidth, element.clientWidth, element.scrollWidth);
  const height: number = Math.max(element.offsetHeight, element.clientHeight, element.scrollHeight);
  let top: number = 0;
  let left: number = 0;
  let tmp: HTMLElement | undefined = element;
  do {
    top += tmp.offsetTop || 0;
    left += tmp.offsetLeft || 0;
    tmp = tmp.offsetParent ? (tmp.offsetParent as HTMLElement) : undefined;
  } while (tmp);

  return {
    top,
    left,
    width,
    height
  };
};

// Info:
// In case of new lazy loaded container appears above the sticky container (like ads)
// The sticky breakpoint changes dynamically.
export const recalculateOnNormalState: (element: StickyHTMLElement) => void = (element: StickyHTMLElement): void => {
  if (element.sticky.state === StickyState.NORMAL) {
    element.sticky.rect = position(element);
    element.sticky.container.rect = position(element.sticky.container);
  }
};

export const removeResizeEvent: (element: StickyHTMLElement) => void = (element: StickyHTMLElement): void => {
  if (element.sticky.resizeListener) {
    window.removeEventListener('resize', element.sticky.resizeListener);
  }
};

export const removeScrollEvent: (element: StickyHTMLElement) => void = (element: StickyHTMLElement): void => {
  if (element.sticky.scrollListener) {
    window.removeEventListener('scroll', element.sticky.scrollListener);
  }
};

export const addClass: (element: HTMLElement) => (value: string | undefined) => void = (
  element: HTMLElement
): ((value: string | undefined) => void) => {
  return (value: string | undefined): void => {
    const styleClasses: string[] = toStyleClasses(value);
    if (styleClasses.length > 0) {
      element.classList.add(...styleClasses);
    }
  };
};

export const removeClass: (element: HTMLElement) => (value: string | undefined) => void = (
  element: HTMLElement
): ((value: string | undefined) => void) => {
  return (value: string | undefined): void => {
    const styleClasses: string[] = toStyleClasses(value);
    if (styleClasses.length > 0) {
      element.classList.remove(...styleClasses);
    }
  };
};

export const addStickyClass: (element: StickyHTMLElement) => () => void = (
  element: StickyHTMLElement
): (() => void) => {
  return (): void => {
    if (element.sticky.stickyClass !== undefined) {
      element.classList.add(...element.sticky.stickyClass);
    }
  };
};

export const removeStickyClass: (element: StickyHTMLElement) => () => void = (
  element: StickyHTMLElement
): (() => void) => {
  return (): void => {
    if (element.sticky.stickyClass !== undefined) {
      element.classList.remove(...element.sticky.stickyClass);
    }
  };
};

export const addPlaceholder: (element: StickyHTMLElement) => () => HTMLElement | undefined = (
  element: StickyHTMLElement
): (() => HTMLElement | undefined) => {
  return (): HTMLElement | undefined => {
    if (element.parentElement && element.sticky.placeholder === undefined) {
      const placeholder: HTMLElement = document.createElement('div');
      addClass(placeholder)(element.sticky.placeholderClass);
      if (element.sticky.placeholderAutoHeight) {
        placeholder.style.height = `${element.sticky.nonStickyHeight}px`;
      }
      element.parentElement.insertBefore(placeholder, element.parentElement.firstChild);
      element.sticky.placeholder = placeholder;
      return placeholder;
    }
    return undefined;
  };
};

export const removePlaceholder: (element: StickyHTMLElement) => () => void = (
  element: StickyHTMLElement
): (() => void) => {
  return (): void => {
    if (element.parentElement && element.sticky.placeholder) {
      element.parentElement.removeChild(element.sticky.placeholder);
      delete element.sticky.placeholder;
    }
  };
};

export const toNumber: (value: string | undefined) => number | undefined = (
  value: string | undefined
): number | undefined => {
  if (!value) {
    return undefined;
  }
  return parseInt(value, 10) || undefined;
};

export const noop: () => any = (): any => {
  // noop
};

export const nonEmpty: (v: string) => boolean = (v: string): boolean => v !== undefined && v.trim().length > 0;

export const toStyleClasses: (value: string | undefined) => string[] = (value: string | undefined): string[] =>
  (value || '').split(' ').filter(nonEmpty);
