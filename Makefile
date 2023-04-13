IMAGE_NAME=type-control

build: rmi
	docker build -t $(IMAGE_NAME) .
	set -e ;\
	 CONTAINER_ID=`docker create $(IMAGE_NAME)` ;\
	 docker cp $${CONTAINER_ID}:/app/package-lock.json . ;\
	 docker rm -v $${CONTAINER_ID}

run:
	docker run\
	 --rm\
	 -it\
	 -v "$(CURDIR)/index.js":/app/index.js\
	 -v "$(CURDIR)/parse.js":/app/parse.js\
	 -v "$(CURDIR)/index.test.js":/app/index.test.js\
	 -v "$(CURDIR)/parse.test.js":/app/parse.test.js\
	 -v "$(CURDIR)/tester.js":/app/tester.js\
	 -v "$(CURDIR)/module-to-repl.js":/app/module-to-repl.js\
	 -v "$(CURDIR)/package.json":/app/package.json\
	 -v "$(CURDIR)/package-lock.json":/app/package-lock.json\
	 $(IMAGE_NAME)\
	 sh

rmi:
	-docker rmi `docker images -q -a $(IMAGE_NAME)`

prune:
	docker system prune -a
