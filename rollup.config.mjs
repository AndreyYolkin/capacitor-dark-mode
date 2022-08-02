import json from '@rollup/plugin-json'
// eslint-disable-next-line import/named
import { defineConfig } from 'rollup'

export default defineConfig({
  plugins: [
    json({
      include: '**/info.json',
      indent: '  ',
      namedExports: false
    })
  ],
  input: 'dist/esm/index.js',
  output: [
    {
      file: 'dist/plugin.js',
      format: 'iife',
      name: 'capacitorDarkMode',
      globals: {
        '@capacitor/core': 'capacitorExports',
        '@capacitor/status-bar': 'statusBar',
        '@aparajita/capacitor-native-decorator': 'capacitorNativeDecorator',
        tslib: 'tslib'
      },
      sourcemap: !!process.env.SOURCE_MAP,
      inlineDynamicImports: true
    },
    {
      file: 'dist/plugin.cjs.js',
      format: 'cjs',
      sourcemap: !!process.env.SOURCE_MAP,
      inlineDynamicImports: true
    }
  ],
  external: [
    '@capacitor/core',
    '@capacitor/status-bar',
    '@aparajita/capacitor-native-decorator',
    'tslib'
  ],

  // This is for the code generated by decorators. If we don't specify this,
  // it defaults to globalThis, which older android phones won't understand.
  context: 'window'
})
