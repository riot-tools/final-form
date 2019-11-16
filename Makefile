build:
	@ npm run rollup

test:
	@ npm run lint
	@ npm run test

deploy:
	@ read -p 'Commit Message: ' commitMessage; \
		git add .; \
		git commit -am "$$commitMessage";
	@ npm run test
	@ read -p 'Version Bump (major, minor, patch): ' versionBump; \
		npm version $$versionBump;
	@ npm publish;
	@ git push origin master;
