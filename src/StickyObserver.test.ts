import { expect } from 'chai';
import sinon from 'sinon';
import { Sticky, StickyObserver } from './StickyObserver';
import { StickyTestContext } from './test-helper';
import { StickyHTMLElement, StickyState } from './types';

// Info:
// The sticky element should be always normal even on scrolling
const fixture: string = `
<article id="StickyBodyContainer">
  <p>...</p>
  <div id="StickyElement" data-sticky-offset-top="10" data-sticky-offset-bottom="20">StickyElement</div>
  <p>...</p>
</article>
`;

describe('Sticky Observer: all states', (): void => {
  let sticky: Sticky;
  let stickyTestContext: StickyTestContext;
  let updateScrollPositionSpy: sinon.SinonSpy;

  beforeEach(
    (): void => {
      stickyTestContext = new StickyTestContext(fixture);
    }
  );

  afterEach(
    (): void => {
      stickyTestContext.cleanUp(sticky);
      sinon.restore();
    }
  );

  describe('on instance creation', (): void => {
    beforeEach(
      (): void => {
        // Info: any
        // Testing internal (private) functions
        // tslint:disable no-any
        updateScrollPositionSpy = sinon.spy(StickyObserver.prototype as any, 'updateScrollTopPosition');
        // tslint:enable no-any

        sticky = stickyTestContext.createStickyObserver();
      }
    );

    it('should be not active by default', (): void => {
      expect(sticky.isActive()).to.be.false;
    });

    it(`should set the browser scroll-Y position to start any calculation with the current scroll depth.
            Use-Case: User refreshes the browser somewhere in the middle.`, (): void => {
      expect(updateScrollPositionSpy.callCount).to.be.eq(1);
    });
  });

  describe('on init', (): void => {
    let windowAddEventListenerSpy: sinon.SinonSpy;

    beforeEach(
      (): void => {
        windowAddEventListenerSpy = sinon.spy(window, 'addEventListener');

        sticky = stickyTestContext.createStickyObserver();
        sticky.init();
      }
    );

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
  });

  describe('on starting to observe', (): void => {
    beforeEach(
      (): void => {
        sticky = stickyTestContext.createStickyObserver();
        sticky.init();
      }
    );

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
  });

  describe('on pause', (): void => {
    beforeEach(
      (): void => {
        sticky = stickyTestContext.createStickyObserver();
        sticky.init();
        sticky.observe();
      }
    );

    it('should not be active anymore', (): void => {
      sticky.pause();

      expect(sticky.isActive()).to.be.false;
    });

    it('should reset all sticky elements to `normal`', (): void => {
      const element: StickyHTMLElement = stickyTestContext.getStickyElement();
      // fake state to check the reset
      element.sticky.state = StickyState.STICKY;

      sticky.pause();

      expect(element.sticky.state).to.be.eq(StickyState.NORMAL);
    });
  });

  describe('with setting overrides', (): void => {
    beforeEach(
      (): void => {
        sticky = stickyTestContext.createStickyObserver({
          offsetTop: 1337,
          offsetBottom: 31337
        });
        sticky.init();
        sticky.observe();
      }
    );

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
