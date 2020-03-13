import babel from "rollup-plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import filesize from "rollup-plugin-filesize";
import sass from 'rollup-plugin-sass';

const env = process.env.NODE_ENV;
const pkg = require("./package.json");

const lodashExternal = [
  'lodash/find',
  'lodash/includes'
]

export default {
  input: "src/index.js",
  external: [
    'react',
    'prop-types',
    'classnames',
    '@gisatcz/ptr-atoms',
    '@gisatcz/ptr-locales',
    'react-rnd',
    ...lodashExternal
  ],
  output: {
    file: {
      es: pkg.module,
      cjs: pkg.main
    }[env],
    format: env,
    globals: {
      // 'lodash/random': '_.random'
    },
    exports: 'named', /** Disable warning for default imports */
    sourcemap: true,
  },
  plugins: [
    babel({
      plugins: ["lodash"],
    }),
    commonjs({
        include: 'node_modules/**',
    }),
    sass({
      output: true,
    }),
    filesize(),
  ]
};