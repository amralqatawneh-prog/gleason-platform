export type BrowserCapabilities = {
  webgl2: boolean;
  serviceWorker: boolean;
  indexedDb: boolean;
  touch: boolean;
  online: boolean;
};

export function detectCapabilities(scope: Window = window): BrowserCapabilities {
  const canvas = scope.document.createElement('canvas');
  let webgl2 = false;
  try {
    webgl2 = Boolean(canvas.getContext('webgl2'));
  } catch {
    webgl2 = false;
  }
  return {
    webgl2,
    serviceWorker: 'serviceWorker' in scope.navigator,
    indexedDb: 'indexedDB' in scope,
    touch: 'ontouchstart' in scope || scope.navigator.maxTouchPoints > 0,
    online: scope.navigator.onLine,
  };
}

export function threeDMode(capabilities: BrowserCapabilities): 'available' | 'fallback-2d' {
  return capabilities.webgl2 ? 'available' : 'fallback-2d';
}
