# sticky-observer

A simple. Some

## Features

- no styling / css / positioning (just a observer)
- written in TypeScript
- no dependencies
- tested
- small (cjs: 6.77 KB / 1.73 KB gzip) (esm: 6.65 KB / 1.69 KB gzip)

## Example

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

## Build

```
yarn install
yarn build
```

## Test + Coverage

```
yarn test
```
