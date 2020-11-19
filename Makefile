build:
	@ npm run rollup

test:
	@ npm run lint
	@ npm run test

deploy:
	@ npm run lint
	@ npm run test
	@ npm run rollup
	@ npm run release
