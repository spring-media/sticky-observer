import {
  addClass,
  addPlaceholder,
  addStickyClass,
  noop,
  position,
  recalculateOnNormalState,
  removeClass,
  removePlaceholder,
  removeResizeEvent,
  removeScrollEvent,
  removeStickyClass,
  toNumber,
  toStyleClasses
} from './helper';
import * as states from './states';
import {
  ChangeListeners,
  StickyEvent,
  StickyHTMLContainer,
  StickyHTMLElement,
  StickySettings,
  StickyState
} from './types';

export type StickyEventListener = (event: StickyEvent) => void;

// Info: This is the 'default' (typed) signature of event listeners
// tslint:disable no-any
export type EventListener = (...args: any[]) => any;
// tslint:enable no-any

/**
 * The sticky impl. is mostly from: https://github.com/rgalus/sticky-js
 */
export interface Sticky {
  /**
   * This is a lazy initialize function. Binding all listeners and update sticky element states.
   */
  init(): void;

  /**
   * Starts the sticky mode watcher on all user scroll and window resize events.
   */
  observe(): void;

  /**
   * Pauses the sticky mode watcher. Resets all sticky elements to 'normal'.
   */
  pause(): void;

  /**
   * Is sticky mode watcher active
   */
  isActive(): boolean;

  /**
   * Is sticky mode watcher _not_ active
   */
  isNotActive(): boolean;

  /**
   * Remove all listeners (window + sticky elements)
   */
  destroy(): void;

  /**
   * Callback listener for _every_ update (scroll/resize) to track css position changes. Only when sticky mode watcher is active.
   * Only one listener is allowed.
   */
  onUpdate(listener: StickyEventListener): void;

  /**
   * Callback listener for state transitions: e.g. from 'normal' to 'sticky'. Only when sticky mode watcher is active.
   * Only one listener is allowed.
   */
  onStateChange(listener: StickyEventListener): void;

  /**
   * Callback listener for window resize event. Only when sticky mode watcher is active.
   * Only one listener is allowed.
   */
  onResizeChange(listener: StickyEventListener): void;
}

export class StickyObserver implements Sticky {
  private stickyElements!: StickyHTMLElement[];
  private active: boolean;
  private scrollTop!: number;
  private updateListener: StickyEventListener = noop;
  private stateChangeListener: StickyEventListener = noop;
  private resizeChangeListener: StickyEventListener = noop;
  private readonly globalEventListener: EventListener;

  constructor(private elements: HTMLElement[], private body: HTMLElement, private settings: StickySettings = {}) {
    this.active = false;
    // Info:
    // Initial value
    this.updateScrollTopPosition();
    this.globalEventListener = (): void => this.updateScrollTopPosition();
  }

  public init(): void {
    this.addEventListeners();
    this.stickyElements = this.elements
      .map((element: HTMLElement): StickyHTMLElement => this.enhance(element))
      .map((element: StickyHTMLElement): StickyHTMLElement => this.listen(element));
  }

  public observe(): void {
    if (this.isNotActive()) {
      this.active = true;
      this.stickyElements.forEach((element: StickyHTMLElement): void => this.update(element));
    }
  }

  public pause(): void {
    if (this.isActive()) {
      this.active = false;
      this.stickyElements.forEach(
        (element: StickyHTMLElement): void => {
          const changeListeners: ChangeListeners = this.createChangeListeners();
          states.makeNormal(element, this.scrollTop, changeListeners);
        }
      );
    }
  }

  public isActive(): boolean {
    return this.active === true;
  }

  public isNotActive(): boolean {
    return this.active === false;
  }

  public destroy(): void {
    if (this.isActive()) {
      this.removeEventListeners();
      this.stickyElements.forEach(
        (element: StickyHTMLElement): void => {
          removeResizeEvent(element);
          removeScrollEvent(element);
          delete element.sticky;
        }
      );
      this.active = false;
    }
  }

  public onUpdate(listener: StickyEventListener): void {
    this.updateListener = listener;
  }

  public onStateChange(listener: StickyEventListener): void {
    this.stateChangeListener = listener;
  }

  public onResizeChange(listener: StickyEventListener): void {
    this.resizeChangeListener = listener;
  }

