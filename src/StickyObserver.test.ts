import { expect } from 'chai';
import sinon from 'sinon';
import { Sticky, StickyObserver } from './StickyObserver';
import {
  scrollTo,
  STICKY_CONTAINER_ID,
  STICKY_ELEMENT_ID,
  STICKY_PAGE_POSITION,
  StickyTestContext,
  triggerResizeEvent
} from './test-helper';
import { StickyHTMLElement, StickyState } from './types';

// Info:
// The sticky element should be always normal even on scrolling
const fixture: string = `
<article id="${STICKY_CONTAINER_ID}">
  <p>...</p>
  <div style="height: 200px;">small block of content</div>
  <p>...</p>
  <div id="${STICKY_ELEMENT_ID}">the sticky element</div>
  <p>...</p>
  <div style="height: 5000px;">large block of content</div>
  <p>...</p>
</article>
<div>
  <div style="height: 1000px;">some more content above the sticky body container</div>
</div>
`;

describe('Sticky Observer', (): void => {
  let sticky: Sticky;
  let stickyTestContext: StickyTestContext;
  let updateScrollPositionSpy: sinon.SinonSpy;
  let windowAddEventListenerSpy: sinon.SinonSpy;

  beforeEach((): void => {
    stickyTestContext = new StickyTestContext(fixture);
  });

  afterEach((): void => {
    stickyTestContext.cleanUp(sticky);
    sinon.restore();
  });

  describe('on instance creation only', (): void => {
    beforeEach((): void => {
      // Info: any
      // Testing internal (private) functions
      // tslint:disable no-any
      updateScrollPositionSpy = sinon.spy(StickyObserver.prototype as any, 'updateScrollTopPosition');
      // tslint:enable no-any
      windowAddEventListenerSpy = sinon.spy(window, 'addEventListener');

      sticky = stickyTestContext.createStickyObserver();
    });

    it('should be not active by default', (): void => {
      expect(sticky.isActive()).to.be.false;
    });

    it(`should set the browser scroll-Y position to start any calculation with the current scroll depth.
        Use-Case: User refreshes the browser somewhere in the middle.`, (): void => {
      expect(updateScrollPositionSpy.callCount).to.be.eq(1);
    });

    it(`should not add global 'scroll' and 'resize' event listener`, (): void => {
      expect(windowAddEventListenerSpy).to.not.have.been.called;
    });
  });

  describe('on init only', (): void => {
    beforeEach((): void => {
      windowAddEventListenerSpy = sinon.spy(window, 'addEventListener');

      sticky = stickyTestContext.createStickyObserver();
      sticky.init();
    });

    it(`should add a global listener for 'scroll' and 'resize' to update the scroll-Y position`, (): void => {
      // Info:
      // 2 x global scroll + resize => pageY / scroll-depth
      // 2 x global scroll + resize => sticky element position update
      const EXPECTED_EVENT_LISTENER: number = 4;

      expect(windowAddEventListenerSpy.callCount).to.be.eq(EXPECTED_EVENT_LISTENER);
    });

    it('should enhance each sticky HTMLElement with an individual context object to store data and updates', (): void => {
      expect(stickyTestContext.getStickyElement().sticky).to.not.be.undefined;
    });

    it('should still not active', (): void => {
      expect(sticky.isActive()).to.be.false;
    });

    it('should not trigger resize event listener', async (): Promise<void> => {
      const resizeSpy: sinon.SinonSpy = sinon.spy();
      sticky.onResizeChange(resizeSpy);

      return triggerResizeEvent().then((): void => {
        expect(resizeSpy).to.not.have.been.called;
      });
    });

    it('should not trigger update event listener', async (): Promise<void> => {
      const updateSpy: sinon.SinonSpy = sinon.spy();
      sticky.onUpdate(updateSpy);

      return scrollTo(STICKY_PAGE_POSITION).then((): void => {
        expect(updateSpy).to.not.have.been.called;
      });
    });
  });

  describe('on starting to observe', (): void => {
    beforeEach((): void => {
      sticky = stickyTestContext.createStickyObserver();
      sticky.init();
    });

    it('should be active now', (): void => {
      sticky.observe();
      expect(sticky.isActive()).to.be.true;
    });

    it(`should update/reset position of all sticky elements.
        Use-Case: User refreshes the browser somewhere in the middle. Element is instant sticky.`, (): void => {
      const element: StickyHTMLElement = stickyTestContext.getStickyElement();
      // fake initial state
      element.sticky.state = StickyState.STICKY;

      sticky.observe();

      expect(element.sticky.state).to.be.eq(StickyState.NORMAL);
    });

    it('should trigger resize event listener', async (): Promise<void> => {
      const resizeSpy: sinon.SinonSpy = sinon.spy();
      sticky.onResizeChange(resizeSpy);
      sticky.observe();

      return triggerResizeEvent().then((): void => {
        expect(resizeSpy).to.have.been.called;
      });
    });

    it('should trigger update event listener', async (): Promise<void> => {
      const updateSpy: sinon.SinonSpy = sinon.spy();
      sticky.onUpdate(updateSpy);
      sticky.observe();

      return scrollTo(STICKY_PAGE_POSITION).then((): void => {
        expect(updateSpy).to.have.been.called;
      });
    });
  });

  describe('on pause', (): void => {
    beforeEach((): void => {
      sticky = stickyTestContext.createStickyObserver();
      sticky.init();
      sticky.observe();
    });

    it('should not be active anymore', (): void => {
      sticky.pause();

      expect(sticky.isActive()).to.be.false;
    });

    it('should reset all sticky elements to `NORMAL`', (): void => {
      const element: StickyHTMLElement = stickyTestContext.getStickyElement();
      // fake state to check the reset
      element.sticky.state = StickyState.STICKY;

      sticky.pause();

      expect(element.sticky.state).to.be.eq(StickyState.NORMAL);
    });
  });

  describe('with setting overrides', (): void => {
    beforeEach((): void => {
      sticky = stickyTestContext.createStickyObserver({
        offsetTop: 1337,
        offsetBottom: 31337
      });
      sticky.init();
      sticky.observe();
    });

    it('should override offsetTop. Used for dynamic override based on device.', (): void => {
      const element: StickyHTMLElement = stickyTestContext.getStickyElement();
      expect(element.sticky.offsetTop).to.be.eq(1337);
    });

    it('should override offsetBottom. Used for dynamic override based on device.', (): void => {
      const element: StickyHTMLElement = stickyTestContext.getStickyElement();
      expect(element.sticky.offsetBottom).to.be.eq(31337);
    });
  });
});
