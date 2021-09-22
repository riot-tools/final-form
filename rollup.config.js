import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import nodeResolve from '@rollup/plugin-node-resolve';

import pkg from './package.json';

const libraryName = 'RiotFinalForm';

const globals = {
    '@riot-tools/sak': 'RiotSak'
}

export default [
    {
        input: 'lib/index.ts',
        plugins: [

            del({ targets: 'dist/*' }),

            nodeResolve(),
            typescript({ useTsconfigDeclarationDir: true }),

            terser(),
        ],
        output: [
            {
                name: libraryName,
                file: pkg.cdn,
                format: 'iife',
                sourcemap: true,
                inlineDynamicImports: true,
                globals
            },
            {
                file: pkg.module,
                format: 'es',
                sourcemap: true
            },
            {
                file: pkg.main,
                name: libraryName,
                format: 'umd',
                sourcemap: true
            }
        ],
    }
];
