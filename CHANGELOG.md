## [3.0.3](https://github.com/riot-tools/final-form/compare/v3.0.2...v3.0.3) (2021-09-16)


### Bug Fixes

* 🐛 onFormChange arg type ([f64cef2](https://github.com/riot-tools/final-form/commit/f64cef2e844cf241efe054f9442e1c1f549ecac7))

## [3.0.2](https://github.com/riot-tools/final-form/compare/v3.0.1...v3.0.2) (2021-09-15)


### Bug Fixes

* 🐛 typings for install ([65a557c](https://github.com/riot-tools/final-form/commit/65a557c5a8e13b5c65c6360afadd9c64c5c23401))

## [3.0.1](https://github.com/riot-tools/final-form/compare/v3.0.0...v3.0.1) (2021-09-15)


### Bug Fixes

* 🐛 rework typings, install as plugin ([3e273b1](https://github.com/riot-tools/final-form/commit/3e273b10a79f1ea50c438b7e21d8f8790648c568))

# [3.0.0](https://github.com/riot-tools/final-form/compare/v2.1.4...v3.0.0) (2021-08-29)


* Merge branch 'next' ([d72170e](https://github.com/riot-tools/final-form/commit/d72170e519d4ad01ef70c9ab810284c1c8fe49f3))


### Bug Fixes

* 🐛 gh actions ([f732cc1](https://github.com/riot-tools/final-form/commit/f732cc123f959fb4f87fc03cba5ad33384de2807))


### Features

* 🎸 typescript ([69e3cb7](https://github.com/riot-tools/final-form/commit/69e3cb7cb4c5965575c5a9096809845ffed60b90)), closes [#9](https://github.com/riot-tools/final-form/issues/9)


### BREAKING CHANGES

* 🧨 typescript refactor
* 🧨 typescript refactor

chore: commitlint

test: 💍 running with mocha ts

Found way to import riot components into mocha ts tests using riot SSR.
Fixed issues found in the translation of js to ts, and jest to chai.

## [2.1.4](https://github.com/damusix/riot-final-form/compare/v2.1.3...v2.1.4) (2021-04-29)


### Bug Fixes

* package json umd module ([0b0a860](https://github.com/damusix/riot-final-form/commit/0b0a860255811097208f7195af874d34d6c50b23))

## [2.1.3](https://github.com/damusix/riot-final-form/compare/v2.1.2...v2.1.3) (2021-04-21)


### Bug Fixes

* 🐛 register field ([0e970e1](https://github.com/damusix/riot-final-form/commit/0e970e1bd1905145ac226512d58d1aa76738e4f7))

## [2.1.2](https://github.com/damusix/riot-final-form/compare/v2.1.1...v2.1.2) (2021-04-01)


### Bug Fixes

* 🐛 form mutator bind lexical this ([b44d3a9](https://github.com/damusix/riot-final-form/commit/b44d3a9d758eab11478b5dcb11c0628b52d830e9))

## [2.1.1](https://github.com/damusix/riot-final-form/compare/v2.1.0...v2.1.1) (2021-04-01)


### Bug Fixes

* 🐛 dont throw when no labels ([6be185b](https://github.com/damusix/riot-final-form/commit/6be185bb703ab45f66ffdb590e8ed17263df36ac))

# [2.1.0](https://github.com/damusix/riot-final-form/compare/v2.0.0...v2.1.0) (2021-02-18)


### Bug Fixes

* 🐛 run rollup ([31068df](https://github.com/damusix/riot-final-form/commit/31068df74daa68254b7157ef2c75ad660af87ece))


### Features

* version bump to match next ([1a4fa50](https://github.com/damusix/riot-final-form/commit/1a4fa506a070d1657d351b139b8c4f74eadffc18))

## [2.0.1](https://github.com/damusix/riot-final-form/compare/v2.0.0...v2.0.1) (2021-02-18)


### Bug Fixes

* 🐛 run rollup ([31068df](https://github.com/damusix/riot-final-form/commit/31068df74daa68254b7157ef2c75ad660af87ece))

# [2.1.0-next.1](https://github.com/damusix/riot-final-form/compare/v2.0.0...v2.1.0-next.1) (2021-02-17)


### Bug Fixes

* 🐛 fix onFormMutate ([b67ee3e](https://github.com/damusix/riot-final-form/commit/b67ee3eb1ecc7636691bd90bf6b70ab67df44f2f))
* 🐛 run rollup ([31068df](https://github.com/damusix/riot-final-form/commit/31068df74daa68254b7157ef2c75ad660af87ece))


### Features

* 🎸 onFormMutated ([fd656cb](https://github.com/damusix/riot-final-form/commit/fd656cb49f0f1c72511f46bc5b727beda5679886)), closes [#11](https://github.com/damusix/riot-final-form/issues/11)

## [2.0.1](https://github.com/damusix/riot-final-form/compare/v2.0.0...v2.0.1) (2021-01-21)


### Bug Fixes

* 🐛 run rollup ([31068df](https://github.com/damusix/riot-final-form/commit/31068df74daa68254b7157ef2c75ad660af87ece))

# [2.0.0](https://github.com/damusix/riot-final-form/compare/v1.2.0...v2.0.0) (2021-01-21)


### Bug Fixes

* 🐛 remove redundant options ([1875e28](https://github.com/damusix/riot-final-form/commit/1875e2846bb722073d2d94ad25132f2bd77e796d))


### Features

* 🎸 ignore inputs, onMounted hoisting issue ([749abee](https://github.com/damusix/riot-final-form/commit/749abee046d72c9b7b6d02ee3627c7cc05c97cf3))


### BREAKING CHANGES

* 🧨 enableDefaultBehavior was removed and the same functionality can be
acheived by omitting onSubmit function. onSubmit is no longer required.

# [1.1.0](https://github.com/damusix/riot-final-form/compare/v1.0.0...v1.1.0) (2020-11-19)


### Features

* 🎸 version bump ([12def88](https://github.com/damusix/riot-final-form/commit/12def880564e2286f0bac95101023c704c39eb55))

# 1.0.0 (2020-11-19)


### Bug Fixes

* Add  and peer dependences ([4c4a4d3](https://github.com/damusix/riot-final-form/commit/4c4a4d37357c917a577eafaee6d3235a77d00c98))
* Add logic for radio buttons ([bcfa13e](https://github.com/damusix/riot-final-form/commit/bcfa13e192f8be5235405ebd87a6a9a85eb05684))
* Add Logic to index.js ([ca4ed6a](https://github.com/damusix/riot-final-form/commit/ca4ed6a57f77937f24c81a8290ec965bbf521d34))
* Update target value ([2492346](https://github.com/damusix/riot-final-form/commit/24923468021ad9fed6bc5f7bad567a0257974a5a))


### Features

* 🎸 enable default behavior ([a11c4f6](https://github.com/damusix/riot-final-form/commit/a11c4f6e72de340324bd96fd6dda3fd38636afea))

# 1.0.0 (2020-11-19)


### Bug Fixes

* Add  and peer dependences ([4c4a4d3](https://github.com/damusix/riot-final-form/commit/4c4a4d37357c917a577eafaee6d3235a77d00c98))
* Add logic for radio buttons ([bcfa13e](https://github.com/damusix/riot-final-form/commit/bcfa13e192f8be5235405ebd87a6a9a85eb05684))
* Add Logic to index.js ([ca4ed6a](https://github.com/damusix/riot-final-form/commit/ca4ed6a57f77937f24c81a8290ec965bbf521d34))
* Update target value ([2492346](https://github.com/damusix/riot-final-form/commit/24923468021ad9fed6bc5f7bad567a0257974a5a))


### Features

* 🎸 enable default behavior ([a11c4f6](https://github.com/damusix/riot-final-form/commit/a11c4f6e72de340324bd96fd6dda3fd38636afea))

# 1.0.0 (2020-11-19)


### Bug Fixes

* Add  and peer dependences ([4c4a4d3](https://github.com/damusix/riot-final-form/commit/4c4a4d37357c917a577eafaee6d3235a77d00c98))
* Add logic for radio buttons ([bcfa13e](https://github.com/damusix/riot-final-form/commit/bcfa13e192f8be5235405ebd87a6a9a85eb05684))
* Add Logic to index.js ([ca4ed6a](https://github.com/damusix/riot-final-form/commit/ca4ed6a57f77937f24c81a8290ec965bbf521d34))
* Update target value ([2492346](https://github.com/damusix/riot-final-form/commit/24923468021ad9fed6bc5f7bad567a0257974a5a))


### Features

* 🎸 enable default behavior ([a11c4f6](https://github.com/damusix/riot-final-form/commit/a11c4f6e72de340324bd96fd6dda3fd38636afea))
