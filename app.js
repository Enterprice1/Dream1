'use strict';

const app = require('express')(),
	session = require('express-session'),
	expressValidator = require('express-validator'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	fs = require('fs'),
	path = require('path'),
	middleware = require('./app/middlewares');

let env = process.env.NODE_ENV || "development";
global.config = require('./config/config.json')[env];
global.mongoose = require('mongoose');
mongoose.Promise = global.Promise;
global.logger = require('./app/helpers/logger');


/********** Databse connection start **********/
// mongoose.connect('mongodb://localhost/hdfclife', {
// 	useMongoClient: true,
// 	/* other options */
// });
require('./app/helpers/db.js');
/********** Databse connection end **********/

logger.stream = {
	write: function(message, encoding) {
		logger.info(message);
	}
};


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(expressValidator());
app.use(cookieParser());

//use sessions for tracking logins
app.use(session({
	secret: config.superSecret,
	resave: false,
	saveUninitialized: false,
}));

/* configure swagger ui */
const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');

let spec = fs.readFileSync(path.join(__dirname, 'apidocs/swagger.yaml'), 'utf8');
let swaggerDoc = jsyaml.safeLoad(spec);

swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
    app.use(middleware.swaggerUi());
})

/************* Routes start ****************/
app.get('/', (req, res) => {
	res.status(200).send("Welcome to HDFC Life...");
});

require('./app/routes/api')(app);


// error handler
app.use(function(err, req, res, next) {
	logger.info("err:", err);
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	res.status(err.status || 500);
	res.send({
		code: 500,
		error: "Something went wrong!!"
	});
});

process.on('uncaughtException', (err) => {
	logger.info(err);
	console.log("Something went wrong!!");
});

process.on('SIGINT', function()  {
	mongoose.connection.close(function() {
		console.log("Mongoose default connection is disconnected due to application termination");
		process.exit(0);
	});
});

let port = process.env.PORT || config.port;
app.listen(port, () => {
	console.log('Application listening on ' + port);
	logger.info('server started - ', port);
});

module.exports = app; // for testing
