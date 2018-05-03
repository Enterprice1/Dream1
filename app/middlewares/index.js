const jwt = require('jsonwebtoken');

module.exports = {
	isAuthorized: (req, res, next) => {

		var token = req.headers['x-access-token'];

		//decode token
		if(token){
			//verifies secret and checks exp
			jwt.verify(token, config.superSecret,function(err,decoded){
				if(err){
					return res.status(401).send({
						success: false,
						error: 'Unauthorized'
					});
				}else{
					//save to request for use in other routes
					req.decoded = decoded;
					next();// this make sure we go to the next routes and dont stop here
				}
			});
		}else{
			// if there is no token
			//return an HTTP response of 403 (access forbidden) and an error message
			return res.status(401).send({
				success:false,
				error: 'Token is mandatory'
			});
		}
	}
}