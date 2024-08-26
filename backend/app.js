'use strict';
const express = require('express');
const app = express();
const compression = require('compression');
const routes = require('./routes/index');
const config = require('./config/index');
const cluster = require('cluster');
const { envName, ports } = config.app;

app.use(compression()); // compress all responses
app.use('/', routes); // use the routes dir to do all the dirty work

const numCPUs = require('os').cpus().length; // Check the number of available CPU.

// For Master process
if (cluster.isMaster) {
	console.log(`Master ${process.pid} is running`);

	// Fork workers.
	for (let idx = 0; idx < numCPUs; idx++) {
		cluster.fork();
	}

	// This event is first when worker died
	cluster.on('exit', (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} died`);
	});
}

// For Worker
else {
	// Workers can share any TCP connection
	// In this case it is an HTTP server
	ports.map((port) => {
		app.listen(port, () => {
			// console.log(`The ${envName} server is running on port ${port}.`);
			console.log(`Worker ${process.pid} started`);
		});
	});
}
