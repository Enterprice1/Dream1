'use strict';

let getConnectionString = () => {
	let _connString = 'mongodb://';
	if (!config.database) {
		throw new Error('Database config not found!');
	}
	if (config.database.user && config.database.password) {
		_connString += config.database.user + ':' + config.database.password + '@';
	}

	if (config.database.host) {
		_connString += config.database.host;
	} else {
		throw new Error('Please provide database host');
	}
	if (config.database.port) {
		_connString += ':' + config.database.port;
	} else {
		_connString += ':27017';
	}
	if (config.database.dbName) {
		_connString += '/' + config.database.dbName;
	} else {
		throw new Error('Please provide database name');
	}
	_connString += '?authSource=admin';
	// console.log(_connString);
	return _connString;
};

mongoose.connect(getConnectionString(), {
	useMongoClient: true,
});

let db = mongoose.connection;

db.on('error', (err) => {
	logger.info('Error in databse connection - ', err);
});

db.once('open', () => {
	logger.info('connection established successfully');
});