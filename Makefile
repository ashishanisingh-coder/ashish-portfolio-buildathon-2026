.PHONY: render test run

render:
	node mockups/render-fold-v3.js

test:
	node mockups/test.js

run:
	node mockups/serve.js
