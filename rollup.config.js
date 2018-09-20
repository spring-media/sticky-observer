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

export default [{
    input: 'src/index.ts',
    output: [{
      file: pkg.main,
      format: 'cjs'
    }],
    plugins: [
      resolve(),
      commonjs(),
      typescript(),
      uglify(),
      filesize()
    ]
  },
  {
    input: 'src/index.ts',
    output: [{
      file: pkg.module,
      format: 'es'
    }],
    plugins: [
      resolve(),
      commonjs(),
      typescript(),
      terser(),
      filesize()
    ]
  }
];
