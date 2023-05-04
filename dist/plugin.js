var capacitorDarkMode = (function (exports, core, statusBar) {
    'use strict';

    var info = {
      name: "@aparajita/capacitor-dark-mode",
      version: "3.3.3"
    };

    /**
     * The possible appearances an app can have.
     * `dark` and `light` are set by the user,
     * `system` follows the system's dark mode.
     */
    exports.DarkModeAppearance = void 0;
    (function (DarkModeAppearance) {
        DarkModeAppearance["dark"] = "dark";
        DarkModeAppearance["light"] = "light";
        DarkModeAppearance["system"] = "system";
    })(exports.DarkModeAppearance || (exports.DarkModeAppearance = {}));

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    const kAppearanceToStyleMap = {
        [exports.DarkModeAppearance.dark]: statusBar.Style.Dark,
        [exports.DarkModeAppearance.light]: statusBar.Style.Light,
        [exports.DarkModeAppearance.system]: statusBar.Style.Default
    };
    const kStyleToAppearanceMap = {
        [statusBar.Style.Dark]: exports.DarkModeAppearance.dark,
        [statusBar.Style.Light]: exports.DarkModeAppearance.light,
        [statusBar.Style.Default]: exports.DarkModeAppearance.system
    };
    /**
     * Returns whether the given color is a valid 3 or 6 digit
     * '#'-prefixed hex color.
     */
    function isValidHexColor(color) {
        return /^#([0-9A-F]{6}|[0-9A-F]{3})$/iu.test(color);
    }
    // Normalize a 3-digit #RGB hex color to #RRGGBB format
    function normalizeHexColor(color) {
        if (color.length === 4) {
            return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
        }
        return color;
    }
    /**
     * Returns whether the given 3 or 6 digit '#'-prefixed hex color
     * is considered a dark color based on its perceived luminance.
     * The default luminance threshold is 0.5 (on a scale of 0 to 1.0),
     * but you can pass a custom threshold if you want to change the perceived
     * darkness of a color.
     */
    function isDarkColor(color, threshold = 0.5) {
        const hex = color.replace('#', '');
        let r, g, b;
        if (hex.length === 3) {
            r = hex.substring(0, 1);
            r += r;
            g = hex.substring(1, 2);
            g += g;
            b = hex.substring(2, 3);
            b += b;
        }
        else {
            r = hex.substring(0, 2);
            g = hex.substring(2, 4);
            b = hex.substring(4, 6);
        }
        r = parseInt(r, 16);
        g = parseInt(g, 16);
        b = parseInt(b, 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < threshold * 255;
    }
    // Converts a DarkModeAppearance to a Style
    function appearanceToStyle(appearance) {
        return kAppearanceToStyleMap[appearance];
    }
    // Converts a Style to a DarkModeAppearance
    function styleToAppearance(style) {
        return kStyleToAppearanceMap[style];
    }

    console.log(`loaded ${info.name} v${info.version}`);
    const proxy = core.registerPlugin('DarkModeNative', {
        web: async () => Promise.resolve().then(function () { return web; }).then((module) => new module.DarkModeWeb()),
        ios: async () => Promise.resolve().then(function () { return native; }).then((module) => new module.DarkModeNative(proxy)),
        android: async () => Promise.resolve().then(function () { return native; }).then((module) => new module.DarkModeNative(proxy))
    });

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    const kDefaultBackgroundVariable = '--background';
    class DarkModeBase extends core.WebPlugin {
        constructor() {
            super(...arguments);
            this.appearance = exports.DarkModeAppearance.system;
            this.darkModeClass = 'dark';
            this.registeredListener = false;
            this.appearanceListeners = new Set();
            this.syncStatusBar = true;
            this.statusBarBackgroundVariable = kDefaultBackgroundVariable;
            this.handleTransitions = true;
        }
        // @native(callback)
        /* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/require-await */
        // noinspection JSUnusedLocalSymbols
        async setNativeDarkModeListener(options, callback) {
            throw this.unimplemented('setNativeDarkModeListener is native only');
        }
        /* eslint-enable @typescript-eslint/no-unused-vars,@typescript-eslint/require-await */
        async init({ cssClass, statusBarBackgroundVariable, getter, setter, syncStatusBar, statusBarStyleGetter, disableTransitions } = {}) {
            if (cssClass) {
                // Remove the old class if it exists
                document.documentElement.classList.remove(this.darkModeClass);
                this.darkModeClass = cssClass;
            }
            this.statusBarBackgroundVariable =
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                statusBarBackgroundVariable || kDefaultBackgroundVariable;
            if (typeof getter === 'function') {
                this.getter = getter;
            }
            if (typeof setter === 'function') {
                this.setter = setter;
            }
            if (typeof syncStatusBar === 'boolean' || syncStatusBar === 'textOnly') {
                this.syncStatusBar = syncStatusBar;
            }
            if (typeof statusBarStyleGetter === 'function') {
                this.statusBarStyleGetter = statusBarStyleGetter;
            }
            if (typeof disableTransitions === 'boolean') {
                this.handleTransitions = disableTransitions;
            }
            if (!this.registeredListener) {
                await this.registerDarkModeListener();
            }
            await this.update();
        }
        async configure(options) {
            return this.init(options);
        }
        async addAppearanceListener(listener) {
            this.appearanceListeners.add(listener);
            return Promise.resolve({
                remove: () => this.appearanceListeners.delete(listener)
            });
        }
        disableTransitions() {
            if (!this.handleTransitions) {
                return;
            }
            if (!this.disableTransitionsStyle) {
                this.disableTransitionsStyle = document.createElement('style');
                this.disableTransitionsStyle.innerText = `* { transition: none !important; --transition: none !important; } ion-content::part(background) { transition: none !important; }`;
            }
            document.head.appendChild(this.disableTransitionsStyle);
        }
        enableTransitions() {
            if (!this.handleTransitions) {
                return;
            }
            if (this.disableTransitionsStyle) {
                const style = this.disableTransitionsStyle;
                window.setTimeout(() => {
                    if (document.head.contains(style)) {
                        document.head.removeChild(style);
                    }
                }, 100);
            }
        }
        async update(data) {
            // Assume the appearance and dark mode did not change
            const oldDarkMode = document.body.classList.contains(this.darkModeClass);
            let darkMode;
            let appearance = this.appearance;
            // The appearance changed, either by the system or by the user.
            // See if there is a stored appearance.
            if (this.getter) {
                const getterResult = await this.getter();
                if (getterResult) {
                    appearance = getterResult;
                }
            }
            // If the appearance is system, use the current dark mode.
            if (appearance === exports.DarkModeAppearance.system) {
                darkMode = data ? data.dark : (await this.isDarkMode()).dark;
            }
            else {
                // Otherwise, use the appearance to determine the dark mode.
                darkMode = appearance === exports.DarkModeAppearance.dark;
            }
            // If the dark mode changed, update the body class and status bar.
            if (darkMode !== oldDarkMode) {
                this.disableTransitions();
                document.body.classList[darkMode ? 'add' : 'remove'](this.darkModeClass);
                this.enableTransitions();
            }
            // Always update the status bar to match the dark mode. This ensures
            // the status bar stays in sync when init() is called.
            if (core.Capacitor.isNativePlatform()) {
                await this.handleStatusBar(darkMode);
            }
            // If the appearance changed, update the stored appearance.
            if (this.setter && this.appearance !== appearance) {
                await this.setter(appearance);
            }
            // Notify listeners of the changes by the system.
            if (data) {
                for (const listener of this.appearanceListeners) {
                    listener(data);
                }
            }
            this.appearance = appearance;
            return Promise.resolve(this.appearance);
        }
        getBackgroundColor() {
            // Try to retrieve the background color variable value from <ion-content>
            const content = document.querySelector('ion-content');
            if (content) {
                const color = getComputedStyle(content)
                    .getPropertyValue(this.statusBarBackgroundVariable)
                    .trim();
                if (isValidHexColor(color)) {
                    return normalizeHexColor(color);
                }
                else {
                    console.warn(`Invalid hex color '${color}' for ${this.statusBarBackgroundVariable}`);
                }
            }
            return '';
        }
        async handleStatusBar(darkMode) {
            // On iOS we always need to update the status bar appearance
            // to match light/dark mode. On Android we only do so if the user
            // has explicitly requested it.
            let setStatusBarStyle = core.Capacitor.getPlatform() === 'ios';
            let statusBarStyle = darkMode ? statusBar.Style.Dark : statusBar.Style.Light;
            let color = '';
            if (this.syncStatusBar && core.Capacitor.getPlatform() === 'android') {
                setStatusBarStyle = true;
                if (this.syncStatusBar !== 'textOnly') {
                    color = this.getBackgroundColor();
                    if (color) {
                        if (this.statusBarStyleGetter) {
                            const style = await this.statusBarStyleGetter(statusBarStyle, color);
                            if (style) {
                                statusBarStyle = style;
                            }
                        }
                        else {
                            statusBarStyle = isDarkColor(color) ? statusBar.Style.Dark : statusBar.Style.Light;
                        }
                    }
                    else {
                        // We aren't changing the status bar color, no need to set the style
                        setStatusBarStyle = false;
                    }
                }
            }
            const actions = [];
            if (color) {
                actions.push(statusBar.StatusBar.setBackgroundColor({ color }));
            }
            if (setStatusBarStyle) {
                actions.push(statusBar.StatusBar.setStyle({ style: statusBarStyle }));
            }
            await Promise.all(actions);
        }
    }

    // eslint-disable-next-line import/prefer-default-export
    class DarkModeWeb extends DarkModeBase {
        async registerDarkModeListener() {
            // On the web, we can use a MediaQueryList listener.
            const onChange = (ev) => {
                this.update({ dark: ev.matches }).catch(console.error);
            };
            const query = this.getDarkModeQuery();
            // Some browsers do no support addEventListener
            if (query.addEventListener) {
                query.addEventListener('change', onChange);
            }
            else {
                query.addListener(onChange);
            }
            this.registeredListener = true;
            return Promise.resolve();
        }
        async isDarkMode() {
            const query = this.getDarkModeQuery();
            return Promise.resolve({ dark: query ? query.matches : false });
        }
        getDarkModeQuery() {
            if (!this.mediaQuery) {
                this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            }
            return this.mediaQuery;
        }
    }

    var web = /*#__PURE__*/Object.freeze({
        __proto__: null,
        DarkModeWeb: DarkModeWeb
    });

    // eslint-disable-next-line import/prefer-default-export
    class DarkModeNative extends DarkModeBase {
        constructor(capProxy) {
            super();
            this.setNativeDarkModeListener = capProxy.setNativeDarkModeListener;
            this.isDarkMode = capProxy.isDarkMode;
        }
        async registerDarkModeListener() {
            /*
              On native platforms we use two listeners:
        
              - A listener for dynamic appearance changes within the app.
              - A resume listener to check if the appearance has changed since the app was suspended.
            */
            const onChange = (data) => {
                this.update(data).catch(console.error);
            };
            await this.setNativeDarkModeListener({}, onChange);
            this.registeredListener = true;
        }
        // @native(promise)
        async isDarkMode() {
            // Never called, but we have to satisfy TS
            return Promise.resolve({ dark: false });
        }
    }

    var native = /*#__PURE__*/Object.freeze({
        __proto__: null,
        DarkModeNative: DarkModeNative
    });

    exports.DarkMode = proxy;
    exports.appearanceToStyle = appearanceToStyle;
    exports.isDarkColor = isDarkColor;
    exports.isValidHexColor = isValidHexColor;
    exports.normalizeHexColor = normalizeHexColor;
    exports.styleToAppearance = styleToAppearance;

    return exports;

})({}, capacitorExports, statusBar);
