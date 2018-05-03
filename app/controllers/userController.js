const bcrypt = require('bcrypt-nodejs'),
      jwt = require('jsonwebtoken'),
      User = require('../models/User');

let userController = (() => {
    let routes = {};

    routes.signUp = (req, res) => {
        logger.log('info', '/api/v1/signup');

        req.assert('firstName', 'firstName is required').notEmpty();
        req.assert('lastName', 'lastName is required').notEmpty();
        req.assert('mobile', 'mobile no is required').notEmpty();
        req.assert('username', 'username is required').notEmpty();
        req.assert('email', 'Email is not valid').isEmail();
        req.assert('password', 'Password is required').notEmpty();

        let errors = req.validationErrors();
        if (errors) {
            return res.status(400).send({
                "error": errors
            });
        }

        let user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username.toLowerCase(),
            email: req.body.email,
            password:req.body.password
        });
        
        User.findOne({$or: [
            {email: req.body.email},
            {username: req.body.username}
        ]})
        .exec()
        .then((result) => {
            if(result) {
                if (result.username == req.body.username) {
                    return res.status(400).send({
                        "success":false,
                        "error": { msg: 'Account with given username already exists.' }
                    });
                }
                else {
                    return res.status(400).send({
                        "success":false,
                        "error": { msg: 'Account with given email address already exists.' }
                    });
                }
            }    
            user.save((err) => {
                if (err) {
                    logger.error('Error in adding user - ' + err);
                    return res.status(400).send({
                        "success":false,
                        "error": err
                    });
                } else {
                    res.status(200).send({
                        "success":true,
                        "message": 'Signup successfully!'
                    });
                }
            });
        })
        .catch((err) => {
            logger.error('Error in adding user - ' + err);
            return res.status(400).send({
                "success":false,
                "error": err
            });

        })
    };

    routes.login = (req, res) => {
        logger.log('info', '/api/v1/login');
        
        if(!req.body.username && !req.body.email) {
            res.status(400).send({
                "success":false,
                "error": `Please enter username or email to login`
            });
            return;
        }
        if(req.body.email){
            req.assert('email', 'Email is not valid').isEmail();
        }
        req.assert('password', 'Password cannot be blank').notEmpty();

        let errors = req.validationErrors();

        if (errors) {
            res.status(400).send({
                "success":false,
                "error": errors
            });
            return;
        }
        
        let query = {};
        
        if(req.body.username){
            query.username = req.body.username; 
        } else {
            query.email = req.body.email;
        }

        User.findOne(query)
            .then((user) => {
                if (!user) {
                    res.status(400).send({
                        "success":false,
                        "error": `User not exist.`
                    });
                } else {
                    user.comparePassword(req.body.password, (err, isMatch) => {
                        if (err) {
                            logger.error('Error in login user - ' + err);
                            res.status(400).send({
                                "success":false,
                                "error": 'Invalid email or password.'
                            });
                        }
                        if (isMatch) {
                            //if user is found and password is right
                            //create a token
                            var token = jwt.sign({
                                id: user._id,
                                email: user.email
                            }, config.superSecret , {
                                expiresIn: 900 //  (15 mins)
                                // expires in 60 * 15 = c (15 mins)
                            });
                            res.status(200).send({
                                success: true,
                                message: 'Login successfully!',
                                token: token
                            });
                        } else {
                            res.status(400).send({
                                "error": 'Invalid email or password.'
                            });
                        }
                    });
                }
            })
            .catch((err) => {
                logger.error('Error in login user - ' + err);
                res.status(400).send({
                    "success":false,
                    "error": err
                });
            });
    };

    routes.logout = (req, res) => {
        res.status(200).send({
            message: "Logout successfully."
        });
    };

    routes.userDetails = (req, res) => {
        logger.log('info', '/api/v1/users/profile');

        let userId = req.decoded.id;
        let fields = 'firstName lastName mobile isActive createdAt updatedAt'
        User.findById(userId, fields)
            .exec()
            .then((user) => {
                res.status(200).send({
                    success: true,
                    user: user
                });
            })
            .catch((err) => {
                logger.error('Error in user details - ' + err);
                res.status(400).send({
                    "success":false,
                    "error": err
                });
            });
    };
    
    routes.searchUser = (req, res) => {
       let name = req.query.name;
       let fields = 'firstName lastName mobile isActive createdAt updatedAt'

       User.find({firstName:name},fields)
            .exec()
            .then((users) => {
                res.status(200).send({
                    success: true,
                    users: users
                })
            })
            .catch((err) => {
                logger.error('Error in user details - ' + err);
                res.status(400).send({
                    "success":false,
                    "error": err
                });
            });
    };

    routes.editProfile = (req,res) => {
        let userId = req.decoded.id;

        req.assert('firstName', 'firstName is required').notEmpty();
        req.assert('lastName', 'lastName is required').notEmpty();
        req.assert('mobile', 'Email is not valid').notEmpty();

        let errors = req.validationErrors();
        if (errors) {
            return res.status(400).send({
                "error": errors
            });
        }

        let data = {
            firstName:req.body.firstName,
            lastName: req.body.lastName,
            mobile: req.body.mobile
        };

        User.update({ _id: userId },{$set:data})
        .exec()
        .then((user) => {
            res.status(200).send({
                success: true,
                message: 'Profile updated successfully.'
            });
        })
        .catch((err) => {
            logger.error('Error in user details - ' + err);
            res.status(400).send({
                "success":false,
                "error": err
            });
        });
    };

    routes.deleteAccount = (req, res) => {
        let userId = req.decoded.id;
        
        User.remove({_id: userId})
        .exec()
        .then(() => {
            res.status(200).send({
                success: true,
                message: 'Account deleted successfully.'
            });
        })
        .catch((err) => {
            logger.error('Error in user details - ' + err);
            res.status(400).send({
                "success":false,
                "error": err
            });
        });
    };

    return routes;
})();

module.exports = userController;