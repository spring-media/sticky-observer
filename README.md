# StickyObserver

## Usage

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
