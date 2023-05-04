import DarkModeBase from './base';
import type { IsDarkModeResult } from './definitions';
export declare class DarkModeWeb extends DarkModeBase {
    private mediaQuery?;
    protected registerDarkModeListener(): Promise<void>;
    isDarkMode(): Promise<IsDarkModeResult>;
    private getDarkModeQuery;
}
