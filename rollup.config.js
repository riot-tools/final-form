import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'lib/index.js',
  globals: [
    'final-form'
  ],
  plugins: [
    // resolve({
    //   // jsnext: true
    // })
  ],
  output: [
    {
      name: 'RiotFinalForm',
      file: 'dist/index.umd.js',
      format: 'umd'
    },
    {
      name: 'RiotFinalForm',
      file: 'dist/index.esm.js',
      format: 'esm'
    }
  ]
};