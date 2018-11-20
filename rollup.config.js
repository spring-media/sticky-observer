import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import {
  uglify
} from "rollup-plugin-uglify";
import {
  terser
} from "rollup-plugin-terser";
import filesize from 'rollup-plugin-filesize';
import pkg from './package.json';
import {
  typescript as tsc
} from 'typescript';

const defaultPlugins = [
  resolve(),
  commonjs(),
  typescript({
    typescript: tsc,
    exclude: ['**/*.test.ts', '**/test-helper.ts']
  }),
  filesize()
];

export default [{
    input: 'src/index.ts',
    output: [{
      file: pkg.main,
      format: 'cjs'
    }],
    plugins: [
      ...defaultPlugins,
      uglify()
    ]
  },
  {
    input: 'src/index.ts',
    output: [{
      file: pkg.module,
      format: 'es'
    }],
    plugins: [
      ...defaultPlugins,
      terser({
        ecma: 5,
        mangle: {
          module: true
        },
        compress: {
          module: true
        }
      })
    ]
  }
];
