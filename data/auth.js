/**
 * Created by Lukas on 14-Dec-16.
 */
import express from 'express';
import User from './models/user';
import jwt from 'jsonwebtoken';
import expressjwt from 'express-jwt';

const apiRoutes = express.Router();

//Middleware Function, that Protects all Routes with JWT
function protectRoutes(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token;

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
            message: 'No token provided. lalala'
        });

    }
};


apiRoutes.get('/protected',
    expressjwt({secret: 'psssst-secret'}),
    function(req, res) {
        console.log(req.user);
        if (!req.user.admin) return res.sendStatus(401);
        res.sendStatus(200);
    });

//------------------UNPROTECTED ROUTES-----------------------------

// route to authenticate a user (POST http://localhost:3050/auth/login)
apiRoutes.post('/login', function(req, res) {
    console.log('Test');
    // find the user
    User.findOne({
        username: req.body.username
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

                var token = jwt.sign(user.toObject(), 'psssst-secret', {
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


//Register a new user (POST http://localhost:3050/auth/register)
apiRoutes.post('/register', function(req, res) {
    console.log(req.body.username);
    var newUser = new User({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
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

    //Create a sample user
    var nick = new User({
        username: 'nick.halden',
        password: 'pass',
        admin: true,
        firstName: 'Nick',
        lastName: 'Halden',
        id: 100

    });

    //Save the sample user in the DB
    nick.save(function(err) {
        if (err) throw err;

        console.log('User saved successfully');
        res.json({ success: true });
    });
});


//Middleware: Protect other Routes
apiRoutes.use(protectRoutes);

//-----------PROTECTED ROUTES------------------


// for testing purposes
// route to return all users (GET http://localhost:3050/auth/users)
apiRoutes.get('/users', function(req, res) {
    User.find({}, function(err, users) {
        res.json(users);
    });
});


export { apiRoutes, protectRoutes };

