import babel from "rollup-plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import filesize from "rollup-plugin-filesize";
import postcss from 'rollup-plugin-postcss';
import postcssUrl from './build/plugins/postcssUrl'

const env = process.env.NODE_ENV;
const pkg = require("./package.json");

// process.env.NODE_ENV = 'development'

const CWD = process.cwd()
const Paths = {
  SRC: `${CWD}/src`,
  DIST: `${CWD}/dist`,
  NODE_MODULES: `${CWD}/node_modules`
}
Object.assign(Paths, {
  INPUT: Paths.SRC + '/index.js',
  OUTPUT: Paths.DIST + '/index.js'
})

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
    postcss({
      // modules: true,
      extract: 'dist/style.css',
      plugins: [
        ...postcssUrl({
          basePath: [Paths.SRC, Paths.NODE_MODULES],
          assetsPath: Paths.DIST + '/assets',
          dest: Paths.DIST
        })
      ]
    }),
    filesize(),
  ]
};