  private enhance(element: HTMLElement): StickyHTMLElement {
    const stickyElement: StickyHTMLElement = element as StickyHTMLElement;

    stickyElement.sticky = {
      offsetTop: this.settings.offsetTop || toNumber(element.dataset.stickyOffsetTop) || 0,
      offsetBottom: this.settings.offsetBottom || toNumber(element.dataset.stickyOffsetBottom) || 0,
      nonStickyHeight: 0,
      rect: position(stickyElement),
      container: this.body as StickyHTMLContainer,
      active: false,
      state: StickyState.NORMAL,
      stickyClass: toStyleClasses(element.dataset.stickyClass),
      placeholderClass: element.dataset.stickyPlaceholderClass,
      placeholderAutoHeight: !!element.dataset.stickyPlaceholderAutoHeight || true,
      addClass: addClass(stickyElement),
      removeClass: removeClass(stickyElement),
      addStickyClass: addStickyClass(stickyElement),
      removeStickyClass: removeStickyClass(stickyElement),
      addPlaceholder: addPlaceholder(stickyElement),
      removePlaceholder: removePlaceholder(stickyElement)
    };
    stickyElement.sticky.nonStickyHeight = stickyElement.sticky.rect.height;
    stickyElement.sticky.container.rect = position(stickyElement.sticky.container);

    return stickyElement;
  }

  private listen(element: StickyHTMLElement): StickyHTMLElement {
    const isStickyPossible: boolean = states.isStickyPossibleAtAll(element);
    if (isStickyPossible) {
      element.sticky.active = true;
      this.addResizeListener(element);
      this.addScrollListener(element);
    }

    return element;
  }

  private update(element: StickyHTMLElement): void {
    if (this.isActive() && element.sticky.active === true) {
      const changeListeners: ChangeListeners = this.createChangeListeners();

      if (states.isStickyEndOfBody(element, this.scrollTop)) {
        states.makeStickyEndOfBody(element, this.scrollTop, changeListeners);
      } else if (states.isSticky(element, this.scrollTop)) {
        states.makeSticky(element, this.scrollTop, changeListeners);
      } else {
        states.makeNormal(element, this.scrollTop, changeListeners);
      }
    }
  }

  private updateScrollTopPosition(): void {
    this.scrollTop = window.pageYOffset;
  }

  private createChangeListeners(): ChangeListeners {
    const update: (event: StickyEvent) => void = (event: StickyEvent): void => this.updateListener(event);
    const stateChange: (event: StickyEvent) => void = (event: StickyEvent): void => this.stateChangeListener(event);

    return { update, stateChange };
  }

  private addEventListeners(): void {
    ['scroll', 'resize'].forEach(
      (eventName: string): void => {
        window.addEventListener(eventName, this.globalEventListener);
      }
    );
  }

  private removeEventListeners(): void {
    ['scroll', 'resize'].forEach(
      (eventName: string): void => {
        window.removeEventListener(eventName, this.globalEventListener);
      }
    );
  }

  private addResizeListener(element: StickyHTMLElement): void {
    element.sticky.resizeListener = (): void => this.onResize(element);
    window.addEventListener('resize', element.sticky.resizeListener);
  }

  private onResize(element: StickyHTMLElement): void {
    if (this.isActive()) {
      // Info:
      // For the re-calculation of the sticky-state after a resize event we need to reset all positioning properties first.
      // This is important but raises some UI problems.
      element.sticky.removeStickyClass();

      const resizeEvent: StickyEvent = {
        prevState: element.sticky.state,
        nextState: element.sticky.state,
        element,
        scrollTop: this.scrollTop
      };
      this.resizeChangeListener(resizeEvent);

      element.sticky.rect = position(element);
      element.sticky.container.rect = position(element.sticky.container);

      const isStickyPossible: boolean = states.isStickyPossibleAtAll(element);

      if (element.sticky.active === true && isStickyPossible) {
        this.update(element);
        // Info:
        // Because of the stickyClass reset we need to re-add the class.
        // When the current state is still `sticky` the `StickyEvent` is not emitted.
        // The result is still an sticky element without sticky-class.
        // This seems to be a hack.
        if (element.sticky.state !== StickyState.NORMAL) {
          element.sticky.addStickyClass();
        }
      }
    }
  }

  private addScrollListener(element: StickyHTMLElement): void {
    element.sticky.scrollListener = (): void => this.onScroll(element);
    window.addEventListener('scroll', element.sticky.scrollListener);
  }

  private onScroll(element: StickyHTMLElement): void {
    if (this.isActive() && element.sticky.active === true) {
      recalculateOnNormalState(element);
      this.update(element);
    }
  }
}
