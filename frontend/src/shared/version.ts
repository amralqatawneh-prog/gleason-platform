// Vite injects the package version; CI compares it with VERSION and backend metadata.
declare const __APP_VERSION__: string;
export const RELEASE_NAME = `v${__APP_VERSION__}`;
