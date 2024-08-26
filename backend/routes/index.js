'use strict';
const express = require('express');
const router = express.Router();
const config = require('../config/index');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { createClient } = require('redis');

const setErrorLog = async (err) => {
	if (err) {
		let msg = err;
		const { message } = err;
		if (message) msg = message;
		const { client } = await getMongoDetails();
		if (client) {
			await client
				.db(config.app.mongoDb.dbName)
				.collection('ErrorLogs')
				.insertOne({
					Message: msg,
					Date: new Date(),
				});
		}
	}
};

const getMongoUri = () => {
	const { app } = config;
	let uri = 'mongodb+srv://';
	if (app) {
		const { mongoDb } = app;
		if (mongoDb) {
			const { username, password } = mongoDb;
			if (username && password) {
				uri += username + ':';
				uri += password;
			}
		}
	}
	uri +=
		'@cluster0.2aupx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
	return uri;
};

const getMongoDetails = () => {
	const uri = getMongoUri();
	const { dbName } = config.app.mongoDb;
	// Create a MongoClient with a MongoClientOptions object to set the Stable API version
	const client = new MongoClient(uri, {
		serverApi: {
			version: ServerApiVersion.v1,
			strict: true,
			deprecationErrors: true,
		},
	});
	const database = client.db(dbName);
	return { client, database };
};

router.get('/', (req, res) => {
	res.send(`Please choose a valid route to continue`);
});

