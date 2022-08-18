.PHONY: test

compile:
	npx hardhat compile

test:
	npx hardhat test

node:
	npx hardhat node --no-deploy --hostname 0.0.0.0

deploy_l16:
	npx hardhat deploy --network lukso --export ./deploy.json

install:
	npm install