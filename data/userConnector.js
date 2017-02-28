/**
 * Created by Lukas on 16-Nov-16.
 */

import User from './models/user'

const checkUserLogin = function(user) {
    if (!user) {
        throw errorObj({_error: 'Unauthorized.'});
    }
};

//Error Object to prettify Error Messages on Client
const errorObj = obj => {
    return new Error(JSON.stringify(obj));
};

function addUser(firstName, lastName, username, password, admin) {
    return new Promise(resolve => {
        var newUser = new User({
            firstName: firstName,
            lastName: lastName,
            password: password,
            username: username,
            admin: admin,
            friends: [],
            statusMessage: 'This is the Standard Message'
        });

        // save the sample user
        newUser.save(function (err) {
            if (err) throw err;
        });
        resolve(newUser);
    })
}
function getUsers() {
    return  User.find({});
}

function findOne(username) {
    return User.findOne({'username' : username});
}

function findById(id) {
    return User.findOne({'_id': id});
}

function getUsersById(ids) {
   return User.find()
        .where('_id')
        .in(ids)
        .exec(function (err, records) {
            console.log(records);
            return records;
        });
}

function deleteUser(username, currentUser) {
    checkUserLogin(currentUser);
    if (currentUser.admin) {
        return User.findOneAndRemove({'username': username});

    }
    else {
        throw errorObj({_error: 'Unauthorized. Admin Privileges needed.'});

    }
}

function changeStatusMessage(username, message, currentUser) {
    checkUserLogin(currentUser);
    if (username === currentUser.username) {
        User.findOneAndUpdate({'username' : username}, {"$set": {"statusMessage": message} }).exec(function(err, user) {
            if (err) {
                console.log(err);
                throw errorObj({_error: err});
            }
            else {
                return message;
            }
        });
        return message;
    }
    else {
        throw errorObj({_error: 'You can only edit your own status!'});
    }
}

function addAsFriend(username, currentUser, ) {
    checkUserLogin(currentUser);
    console.log(username);
    console.log(currentUser.username);
    if (username !== currentUser.username) {
        return User.findOne({'username' : username}).exec(function(err, user) {

            User.findOneAndUpdate({'username' : currentUser.username}, {"$addToSet": {"friends": user._id}}).exec(function(err, user) {
                if (err) {
                    console.log(err);
                    throw errorObj({_error: err});
                }
                else {
                    return user;
                }
            });
            console.log(user);
            return user;
        });
    } else {
        throw errorObj({_error: 'Cant add yourself as friend!'});
    }
}

export {
    getUsers,
    addUser,
    findOne,
    deleteUser,
    findById,
    getUsersById,
    changeStatusMessage,
    addAsFriend
}