import { registerPlugin } from '@capacitor/core';
import info from './info.json';
console.log(`loaded ${info.name} v${info.version}`);
const proxy = registerPlugin('DarkModeNative', {
    web: async () => import('./web').then((module) => new module.DarkModeWeb()),
    ios: async () => import('./native').then((module) => new module.DarkModeNative(proxy)),
    android: async () => import('./native').then((module) => new module.DarkModeNative(proxy))
});
export * from './definitions';
export * from './utils';
export { proxy as DarkMode };
