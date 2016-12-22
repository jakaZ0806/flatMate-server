/**
 * Created by Lukas on 14-Dec-16.
 */
import express from 'express';
import User from './models/user'
import jwt from 'jsonwebtoken';


const apiRoutes = express.Router();

//------------------UNPROTECTED ROUTES-----------------------------

// route to authenticate a user (POST http://localhost:3050/auth/login)
apiRoutes.post('/login', function(req, res) {
    console.log(req.body.username);
    // find the user
    User.findOne({
        name: req.body.username
    }, function(err, user) {

        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {

            // check if password matches
            if (user.password != req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            } else {

                // if user is found and password is right
                // create a token
                var token = jwt.sign(user, 'psssst-secret', {
                    expiresIn: 1440 // expires in 24 hours
                });

                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }

        }

    });
});


//Register a new user
apiRoutes.post('/register', function(req, res) {
    console.log(req.body.name);
    var newUser = new User({
        name: req.body.name,
        password: req.body.password,
        admin: false
    });

    // save the sample user
    newUser.save(function(err) {
        if (err) throw err;

        console.log('User saved successfully');
        res.json({ success: true });
    });

});


//Setup a default user
apiRoutes.get('/setup', function(req, res) {

    // create a sample user
    var nick = new User({
        name: 'Nick Halden',
        password: 'pass',
        admin: true
    });

    // save the sample user
    nick.save(function(err) {
        if (err) throw err;

        console.log('User saved successfully');
        res.json({ success: true });
    });
});

export default apiRoutes;


//Middleware: Protect other Routes
apiRoutes.use(function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, 'psssst-secret', function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});

//-----------PROTECTED ROUTES------------------


// for testing purposes
// route to return all users (GET http://localhost:3050/auth/users)
apiRoutes.get('/users', function(req, res) {
    User.find({}, function(err, users) {
        res.json(users);
    });
});