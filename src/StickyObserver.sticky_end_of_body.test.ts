import { expect } from 'chai';
import { Sticky } from './StickyObserver';
import { scrollToPosition, STICKY_END_OF_BODY_POSITION, STICKY_PAGE_POSITION, StickyTestContext } from './test-helper';
import { StickyEvent, StickyState } from './types';

// Info:
// The sticky element should be normal on init and sticky on scroll
const fixture: string = `
<article id="StickyBodyContainer">
  <p>...</p>
  <div style="height: 200px;">small block of content</div>
  <p>...</p>
  <div id="StickyElement">StickyElement</div>
  <p>...</p>
  <div style="height: 5000px;">large block of content</div>
  <p>...</p>
</article>
<div>
  <div style="height: 1000px;">some more content above the sticky body container</div>
</div>
`;

describe('Sticky Observer in STICKY_END_OF_BODY mode', (): void => {
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

    it('should switch to sticky mode', async (): Promise<void> => {
      return scrollToPosition(sticky, STICKY_PAGE_POSITION).then(
        (event: StickyEvent): void => {
          expect(event.nextState).to.be.eq(StickyState.STICKY);
        }
      );
    });

    it('should switch back to normal mode', async (): Promise<void> => {
      return scrollToPosition(sticky, STICKY_PAGE_POSITION)
        .then(
          (event: StickyEvent): void => {
            expect(event.nextState).to.be.eq(StickyState.STICKY);
          }
        )
        .then(async (): Promise<StickyEvent> => scrollToPosition(sticky, 0))
        .then(
          (event: StickyEvent): void => {
            expect(event.nextState).to.be.eq(StickyState.NORMAL);
          }
        );
    });
  });

  describe('on scroll beyond the body container', (): void => {
    beforeEach(
      (): void => {
        sticky = stickyTestContext.createStickyObserver();
        sticky.init();
        sticky.observe();
      }
    );

    // Info:
    // We need to simulate a step-by-step scrolling: normal -> sticky -> sticky_end_of_body.
    // Otherwise the `StickyEvent` emits the wrong event.
    it('should switch first to sticky mode flowered by sticky_end_of_body', async (): Promise<void> => {
      return scrollToPosition(sticky, STICKY_PAGE_POSITION)
        .then(
          (event: StickyEvent): void => {
            expect(event.nextState).to.be.eq(StickyState.STICKY);
          }
        )
        .then(async (): Promise<StickyEvent> => scrollToPosition(sticky, STICKY_END_OF_BODY_POSITION))
        .then(
          (event: StickyEvent): void => {
            expect(event.nextState).to.be.eq(StickyState.STICKY_END_OF_BODY);
          }
        );
    });

    it('should switch back to sticky mode', async (): Promise<void> => {
      return scrollToPosition(sticky, STICKY_PAGE_POSITION)
        .then(
          (event: StickyEvent): void => {
            expect(event.nextState).to.be.eq(StickyState.STICKY);
          }
        )
        .then(async (): Promise<StickyEvent> => scrollToPosition(sticky, STICKY_END_OF_BODY_POSITION))
        .then(
          (event: StickyEvent): void => {
            expect(event.nextState).to.be.eq(StickyState.STICKY_END_OF_BODY);
          }
        )
        .then(async (): Promise<StickyEvent> => scrollToPosition(sticky, STICKY_PAGE_POSITION))
        .then(
          (event: StickyEvent): void => {
            expect(event.nextState).to.be.eq(StickyState.STICKY);
          }
        );
    });
  });
});
