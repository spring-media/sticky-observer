import { expect } from 'chai';
import { Sticky } from './StickyObserver';
import { scrollToPosition, STICKY_PAGE_POSITION, StickyTestContext } from './test-helper';
import { StickyEvent, StickyHTMLElement, StickyState } from './types';

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
`;

describe('Sticky Observer in STICKY mode', (): void => {
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

    it('should switch to sticky mode', (): Promise<void> => {
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
        .then(
          async (): Promise<StickyEvent> => {
            return scrollToPosition(sticky, 0);
          }
        )
        .then(
          (event: StickyEvent): void => {
            expect(event.nextState).to.be.eq(StickyState.NORMAL);
          }
        );
    });
  });

  describe('with placeholder', (): void => {
    beforeEach(
      (): void => {
        sticky = stickyTestContext.createStickyObserver();
        sticky.init();
        sticky.observe();
      }
    );

    it('should be added to body container', (): void => {
      const stickyElement: StickyHTMLElement = stickyTestContext.getStickyElement();
      stickyElement.sticky.addPlaceholder();
      expect(stickyElement.sticky.placeholder).to.not.be.undefined;
      expect(stickyElement.sticky.container.contains(stickyElement.sticky.placeholder as Node)).to.be.true;
    });

    it('should be removed from body container', (): void => {
      const stickyElement: StickyHTMLElement = stickyTestContext.getStickyElement();
      stickyElement.sticky.addPlaceholder();
      expect(stickyElement.sticky.placeholder).to.not.be.undefined;
      stickyElement.sticky.removePlaceholder();
      expect(stickyElement.sticky.container.contains(stickyElement.sticky.placeholder as Node)).to.be.false;
    });
  });
});
