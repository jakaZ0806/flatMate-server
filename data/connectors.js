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

function addUser(firstName, lastName, username, password) {
    return new Promise(resolve => {
        var newUser = new User({
            firstName: firstName,
            lastName: lastName,
            password: password,
            username: username,
            admin: false,

        });

        // save the sample user
        newUser.save(function (err) {
            if (err) throw err;
        });
        resolve(newUser);
    })
};
function getUsers() {
    return users;
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

export {
    getUsers,
    addUser,
    findOne,
    deleteUser,
    findById,
    getUsersById
}