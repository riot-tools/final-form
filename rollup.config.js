import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'lib/index.js',
  globals: [
    'final-form'
  ],
  plugins: [
    resolve({
      jsnext: true
    })
  ],
  output: [
    {
      name: 'RiotFinalForm',
      file: 'index.umd.js',
      format: 'umd'
    },
    {
      name: 'RiotFinalForm',
      file: 'index.esm.js',
      format: 'esm'
    }
  ]
};