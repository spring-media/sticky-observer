import {
  addClass,
  addPlaceholder,
  addStickyClass,
  recalculateOnNormalState,
  removeClass,
  removePlaceholder,
  removeResizeEvent,
  removeScrollEvent,
  removeStickyClass,
  toNumber,
  toStyleClasses
} from './helper';
import { StickyHTMLElement, StickyState } from './types';

describe('addClass(): adding classes to an element', (): void => {
  let element: HTMLElement;
  let add: (value: string) => void;

  beforeEach((): void => {
    element = document.createElement('div');
    add = addClass(element);
  });

  it('should add a single class', (): void => {
    add('foo');
    expect(element.classList.contains('foo')).toBeTruthy();
  });

  it('should add multiple classes', (): void => {
    add('foo bar');
    expect(element.classList.contains('foo')).toBeTruthy();
    expect(element.classList.contains('bar')).toBeTruthy();
  });

  it('should not add anything when `value` is empty', (): void => {
    add('');
    expect(element.classList.length).toBe(0);
  });
});

describe('removeClass(): remove classes from an element', (): void => {
  let element: HTMLElement;
  let remove: (value: string) => void;

  beforeEach((): void => {
    element = document.createElement('div');
    remove = removeClass(element);
  });

  it('should remove a single class', (): void => {
    element.classList.add('foo');
    expect(element.classList.contains('foo')).toBeTruthy();
    remove('foo');
    expect(element.classList.contains('foo')).toBeFalsy();
  });

  it('should remove multiple classes', (): void => {
    element.classList.add('foo');
    element.classList.add('bar');
    expect(element.classList.contains('foo')).toBeTruthy();
    expect(element.classList.contains('bar')).toBeTruthy();
    remove('foo bar');
    expect(element.classList.contains('foo')).toBeFalsy();
    expect(element.classList.contains('bar')).toBeFalsy();
  });

  it('should not remove anything when `value` is empty', (): void => {
    element.classList.add('foo');
    remove('');
    expect(element.classList.length).toBe(1);
  });
});

describe('addStickyClass(): maybe adding the configured sticky class', (): void => {
  let element: StickyHTMLElement;
  let add: () => void;

  beforeEach((): void => {
    const div: HTMLElement = document.createElement('div');
    element = div as StickyHTMLElement;
    element.sticky = {} as any;

    add = addStickyClass(element);
  });

  it('should add all elements of `stickyClass` to the [class] attr', (): void => {
    element.sticky.stickyClass = ['foo', 'bar'];
    add();
    expect(element.classList.contains('foo')).toBeTruthy();
    expect(element.classList.contains('bar')).toBeTruthy();
  });

  it('should not add anything when `stickyClass` is undefined', (): void => {
    element.sticky.stickyClass = undefined;
    add();
    expect(element.classList.length).toBe(0);
  });
});

describe('removeStickyClass(): maybe removing the configured sticky class', (): void => {
  let element: StickyHTMLElement;
  let remove: () => void;

  beforeEach((): void => {
    const div: HTMLElement = document.createElement('div');
    element = div as StickyHTMLElement;
    element.sticky = {} as any;

    remove = removeStickyClass(element);
  });

  it('should remove all elements of `stickyClass` to the [class] attr', (): void => {
    element.sticky.stickyClass = ['foo', 'bar'];
    remove();
    expect(element.classList.contains('foo')).toBeFalsy();
    expect(element.classList.contains('bar')).toBeFalsy();
  });

  it('should not remove anything when `stickyClass` is undefined', (): void => {
    element.classList.add('foo');
    element.sticky.stickyClass = undefined;
    remove();
    expect(element.classList.length).toBe(1);
  });
});

describe('placeholder: avoiding content jumps when sticky element switches from normal to sticky', (): void => {
  let parent: HTMLElement;
  let stickyElement: StickyHTMLElement;
  let add: () => HTMLElement | undefined;
  let remove: () => void;

  beforeEach((): void => {
    const div: HTMLElement = document.createElement('div');
    parent = document.createElement('div');
    stickyElement = div as StickyHTMLElement;
    stickyElement.sticky = {} as any;
    parent.appendChild(stickyElement);
    document.body.appendChild(parent);
    stickyElement.sticky.nonStickyHeight = 100;

    add = addPlaceholder(stickyElement);
    remove = removePlaceholder(stickyElement);
  });

  afterEach((): void => {
    document.body.removeChild(parent);
  });

  describe('adding', (): void => {
    it('should add placeholder `<div/>` element', (): void => {
      add();

      expect(parent.children.length).toBe(2);
      expect(stickyElement.sticky.placeholder).toBeDefined();
    });

    it('should add only one placeholder', (): void => {
      add();
      add();
      add();
      add();

      expect(parent.children.length).toBe(2);
    });

    it('should add a style class when configured via [data] attr', (): void => {
      stickyElement.dataset.stickyPlaceholderClass = 'foo-bar';
      add();
      expect(stickyElement.sticky.placeholder!.classList.contains('foo-bar')).toBeTruthy();
    });

    it('should not add style class when no [data] attr defined', (): void => {
      add();
      expect(stickyElement.sticky.placeholder!.classList.length).toBe(0);
    });

    it('should add `height` style property with the non sticky height value only when auto height is `true`', (): void => {
      stickyElement.sticky.placeholderAutoHeight = true;
      add();
      expect(stickyElement.sticky.placeholder!.style.height).toBe('100px');
    });

    it('should not set `height` style property when auto height is `false`', (): void => {
      stickyElement.sticky.placeholderAutoHeight = false;
      add();
      expect(stickyElement.sticky.placeholder!.style.height).toBe('');
    });
  });

  describe('removing', (): void => {
    it('should remove placeholder when defined', (): void => {
      add();
      expect(parent.children.length).toBe(2);
      expect(stickyElement.sticky.placeholder).toBeDefined();
      remove();
      expect(parent.children.length).toBe(1);
      expect(stickyElement.sticky.placeholder).toBeUndefined();
    });
  });
});