router.get('/cities', async (req, res) => {
	try {
		const qry = [
			{
				$lookup: {
					from: 'Countries',
					localField: 'Country_id',
					foreignField: '_id',
					as: 'Cities_Countries',
				},
			},
			{
				$unwind: {
					path: '$Cities_Countries',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project: {
					City: '$Name',
					Latitude: '$Latitude',
					Longitude: '$Longitude',
					Country: '$Cities_Countries.Name',
				},
			},
		];
		const args = {
			query: qry,
			table: 'Cities',
			sortKey: 'City',
			sortAsc: true,
		};
		const results = await getCacheData(args);
		res.status(200).json(results);
	} catch (err) {
		setErrorLog(err);
		res.send('An error has occurred.');
	}
});

router.get('/airlines', async (req, res) => {
	try {
		const qry = { Name: { $ne: 'test_airline' } };
		const args = {
			query: qry,
			table: 'Airlines',
			sortKey: 'Name',
			sortAsc: true,
		};
		const results = await getCacheData(args);
		res.status(200).json(results);
	} catch (err) {
		setErrorLog(err);
		res.send('An error has occurred.');
	}
});

router.get('/countries', async (req, res) => {
	try {
		const qry = { Name: { $ne: 'test_country' } };
		const args = {
			query: qry,
			table: 'Countries',
			sortKey: 'City',
			sortAsc: true,
		};
		const results = await getCacheData(args);
		res.status(200).json(results);
	} catch (err) {
		setErrorLog(err);
		res.send('An error has occurred.');
	}
});

router.get('/flights', async (req, res) => {
	try {
		const qry = [
			{
				$lookup: {
					from: 'Airlines',
					localField: 'Airline_id',
					foreignField: '_id',
					as: 'Flights_Airlines',
				},
			},
			{
				$unwind: {
					path: '$Flights_Airlines',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project: {
					Code: '$Code',
					Airline: '$Flights_Airlines.Name',
				},
			},
		];
		const args = {
			query: qry,
			table: 'Flights',
			sortKey: 'Code',
			sortAsc: true,
		};
		const results = await getCacheData(args);
		res.status(200).json(results);
	} catch (err) {
		setErrorLog(err);
		res.send('An error has occurred.');
	}
});

router.get('/errLogs', async (req, res) => {
	try {
		const qry = { Message: { $ne: 'test_errlog' } };
		const args = {
			query: qry,
			table: 'ErrorLogs',
			sortKey: 'Date',
			sortAsc: true,
			limit: 10,
		};
		const results = await getCacheData(args);
		res.status(200).json(results);
	} catch (err) {
		setErrorLog(err);
		res.send('An error has occurred.');
	}
});

router.all('/trip/:city1?/:city2?/:persons?', async (req, res) => {
	const method = req.method.toLowerCase();

	switch (method) {
		case 'get': // to be used with browser url (tech) test
		case 'post': // to be used with React frontend intent
			const city1 = decodeURI(req.params.city1) || 'London';
			const city2 = decodeURI(req.params.city2) || '';
			const persons = parseInt(req.params.persons) || 0;

			if (!city1 || !city2 || !persons) {
				res.send(
					'There are missing url parameters (city1, city2, persons).'
				);
			} else {
				try {
					let rtnObj = [];
					const distLabel = `${city1}_${city2}`;
					const locale = 'en-GB';
					const qry = [
						{
							$match: {
								Label: {
									$regex: new RegExp(
										'^' + distLabel + '$',
										'i'
									),
								},
							},
						},
						{
							$lookup: {
								from: 'Cities',
								localField: 'City_1',
								foreignField: '_id',
								as: 'City1',
							},
						},
						{
							$unwind: {
								path: '$City1',
								preserveNullAndEmptyArrays: true,
							},
						},
						{
							$lookup: {
								from: 'Cities',
								localField: 'City_2',
								foreignField: '_id',
								as: 'City2',
							},
						},
						{
							$unwind: {
								path: '$City2',
								preserveNullAndEmptyArrays: true,
							},
						},
						{
							$project: {
								City1: '$City1.Name',
								City2: '$City2.Name',
								KmsApart: '$KmsApart',
							},
						},
					];
					const args = {
						query: qry,
						table: 'Distances',
					};
					const results = await getCacheData(args);

					// start: loop the results and perfom calculations
					results.map((row) => {
						const co2Emissions = 115 * persons * row.KmsApart;
						rtnObj.push({
							'Departure city': row.City1,
							'Arrival city': row.City2,
							'No. of persons': parseInt(persons),
							'Kms apart': row.KmsApart.toLocaleString(locale),
							'CO2 emissions (one-way)':
								co2Emissions.toLocaleString(locale) + ' grams', // grams per passenger * per km
							'CO2 emissions (return)':
								(co2Emissions * 2).toLocaleString(locale) +
								' grams',
						});
					});
					// end: loop the results and perfom calculations

					if (rtnObj.length) res.status(200).json(rtnObj);
					else {
						// start: clear redis cache for this key/query
						const rClient = await getRedisClient();
						await rClient.connect();
						const cacheKey = JSON.stringify(qry);
						rClient.set(cacheKey, JSON.stringify(rtnObj), {
							EX: 1,
						});
						rClient.del(cacheKey); // delete the redis cache/key
						// end: clear redis cache for this key/query
						res.send('No records found for that search criteria.');
					}
				} catch (err) {
					setErrorLog(err);
					res.send('An error has occurred.');
				}
			}
			break;
		default:
			res.send('Please submit using either verb GET or POST');
			break;
	}
});

const getRedisClient = () => {
	const { username, password, host, port } = config.app.redisDb;
	const redisUrl = `redis://${username}:${password}@${host}:${port}`;
	const redisClient = createClient({
		url: redisUrl,
	});
	return redisClient;
};

const getCacheData = async (args) => {
	const { query, table, sortKey, sortAsc, limit } = args;
	let rtnObj = [];

	try {
		const cacheKey = JSON.stringify(query);
		const rClient = await getRedisClient();
		await rClient.connect();
		// Get data from Redis
		const redisData = await rClient.get(cacheKey);

		if (redisData) {
			console.log('Cache hit');
			rtnObj = JSON.parse(redisData);
			/*rClient.set(cacheKey, rtnObj, {
			EX: rtnObj.length ? 60 * 5 : 1,
		});*/
		} else {
			// Get data from MongoDB
			let sortObj = { dummyKey: 1 };
			if (sortKey) sortObj = { [sortKey]: sortAsc ? 1 : -1 };
			const { database } = getMongoDetails();
			const collection = database.collection(table);

			let mongoData = [];
			if (Array.isArray(query)) {
				mongoData = await collection
					.aggregate(query)
					.sort(sortObj)
					.limit(limit || 100)
					.toArray();
			} else {
				mongoData = await collection
					.find(query)
					.sort(sortObj)
					.limit(limit || 100)
					.toArray();
			}

			// Cache result in Redis
			rClient.set(cacheKey, JSON.stringify(mongoData), {
				EX: mongoData.length ? 60 * 5 : 1,
			}); // expire the cache in 5 mins - or 1 sec for no results

			console.log('Cache miss');
			rtnObj = mongoData;
		}

		return rtnObj;
	} catch (err) {
		setErrorLog(err);
	}

	return rtnObj;
};

module.exports = router;
