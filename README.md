# sticky-observer [![CircleCI](https://circleci.com/gh/spring-media/sticky-observer.svg?style=svg)](https://circleci.com/gh/spring-media/sticky-observer)

[![npm](https://img.shields.io/npm/v/@welt/sticky-observer.svg)](https://www.npmjs.com/package/@welt/sticky-observer)
[![codecov](https://codecov.io/gh/spring-media/sticky-observer/branch/master/graph/badge.svg)](https://codecov.io/gh/spring-media/sticky-observer)
[![dep](https://david-dm.org/spring-media/sticky-observer/dev-status.svg)](https://david-dm.org/spring-media/sticky-observer?type=dev)
[![GitHub license](https://img.shields.io/github/license/spring-media/sticky-observer.svg)](https://github.com/spring-media/sticky-observer/blob/master/LICENSE)

A simple and easy to use sticky observer (or watcher) on `HTMLElement`'s in a designated container. When scrolling or resizing the window sticky-observer will tell you if an element is `STICKY`, `STICKY_END_OF_CONTAINER` or `NORMAL`. This library does **NOT** include any preconfigured styling or positioning options, what happens when and how is left up to the you to configure with the help of some included helper functions.

> Bring-Your-Own-Styling (BYOS)

This library was heavily inspired by [sticky-js](https://github.com/rgalus/sticky-js), it uses the same calculations and exhibits the same internal behaviour but due to it being completely unstyled it fits a different use case, all styling is left up to the you (BYOS).

## Features

- Full control over styling/positioning/placeholder. NO magic BUT more work for you.
- Observing still works correctly with dynamic (out of control) appended container (ads)
- Written in TypeScript
- No dependencies
- Fully tested
- Small (cjs: 6.78 KB / 1.75 KB gzip) (esm: 5.88 KB / 1.59 KB gzip)

## Demo

This library is in production on [welt.de](https://www.welt.de) for a few main features.

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

Each sticky-element can be configured with a few options via HTML `[data-*]` attributes. All configuration options are optional.

```html
<div class="container">
  <!--
    [data-sticky-class]
    Css class to add when calling `addStickyClass()`. See API section.

    [data-sticky-placeholder-class]
    Css class to add when calling `addPlaceholder()` and [data-sticky-placeholder-auto-height] is `false`. See API section.

    [data-sticky-placeholder-auto-height]
    When calling `addPlaceholder()` a `<div/>` is added to the DOM with the same height of the sticky element.
    With this option you can disable the auto height and add your own css class for example.

    [data-sticky-offset-top]
    The top offset takes part in the 'NORMAL' to 'STICKY' calculation.
    With the offset you have some more control over the 'sticky breakpoint'. You can 'move' it up and down.
    The value must be a number without any units.

    [data-sticky-offset-bottom]
    The bottom offset takes part in the 'STICKY' to 'STICKY_END_OF_CONTAINER' calculation.
    With the offset you have some more control over the 'sticky breakpoint'. You can 'move' it up and down.
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
// Lazy initialize function. Binds all internal listeners but does not start the observer.
stickyObserver.init();

// Mandatory
// Starts the observer and notifies the listeners of any updates/changes/resizes.
stickyObserver.observe();

// All global listeners are still active but does not notify the listeners of any updates/changes/resizes.
stickyObserver.pause();

// Removes all global and element listeners. Deletes the `sticky` property of each sticky element
stickyObserver.destroy();

// Register a callback function to listen for (unique) state changes only (one event per change/transition).
// A basic flow is: NORMAL (start) -> STICKY -> STICKY_END_OF_CONTAINER
stickyObserver.onStateChange(stickyEvent => {});

// Register a callback function to listen for all window scroll and resize events (not throttled)
stickyObserver.onUpdate(stickyEvent => {});

// Register a callback function to listen for all window resize events only (not throttled)
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

  // The default height of the element in a non-sticky state.
  // This is useful for an additional placeholder somewhere.
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
  // It does not throw an error when a class is not present
  sticky.removeClass('some-special-class');

  // Adds a configured sticky class.
  // When no sticky class is configured it does nothing
  sticky.addStickyClass();

  // Removes the configured sticky class.
  // When no sticky class is configured it does nothing
  sticky.removeStickyClass();

  // Adds a configured placeholder class.
  // When no placeholder class is configured it does nothing.
  sticky.addPlaceholder();

  // Removes the configured placeholder class.
  // When no placeholder class is configured it does nothing.
  sticky.removePlaceholder();
});
```

## Browser support

This library is transpiled to ES5 without any special / custom browser API. This means:

- in order for it to work on IE11 you must include the `classList` [polyfill](https://github.com/yola/classlist-polyfill)

Sticky-element works on all other major browsers.

## Build

```bash
yarn install
yarn build
```

## Test + Coverage

```bash
# You need a locally installed Chrome
yarn test
```

## Release

The npm and GitHub releases are triggered manually (via `release-it`)

```bash
# You need a valid GITHUB_TOKEN
# See: https://github.com/webpro/release-it#github-releases
yarn publish
```

## License

[MIT](LICENSE)
