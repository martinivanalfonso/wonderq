# WonderQ 
Fast & lightweight message queue for Node.js powered by Redis.

## Features
* Lightweight: Redis + ~200 lines of javascript
* Atomic: messages are delivered only once to a consumer
* High Performance: Send/receive 10000+ messages per second on an average machine
* Linked List Structure: Fast operations O(1) to remove an add a message to the queue.
* Visibility timeout for messages that are received but not proccesed (requires a worker for checking)
* RESTful interface
* Test Coverage

## Endpoints
POST / Sumbit a string with the message/task/job

GET / Request a json object with the next job, id and timestamp

POST /jobdone/ Sumbit a json object identical to the one requested previously in order to delete it succesfully

Detailed API Docs for routes can be found at ./server.js

## Installation
`npm install`
`npm run postinstall`
`npm run start`

Note: You need a Redis instance running on port 6379, run the following docker command to achieve that:
`docker run --name redis_container -d -p 6379:6379 -i -t redis:alpine`

## Production

In order to improve this module and scale it to be production ready the next steps would be recommended:

* Set up a worker that persists data to a local database regularly as a backup
* Set up a worker that checks for messages with expired timeout regularly
* Set up a logger and any other middleware required (log4js)
* Add Authentication for consumers/producers (e.g jwt)
* Add CI tools such as ESLint to detect failures before sending to production
* Limit number of incoming requests by IP (e.g. express-rate-limit)
* Extract secrets or encrypt them if there was any (e.g bcrypt)

## Potencial Issues

* Downtime: The server must go on and get restarted upon failures, dockerize and set up a cluster management tool to fix this (docker-compose)
* Security vulnerabilities:  Implement rate limiting using a cloud firewall to prevent Dos attacks and subsequent denial of service
* Dependencies vulnerabilities: Keep dependencies in check with by tracking and monitoring them with package management tools (npm audit)
