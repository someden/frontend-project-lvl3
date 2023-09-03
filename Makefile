install:
	npm ci

start:
	npm start

build:
	rm -rf dist
	npm run build

lint:
	npm run lint

.PHONY: test
