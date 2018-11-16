import { expect } from 'chai';
import { Sticky } from './StickyObserver';
import { STICKY_PAGE_POSITION, StickyTestContext, triggerResizeEvent } from './test-helper';
import { StickyState } from './types';

// Info:
// The sticky element should be always normal even on scrolling
const fixture: string = `
<article id="StickyBodyContainer">
  <p>...</p>
  <div id="StickyElement" data-sticky-offset-top="10" data-sticky-offset-bottom="20">StickyElement</div>
  <p>...</p>
</article>
`;

describe('Sticky Observer in NORMAL mode', (): void => {
  let sticky: Sticky;
  let stickyTestContext: StickyTestContext;

  beforeEach(
    (): void => {
      stickyTestContext = new StickyTestContext(fixture);
    }
  );

  afterEach(
    (): void => {
      stickyTestContext.cleanUp(sticky);
    }
  );

  describe('on observe', (): void => {
    beforeEach(
      (): void => {
        sticky = stickyTestContext.createStickyObserver();
        sticky.init();
      }
    );

    it(`should have the sticky state: normal`, (): void => {
      sticky.observe();
      expect(stickyTestContext.getStickyElement().sticky.state).to.be.eq(StickyState.NORMAL);
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

    it('should still have the sticky state: normal', (): void => {
      sticky.pause();

      expect(stickyTestContext.getStickyElement().sticky.state).to.be.eq(StickyState.NORMAL);
    });
  });

  describe('on scroll', (): void => {
    beforeEach(
      (): void => {
        sticky = stickyTestContext.createStickyObserver();
        sticky.init();
        sticky.observe();
      }
    );

    it('should not switch to sticky mode', (done: Mocha.Done): void => {
      // Info:
      // No scroll event is fired on to small pages. You can test this only with more setTimeouts :(
      // The small timeout is a good compromise.
      window.scrollTo(0, STICKY_PAGE_POSITION);

      setTimeout((): void => {
        expect(stickyTestContext.getStickyElement().sticky.state).to.be.eq(StickyState.NORMAL);
        done();
      }, 10);
    });
  });

  describe('on resize', (): void => {
    beforeEach(
      (): void => {
        sticky = stickyTestContext.createStickyObserver();
        sticky.init();
        sticky.observe();
      }
    );

    // it('should do nothing', async (): Promise<void> => {
    //   return triggerResizeEvent().then((): void => {});
    // });
  });
});
