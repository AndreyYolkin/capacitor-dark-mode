import DarkModeBase from './base';
import type { DarkModePlugin, IsDarkModeResult } from './definitions';
export declare class DarkModeNative extends DarkModeBase {
    constructor(capProxy: DarkModePlugin);
    protected registerDarkModeListener(): Promise<void>;
    isDarkMode(): Promise<IsDarkModeResult>;
}
