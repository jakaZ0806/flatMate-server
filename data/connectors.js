/**
 * Created by Lukas on 16-Nov-16.
 */

import User from './models/user'
var id = 1;

function addUser(firstName, lastName, username, password) {
    return new Promise(resolve => {
        var newUser = new User({
            firstName: firstName,
            lastName: lastName,
            password: password,
            username: username,
            admin: false,
            id: id

        });
        id++;

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

export {
    getUsers,
    addUser,
}