describe('re-calculation positions', (): void => {
  let element: StickyHTMLElement;

  beforeEach((): void => {
    const div: HTMLElement = document.createElement('div');
    const fakeRect: any = {
      width: null,
      height: null,
      left: null,
      top: null
    };
    element = div as StickyHTMLElement;
    element.sticky = {} as any;
    element.sticky.rect = fakeRect;
    (element.sticky.container as any) = {} as any;
    element.sticky.container.rect = fakeRect;
  });

  it(`should re-calculate sticky element and sticky body container only on 'NORMAL' state.
       This is important for async/dynamic containers (commercials).`, (): void => {
    // Info:
    // A better impl. would be:
    // 1. new container appears
    // 2. component of the new container tells some kind of EventSystem/Stream/Store there is a new container
    // 3. an update event is fired
    // 4. Sticky component registered to the event
    // 5. Sticky component re-calculates position on this event
    //
    // The current impl. is:
    // On every f*cking scroll event we re-calculate the position because we don't know if something has changed.
    element.sticky.state = StickyState.NORMAL;
    recalculateOnNormalState(element);
    expect(element.sticky.rect.width).not.toBeNull();
    expect(element.sticky.container.rect.width).not.toBeNull();
  });

  it(`should not re-calculate on 'STICKY' mode. This is only for minimizing the overhead.`, (): void => {
    element.sticky.state = StickyState.STICKY;
    recalculateOnNormalState(element);
    expect(element.sticky.rect.width).toBeNull();
    expect(element.sticky.container.rect.width).toBeNull();
  });
});

describe('toNumber(): a simpler but not 100% correct lodash/toNumber impl.', (): void => {
  it('should parse integer numbers', (): void => {
    expect(toNumber('5')).toBe(5);
  });

  it('should parse floating numbers to integers', (): void => {
    expect(toNumber('1.1')).toBe(1);
  });

  it('should not parse string values', (): void => {
    expect(toNumber('foo')).toBeUndefined();
  });

  it('should not parse undefined', (): void => {
    expect(toNumber(undefined)).toBeUndefined();
  });
});

describe('toStyleClasses(): from string to string[]', (): void => {
  it('should split values', (): void => {
    expect(toStyleClasses('foo bar')).toEqual(['foo', 'bar']);
  });

  it('should filter empty strings', (): void => {
    expect(toStyleClasses(' foo bar    baz')).toEqual(['foo', 'bar', 'baz']);
  });

  it('should return an empty array by undefined value', (): void => {
    expect(toStyleClasses(undefined)).toEqual([]);
  });
});

describe('removeResizeEvent(): removing the global resize event for the sticky element', (): void => {
  let stickyElement: StickyHTMLElement;

  beforeEach((): void => {
    const div: HTMLElement = document.createElement('div');
    stickyElement = div as StickyHTMLElement;
    stickyElement.sticky = {} as any;
  });

  it('should remove global sticky element resize event', (): void => {
    const removeMock: jest.Mock<{}> = jest.fn();
    window.removeEventListener = removeMock;

    stickyElement.sticky.resizeListener = jest.fn();

    removeResizeEvent(stickyElement);
    expect(removeMock).toBeCalled();
  });

  it('should not remove resize event when sticky element did not have any', (): void => {
    const removeMock: jest.Mock<{}> = jest.fn();
    window.removeEventListener = removeMock;

    removeResizeEvent(stickyElement);
    expect(removeMock).not.toBeCalled();
  });
});

describe('removeScrollEvent(): removing the global scroll event for the sticky element', (): void => {
  let stickyElement: StickyHTMLElement;

  beforeEach((): void => {
    const div: HTMLElement = document.createElement('div');
    stickyElement = div as StickyHTMLElement;
    stickyElement.sticky = {} as any;
  });

  it('should remove global sticky element resize event', (): void => {
    const removeMock: jest.Mock<{}> = jest.fn();
    window.removeEventListener = removeMock;

    stickyElement.sticky.scrollListener = jest.fn();

    removeScrollEvent(stickyElement);
    expect(removeMock).toBeCalled();
  });

  it('should not remove resize event when sticky element did not have any', (): void => {
    const removeMock: jest.Mock<{}> = jest.fn();
    window.removeEventListener = removeMock;

    removeScrollEvent(stickyElement);
    expect(removeMock).not.toBeCalled();
  });
});
