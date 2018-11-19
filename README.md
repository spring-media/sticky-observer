# sticky-observer

A simple and basic sticky observer (or watcher) on `HTMLElement`'s in a given container. It tells you if a element is `STICKY`, `STICKY_END_OF_CONTAINER` or `NORMAL` on scrolling or resizing. All styling or positioning stuff of the actual sticky elements is **NOT** part of this library. There are some helper functions but you have the full control what happens when and how.

> Bring-Your-Own-Styling (BYOS)

This library is heavily inspired by [sticky-js](https://github.com/rgalus/sticky-js) with the same internal behavior and calculation but follows a different use case with BYOS.

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
<div class="container"><div class="sticky-element" data-sticky-class="sticky-element--is-sticky">example</div></div>
```

```js
import { StickyObserver } from '@welt/sticky-observer';

const stickyContainer = document.querySelector('.container');
const stickyElement = document.querySelector('.sticky-element');

const stickyObserver = new StickyObserver([stickyElement], stickyContainer);
stickyObserver.init();

stickyObserver.onStateChange(event => {
  switch (event.nextState) {
    case 'STICKY':
      event.element.sticky.addStickyClass();
      event.element.sticky.addPlaceholder();
      break;
    case 'NORMAL':
      event.element.sticky.removeStickyClass();
      event.element.sticky.removePlaceholder();
      break;
    default:
      // ignore
      break;
  }
});

stickyObserver.observe();
```

## Options

```js
new StickyObserver([stickyElement], stickyContainer, { offsetTop: 20, offsetBottom: 20 });
```

You can configure some options of each sticky-element via HTML `[data-*]` attributes. All options are
optional.

```html
<div class="container">
  <!--
    [data-sticky-class]
    Css class to add when calling `addStickyClass()`. See API section.

    [data-sticky-placeholder-class]
    Css class to add when calling `addPlaceholder()` and [data-sticky-placeholder-auto-height] is `false`. See API section.

    [data-sticky-placeholder-auto-height]
    When calling `addPlaceholder()` a `<div/>` is added to the DOM with the same height of the sticky element.
    With this option you can disable the auto height and adding a css class for example.

    [data-sticky-offset-top]
    The top offset take part in the 'NORMAL' to 'STICKY' calculation.
    With the offset you have some more control about the 'sticky breakpoint'. You can 'move' it up and down.
    The value must be a number without any units.

    [data-sticky-offset-bottom]
    The bottom offset take part in the 'STICKY' to 'STICKY_END_OF_CONTAINER' calculation.
    With the offset you have some more control about the 'sticky breakpoint'. You can 'move' it up and down.
    The value must be a number without any units.
  -->
  <div
    class="sticky-element"
    data-sticky-class="sticky-element--is-sticky"
    data-sticky-placeholder-class="sticky-element__placeholder"
    data-sticky-placeholder-auto-height="false"
    data-sticky-offset-top="-20"
    data-sticky-offset-bottom="-20"
  >
    example
  </div>
</div>
```

## API

```js
// StickyObserver API

// Creating a new instance
// [stickyElement]: Array of HTMLElement
// stickyContainer: HTMLElement
// options: optional options (see: Options section)
const stickyObserver = new StickyObserver([stickyElement], stickyContainer, options);

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

  // The offset top value used for the sticky calculation.
  // (number)
  const offsetTop = sticky.offsetTop;

  // The offset bottom value used for the sticky calculation.
  // (number)
  const offsetBottom = sticky.offsetBottom;

  // The default height of the element in a when non-sticky.
  // This is useful for a additional placeholder somewhere.
  // (number)
  const nonStickyHeight = sticky.nonStickyHeight;

  // Containing the `width`, `height`, `top` and `left` of the sticky element.
  // This is important for styling.
  // (object)
  const rect = sticky.rect;

  // Reference to the sticky container element
  // (HTMLElement)
  const container = sticky.container;

  // Containing the `width`, `height`, `top` and `left` of the sticky container element.
  // (object)
  const containerRect = sticky.container.rect;

  // Active state of the sticky element.
  // (boolean)
  const active = sticky.active;

  // Current state of the sticky element.
  // (string)
  const state = sticky.state;

  // Configured sticky class
  // (string)
  const stickyClass = sticky.stickyClass;

  // Configured placeholder class
  // (string)
  const placeholderClass = sticky.placeholderClass;

  // Configured placeholder auto height
  // (boolean)
  const placeholderAutoHeight = sticky.placeholderAutoHeight;

  // Adding the css class to the sticky element.
  // (null safe)
  sticky.addClass('some-special-class');

  // Removes the css class from the sticky element.
  // It did not throw an error when the class is not present
  sticky.removeClass('some-special-class');

  // Adds the configured sticky class.
  // When no sticky class is configured it does nothing.
  sticky.addStickyClass();

  // Removes the configured sticky class.
  // When no sticky class is configured it does nothing.
  sticky.removeStickyClass();

  // Adds the configured placeholder class.
  // When no placeholder class is configured it does nothing.
  sticky.addPlaceholder();

  // Removes the configured placeholder class.
  // When no placeholder class is configured it does nothing.
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
