import { Sticky, StickyObserver } from './StickyObserver';
import { StickyEvent, StickyHTMLElement, StickySettings } from './types';

// Info:
// The fixtures should have a big content block with 5000px height.
// We assume that on scroll depth 2000px the element is sticky.
export const STICKY_PAGE_POSITION: number = 2000;

// Info:
// The fixtures should have a content block with 1000px height above the sticky container.
export const STICKY_END_OF_BODY_POSITION: number = 6000;

// Info:
// `setTimeout` is needed to trigger the event.
const FORCE_BROWSER_EVENT_TIMEOUT: number = 10;

export class StickyTestContext {
  public stickyElement!: HTMLElement;
  public stickyBodyContainer!: HTMLElement;
  private fixtureElement: HTMLElement;

  constructor(fixture: string) {
    // tslint:disable no-inner-html
    this.fixtureElement = document.createElement('div');
    this.fixtureElement.innerHTML = fixture;
    window.document.body.appendChild(this.fixtureElement);
    // tslint:disable no-inner-html
    this.stickyElement = document.getElementById('StickyElement') as HTMLElement;
    this.stickyBodyContainer = document.getElementById('StickyBodyContainer') as HTMLElement;
  }

  public createStickyObserver(settings?: StickySettings): Sticky {
    return new StickyObserver([this.stickyElement], this.stickyBodyContainer, settings);
  }

  public getStickyElement(): StickyHTMLElement {
    return this.stickyElement as StickyHTMLElement;
  }

  public cleanUp(sticky: Sticky): void {
    sticky.destroy();
    window.document.body.removeChild(this.fixtureElement);
    window.scrollTo(0, 0);
  }
}

export async function scrollTo(position: number): Promise<void> {
  return new Promise<void>(
    (resolve: () => void): void => {
      setTimeout(
        (): void => {
          // Info:
          // `scrollTo` will emit native browser scroll event
          window.scrollTo(0, position);
          setTimeout(resolve, FORCE_BROWSER_EVENT_TIMEOUT);
        }
      );
    }
  );
}

export async function scrollToPosition(sticky: Sticky, position: number): Promise<StickyEvent> {
  return new Promise<StickyEvent>(
    (resolve: (e: StickyEvent) => void): void => {
      sticky.onStateChange(resolve);

      setTimeout((): void => {
        // Info:
        // `scrollTo` will emit native browser scroll event
        window.scrollTo(0, position);
      }, FORCE_BROWSER_EVENT_TIMEOUT);
    }
  );
}

export async function triggerResizeEvent(): Promise<void> {
  return new Promise<void>(
    (resolve: () => void): void => {
      // Info:
      // This emits only the resize event without any kind of actual browser winder resize
      setTimeout((): void => {
        window.dispatchEvent(new Event('resize'));
      }, 0);

      setTimeout(resolve, FORCE_BROWSER_EVENT_TIMEOUT);
    }
  );
}
