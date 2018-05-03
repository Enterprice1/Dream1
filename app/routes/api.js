'use strict'

const express = require('express'),
    apiRouter = express.Router(),
    userController = require('../controllers/userController'),
    auth = require('../middlewares/index');


let apiRoutes = function (app) {
	app.use('/api/v1', apiRouter);

    apiRouter.post('/signup', userController.signUp);
    apiRouter.post('/login', userController.login);
    apiRouter.get('/users/profile', auth.isAuthorized, userController.userDetails);
    apiRouter.get('/users/search', auth.isAuthorized, userController.searchUser);
    apiRouter.put('/users', auth.isAuthorized, userController.editProfile);
    apiRouter.delete('/users', auth.isAuthorized, userController.deleteAccount);
}

module.exports = apiRoutes;