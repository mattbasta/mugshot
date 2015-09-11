all: bundle

bundle:
	./node_modules/.bin/browserify src/main.js -o temp.js
	./node_modules/.bin/uglifyjs temp.js -cm -o dist.js
	rm temp.js
