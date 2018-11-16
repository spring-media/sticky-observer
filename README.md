# sticky-observer

A simple simple and basic sticky observer (or watcher) on `HTMLElement`'s in a given container. It tells you if a element is `STICKY`, `STICKY_END_OF_CONTAINER` or `NORMAL` on scrolling or resizing.

## Features

- full control about styling/positioning/placeholder. NO magic BUT more work for you.
- observing still works correctly with dynamic (out of control) appended container (ads)
- written in TypeScript
- no dependencies
- tested
- small (cjs: 6.78 KB / 1.75 KB gzip) (esm: 5.88 KB / 1.59 KB gzip)

## Demo

This library is in production on [welt.de](https://www.welt.de) for some main features.

1. Sticky Page-Header (desktop only): [Demo](https://www.welt.de)
2. Sticky Video-Player (desktop only): [Demo](https://www.welt.de/sport/fussball/article183952542/Nations-League-So-verhindert-die-deutsche-Nationalmannschaft-den-Abstieg.html)
3. Sticky Social-Bar (mobile and desktop): [Demo](https://www.welt.de/services/article7893735/Impressum.html)

## Install

```bash
# via NPM
npm install @welt/sticky-observer
# via yarn
yarn add @welt/sticky-observer
```

## Usage example

```html
<div class="container"><div class="sticky-element">example</div></div>
```

```js
import { StickyObserver } from '@welt/sticky-observer';

const stickyContainer = document.querySelector('.container');
const stickyElement = document.querySelector('.sticky-element');

const stickyObserver = new StickyObserver([stickyElement], stickyContainer);
stickyObserver.init();

stickyObserver.onStateChange(event => {
  console.log(`changed state from ${event.prevState} to ${event.nextState}`);
});

stickyObserver.observe();
```

## Options

```js
new StickyObserver([stickyElement], stickyContainer, { offsetTop: 20, offsetBottom: 20 });
```

You can configure some options of each sticky-element via HTML `[data-*]` attributes.

```html
<div class="container">
  <div
    class="sticky-element"
    data-sticky-offset-top="-20"
    data-sticky-offset-bottom="-20"
    data-sticky-class="sticky-element--is-sticky"
    data-sticky-placeholder-class="sticky-element__placeholder"
    data-sticky-placeholder-auto-height="false"
  >
    example
  </div>
</div>
```

## API

```js
// StickyObserver API
const stickyObserver = new StickyObserver([stickyElement], stickyContainer);

// Mandatory
// Lazy initialize function. Binds all internal listeners but did not start the observer.
stickyObserver.init();

// Mandatory
// Starts the observer and notifies the listeners about updates/changes/resizes.
stickyObserver.observe();

// All global listeners are still active but did not notifies the listeners about updates/changes/resizes.
stickyObserver.pause();

// Removes all global and element listeners. Deletes the `sticky` property of each sticky element
stickyObserver.destroy();

// Register a callback function to listen on (unique) state changes only (one event per change/transition).
// A basic flow is: NORMAL (start) -> STICKY -> STICKY_END_OF_CONTAINER
stickyObserver.onStateChange(stickyEvent => {});

// Register a callback function to listen on all window scroll and resize events (not throttled)
stickyObserver.onUpdate(stickyEvent => {});

// Register a callback function to listen on all window resize events only (not throttled)
stickyObserver.onResize(stickyEvent => {});

// Is the sticky observer still active.
// (boolean)
const isActive = stickyObserver.isActive();
```

```js
// StickyState types
stickyObserver.onStateChange(stickyEvent => {
  // element is in default/non-sticky state
  const isNormal = stickyEvent.nextState === 'NORMAL';

  // element is in sticky state
  const isSticky = stickyEvent.nextState === 'STICKY';

  // element is below the the sticky container
  const isStickyEndOfContainer = stickyEvent.nextState === 'STICKY_END_OF_CONTAINER';
});
```

```js
// StickyEvent API
stickyObserver.onStateChange(stickyEvent => {
  // The previous state of the sticky element
  // (string)
  const prevState = stickyEvent.prevState;

  // The next or updated/current state of the sticky element
  // (string)
  const nextState = stickyEvent.nextState;

  // The native HTMLElement with a `sticky` property for more options.
  // (HTMLElement)
  const element = stickyEvent.element;

  // The current scroll position based on `window.pageYOffset`
  // (number)
  const scrollTop = stickyEvent.scrollTop;
});
```

```js
// Sticky element API
stickyObserver.onStateChange(stickyEvent => {
  const sticky = stickyEvent.element.sticky;

  // (number)
  const offsetTop = sticky.offsetTop;
  // (number)
  const offsetBottom = sticky.offsetBottom;
  // (number)
  const nonStickyHeight = sticky.nonStickyHeight;
  // (object)
  const rect = sticky.rect;
  // (HTMLElement)
  const container = sticky.container;
  // (object)
  const containerRect = sticky.container.rect;
  // (boolean)
  const active = sticky.active;
  // (string)
  const state = sticky.state;
  // (string)
  const stickyClass = sticky.stickyClass;
  // (string)
  const placeholderClass = sticky.placeholderClass;
  // (boolean)
  const placeholderAutoHeight = sticky.placeholderAutoHeight;

  sticky.addClass('some-special-class');
  sticky.removeClass('some-special-class');
  sticky.addStickyClass();
  sticky.removeStickyClass();
  sticky.addPlaceholder();
  sticky.removePlaceholder();
});
```

## Browser support

This library is transpiled to ES5 without any special / custom browser API. That means:

- IE11 with `classList` [polyfill](https://github.com/yola/classlist-polyfill)
- all other major browsers

## Build

```
yarn install
yarn build
```

## Test + Coverage

```
yarn test
```

## License

[MIT](LICENSE)
