export enum StickyState {
  /**
   * non-sticky / default state
   */
  NORMAL = 'NORMAL',

  /**
   * sticky state based on the `offsetTop` value
   */
  STICKY = 'STICKY',

  /**
   * below the sticky _body_ container is still space and the user scrolls on
   */
  STICKY_END_OF_BODY = 'STICKY_END_OF_BODY'
}

export interface StickyEvent {
  prevState: StickyState;
  nextState: StickyState;
  element: StickyHTMLElement;
  scrollTop: number;
}

export interface ChangeListeners {
  update(event: StickyEvent): void;

  stateChange(event: StickyEvent): void;
}

export interface Rect {
  width: number;
  height: number;
}

export interface RectPosition extends Rect {
  top: number;
  left: number;
}

export interface StickyHTMLContainer extends HTMLElement {
  rect: RectPosition;
}

export interface StickySettings {
  offsetTop?: number;
  offsetBottom?: number;
}

export interface StickyElement {
  /**
   * top offset for the sticky-breakpoint calculation.
   * via [data]-attr. optional. fallback: 0
   */
  offsetTop: number;

  /**
   * bottom offset for the sticky-end-of-body-breakpoint calculation.
   * via [data]-attr. optional. fallback: 0
   */
  offsetBottom: number;

  /**
   * toggle [class] when element is sticky.
   * via [data]-attr. optional.
   */
  stickyClass?: string[];

  /**
   * a optional placeholder element to avoid content jumps when switch to position fixed.
   */
  placeholder?: HTMLElement;

  /**
   * asd
   */
  placeholderClass?: string;

  /**
   * when `false` the placeholder element does not get the `nonStickyHeight`. This is useful when setting the
   * height via css class.
   * <placeholder style="height: $nonStickyHeight;"/> vs. <placeholder class="my-custom-placeholder-class"/>
   * via [data]-attr. optional. fallback: true
   */
  placeholderAutoHeight: boolean;

  /**
   * saved non-sticky height of the element.
   * used for a placeholder element with the same height.
   */
  nonStickyHeight: number;

  /**
   * position information of the element.
   */
  rect: RectPosition;

  /**
   * current sticky state.
   */
  state: StickyState;

  /**
   * current element active state.
   */
  active: boolean;

  /**
   * the sticky body container.
   */
  readonly container: StickyHTMLContainer;

  /**
   * window.resize event listener.
   */
  resizeListener?: EventListener;

  /**
   * window.scroll event listener.
   */
  scrollListener?: EventListener;

  /**
   * fn to maybe add `value` to the [class] attr.
   */
  addClass(value: string | undefined): void;

  /**
   * fn to maybe remove `value` from the [class] attr.
   */
  removeClass(value: string | undefined): void;

  /**
   * fn to add the sticky [class] to the element.
   * See: styleClass [data] attr
   */
  addStickyClass(): void;

  /**
   * fn to remove the sticky [class] of the sticky element.
   */
  removeStickyClass(): void;

  /**
   * fn to add the placeholder element `<div/>` with the same non-sticky `height` to the DOM.
   * See: `nonStickyHeight`
   * When the sticky element has a [data-sticky-placeholder-class] attr, it adds the the class to the placeholder element.
   */
  addPlaceholder(): HTMLElement | undefined;

  /**
   * fn to remove the placeholder `<div/>` element from the DOM.
   */
  removePlaceholder(): void;
}

export interface StickyHTMLElement extends HTMLElement {
  sticky: StickyElement;
}
