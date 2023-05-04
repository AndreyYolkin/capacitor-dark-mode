import { WebPlugin } from '@capacitor/core';
import type { DarkModeListener, DarkModeListenerData, DarkModeListenerHandle, DarkModeOptions, DarkModePlugin, IsDarkModeResult } from './definitions';
import { DarkModeAppearance } from './definitions';
export default abstract class DarkModeBase extends WebPlugin implements DarkModePlugin {
    private appearance;
    private darkModeClass;
    protected registeredListener: boolean;
    private readonly appearanceListeners;
    private getter?;
    private setter?;
    private statusBarStyleGetter?;
    private syncStatusBar;
    private statusBarBackgroundVariable;
    private handleTransitions;
    private disableTransitionsStyle?;
    protected abstract registerDarkModeListener(): Promise<void>;
    setNativeDarkModeListener(options: Record<string, unknown>, callback: DarkModeListener): Promise<string>;
    init({ cssClass, statusBarBackgroundVariable, getter, setter, syncStatusBar, statusBarStyleGetter, disableTransitions }?: DarkModeOptions): Promise<void>;
    configure(options?: DarkModeOptions): Promise<void>;
    addAppearanceListener(listener: DarkModeListener): Promise<DarkModeListenerHandle>;
    abstract isDarkMode(): Promise<IsDarkModeResult>;
    private disableTransitions;
    private enableTransitions;
    update(data?: DarkModeListenerData): Promise<DarkModeAppearance>;
    private getBackgroundColor;
    private handleStatusBar;
}
