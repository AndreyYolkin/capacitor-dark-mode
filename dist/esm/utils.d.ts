import { Style } from '@capacitor/status-bar';
import { DarkModeAppearance } from './definitions';
/**
 * Returns whether the given color is a valid 3 or 6 digit
 * '#'-prefixed hex color.
 */
export declare function isValidHexColor(color: string): boolean;
export declare function normalizeHexColor(color: string): string;
/**
 * Returns whether the given 3 or 6 digit '#'-prefixed hex color
 * is considered a dark color based on its perceived luminance.
 * The default luminance threshold is 0.5 (on a scale of 0 to 1.0),
 * but you can pass a custom threshold if you want to change the perceived
 * darkness of a color.
 */
export declare function isDarkColor(color: string, threshold?: number): boolean;
export declare function appearanceToStyle(appearance: DarkModeAppearance): Style;
export declare function styleToAppearance(style: Style): DarkModeAppearance;
